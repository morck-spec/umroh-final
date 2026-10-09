import { createClient } from '@/utils/supabase/server';
import JamaahPaymentClient from '@/components/dashboard/JamaahPaymentClient';

export const metadata = { title: 'Tagihan & Pembayaran | Trecer' };

export default async function JamaahPaymentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Ambil registrations untuk user ini
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id,
      status,
      jamaah!inner(id, profile_id),
      packages(id, name, price)
    `)
    .eq('jamaah.profile_id', user?.id)
    .order('created_at', { ascending: false });

  // Ambil history payments
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      registrations!inner(jamaah!inner(profile_id), packages(name))
    `)
    .eq('registrations.jamaah.profile_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <JamaahPaymentClient
      registrations={registrations || []}
      payments={payments || []}
    />
  );
}
