// service-worker.js

// Install the service worker
self.addEventListener('install', event => {
    console.log('Service worker installed');
  });
  
  // Activate the service worker
  self.addEventListener('activate', event => {
    console.log('Service worker activated');
  });
  
  // Listen for fetch events and respond with cached resources
  self.addEventListener('fetch', event => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  });
  