import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  PhoneOff, 
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatCardSkeleton, ProgressBarSkeleton } from '../components/Skeleton';

export function Dashboard() {
  const { leads, autoMark, loading } = useStore();
  const navigate = useNavigate();

  if (loading && leads.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center text-white">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-slate-400">Cargando métricas...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  const status = (l) => String(l.Estado || l['Estado Lead'] || 'Pendiente');
  const totalLeads = leads.length;
  const vendidos = leads.filter(l => status(l) === 'Vendido');
  const totalVendido = vendidos.length;
  const conversionRate = totalLeads > 0 ? (totalVendido / totalLeads) * 100 : 0;
  
  const revenue = vendidos.reduce((acc, l) => {
    const val = parseFloat(String(l['Factura Mensual'] || '0').replace(/[^0-9.]/g, ''));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const noContesta = leads.filter(l => status(l) === 'No contesta').length;

  // Chart data
  const statusCounts = leads.reduce((acc, l) => {
    const s = status(l);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const originCounts = leads.reduce((acc, l) => {
    const origin = String(l['Origen del Lead'] || 'Otro');
    acc[origin] = (acc[origin] || 0) + 1;
    return acc;
  }, {});

  const recentLeads = [...leads]
    .filter(l => l['Fecha Creación'] || l.Fecha)
    .sort((a, b) => new Date(b['Fecha Creación'] || b.Fecha) - new Date(a['Fecha Creación'] || a.Fecha))
    .slice(0, 8);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1 font-medium">Bienvenido al CRM de Power Solar</p>
        </div>
        <button
          onClick={autoMark}
          disabled={loading}
          className="btn btn-primary gap-2"
        >
          <Clock className="w-4 h-4" />
          Auto-marcar No Contesta
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Leads" 
          value={totalLeads} 
          icon={Users} 
          color="text-blue-500" 
          bg="bg-blue-500/10"
        />
        <StatCard 
          label="Ventas Cerradas" 
          value={totalVendido} 
          subValue={`${conversionRate.toFixed(1)}% conversión`}
          icon={TrendingUp} 
          color="text-emerald-500" 
          bg="bg-emerald-500/10"
        />
        <StatCard 
          label="Ventas Totales" 
          value={`$${revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="text-amber-500" 
          bg="bg-amber-500/10"
        />
        <StatCard 
          label="No Contestan" 
          value={noContesta} 
          icon={PhoneOff} 
          color="text-slate-500" 
          bg="bg-slate-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-6">Estado del Pipeline</h3>
          <div className="space-y-4">
            {Object.entries(statusCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <ProgressBar 
                  key={String(status)} 
                  label={String(status)} 
                  count={String(count)} 
                  total={totalLeads} 
                  color={getStatusColor(status)}
                />
              ))}
          </div>
        </div>

        {/* Origin Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-6">Origen de Leads</h3>
          <div className="space-y-4">
            {Object.entries(originCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([origin, count]) => (
                <ProgressBar 
                  key={String(origin)} 
                  label={String(origin)} 
                  count={String(count)} 
                  total={totalLeads} 
                  color="bg-primary"
                />
              ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Actividad Reciente</h3>
          <button onClick={() => navigate('/leads')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            Ver todos <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-4 text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Nombre</th>
                <th className="pb-4 text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Pueblo</th>
                <th className="pb-4 text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Estado</th>
                <th className="pb-4 text-sm font-bold text-slate-400 uppercase tracking-wider px-2 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <tr key={String(lead._row)} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 font-bold text-slate-200 px-2 truncate max-w-[150px]">{String(lead.Nombre || '')}</td>
                  <td className="py-4 text-slate-400 px-2 text-sm">{String(lead.Pueblo || '—')}</td>
                  <td className="py-4 px-2">
                    <span className={cn("badge text-[10px]", getStatusBadgeStyles(status(lead)))}>
                      {status(lead)}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400 text-xs px-2 text-right">
                    {(() => {
                      try {
                        const d = lead['Fecha Creación'] ? new Date(lead['Fecha Creación']) : null;
                        return d && !isNaN(d.getTime()) ? format(d, 'd MMM, p', { locale: es }) : '—';
                      } catch (e) {
                        return '—';
                      }
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color, bg }) {
  return (
    <div className="card flex items-start justify-between group hover:border-primary/50 transition-colors duration-300">
      <div>
        <p className="text-sm font-bold text-slate-400 mb-1">{String(label || '')}</p>
        <h4 className="text-2xl font-bold text-white">{String(value || '')}</h4>
        {subValue && <p className="text-xs text-emerald-500 font-bold mt-1">{String(subValue || '')}</p>}
      </div>
      <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
    </div>
  );
}

function ProgressBar({ label, count, total, color }) {
  const percentage = total > 0 ? (Number(count) / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-slate-300 truncate max-w-[200px]">{String(label || '')}</span>
        <span className="text-slate-500">{String(count || '')}</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getStatusColor(s) {
  switch (s) {
    case 'Vendido': return 'bg-emerald-500';
    case 'No vendido': return 'bg-red-500';
    case 'No pasó crédito': return 'bg-amber-500';
    case 'Debe consultarlo con un familiar': return 'bg-purple-500';
    case 'No le interesa':
    case 'No contesta': return 'bg-slate-500';
    default: return 'bg-slate-400';
  }
}

function getStatusBadgeStyles(s) {
  switch (s) {
    case 'Vendido': return 'bg-emerald-500/10 text-emerald-500';
    case 'No vendido': return 'bg-red-500/10 text-red-500';
    case 'No pasó crédito': return 'bg-amber-500/10 text-amber-500';
    case 'Debe consultarlo con un familiar': return 'bg-purple-500/10 text-purple-500';
    case 'No le interesa':
    case 'No contesta': return 'bg-slate-500/10 text-slate-500';
    default: return 'bg-slate-400/10 text-slate-400';
  }
}
