'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { deleteRegistration } from '@/app/dashboard/shared/actions/registrations';

interface RegistrationRow {
  id: string;
  code: string;
  jamaah_name: string;
  package_name: string;
  status: string;
  payment_status: 'Lunas' | 'Sebagian' | 'Belum Bayar' | string;
  reg_date: string;
}

interface RegistrationsClientProps {
  initialRegistrations: RegistrationRow[];
  role?: string;
  packagesList?: any[];
  jamaahList?: any[];
}

export default function RegistrationsClient({
  initialRegistrations,
  role = 'super_admin',
  packagesList = [],
}: RegistrationsClientProps) {
  const pathname = usePathname();
  const [registrations, setRegistrations] = useState<RegistrationRow[]>(initialRegistrations);
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [packageFilter, setPackageFilter] = useState('Semua Paket');

  // Determine base paths
  const isJamaah = role === 'jamaah' || pathname?.includes('/jamaah');
  const isMitra = role === 'mitra_agen' || pathname?.includes('/mitra');
  const isCabang = role === 'admin_cabang' || pathname?.includes('/admin_cabang');
  const isAdmin = role === 'admin' || pathname?.includes('/dashboard/admin/');
  const basePath = isJamaah
    ? '/dashboard/jamaah'
    : isMitra
    ? '/dashboard/mitra'
    : isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const dashboardHome = basePath;
  const registrationsUrl = `${basePath}/registrations`;

  // Unique packages for filter
  const packageOptions = useMemo(() => {
    const list = new Set<string>();
    registrations.forEach((r) => {
      if (r.package_name) list.add(r.package_name);
    });
    if (packagesList) {
      packagesList.forEach((p) => {
        if (p.name) list.add(p.name);
      });
    }
    return Array.from(list);
  }, [registrations, packagesList]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (statusFilter !== 'Semua Status') {
        if (reg.status !== statusFilter) return false;
      }
      if (packageFilter !== 'Semua Paket') {
        if (reg.package_name !== packageFilter) return false;
      }
      return true;
    });
  }, [registrations, statusFilter, packageFilter]);

  async function handleDelete(id: string, code: string) {
    if (confirm(`Yakin ingin membatalkan/menghapus pendaftaran ${code}?`)) {
      const res = await deleteRegistration(id);
      if (res?.error) {
        alert(res.error);
      } else {
        setRegistrations((prev) => prev.filter((r) => r.id !== id && r.code !== id));
      }
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
            <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
              Beranda
            </Link>
            <span>&gt;</span>
            <span className="text-slate-500 font-normal">Pendaftaran</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Pendaftaran
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {"Booking jamaah ke paket Umroh &amp; Haji"}
          </p>
        </div>

        {!isJamaah && (
          <Link
            href={`${registrationsUrl}/create`}
            style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Jamaah</span>
          </Link>
        )}
      </div>

      {/* Main Card with Filter & Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center gap-3">
          {/* Filter Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] rounded-lg border border-slate-200 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Dikonfirmasi">Dikonfirmasi</option>
              <option value="Pending">Pending</option>
              <option value="Batal">Batal</option>
              <option value="Selesai">Selesai</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Paket */}
          <div className="relative">
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="h-[36px] rounded-lg border border-slate-200 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="Semua Paket">Semua Paket</option>
              {packageOptions.map((pkg) => (
                <option key={pkg} value={pkg}>
                  {pkg}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            className="h-[36px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] hover:bg-slate-100 text-slate-700 text-[13px] font-medium transition-colors cursor-pointer"
          >
            Filter
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-transparent border-t border-b border-slate-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  KODE
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  JAMAAH
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  PAKET
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  STATUS
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  BAYAR
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  TGL DAFTAR
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    Tidak ada data pendaftaran ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* KODE */}
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-normal text-slate-800">
                      {reg.code}
                    </td>

                    {/* JAMAAH */}
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-slate-800">
                      {reg.jamaah_name}
                    </td>

                    {/* PAKET */}
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-700">
                      {reg.package_name}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e8f1fd] text-[#2b7fff]">
                        {reg.status}
                      </span>
                    </td>

                    {/* BAYAR */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reg.payment_status === 'Lunas' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#dcfce7] text-[#16a34a]">
                          Lunas
                        </span>
                      ) : reg.payment_status === 'Sebagian' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fef3c7] text-[#d97706]">
                          Sebagian
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fee2e2] text-[#ef4444]">
                          Belum Bayar
                        </span>
                      )}
                    </td>

                    {/* TGL DAFTAR */}
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-600">
                      {reg.reg_date}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[13px] font-medium space-x-3">
                      <Link
                        href={`${registrationsUrl}/${reg.id}`}
                        prefetch={false}
                        style={{ color: 'var(--brand-primary, #00c292)' }}
                        className="text-[#00c292] hover:opacity-80 transition-opacity font-medium cursor-pointer"
                      >
                        Detail
                      </Link>
                      {!isJamaah && (
                        <Link
                          href={`${registrationsUrl}/${reg.id}/edit`}
                          prefetch={false}
                          style={{ color: 'var(--brand-primary, #00c292)' }}
                          className="text-[#00c292] hover:opacity-80 transition-opacity font-medium cursor-pointer"
                        >
                          Edit
                        </Link>
                      )}
                      {!isMitra && !isJamaah && (
                        <button
                          type="button"
                          onClick={() => handleDelete(reg.id, reg.code)}
                          className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 transition-colors font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
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
