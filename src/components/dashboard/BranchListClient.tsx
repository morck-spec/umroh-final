'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { BranchItem, deleteBranch } from '@/app/dashboard/shared/actions/branches';

interface BranchListClientProps {
  initialBranches: BranchItem[];
}

export default function BranchListClient({ initialBranches }: BranchListClientProps) {
  const [branches, setBranches] = useState<BranchItem[]>(initialBranches);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (!appliedSearch) return true;
      const q = appliedSearch.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    });
  }, [branches, appliedSearch]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus cabang "${name}"?`)) {
      const res = await deleteBranch(id);
      if (res.success) {
        setBranches((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert(res.error || 'Gagal menghapus cabang');
      }
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
              Beranda
            </Link>
            <span>&gt;</span>
            <span className="text-slate-600">Cabang</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Cabang</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Daftar cabang travel</p>
        </div>

        <Link
          href="/branches/create"
          style={{ backgroundColor: 'var(--brand-primary, #00d4b2)' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Cabang</span>
        </Link>
      </div>

      {/* Main Card with Filter & Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Cari nama atau kode ca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAppliedSearch(searchTerm);
            }}
            className="h-[34px] w-64 rounded-md border border-slate-300 px-3 text-[12px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
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
                <th className="py-3 px-4 sm:px-6">KODE</th>
                <th className="py-3 px-4">NAMA</th>
                <th className="py-3 px-4">KOTA</th>
                <th className="py-3 px-4">TELEPON</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 sm:px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[13px] text-slate-400">
                    Tidak ada cabang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors text-[12px]">
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-800 whitespace-nowrap">
                      {branch.code}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{branch.name}</span>
                        {branch.is_headquarters && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                            Pusat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {branch.city || '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {branch.contact_number || '-'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600">
                        {branch.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap space-x-3">
                      <Link
                        href={`/branches/${branch.id}/edit`}
                        className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      {!branch.is_headquarters && (
                        <button
                          type="button"
                          onClick={() => handleDelete(branch.id, branch.name)}
                          className="text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer"
                        >
                          Hapus
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
