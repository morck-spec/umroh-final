import Link from 'next/link';
import { CheckCircle2, Printer, ArrowLeft, Download } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/jamaah/payment" className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm font-medium text-slate-500">Kembali ke Pembayaran</span>
      </div>

      <div className="card overflow-hidden">
        {/* Success Header */}
        <div className="bg-emerald-600 px-6 py-10 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil Dikirim!</h1>
          <p className="text-emerald-100 max-w-md mx-auto">
            Terima kasih, bukti pembayaran Anda telah kami terima dan sedang diverifikasi oleh admin.
          </p>
        </div>

        {/* Invoice Details */}
        <div className="p-8">
          <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Nomor Invoice</p>
              <p className="text-lg font-bold text-slate-900">INV-99282</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Tanggal</p>
              <p className="text-base font-medium text-slate-900">10 Okt 2026, 14:30 WIB</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
              <span className="text-slate-500">Nama Jamaah</span>
              <span className="font-medium text-slate-900">Aufa</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
              <span className="text-slate-500">Paket Umroh</span>
              <span className="font-medium text-slate-900">Paket Reguler 9 Hari</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
              <span className="text-slate-500">Metode Pembayaran</span>
              <span className="font-medium text-slate-900">BCA Virtual Account</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
              <span className="text-slate-500">Keterangan</span>
              <span className="font-medium text-slate-900">Pembayaran Termin 2</span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">Rp 10.000.000</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-600">Biaya Admin</span>
              <span className="font-medium text-slate-900">Rp 0</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-lg font-bold text-slate-900">Total Dibayar</span>
              <span className="text-2xl font-bold text-emerald-600">Rp 10.000.000</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn-secondary py-3 flex-1 flex justify-center items-center">
              <Printer className="w-5 h-5 mr-2" />
              Cetak Invoice
            </button>
            <button className="btn-primary py-3 flex-1 flex justify-center items-center">
              <Download className="w-5 h-5 mr-2" />
              Unduh PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
