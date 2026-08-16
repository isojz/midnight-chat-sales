// MIDNIGHT CHAT PARTY 物販フライヤー — オフライン用 Service Worker（scope: /flyer/）
const CACHE='mcp-flyer-v1';
const ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './sticker-white.jpg',
  './sticker-gray.jpg',
  './qr-instagram.jpg',
  './qr-x.jpg',
  '../icon-180.png',
  '../icon-192.png',
  '../icon-512.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    // 同一オリジンで帳簿アプリ(mcp-book-*)とキャッシュ空間を共有しているため、自分のプレフィックスだけ掃除する
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mcp-flyer-')&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// キャッシュ優先（オフラインでも起動できる）。ネットワークがあれば裏で更新。
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const net=fetch(e.request).then(res=>{
        if(res && res.status===200 && res.type==='basic'){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
        }
        return res;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});
