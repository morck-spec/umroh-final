'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ManasikSchedule,
  updateManasikSchedule,
} from '@/app/dashboard/shared/actions/manasik';

interface Props {
  schedule: ManasikSchedule;
  packages: { id: string; name: string }[];
  guides: { id: string; name: string }[];
  basePath?: string;
}

export default function ManasikEditClient({
  schedule,
  packages,
  guides,
  basePath = '/dashboard/superadmin/manasik',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(schedule.title || '');
  const [packageName, setPackageName] = useState(schedule.package_name || '');
  const [instructor, setInstructor] = useState(schedule.instructor || '');
  const [date, setDate] = useState(schedule.date || '2026-10-27');
  const [location, setLocation] = useState(schedule.location || 'Aula Kantor Pusat Jakarta');
  const [timeStart, setTimeStart] = useState(schedule.time_start || '08:00');
  const [timeEnd, setTimeEnd] = useState(schedule.time_end || '12:00');
  const [description, setDescription] = useState(schedule.description || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) {
      alert('Judul dan tanggal wajib diisi');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('title', title);
      formData.set('package_name', packageName);
      formData.set('instructor', instructor);
      formData.set('date', date);
      formData.set('location', location);
      formData.set('time_start', timeStart);
      formData.set('time_end', timeEnd);
      formData.set('description', description);

      const res = await updateManasikSchedule(schedule.id, formData);
      if (res.error) {
        alert(res.error);
      } else {
        router.push(`${basePath}/${schedule.id}`);
        router.refresh();
      }
    });
  }

  const backHref = `${basePath}/${schedule.id}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href={basePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href={basePath} className="hover:text-slate-600 transition-colors">
          Manasik
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Edit</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Edit Jadwal Manasik</h1>
        <p className="text-xs text-slate-500 mt-1">{schedule.title}</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul * */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Contoh: Manasik Haji Plus Eksklusif #2"
            />
          </div>

          {/* Row: Paket & Pembimbing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paket
              </label>
              <select
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Manasik Umum (Semua Paket)</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Kosongkan untuk manasik umum cabang.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pembimbing
              </label>
              <select
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Pilih Pembimbing</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Tanggal & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lokasi
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Aula Kantor Pusat Jakarta"
              />
            </div>
          </div>

          {/* Row: Jam Mulai & Jam Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jam Mulai
              </label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jam Selesai
              </label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Pembekalan manasik dan tata cara ibadah."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <Link
              href={backHref}
              className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
