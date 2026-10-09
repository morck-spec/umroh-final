import { getGuides } from '@/app/dashboard/shared/actions/guides';
import GuidesClient from '@/components/dashboard/GuidesClient';
import { UserPlus } from 'lucide-react';

export const metadata = { title: 'Pembimbing Umroh | Trecer' };

export default async function AdminGuidesPage() {
  const guides = await getGuides();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserPlus className="w-6 h-6 text-emerald-600" /> Data Pembimbing</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola master data muthawif dan pembimbing ibadah</p>
        </div>
      </div>
      <div className="card"><GuidesClient initialGuides={guides} role="admin" /></div>
    </div>
  );
}
