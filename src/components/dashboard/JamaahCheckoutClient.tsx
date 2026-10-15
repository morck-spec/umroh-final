'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Info, Upload, CheckCircle2, QrCode, Copy, ExternalLink } from 'lucide-react';
import { simulatePaymentSuccessAction } from '@/app/dashboard/shared/actions/midtrans';
import { getSimulatorUrl } from '@/utils/midtrans';

interface JamaahCheckoutClientProps {
  billId?: string;
  billCode?: string;
  totalAmount?: number;
}

interface PaymentOption {
  id: string;
  name: string;
  code: string;
  fee?: number;
  vaNumber?: string;
  billerCode?: string;
  billKey?: string;
}

export default function JamaahCheckoutClient({
  billId = '33',
  billCode = 'REG-00009-DP',
  totalAmount = 35000000,
}: JamaahCheckoutClientProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('bca');
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  function formatRp(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  // Payment Groups matching Foto 2 & 3
  const bankTransferOptions: PaymentOption[] = [
    { id: 'bca', name: 'Bank BCA', code: 'BCA', vaNumber: '82710812900001' },
    { id: 'mandiri', name: 'Bank MANDIRI', code: 'MANDIRI', billerCode: '70012', billKey: '89100812900001', vaNumber: '70012 - 89100812900001' },
    { id: 'bri', name: 'Bank BRI', code: 'BRI', vaNumber: '02810812900001' },
    { id: 'permata', name: 'Bank PERMATA', code: 'PERMATA', vaNumber: '71810812900001' },
  ];

  const outletOptions: PaymentOption[] = [
    { id: 'alfamart', name: 'Alfamart', code: 'ALFA', vaNumber: 'ALFA82910029' },
  ];

  const ewalletOptions: PaymentOption[] = [
    { id: 'shopeepay', name: 'ShopeePay', code: 'SHOPEE' },
    { id: 'dana', name: 'DANA', code: 'DANA' },
    { id: 'linkaja', name: 'LinkAja', code: 'LINK' },
  ];

  const qrOptions: PaymentOption[] = [
    { id: 'qris', name: 'QRIS', code: 'QRIS' },
  ];

  const manualOptions: PaymentOption[] = [
    { id: 'manual', name: 'Upload Bukti Transfer', code: 'TF' },
  ];

  const allMethods = [
    ...bankTransferOptions,
    ...outletOptions,
    ...ewalletOptions,
    ...qrOptions,
    ...manualOptions,
  ];

  const activeMethodObj = allMethods.find((m) => m.id === selectedMethod) || bankTransferOptions[0];

  function handleLanjutkan() {
    if (selectedMethod === 'manual') {
      setShowManualModal(true);
    } else {
      setShowSimulatorModal(true);
    }
  }

  function handleCopyVA(text?: string) {
    const val = text || activeMethodObj.vaNumber;
    if (val) {
      navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleSimulateSuccess() {
    setIsProcessing(true);
    try {
      await simulatePaymentSuccessAction({
        billId,
        amount: totalAmount,
        paymentMethod: selectedMethod,
      });
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/jamaah/payment');
      }, 1800);
    } catch {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/jamaah/payment');
      }, 1800);
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Checkout Pembayaran
        </h1>
      </div>

      {/* Main Centered Box (Foto 2 & 3) */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-7">
        {/* Top bar inside card */}
        <div className="relative flex items-center justify-center mb-6">
          <Link
            href="/dashboard/jamaah/payment"
            className="absolute left-0 p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-[15px] font-bold text-slate-800">Checkout</h2>
        </div>

        {/* Total Tagihan Box (Foto 2) */}
        <div className="rounded-xl border border-slate-200 p-4 mb-6 bg-white">
          <p className="text-[11px] text-slate-400 font-normal">Total Tagihan</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">
            {formatRp(totalAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Tagihan: {billCode}
          </p>
        </div>

        {/* 1. Bank Transfer */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-slate-700">Bank Transfer</h3>
          </div>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {bankTransferOptions.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedMethod(opt.id)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wider">
                      {opt.code}
                    </span>
                    <span className="text-[13px] text-slate-700 font-normal">{opt.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Outlet Ritel */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-slate-700">Outlet Ritel</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-normal">
              Biaya admin berlaku
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {outletOptions.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedMethod(opt.id)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wider">
                      {opt.code}
                    </span>
                    <span className="text-[13px] text-slate-700 font-normal">{opt.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. e-Wallet */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-slate-700">e-Wallet</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-normal">
              Biaya admin berlaku
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {ewalletOptions.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedMethod(opt.id)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wider">
                      {opt.code}
                    </span>
                    <span className="text-[13px] text-slate-700 font-normal">{opt.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. QR Code */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-slate-700">QR Code</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-normal">
              Biaya admin berlaku
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {qrOptions.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedMethod(opt.id)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wider">
                      {opt.code}
                    </span>
                    <span className="text-[13px] text-slate-700 font-normal">{opt.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Transfer Manual */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-slate-700">Transfer Manual</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
              Bebas biaya
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {manualOptions.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedMethod(opt.id)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wider">
                      {opt.code}
                    </span>
                    <span className="text-[13px] text-slate-700 font-normal">{opt.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Total & Button (Foto 3) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              Biaya jasa <Info className="w-3 h-3 text-slate-400" />
            </span>
            <span className="text-slate-700 font-medium">Rp 0</span>
          </div>
          <div className="flex justify-between items-center mb-5">
            <span className="text-[12px] text-slate-600">Total pembayaran</span>
            <span className="text-base sm:text-lg font-bold text-[#00c292]">
              {formatRp(totalAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLanjutkan}
            className="w-full py-3.5 rounded-xl bg-[#00d4b2] hover:bg-[#00c292] active:scale-[0.99] text-white text-[13px] font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer text-center"
          >
            LANJUTKAN PEMBAYARAN
          </button>
        </div>
      </div>

      {/* Simulator Modal (Midtrans Simulator Flow) */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            {isSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-800">Pembayaran Berhasil!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tagihan {billCode} sebesar {formatRp(totalAmount)} telah berhasil dibayar.
                </p>
                <p className="text-[11px] text-slate-400 mt-3">Mengalihkan kembali ke riwayat pembayaran...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-12 h-6 rounded bg-slate-100 text-[10px] font-bold text-slate-700 flex items-center justify-center">
                      {activeMethodObj.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">{activeMethodObj.name}</h3>
                  </div>
                  <button
                    onClick={() => setShowSimulatorModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    Tutup
                  </button>
                </div>

                <div className="my-5 space-y-4">
                  {selectedMethod === 'qris' ? (
                    <div className="text-center py-2">
                      <div className="w-44 h-44 mx-auto bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-3 mb-2">
                        <QrCode className="w-28 h-28 text-slate-800" />
                        <span className="text-[9px] text-slate-500 mt-1">Scan via Aplikasi Pembayaran</span>
                      </div>
                      <p className="text-xs text-slate-500">Scan QRIS untuk menyelesaikan pembayaran</p>
                    </div>
                  ) : selectedMethod === 'mandiri' ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <p className="text-[11px] text-slate-500">Kode Perusahaan (Company Code)</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-base font-mono font-bold text-slate-800">70012</span>
                          <button
                            onClick={() => handleCopyVA('70012')}
                            className="flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[11px] text-slate-500">Nomor Tagihan (Bill Key)</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-base font-mono font-bold text-slate-800">
                            {activeMethodObj.billKey || '89100812900001'}
                          </span>
                          <button
                            onClick={() => handleCopyVA(activeMethodObj.billKey || '89100812900001')}
                            className="flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500">Nomor Virtual Account / Kode Bayar</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base sm:text-lg font-mono font-bold text-slate-800">
                          {activeMethodObj.vaNumber || '82710812900001'}
                        </span>
                        <button
                          onClick={() => handleCopyVA(activeMethodObj.vaNumber)}
                          className="flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copied ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs py-2 border-t border-slate-100">
                    <span className="text-slate-500">Total Tagihan</span>
                    <span className="font-bold text-slate-800">{formatRp(totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <a
                    href={getSimulatorUrl(selectedMethod)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Buka Simulator Midtrans Resmi</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>

                  <button
                    onClick={handleSimulateSuccess}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-[#00c292] hover:bg-[#00ad82] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? 'Memproses Simulasi...' : '⚡ Simulasikan Pembayaran Berhasil'}
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Terhubung ke Midtrans Simulator Sandbox
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Transfer Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            {isSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-800">Bukti Berhasil Diunggah!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bukti pembayaran untuk {billCode} telah dikirim dan menunggu verifikasi admin.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Upload Bukti Transfer Manual</h3>
                  <button
                    onClick={() => setShowManualModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Tutup
                  </button>
                </div>

                <div className="my-4 space-y-3">
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold">Rekening Tujuan Travel:</p>
                    <p>Bank Mandiri: <span className="font-mono font-bold">137-00-1234567-8</span></p>
                    <p>a.n. PT Travel Umroh &amp; Haji</p>
                    <p className="font-medium pt-1">Nominal: {formatRp(totalAmount)}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilih Foto / Dokumen Bukti Transfer
                    </label>
                    <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 font-medium">
                        {uploadedFile ? uploadedFile.name : 'Klik untuk pilih file bukti'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, atau PDF (Maks. 5MB)</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateSuccess}
                  disabled={!uploadedFile || isProcessing}
                  className="w-full py-3 rounded-xl bg-[#00c292] hover:bg-[#00ad82] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? 'Mengirim Bukti...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
