import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getRegistrations } from '@/app/dashboard/shared/actions/registrations';
import RegistrationsClient from '@/components/dashboard/RegistrationsClient';

export const metadata = { title: 'Pendaftaran Saya | Trecer' };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

export default async function JamaahRegistrationsPage() {
  const supabase = await createClient();
  const adminDb = getAdminClient() || supabase;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userJamaahId = '';
  let userName = '';
  let isAuthenticated = false;

  if (user) {
    isAuthenticated = true;
    const { data: profile } = await adminDb
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    userName = profile?.full_name?.toLowerCase() || '';

    const { data: j } = await adminDb
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

