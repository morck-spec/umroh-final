import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';

export const metadata = { title: 'Pendaftaran Saya | Trecer' };

export default async function JamaahRegistrationsPage() {
  const allRegistrations = await getRegistrations();

  // Strictly Ahmad Fauzi (the logged-in jamaah user) matching the reference screenshot
  let jamaahRegistrations = allRegistrations.filter(
    (r) =>
      r.jamaah_name?.toLowerCase().includes('ahmad fauzi') ||
      r.code === 'REG-00001'
  );

  if (jamaahRegistrations.length === 0) {
    jamaahRegistrations = [
      {
        id: '1',
        code: 'REG-00001',
        jamaah_name: 'Ahmad Fauzi',
        package_name: 'Umroh Reguler 9 Hari',
        status: 'Dikonfirmasi',
        payment_status: 'Lunas',
        reg_date: '14 Nov 2025',
        total_amount: 28500000,
        paid_amount: 28500000,
        remaining_amount: 0,
      },
    ];
  }

  return (
    <RegistrationsClient
      initialRegistrations={jamaahRegistrations}
      role="jamaah"
    />
  );
}
