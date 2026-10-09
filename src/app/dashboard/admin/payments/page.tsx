import { getPayments } from '@/app/dashboard/shared/actions/payments';
import PaymentsClient from '@/components/dashboard/PaymentsClient';
import { DollarSign } from 'lucide-react';

export const metadata = { title: 'Keuangan | Trecer' };

export default async function AdminPaymentsPage() {
  const payments = await getPayments();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><DollarSign className="w-6 h-6 text-emerald-600" /> Keuangan & Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola dan verifikasi pembayaran jamaah</p>
        </div>
      </div>
      <div className="card"><PaymentsClient initialPayments={payments} /></div>
    </div>
  );
}
