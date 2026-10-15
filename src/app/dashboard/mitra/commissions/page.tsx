import { getCommissionList } from '@/app/dashboard/shared/actions/commissions';
import CommissionsClient from '@/components/dashboard/CommissionsClient';

export const metadata = {
  title: 'Komisi Saya | Travel Umroh & Haji',
};

export default async function MitraCommissionsPage() {
  const allCommissions = await getCommissionList();
  
  // Filter for Hasan Basri's commissions matching Foto 4
  const mitraCommissions = allCommissions.filter(
    (c) => c.agent_name?.toLowerCase().includes('hasan')
  );

  return (
    <CommissionsClient
      initialItems={mitraCommissions.length > 0 ? mitraCommissions : allCommissions.slice(0, 3)}
      basePath="/dashboard/mitra/commissions"
      role="mitra_agen"
    />
  );
}
