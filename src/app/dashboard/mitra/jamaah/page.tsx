import { getJamaah } from '@/app/dashboard/shared/actions/jamaah';
import JamaahListClient from '@/components/dashboard/JamaahListClient';

export const metadata = { title: 'Jamaah Referral | Travel Umroh & Haji' };

export default async function MitraJamaahPage() {
  const allJamaah = await getJamaah();
  // Filter for Hasan Basri's referral jamaah
  const mitraJamaah = allJamaah.filter(
    (j) => j.agent_name?.toLowerCase().includes('hasan') || j.code === 'JM-0004' || j.code === 'JM-0007' || j.code === 'JM-0010'
  );

  return (
    <JamaahListClient
      initialJamaah={mitraJamaah.length > 0 ? mitraJamaah : allJamaah.slice(0, 3)}
      basePath="/dashboard/mitra/jamaah"
      role="mitra_agen"
    />
  );
}
