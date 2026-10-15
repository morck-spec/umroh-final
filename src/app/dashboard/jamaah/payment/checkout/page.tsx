import JamaahCheckoutClient from '@/components/dashboard/JamaahCheckoutClient';

export const metadata = { title: 'Checkout Pembayaran | Trecer' };

export default async function CheckoutPage(props: {
  searchParams: Promise<{
    bill_id?: string;
    code?: string;
    amount?: string;
    reg_id?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const billId = searchParams.bill_id || '33';
  const billCode = searchParams.code || 'REG-00009-DP';
  const totalAmount = searchParams.amount ? parseInt(searchParams.amount) : 35000000;

  return (
    <JamaahCheckoutClient
      billId={billId}
      billCode={billCode}
      totalAmount={totalAmount}
    />
  );
}
