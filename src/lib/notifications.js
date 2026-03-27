// ============================================================
// NOTIFICATION MANAGER — Power Solar CRM
// ============================================================

const SW_URL = '/sw.js';

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
    console.log('[SW] Registered:', reg.scope);
    return reg;
  } catch (err) {
    console.error('[SW] Registration failed:', err);
    return null;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

export function scheduleMeetingReminders(meetings) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({
    type: 'SCHEDULE_MEETINGS',
    payload: { meetings },
  });
}

export function notifyNewLead(lead) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    if (Notification.permission === 'granted') {
      new Notification('🔥 Nuevo Lead — Power Solar', {
        body: `${lead.Nombre || 'Sin nombre'} · ${lead.Pueblo || ''} · ${lead['Origen del Lead'] || ''}`,
        icon: '/icons/icon-192.png',
      });
    }
    return;
  }
  navigator.serviceWorker.controller.postMessage({
    type: 'NEW_LEAD',
    payload: lead,
  });
}

// DESHABILITADO — causaba loop infinito de errores CORS
// El CRM sigue funcionando normal, solo sin polling automático
export function startLeadPolling(getLeadsFn, intervalMs = 2 * 60 * 1000) {
  console.log('[Polling] Deshabilitado para evitar errores CORS.');
  return () => {}; // No-op cleanup
}
