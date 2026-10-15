import { notFound } from 'next/navigation';
import { getJamaahDetail } from '@/app/dashboard/shared/actions/jamaah';
import JamaahDetailClient from '@/components/dashboard/JamaahDetailClient';

export const metadata = {
  title: 'Detail Jamaah | Travel Umroh & Haji',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SuperAdminJamaahDetailPage({ params }: Props) {
  const { id } = await params;
  const jamaah = await getJamaahDetail(id);

  if (!jamaah) {
    notFound();
  }

  return (
    <JamaahDetailClient
      jamaah={jamaah}
      basePath="/dashboard/superadmin/jamaah"
    />
  );
}
