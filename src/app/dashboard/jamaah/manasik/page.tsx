import { getManasikSchedules } from '@/app/dashboard/shared/actions/manasik';
import JamaahManasikClient from '@/components/dashboard/JamaahManasikClient';

export const metadata = {
  title: 'Manasik | Trecer',
};

export default async function JamaahManasikPage() {
  const allSchedules = await getManasikSchedules();

  // Filter schedules for Haji Plus Eksklusif (matching the logged in Jamaah Ahmad Fauzi's active package)
  const jamaahSchedules = allSchedules.filter(
    (s) => s.package_name?.toLowerCase().includes('haji plus') || s.package_name?.toLowerCase().includes('eksklusif')
  );

  return <JamaahManasikClient schedules={jamaahSchedules} />;
}
