const CACHE = 'kickboxing-v5';
const ASSETS = ['./index.html', './manifest.json', './icon.svg', './icon-maskable.svg', './gong.mp3', './gong-end.mp3'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', ev => {
  ev.respondWith(
    caches.match(ev.request).then(r => r || fetch(ev.request).catch(() => caches.match('./index.html')))
  );
});
