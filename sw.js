const CACHE='quitamegas-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),
  self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==='navigate'||/\.(?:html|webmanifest|js)$/.test(new URL(req.url).pathname)){
  event.respondWith(fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
   return response;
  }).catch(()=>caches.match(req).then(x=>x||caches.match('./index.html'))));
 }else{
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
   return response;
  })));
 }
});