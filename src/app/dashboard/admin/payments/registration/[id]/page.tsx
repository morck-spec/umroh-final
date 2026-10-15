import { notFound } from 'next/navigation';
import { getRegistrationBilling } from '@/app/dashboard/shared/actions/paymentBilling';
import ManageRegistrationBillingClient from '@/components/dashboard/ManageRegistrationBillingClient';

export const metadata = {
  title: 'Kelola Tagihan Jamaah | Travel Umroh & Haji',
};

export default async function AdminManageBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const billing = await getRegistrationBilling(id);

  if (!billing) {
    notFound();
  }

  return (
    <ManageRegistrationBillingClient
      billing={billing}
      basePath="/dashboard/admin"
    />
  );
}
