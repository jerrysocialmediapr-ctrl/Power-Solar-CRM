import { create } from 'zustand';
import { api } from '../lib/api';

export const useStore = create((set, get) => ({
  leads: [],
  meetings: [],
  loading: false,
  error: null,

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
