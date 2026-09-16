// DailyGrace App Service Worker for Mobile PWA Push Notifications & Offline Reliability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen to push events from push servers
self.addEventListener('push', (event) => {
  let data = {
    title: 'DailyGrace App',
    message: 'New daily devotional & prayer is ready!',
    targetUrl: '/'
  };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'DailyGrace App', message: event.data.text(), targetUrl: '/' };
    }
  }

  const options = {
    body: data.message || '',
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
    badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
    vibrate: [200, 100, 200],
    data: { url: data.targetUrl || '/' },
    actions: [
      { action: 'open', title: 'Open DailyGrace App' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'DailyGrace App', options)
  );
});

// Listen to postMessage from in-app client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, message, targetUrl } = event.data;
    const options = {
      body: message || '',
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
      badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
      vibrate: [200, 100, 200],
      data: { url: targetUrl || '/' }
    };
    event.waitUntil(
      self.registration.showNotification(title || 'DailyGrace App', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
