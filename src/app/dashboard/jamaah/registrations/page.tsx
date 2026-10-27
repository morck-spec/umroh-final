import { createClient } from '@/utils/supabase/server';
import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';

export const metadata = { title: 'Pendaftaran Saya | Trecer' };

export default async function JamaahRegistrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userJamaahId = '';
  let userName = '';
  let isAuthenticated = false;

  if (user) {
    isAuthenticated = true;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    userName = profile?.full_name?.toLowerCase() || '';

    const { data: j } = await supabase
      .from('jamaah')
      .select('id, full_name')
      .eq('profile_id', user.id)
      .maybeSingle();
    userJamaahId = j?.id || '';
    if (j?.full_name) userName = j.full_name.toLowerCase();
  }

  const allRegistrations = await getRegistrations();

  let jamaahRegistrations = allRegistrations.filter((r: any) => {
    if (userJamaahId && (r.jamaah_id === userJamaahId || r.id === userJamaahId)) return true;
    if (userName && r.jamaah_name?.toLowerCase().includes(userName)) return true;
    return false;
  });

  // Only fallback if NOT logged in at all (public demo view)
  if (!isAuthenticated && jamaahRegistrations.length === 0) {
    jamaahRegistrations = allRegistrations.filter(
      (r) =>
        r.jamaah_name?.toLowerCase().includes('ahmad fauzi') ||
        r.code === 'REG-00001'
    );
  }

  return (
    <RegistrationsClient
      initialRegistrations={jamaahRegistrations}
      role="jamaah"
    />
  );
}

