import React, { useState, useMemo } from 'react';
import { 
  Search, Phone, Mail, MapPin, Calendar, User, ArrowRight, ChevronDown
} from 'lucide-react';
import { NotesManager } from '../components/NotesManager';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

export function Contactos() {
  const { leads, updateLead, syncGoogleAds } = useStore();
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  const filteredContacts = useMemo(() => {
    return leads.filter(c => 
      [c.Nombre, c['Teléfono'], c.Pueblo].some(v => 
        String(v || '').toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [leads, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Contactos</h2>
          <p className="text-slate-400 font-medium">Vista de directorio ({filteredContacts.length})</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar por nombre, teléfono, pueblo..."
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard 
            key={contact._row} 
            contact={contact} 
            onClick={() => setSelectedLead(contact)}
          />
        ))}
      </div>

      {selectedLead && (
        <ContactEditModal 
          lead={selectedLead} 
          isOpen={!!selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={updateLead}
          onSync={syncGoogleAds}
        />
      )}
    </div>
  );
}

function ContactCard({ contact, onClick }) {
  const initials = contact.Nombre
    ? contact.Nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const safeDate = () => {
    try {
      const raw = contact['Fecha Creación'] || contact.Fecha;
      if (!raw) return '—';
      const d = new Date(raw);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <div 
      onClick={onClick}
      className="card group cursor-pointer hover:border-primary/50 hover:bg-slate-800/40 transition-all duration-300 animate-in zoom-in"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner group-hover:scale-110 transition-transform duration-300",
          getStatusColor(contact.Estado || contact['Estado Lead'])
        )}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">{contact.Nombre}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs">
            <span className={cn("badge py-0 px-2", getStatusBadgeStyles(contact.Estado || contact['Estado Lead']))}>
              {contact.Estado || contact['Estado Lead'] || 'Pendiente'}
            </span>
            <span className="opacity-50">•</span>
            <span>{contact['Origen del Lead']}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <a href={`tel:${contact['Teléfono']}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
          <div className="p-1.5 bg-slate-800 rounded-lg"><Phone className="w-4 h-4" /></div>
          {contact['Teléfono']}
        </a>
        <a href={`mailto:${contact.Email}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
          <div className="p-1.5 bg-slate-800 rounded-lg"><Mail className="w-4 h-4" /></div>
          <span className="truncate">{contact.Email || 'Sin email'}</span>
        </a>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="p-1.5 bg-slate-800 rounded-lg"><MapPin className="w-4 h-4" /></div>
          {contact.Pueblo}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
          <Calendar className="w-3.5 h-3.5" />
          {safeDate()}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'Vendido': return 'bg-emerald-500/20 text-emerald-500';
    case 'No vendido': return 'bg-red-500/20 text-red-500';
    case 'No pasó crédito': return 'bg-amber-500/20 text-amber-500';
    case 'Debe consultarlo con un familiar': return 'bg-purple-500/20 text-purple-500';
    case 'No le interesa':
    case 'No contesta': return 'bg-slate-500/20 text-slate-500';
    default: return 'bg-slate-700 text-slate-400';
  }
}

function getStatusBadgeStyles(status) {
  switch (status) {
    case 'Vendido': return 'bg-emerald-500/10 text-emerald-500';
    case 'No vendido': return 'bg-red-500/10 text-red-500';
    case 'No pasó crédito': return 'bg-amber-500/10 text-amber-500';
    case 'Debe consultarlo con un familiar': return 'bg-purple-500/10 text-purple-500';
    case 'No le interesa':
    case 'No contesta': return 'bg-slate-500/10 text-slate-500';
    default: return 'bg-slate-400/10 text-slate-400';
  }
}

function ContactEditModal({ lead, isOpen, onClose, onUpdate, onSync }) {
  const [formData, setFormData] = useState({ ...lead });
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(lead._row, formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${lead.Nombre}`} footer={<button onClick={handleSubmit} className="btn btn-primary">Guardar</button>}>
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Nombre" value={formData.Nombre} onChange={v => setFormData({...formData, Nombre: v})} />
        <InputGroup label="Teléfono" value={formData['Teléfono']} onChange={v => setFormData({...formData, 'Teléfono': v})} />
        <InputGroup label="Email" value={formData.Email} onChange={v => setFormData({...formData, Email: v})} />
        <InputGroup label="Pueblo" value={formData.Pueblo} onChange={v => setFormData({...formData, Pueblo: v})} />
      </div>
      <div className="h-px bg-border my-6" />
      <NotesManager 
        notesRaw={formData.Anotaciones || formData.Notas} 
        onUpdate={(val) => setFormData({...formData, Anotaciones: val})} 
      />
    </Modal>
  );
}

function InputGroup({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <input 
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
