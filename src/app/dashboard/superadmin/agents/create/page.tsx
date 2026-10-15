import AgentFormClient from '@/components/dashboard/AgentFormClient';
import { getBranchesList } from '@/app/dashboard/shared/actions/branches';

export const metadata = {
  title: 'Pengguna | Travel Umroh & Haji',
};

export default async function SuperAdminCreateAgentPage() {
  const branches = await getBranchesList();
  return <AgentFormClient branches={branches} isEdit={false} />;
}
