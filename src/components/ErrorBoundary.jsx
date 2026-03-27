import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRM CRASH DETECTED:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const componentStack = this.state.errorInfo?.componentStack || '';
      const firstComponent = componentStack.split('\n')[1] || '';
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center border border-danger/20">
                <AlertTriangle className="w-10 h-10 text-danger" />
              </div>
            </div>
            
            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">¡Ups! Algo salió mal</h1>
            <p className="text-slate-400 text-sm mb-8">
              El CRM detectó un error inesperado al renderizar los datos. No te preocupes, tu información está segura.
            </p>

            <div className="bg-surface/50 border border-border rounded-2xl p-4 mb-8 text-left">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Componente Afectado:</p>
              <div className="text-xs font-bold text-white mb-4 italic">
                {firstComponent || 'Desconocido'}
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Detalle Técnico:</p>
              <div className="text-xs font-mono text-danger bg-danger/5 p-3 rounded-lg overflow-auto max-h-32">
                {this.state.error?.toString() || 'Error desconocido'}
                <pre className="mt-2 opacity-50 text-[10px]">{componentStack}</pre>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="btn bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center gap-2 py-3"
              >
                <RefreshCcw className="w-4 h-4" />
                Refrescar
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
            </div>

            <p className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              Power Solar CRM Stability Engine
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
