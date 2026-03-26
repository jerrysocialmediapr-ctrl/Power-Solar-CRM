import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Mail, 
  Filter, 
  ChevronDown, 
  MoreHorizontal,
  ExternalLink,
  Smartphone,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from '../components/Modal';

const LEAD_STATUS_OPTIONS = [
  "Vendido", "No vendido", "No pasó crédito", "No le interesa", "No contesta", "Debe consultarlo con un familiar"
];

const ORIGIN_OPTIONS = [
  "Google Ads", "Facebook Ads", "Instagram Ads", "Referido", "EcoFlow PR Website", "Página Principal", "Orgánico", "Otro"
];

export function Leads() {
  const { leads, updateLead, addLead, syncGoogleAds, sendBlast, loading } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [originFilter, setOriginFilter] = useState('Todos');
  
  // Modals state
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);

  // Filtering logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = [
        lead.Nombre, lead.Pueblo, lead.Email, lead['Teléfono']
      ].some(val => String(val || '').toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus = statusFilter === 'Todos' || lead['Estado Lead'] === statusFilter;
      const matchesOrigin = originFilter === 'Todos' || lead['Origen del Lead'] === originFilter;

      return matchesSearch && matchesStatus && matchesOrigin;
    });
  }, [leads, search, statusFilter, originFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Leads</h2>
          <p className="text-slate-400 font-medium">{filteredLeads.length} contactos encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBlastModalOpen(true)}
            className="btn btn-secondary gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Blast
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Lead
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar por nombre, pueblo, email..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select 
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos los Estados</option>
            {LEAD_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select 
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-300"
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
          >
            <option value="Todos">Todos los Orígenes</option>
            {ORIGIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
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
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead._row} 
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-primary transition-colors">{lead.Nombre}</span>
                      <span className="text-xs text-slate-500">{lead.Email || lead['Teléfono']}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {lead.Pueblo}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200 font-medium">
                    {lead['Factura Mensual']}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("badge", getStatusBadgeStyles(lead['Estado Lead']))}>
                      {lead['Estado Lead'] || 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-border">
                      {lead['Origen del Lead']}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {format(new Date(lead.Fecha), 'd MMM', { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-all">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedLead && (
        <EditLeadModal 
          lead={selectedLead} 
          isOpen={!!selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={updateLead}
          onSync={syncGoogleAds}
        />
      )}

      {isAddModalOpen && (
        <AddLeadModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={addLead}
        />
      )}

      {isBlastModalOpen && (
        <EmailBlastModal 
          isOpen={isBlastModalOpen} 
          onClose={() => setIsBlastModalOpen(false)} 
          leads={filteredLeads}
          onSend={sendBlast}
        />
      )}
    </div>
  );
}

// Sub-components: Modals
function EditLeadModal({ lead, isOpen, onClose, onUpdate, onSync }) {
  const [formData, setFormData] = useState({ ...lead });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(lead._row, formData);
    onClose();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onSync(lead._row);
    setIsSyncing(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Editar: ${lead.Nombre}`}
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          <button onClick={handleSubmit} className="btn btn-primary">Guardar Cambios</button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Nombre" value={formData.Nombre} onChange={v => setFormData({...formData, Nombre: v})} />
          <InputGroup label="Teléfono" value={formData['Teléfono']} onChange={v => setFormData({...formData, 'Teléfono': v})} />
          <InputGroup label="Email" value={formData.Email} onChange={v => setFormData({...formData, Email: v})} />
          <InputGroup label="Pueblo" value={formData.Pueblo} onChange={v => setFormData({...formData, Pueblo: v})} />
          <InputGroup label="Factura Mensual" value={formData['Factura Mensual']} onChange={v => setFormData({...formData, 'Factura Mensual': v})} />
          <SelectGroup 
            label="Estado Lead" 
            value={formData['Estado Lead']} 
            options={LEAD_STATUS_OPTIONS} 
            onChange={v => setFormData({...formData, 'Estado Lead': v})} 
          />
          <SelectGroup 
            label="Origen" 
            value={formData['Origen del Lead']} 
            options={ORIGIN_OPTIONS} 
            onChange={v => setFormData({...formData, 'Origen del Lead': v})} 
          />
          <InputGroup label="Valor Venta" value={formData['Valor Venta']} onChange={v => setFormData({...formData, 'Valor Venta': v})} />
          <InputGroup label="Campaña" value={formData.Campaign} onChange={v => setFormData({...formData, Campaign: v})} />
        </div>

        <div className="bg-slate-800/40 p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-white text-sm">Google Ads Tracking</h4>
              <p className="text-xs text-slate-500 mt-0.5">Sincronización de conversiones</p>
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={cn(
                "btn bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-2 py-1.5",
                isSyncing && "opacity-50 animate-pulse"
              )}
            >
              {isSyncing ? "Syncing..." : "Sync Google Ads"}
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Sync Status:</span>
              <span className="text-slate-300 font-mono">{lead['Google Ads Sync'] || 'No sincronizado'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">GCLID:</span>
              <span className="text-slate-300 truncate max-w-[200px] font-mono">{lead.GCLID || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AddLeadModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', email: '', pueblo: '', factura: '',
    origen: '', estado: '', valor: '', campaign: '', gclid: ''
  });

  const handleInputChange = (field, value) => {
    let newOrigin = formData.origen;
    let detectedGclid = formData.gclid;

    if (field === 'gclid' || (field === 'telefono' && value.includes('gclid='))) {
      // Logic for gclid extraction / detection
      if (value.includes('gclid=')) {
        detectedGclid = value.split('gclid=')[1].split('&')[0];
        newOrigin = 'Google Ads';
      } else if (value.length > 20) {
        newOrigin = 'Google Ads';
        detectedGclid = value;
      }
    }

    setFormData({ ...formData, [field]: value, origen: newOrigin, gclid: detectedGclid });
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
      title="Nuevo Lead Manual"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          <button onClick={handleSubmit} className="btn btn-primary">Crear Lead</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Nombre" value={formData.nombre} onChange={v => handleInputChange('nombre', v)} />
        <InputGroup label="Teléfono" value={formData.telefono} placeholder="Pega aquí si trae GCLID" onChange={v => handleInputChange('telefono', v)} />
        <InputGroup label="Email" value={formData.email} onChange={v => handleInputChange('email', v)} />
        <InputGroup label="Pueblo" value={formData.pueblo} onChange={v => handleInputChange('pueblo', v)} />
        <InputGroup label="Factura Mensual" value={formData.factura} onChange={v => handleInputChange('factura', v)} />
        <SelectGroup label="Origen" value={formData.origen} options={ORIGIN_OPTIONS} onChange={v => handleInputChange('origen', v)} />
        <SelectGroup label="Estado" value={formData.estado} options={LEAD_STATUS_OPTIONS} onChange={v => handleInputChange('estado', v)} />
        <InputGroup label="Valor Venta" value={formData.valor} onChange={v => handleInputChange('valor', v)} />
        <div className="col-span-2">
          <InputGroup label="GCLID / Token de Tracking" value={formData.gclid} onChange={v => handleInputChange('gclid', v)} />
        </div>
      </div>
    </Modal>
  );
}

function EmailBlastModal({ isOpen, onClose, leads, onSend }) {
  const [selectedRows, setSelectedRows] = useState(leads.map(l => l._row));
  const [tipo, setTipo] = useState('leasing');
  const [subject, setSubject] = useState('Oferta especial para ti');
  const [result, setResult] = useState(null);

  const toggleLead = (row) => {
    setSelectedRows(prev => prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row]);
  };

  const handleSend = async () => {
    const res = await onSend(tipo, subject, selectedRows);
    setResult(res);
  };

  if (result) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Resultado de Envío">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">¡Blast Enviado!</h4>
          <p className="text-slate-400">Se enviaron {result.sent} correos correctamente.</p>
          {result.errors.length > 0 && (
            <div className="mt-4 p-4 bg-danger/10 text-danger rounded-xl text-xs text-left overflow-y-auto max-h-32">
              <p className="font-bold mb-1">Errores:</p>
              {result.errors.map((err, i) => <div key={i}>Fila {err.row}: {err.error}</div>)}
            </div>
          )}
          <button onClick={onClose} className="btn btn-primary mt-8 w-full">Entendido</button>
        </div>
      </Modal>
    );
  }

  const leadsWithEmail = leads.filter(l => selectedRows.includes(l._row) && l.Email && l.Email.includes('@'));

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Configurar Email Blast"
      footer={
        <button onClick={handleSend} disabled={leadsWithEmail.length === 0} className="btn btn-primary w-full">
          Enviar Blast a {leadsWithEmail.length} contactos
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <button 
            onClick={() => setTipo('leasing')}
            className={cn("flex-1 p-4 rounded-xl border transition-all text-left", tipo === 'leasing' ? "border-primary bg-primary/10" : "border-border bg-slate-800/40 hover:bg-slate-800")}
          >
            <p className={cn("text-xs font-bold leading-none mb-1", tipo === 'leasing' ? "text-primary" : "text-slate-500")}>PLAN A</p>
            <h4 className="font-bold text-white">Leasing Solar</h4>
            <p className="text-xs text-slate-400 mt-1">Desde $176/mes</p>
          </button>
          <button 
            onClick={() => setTipo('expansion')}
            className={cn("flex-1 p-4 rounded-xl border transition-all text-left", tipo === 'expansion' ? "border-primary bg-primary/10" : "border-border bg-slate-800/40 hover:bg-slate-800")}
          >
            <p className={cn("text-xs font-bold leading-none mb-1", tipo === 'expansion' ? "text-primary" : "text-slate-500")}>PLAN B</p>
            <h4 className="font-bold text-white">Expansión Solar</h4>
            <p className="text-xs text-slate-400 mt-1">Desde $86/mes</p>
          </button>
        </div>

        <InputGroup 
          label="Asunto del Correo" 
          value={subject} 
          onChange={setSubject} 
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-sm font-bold text-white">Seleccionar Contactos</h4>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase font-bold">Filtrados</span>
          </div>
          <div className="bg-slate-800/40 border border-border rounded-xl max-h-48 overflow-y-auto divide-y divide-border">
            {leads.map(l => (
              <div key={l._row} className="flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedRows.includes(l._row)}
                  onChange={() => toggleLead(l._row)}
                  className="w-4 h-4 rounded border-slate-700 bg-background text-primary focus:ring-primary/20"
                />
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

// Helpers components
function InputGroup({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase px-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        value={value || ''}
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
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
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
    default: return 'bg-slate-400/10 text-slate-400';
  }
}
