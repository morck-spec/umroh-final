import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';

export const metadata = { title: 'Pendaftaran Saya | Trecer' };

export default async function JamaahRegistrationsPage() {
  const allRegistrations = await getRegistrations();

  // Strictly Ahmad Fauzi (the logged-in jamaah user)
  let jamaahRegistrations = allRegistrations.filter(
    (r) =>
      r.jamaah_name?.toLowerCase().includes('ahmad fauzi') ||
      r.code === 'REG-00001'
  );

  if (jamaahRegistrations.length === 0 && allRegistrations.length > 0) {
    jamaahRegistrations = [allRegistrations[0]];
  }

  return (
    <RegistrationsClient
      initialRegistrations={jamaahRegistrations}
      role="jamaah"
    />
  );
}
