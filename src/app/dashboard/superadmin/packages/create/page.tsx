import PackageFormClient from '@/components/dashboard/PackageFormClient';

export const metadata = {
  title: 'Tambah Paket | Travel Umroh & Haji',
};

export default function CreatePackagePage() {
  return <PackageFormClient isCreate={true} />;
}
