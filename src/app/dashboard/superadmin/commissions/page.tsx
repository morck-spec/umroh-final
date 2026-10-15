import { getCommissionList } from '@/app/dashboard/shared/actions/commissions';
import CommissionsClient from '@/components/dashboard/CommissionsClient';

export const metadata = {
  title: 'Komisi Agen | Travel Umroh & Haji',
};

export default async function SuperAdminCommissionsPage() {
  const commissions = await getCommissionList();
  return <CommissionsClient initialItems={commissions} basePath="/dashboard/superadmin/commissions" />;
}
