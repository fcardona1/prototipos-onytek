/* NOVAMIX · service worker: instalable y rápido; las páginas siempre se piden primero a la red */
var V = 'nm-v1', FILES = ["./", "index.html", "store.html", "panel.html", "common.css", "store.css", "panel.css", "core.js", "store.js", "panel.js", "img/logo-horizontal.webp", "img/icono-circular.webp", "img/mix.webp", "img/navidad.webp", "img/sticker.webp", "img/onytek.png"];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== V; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) { var c = r.clone(); caches.open(V).then(function (ch) { ch.put(e.request, c); }); return r; }).catch(function () { return caches.match(e.request); }));
});
