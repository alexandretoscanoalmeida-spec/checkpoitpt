const CACHE_NAME = 'ponto-app-v3';
const urlsToCache = [
    './',
    './index.html',
    './admin.html',
    './worker.html',
    './styles.css',
    './app.js',
    './admin.js',
    './worker.js',
    'https://unpkg.com/html5-qrcode@2.3.4/html5-qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    // Não cache API requests ou dynamic content
    if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Apagando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync para registros offline
self.addEventListener('sync', event => {
    if (event.tag === 'sync-registries') {
        event.waitUntil(syncRegistries());
    }
});

async function syncRegistries() {
    // Em uma aplicação real, aqui sincronizaria com um servidor
    console.log('Sincronizando registros...');
}