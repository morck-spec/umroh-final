import { redirect } from 'next/navigation';

export default async function PaymentCheckoutRootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/jamaah/payment/checkout?bill_id=${id}`);
}
