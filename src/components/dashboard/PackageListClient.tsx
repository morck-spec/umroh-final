'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PackageItem, deletePackage } from '@/app/dashboard/shared/actions/packages';

interface PackageListClientProps {
  initialPackages: PackageItem[];
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatRupiah(amount: number): string {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

export default function PackageListClient({ initialPackages }: PackageListClientProps) {
  const pathname = usePathname();
  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/packages'
    : isAdmin
    ? '/dashboard/admin/packages'
    : pathname.startsWith('/packages')
    ? '/packages'
    : '/dashboard/superadmin/packages';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (selectedType !== 'all' && pkg.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      if (selectedStatus !== 'all' && pkg.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      if (appliedSearch) {
        const q = appliedSearch.toLowerCase();
        const matchName = pkg.name.toLowerCase().includes(q);
        const matchCode = (pkg.code || '').toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }
      return true;
    });
  }, [packages, appliedSearch, selectedType, selectedStatus]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus paket "${name}"?`)) {
      const res = await deletePackage(id);
      if (res.success) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error || 'Gagal menghapus paket');
      }
    }
  };

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
            <span className="text-slate-600">Paket</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Paket</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Daftar paket Umroh &amp; Haji</p>
        </div>

        <Link
          href={`${basePath}/create`}
          style={{ backgroundColor: 'var(--brand-primary, #00d4b2)' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket</span>
        </Link>
      </div>

      {/* Main Card with Filters & Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar matching Photo 2 */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Cari nama / kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAppliedSearch(searchTerm);
            }}
            className="h-[34px] w-56 rounded-md border border-slate-300 px-3 text-[12px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />

          {/* Jenis Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-[34px] rounded-md border border-slate-300 bg-white px-3 pr-8 text-[12px] text-slate-700 appearance-none focus:outline-none focus:border-teal-500 cursor-pointer min-w-[130px]"
            >
              <option value="all">Semua Jenis</option>
              <option value="umroh">Umroh</option>
              <option value="haji">Haji</option>
              <option value="haji plus">Haji Plus</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-[34px] rounded-md border border-slate-300 bg-white px-3 pr-8 text-[12px] text-slate-700 appearance-none focus:outline-none focus:border-teal-500 cursor-pointer min-w-[130px]"
            >
              <option value="all">Semua Status</option>
              <option value="dibuka">Dibuka</option>
              <option value="penuh">Penuh</option>
              <option value="selesai">Selesai</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAppliedSearch(searchTerm)}
            className="h-[34px] px-4 rounded-md border border-slate-300 bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cari
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                <th className="py-3 px-4 sm:px-6">KODE / NAMA</th>
                <th className="py-3 px-4">JENIS</th>
                <th className="py-3 px-4">HARGA</th>
                <th className="py-3 px-4">KUOTA</th>
                <th className="py-3 px-4">BERANGKAT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 sm:px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[13px] text-slate-400">
                    Tidak ada paket ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  let badgeBg = 'bg-emerald-50 text-emerald-600';
                  if (pkg.type.toLowerCase().includes('haji plus')) badgeBg = 'bg-purple-50 text-purple-600';
                  else if (pkg.type.toLowerCase().includes('haji')) badgeBg = 'bg-blue-50 text-blue-600';

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors text-[12px]">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-medium text-slate-800 text-[13px]">{pkg.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pkg.code}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeBg}`}>
                          {pkg.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {formatRupiah(pkg.price)}
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        {pkg.registered_count || 0}/{pkg.quota}
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(pkg.departure_date)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600">
                          {pkg.status || 'Dibuka'}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap space-x-3">
                        <Link
                          href={`${basePath}/${pkg.id}`}
                          className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                          Detail
                        </Link>
                        <Link
                          href={`${basePath}/${pkg.id}/edit`}
                          className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          className="text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
