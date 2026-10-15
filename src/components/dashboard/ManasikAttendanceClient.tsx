'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, User, Users, Edit3, ArrowLeft } from 'lucide-react';
import {
  ManasikSchedule,
  saveManasikAttendance,
} from '@/app/dashboard/shared/actions/manasik';

interface Props {
  schedule: ManasikSchedule;
  stats: { hadir: number; izin: number; tidakHadir: number };
  basePath?: string;
}

export default function ManasikAttendanceClient({
  schedule: initialSchedule,
  stats: initialStats,
  basePath = '/dashboard/superadmin/manasik',
}: Props) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ManasikSchedule>(initialSchedule);
  const [isPending, startTransition] = useTransition();

  // Local attendance state mapped by jamaah_name
  const [statuses, setStatuses] = useState<Record<string, 'Hadir' | 'Izin' | 'Tidak Hadir'>>(() => {
    const map: Record<string, 'Hadir' | 'Izin' | 'Tidak Hadir'> = {};
    for (const a of initialSchedule.attendances || []) {
      map[a.jamaah_name] = a.status || 'Tidak Hadir';
    }
    return map;
  });

  // Calculate live stats based on local state
  const values = Object.values(statuses);
  const hadirCount = values.filter((s) => s === 'Hadir').length;
  const izinCount = values.filter((s) => s === 'Izin').length;
  const tidakHadirCount = values.filter((s) => s === 'Tidak Hadir').length;

  function handleStatusChange(name: string, newStatus: 'Hadir' | 'Izin' | 'Tidak Hadir') {
    setStatuses((prev) => ({ ...prev, [name]: newStatus }));
  }

  async function handleSaveAttendance() {
    startTransition(async () => {
      const payload = Object.entries(statuses).map(([name, status]) => ({
        jamaah_name: name,
        status,
      }));

      const res = await saveManasikAttendance(schedule.id, payload);
      if (res.error) {
        alert(res.error);
      } else {
        alert('Absensi berhasil disimpan!');
        router.refresh();
      }
    });
  }

  const editHref = `${basePath}/${schedule.id}/edit`;
  const backHref = basePath;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={
            basePath.includes('muthawif')
              ? '/dashboard/muthawif'
              : basePath.includes('jamaah')
              ? '/dashboard/jamaah'
              : basePath.includes('admin_cabang')
              ? '/dashboard/admin_cabang'
              : '/dashboard/superadmin'
          }
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href={basePath} className="hover:text-slate-600 transition-colors">
          Manasik
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium truncate max-w-xs">{schedule.title}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{schedule.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{schedule.date_formatted}</p>
        </div>
        {!basePath.includes('muthawif') && !basePath.includes('jamaah') && (
          <Link
            href={editHref}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </Link>
        )}
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hadir */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Hadir</p>
            <p className="text-2xl font-bold text-slate-800">{hadirCount}</p>
          </div>
        </div>

        {/* Izin */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Izin</p>
            <p className="text-2xl font-bold text-slate-800">{izinCount}</p>
          </div>
        </div>

        {/* Tidak Hadir */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Tidak Hadir</p>
            <p className="text-2xl font-bold text-slate-800">{tidakHadirCount}</p>
          </div>
        </div>
      </div>

      {/* Informasi Jadwal Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Informasi Jadwal</h2>
        <div className="divide-y divide-slate-100 text-sm">
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-500 text-xs sm:text-sm">Paket</span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">{schedule.package_name || '-'}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-500 text-xs sm:text-sm">Pembimbing</span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">{schedule.instructor || '-'}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-500 text-xs sm:text-sm">Waktu</span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">
              {schedule.time_start ? `${schedule.time_start}:00` : '08:00:00'} &ndash; {schedule.time_end ? `${schedule.time_end}:00` : '12:00:00'}
            </span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-500 text-xs sm:text-sm">Lokasi</span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">{schedule.location || 'Aula Kantor Pusat Jakarta'}</span>
          </div>
        </div>
      </div>

      {/* Absensi Jamaah Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Absensi Jamaah</h2>

        {Object.keys(statuses).length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Belum ada jamaah yang terdaftar di paket ini.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>JAMAAH</span>
              <span className="pr-2">KEHADIRAN</span>
            </div>

            <div className="divide-y divide-slate-100">
              {Object.entries(statuses).map(([name, status]) => (
                <div key={name} className="py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-800">{name}</span>
                  <div>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(name, e.target.value as 'Hadir' | 'Izin' | 'Tidak Hadir')}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Izin">Izin</option>
                      <option value="Tidak Hadir">Tidak Hadir</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isPending}
                className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
              >
                {isPending ? 'Menyimpan...' : 'Simpan Absensi'}
              </button>
              <Link
                href={backHref}
                className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Kembali
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
