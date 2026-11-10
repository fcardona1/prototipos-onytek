/* FOCUSTECH · service worker: la app abre rápido y funciona la carcasa sin internet. Los datos siempre vienen frescos. */
const V='focustech-v1',SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;           // Supabase, fuentes y demás: siempre a la red
  if(r.mode==='navigate'||u.pathname.endsWith('/config.js')||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ch=>ch.put(r,c));return x}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ch=>ch.put(r,c));return x})));
});
