import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let role = user.user_metadata?.role || profile?.role || 'super_admin';
    if (profile?.role && ['super_admin', 'admin', 'admin_cabang'].includes(profile.role)) {
      role = profile.role;
    }

    if (role === 'mitra_agen') redirect('/dashboard/mitra');
    if (role === 'muthawif' || role === 'guide') redirect('/dashboard/muthawif');
    if (role === 'admin_cabang') redirect('/dashboard/admin_cabang');
    if (role === 'admin') redirect('/dashboard/admin');
    if (role === 'jamaah') redirect('/dashboard/jamaah');

    redirect('/dashboard/superadmin');
  } catch {
    redirect('/dashboard/superadmin');
  }
}
