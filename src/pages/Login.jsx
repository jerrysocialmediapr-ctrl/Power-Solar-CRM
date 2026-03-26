import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Sun, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setForgotMessage('Se ha enviado un código de recuperación a tu email (Simulado).');
    // En un caso real, aquí llamaríamos a un endpoint de GAS para enviar el email.
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 mb-4">
            <Sun className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Power Solar</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">CRM v2.1 Access</p>
        </div>

        <div className="card p-8 bg-surface/50 backdrop-blur-xl border-border/50 shadow-2xl">
          {isForgot ? (
            <form onSubmit={handleForgot} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Recuperar Contraseña</h2>
                <p className="text-slate-400 text-sm mt-1">Ingresa tu email para recibir un código</p>
              </div>

              {forgotMessage ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
                  {forgotMessage}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Registrado</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email"
                      required
                      placeholder="jerrypowersolar@gmail.com"
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-4 text-sm font-black uppercase tracking-widest">
                Enviar Código
              </button>
              <button 
                type="button" 
                onClick={() => { setIsForgot(false); setForgotMessage(''); }}
                className="w-full text-center text-slate-500 text-sm font-bold hover:text-white transition-colors"
              >
                Volver al Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email"
                    required
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                  <button 
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-[10px] font-black uppercase text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-12 py-3 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                Entrar al Sistema
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
          Acceso Restringido — Power Solar Puerto Rico © 2026
        </p>
      </div>
    </div>
  );
}
