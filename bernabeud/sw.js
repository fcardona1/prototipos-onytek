/* BERNABEUD · service worker: instalable y rápido; las páginas siempre se piden primero a la red */
var V = 'bb-v1', FILES = ['./', 'index.html', 'sitio.html', 'panel.html', 'common.css', 'site.css', 'panel.css', 'core.js', 'site.js', 'panel.js', 'img/logo-main.png', 'img/logo-horizontal.png', 'img/monograma.png', 'img/onytek.png', 'img/bg-calle.svg', 'img/bg-calle-m.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== V; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) { var c = r.clone(); caches.open(V).then(function (ch) { ch.put(e.request, c); }); return r; }).catch(function () { return caches.match(e.request); }));
});
