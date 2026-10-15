import { getRegistrationBilling } from '@/app/dashboard/shared/actions/paymentBilling';
import JamaahPaymentClient from '@/components/dashboard/JamaahPaymentClient';

export const metadata = { title: 'Tagihan & Pembayaran | Trecer' };

export default async function JamaahPaymentPage() {
  // Load registration for Ahmad Fauzi (REG-00009 / id: 9)
  let registration = await getRegistrationBilling('9');
  if (!registration) {
    registration = await getRegistrationBilling('REG-00009');
  }

  // Fallback to id 1 if not found
  if (!registration) {
    registration = await getRegistrationBilling('1');
  }

  return <JamaahPaymentClient registration={registration} />;
}
