'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PilgrimWithDocs } from '@/app/dashboard/shared/actions/documents';

interface DocumentsClientProps {
  initialPilgrims: PilgrimWithDocs[];
  basePath?: string;
}

export default function DocumentsClient({ initialPilgrims, basePath = '/dashboard/superadmin/documents' }: DocumentsClientProps) {
  const [pilgrims, setPilgrims] = useState<PilgrimWithDocs[]>(initialPilgrims);
  const [search, setSearch] = useState('');

  const filtered = pilgrims.filter((p) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return p.name.toLowerCase().includes(lower) || p.code.toLowerCase().includes(lower);
  });

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
        <Link href="/dashboard/superadmin" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Dokumen</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dokumen Jamaah</h1>
        <p className="text-xs text-slate-500 mt-1">Kelengkapan &amp; verifikasi dokumen per jamaah</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100 bg-white">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama jamaah..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0D9488] focus:border-[#0D9488]"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition-colors"
          >
            Cari
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">JAMAAH</th>
                <th className="px-5 py-3.5">CABANG</th>
                <th className="px-5 py-3.5">KELENGKAPAN</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Belum ada jamaah yang terdaftar.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const verified = p.verified_count ?? 0;
                  const total = p.total_count ?? 6;
                  const pct = total > 0 ? (verified / total) * 100 : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-800">{p.name}</td>
                      <td className="px-5 py-4 text-slate-600">{p.branch || 'Kantor Pusat Jakarta'}</td>
                      <td className="px-5 py-4 w-56">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#0D9488] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 font-mono shrink-0">
                            {verified}/{total}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {total === 0 ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Belum ada
                          </span>
                        ) : verified >= total ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E7F6EC] text-[#16A34A]">
                            Lengkap
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706]">
                            Proses
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`${basePath}/${p.id}`}
                          className="text-[#0D9488] hover:underline font-medium text-sm"
                        >
                          Kelola
                        </Link>
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
