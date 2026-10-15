'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Pencil, CreditCard, Landmark, FileText } from 'lucide-react';
import { RegistrationBilling, updateRegistrationStatusAction } from '@/app/dashboard/shared/actions/paymentBilling';

interface Props {
  registration: RegistrationBilling;
  basePath?: string;
}

export default function RegistrationDetailClient({
  registration: initialReg,
  basePath = '/dashboard/superadmin',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [reg, setReg] = useState(initialReg);
  const [selectedStatus, setSelectedStatus] = useState(reg.status || 'Dikonfirmasi');
  const [isPending, startTransition] = useTransition();

  // Determine paths
  const isJamaah =
    basePath?.includes('/jamaah') ||
    pathname?.includes('/jamaah') ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/jamaah'));

  const isMitra =
    !isJamaah &&
    (basePath?.includes('/mitra') ||
      pathname?.includes('/mitra') ||
      (typeof window !== 'undefined' && window.location.pathname.includes('/mitra')) ||
      reg.agent === 'Hasan Basri' ||
      reg.code === 'REG-00007' ||
      reg.code === 'REG-00004');

  const isCabang = !isJamaah && (pathname?.includes('/admin_cabang') || basePath?.includes('/admin_cabang'));
  const isAdmin = !isJamaah && (pathname?.includes('/dashboard/admin/') || basePath?.includes('/dashboard/admin'));
  const rootBase = isJamaah
    ? '/dashboard/jamaah'
    : isMitra
    ? '/dashboard/mitra'
    : isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : basePath || '/dashboard/superadmin';

  const dashboardHome = rootBase;
  const registrationsUrl = `${rootBase}/registrations`;
  const paymentsUrl = isJamaah ? '/dashboard/jamaah/payment' : `${rootBase}/payments`;
  const editUrl = `${registrationsUrl}/${reg.id}/edit`;

  function formatRp(n: number | undefined) {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateRegistrationStatusAction(reg.id, selectedStatus);
      if (res.error) {
        alert(res.error);
      } else {
        setReg((prev) => ({ ...prev, status: selectedStatus }));
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
        <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&gt;</span>
        <Link href={registrationsUrl} className="hover:text-slate-600 transition-colors">
          Pendaftaran
        </Link>
        <span>&gt;</span>
        <span className="text-slate-600 font-medium">{reg.code}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {reg.jamaah?.name}
          </h1>
          <p className="text-[12px] text-slate-400 mt-0.5">{reg.code}</p>
        </div>

        {!isJamaah && (
          <Link
            href={editUrl}
            prefetch={false}
            style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all self-start sm:self-auto cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
        )}
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tagihan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-lg bg-[#E8EFFC] text-[#3B6FD8] flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Total Tagihan</p>
            <p className="text-lg font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(reg.total_amount)}
            </p>
          </div>
        </div>

        {/* Sudah Dibayar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-lg bg-[#E7F6EC] text-[#16A34A] flex items-center justify-center flex-shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Sudah Dibayar</p>
            <p className="text-lg font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(reg.paid_amount)}
            </p>
          </div>
        </div>

        {/* Sisa */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-lg bg-[#FDF5E1] text-[#D99A0B] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-normal">Sisa</p>
            <p className="text-lg font-bold text-slate-800 truncate leading-tight mt-0.5">
              {formatRp(reg.remaining_amount)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{reg.payment_status}</p>
          </div>
        </div>
      </div>

      {/* Two Column Cards: Informasi Pendaftaran & Jamaah/Paket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Informasi Pendaftaran */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-[14px] font-bold text-slate-800">Informasi Pendaftaran</h2>

          <div className="space-y-3 text-[13px]">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Status</span>
              <span className="bg-[#E8EFFC] text-[#3B6FD8] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                {reg.status}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Tanggal Daftar</span>
              <span className="text-slate-700 font-medium">{reg.reg_date}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Harga Paket</span>
              <span className="text-slate-700 font-medium">{formatRp(reg.package?.price)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Agen</span>
              <span className="text-slate-700 font-medium">{reg.agent || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Pembimbing</span>
              <span className="text-slate-700 font-medium">{reg.guide || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Cabang</span>
              <span className="text-slate-700 font-medium">{reg.branch || 'Kantor Pusat Jakarta'}</span>
            </div>
          </div>

          {/* Ubah Status - Only for Admin/Staff, NOT for Jamaah */}
          {!isJamaah && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[12px] font-semibold text-slate-700 mb-2">Ubah Status</p>
              <form onSubmit={handleSaveStatus} className="flex items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 h-[36px] px-3 rounded-md border border-slate-300 bg-white text-[13px] text-slate-700 focus:outline-none focus:border-teal-500 shadow-2xs"
                >
                  <option value="Dikonfirmasi">Dikonfirmasi</option>
                  <option value="Pending">Pending</option>
                  <option value="Batal">Batal</option>
                  <option value="Selesai">Selesai</option>
                </select>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
                  className="h-[36px] px-5 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? '...' : 'Simpan'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right: Jamaah & Paket */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-[14px] font-bold text-slate-800">Jamaah &amp; Paket</h2>

          <div className="space-y-3 text-[13px]">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Jamaah</span>
              <span className="text-slate-700 font-medium">{reg.jamaah?.name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">No. Paspor</span>
              <span className="text-slate-700 font-medium">{reg.jamaah?.passport || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Telepon</span>
              <span className="text-slate-700 font-medium">{reg.jamaah?.phone || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Paket</span>
              <span className="text-slate-700 font-medium">{reg.package?.name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Jenis Paket</span>
              <span className="bg-[#E7F6EC] text-[#16A34A] rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                {reg.package?.type || 'Umroh'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Tanggal Berangkat</span>
              <span className="text-slate-700 font-medium">{reg.package?.departure_date || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Tagihan & Pembayaran Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-slate-800">Tagihan &amp; Pembayaran</h2>
          <Link
            href={isJamaah ? '/dashboard/jamaah/payment' : `${paymentsUrl}?search=${encodeURIComponent(reg.code)}`}
            style={{ color: 'var(--brand-primary, #00c292)' }}
            className="text-[13px] font-medium text-[#00c292] hover:opacity-80 transition-opacity"
          >
            Kelola Tagihan
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  KODE
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  JENIS
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  TAGIHAN
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  DIBAYAR
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  STATUS
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  JATUH TEMPO
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {!reg.bills || reg.bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    Belum ada rincian tagihan untuk pendaftaran ini.
                  </td>
                </tr>
              ) : (
                reg.bills.map((bill) => (
                  <tr key={bill.id || bill.code} className="hover:bg-slate-50/70 transition-colors">
                    {/* KODE */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] font-medium text-slate-800">
                      {bill.code}
                    </td>

                    {/* JENIS */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {bill.type.includes('DP') || bill.type.includes('Muka') ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E8EFFC] text-[#3B6FD8]">
                          {bill.type}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF5E1] text-[#D99A0B]">
                          {bill.type}
                        </span>
                      )}
                    </td>

                    {/* TAGIHAN */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] text-slate-700">
                      {formatRp(bill.amount)}
                    </td>

                    {/* DIBAYAR */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] text-slate-700">
                      {formatRp(bill.paid)}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {bill.status === 'Lunas' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#dcfce7] text-[#16a34a]">
                          Lunas
                        </span>
                      ) : bill.status === 'Sebagian' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fef3c7] text-[#d97706]">
                          Sebagian
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fee2e2] text-[#ef4444]">
                          Belum Bayar
                        </span>
                      )}
                    </td>

                    {/* JATUH TEMPO */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] text-slate-600">
                      {bill.due_date}
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
