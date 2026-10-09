import { getBranches } from './actions';
import BranchClient from './BranchClient';
import { Briefcase } from 'lucide-react';

export const metadata = {
  title: 'Data Cabang | Trecer',
};

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Data Cabang
          </h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data cabang operasional travel umroh</p>
        </div>
      </div>

      <div className="card">
        <BranchClient initialBranches={branches} />
      </div>
    </div>
  );
}
