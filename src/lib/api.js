const GAS_URL = import.meta.env.VITE_GAS_URL;
const TOKEN = import.meta.env.VITE_GAS_TOKEN;

/**
 * Generic fetch wrapper for GAS API
 */
async function apiRequest(action, method = 'GET', body = null) {
  const url = new URL(GAS_URL);
  url.searchParams.append('token', TOKEN);

  if (method === 'GET') {
    url.searchParams.append('action', action);
  }

  const options = {
    method: method === 'GET' ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // ContentService needs this or it might fail on CORS redirect
    },
  };

  if (method === 'POST') {
    options.body = JSON.stringify({
      action,
      token: TOKEN,
      ...body,
    });
  }

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
}

export const api = {
  getLeads: () => apiRequest('getLeads'),
  getMeetings: () => apiRequest('getMeetings'),
  addLead: (lead) => apiRequest('addLead', 'POST', lead),
  updateLead: (row, data) => apiRequest('updateLead', 'POST', { row, ...data }),
  sendBlast: (tipo, subject, rows) => apiRequest('sendBlast', 'POST', { tipo, subject, rows }),
  autoMark: () => apiRequest('autoMark', 'POST'),
  syncGoogleAds: (row) => apiRequest('syncGoogleAds', 'POST', { row }),
  addMeeting: (meeting) => apiRequest('addMeeting', 'POST', meeting),
  updateMeeting: (row, data) => apiRequest('updateMeeting', 'POST', { row, ...data }),
};
