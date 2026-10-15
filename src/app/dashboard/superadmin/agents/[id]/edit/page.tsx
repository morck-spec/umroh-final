import { notFound } from 'next/navigation';
import AgentFormClient from '@/components/dashboard/AgentFormClient';
import { getAgentById } from '@/app/dashboard/shared/actions/agents';
import { getBranchesList } from '@/app/dashboard/shared/actions/branches';

export const metadata = {
  title: 'Pengguna | Travel Umroh & Haji',
};

export default async function SuperAdminEditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [agent, branches] = await Promise.all([
    getAgentById(id),
    getBranchesList(),
  ]);

  if (!agent) {
    notFound();
  }

  return <AgentFormClient agent={agent} branches={branches} isEdit={true} />;
}
