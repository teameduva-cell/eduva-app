// EDUVA Service Worker — Offline-first + FCM Push (v3)
const CACHE = 'eduva-static-v3';
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
  if (url.pathname.startsWith('/api/') || url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;
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

// 🔔 FCM Push — notification dikhao
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (_) {}
  const n = data.notification || {};
  const title = n.title || data.title || 'EDUVA';
  const opts = {
    body: n.body || data.body || 'Naya update aaya hai!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: (data.data && data.data.url) || data.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});
// Tap pe app kholo
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) { c.navigate(url); return c.focus(); } }
      return clients.openWindow(url);
    })
  );
});
