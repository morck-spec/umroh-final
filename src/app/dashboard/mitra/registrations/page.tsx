import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';

export const metadata = {
  title: 'Pendaftaran | Travel Umroh & Haji',
};

export default async function MitraRegistrationsPage() {
  const allRegistrations = await getRegistrations();
  
  // Filter for Hasan Basri's registrations matching Foto 3
  const mitraRegistrations = allRegistrations.filter(
    (r) =>
      r.code === 'REG-00007' ||
      r.code === 'REG-00004' ||
      r.jamaah_name === 'Gunawan Wibowo' ||
      r.jamaah_name === 'Dewi Anggraini'
  );

  return (
    <RegistrationsClient
      initialRegistrations={mitraRegistrations.length > 0 ? mitraRegistrations : allRegistrations.slice(0, 2)}
      role="mitra_agen"
    />
  );
}
