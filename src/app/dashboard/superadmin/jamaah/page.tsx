import { getJamaah } from '@/app/dashboard/shared/actions/jamaah';
import JamaahListClient from '@/components/dashboard/JamaahListClient';

export const metadata = {
  title: 'Data Jamaah | Trecer',
};

export default async function SuperAdminJamaahPage() {
  const jamaah = await getJamaah();

  return (
    <JamaahListClient
      initialJamaah={jamaah}
      basePath="/dashboard/superadmin/jamaah"
      role="super_admin"
    />
  );
}
