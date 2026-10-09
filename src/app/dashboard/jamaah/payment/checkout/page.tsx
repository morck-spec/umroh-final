import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import JamaahCheckoutClient from '@/components/dashboard/JamaahCheckoutClient';

export const metadata = { title: 'Checkout Pembayaran | Trecer' };

export default async function CheckoutPage(props: { searchParams: Promise<{ reg_id?: string, amount?: string }> }) {
  const searchParams = await props.searchParams;
  const regId = searchParams.reg_id;
  const amount = searchParams.amount;

  if (!regId || !amount) {
    redirect('/dashboard/jamaah/payment');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: registration } = await supabase
    .from('registrations')
    .select(`
      id,
      packages(name, price),
      jamaah(full_name),
      payments(amount, status)
    `)
    .eq('id', regId)
    .single();

  if (!registration) {
    redirect('/dashboard/jamaah/payment');
  }

  const packageName = Array.isArray(registration.packages)
    ? registration.packages[0]?.name
    : (registration.packages as any)?.name;

  const packagePrice = Array.isArray(registration.packages)
    ? registration.packages[0]?.price
    : (registration.packages as any)?.price;

  const jamaahName = Array.isArray(registration.jamaah)
    ? registration.jamaah[0]?.full_name
    : (registration.jamaah as any)?.full_name;

  // Calculate total paid
  const payments = registration.payments as any[] || [];
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalBill = Number(packagePrice || 0);
  const remainingBill = totalBill - totalPaid;

  return (
    <JamaahCheckoutClient
      registrationId={regId}
      amount={amount}
      packageName={packageName || ''}
      jamaahName={jamaahName || ''}
      totalBill={totalBill}
      totalPaid={totalPaid}
      remainingBill={remainingBill}
    />
  );
}
