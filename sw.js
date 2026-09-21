// EDUVA Service Worker — Offline-first (v2)
const CACHE = 'eduva-static-v2';
const CORE = [
  '/',
  '/index.html',
  '/features.html',
  '/class-10-maths-formulas.html',
  '/class-10-science-reactions.html',
  '/class-10-sst-important-dates.html',
  '/class-10-maths-chapters.html',
  '/class-10-science-chapters.html'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API + external: network-first, cache fallback nahi (fresh AI jawab chahiye)
  if (url.pathname.startsWith('/api/') || url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;
  // Static pages/assets: cache-first, baad mein background refresh
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((res) => {
        if (res && res.ok && (url.pathname.endsWith('.html') || url.pathname === '/' || /\.(png|css|js|xml)$/.test(url.pathname))) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
