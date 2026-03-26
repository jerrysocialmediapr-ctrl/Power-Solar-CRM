// ============================================================
// NOTIFICATION MANAGER — Power Solar CRM
// ============================================================

const SW_URL = '/sw.js';

/**
 * Register the service worker and return the registration.
 */
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

/**
 * Request notification permission.
 * Returns true if granted.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

/**
 * Send meeting list to the SW so it can schedule reminders.
 */
export function scheduleMeetingReminders(meetings) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({
    type: 'SCHEDULE_MEETINGS',
    payload: { meetings },
  });
}

/**
 * Tell the SW to show a new-lead notification.
 */
export function notifyNewLead(lead) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    // Fallback: show via Notification API directly
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

/**
 * Start polling GAS for new leads (every 2 minutes).
 * Shows notification if new leads appear since last check.
 */
export function startLeadPolling(getLeadsFn, intervalMs = 2 * 60 * 1000) {
  let lastKnownCount = null;
  let lastKnownIds = new Set();

  const check = async () => {
    try {
      const leads = await getLeadsFn();
      if (lastKnownCount === null) {
        // First load — just record current state
        lastKnownCount = leads.length;
        lastKnownIds = new Set(leads.map(l => l._row));
        return;
      }

      // Find truly new leads
      const newLeads = leads.filter(l => !lastKnownIds.has(l._row));
      newLeads.forEach(lead => {
        notifyNewLead(lead);
      });

      lastKnownCount = leads.length;
      lastKnownIds = new Set(leads.map(l => l._row));
    } catch (e) {
      // Silently ignore poll errors
    }
  };

  check(); // immediate check
  const intervalId = setInterval(check, intervalMs);
  return () => clearInterval(intervalId); // return cleanup fn
}
