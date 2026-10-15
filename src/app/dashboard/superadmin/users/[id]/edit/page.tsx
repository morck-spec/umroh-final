import { notFound } from 'next/navigation';
import { getUserDetail } from '@/app/dashboard/shared/actions/users';
import UserFormClient from '@/components/dashboard/UserFormClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Pengguna | Travel Umroh & Haji',
};

export default async function SuperAdminUserEditPage({ params }: Props) {
  const { id } = await params;
  const user = await getUserDetail(id);

  if (!user) {
    notFound();
  }

  return (
    <UserFormClient
      initialUser={user}
      basePath="/dashboard/superadmin/users"
      isEdit={true}
    />
  );
}
