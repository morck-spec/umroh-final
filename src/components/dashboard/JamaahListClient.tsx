'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { JamaahItem, deleteJamaah } from '@/app/dashboard/shared/actions/jamaah';

interface Props {
  initialJamaah: JamaahItem[];
  basePath?: string;
  role?: string;
}

export default function JamaahListClient({
  initialJamaah,
  basePath = '/dashboard/superadmin/jamaah',
  role = 'super_admin',
}: Props) {
  const pathname = usePathname();
  const isMitra = role === 'mitra_agen' || pathname.startsWith('/dashboard/mitra');
  const activeBasePath = isMitra
    ? '/dashboard/mitra/jamaah'
    : pathname.startsWith('/pilgrims')
    ? '/pilgrims'
    : pathname.startsWith('/jamaah')
    ? '/jamaah'
    : basePath;

  const [jamaahList, setJamaahList] = useState<JamaahItem[]>(initialJamaah);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('Semua Status');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchTerm);
    setAppliedStatus(selectedStatus);
  };

  const filteredJamaah = jamaahList.filter((j) => {
    if (appliedStatus !== 'Semua Status') {
      const statusToCheck = j.status || 'Aktif';
      if (statusToCheck.toLowerCase() !== appliedStatus.toLowerCase()) {
        return false;
      }
    }

    if (!appliedSearch.trim()) return true;
    const query = appliedSearch.toLowerCase().trim();
    return (
      j.full_name?.toLowerCase().includes(query) ||
      j.code?.toLowerCase().includes(query) ||
      j.nik?.toLowerCase().includes(query) ||
      j.passport_number?.toLowerCase().includes(query) ||
      j.phone?.toLowerCase().includes(query) ||
      j.email?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus data jamaah "${name}"?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const res = await deleteJamaah(id);
      if (res?.error) {
        alert(res.error);
      } else {
        setJamaahList((prev) => prev.filter((item) => item.id !== id && item.legacy_id !== id));
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={isMitra ? '/dashboard/mitra' : activeBasePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'}
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Jamaah</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jamaah</h1>
          <p className="text-xs text-slate-500 mt-1">Daftar jamaah umroh &amp; haji</p>
        </div>
        <Link
          href={`${activeBasePath}/create`}
          className="inline-flex items-center gap-1.5 bg-[#00c5a0] hover:bg-[#00b08f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jamaah</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama / NIK / paspo..."
          className="px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 w-64 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
        >
          <option value="Semua Status">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>

        <button
          type="submit"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-lg border border-slate-200/90 font-medium transition-colors shadow-sm"
        >
          Cari
        </button>
      </form>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4">KODE / NAMA</th>
                <th className="px-5 py-4">GENDER</th>
                <th className="px-5 py-4">NIK</th>
                <th className="px-5 py-4">KONTAK</th>
                <th className="px-5 py-4">PASPOR</th>
                <th className="px-5 py-4">AGEN</th>
                <th className="px-5 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredJamaah.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Belum ada data jamaah yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredJamaah.map((j) => {
                  const isMale = j.gender === 'L' || j.gender === 'Laki-laki';
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* KODE / NAMA */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-sm">
                          {j.full_name}
                        </div>
                        <div className="text-xs text-slate-400 font-normal mt-0.5">
                          {j.code}
                        </div>
                      </td>

                      {/* GENDER */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isMale ? (
                          <span className="inline-block px-3 py-0.5 text-xs font-medium rounded-full bg-[#e0f2fe] text-[#0284c7]">
                            Laki-laki
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-0.5 text-xs font-medium rounded-full bg-[#fce7f3] text-[#db2777]">
                            Perempuan
                          </span>
                        )}
                      </td>

                      {/* NIK */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-mono">
                        {j.nik || '-'}
                      </td>

                      {/* KONTAK */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs text-teal-600 font-medium">
                          {j.phone || '-'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {j.email || '-'}
                        </div>
                      </td>

                      {/* PASPOR */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-700 font-medium">
                          {j.passport_number || '-'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {j.passport_expiry_formatted ||
                            (j.passport_expiry_date ? `Exp ${j.passport_expiry_date}` : '-')}
                        </div>
                      </td>

                      {/* AGEN */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600">
                        {j.agent_name || '-'}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <div className="inline-flex items-center gap-3">
                          <Link
                            href={`${activeBasePath}/${j.id}`}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Lihat
                          </Link>
                          <Link
                            href={`${activeBasePath}/${j.id}/edit`}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Edit
                          </Link>
                          {!isMitra && (
                            <button
                              type="button"
                              disabled={isDeleting === j.id}
                              onClick={() => handleDelete(j.id, j.full_name)}
                              className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
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
