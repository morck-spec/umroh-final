import { getJamaah, getBranches } from '@/app/dashboard/shared/actions/jamaah';
import JamaahClient from '@/components/dashboard/JamaahClient';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Data Jamaah | Trecer',
};

export default async function SuperAdminJamaahPage() {
  const jamaah = await getJamaah();
  const branches = await getBranches();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Data Jamaah Pusat & Cabang
          </h1>
          <p className="mt-1 text-sm text-slate-500">Kelola master data seluruh jamaah terdaftar</p>
        </div>
      </div>

      <div className="card">
        <JamaahClient initialJamaah={jamaah} branches={branches} role="super_admin" />
      </div>
    </div>
  );
}
