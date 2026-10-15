import { getJamaah } from '@/app/dashboard/shared/actions/jamaah';
import { getPackages } from '@/app/dashboard/shared/actions/packages';
import { getGuides } from '@/app/dashboard/shared/actions/guides';
import { getAgentsList } from '@/app/dashboard/shared/actions/agents';
import RegistrationCreateClient from '@/components/dashboard/RegistrationCreateClient';

export const metadata = {
  title: 'Daftarkan Jamaah | Travel Umroh & Haji',
};

export default async function SuperAdminCreateRegistrationPage() {
  const [jamaah, packages, guides, agents] = await Promise.all([
    getJamaah(),
    getPackages(),
    getGuides(),
    getAgentsList(),
  ]);

  const formattedJamaah = jamaah.map((j: any) => ({
    id: j.id,
    name: j.full_name || j.name,
  }));

  const formattedPackages = packages.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
  }));

  return (
    <RegistrationCreateClient
      jamaahList={formattedJamaah}
      packagesList={formattedPackages}
      guides={guides}
      agents={agents}
    />
  );
}
