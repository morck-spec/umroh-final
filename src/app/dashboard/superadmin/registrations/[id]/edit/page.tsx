import { notFound } from 'next/navigation';
import { getRegistrationBilling } from '@/app/dashboard/shared/actions/paymentBilling';
import { getGuides } from '@/app/dashboard/shared/actions/guides';
import RegistrationEditClient from '@/components/dashboard/RegistrationEditClient';

export const metadata = {
  title: 'Edit Pendaftaran | Travel Umroh & Haji',
};

export default async function SuperAdminEditRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [registration, guides] = await Promise.all([
    getRegistrationBilling(id),
    getGuides(),
  ]);

  if (!registration) {
    notFound();
  }

  return (
    <RegistrationEditClient
      registration={registration}
      guides={guides}
    />
  );
}
