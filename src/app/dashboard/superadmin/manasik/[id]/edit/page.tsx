import { notFound } from 'next/navigation';
import { getManasikDetail, getManasikFormData } from '@/app/dashboard/shared/actions/manasik';
import ManasikEditClient from '@/components/dashboard/ManasikEditClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Jadwal Manasik | Travel Umroh & Haji',
};

export default async function SuperAdminManasikEditPage({ params }: Props) {
  const { id } = await params;
  const [detail, formData] = await Promise.all([
    getManasikDetail(id),
    getManasikFormData(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <ManasikEditClient
      schedule={detail.schedule}
      packages={formData.packages}
      guides={formData.guides}
      basePath="/dashboard/superadmin/manasik"
    />
  );
}
