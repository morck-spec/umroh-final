import { getPackageManifestList } from '@/app/dashboard/shared/actions/manifests';
import ManifestListClient from '@/components/dashboard/ManifestListClient';

export const metadata = {
  title: 'Manifest & Rooming | Travel Umroh & Haji',
};

export default async function SuperAdminManifestsPage() {
  const manifests = await getPackageManifestList();
  return <ManifestListClient manifests={manifests} basePath="/dashboard/superadmin/manifests" />;
}
