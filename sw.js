const CACHE = 'kickboxing-v30';
const ASSETS = ['./index.html', './manifest.json', './icon.svg', './icon-maskable.svg', './gong.mp3', './gong-end.mp3', './default-voices.js', './ann.js'];

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
  // voices/のMP3はキャッシュファースト（初回fetchで自動キャッシュ）
  if (ev.request.url.includes('/voices/')) {
    ev.respondWith(
      caches.match(ev.request).then(cached => {
        if (cached) return cached;
        return fetch(ev.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(ev.request, clone));
          return resp;
        }).catch(() => cached);
      })
    );
    return;
  }
  ev.respondWith(
    caches.match(ev.request).then(r => r || fetch(ev.request).catch(() => caches.match('./index.html')))
  );
});
