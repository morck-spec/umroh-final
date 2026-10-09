import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import { getJamaah } from '@/app/dashboard/shared/actions/jamaah';
import { getPackages } from '@/app/dashboard/shared/actions/packages';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';
import { ClipboardList } from 'lucide-react';

export const metadata = { title: 'Pendaftaran Cabang | Trecer' };

export default async function AdminCabangRegistrationsPage() {
  const registrations = await getRegistrations();
  const jamaah = await getJamaah();
  const packages = await getPackages();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="w-6 h-6 text-emerald-600" /> Pendaftaran Jamaah Cabang</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola operasional pendaftaran jamaah pada cabang Anda</p>
        </div>
      </div>
      <div className="card"><RegistrationsClient initialRegistrations={registrations} jamaahList={jamaah} packagesList={packages} role="admin_cabang" /></div>
    </div>
  );
}
