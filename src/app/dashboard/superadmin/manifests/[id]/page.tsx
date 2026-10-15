import { notFound } from 'next/navigation';
import { getPackageManifestDetail } from '@/app/dashboard/shared/actions/manifests';
import ManifestDetailClient from '@/components/dashboard/ManifestDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Kelola Manifest | Travel Umroh & Haji',
};

export default async function SuperAdminManifestDetailPage({ params }: Props) {
  const { id } = await params;
  const manifest = await getPackageManifestDetail(id);

  if (!manifest) {
    notFound();
  }

  return <ManifestDetailClient manifest={manifest} basePath="/dashboard/superadmin/manifests" />;
}
