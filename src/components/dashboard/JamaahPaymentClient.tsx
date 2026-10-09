'use client';

import Link from 'next/link';
import { CreditCard, FileText, Download, CheckCircle, Clock, ChevronRight, AlertCircle } from 'lucide-react';

export default function JamaahPaymentClient({ registrations, payments }: { registrations: any[], payments: any[] }) {

  // Calculate total paid for each registration
  const getPaidAmount = (regId: string) => {
    return payments
      .filter(p => p.registration_id === regId && p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tagihan & Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola pembayaran untuk paket umroh Anda</p>
        </div>
      </div>

      {/* Active Billing */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
            Tagihan Saat Ini
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {registrations.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Belum ada tagihan (Anda belum mendaftar paket umroh).</div>
          ) : (
            registrations.map(reg => {
              const packagePrice = reg.packages?.price || 0;
              const paidAmount = getPaidAmount(reg.id);
              const remainingAmount = packagePrice - paidAmount;

              const isPaidOff = remainingAmount <= 0;

              return (
                <div key={reg.id} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-500">Paket: {reg.packages?.name}</p>
                        {isPaidOff ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Lunas</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Belum Lunas</span>
                        )}
                      </div>
                      <p className="text-3xl font-bold text-slate-900 mb-2">
                        Rp {remainingAmount > 0 ? remainingAmount.toLocaleString('id-ID') : '0'}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center">
                        Total Harga Paket: Rp {packagePrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                    {!isPaidOff && (
                      <Link href={`/dashboard/jamaah/payment/checkout?reg_id=${reg.id}&amount=${remainingAmount}`} className="btn-primary py-3 px-6 text-base w-full md:w-auto flex justify-center">
                        Bayar Sekarang
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-emerald-600" />
            Riwayat Pembayaran
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paket</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Metode</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada riwayat pembayaran.</td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(p.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {p.registrations?.packages?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">
                      {p.payment_method?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      Rp {Number(p.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          p.status === 'waiting_verification' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'}`}>
                        {p.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {p.status === 'waiting_verification' && <Clock className="w-3 h-3 mr-1" />}
                        {p.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
