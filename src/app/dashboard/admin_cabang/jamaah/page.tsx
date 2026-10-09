import { getJamaah } from '@/app/dashboard/shared/actions/jamaah';
import JamaahClient from '@/components/dashboard/JamaahClient';
import { Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Data Jamaah Cabang | Trecer',
};

export default async function AdminCabangJamaahPage() {
  const jamaah = await getJamaah();

  // Get current admin cabang branch_id
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let currentBranchId = undefined;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('branch_id').eq('id', user.id).single();
    currentBranchId = profile?.branch_id;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Data Jamaah Cabang
          </h1>
          <p className="mt-1 text-sm text-slate-500">Kelola master data jamaah pada cabang Anda</p>
        </div>
      </div>

      <div className="card">
        <JamaahClient initialJamaah={jamaah} branches={[]} role="admin_cabang" currentBranchId={currentBranchId} />
      </div>
    </div>
  );
}
