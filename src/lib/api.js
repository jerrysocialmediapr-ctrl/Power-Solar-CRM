const GAS_URL = import.meta.env.VITE_GAS_URL;
const TOKEN = import.meta.env.VITE_GAS_TOKEN;

/**
 * GAS API wrapper.
 * All requests use GET with query params to avoid CORS/redirect issues
 * that occur with POST to Google Apps Script.
 * The action + payload is encoded as a base64 JSON string in the "data" param.
 */
async function apiRequest(action, method = 'GET', body = null) {
  if (!GAS_URL) throw new Error('VITE_GAS_URL no está configurada. Revisa las variables de entorno en Vercel.');

  const url = new URL(GAS_URL);
  url.searchParams.append('token', TOKEN);
  url.searchParams.append('action', action);

  // For write operations, encode the body as a "data" query param
  // GAS doGet will receive it; this avoids the POST CORS redirect issue
  if (body) {
    url.searchParams.append('data', JSON.stringify(body));
  }

  try {
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
  getLeads:      ()               => apiRequest('getLeads'),
  getMeetings:   ()               => apiRequest('getMeetings'),
  addLead:       (lead)           => apiRequest('addLead', 'POST', lead),
  updateLead:    (row, data)      => apiRequest('updateLead', 'POST', { row, ...data }),
  deleteLead:    (row)            => apiRequest('deleteLead', 'POST', { row }),
  convertLead:   (row, data)      => apiRequest('convertLead', 'POST', { row, ...data }),
  sendBlast:     (tipo, subject, rows) => apiRequest('sendBlast', 'POST', { tipo, subject, rows }),
  autoMark:      ()               => apiRequest('autoMark', 'POST'),
  syncGoogleAds: (row)            => apiRequest('syncGoogleAds', 'POST', { row }),
  addMeeting:    (meeting)        => apiRequest('addMeeting', 'POST', meeting),
  updateMeeting: (row, data)      => apiRequest('updateMeeting', 'POST', { row, ...data }),
  forgotPassword:(email)          => apiRequest('forgotPassword', 'POST', { email }),
};

export { apiRequest };
