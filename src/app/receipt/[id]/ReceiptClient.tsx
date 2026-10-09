'use client';

import { Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type PaymentData = {
  id: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  jamaahName: string;
  packageName: string;
};

export default function ReceiptClient({ payment }: { payment: PaymentData }) {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${new Date(payment.date).getFullYear()}${(new Date(payment.date).getMonth() + 1).toString().padStart(2, '0')}-${payment.id.split('-')[0].toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="javascript:history.back()" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak Kwitansi
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-sm rounded-xl print:shadow-none print:p-0 print:m-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trecer<span className="text-emerald-600">Umroh</span></h1>
            <p className="text-slate-500 text-sm mt-1">PT Trecer Tour & Travel</p>
            <p className="text-slate-500 text-sm">Jl. Contoh Alamat No. 123, Jakarta</p>
          </div>
          <div className="mt-6 sm:mt-0 text-left sm:text-right">
            <h2 className="text-2xl font-semibold text-slate-800">KWITANSI PEMBAYARAN</h2>
            <p className="text-sm font-mono text-slate-500 mt-1">{invoiceNumber}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dibayarkan Oleh</p>
            <p className="font-semibold text-slate-900 text-lg">{payment.jamaahName}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detail Transaksi</p>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="inline-block w-32 sm:w-auto sm:mr-3 font-medium">Tanggal:</span> {new Date(payment.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><span className="inline-block w-32 sm:w-auto sm:mr-3 font-medium">Metode:</span> <span className="uppercase">{payment.method.replace('_', ' ')}</span></p>
              <p className="flex items-center sm:justify-end">
                <span className="inline-block w-32 sm:w-auto sm:mr-3 font-medium">Status:</span>
                {payment.status === 'paid' ? (
                  <span className="inline-flex items-center text-emerald-700 font-semibold">
                    <CheckCircle className="w-4 h-4 mr-1" /> LUNAS
                  </span>
                ) : (
                  <span className="uppercase font-semibold text-amber-600">{payment.status.replace('_', ' ')}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mb-10 border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Keterangan</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">Pembayaran Paket Umroh</p>
                  <p className="text-slate-500 text-xs mt-1">Paket: {payment.packageName}</p>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  Rp {Number(payment.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td className="px-6 py-4 font-bold text-slate-900 text-right uppercase tracking-wider text-xs">Total Pembayaran</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">
                  Rp {Number(payment.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200 text-center sm:text-left text-slate-500 text-sm flex flex-col sm:flex-row justify-between items-center">
          <p>Terima kasih atas pembayaran Anda. Kwitansi ini adalah bukti pembayaran yang sah.</p>
          <div className="mt-8 sm:mt-0 text-center">
            <p className="mb-16">Penerima</p>
            <p className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-4">Admin Trecer Umroh</p>
          </div>
        </div>
      </div>
    </div>
  );
}
