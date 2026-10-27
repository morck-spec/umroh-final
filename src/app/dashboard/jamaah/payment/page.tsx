import { getRegistrationBilling } from '@/app/dashboard/shared/actions/paymentBilling';
import JamaahPaymentClient from '@/components/dashboard/JamaahPaymentClient';

export const metadata = { title: 'Tagihan & Pembayaran | Trecer' };

export default async function JamaahPaymentPage() {
  // Load registration for Ahmad Fauzi (Supabase UUID: 2aca420f-7b0b-4fc8-86d7-2879832083d6 / REG-00001)
  let registration = await getRegistrationBilling('2aca420f-7b0b-4fc8-86d7-2879832083d6');
  if (!registration) {
    registration = await getRegistrationBilling('REG-00001');
  }
  if (!registration) {
    registration = await getRegistrationBilling('Ahmad Fauzi');
  }

  return <JamaahPaymentClient registration={registration} />;
}
