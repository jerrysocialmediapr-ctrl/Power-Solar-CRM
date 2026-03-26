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
      set({ leads: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMeetings: async () => {
    set({ loading: true });
    try {
      const data = await api.getMeetings();
      set({ meetings: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addLead: async (lead) => {
    set({ loading: true });
    try {
      await api.addLead(lead);
      await get().fetchLeads();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateLead: async (row, data) => {
    set({ loading: true });
    try {
      await api.updateLead(row, data);
      await get().fetchLeads();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteLead: async (row) => {
    set({ loading: true });
    try {
      await api.deleteLead(row);
      await get().fetchLeads();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  convertLead: async (row, data) => {
    set({ loading: true });
    try {
      await api.convertLead(row, data);
      await get().fetchLeads();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addMeeting: async (meeting) => {
    set({ loading: true });
    try {
      await api.addMeeting(meeting);
      await get().fetchMeetings();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateMeeting: async (row, data) => {
    set({ loading: true });
    try {
      await api.updateMeeting(row, data);
      await get().fetchMeetings();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteMeeting: async (row) => {
    set({ loading: true });
    try {
      await api.deleteMeeting(row);
      await get().fetchMeetings();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  autoMark: async () => {
    set({ loading: true });
    try {
      await api.autoMark();
      await get().fetchLeads();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  syncGoogleAds: async (row) => {
    set({ loading: true });
    try {
      await api.syncGoogleAds(row);
      await get().fetchLeads();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true });
    try {
      const res = await api.forgotPassword(email);
      set({ loading: false });
      return res;
    } catch (error) {
      set({ error: error.message, loading: false });
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
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
