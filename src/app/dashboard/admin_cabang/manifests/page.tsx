import { getPackageManifestList } from '@/app/dashboard/shared/actions/manifests';
import ManifestListClient from '@/components/dashboard/ManifestListClient';

export const metadata = {
  title: 'Manifest & Rooming | Travel Umroh & Haji',
};

export default async function AdminCabangManifestsPage() {
  const manifests = await getPackageManifestList();
  return <ManifestListClient manifests={manifests} basePath="/dashboard/admin_cabang/manifests" />;
}
