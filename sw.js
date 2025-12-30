// Service Worker para EntreNos - Notificações Push
// Versão: 1.0.0

const CACHE_NAME = 'entrenos-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/select-user.html',
  '/app.html',
  '/style.css',
  '/select-user.css',
  '/script.js',
  '/select-user.js',
  '/manifest.json',
  '/usu-Lucas.jpeg',
  '/usu-Emilly.jpeg',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache antigo removido:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições (cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request);
      }
    )
  );
});

// Background message handler para Firebase Cloud Messaging
self.addEventListener('push', (event) => {
  console.log('Mensagem push recebida:', event);
  
  if (!event.data) {
    console.log('Push event sem dados');
    return;
  }
  
  const data = event.data.json();
  const { notification, title, body, icon, badge, tag, data: messageData } = data;
  
  const options = {
    body: body || notification?.body || 'Nova mensagem no EntreNos',
    icon: icon || '/favicon.ico',
    badge: badge || '/favicon.ico',
    tag: tag || 'entrenos-message',
    requireInteraction: false,
    silent: false,
    data: messageData || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };
  
  const notificationTitle = title || notification?.title || 'EntreNos';
  
  event.waitUntil(
    self.registration.showNotification(notificationTitle, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Abrir o app
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Notification close handler
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event);
});

// Sync handler para funcionalidades futuras
self.addEventListener('sync', (event) => {
  console.log('Sync event:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Função de background sync (futuro)
async function doBackgroundSync() {
  console.log('Realizando background sync...');
  // Implementar sincronização de mensagens offline
}

// Message handler para comunicação com o app
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida do app:', event.data);
  
  // Responder para o app
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
