const CACHE_NAME = 'johnson-ai-v1';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/api.js',
    './js/utils/helpers.js',
    './js/utils/storage.js',
    './icon.svg',
    './manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache for API dynamics
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
