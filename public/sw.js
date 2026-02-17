// Eco Land Service Worker - PWA & Push Notifications
const CACHE_NAME = 'ecoland-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || '🌿 Eco Land';
  const options = {
    body: data.body || 'Tienes un recordatorio de tu dieta',
    icon: '/lovable-uploads/b139a0b4-df8f-4943-9f9e-13a41f2dc4e9.png',
    badge: '/lovable-uploads/b139a0b4-df8f-4943-9f9e-13a41f2dc4e9.png',
    data: { url: data.url || '/cuenta' },
    actions: [
      { action: 'open', title: 'Ver dieta' },
      { action: 'dismiss', title: 'Más tarde' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
