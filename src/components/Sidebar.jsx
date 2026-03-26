import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Calendar, 
  LogOut,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/contactos', icon: UserCircle, label: 'Contactos' },
  { to: '/meetings', icon: Calendar, label: 'Meetings' },
];

export function Sidebar() {
  const { leads } = useStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Sun className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Power Solar</h1>
          <p className="text-xs text-slate-500 font-medium">CRM v2.0</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              "group-hover:scale-110 transition-transform duration-200"
            )} />
            <span className="font-medium">{item.label}</span>
            {item.label === 'Leads' && (
              <span className={cn(
                "ml-auto text-xs px-2 py-0.5 rounded-full font-bold",
                "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
              )}>
                {leads.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
