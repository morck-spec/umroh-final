import PackageFormClient from '@/components/dashboard/PackageFormClient';

export const metadata = {
  title: 'Tambah Paket | Travel Umroh & Haji',
};

export default function AdminCabangCreatePackagePage() {
  return <PackageFormClient isCreate={true} />;
}
