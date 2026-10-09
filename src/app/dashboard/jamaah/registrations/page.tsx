import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';
import { ClipboardList } from 'lucide-react';

export const metadata = { title: 'Pendaftaran Saya | Trecer' };

export default async function JamaahRegistrationsPage() {
  const registrations = await getRegistrations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="w-6 h-6 text-emerald-600" /> Pendaftaran Umroh Saya</h1>
          <p className="mt-1 text-sm text-slate-500">Lihat riwayat dan status keberangkatan paket umroh Anda</p>
        </div>
      </div>
      <div className="card"><RegistrationsClient initialRegistrations={registrations} jamaahList={[]} packagesList={[]} role="jamaah" /></div>
    </div>
  );
}
