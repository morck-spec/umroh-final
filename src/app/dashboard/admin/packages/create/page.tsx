import PackageFormClient from '@/components/dashboard/PackageFormClient';

export const metadata = {
  title: 'Tambah Paket | Travel Umroh & Haji',
};

export default function AdminCreatePackagePage() {
  return <PackageFormClient isCreate={true} />;
}
