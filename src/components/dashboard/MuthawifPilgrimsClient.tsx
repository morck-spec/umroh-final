'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MuthawifPilgrim } from '@/app/dashboard/shared/actions/muthawif';

interface Props {
  pilgrims: MuthawifPilgrim[];
}

export default function MuthawifPilgrimsClient({ pilgrims }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = pilgrims.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nik.includes(search) ||
      p.passport_number.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
        <Link href="/dashboard/muthawif" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&gt;</span>
        <span className="text-slate-500 font-normal">Jamaah</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Jamaah</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">Daftar jamaah umroh &amp; haji</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
        <input
          type="text"
          placeholder="Cari nama / NIK / paspor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-[34px] px-3 text-xs bg-white border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00c292] w-full sm:w-60 shadow-2xs transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-[34px] px-3 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-[#00c292] shadow-2xs cursor-pointer transition-colors"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
        <button
          type="button"
          style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
          className="h-[34px] px-4 text-xs font-medium text-white rounded-md shadow-2xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
        >
          Cari
        </button>
      </div>

      {/* Table Card (Foto 1) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">KODE / NAMA</th>
                <th className="px-6 py-4">GENDER</th>
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">KONTAK</th>
                <th className="px-6 py-4">PASPOR</th>
                <th className="px-6 py-4">AGEN</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-400">
                    Tidak ada jamaah bimbingan ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Kode / Nama */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[13px] font-medium text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.code}</div>
                    </td>

                    {/* Gender */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#e0f2fe] text-[#0284c7]">
                        {item.gender || 'Laki-laki'}
                      </span>
                    </td>

                    {/* NIK */}
                    <td className="px-6 py-4 text-[13px] text-slate-700 whitespace-nowrap">
                      {item.nik}
                    </td>

                    {/* Kontak */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[13px] text-[#00c292] font-normal">{item.phone}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.email}</div>
                    </td>

                    {/* Paspor */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[13px] text-slate-800 font-normal">{item.passport_number}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.passport_expiry}</div>
                    </td>

                    {/* Agen */}
                    <td className="px-6 py-4 text-[13px] text-slate-700 whitespace-nowrap">
                      {item.agent_name || '-'}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/muthawif/pilgrims/${item.id}`}
                        className="text-[13px] font-medium text-[#00c292] hover:underline transition-colors"
                      >
                        Lihat
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
