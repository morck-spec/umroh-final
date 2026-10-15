import { getPaymentDashboardData } from '@/app/dashboard/shared/actions/paymentBilling';
import GenerateMassBillingClient from '@/components/dashboard/GenerateMassBillingClient';

export const metadata = {
  title: 'Buat Tagihan Massal | Travel Umroh & Haji',
};

export default async function SuperAdminGenerateMassalPage() {
  const data = await getPaymentDashboardData();

  return (
    <GenerateMassBillingClient
      packages={data.packages}
      basePath="/dashboard/superadmin"
    />
  );
}
