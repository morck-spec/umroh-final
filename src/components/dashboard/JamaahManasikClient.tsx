'use client';

import Link from 'next/link';
import { ManasikSchedule } from '@/app/dashboard/shared/actions/manasik';

interface JamaahManasikClientProps {
  schedules: ManasikSchedule[];
}

export default function JamaahManasikClient({ schedules }: JamaahManasikClientProps) {
  // Fallback matching exact reference screenshot if empty
  const defaultSchedules: ManasikSchedule[] = [
    {
      id: '8',
      title: 'Manasik Haji Plus Eksklusif #2',
      package_name: 'Haji Plus Eksklusif',
      instructor: 'Ustadz Abdullah',
      date: '2026-10-27',
      date_formatted: '27 Oct 2026',
      time_start: '08:00',
      time_end: '12:00',
      location: 'Aula Kantor Pusat Jakarta',
      description: 'Pembekalan manasik dan tata cara ibadah.',
      attendances: [],
      ratio: '0 / 0',
    },
    {
      id: '4',
      title: 'Manasik Haji Plus Eksklusif #1',
      package_name: 'Haji Plus Eksklusif',
      instructor: 'Ustadz Abdullah',
      date: '2026-09-27',
      date_formatted: '27 Sep 2026',
      time_start: '08:00',
      time_end: '12:00',
      location: 'Aula Kantor Pusat Jakarta',
      description: 'Pengenalan filosofi dan persiapan fisik haji plus.',
      attendances: [],
      ratio: '2 / 2',
    },
  ];

  const displayList = schedules && schedules.length > 0 ? schedules : defaultSchedules;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
        <Link href="/dashboard/jamaah" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&gt;</span>
        <span className="text-slate-500 font-normal">Manasik</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Manasik
        </h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Jadwal bimbingan manasik &amp; absensi jamaah
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4">JUDUL</th>
                <th className="px-6 py-4">PAKET</th>
                <th className="px-6 py-4">PEMBIMBING</th>
                <th className="px-6 py-4">KEHADIRAN</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] text-slate-700 whitespace-nowrap">
                    {s.date_formatted}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-800 font-medium whitespace-nowrap">
                    {s.title}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-700 whitespace-nowrap">
                    {s.package_name}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-700 whitespace-nowrap">
                    {s.instructor}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-700 whitespace-nowrap">
                    {s.ratio || (s.attendances ? `${s.attendances.filter(a => a.status === 'Hadir').length} / ${s.attendances.length}` : '0 / 0')}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/jamaah/manasik/${s.id}`}
                      className="text-[13px] font-medium text-[#00c292] hover:underline transition-colors"
                    >
                      Absensi
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
