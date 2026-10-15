'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateMassBillingAction } from '@/app/dashboard/shared/actions/paymentBilling';

interface Props {
  packages: { id: string; name: string; price: number }[];
  basePath?: string;
}

export default function GenerateMassBillingClient({
  packages,
  basePath = '/dashboard/superadmin',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPkg, setSelectedPkg] = useState('');
  const [dpAmount, setDpAmount] = useState('');
  const [installments, setInstallments] = useState(3);
  const [firstDueDate, setFirstDueDate] = useState('2026-11-14');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('package_id', selectedPkg);
    formData.append('dp_amount', dpAmount);
    formData.append('installments_count', String(installments));
    formData.append('first_due_date', firstDueDate);

    startTransition(async () => {
      const res = await generateMassBillingAction(formData);
      if (res && res.error) {
        alert(res.error);
      } else {
        router.push(`${basePath}/payments`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
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
        <span className="text-slate-600 font-medium">Tagihan Massal</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Buat Tagihan Massal</h1>
        <p className="text-xs text-slate-500 mt-1">
          Buat skema DP &amp; cicilan untuk seluruh jamaah aktif sebuah paket
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Paket */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paket <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPkg}
              onChange={(e) => setSelectedPkg(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#0F9488]"
            >
              <option value="">— Pilih Paket —</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — Rp {pkg.price.toLocaleString('id-ID')}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Hanya pendaftaran aktif yang belum memiliki tagihan yang akan diproses.
            </p>
          </div>

          {/* Row: DP & Cicilan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Uang Muka / DP (opsional)
              </label>
              <input
                type="number"
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value)}
                placeholder=""
                className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#0F9488]"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">Kosongkan jika tanpa DP.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jumlah Cicilan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                required
                className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#0F9488]"
              />
            </div>
          </div>

          {/* Jatuh Tempo Cicilan Pertama */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jatuh Tempo Cicilan Pertama
            </label>
            <div className="relative">
              <input
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#0F9488]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-lg bg-[#0F9488] hover:bg-[#0D7E74] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isPending ? 'Memproses...' : 'Buat Tagihan Massal'}
            </button>
            <Link
              href={`${basePath}/payments`}
              className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
