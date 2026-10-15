import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ReceiptClient from './ReceiptClient';

export const metadata = { title: 'Kwitansi Pembayaran | Al-Madinah Travel' };

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
    // Check payments.json for bill matching paymentId
    try {
      const fs = await import('fs');
      const path = await import('path');
      const file = path.join(process.cwd(), 'src', 'data', 'payments.json');
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf-8');
        const json = JSON.parse(raw);
        for (const r of json.registrations || []) {
          const matchedBill = r.bills?.find((b: any) => b.id === paymentId || b.code === paymentId);
          if (matchedBill || r.id === paymentId || r.code === paymentId) {
            const formatted = {
              id: matchedBill?.code || r.code || paymentId,
              amount: matchedBill?.amount || r.total_amount || 35000000,
              method: 'midtrans_va',
              status: 'paid',
              date: new Date().toISOString(),
              jamaahName: r.jamaah?.name || 'Ahmad Fauzi',
              packageName: r.package?.name || 'Haji Plus Eksklusif',
            };
            return <ReceiptClient payment={formatted} />;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading fallback receipt:', e);
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kwitansi Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">Data pembayaran tidak ditemukan atau Anda tidak memiliki akses.</p>
          <Link href="/dashboard/jamaah/payment" className="btn-primary px-6 py-2">Kembali</Link>
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
