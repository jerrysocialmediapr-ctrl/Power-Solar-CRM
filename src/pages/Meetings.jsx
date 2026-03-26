import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Plus, 
  CheckCircle2, 
  Circle, 
  XCircle,
  Video,
  ChevronDown,
  Search,
  User,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from '../components/Modal';

const MEETING_TYPES = ["Llamada inicial", "Demo del sistema", "Seguimiento", "Cierre", "Post-venta"];
const MEETING_STATUSES = ["Pendiente", "Completado", "Cancelado"];

export function Meetings() {
  const { meetings, leads, addMeeting, updateMeeting, loading } = useStore();
  const [filter, setFilter] = useState('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sorting and filtering
  const filteredMeetings = useMemo(() => {
    let list = [...meetings];
    if (filter !== 'Todos') {
      list = list.filter(m => m.Estado === filter);
    }
    return list.sort((a, b) => new Date(a['Fecha Meeting']) - new Date(b['Fecha Meeting']));
  }, [meetings, filter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Meetings</h2>
          <p className="text-slate-400 font-medium">Gestiona tus próximas citas y seguimientos</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Meeting
        </button>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-xl w-fit">
        {['Todos', 'Pendiente', 'Completado', 'Cancelado'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              filter === tab 
                ? "bg-slate-800 text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List of Meetings */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="card py-12 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h4 className="text-white font-bold">No hay meetings</h4>
            <p className="text-slate-500 text-sm mt-1">Intenta cambiar los filtros o agrega uno nuevo.</p>
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <MeetingCard 
              key={meeting._row} 
              meeting={meeting} 
              onComplete={(notes) => updateMeeting(meeting._row, { estado: 'Completado', notas })}
              onCancel={() => updateMeeting(meeting._row, { estado: 'Cancelado' })}
            />
          ))
        )}
      </div>

      {isAddModalOpen && (
        <AddMeetingModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          leads={leads}
          onAdd={addMeeting}
        />
      )}
    </div>
  );
}

function MeetingCard({ meeting, onComplete, onCancel }) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [notes, setNotes] = useState(meeting.Notas || '');

  const meetingDate = parseISO(meeting['Fecha Meeting']);
  const dayStr = format(meetingDate, 'dd');
  const monthStr = format(meetingDate, 'MMM', { locale: es }).toUpperCase();

  const isPending = meeting.Estado === 'Pendiente';

  return (
    <div className={cn(
      "card flex flex-col md:flex-row gap-6 hover:border-slate-700 transition-colors",
      meeting.Estado === 'Completado' && "opacity-75"
    )}>
      {/* Date Block */}
      <div className="flex flex-row md:flex-col items-center justify-center bg-slate-800/50 rounded-2xl p-4 min-w-[80px] border border-border/50">
        <span className="text-2xl font-black text-white leading-none">{dayStr}</span>
        <span className="text-[10px] font-bold text-primary mt-1">{monthStr}</span>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("badge py-0.5", getMeetingTypeStyles(meeting.Tipo))}>
                {getMeetingIcon(meeting.Tipo)}
                {meeting.Tipo}
              </span>
              {isToday(meetingDate) && (
                <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse">
                  Hoy
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{meeting.Nombre}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("badge", getStatusStyles(meeting.Estado))}>
              {meeting.Estado}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-slate-300">{meeting.Hora}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Phone className="w-4 h-4 text-slate-600" />
            <span>{meeting.Teléfono}</span>
          </div>
          {meeting.Notas && (
            <div className="flex items-center gap-2 text-sm text-slate-400 md:col-span-3">
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <span className="italic">{meeting.Notas}</span>
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="flex flex-row md:flex-col justify-center gap-2">
          <button 
            onClick={() => setShowCompleteModal(true)}
            className="btn bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all p-3 rounded-2xl"
            title="Completar"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button 
            onClick={onCancel}
            className="btn bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all p-3 rounded-2xl"
            title="Cancelar"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {showCompleteModal && (
        <Modal 
          isOpen={showCompleteModal} 
          onClose={() => setShowCompleteModal(false)}
          title="Completar Meeting"
          footer={
            <button 
              onClick={() => { onComplete(notes); setShowCompleteModal(false); }}
              className="btn btn-primary w-full"
            >
              Marcar como Completado
            </button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Añade notas finales sobre esta reunión:</p>
            <textarea
              className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32"
              placeholder="Ej: El cliente está interesado, enviar propuesta mañana..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function AddMeetingModal({ isOpen, onClose, leads, onAdd }) {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', fechaMeeting: format(new Date(), 'yyyy-MM-dd'),
    hora: '10:00', tipo: 'Llamada inicial', notas: '', estado: 'Pendiente', leadRow: ''
  });
  const [leadSearch, setLeadSearch] = useState('');

  const filteredLeads = useMemo(() => {
    if (!leadSearch) return [];
    return leads.filter(l => l.Nombre.toLowerCase().includes(leadSearch.toLowerCase())).slice(0, 5);
  }, [leads, leadSearch]);

  const selectLead = (l) => {
    setFormData({
      ...formData,
      nombre: l.Nombre,
      telefono: l['Teléfono'],
      leadRow: l._row
    });
    setLeadSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Nuevo Meeting"
      footer={<button onClick={handleSubmit} className="btn btn-primary w-full">Programar Meeting</button>}
    >
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Lead Asociado (Opcional)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none"
              placeholder="Buscar lead existente..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
            />
            {filteredLeads.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-10 overflow-hidden divide-y divide-border">
                {filteredLeads.map(l => (
                  <button 
                    key={l._row}
                    className="w-full text-left p-3 hover:bg-slate-800 transition-colors flex items-center justify-between group"
                    onClick={() => selectLead(l)}
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-primary">{l.Nombre}</p>
                      <p className="text-xs text-slate-500">{l['Teléfono']}</p>
                    </div>
                    <User className="w-4 h-4 text-slate-700" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Nombre" value={formData.nombre} onChange={v => setFormData({...formData, nombre: v})} />
          <InputGroup label="Teléfono" value={formData.telefono} onChange={v => setFormData({...formData, telefono: v})} />
          <InputGroup label="Fecha" type="date" value={formData.fechaMeeting} onChange={v => setFormData({...formData, fechaMeeting: v})} />
          <InputGroup label="Hora" type="time" value={formData.hora} onChange={v => setFormData({...formData, hora: v})} />
          <div className="col-span-2">
            <SelectGroup label="Tipo de Meeting" value={formData.tipo} options={MEETING_TYPES} onChange={v => setFormData({...formData, tipo: v})} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Notas</label>
            <textarea 
              className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all h-20 mt-1.5"
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Helpers
function InputGroup({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <input 
        type={type}
        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectGroup({ label, value, options, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <div className="relative">
        <select 
          className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

function getMeetingIcon(type) {
  switch (type) {
    case 'Llamada inicial': return <Phone className="w-3.5 h-3.5 mr-1" />;
    case 'Demo del sistema': return <Video className="w-3.5 h-3.5 mr-1" />;
    default: return <CalendarIcon className="w-3.5 h-3.5 mr-1" />;
  }
}

function getStatusStyles(status) {
  switch (status) {
    case 'Pendiente': return 'bg-primary/10 text-primary';
    case 'Completado': return 'bg-emerald-500/10 text-emerald-500';
    case 'Cancelado': return 'bg-slate-500/10 text-slate-500';
    default: return 'bg-slate-400/10 text-slate-400';
  }
}

function getMeetingTypeStyles(type) {
  return 'bg-slate-800 text-slate-300 border border-border';
}
