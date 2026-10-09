import { createClient } from '@/utils/supabase/server';
import { Users, Package, ClipboardList, DollarSign } from 'lucide-react';

export const metadata = { title: 'Dashboard Admin | Trecer' };

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Dashboard Widget Logic (Phase 9)
  const { count: jamaahCount } = await supabase.from('jamaah').select('*', { count: 'exact', head: true });
  const { count: packageCount } = await supabase.from('packages').select('*', { count: 'exact', head: true });
  const { count: regCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true });

  const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'paid');
  const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Operasional Pusat</h1>
      </div>

      {/* Phase 9: Laporan & Activity Log Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 flex items-center gap-4 border-l-4 border-blue-500">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Jamaah</p>
            <p className="text-2xl font-bold text-slate-900">{jamaahCount || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Pendaftaran</p>
            <p className="text-2xl font-bold text-slate-900">{regCount || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-amber-500">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Paket Aktif</p>
            <p className="text-2xl font-bold text-slate-900">{packageCount || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-purple-500">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Pendapatan</p>
            <p className="text-xl font-bold text-slate-900">Rp {(totalRevenue / 1000000).toFixed(1)}M</p>
          </div>
        </div>
      </div>
    </div>
  );
}
