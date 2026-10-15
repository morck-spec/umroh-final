import { getBranchesList } from '@/app/dashboard/shared/actions/branches';
import BranchListClient from '@/components/dashboard/BranchListClient';

export const metadata = {
  title: 'Cabang | Travel Umroh & Haji',
};

export default async function BranchesPage() {
  const branches = await getBranchesList();

  return <BranchListClient initialBranches={branches} />;
}
