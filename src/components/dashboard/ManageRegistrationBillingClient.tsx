'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlignJustify, CreditCard, Landmark, FileText, CheckCircle2 } from 'lucide-react';
import { RegistrationBilling, payBillAction } from '@/app/dashboard/shared/actions/paymentBilling';

interface Props {
  billing: RegistrationBilling;
  basePath?: string;
}

export default function ManageRegistrationBillingClient({
  billing: initialBilling,
  basePath = '/dashboard/superadmin',
}: Props) {
  const router = useRouter();
  const [billing, setBilling] = useState(initialBilling);
  const [isPending, startTransition] = useTransition();
  const [activeModalBill, setActiveModalBill] = useState<string | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');

  function formatRp(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function handlePay(billId: string, amountRemaining: number) {
    setActiveModalBill(billId);
    setPayAmountInput(String(amountRemaining));
  }

  function submitPay(e: React.FormEvent) {
    e.preventDefault();
    if (!activeModalBill) return;

    startTransition(async () => {
      const res = await payBillAction(billing.id, activeModalBill, Number(payAmountInput));
      if (res.error) {
        alert(res.error);
      } else {
        setActiveModalBill(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href={basePath} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href={`${basePath}/payments`} className="hover:text-slate-600 transition-colors">
          Pembayaran
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">{billing.code}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Tagihan: {billing.jamaah.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{billing.code}</p>
        </div>
        <Link
          href={`${basePath}/registrations/${billing.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-colors"
        >
          <AlignJustify className="w-4 h-4 text-slate-500" />
          <span>Detail Pendaftaran</span>
        </Link>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tagihan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#E8EFFC] text-[#3B6FD8] flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Total Tagihan</p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(billing.total_amount)}
            </p>
          </div>
        </div>

        {/* Sudah Dibayar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#E7F6EC] text-[#16A34A] flex items-center justify-center flex-shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Sudah Dibayar</p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(billing.paid_amount)}
            </p>
          </div>
        </div>

        {/* Sisa */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#FDF5E1] text-[#D99A0B] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Sisa</p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(billing.remaining_amount)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{billing.payment_status}</p>
          </div>
        </div>
      </div>

      {/* Card: Daftar Tagihan */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Daftar Tagihan</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {billing.bills.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada skema tagihan untuk pendaftaran ini.
            </div>
          ) : (
            billing.bills.map((b) => (
              <div
                key={b.id || b.code}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">{b.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        b.type.includes('DP')
                          ? 'bg-[#E8EFFC] text-[#3B6FD8]'
                          : 'bg-[#FDF5E1] text-[#D99A0B]'
                      }`}
                    >
                      {b.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        b.status === 'Lunas'
                          ? 'bg-[#E7F6EC] text-[#16A34A]'
                          : b.status === 'Sebagian'
                          ? 'bg-[#FDF5E1] text-[#D99A0B]'
                          : 'bg-[#FEECEC] text-[#DC2626]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tagihan <span className="font-medium text-slate-700">{formatRp(b.amount)}</span> ·
                    Dibayar <span className="font-medium text-slate-700">{formatRp(b.paid)}</span> · Sisa{' '}
                    <span className={`font-medium ${b.remaining > 0 ? 'text-[#DC2626]' : 'text-slate-700'}`}>
                      {formatRp(b.remaining)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    Jatuh tempo: {b.due_date}
                  </span>

                  {b.remaining > 0 && (
                    <button
                      type="button"
                      onClick={() => handlePay(b.id || b.code, b.remaining)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F9488] hover:bg-[#0D7E74] text-white text-xs font-medium shadow-sm transition-colors"
                    >
                      Verifikasi Bayar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pay Modal */}
      {activeModalBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Verifikasi / Catat Pembayaran</h3>
            <form onSubmit={submitPay} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Nominal Pembayaran</label>
                <input
                  type="number"
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#0F9488]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalBill(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg bg-[#0F9488] hover:bg-[#0D7E74] text-white text-xs font-medium"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
