import { getPackageDetail } from '@/app/dashboard/shared/actions/packages';
import PackageFormClient from '@/components/dashboard/PackageFormClient';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Paket | Travel Umroh & Haji',
};

interface EditPackagePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params;
  const pkg = await getPackageDetail(id);

  if (!pkg) {
    return notFound();
  }

  return <PackageFormClient pkg={pkg} isCreate={false} />;
}
