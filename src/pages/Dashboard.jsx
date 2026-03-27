import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  PhoneOff, 
  Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { StatCardSkeleton } from '../components/Skeleton';

export function Dashboard() {
  const { leads, autoMark, loading } = useStore();

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
