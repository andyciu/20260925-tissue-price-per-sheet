/**
 * Service worker：把網站檔案存在裝置上，離線也能使用。
 *
 * 部署時 GitHub Actions 會把 __BUILD__ 換成 commit SHA，
 * 每次部署都會產生新的快取名稱，舊快取在新版啟用時清掉。
 */
'use strict';

const CACHE = 'tissue-price-__BUILD__';

const ASSETS = [
  './',
  'index.html',
  'style.css',
  'calc.js',
  'app.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // cache: 'reload' 繞過瀏覽器的 HTTP 快取，確保存到的是這次部署的檔案
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('tissue-price-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    // 頁面本身忽略網址參數，例如從主畫面開啟時帶的 ?source=pwa
    caches.match(request, { ignoreSearch: request.mode === 'navigate' }).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        if (request.mode === 'navigate') return caches.match('index.html');
        return Response.error();
      });
    })
  );
});
