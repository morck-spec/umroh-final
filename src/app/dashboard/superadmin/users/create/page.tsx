import UserFormClient from '@/components/dashboard/UserFormClient';

export const metadata = {
  title: 'Tambah Pengguna | Travel Umroh & Haji',
};

export default function SuperAdminUserCreatePage() {
  return (
    <UserFormClient
      basePath="/dashboard/superadmin/users"
      isEdit={false}
    />
  );
}
