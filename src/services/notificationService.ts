// ============================================================
// notificationService.ts
// Abstraction layer for all CargoFlow notifications
// ============================================================

export type NotificationPayload = {
  title:   string;
  body:    string;
  icon?:   string;
  badge?:  string;
  tag?:    string;
  url?:    string;
  sound?:  string;  // path to audio file
  requireInteraction?: boolean;
};

// ── Internal event name used to pipe in-app toasts ──────────
const IN_APP_EVENT = 'cargoflow:notification';

// ── Get the active Service Worker registration ───────────────
async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

// ── 1. Request notification permission ───────────────────────
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied')  return 'denied';
  return await Notification.requestPermission();
}

// ── 2. In-App notification (toast) ──────────────────────────
export function sendInAppNotification(payload: NotificationPayload): void {
  window.dispatchEvent(new CustomEvent(IN_APP_EVENT, { detail: payload }));
}

// ── 3. OS push notification (requires SW + permission) ──────
export async function sendPushNotification(payload: NotificationPayload): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') return false;

  const reg = await getSWRegistration();
  if (!reg) {
    // Fallback: use Notification API directly
    new Notification(payload.title, {
      body:  payload.body,
      icon:  payload.icon  || '/pwa-192x192.png',
      badge: payload.badge || '/favicon.png',
      tag:   payload.tag   || 'cargoflow',
    });
    return true;
  }

  await reg.showNotification(payload.title, {
    body:               payload.body,
    icon:               payload.icon  || '/pwa-192x192.png',
    badge:              payload.badge || '/favicon.png',
    tag:                payload.tag   || 'cargoflow',
    data:               payload.url   ? { url: payload.url } : {},
    requireInteraction: payload.requireInteraction ?? false,
  } as NotificationOptions);
  return true;
}

// ── 4. Full notification: in-app + OS push + sound ──────────
export async function notify(payload: NotificationPayload): Promise<void> {
  // Always show in-app toast
  sendInAppNotification(payload);

  // OS push if app might be in background
  sendPushNotification(payload).catch(() => {});

  // Play sound if specified
  if (payload.sound) {
    playNotificationSound(payload.sound);
  }
}

// ── 4b. Save persistent notification to Firestore ───────────
export async function sendDbNotification(
  targetUserId: string,
  title: string,
  body: string,
  tag?: string
): Promise<void> {
  try {
    const { db } = await import('../config/firebase');
    const { collection, addDoc } = await import('firebase/firestore');
    await addDoc(collection(db, 'notifications'), {
      userId: targetUserId,
      title,
      body,
      tag: tag || 'general',
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Could not save notification to Firestore:', e);
  }
}

// ── 5. Scheduled notification via Service Worker ─────────────
export async function scheduleNotification(
  id:      string,
  payload: NotificationPayload,
  delayMs: number
): Promise<boolean> {
  const reg = await getSWRegistration();
  if (!reg || !reg.active) return false;

  reg.active.postMessage({
    type:    'SCHEDULE_NOTIFICATION',
    id,
    delayMs,
    ...payload,
  });
  return true;
}

// ── 6. Cancel a scheduled notification ──────────────────────
export async function cancelNotification(id: string): Promise<void> {
  const reg = await getSWRegistration();
  reg?.active?.postMessage({ type: 'CANCEL_NOTIFICATION', id });
}

// ── 7. Cancel all notifications ─────────────────────────────
export async function cancelAllNotifications(): Promise<void> {
  const reg = await getSWRegistration();
  reg?.active?.postMessage({ type: 'CANCEL_ALL' });
}

// ── 8. Play notification sound ───────────────────────────────
let currentAudio: HTMLAudioElement | null = null;
let currentAudioSrc: string | null = null;

export function playNotificationSound(src: string): void {
  try {
    // If clicking the same sound that is currently playing, just stop it
    if (currentAudio && currentAudioSrc === src && !currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      currentAudioSrc = null;
      return;
    }

    // Stop any other currently playing sound
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(src);
    currentAudioSrc = src;
    currentAudio.volume = 0.6;
    
    // Clear references when finished naturally
    currentAudio.addEventListener('ended', () => {
      if (currentAudioSrc === src) {
        currentAudio = null;
        currentAudioSrc = null;
      }
    });

    currentAudio.play().catch(() => {}); // user-gesture required guard
  } catch (_) {}
}

// ── 9. Register SW listener for click → navigate ────────────
export function listenForSWMessages(onNotificationClick: (url: string) => void): () => void {
  if (!('serviceWorker' in navigator)) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NOTIFICATION_CLICK') {
      onNotificationClick(event.data.url || '/');
    }
  };
  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}
