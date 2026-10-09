import { getUsers } from '@/app/dashboard/shared/actions/users';
import { getBranches } from '@/app/dashboard/shared/actions/jamaah';
import UsersClient from '@/components/dashboard/UsersClient';
import { Settings } from 'lucide-react';

export const metadata = {
  title: 'Manajemen Pengguna | Trecer',
};

export default async function UsersPage() {
  const users = await getUsers();
  const branches = await getBranches();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            Manajemen Hak Akses Pengguna
          </h1>
          <p className="mt-1 text-sm text-slate-500">Ubah peran pengguna menjadi Admin Pusat atau Admin Cabang</p>
        </div>
      </div>

      <div className="card">
        <UsersClient initialUsers={users} branches={branches} />
      </div>
    </div>
  );
}
