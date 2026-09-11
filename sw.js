// EDUVA — न्यूनतम Service Worker
// इसका मकसद सिर्फ इतना है कि Android Chrome ऐप को "installable PWA" माने,
// जो Web Share Target (WhatsApp/Chrome के Share sheet में EDUVA दिखाने) के लिए ज़रूरी शर्त है।
// अभी इसमें कोई offline caching नहीं है — हर request सीधे network से जाती है।

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
