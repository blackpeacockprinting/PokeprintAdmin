const CACHE = 'bpp-v4';
const SHELL = ['/PokeprintAdmin/', '/PokeprintAdmin/index.html'];
const API_ORIGINS = ['us-central1.run.app'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  const isAPI = API_ORIGINS.some(o => url.includes(o));

  // Never cache POST requests — pass straight through to network
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  if (isAPI) {
    // GET API requests: network first, fall back to cache
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Shell: cache first
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
