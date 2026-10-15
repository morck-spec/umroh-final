import { getPaymentDashboardData } from '@/app/dashboard/shared/actions/paymentBilling';
import PaymentsDashboardClient from '@/components/dashboard/PaymentsDashboardClient';

export const metadata = {
  title: 'Dashboard Pembayaran | Travel Umroh & Haji',
};

export default async function AdminPaymentsPage() {
  const data = await getPaymentDashboardData();

  return (
    <PaymentsDashboardClient
      summary={data.summary}
      bills={data.bills}
      basePath="/dashboard/admin"
    />
  );
}
