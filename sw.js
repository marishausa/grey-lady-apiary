const CACHE = 'grey-lady-v1';
const URLS = [
  '/grey-lady-apiary/',
  '/grey-lady-apiary/index.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(URLS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Only cache GET requests for our app files
  if(e.request.method !== 'GET') return;
  const url = e.request.url;
  // Don't intercept Supabase API calls
  if(url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      // Network first for HTML, cache fallback
      return fetch(e.request).then(function(response){
        if(response.ok){
          const clone = response.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return response;
      }).catch(function(){
        return cached || new Response('Offline', {status: 503});
      });
    })
  );
});
