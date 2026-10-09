'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Building2, Wallet, ShieldCheck, Upload,
  Smartphone, QrCode, Banknote, CheckCircle, X, FileText, AlertCircle, Copy
} from 'lucide-react';
import { createPayment } from '@/app/dashboard/shared/actions/payments';

type CheckoutProps = {
  registrationId: string;
  amount: string;
  packageName: string;
  jamaahName: string;
  totalBill: number;
  totalPaid: number;
  remainingBill: number;
};

const PAYMENT_CATEGORIES = [
  { id: 'bank_transfer', label: 'Transfer Bank', icon: Building2 },
  { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
  { id: 'va', label: 'Virtual Account', icon: Smartphone },
  { id: 'qris', label: 'QRIS', icon: QrCode },
  { id: 'cash', label: 'Tunai', icon: Banknote },
];

const BANK_OPTIONS = [
  { id: 'bca_transfer', label: 'BCA', accName: 'PT Trecer Umroh', accNumber: '1234567890' },
  { id: 'bni_transfer', label: 'BNI', accName: 'PT Trecer Umroh', accNumber: '0987654321' },
  { id: 'bri_transfer', label: 'BRI', accName: 'PT Trecer Umroh', accNumber: '1122334455' },
  { id: 'mandiri_transfer', label: 'Mandiri', accName: 'PT Trecer Umroh', accNumber: '9988776655' },
];

const EWALLET_OPTIONS = [
  { id: 'gopay', label: 'GoPay', number: '081234567890', accName: 'Trecer Umroh' },
  { id: 'ovo', label: 'OVO', number: '081234567890', accName: 'Trecer Umroh' },
  { id: 'dana', label: 'DANA', number: '081234567890', accName: 'Trecer Umroh' },
  { id: 'shopeepay', label: 'ShopeePay', number: '081234567890', accName: 'Trecer Umroh' },
];

const VA_OPTIONS = [
  { id: 'bca_va', label: 'BCA VA', desc: 'Dicek manual oleh admin' },
  { id: 'bni_va', label: 'BNI VA', desc: 'Dicek manual oleh admin' },
  { id: 'bri_va', label: 'BRI VA', desc: 'Dicek manual oleh admin' },
  { id: 'mandiri_va', label: 'Mandiri VA', desc: 'Dicek manual oleh admin' },
];

export default function JamaahCheckoutClient({
  registrationId,
  amount,
  packageName,
  jamaahName,
  totalBill,
  totalPaid,
  remainingBill
}: CheckoutProps) {
  const router = useRouter();
  const [category, setCategory] = useState<string>('bank_transfer');
  const [method, setMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [copiedText, setCopiedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const numericAmount = parseInt(amount) || 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 5MB');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!method) return alert('Silakan pilih metode pembayaran');
    if (!file && category !== 'cash') return alert('Silakan upload bukti pembayaran');
    if (fileError) return alert('Perbaiki file bukti pembayaran terlebih dahulu');

    setIsLoading(true);
    const formData = new FormData();
    formData.append('registration_id', registrationId);
    formData.append('amount', numericAmount.toString());
    formData.append('payment_method', method);
    if (file) {
      formData.append('proof_file', file);
    }

    try {
      const res = await createPayment(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        router.push('/dashboard/jamaah/payment/success');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to find selected option details for rendering instructions
  const selectedBank = BANK_OPTIONS.find(b => b.id === method);
  const selectedEwallet = EWALLET_OPTIONS.find(e => e.id === method);
  const selectedVA = VA_OPTIONS.find(v => v.id === method);

  const getMethodLabel = () => {
    if (!method) return '-';
    if (category === 'qris') return 'QRIS';
    if (category === 'cash') return 'Tunai';
    return selectedBank?.label || selectedEwallet?.label || selectedVA?.label || method;
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/jamaah/payment" className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Checkout Pembayaran</h1>
          <p className="text-sm text-slate-500">Selesaikan pembayaran untuk paket umroh Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
        {/* KIRI: Main Content */}
        <div className="w-full lg:w-2/3 space-y-6">

          {/* BAGIAN 1: RINGKASAN TAGIHAN */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">Informasi Tagihan</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Nomor Pendaftaran</p>
                  <p className="font-medium text-slate-900 font-mono text-sm">{registrationId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Nama Jamaah</p>
                  <p className="font-medium text-slate-900">{jamaahName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Paket Umroh</p>
                  <p className="font-medium text-slate-900">{packageName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Tagihan</p>
                  <p className="font-medium text-slate-900">Rp {totalBill.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Sudah Dibayar</p>
                  <p className="font-medium text-slate-900">Rp {totalPaid.toLocaleString('id-ID')}</p>
                </div>
                <div className="sm:col-span-2 pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-600">Sisa Tagihan</p>
                  <p className="text-lg font-bold text-amber-600">Rp {remainingBill.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* BAGIAN 2: PILIH METODE PEMBAYARAN */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">Metode Pembayaran</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-8">
                {PAYMENT_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        setMethod(cat.id === 'qris' ? 'qris' : cat.id === 'cash' ? 'cash' : '');
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* OPTIONS FOR SELECTED CATEGORY */}
              <div className="space-y-4">

                {/* BANK TRANSFER */}
                {category === 'bank_transfer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BANK_OPTIONS.map(bank => (
                      <label key={bank.id} className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm focus:outline-none has-[:checked]:border-emerald-600 has-[:checked]:ring-1 has-[:checked]:ring-emerald-600 transition-all">
                        <input type="radio" name="payment_method_sel" value={bank.id} checked={method === bank.id} onChange={(e) => setMethod(e.target.value)} className="sr-only" />
                        <span className="flex flex-1 items-center justify-between">
                          <span className="font-medium text-slate-900">{bank.label}</span>
                          <CheckCircle className={`w-5 h-5 ${method === bank.id ? 'text-emerald-600' : 'text-slate-200'}`} />
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* E-WALLET */}
                {category === 'ewallet' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {EWALLET_OPTIONS.map(wallet => (
                      <label key={wallet.id} className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm focus:outline-none has-[:checked]:border-emerald-600 has-[:checked]:ring-1 has-[:checked]:ring-emerald-600 transition-all">
                        <input type="radio" name="payment_method_sel" value={wallet.id} checked={method === wallet.id} onChange={(e) => setMethod(e.target.value)} className="sr-only" />
                        <span className="flex flex-1 items-center justify-between">
                          <span className="font-medium text-slate-900">{wallet.label}</span>
                          <CheckCircle className={`w-5 h-5 ${method === wallet.id ? 'text-emerald-600' : 'text-slate-200'}`} />
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* VIRTUAL ACCOUNT */}
                {category === 'va' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {VA_OPTIONS.map(va => (
                      <label key={va.id} className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm focus:outline-none has-[:checked]:border-emerald-600 has-[:checked]:ring-1 has-[:checked]:ring-emerald-600 transition-all">
                        <input type="radio" name="payment_method_sel" value={va.id} checked={method === va.id} onChange={(e) => setMethod(e.target.value)} className="sr-only" />
                        <span className="flex flex-1 items-center justify-between">
                          <span className="font-medium text-slate-900">{va.label}</span>
                          <CheckCircle className={`w-5 h-5 ${method === va.id ? 'text-emerald-600' : 'text-slate-200'}`} />
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* QRIS */}
                {category === 'qris' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                    <QrCode className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">QRIS Pembayaran (Simulasi)</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                      Gunakan fitur scan QR pada aplikasi e-wallet atau m-banking Anda untuk melakukan pembayaran.
                    </p>
                    <div className="w-48 h-48 bg-white border border-slate-200 rounded-xl mx-auto flex items-center justify-center p-2">
                      <div className="w-full h-full border-4 border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50">
                        <span className="text-slate-400 text-sm font-medium">QRIS Placeholder</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASH */}
                {category === 'cash' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 rounded-full text-emerald-700">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 mb-1">Pembayaran Tunai di Kantor</h3>
                      <p className="text-sm text-emerald-700 leading-relaxed">
                        Silakan kunjungi kantor cabang kami untuk melakukan pembayaran tunai. Bawa nomor pendaftaran ini sebagai referensi. Pembayaran akan diverifikasi langsung oleh Admin saat Anda menyerahkan dana tunai.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* DYNAMIC INSTRUCTIONS */}
              {selectedBank && (
                <div className="mt-6 bg-slate-50 rounded-lg border border-slate-200 p-5">
                  <p className="text-sm text-slate-500 mb-3">Silakan transfer tepat sebesar <strong>Rp {numericAmount.toLocaleString('id-ID')}</strong> ke rekening berikut:</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded p-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{selectedBank.label}</p>
                      <p className="text-lg font-bold font-mono text-slate-900">{selectedBank.accNumber}</p>
                      <p className="text-sm text-slate-600 mt-1">a.n. {selectedBank.accName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedBank.accNumber)}
                      className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                    >
                      {copiedText === selectedBank.accNumber ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedText === selectedBank.accNumber ? 'Disalin' : 'Salin Nomor'}
                    </button>
                  </div>
                </div>
              )}

              {selectedEwallet && (
                <div className="mt-6 bg-slate-50 rounded-lg border border-slate-200 p-5">
                  <p className="text-sm text-slate-500 mb-3">Silakan transfer ke nomor {selectedEwallet.label} berikut:</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded p-4">
                    <div>
                      <p className="text-lg font-bold font-mono text-slate-900">{selectedEwallet.number}</p>
                      <p className="text-sm text-slate-600 mt-1">a.n. {selectedEwallet.accName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedEwallet.number)}
                      className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                    >
                      {copiedText === selectedEwallet.number ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedText === selectedEwallet.number ? 'Disalin' : 'Salin Nomor'}
                    </button>
                  </div>
                </div>
              )}

              {selectedVA && (
                <div className="mt-6 bg-amber-50 rounded-lg border border-amber-100 p-5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Informasi Virtual Account</h4>
                    <p className="text-sm text-amber-800">
                      Integrasi Virtual Account otomatis sedang dalam pengembangan. Untuk saat ini pembayaran VA akan diproses secara manual. Silakan gunakan metode Transfer Bank biasa jika memungkinkan.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* BAGIAN 3: UPLOAD BUKTI */}
          {category !== 'cash' && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Upload Bukti Pembayaran</h2>
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">Wajib</span>
              </div>
              <div className="p-6">
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-emerald-400 transition-all group"
                  >
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Klik untuk upload bukti pembayaran</p>
                    <p className="text-xs text-slate-500">Maks. 5MB (JPG, PNG, PDF)</p>
                    {fileError && <p className="text-xs font-medium text-red-500 mt-3">{fileError}</p>}
                  </div>
                ) : (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-emerald-100 rounded text-emerald-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline">Ganti</button>
                      <button type="button" onClick={removeFile} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  name="proof_file_hidden"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </section>
          )}

        </div>

        {/* KANAN: Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900">
              <h2 className="text-lg font-semibold text-white">Ringkasan Pembayaran</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-500">Nominal Tagihan</p>
                  <p className="font-semibold text-slate-900">Rp {numericAmount.toLocaleString('id-ID')}</p>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-500">Metode</p>
                  <p className="font-medium text-slate-900">{getMethodLabel()}</p>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-500">Biaya Admin</p>
                  <p className="font-medium text-emerald-600">Gratis</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Pembayaran</p>
                <p className="text-3xl font-bold text-emerald-600 mb-6">
                  Rp {numericAmount.toLocaleString('id-ID')}
                </p>

                <button
                  type="submit"
                  disabled={isLoading || (!method) || (category !== 'cash' && !file)}
                  className={`w-full py-3.5 px-4 rounded-xl text-base font-semibold flex justify-center items-center transition-all shadow-sm ${
                    isLoading || (!method) || (category !== 'cash' && !file)
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Konfirmasi Pembayaran
                    </span>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Transaksi Anda dijamin aman
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
