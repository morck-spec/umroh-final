import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import { getPackages } from '@/app/dashboard/shared/actions/packages';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';

export const metadata = {
  title: 'Pendaftaran | Travel Umroh & Haji',
};

export default async function AdminCabangRegistrationsPage() {
  const [registrations, packages] = await Promise.all([
    getRegistrations(),
    getPackages(),
  ]);

  return (
    <RegistrationsClient
      initialRegistrations={registrations}
      role="admin_cabang"
      packagesList={packages}
    />
  );
}
