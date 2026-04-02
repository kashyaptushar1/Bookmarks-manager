// Service Worker for LinkStash PWA notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from main app to schedule alarms
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_ALARM') {
    const { id, title, description, url, remindAt } = event.data;
    const delay = new Date(remindAt).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(`⏰ ${title}`, {
          body: description || `Time to open: ${url}`,
          icon: '/favicon.ico',
          tag: id,
          data: { url },
          requireInteraction: true,
          actions: [{ action: 'open', title: 'Open Link' }],
        });
        // Notify the client to update alarm state
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'ALARM_FIRED', id });
          });
        });
      }, delay);
    }
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
