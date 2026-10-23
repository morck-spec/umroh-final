import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function PilgrimRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = user.user_metadata?.role || profile?.role;
      if (role === 'jamaah' || user.email?.includes('jamaah')) {
        redirect('/dashboard/jamaah/documents');
      }
      if (role === 'admin_cabang') {
        redirect(`/dashboard/admin_cabang/documents/${id}`);
      }
      if (role === 'admin') {
        redirect(`/dashboard/admin/documents/${id}`);
      }
    }
  } catch (err) {
    // Continue to default
  }

  redirect(`/dashboard/superadmin/documents/${id}`);
}
