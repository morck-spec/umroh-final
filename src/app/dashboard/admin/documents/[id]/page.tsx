import { notFound } from 'next/navigation';
import { getPilgrimDetail } from '@/app/dashboard/shared/actions/documents';
import PilgrimDocumentsDetailClient from '@/components/dashboard/PilgrimDocumentsDetailClient';

export const metadata = {
  title: 'Verifikasi Dokumen Jamaah | Travel Umroh & Haji',
};

export default async function AdminPilgrimDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pilgrim = await getPilgrimDetail(id);

  if (!pilgrim) {
    notFound();
  }

  return (
    <PilgrimDocumentsDetailClient
      pilgrim={pilgrim}
      backHref="/dashboard/admin/documents"
    />
  );
}
