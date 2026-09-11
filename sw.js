// EDUVA — Service Worker (v2)
// मकसद:
// 1) Android Chrome ऐप को "installable PWA" माने — Web Share Target (WhatsApp/Chrome के
//    Share sheet में EDUVA दिखाने) के लिए ज़रूरी शर्त।
// 2) Offline support — internet चले जाने पर भी ऐप खुले और बेसिक पेज दिखें।
//
// नियम: /api/* (AI chat) कभी cache नहीं — हमेशा fresh network से।

const CACHE = 'eduva-v2';

// ऐप की ज़रूरी files पहले से cache में — internet गया तो भी ऐप खुलेगी
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // AI/API calls: सिर्फ network (कभी cache नहीं — fresh answers चाहिए)
    if (url.pathname.startsWith('/api/')) return;

    // पेज खोलना (navigation): network-first, offline हो तो cache की index.html दिखाओ
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req).then((res) => {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put('/index.html', copy));
                return res;
            }).catch(() => caches.match('/index.html'))
        );
        return;
    }

    // CDN files (Tailwind, fonts): cache-first, background में update होती रहें
    if (url.origin !== self.location.origin) {
        event.respondWith(
            caches.open(CACHE).then((c) =>
                c.match(req).then((hit) => {
                    const network = fetch(req).then((res) => {
                        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
                            c.put(req, res.clone());
                        }
                        return res;
                    }).catch(() => hit);
                    return hit || network;
                })
            )
        );
        return;
    }

    // बाकी same-origin files (icons, manifest): cache-first
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
