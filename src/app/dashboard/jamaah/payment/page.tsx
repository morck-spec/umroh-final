import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getRegistrationBilling } from '@/app/dashboard/shared/actions/paymentBilling';
import JamaahPaymentClient from '@/components/dashboard/JamaahPaymentClient';

export const metadata = { title: 'Tagihan & Pembayaran | Trecer' };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

export default async function JamaahPaymentPage() {
  const supabase = await createClient();
  const adminDb = getAdminClient() || supabase;
  let registration = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Find jamaah record for this logged-in auth user
      const { data: jData } = await adminDb
        .from('jamaah')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (jData) {
        // Find latest registration for this jamaah
        const { data: regData } = await adminDb
          .from('registrations')
          .select('id')
          .eq('jamaah_id', jData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (regData) {
          registration = await getRegistrationBilling(regData.id);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching jamaah payment billing:', err);
  }

  return <JamaahPaymentClient registration={registration} />;
}

