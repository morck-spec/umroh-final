import { notFound } from 'next/navigation';
import { getManasikDetail } from '@/app/dashboard/shared/actions/manasik';
import ManasikAttendanceClient from '@/components/dashboard/ManasikAttendanceClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Absensi Manasik | Travel Umroh & Haji',
};

export default async function AdminCabangManasikDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getManasikDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <ManasikAttendanceClient
      schedule={detail.schedule}
      stats={detail.stats}
      basePath="/dashboard/admin_cabang/manasik"
    />
  );
}
