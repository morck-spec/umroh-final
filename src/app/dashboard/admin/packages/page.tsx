import { getPackagesList } from '@/app/dashboard/shared/actions/packages';
import PackageListClient from '@/components/dashboard/PackageListClient';

export const metadata = {
  title: 'Paket | Travel Umroh & Haji',
};

export default async function AdminPackagesPage() {
  const packages = await getPackagesList();

  return <PackageListClient initialPackages={packages} />;
}
