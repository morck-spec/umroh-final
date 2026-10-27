import { createClient } from '@/utils/supabase/server';
import { getPackagesList } from '@/app/dashboard/shared/actions/packages';
import PackageListClient from '@/components/dashboard/PackageListClient';

export const metadata = {
  title: 'Paket | Travel Umroh & Haji',
};

export default async function PackagesPage() {
  const supabase = await createClient();
  let role = 'super_admin';

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      role = user.user_metadata?.role || profile?.role || 'jamaah';
    }
  } catch {}

  const packages = await getPackagesList();

  return <PackageListClient initialPackages={packages} role={role} />;
}

