import GuideFormClient from '@/components/dashboard/GuideFormClient';
import { getBranchesList } from '@/app/dashboard/shared/actions/branches';

export const metadata = {
  title: 'Tambah Muthawif | Travel Umroh & Haji',
};

export default async function AdminCreateGuidePage() {
  const branches = await getBranchesList();
  return <GuideFormClient branches={branches} isEdit={false} />;
}
