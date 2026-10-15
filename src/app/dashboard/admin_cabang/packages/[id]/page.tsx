import { getPackageDetail } from '@/app/dashboard/shared/actions/packages';
import PackageDetailClient from '@/components/dashboard/PackageDetailClient';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Detail Paket | Travel Umroh & Haji',
};

interface PackageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCabangPackageDetailPage({ params }: PackageDetailPageProps) {
  const { id } = await params;
  const pkg = await getPackageDetail(id);

  if (!pkg) {
    return notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
