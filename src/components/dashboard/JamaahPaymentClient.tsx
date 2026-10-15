'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { AlignJustify, CreditCard, Loader2 } from 'lucide-react';
import { RegistrationBilling, BillItem } from '@/app/dashboard/shared/actions/paymentBilling';
import { getSnapToken, completePaymentFromSnap } from '@/app/dashboard/shared/actions/midtrans';

interface JamaahPaymentClientProps {
  registration: RegistrationBilling | null;
}

export default function JamaahPaymentClient({ registration }: JamaahPaymentClientProps) {
  const router = useRouter();
  const [loadingBillId, setLoadingBillId] = useState<string | null>(null);

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-PFR-ZADek7INy34Y';

  function formatRp(n: number | undefined) {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  // Helper to ensure snap.js is loaded
  const ensureSnapLoaded = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if ((window as any).snap) return true;

    return new Promise((resolve) => {
      const existing = document.getElementById('midtrans-snap-script');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        setTimeout(() => resolve(!!(window as any).snap), 1500);
        return;
      }

      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fallback data matching Screenshot 1 if registration is empty
  const defaultBills: BillItem[] = [
    {
      id: '33',
      code: 'REG-00009-DP',
      type: 'Uang Muka (DP)',
      amount: 35000000,
      paid: 0,
      remaining: 35000000,
      status: 'Belum Bayar',
      due_date: '01 Aug 2026',
    },
    {
      id: '34',
      code: 'REG-00009-C1',
      type: 'Cicilan',
      amount: 43333333,
      paid: 0,
      remaining: 43333333,
      status: 'Belum Bayar',
      due_date: '30 Aug 2026',
    },
    {
      id: '35',
      code: 'REG-00009-C2',
      type: 'Cicilan',
      amount: 43333333,
      paid: 0,
      remaining: 43333333,
      status: 'Belum Bayar',
      due_date: '30 Sep 2026',
    },
    {
      id: '36',
      code: 'REG-00009-C3',
      type: 'Cicilan',
      amount: 43333334,
      paid: 0,
      remaining: 43333334,
      status: 'Belum Bayar',
      due_date: '30 Oct 2026',
    },
  ];

  const reg = registration || {
    id: '9',
    code: 'REG-00009',
    jamaah: { name: 'Ahmad Fauzi', passport: 'A1000001', phone: '081200000001' },
    package: { id: 'pkg-3', name: 'Haji Plus Eksklusif', type: 'Haji Plus', price: 165000000, departure_date: '10 Apr 2027' },
    status: 'Dikonfirmasi',
    reg_date: '30 Jul 2026',
    agent: 'Rahmat Hidayat',
    guide: 'Ustadz Abdullah',
    branch: 'Kantor Pusat Jakarta',
    total_amount: 165000000,
    paid_amount: 0,
    remaining_amount: 165000000,
    payment_status: 'Belum Bayar' as const,
    bills: defaultBills,
  };

  const bills = reg.bills && reg.bills.length > 0 ? reg.bills : defaultBills;

  async function handleBayarSekarang(bill: BillItem) {
    setLoadingBillId(bill.id);

    try {
      const [res] = await Promise.all([
        getSnapToken({
          billId: bill.id,
          billCode: bill.code,
          amount: bill.remaining || bill.amount,
          customerName: reg.jamaah?.name || 'Ahmad Fauzi',
        }),
        ensureSnapLoaded(),
      ]);

      setLoadingBillId(null);

      if (res.error) {
        alert(res.error);
        return;
      }

      if (!res.token) {
        alert('Gagal mendapatkan token transaksi Midtrans.');
        return;
      }

      // Check if official Snap.js is loaded
      if (typeof window !== 'undefined' && (window as any).snap) {
        (window as any).snap.pay(res.token, {
          onSuccess: async function (result: any) {
            console.log('Midtrans Snap Success:', result);
            await completePaymentFromSnap({
              billId: bill.id,
              amount: bill.remaining || bill.amount,
              paymentMethod: result.payment_type || 'midtrans',
            });
            // Redirect to Kwitansi Pembayaran
            router.push(`/receipt/${bill.id}`);
          },
          onPending: function (result: any) {
            console.log('Midtrans Snap Pending:', result);
            alert('Menunggu pembayaran Anda. Silakan selesaikan pembayaran di Midtrans Simulator.');
          },
          onError: function (result: any) {
            console.error('Midtrans Snap Error:', result);
            alert('Pembayaran gagal atau dibatalkan.');
          },
          onClose: function () {
            console.log('Midtrans Snap Closed');
          },
        });
      } else {
        alert('Script Midtrans Snap belum termuat sempurna. Silakan refresh halaman.');
      }
    } catch (err: any) {
      setLoadingBillId(null);
      alert('Terjadi kesalahan saat memproses pembayaran: ' + (err?.message || err));
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Official Midtrans Snap Script */}
      <Script
        id="midtrans-snap-script"
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={clientKey}
        strategy="afterInteractive"
      />

      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
          <Link href="/dashboard/jamaah" className="hover:text-slate-600 transition-colors">
            Beranda
          </Link>
          <span>&gt;</span>
          <span className="text-slate-500 font-normal">Pembayaran</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Pembayaran Umroh
        </h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Pantau tagihan dan lakukan pembayaran dengan mudah
        </p>
      </div>

      {/* Summary Box (Foto 1) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Total Biaya Paket */}
          <div className="md:pr-6">
            <p className="text-[12px] text-slate-400 font-normal">Total Biaya Paket</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
              {formatRp(reg.total_amount)}
            </p>
          </div>

          {/* Sudah Dibayar */}
          <div className="pt-4 md:pt-0 md:px-6">
            <p className="text-[12px] text-slate-400 font-normal">Sudah Dibayar</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-500 mt-1">
              {formatRp(reg.paid_amount)}
            </p>
          </div>

          {/* Sisa Pembayaran */}
          <div className="pt-4 md:pt-0 md:pl-6">
            <p className="text-[12px] text-slate-400 font-normal">Sisa Pembayaran</p>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-rose-500">
                {formatRp(reg.remaining_amount)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fee2e2] text-[#ef4444]">
                {reg.payment_status || 'Belum Bayar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-2 pt-2">
        <AlignJustify className="w-4 h-4 text-slate-400" />
        <h2 className="text-[13px] font-semibold text-slate-700">
          Rincian Tagihan &amp; Riwayat Pembayaran
        </h2>
      </div>

      {/* Bills Cards Container (Foto 1) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex-1">
              {/* Bill Title & Badge */}
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px] font-bold text-slate-800">{bill.type}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                    bill.status === 'Lunas'
                      ? 'bg-[#dcfce7] text-[#16a34a]'
                      : bill.status === 'Sebagian'
                      ? 'bg-[#fef3c7] text-[#d97706]'
                      : 'bg-[#fee2e2] text-[#ef4444]'
                  }`}
                >
                  {bill.status}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5">{bill.code}</p>

              {/* 4 Columns Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-3.5 pt-1">
                <div>
                  <p className="text-[11px] text-slate-400">Nominal Tagihan</p>
                  <p className="text-[13px] font-semibold text-slate-800 mt-0.5">
                    {formatRp(bill.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Telah Dibayar</p>
                  <p className="text-[13px] font-semibold text-emerald-500 mt-0.5">
                    {formatRp(bill.paid)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Kekurangan</p>
                  <p className="text-[13px] font-semibold text-rose-500 mt-0.5">
                    {formatRp(bill.remaining)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Jatuh Tempo</p>
                  <p className="text-[13px] text-slate-700 mt-0.5">{bill.due_date}</p>
                </div>
              </div>
            </div>

            {/* Action: Bayar Sekarang -> Triggers Official Midtrans Snap Popup! */}
            {bill.status !== 'Lunas' && (
              <div className="flex-shrink-0 self-start md:self-center">
                <button
                  type="button"
                  disabled={loadingBillId === bill.id}
                  onClick={() => handleBayarSekarang(bill)}
                  style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loadingBillId === bill.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memuat Midtrans...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Bayar Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
