import { createClient } from '@/utils/supabase/server';
import { Users, ClipboardList } from 'lucide-react';

export const metadata = { title: 'Dashboard Cabang | Trecer' };

export default async function AdminCabangDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let branchId = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('branch_id').eq('id', user.id).single();
    branchId = profile?.branch_id;
  }

  let jamaahCount = 0;
  let regCount = 0;

  if (branchId) {
    const { count: jc } = await supabase.from('jamaah').select('*', { count: 'exact', head: true }).eq('branch_id', branchId);
    jamaahCount = jc || 0;

    // We can't easily count registrations by branch natively without a view, but we can do a quick nested fetch for now or rely on RLS!
    // Since we are using Service Role or authenticated client? We are using authenticated client (`await createClient()`).
    // SO RLS ALREADY FILTERS IT!
    const { count: rc } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
    regCount = rc || 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Cabang</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6 flex items-center gap-4 border-l-4 border-blue-500">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Jamaah Cabang</p>
            <p className="text-2xl font-bold text-slate-900">{jamaahCount}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pendaftaran Cabang</p>
            <p className="text-2xl font-bold text-slate-900">{regCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
