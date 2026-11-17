/* Science Hub phone app: keeps the app's own files on the phone so it opens with no internet.
   It stores program files only. Names and records never pass through here: they live in the page's own storage. */
const V='hub-6cd4c452f5',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  e.respondWith((async()=>{const c=await caches.open(V),nav=r.mode==='navigate';
    const hit=await c.match(r,{ignoreSearch:nav})||(nav?await c.match('index.html'):undefined);
    const net=fetch(nav?new Request(r.url,{cache:'no-store'}):r).then(x=>{if(x&&(x.ok||x.type==='opaque'))c.put(r,x.clone());return x;});
    if(!hit)return net;
    /* a newer copy when the network answers quickly, otherwise the kept copy at once */
    return Promise.race([net.catch(()=>hit),new Promise(res=>setTimeout(()=>res(hit),nav?6000:600))]);})());});
