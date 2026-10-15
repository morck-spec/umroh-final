import { getAgentsList } from '@/app/dashboard/shared/actions/agents';
import AgentsClient from '@/components/dashboard/AgentsClient';

export const metadata = {
  title: 'Pengguna | Travel Umroh & Haji',
};

export default async function AdminCabangAgentsPage() {
  const agents = await getAgentsList();
  return <AgentsClient initialAgents={agents} role="admin_cabang" />;
}
