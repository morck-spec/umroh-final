'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Banknote, Ban, AlertCircle, Plus, ChevronDown } from 'lucide-react';
import { FlatBillRow, PaymentSummary } from '@/app/dashboard/shared/actions/paymentBilling';

interface Props {
  summary: PaymentSummary;
  bills: FlatBillRow[];
  basePath?: string;
}

export default function PaymentsDashboardClient({
  summary,
  bills,
  basePath = '/dashboard/superadmin',
}: Props) {
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [jenisFilter, setJenisFilter] = useState('Semua Jenis');

  const filteredBills = bills.filter((b) => {
    if (statusFilter !== 'Semua Status' && b.status !== statusFilter) return false;
    if (jenisFilter !== 'Semua Jenis') {
      if (jenisFilter === 'Uang Muka (DP)' && !b.type.includes('DP')) return false;
      if (jenisFilter === 'Cicilan' && !b.type.includes('Cicilan')) return false;
    }
    return true;
  });

  function formatRp(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href={basePath} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Pembayaran</span>
      </nav>

      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard Pembayaran</h1>
          <p className="text-xs text-slate-500 mt-1">Ringkasan tagihan &amp; verifikasi bukti transfer</p>
        </div>
        <Link
          href={`${basePath}/payments/generate-massal`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F9488] hover:bg-[#0D7E74] text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tagihan Massal</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Tagihan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#E8EFFC] text-[#3B6FD8] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Total Tagihan</p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(summary.total_bills)}
            </p>
          </div>
        </div>

        {/* Card 2: Total Pembayaran Masuk */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#E7F6EC] text-[#16A34A] flex items-center justify-center flex-shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Total Pembayaran Masuk</p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(summary.total_paid)}
            </p>
          </div>
        </div>

        {/* Card 3: Total Belum Dibayar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#FDF5E1] text-[#D99A0B] flex items-center justify-center flex-shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Total Belum Dibayar</p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(summary.total_unpaid)}
            </p>
          </div>
        </div>

        {/* Card 4: Menunggu Verifikasi */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#FEECEC] text-[#DC2626] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Menunggu Verifikasi</p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {summary.pending_verification}
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Header with Filters */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Daftar Tagihan Jamaah</h2>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0F9488]"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Lunas">Lunas</option>
                <option value="Sebagian">Sebagian</option>
                <option value="Belum Bayar">Belum Bayar</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={jenisFilter}
                onChange={(e) => setJenisFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0F9488]"
              >
                <option value="Semua Jenis">Semua Jenis</option>
                <option value="Uang Muka (DP)">Uang Muka (DP)</option>
                <option value="Cicilan">Cicilan</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <button
              type="button"
              className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-[#FAFBFD]">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">KODE</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">JAMAAH</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PAKET</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">TOTAL TAGIHAN</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">DIBAYAR</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">SISA</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">STATUS</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-xs text-slate-400">
                    Tidak ada tagihan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {b.code}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-800 whitespace-nowrap">
                      {b.jamaah_name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {b.package_name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 whitespace-nowrap font-medium">
                      {formatRp(b.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 whitespace-nowrap">
                      {formatRp(b.paid)}
                    </td>
                    <td className={`px-5 py-3.5 text-xs whitespace-nowrap ${b.remaining > 0 ? 'text-[#DC2626] font-medium' : 'text-slate-600'}`}>
                      {formatRp(b.remaining)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          b.status === 'Lunas'
                            ? 'bg-[#E7F6EC] text-[#16A34A]'
                            : b.status === 'Sebagian'
                            ? 'bg-[#FDF5E1] text-[#D99A0B]'
                            : 'bg-[#FEECEC] text-[#DC2626]'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`${basePath}/payments/registration/${b.registration_id}`}
                        className="text-xs font-medium text-[#0F9488] hover:underline"
                      >
                        Kelola &amp; Verifikasi
                      </Link>
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
