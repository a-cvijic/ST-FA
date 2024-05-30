// service-worker.js

// Install the service worker
self.addEventListener('install', event => {
    console.log('Service worker installed');
  });
  
  // Activate the service worker
  self.addEventListener('activate', event => {
    console.log('Service worker activated');
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
  
  // Listen for fetch events and respond with cached resources
  self.addEventListener('fetch', event => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  });
  