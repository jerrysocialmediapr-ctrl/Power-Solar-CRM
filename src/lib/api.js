// ==========================================
// POWER SOLAR CRM — lib/api.js v3.2
// GET para lecturas, POST para escrituras
// ✅ Fix: sendBlast envía array de objetos {nombre, email}
// ==========================================
const GAS_URL = import.meta.env.VITE_GAS_URL;
const TOKEN = import.meta.env.VITE_GAS_TOKEN;

async function apiRequest(action, payload = {}) {
  if (!GAS_URL) {
    console.warn('VITE_GAS_URL no está configurada.');
    return { error: 'VITE_GAS_URL no configurada' };
  }
  try {
    const isRead = action === 'getLeads' || action === 'getMeetings';
    let response;
    if (isRead) {
      const url = new URL(GAS_URL);
      url.searchParams.append('token', TOKEN);
      url.searchParams.append('action', action);
      response = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
    } else {
      response = await fetch(GAS_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ token: TOKEN, action, ...payload }),
      });
    }
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    if (result && result.error) throw new Error(result.error);
    return result;
  } catch (error) {
    console.error(`API Error (${action}):`, error.message);
    throw error;
  }
}

export const api = {
  getLeads:      ()                     => apiRequest('getLeads'),
  getMeetings:   ()                     => apiRequest('getMeetings'),
  addLead:       (lead)                 => apiRequest('addLead', lead),
  updateLead:    (row, data)            => apiRequest('updateLead', { row, ...data }),
  deleteLead:    (row)                  => apiRequest('deleteLead', { row }),
  convertLead:   (row, data)            => apiRequest('convertLead', { row, ...data }),
  // ✅ Fix: leads es array de objetos [{nombre, email}]
  sendBlast:     (tipo, subject, leads) => apiRequest('sendBlast', { tipo, subject, leads }),
  autoMark:      ()                     => apiRequest('autoMark'),
  syncGoogleAds: (row)                  => apiRequest('syncGoogleAds', { row }),
  addMeeting:    (meeting)              => apiRequest('addMeeting', meeting),
  updateMeeting: (row, data)            => apiRequest('updateMeeting', { row, ...data }),
  deleteMeeting: (row)                  => apiRequest('deleteMeeting', { row }),
  forgotPassword:(email)                => apiRequest('forgotPassword', { email }),
};

export { apiRequest };
