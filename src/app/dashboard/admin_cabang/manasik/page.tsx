import { getManasikSchedules } from '@/app/dashboard/shared/actions/manasik';
import ManasikListClient from '@/components/dashboard/ManasikListClient';

export const metadata = {
  title: 'Manasik | Travel Umroh & Haji',
};

export default async function AdminCabangManasikPage() {
  const schedules = await getManasikSchedules();
  return <ManasikListClient initialSchedules={schedules} basePath="/dashboard/admin_cabang/manasik" />;
}
