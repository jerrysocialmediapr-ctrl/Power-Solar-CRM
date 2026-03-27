import { create } from 'zustand';
import { api, apiRequest } from '../lib/api';

const getSafeUser = () => {
  try {
    const u = localStorage.getItem('ps_user');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

const sanitize = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object' && !(val instanceof Date)) {
    try { return JSON.stringify(val); } catch(e) { return String(val); }
  }
  return val;
};

const sanitizeRow = (row) => {
  const newRow = { ...row };
  Object.keys(newRow).forEach(key => {
    if (key !== '_row') {
      newRow[key] = sanitize(newRow[key]);
    }
  });
  return newRow;
};

export const useStore = create((set, get) => ({
  leads: [],
  meetings: [],
  loading: false,
  error: null,
  user: getSafeUser(),
  isAuthenticated: !!localStorage.getItem('ps_user'), // Use user existence as auth check

  login: (email, password) => {
    if (email === 'jerrypowersolar@gmail.com' && password === 'Ian110809') {
      const user = { email, name: 'Jerry Encarnación' };
      localStorage.setItem('ps_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('ps_user');
    set({ user: null, isAuthenticated: false });
  },

  fetchLeads: async () => {
    set({ loading: true });
    try {
      const data = await api.getLeads();
      const sanitized = Array.isArray(data) ? data.map(sanitizeRow) : [];
      set({ leads: sanitized, loading: false });
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  fetchMeetings: async () => {
    set({ loading: true });
    try {
      const data = await api.getMeetings();
      const sanitized = Array.isArray(data) ? data.map(sanitizeRow) : [];
      set({ meetings: sanitized, loading: false });
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  addLead: async (lead) => {
    set({ loading: true });
    try {
      await api.addLead(lead);
      await get().fetchLeads();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  updateLead: async (row, data) => {
    set({ loading: true });
    try {
      await api.updateLead(row, data);
      await get().fetchLeads();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  deleteLead: async (row) => {
    set({ loading: true });
    try {
      await api.deleteLead(row);
      await get().fetchLeads();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  convertLead: async (row, data) => {
    set({ loading: true });
    try {
      await api.convertLead(row, data);
      await get().fetchLeads();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  addMeeting: async (meeting) => {
    set({ loading: true });
    try {
      await api.addMeeting(meeting);
      await get().fetchMeetings();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  updateMeeting: async (row, data) => {
    set({ loading: true });
    try {
      await api.updateMeeting(row, data);
      await get().fetchMeetings();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  deleteMeeting: async (row) => {
    set({ loading: true });
    try {
      await api.deleteMeeting(row);
      await get().fetchMeetings();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  autoMark: async () => {
    set({ loading: true });
    try {
      await api.autoMark();
      await get().fetchLeads();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  syncGoogleAds: async (row) => {
    set({ loading: true });
    try {
      await api.syncGoogleAds(row);
      await get().fetchLeads();
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true });
    try {
      const res = await api.forgotPassword(email);
      set({ loading: false });
      return res;
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
      throw error;
    }
  },

  sendBlast: async (tipo, subject, rows) => {
    set({ loading: true });
    try {
      const res = await api.sendBlast(tipo, subject, rows);
      await get().fetchLeads();
      return res;
    } catch (error) {
      set({ error: String(error.message || error), loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
