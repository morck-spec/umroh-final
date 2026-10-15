import { notFound } from 'next/navigation';
import { getJamaahDetail, getBranches, getAgents } from '@/app/dashboard/shared/actions/jamaah';
import JamaahFormClient from '@/components/dashboard/JamaahFormClient';

export const metadata = {
  title: 'Edit Jamaah | Travel Umroh & Haji',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MitraJamaahEditPage({ params }: Props) {
  const { id } = await params;
  const jamaah = await getJamaahDetail(id);

  if (!jamaah) {
    notFound();
  }

  const branches = await getBranches();
  const agents = await getAgents();

  return (
    <JamaahFormClient
      initialJamaah={jamaah}
      branches={branches}
      agents={agents}
      basePath="/dashboard/mitra/jamaah"
      isEdit={true}
    />
  );
}
