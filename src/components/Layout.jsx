import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStore } from '../store/useStore';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function Layout() {
  const { fetchLeads, fetchMeetings, loading, error, clearError } = useStore();

  useEffect(() => {
    console.log("DEBUG: STORE STATE", { loading, error });
    fetchLeads();
    fetchMeetings();
  }, [fetchLeads, fetchMeetings, loading, error]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{String(error || '')}</p>
              </div>
              <button 
                onClick={clearError}
                className="text-xs font-bold uppercase tracking-wider hover:opacity-80"
              >
                Cerrar
              </button>
            </div>
          )}

          <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
            <Outlet />
          </div>

          {loading === true && (
            <div className="fixed bottom-8 right-8 bg-surface border border-border px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in zoom-in">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-bold text-slate-200">Sincronizando...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
