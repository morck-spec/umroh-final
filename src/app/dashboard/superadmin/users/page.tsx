import { getUserList } from '@/app/dashboard/shared/actions/users';
import UsersClient from '@/components/dashboard/UsersClient';

export const metadata = {
  title: 'Pengguna | Travel Umroh & Haji',
};

export default async function SuperAdminUsersPage() {
  const users = await getUserList();
  return <UsersClient initialUsers={users} basePath="/dashboard/superadmin/users" />;
}
