import { getManasikSchedules } from '@/app/dashboard/shared/actions/manasik';
import MuthawifManasikClient from '@/components/dashboard/MuthawifManasikClient';

export const metadata = {
  title: 'Manasik & Absensi | Trecer',
};

export default async function MuthawifManasikPage() {
  const all = await getManasikSchedules();
  const muthawifSchedules = all.filter(
    (s) => s.instructor?.toLowerCase().includes('abdullah')
  );

  return <MuthawifManasikClient schedules={muthawifSchedules} />;
}
