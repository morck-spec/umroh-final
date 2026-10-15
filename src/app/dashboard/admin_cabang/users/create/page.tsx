import UserFormClient from '@/components/dashboard/UserFormClient';

export const metadata = {
  title: 'Tambah Pengguna | Travel Umroh & Haji',
};

export default function AdminCabangUserCreatePage() {
  return (
    <UserFormClient
      basePath="/dashboard/admin_cabang/users"
      isEdit={false}
    />
  );
}
