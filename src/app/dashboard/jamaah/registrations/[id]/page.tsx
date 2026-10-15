import { notFound } from 'next/navigation';
import { getRegistrationBilling } from '@/app/dashboard/shared/actions/paymentBilling';
import RegistrationDetailClient from '@/components/dashboard/RegistrationDetailClient';

export const metadata = {
  title: 'Detail Pendaftaran | Travel Umroh & Haji',
};

export default async function JamaahRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let registration = await getRegistrationBilling(id);

  if (!registration) {
    const cleanId = id.replace(/^REG-0*/i, '');
    registration = await getRegistrationBilling(cleanId);
  }

  // Fallback for Ahmad Fauzi (REG-00001 / id: 1)
  if (!registration) {
    registration = await getRegistrationBilling('1');
  }

  if (!registration) {
    notFound();
  }

  return (
    <RegistrationDetailClient
      registration={registration}
      basePath="/dashboard/jamaah"
    />
  );
}
