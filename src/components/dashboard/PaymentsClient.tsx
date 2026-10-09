'use client';

import { useState } from 'react';
import { verifyPayment, getSignedProofUrl } from '@/app/dashboard/shared/actions/payments';
import { Check, X, DollarSign, Receipt, Eye } from 'lucide-react';

export default function PaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [isLoading, setIsLoading] = useState(false);

  async function handleVerify(id: string, status: string) {
    if (confirm(`Yakin mengubah status pembayaran ini menjadi ${status}?`)) {
      setIsLoading(true);
      try {
        const res = await verifyPayment(id, status);
        if (res?.error) alert(res.error);
        else window.location.reload();
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function handleViewProof(proofUrl: string) {
    const url = await getSignedProofUrl(proofUrl);
    if (url) window.open(url, '_blank');
    else alert('Gagal membuka bukti pembayaran. Pastikan bucket "payment_proofs" tersedia.');
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-800">Verifikasi Pembayaran</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jamaah / Paket</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nominal</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metode</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada data pembayaran.</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(payment.created_at || payment.payment_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{payment.registrations?.jamaah?.full_name}</div>
                    <div className="text-xs text-slate-500">{payment.registrations?.packages?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    Rp {Number(payment.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 uppercase">
                    {payment.payment_method || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        payment.status === 'cancelled' ? 'bg-slate-100 text-slate-800' :
                        'bg-amber-100 text-amber-800'}`}>
                      {payment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {payment.proof_url && (
                      <button onClick={() => handleViewProof(payment.proof_url)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Lihat Bukti Transfer"><Eye className="w-4 h-4" /></button>
                    )}
                    {(payment.status === 'pending' || payment.status === 'waiting_verification') && (
                      <>
                        <button disabled={isLoading} onClick={() => handleVerify(payment.id, 'paid')} className="text-emerald-600 hover:text-emerald-900 p-1 bg-emerald-50 rounded" title="Validasi Lunas"><Check className="w-4 h-4" /></button>
                        <button disabled={isLoading} onClick={() => handleVerify(payment.id, 'rejected')} className="text-orange-600 hover:text-orange-900 p-1 bg-orange-50 rounded" title="Tolak / Tidak Valid"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    {payment.status === 'paid' && (
                      <button onClick={() => window.open(`/receipt/${payment.id}`, '_blank')} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Cetak Kwitansi/Invoice"><Receipt className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
