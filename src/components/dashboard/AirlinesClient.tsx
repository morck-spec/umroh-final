'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Plane, Plus, Trash2 } from 'lucide-react';
import { Airline, deleteAirline } from '@/app/dashboard/shared/actions/masterData';

interface AirlinesClientProps {
  initialAirlines: Airline[];
  source?: 'supabase' | 'local';
}

export default function AirlinesClient({ initialAirlines, source = 'local' }: AirlinesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [airlines, setAirlines] = useState<Airline[]>(initialAirlines);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/airlines'
    : isAdmin
    ? '/dashboard/admin/airlines'
    : pathname.startsWith('/airlines')
    ? '/airlines'
    : '/dashboard/superadmin/airlines';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const filtered = airlines.filter((a) => {
    if (!appliedSearch) return true;
    const lower = appliedSearch.toLowerCase();
    return a.name.toLowerCase().includes(lower) || a.code.toLowerCase().includes(lower);
  });

  async function handleDelete(airline: Airline) {
    if (!confirm(`Yakin ingin menghapus maskapai "${airline.name}"?`)) return;

    startTransition(async () => {
      const res = await deleteAirline(airline.id);
      if (res.error) {
        alert(res.error);
      } else {
        setAirlines((prev) => prev.filter((a) => a.id !== airline.id));
        router.refresh();
      }
    });
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
            <span className="text-slate-600 font-medium">Maskapai</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Maskapai</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Daftar maskapai penerbangan</p>
        </div>

        <Link
          href={`${basePath}/create`}
          style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Maskapai</span>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5 border-b border-slate-100 bg-white">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAppliedSearch(search);
            }}
            placeholder="Cari nama maskapai..."
            className="h-[34px] w-64 rounded-md border border-slate-300 px-3 text-[12px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onClick={() => setAppliedSearch(search)}
            className="h-[34px] px-4 rounded-md bg-slate-100 hover:bg-slate-200 text-[12px] font-medium text-slate-700 transition-colors cursor-pointer"
          >
            Cari
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">NAMA</th>
                <th className="px-5 py-3.5">KODE</th>
                <th className="px-5 py-3.5">TRANSIT</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
                    <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Belum ada data maskapai.
                  </td>
                </tr>
              ) : (
                filtered.map((airline) => (
                  <tr key={airline.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800">{airline.name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                        {airline.code || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{airline.transit || 'Langsung'}</td>
                    <td className="px-5 py-4">
                      {airline.is_active ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E7F6EC] text-[#16A34A]">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-3">
                      <Link
                        href={`${basePath}/${airline.id}/edit`}
                        className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(airline)}
                        className="text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer"
                      >
                        Hapus
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
