import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Mail, Filter, ChevronDown, Trash2,
  MapPin, UserCheck, AlertTriangle, CheckCircle2, DollarSign
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from '../components/Modal';
import {
  PR_MUNICIPIOS, LEAD_STATUS_OPTIONS, ORIGIN_OPTIONS,
  PRODUCT_TYPES, ECOFLOW_MODELOS, LOAN_TYPES, TRANSFER_SWITCH_OPTIONS,
  ECOFLOW_PRECIOS, TRANSFER_PRECIOS, PANELES_OPCIONES
} from '../lib/constants';
import { NotesManager } from '../components/NotesManager';

export function Leads() {
  const { leads, updateLead, addLead, deleteLead, syncGoogleAds, sendBlast, convertLead, loading } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [originFilter, setOriginFilter] = useState('Todos');
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const [convertLead_, setConvertLead_] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = [lead.Nombre, lead.Pueblo, lead.Email, lead['Teléfono']]
        .some(val => String(val || '').toLowerCase().includes(search.toLowerCase()));
      const s = lead.Estado || lead['Estado Lead'] || '';
      const matchesStatus = statusFilter === 'Todos' || s === statusFilter;
      const matchesOrigin = originFilter === 'Todos' || lead['Origen del Lead'] === originFilter;
      return matchesSearch && matchesStatus && matchesOrigin;
    });
  }, [leads, search, statusFilter, originFilter]);

  const handleDelete = async (lead) => {
    await deleteLead(lead._row);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Leads</h2>
          <p className="text-slate-400 font-medium">{filteredLeads.length} contactos encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsBlastModalOpen(true)} className="btn btn-secondary gap-2">
            <Mail className="w-4 h-4" /> Email Blast
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Nuevo Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Buscar por nombre, pueblo, email..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={['Todos', ...LEAD_STATUS_OPTIONS]} />
        <SelectFilter value={originFilter} onChange={setOriginFilter} options={['Todos', ...ORIGIN_OPTIONS]} />
      </div>

      {/* Leads Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Factura</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Origen</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500">No hay leads que mostrar.</td></tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead._row} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-primary transition-colors">{lead.Nombre}</span>
                      <span className="text-xs text-slate-500">{lead.Email || lead['Teléfono']}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{lead.Pueblo}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200 font-medium">
                    {lead['Factura Mensual'] ? `$${lead['Factura Mensual']}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("badge", getStatusBadgeStyles(lead.Estado || lead['Estado Lead']))}>
                      {lead.Estado || lead['Estado Lead'] || 'Nuevo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-border">
                      {lead['Origen del Lead'] || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {(() => {
                      try {
                        const raw = lead['Fecha Creación'] || lead.Fecha;
                        if (!raw) return '—';
                        const d = new Date(raw);
                        return isNaN(d.getTime()) ? '—' : format(d, 'd MMM', { locale: es });
                      } catch (e) {
                        return '—';
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        title="Convertir a Cliente"
                        onClick={(e) => { e.stopPropagation(); setConvertLead_(lead); }}
                        className="p-2 hover:bg-emerald-500/20 rounded-lg text-slate-500 hover:text-emerald-400 transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        title="Eliminar Lead"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(lead); }}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedLead && (
        <EditLeadModal lead={selectedLead} isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)} onUpdate={updateLead} onSync={syncGoogleAds} />
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addLead} />
      )}

      {/* Email Blast Modal */}
      {isBlastModalOpen && (
        <EmailBlastModal isOpen={isBlastModalOpen} onClose={() => setIsBlastModalOpen(false)}
          leads={filteredLeads} onSend={sendBlast} />
      )}

      {/* Convert to Contact Modal */}
      {convertLead_ && (
        <ConvertToContactModal lead={convertLead_} isOpen={!!convertLead_}
          onClose={() => setConvertLead_(null)} onConvert={convertLead} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar Lead"
          footer={
            <>
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn bg-red-500 hover:bg-red-600 text-white">
                Sí, eliminar
              </button>
            </>
          }
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-slate-300">¿Estás seguro que quieres eliminar a <strong className="text-white">{deleteConfirm.Nombre}</strong>?</p>
            <p className="text-slate-500 text-sm mt-1">Esta acción no se puede deshacer.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// EDIT LEAD MODAL
// ============================================================
function EditLeadModal({ lead, isOpen, onClose, onUpdate, onSync }) {
  const [formData, setFormData] = useState({ ...lead });
  const [isSyncing, setIsSyncing] = useState(false);

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(lead._row, formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${lead.Nombre}`}
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          <button onClick={handleSubmit} className="btn btn-primary">Guardar Cambios</button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Nombre" value={formData.Nombre} onChange={v => set('Nombre', v)} />
          <InputGroup label="Teléfono" value={formData['Teléfono']} onChange={v => set('Teléfono', v)} />
          <InputGroup label="Email" value={formData.Email} onChange={v => set('Email', v)} />
          <SelectGroup label="Pueblo" value={formData.Pueblo} options={PR_MUNICIPIOS} onChange={v => set('Pueblo', v)} />
          <CurrencyInput label="Factura Mensual" value={formData['Factura Mensual']} onChange={v => set('Factura Mensual', v)} />
          <SelectGroup label="Estado Lead" value={formData['Estado Lead']} options={LEAD_STATUS_OPTIONS} onChange={v => set('Estado Lead', v)} />
          <SelectGroup label="Origen" value={formData['Origen del Lead']} options={ORIGIN_OPTIONS} onChange={v => set('Origen del Lead', v)} />
          <InputGroup label="Campaña" value={formData.Campaign} onChange={v => set('Campaign', v)} />
        </div>

        <div className="h-px bg-border" />
        <NotesManager 
          notesRaw={formData.Anotaciones} 
          onUpdate={(val) => set('Anotaciones', val)} 
        />
      </div>
    </Modal>
  );
}

// ============================================================
// ADD LEAD MODAL
// ============================================================
function AddLeadModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', email: '', pueblo: '', factura: '',
    origen: '', estado: '', campaign: '', gclid: ''
  });

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const handleGclidPaste = (val) => {
    if (val.includes('gclid=')) {
      const gclid = val.split('gclid=')[1].split('&')[0];
      setFormData(p => ({ ...p, gclid, origen: 'Google Ads' }));
    } else if (val.length > 20 && !val.includes(' ')) {
      setFormData(p => ({ ...p, gclid: val, origen: 'Google Ads' }));
    } else {
      set('gclid', val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Lead Manual"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          <button onClick={handleSubmit} className="btn btn-primary">Crear Lead</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Nombre *" value={formData.nombre} onChange={v => set('nombre', v)} />
        <InputGroup label="Teléfono" value={formData.telefono} onChange={v => set('telefono', v)} />
        <InputGroup label="Email" value={formData.email} type="email" onChange={v => set('email', v)} />
        <SelectGroup label="Pueblo" value={formData.pueblo} options={PR_MUNICIPIOS} onChange={v => set('pueblo', v)} />
        <CurrencyInput label="Factura Mensual" value={formData.factura} onChange={v => set('factura', v)} />
        <SelectGroup label="Origen" value={formData.origen} options={ORIGIN_OPTIONS} onChange={v => set('origen', v)} />
        <SelectGroup label="Estado" value={formData.estado} options={LEAD_STATUS_OPTIONS} onChange={v => set('estado', v)} />
        <InputGroup label="Campaña" value={formData.campaign} onChange={v => set('campaign', v)} />
        <div className="col-span-2">
          <InputGroup label="GCLID / Token de Tracking" value={formData.gclid}
            placeholder="Pega aquí si trae GCLID para auto-detectar Google Ads"
            onChange={handleGclidPaste} />
          {formData.origen === 'Google Ads' && (
            <p className="text-xs text-emerald-400 mt-1 px-1">✓ Google Ads detectado automáticamente</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// CONVERT TO CONTACT MODAL
// ============================================================
function ConvertToContactModal({ lead, isOpen, onClose, onConvert }) {
  const [formData, setFormData] = useState({
    tipoProducto: '',
    modeloBateria: '',
    loanType: '',
    extraBatteryQty: '',
    transferSwitch: '',
    panelesQty: '',
    panelesWataje: '',
    precioTotal: '',
    notas: '',
  });

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));
  const isEcoFlow = formData.tipoProducto === 'EcoFlow';

  const precioRef = isEcoFlow && formData.modeloBateria ? ECOFLOW_PRECIOS[formData.modeloBateria] : null;
  const transferRef = formData.transferSwitch ? TRANSFER_PRECIOS[formData.transferSwitch] : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onConvert(lead._row, {
      estado: 'Vendido',
      ...formData,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🎉 Convertir a Cliente: ${lead.Nombre}`}
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          <button onClick={handleSubmit} className="btn bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            <UserCheck className="w-4 h-4" /> Confirmar Venta
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Lead Info Summary */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-border text-sm grid grid-cols-2 gap-2">
          <div><span className="text-slate-500">Cliente: </span><span className="text-white font-bold">{lead.Nombre}</span></div>
          <div><span className="text-slate-500">Teléfono: </span><span className="text-slate-300">{lead['Teléfono']}</span></div>
          <div><span className="text-slate-500">Pueblo: </span><span className="text-slate-300">{lead.Pueblo}</span></div>
          <div><span className="text-slate-500">Factura: </span><span className="text-slate-300">${lead['Factura Mensual']}</span></div>
        </div>

        {/* Tipo de Producto */}
        <div className="grid grid-cols-2 gap-4">
          <SelectGroup label="Tipo de Producto *" value={formData.tipoProducto} options={PRODUCT_TYPES} onChange={v => set('tipoProducto', v)} />
          <SelectGroup label="Financiamiento (Loan Type)" value={formData.loanType} options={LOAN_TYPES} onChange={v => set('loanType', v)} />
        </div>

        {/* EcoFlow Fields */}
        {isEcoFlow && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="h-px bg-border" />
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Detalles EcoFlow</h4>

            <div className="grid grid-cols-2 gap-4">
              <SelectGroup label="Modelo de Batería *" value={formData.modeloBateria} options={ECOFLOW_MODELOS} onChange={v => set('modeloBateria', v)} />
              {precioRef && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Precios Referencia</label>
                  <div className="bg-slate-800 rounded-lg px-4 py-2 text-xs space-y-1 border border-border">
                    <div className="flex justify-between"><span className="text-slate-400">Regular:</span><span className="text-white font-bold">${precioRef.regular.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-emerald-400">Cash:</span><span className="text-emerald-400 font-bold">${precioRef.cash.toLocaleString()}</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Extra Battery (cantidad)" value={formData.extraBatteryQty}
                placeholder="Ej: 1, 2..."
                onChange={v => set('extraBatteryQty', v)} />
              <SelectGroup label="Transfer Switch / Smart Panel" value={formData.transferSwitch}
                options={TRANSFER_SWITCH_OPTIONS} onChange={v => set('transferSwitch', v)} />
            </div>

            {transferRef && (
              <div className="bg-slate-800/50 border border-border rounded-lg px-4 py-2 text-xs">
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-400">Precio transfer:</span>
                  <span className="text-white font-bold">${transferRef.cash.toLocaleString()}</span>
                </div>
                <p className="text-slate-500">{transferRef.nota}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Paneles — Cantidad" value={formData.panelesQty}
                placeholder="Ej: 5" onChange={v => set('panelesQty', v)} />
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Tipo de Panel</label>
                <div className="relative">
                  <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.panelesWataje} onChange={e => set('panelesWataje', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {PANELES_OPCIONES.map(p => (
                      <option key={p.nombre} value={p.nombre}>
                        {p.nombre}{p.precio ? ` — $${p.precio}` : p.nota ? ` — ${p.nota}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Precio Total */}
        <div className="h-px bg-border" />
        <CurrencyInput label="Precio Total de la Venta *" value={formData.precioTotal} onChange={v => set('precioTotal', v)} />

        <InputGroup label="Notas adicionales" value={formData.notas}
          placeholder="Observaciones, detalles del cierre, etc." onChange={v => set('notas', v)} />
      </div>
    </Modal>
  );
}

// ============================================================
// EMAIL BLAST MODAL
// ============================================================
function EmailBlastModal({ isOpen, onClose, leads, onSend }) {
  const [selectedRows, setSelectedRows] = useState(leads.map(l => l._row));
  const [tipo, setTipo] = useState('leasing');
  const [subject, setSubject] = useState('Oferta especial para ti');
  const [result, setResult] = useState(null);

  const toggleLead = (row) => setSelectedRows(p => p.includes(row) ? p.filter(r => r !== row) : [...p, row]);
  const handleSend = async () => { const res = await onSend(tipo, subject, selectedRows); setResult(res); };
  const leadsWithEmail = leads.filter(l => selectedRows.includes(l._row) && l.Email?.includes('@'));

  if (result) return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resultado de Envío">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h4 className="text-2xl font-bold text-white mb-2">¡Blast Enviado!</h4>
        <p className="text-slate-400">Se enviaron {result.sent} correos correctamente.</p>
        <button onClick={onClose} className="btn btn-primary mt-8 w-full">Entendido</button>
      </div>
    </Modal>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Email Blast"
      footer={<button onClick={handleSend} disabled={leadsWithEmail.length === 0} className="btn btn-primary w-full">
        Enviar a {leadsWithEmail.length} contactos
      </button>}
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          {[{ key: 'leasing', label: 'Leasing Solar', sub: 'Desde $176/mes' }, { key: 'expansion', label: 'Expansión Solar', sub: 'Desde $86/mes' }].map(opt => (
            <button key={opt.key} onClick={() => setTipo(opt.key)}
              className={cn("flex-1 p-4 rounded-xl border transition-all text-left", tipo === opt.key ? "border-primary bg-primary/10" : "border-border bg-slate-800/40")}>
              <p className={cn("text-xs font-bold mb-1", tipo === opt.key ? "text-primary" : "text-slate-500")}>{opt.key.toUpperCase()}</p>
              <h4 className="font-bold text-white">{opt.label}</h4>
              <p className="text-xs text-slate-400 mt-1">{opt.sub}</p>
            </button>
          ))}
        </div>
        <InputGroup label="Asunto del Correo" value={subject} onChange={setSubject} />
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white px-1">Contactos</h4>
          <div className="bg-slate-800/40 border border-border rounded-xl max-h-48 overflow-y-auto divide-y divide-border">
            {leads.map(l => (
              <div key={l._row} className="flex items-center gap-3 p-3 hover:bg-slate-800">
                <input type="checkbox" checked={selectedRows.includes(l._row)} onChange={() => toggleLead(l._row)}
                  className="w-4 h-4 rounded border-slate-700 bg-background text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{l.Nombre}</p>
                  <p className="text-[10px] text-slate-500 truncate">{l.Email || 'Sin email'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// REUSABLE UI COMPONENTS
// ============================================================
function InputGroup({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function CurrencyInput({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="number" min="0"
          className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none"
          value={value || ''} placeholder="0.00" onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function SelectGroup({ label, value, options, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <div className="relative">
        <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-primary/20"
          value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seleccionar...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

function SelectFilter({ value, onChange, options }) {
  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <select className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20 text-slate-300"
        value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(opt => <option key={opt} value={opt}>{opt === 'Todos' ? (options[0] === 'Todos' ? 'Todos los Estados' : 'Todos') : opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  );
}

function getStatusBadgeStyles(status) {
  switch (status) {
    case 'Vendido': return 'bg-emerald-500/10 text-emerald-500';
    case 'No vendido': return 'bg-red-500/10 text-red-500';
    case 'No pasó crédito': return 'bg-amber-500/10 text-amber-500';
    case 'Debe consultarlo con un familiar': return 'bg-purple-500/10 text-purple-500';
    case 'No le interesa':
    case 'No contesta': return 'bg-slate-500/10 text-slate-500';
    default: return 'bg-blue-500/10 text-blue-400';
  }
}
