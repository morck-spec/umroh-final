'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Trash2 } from 'lucide-react';
import { ManasikSchedule, deleteManasikSchedule } from '@/app/dashboard/shared/actions/manasik';

interface Props {
  initialSchedules: ManasikSchedule[];
  basePath?: string;
}

export default function ManasikListClient({
  initialSchedules,
  basePath = '/dashboard/superadmin/manasik',
}: Props) {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ManasikSchedule[]>(initialSchedules);
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus jadwal "${title}"? Data absensi terkait juga akan dihapus.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteManasikSchedule(id);
      if (res.error) {
        alert(res.error);
      } else {
        setSchedules((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    });
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
        <Link href={basePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Manasik</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manasik</h1>
          <p className="text-xs text-slate-500 mt-1">Jadwal bimbingan manasik &amp; absensi jamaah</p>
        </div>
        <Link
          href={`${basePath}/create`}
          className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0f766e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Tambah Jadwal</span>
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">TANGGAL</th>
                <th className="px-5 py-3.5">JUDUL</th>
                <th className="px-5 py-3.5">PAKET</th>
                <th className="px-5 py-3.5">PEMBIMBING</th>
                <th className="px-5 py-3.5">KEHADIRAN</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Belum ada jadwal manasik.
                  </td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {s.date_formatted}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap text-sm">
                      {s.title}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {s.package_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {s.instructor}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm font-medium">
                      {s.ratio || '0 / 0'}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`${basePath}/${s.id}`}
                          className="px-3 py-1 rounded border border-[#0D9488] text-[#0D9488] hover:bg-teal-50 text-xs font-semibold transition-colors"
                        >
                          Absensi
                        </Link>
                        <Link
                          href={`${basePath}/${s.id}/edit`}
                          className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id, s.title)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
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
