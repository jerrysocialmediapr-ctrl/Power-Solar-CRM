// ==========================================
// POWER SOLAR CRM — lib/api.js v3.0 CORREGIDO
// FIX CORS: Google Apps Script bloquea POST desde el browser.
// SOLUCIÓN: Todos los requests usan GET con params en la URL.
// ==========================================

const GAS_URL = import.meta.env.VITE_GAS_URL;
const TOKEN = import.meta.env.VITE_GAS_TOKEN;

async function apiRequest(action, payload = {}) {
  if (!GAS_URL) {
    console.warn('VITE_GAS_URL no está configurada.');
    return { error: 'VITE_GAS_URL no configurada' };
  }
  try {
    const url = new URL(GAS_URL);
    url.searchParams.append('token', TOKEN);
    url.searchParams.append('action', action);
    if (payload && Object.keys(payload).length > 0) {
      url.searchParams.append('data', JSON.stringify(payload));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result && result.error) {
      throw new Error(result.error);
    }
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
  sendBlast:     (tipo, subject, rows)  => apiRequest('sendBlast', { tipo, subject, rows }),
  autoMark:      ()                     => apiRequest('autoMark'),
  syncGoogleAds: (row)                  => apiRequest('syncGoogleAds', { row }),
  addMeeting:    (meeting)              => apiRequest('addMeeting', meeting),
  updateMeeting: (row, data)            => apiRequest('updateMeeting', { row, ...data }),
  deleteMeeting: (row)                  => apiRequest('deleteMeeting', { row }),
  forgotPassword:(email)                => apiRequest('forgotPassword', { email }),
};

export { apiRequest };
