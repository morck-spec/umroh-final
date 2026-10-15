import { getPaymentDashboardData } from '@/app/dashboard/shared/actions/paymentBilling';
import GenerateMassBillingClient from '@/components/dashboard/GenerateMassBillingClient';

export const metadata = {
  title: 'Buat Tagihan Massal | Travel Umroh & Haji',
};

export default async function AdminGenerateMassalPage() {
  const data = await getPaymentDashboardData();

  return (
    <GenerateMassBillingClient
      packages={data.packages}
      basePath="/dashboard/admin"
    />
  );
}
