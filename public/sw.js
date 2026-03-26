// ============================================================
// POWER SOLAR CRM — SERVICE WORKER v1.0
// ============================================================

const CACHE_NAME = 'ps-crm-v1';
const MEETING_CHECK_INTERVAL = 60 * 1000; // check every minute

let scheduledReminders = new Map(); // meetingRow → timerId

// ==========================================
// INSTALL & ACTIVATE
// ==========================================
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// ==========================================
// PUSH NOTIFICATIONS (from GAS server)
// ==========================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch (e) { data = { title: 'Power Solar CRM', body: event.data.text() }; }

  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'ps-crm',
    requireInteraction: data.requireInteraction || false,
    data: { url: data.url || '/' },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Power Solar CRM', options)
  );
});

// ==========================================
// NOTIFICATION CLICK
// ==========================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ==========================================
// MESSAGES FROM THE APP
// ==========================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  // Schedule meeting reminders
  if (type === 'SCHEDULE_MEETINGS') {
    scheduleMeetingReminders(payload.meetings || []);
  }

  // New lead received — show notification
  if (type === 'NEW_LEAD') {
    showNewLeadNotification(payload);
  }
});

// ==========================================
// MEETING REMINDERS — 15 min before
// ==========================================
function scheduleMeetingReminders(meetings) {
  // Clear old timers
  scheduledReminders.forEach((timerId) => clearTimeout(timerId));
  scheduledReminders.clear();

  const now = Date.now();

  meetings.forEach((meeting) => {
    if (meeting.Estado !== 'Pendiente') return;

    const fechaInicio = meeting['Fecha Inicio'] || meeting['Fecha Meeting'];
    const horaInicio  = meeting['Hora Inicio'] || meeting['Hora'] || '00:00';

    if (!fechaInicio) return;

    // Build meeting datetime
    let dateStr = typeof fechaInicio === 'string'
      ? fechaInicio.split('T')[0]
      : new Date(fechaInicio).toISOString().split('T')[0];

    const meetingTime = new Date(`${dateStr}T${horaInicio}`).getTime();
    const reminderTime = meetingTime - 15 * 60 * 1000; // 15 min before
    const delay = reminderTime - now;

    if (delay <= 0) return; // already passed

    const key = String(meeting._row);
    const timerId = setTimeout(() => {
      const nombre = meeting['Título'] || meeting.Nombre || 'Meeting';
      self.registration.showNotification('📅 Power Solar — Meeting en 15 min', {
        body: `${nombre} a las ${horaInicio}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [300, 100, 300, 100, 300],
        tag: `meeting-reminder-${key}`,
        requireInteraction: true,
        data: { url: '/meetings' },
      });
      scheduledReminders.delete(key);
    }, delay);

    scheduledReminders.set(key, timerId);
  });
}

// ==========================================
// NEW LEAD NOTIFICATION
// ==========================================
function showNewLeadNotification(lead) {
  const nombre  = lead.Nombre || 'Nuevo lead';
  const pueblo  = lead.Pueblo || '';
  const origen  = lead['Origen del Lead'] || '';

  self.registration.showNotification('🔥 Nuevo Lead — Power Solar', {
    body: `${nombre}${pueblo ? ` · ${pueblo}` : ''}${origen ? ` · ${origen}` : ''}`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 50, 200],
    tag: 'new-lead',
    requireInteraction: false,
    data: { url: '/leads' },
    actions: [
      { action: 'view', title: 'Ver Lead' },
    ],
  });
}
