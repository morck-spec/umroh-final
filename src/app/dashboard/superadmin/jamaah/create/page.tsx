import { getBranches, getAgents } from '@/app/dashboard/shared/actions/jamaah';
import JamaahFormClient from '@/components/dashboard/JamaahFormClient';

export const metadata = {
  title: 'Tambah Jamaah | Travel Umroh & Haji',
};

export default async function SuperAdminJamaahCreatePage() {
  const branches = await getBranches();
  const agents = await getAgents();

  return (
    <JamaahFormClient
      branches={branches}
      agents={agents}
      basePath="/dashboard/superadmin/jamaah"
      isEdit={false}
    />
  );
}
