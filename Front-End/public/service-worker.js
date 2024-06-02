const CACHE_NAME = "fitness-app-v1";

// TODO: Add list of files to cache here
const urlsToCache = [
  "/",

  //public
  "/index.html",
  "/manifest.json",

  //icons
  "icons/logo_72.png",
  "icons/logo_128.png",
  "icons/logo_144.png",
  "icons/logo_192.png",
  "icons/logo_256.png",
  "icons/logo_512.png",

  //src
  "/src/index.js",
  "/src/App.js",
  "/src/App.css",
  "/src/App.test.js",
  "/src/index.css",

  //server
  "../server.js",

  //components
  "/src/components/Navbar/navbar.css",
  "/src/components/Navbar/navbar.js",
  "/src/components/Footer/footer.css",
  "/src/components/Footer/footer.js",

  //home-page
  "/src/views/Home/home.css",
  "/src/views/Home/home.js",
  "/src/views/Home/homeAdmin.css",
  "/src/views/Home/homeAdmin.js",

  //users-service
  "/src/views/Login/login.css",
  "/src/views/Login/login.js",
  "/src/views/Register/register.css",
  "/src/views/Register/register.js",
  "/src/views/Profile/profile.css",
  "/src/views/Profile/profile.js",
  "/src/views/Profile/profileAdmin.js",
  "/src/views/Profile/profileAdmin.css",

  //exercise-service
  "/src/views/Exercises/excercise_details.css",
  "/src/views/Exercises/exercises.css",
  "/src/views/Exercises/exercises.js",
  "/src/views/Exercises/exercisesAdmin.css",
  "/src/views/Exercises/exercisesAdmin.js",
  "/src/views/Exercises/exercisesDetails.js",
  "/src/views/Exercises/exerciseuser.js",
  "/src/views/Exercises/loadGifs.js",
  "/src/views/Exercises/gifs/*.gif",
  "/src/views/Exercises/LazyImage.js",

  //trainings-service
  "/src/views/Trainings/trainings.css",
  "/src/views/Trainings/trainings.js",
  "/src/views/Trainings/trainingsAdmin.css",
  "/src/views/Trainings/trainingsAdmin.js",
  "/src/views/Trainings/trainingsDetails.css",
  "/src/views/Trainings/trainingsDetails.js",

  //TODO: recipe-service
  "/src/views/Recepies/recepies.css",
  "/src/views/Recepies/recepies.js",
  "/src/views/Recepies/recepiesAdmin.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("push", (pushEvent) => {
  console.log("Service Worker: Push");
  const payload = pushEvent.data ? pushEvent.data.text() : "NO PAYLOAD";
  pushEvent.waitUntil(
    self.registration.showNotification("Push notification", {
      body: payload,
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Fetch intercepted for:", event.request.url);
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
