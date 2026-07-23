// ============================================================
// CargoFlow Service Worker — sw.js
// Handles: push events, scheduled notifications, click actions
// ============================================================

const CACHE_NAME = 'cargoflow-v1';
const APP_ICON  = '/pwa-192x192.png';
const APP_BADGE = '/favicon.png';

// ── Push event (FCM or Web Push) ────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'CargoFlow', body: 'Tienes una nueva notificación.' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon  || APP_ICON,
      badge:   data.badge || APP_BADGE,
      tag:     data.tag   || 'cargoflow-push',
      data:    data.url   ? { url: data.url } : {},
      vibrate: [200, 100, 200],
      requireInteraction: data.requireInteraction || false,
    })
  );
});

// ── Notification click — focus or open the app ──────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', url });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// ── Message from app — SCHEDULE / CANCEL notifications ──────
const scheduledTimers = new Map();

self.addEventListener('message', (event) => {
  const { type, id, title, body, icon, url, delayMs } = event.data || {};

  if (type === 'SCHEDULE_NOTIFICATION') {
    // Clear any existing timer with same id
    if (scheduledTimers.has(id)) clearTimeout(scheduledTimers.get(id));

    const timerId = setTimeout(() => {
      self.registration.showNotification(title || 'CargoFlow', {
        body:    body   || '',
        icon:    icon   || APP_ICON,
        badge:   APP_BADGE,
        tag:     id     || 'cargoflow-scheduled',
        data:    url    ? { url } : {},
        vibrate: [200, 100, 200],
      });
      scheduledTimers.delete(id);
    }, delayMs || 0);

    scheduledTimers.set(id, timerId);
    event.source?.postMessage({ type: 'SCHEDULE_ACK', id });
  }

  if (type === 'CANCEL_NOTIFICATION') {
    if (scheduledTimers.has(id)) {
      clearTimeout(scheduledTimers.get(id));
      scheduledTimers.delete(id);
    }
    // Also close any visible notification with this tag
    self.registration.getNotifications({ tag: id }).then((notifs) => {
      notifs.forEach((n) => n.close());
    });
  }

  if (type === 'CANCEL_ALL') {
    for (const timerId of scheduledTimers.values()) clearTimeout(timerId);
    scheduledTimers.clear();
    self.registration.getNotifications().then((notifs) => {
      notifs.forEach((n) => n.close());
    });
  }
});

// ── Install & Activate (minimal cache for offline shell) ────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
