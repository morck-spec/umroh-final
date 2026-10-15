import { notFound } from 'next/navigation';
import { getRegistrationBilling } from '@/app/dashboard/shared/actions/paymentBilling';
import RegistrationDetailClient from '@/components/dashboard/RegistrationDetailClient';

export const metadata = {
  title: 'Detail Pendaftaran | Travel Umroh & Haji',
};

export default async function SuperAdminRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const registration = await getRegistrationBilling(id);

  if (!registration) {
    notFound();
  }

  return (
    <RegistrationDetailClient
      registration={registration}
      basePath="/dashboard/superadmin"
    />
  );
}
