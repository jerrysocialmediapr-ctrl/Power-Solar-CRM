import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Contactos } from './pages/Contactos';
import { Meetings } from './pages/Meetings';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useStore } from './store/useStore';
import {
  requestNotificationPermission,
  scheduleMeetingReminders,
  startLeadPolling,
} from './lib/notifications.js';
import { api } from './lib/api.js';

function NotificationManager() {
  const { meetings, isAuthenticated } = useStore();
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Ask for notification permission once user is logged in
    requestNotificationPermission();

    // Start polling for new leads every 2 minutes
    cleanupRef.current = startLeadPolling(() => api.getLeads(), 2 * 60 * 1000);

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [isAuthenticated]);

  // Schedule meeting reminders whenever meetings list changes
  useEffect(() => {
    if (!isAuthenticated || meetings.length === 0) return;
    scheduleMeetingReminders(meetings);
  }, [meetings, isAuthenticated]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <NotificationManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/meetings" element={<Meetings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
