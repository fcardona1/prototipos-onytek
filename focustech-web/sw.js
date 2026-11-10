/* FOCUSTECH · service worker: la app abre rápido y funciona la carcasa sin internet. Los datos siempre vienen frescos. */
const V='focustech-v2',SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;           // Supabase, fuentes y demás: siempre a la red
  if(r.mode==='navigate'||u.pathname.endsWith('/config.js')||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ch=>ch.put(r,c));return x}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ch=>ch.put(r,c));return x})));
});

/* ---- Avisos al celular con la app cerrada (Web Push) ---- */
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'Nuevo pedido',body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'Nuevo pedido',{
    body:d.body||'Abre el panel para verlo',icon:'icons/icon-192.png',badge:'icons/icon-192.png',
    tag:'pedido-'+(d.id||Date.now()),renotify:true,requireInteraction:true,vibrate:[200,100,200,100,400],data:{url:d.url||'./#panel'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./#panel',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if(c.url.startsWith(self.registration.scope)&&'focus'in c){c.navigate(url).catch(()=>{});return c.focus()}}
    return self.clients.openWindow(url)}));
});
self.addEventListener('pushsubscriptionchange',e=>{
  e.waitUntil(self.clients.matchAll({includeUncontrolled:true}).then(cs=>cs.forEach(c=>c.postMessage({t:'resub'}))));
});
