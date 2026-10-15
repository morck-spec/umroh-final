import { getManasikSchedules } from '@/app/dashboard/shared/actions/manasik';
import ManasikListClient from '@/components/dashboard/ManasikListClient';
import JamaahManasikClient from '@/components/dashboard/JamaahManasikClient';
import MuthawifManasikClient from '@/components/dashboard/MuthawifManasikClient';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Manasik | Travel Umroh & Haji',
};

export default async function SuperAdminManasikPage() {
  const schedules = await getManasikSchedules();

  let isJamaah = false;
  let isMuthawif = false;
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        const role = data.user.user_metadata?.role || profile?.role;
        if (role === 'jamaah' || data.user.email?.includes('jamaah')) {
          isJamaah = true;
        } else if (role === 'muthawif' || role === 'guide' || data.user.email?.includes('muthawif')) {
          isMuthawif = true;
        }
      }
    }
  } catch {}

  if (isJamaah) {
    const jamaahSchedules = schedules.filter(
      (s) => s.package_name?.toLowerCase().includes('haji plus') || s.package_name?.toLowerCase().includes('eksklusif')
    );
    return <JamaahManasikClient schedules={jamaahSchedules} />;
  }

  if (isMuthawif) {
    const muthawifSchedules = schedules.filter(
      (s) => s.instructor?.toLowerCase().includes('abdullah')
    );
    return <MuthawifManasikClient schedules={muthawifSchedules} />;
  }

  return <ManasikListClient initialSchedules={schedules} basePath="/dashboard/superadmin/manasik" />;
}
