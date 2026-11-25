
const CACHE = 'inch-calculator-v11';

const FILES = [
    './',
    './index.html',
    './styles.css',
    './calc-core.js',
    './history-store.js',
    './app.js',
    './manifest.webmanifest',
    './apple-touch-icon.png',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key => key !== CACHE)
                    .map(key => caches.delete(key))
            );

            await self.clients.claim();
        })()
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(hit => {
            return hit || fetch(event.request);
        })
    );
});
