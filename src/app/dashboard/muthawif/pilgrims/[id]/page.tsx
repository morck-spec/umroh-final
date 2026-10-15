import { notFound } from 'next/navigation';
import { getMuthawifPilgrimDetail } from '@/app/dashboard/shared/actions/muthawif';
import MuthawifPilgrimDetailClient from '@/components/dashboard/MuthawifPilgrimDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Detail Jamaah | Trecer',
};

export default async function MuthawifPilgrimDetailPage({ params }: Props) {
  const { id } = await params;
  const pilgrim = await getMuthawifPilgrimDetail(id);

  if (!pilgrim) {
    notFound();
  }

  return <MuthawifPilgrimDetailClient pilgrim={pilgrim} />;
}
