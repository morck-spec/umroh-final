'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { GuideItem, deleteGuide } from '@/app/dashboard/shared/actions/guides';

interface GuidesClientProps {
  initialGuides: GuideItem[];
  role: string;
}

export default function GuidesClient({ initialGuides, role }: GuidesClientProps) {
  const pathname = usePathname();
  const [guides, setGuides] = useState<GuideItem[]>(initialGuides);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  // Determine base path based on current role / url
  const isCabang = role === 'admin_cabang' || pathname.includes('/admin_cabang');
  const isAdmin = role === 'admin' || pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/guides'
    : isAdmin
    ? '/dashboard/admin/guides'
    : pathname.startsWith('/guides')
    ? '/guides'
    : '/dashboard/superadmin/guides';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const handleSearch = () => {
    setAppliedSearch(searchInput.trim());
  };

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      // Status filter
      if (statusFilter !== 'Semua Status') {
        const itemStatus = g.status || (g.is_active ? 'Aktif' : 'Nonaktif');
        if (itemStatus !== statusFilter) return false;
      }

      // Search filter (name or code)
      if (appliedSearch) {
        const q = appliedSearch.toLowerCase();
        const matchName = g.name?.toLowerCase().includes(q);
        const matchCode = g.code?.toLowerCase().includes(q);
        const matchPhone = g.phone?.toLowerCase().includes(q);
        const matchEmail = g.email?.toLowerCase().includes(q);
        const matchSpec = g.specialization?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchPhone && !matchEmail && !matchSpec) {
          return false;
        }
      }

      return true;
    });
  }, [guides, appliedSearch, statusFilter]);

  async function handleDelete(id: string, name: string) {
    if (confirm(`Yakin ingin menghapus muthawif "${name}"?`)) {
      const res = await deleteGuide(id);
      if (res?.error) {
        alert(res.error);
      } else {
        setGuides((prev) => prev.filter((g) => g.id !== id));
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
            <span className="text-slate-600 font-medium">Muthawif</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Muthawif / Pembimbing
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Daftar muthawif &amp; pembimbing ibadah
          </p>
        </div>

        <Link
          href={`${basePath}/create`}
          style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Muthawif</span>
        </Link>
      </div>

      {/* Main Card with Filter & Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Cari nama / kode..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            className="h-[36px] w-64 rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-2xs"
          />

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="h-[36px] px-4 rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            Cari
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  KODE / NAMA
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  GENDER
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  KONTAK
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  SPESIALISASI
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  AKUN
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  STATUS
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredGuides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    Tidak ada data muthawif ditemukan.
                  </td>
                </tr>
              ) : (
                filteredGuides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* KODE / NAMA */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[13px] font-semibold text-slate-800">{guide.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{guide.code}</div>
                    </td>

                    {/* GENDER */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guide.gender === 'Perempuan' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#fce7f3] text-[#ec4899]">
                          Perempuan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#e8f1fd] text-[#2b7fff]">
                          Laki-laki
                        </span>
                      )}
                    </td>

                    {/* KONTAK */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        style={{ color: 'var(--brand-primary, #00c292)' }}
                        className="text-[13px] font-medium text-[#00c292]"
                      >
                        {guide.phone || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{guide.email || '-'}</div>
                    </td>

                    {/* SPESIALISASI */}
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-700">
                      {guide.specialization || 'Fiqih Manasik'}
                    </td>

                    {/* AKUN */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guide.has_account ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f7ef] text-[#00a65a]">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guide.status === 'Aktif' || guide.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f7ef] text-[#00a65a]">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[13px] font-medium space-x-3">
                      <Link
                        href={`${basePath}/${guide.id}/edit`}
                        style={{ color: 'var(--brand-primary, #00c292)' }}
                        className="text-[#00c292] hover:opacity-80 transition-opacity font-medium cursor-pointer"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(guide.id, guide.name)}
                        className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 transition-colors font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
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
