import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose}
      />
      <div className="relative bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold text-white leading-none">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-border flex items-center justify-end gap-3 bg-slate-800/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
