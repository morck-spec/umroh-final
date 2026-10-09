import { getPackages } from '@/app/dashboard/shared/actions/packages';
import PackageClient from '@/components/dashboard/PackageClient';
import { Package } from 'lucide-react';

export const metadata = {
  title: 'Paket Umroh | Trecer',
};

export default async function AdminPackagesPage() {
  const packages = await getPackages();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Paket Umroh
          </h1>
          <p className="mt-1 text-sm text-slate-500">Kelola master data paket umroh dan jadwal keberangkatan</p>
        </div>
      </div>

      <div className="card">
        <PackageClient initialPackages={packages} role="admin" />
      </div>
    </div>
  );
}
