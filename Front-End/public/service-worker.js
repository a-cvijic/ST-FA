const CACHE_NAME = 'fitness-app-v1';

// TODO: Add list of files to cache here
const urlsToCache = [
  '/',

  //public
  '/index.html',
  '/manifest.json',
  '/favicon.ico',

  //src
  '/src/index.js',
  '/src/App.js',
  '/src/App.css',
  '/src/App.test.js',
  '/src/index.css',

  //server
  '../server.js',

  //users-service
  '/src/views/Login/login.css',
  '/src/views/Login/login.js',
  '/src/views/Register/register.css',
  '/src/views/Register/register.js',
  '/src/views/Profile/profile.css',
  '/src/views/Profile/profile.js',
  '/src/views/Profile/profileAdmin.js',
  '/src/views/Profile/profileAdmin.css',
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
