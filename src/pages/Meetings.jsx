import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Clock, MapPin, Phone, Plus,
  CheckCircle2, XCircle, ChevronDown, Search, User,
  MessageSquare, Video, Building2, Trash2, AlertTriangle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from '../components/Modal';

const MEETING_TIPOS = [
  "BATERIA ULTRA","Comercial","CPO","CPO DE SELLADO DE TECHO",
  "Diseño","Entrega de materiales","ENTREVISTA","Inactivo",
  "Inspección","Instalacion","LLAMADA DE SEGUIMIENTO","NO CITAS",
  "No disponible","Orientacion","Presencial","Promoción - Publicidad",
  "Reunión","Seguimiento","Sick","Vacaciones",
  "Visita de Servicio","Visita Tecnica","VIVIENDA"
];

const MEETING_LUGARES = ["Oficina","Ubicación del cliente","En línea"];
const MEETING_STATUSES = ["Pendiente","Completado","Cancelado"];

export function Meetings() {
  const { meetings, leads, addMeeting, updateMeeting, deleteMeeting, loading } = useStore();
  const [filter, setFilter] = useState('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredMeetings = useMemo(() => {
    let list = [...meetings];
    if (filter !== 'Todos') list = list.filter(m => m.Estado === filter);
    return list.sort((a, b) => new Date(a['Fecha Inicio'] || a['Fecha Meeting']) - new Date(b['Fecha Inicio'] || b['Fecha Meeting']));
  }, [meetings, filter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Meetings</h2>
          <p className="text-slate-400 font-medium">Gestiona tus citas, visitas y seguimientos</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nuevo Meeting
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-xl w-fit">
        {['Todos','Pendiente','Completado','Cancelado'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all",
              filter === tab ? "bg-slate-800 text-primary shadow-sm" : "text-slate-500 hover:text-slate-300"
            )}>
            {tab}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="card py-12 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h4 className="text-white font-bold">No hay meetings</h4>
            <p className="text-slate-500 text-sm mt-1">Cambia los filtros o agrega uno nuevo.</p>
          </div>
        ) : filteredMeetings.map(meeting => (
          <MeetingCard key={meeting._row} meeting={meeting}
            onComplete={(notes) => updateMeeting(meeting._row, { estado: 'Completado', notas: notes })}
            onCancel={() => updateMeeting(meeting._row, { estado: 'Cancelado' })}
            onEdit={() => setSelectedMeeting(meeting)}
          />
        ))}
      </div>

      {isAddModalOpen && (
        <MeetingFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
          leads={leads} onSubmit={addMeeting} title="Nuevo Meeting" />
      )}

      {selectedMeeting && (
        <MeetingFormModal isOpen={!!selectedMeeting} onClose={() => setSelectedMeeting(null)}
          leads={leads}
          initialData={selectedMeeting}
          onSubmit={(data) => updateMeeting(selectedMeeting._row, data)}
          title={`Editar: ${selectedMeeting.Título || selectedMeeting.Nombre}`}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
          title="Eliminar Meeting"
          footer={
            <>
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost">Cancelar</button>
              <button onClick={async () => { await deleteMeeting(deleteConfirm._row); setDeleteConfirm(null); }}
                className="btn bg-red-500 hover:bg-red-600 text-white">
                Sí, eliminar
              </button>
            </>
          }
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-slate-300">¿Eliminar el meeting de <strong className="text-white">{deleteConfirm.Título || deleteConfirm.Nombre}</strong>?</p>
            <p className="text-slate-500 text-sm mt-1">Esta acción no se puede deshacer.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// MEETING CARD
// ============================================================
function MeetingCard({ meeting, onComplete, onCancel, onEdit, onDelete }) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [notes, setNotes] = useState(meeting.Notas || '');
  const isPending = meeting.Estado === 'Pendiente';

  const rawDate = meeting['Fecha Inicio'] || meeting['Fecha Meeting'];
  let dateDisplay = { day: '—', month: '', year: '' };
  let todayBadge = false;

  try {
    if (rawDate) {
      const d = typeof rawDate === 'string' ? parseISO(rawDate) : rawDate;
      dateDisplay = {
        day: format(d, 'dd'),
        month: format(d, 'MMM', { locale: es }).toUpperCase(),
        year: format(d, 'yyyy'),
      };
      todayBadge = isToday(d);
    }
  } catch (e) {}

  const lugarIcon = {
    'Oficina': <Building2 className="w-3.5 h-3.5" />,
    'Ubicación del cliente': <MapPin className="w-3.5 h-3.5" />,
    'En línea': <Video className="w-3.5 h-3.5" />,
  }[meeting['Lugar de Reunión']] || <MapPin className="w-3.5 h-3.5" />;

  return (
    <div className={cn("card flex flex-col md:flex-row gap-6 hover:border-slate-700 transition-colors cursor-pointer",
      meeting.Estado === 'Completado' && "opacity-70")} onClick={isPending ? onEdit : undefined}>
      
      {/* Date Block */}
      <div className="flex flex-row md:flex-col items-center justify-center bg-slate-800/50 rounded-2xl p-4 min-w-[80px] border border-border/50 shrink-0">
        <span className="text-2xl font-black text-white leading-none">{dateDisplay.day}</span>
        <span className="text-[10px] font-bold text-primary mt-1">{dateDisplay.month}</span>
        <span className="text-[10px] text-slate-500 mt-0.5">{dateDisplay.year}</span>
      </div>

      <div className="flex-1 space-y-3">
        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="badge bg-slate-800 text-slate-300 border border-border text-[10px] font-bold">
                {meeting.Tipo}
              </span>
              {todayBadge && (
                <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse">Hoy</span>
              )}
              {meeting['Evento Confirmado'] === 'SI' && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md">✓ Confirmado</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">
              {meeting['Título'] || meeting.Nombre}
            </h3>
            {meeting['Título'] && meeting.Nombre && (
              <p className="text-sm text-slate-400">{meeting.Nombre}</p>
            )}
          </div>
          <span className={cn("badge shrink-0", getStatusStyles(meeting.Estado))}>{meeting.Estado}</span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6">
          {(meeting['Hora Inicio'] || meeting['Hora Fin']) && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-300">
                {meeting['Hora Inicio']}{meeting['Hora Fin'] ? ` — ${meeting['Hora Fin']}` : ''}
              </span>
            </div>
          )}
          {meeting['Lugar de Reunión'] && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {lugarIcon}
              <span>{meeting['Lugar de Reunión']}</span>
              {meeting['Ubicación'] && <span className="text-slate-600">· {meeting['Ubicación']}</span>}
            </div>
          )}
          {meeting['Teléfono'] && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-slate-600" />
              <span>{meeting['Teléfono']}</span>
            </div>
          )}
          {meeting.Notas && (
            <div className="flex items-center gap-2 text-sm text-slate-400 md:col-span-3">
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <span className="italic truncate">{meeting.Notas}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex flex-row md:flex-col justify-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => setShowCompleteModal(true)}
            className="btn bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 p-3 rounded-2xl" title="Completar">
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button onClick={onCancel}
            className="btn bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 p-3 rounded-2xl" title="Cancelar">
            <XCircle className="w-5 h-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="btn bg-slate-700/40 text-slate-500 hover:bg-red-500/20 hover:text-red-400 border border-border p-3 rounded-2xl" title="Eliminar">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
      {!isPending && (
        <div className="flex flex-row md:flex-col justify-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="btn bg-slate-700/40 text-slate-500 hover:bg-red-500/20 hover:text-red-400 border border-border p-3 rounded-2xl" title="Eliminar">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {showCompleteModal && (
        <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)}
          title="Completar Meeting"
          footer={<button onClick={() => { onComplete(notes); setShowCompleteModal(false); }} className="btn btn-primary w-full">Marcar como Completado</button>}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Agrega notas finales sobre esta reunión:</p>
            <textarea className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white h-32 outline-none"
              placeholder="Ej: Cliente interesado, enviar propuesta..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// MEETING FORM MODAL (Add + Edit)
// ============================================================
function MeetingFormModal({ isOpen, onClose, leads, onSubmit, title, initialData }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [formData, setFormData] = useState({
    titulo: initialData?.['Título'] || '',
    nombre: initialData?.Nombre || '',
    telefono: initialData?.['Teléfono'] || '',
    lugarReunion: initialData?.['Lugar de Reunión'] || 'Ubicación del cliente',
    ubicacion: initialData?.['Ubicación'] || '',
    todoElDia: initialData?.['Todo el Día'] || 'NO',
    fechaInicio: initialData?.['Fecha Inicio'] ? initialData['Fecha Inicio'].split('T')[0] : today,
    horaInicio: initialData?.['Hora Inicio'] || '10:00',
    fechaFin: initialData?.['Fecha Fin'] ? initialData['Fecha Fin'].split('T')[0] : today,
    horaFin: initialData?.['Hora Fin'] || '12:00',
    tipo: initialData?.Tipo || 'CPO',
    estado: initialData?.Estado || 'Pendiente',
    eventoConfirmado: initialData?.['Evento Confirmado'] || 'NO',
    notas: initialData?.Notas || '',
    leadRow: initialData?.['Lead Row'] || '',
  });
  const [leadSearch, setLeadSearch] = useState('');

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const filteredLeads = useMemo(() => {
    if (!leadSearch) return [];
    return leads.filter(l => l.Nombre?.toLowerCase().includes(leadSearch.toLowerCase())).slice(0, 5);
  }, [leads, leadSearch]);

  const selectLead = (l) => {
    setFormData(p => ({ ...p, nombre: l.Nombre, telefono: l['Teléfono'] || '', leadRow: l._row }));
    setLeadSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}
      footer={<button onClick={handleSubmit} className="btn btn-primary w-full">Guardar Meeting</button>}
    >
      <div className="space-y-5">
        {/* Title */}
        <InputGroup label="Título *" value={formData.titulo} onChange={v => set('titulo', v)} placeholder="Ej: Visita a casa del cliente" />

        {/* Lead search */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Lead Asociado (opcional)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Buscar lead..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} />
            {filteredLeads.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-2xl z-10 divide-y divide-border">
                {filteredLeads.map(l => (
                  <button key={l._row} className="w-full text-left p-3 hover:bg-slate-800 flex items-center justify-between"
                    onClick={() => selectLead(l)}>
                    <div>
                      <p className="text-sm font-bold text-white">{l.Nombre}</p>
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
          <InputGroup label="Nombre" value={formData.nombre} onChange={v => set('nombre', v)} />
          <InputGroup label="Teléfono" value={formData.telefono} onChange={v => set('telefono', v)} />
        </div>

        {/* Lugar + Tipo */}
        <div className="grid grid-cols-2 gap-4">
          <SelectGroup label="Lugar de Reunión" value={formData.lugarReunion} options={MEETING_LUGARES} onChange={v => set('lugarReunion', v)} />
          <SelectGroup label="Tipo *" value={formData.tipo} options={MEETING_TIPOS} onChange={v => set('tipo', v)} />
        </div>

        <InputGroup label="Ubicación específica" value={formData.ubicacion} placeholder="Dirección o link de videollamada" onChange={v => set('ubicacion', v)} />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Fecha Inicio" type="date" value={formData.fechaInicio} onChange={v => set('fechaInicio', v)} />
          <InputGroup label="Hora Inicio" type="time" value={formData.horaInicio} onChange={v => set('horaInicio', v)} />
          <InputGroup label="Fecha Fin" type="date" value={formData.fechaFin} onChange={v => set('fechaFin', v)} />
          <InputGroup label="Hora Fin" type="time" value={formData.horaFin} onChange={v => set('horaFin', v)} />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <ToggleField label="Evento Confirmado" value={formData.eventoConfirmado === 'SI'} onChange={v => set('eventoConfirmado', v ? 'SI' : 'NO')} />
          <ToggleField label="Todo el Día" value={formData.todoElDia === 'SI'} onChange={v => set('todoElDia', v ? 'SI' : 'NO')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectGroup label="Estado" value={formData.estado} options={MEETING_STATUSES} onChange={v => set('estado', v)} />
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Notas</label>
          <textarea className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white outline-none h-20"
            value={formData.notas} onChange={(e) => set('notas', e.target.value)}
            placeholder="Detalles adicionales..." />
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// UI HELPERS
// ============================================================
function InputGroup({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none"
        value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectGroup({ label, value, options, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <div className="relative">
        <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-primary/20"
          value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seleccionar...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-800/40 border border-border rounded-xl px-4 py-3">
      <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={cn("relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none",
          value ? "bg-primary" : "bg-slate-700")}>
        <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
          value ? "translate-x-6" : "translate-x-0")} />
      </button>
    </div>
  );
}

function getStatusStyles(status) {
  switch (status) {
    case 'Pendiente':  return 'bg-primary/10 text-primary';
    case 'Completado': return 'bg-emerald-500/10 text-emerald-500';
    case 'Cancelado':  return 'bg-slate-500/10 text-slate-500';
    default: return 'bg-slate-400/10 text-slate-400';
  }
}
