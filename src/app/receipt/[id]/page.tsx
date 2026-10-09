import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ReceiptClient from './ReceiptClient';

export const metadata = { title: 'Kwitansi Pembayaran | Trecer Umroh' };

export default async function ReceiptPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const paymentId = params.id;

  if (!paymentId) {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ambil data pembayaran
  const { data: payment } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      payment_method,
      status,
      created_at,
      registrations (
        id,
        packages (
          name,
          price
        ),
        jamaah (
          full_name
        )
      )
    `)
    .eq('id', paymentId)
    .single();

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kwitansi Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">Data pembayaran tidak ditemukan atau Anda tidak memiliki akses.</p>
          <a href="/" className="btn-primary px-6 py-2">Kembali</a>
        </div>
      </div>
    );
  }

  // Format data
  const regData: any = Array.isArray(payment.registrations)
    ? payment.registrations[0]
    : payment.registrations;

  const packageName = Array.isArray(regData?.packages)
    ? regData?.packages[0]?.name
    : regData?.packages?.name;

  const jamaahName = Array.isArray(regData?.jamaah)
    ? regData?.jamaah[0]?.full_name
    : regData?.jamaah?.full_name;

  const formattedPayment = {
    id: payment.id,
    amount: payment.amount,
    method: payment.payment_method,
    status: payment.status,
    date: payment.created_at,
    jamaahName: jamaahName || '-',
    packageName: packageName || '-',
  };

  return <ReceiptClient payment={formattedPayment} />;
}
