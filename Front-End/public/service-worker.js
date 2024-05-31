const CACHE_NAME = 'fitness-app-v1';

// TODO: Add list of files to cache here
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/icons/logo_72.png',
  '/icons/logo_128.png',
  '/icons/logo_144.png',
  '/icons/logo_192.png',
  '/icons/logo_256.png',
  '/icons/logo_512.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("push", pushEvent => {
  console.log('Service Worker: Push');
  const payload = pushEvent.data ? pushEvent.data.text() : "NO PAYLOAD";
  pushEvent.waitUntil(
    self.registration.showNotification("Push notification", {
      body: payload
    })
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
