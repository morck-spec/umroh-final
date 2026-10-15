'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Airline, saveAirline } from '@/app/dashboard/shared/actions/masterData';

interface AirlineFormClientProps {
  airline?: Airline | null;
  isCreate?: boolean;
}

export default function AirlineFormClient({ airline, isCreate = false }: AirlineFormClientProps) {
  const router = useRouter();
  const pathname = usePathname();
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

  const [name, setName] = useState(airline?.name || '');
  const [code, setCode] = useState(airline?.code || '');
  const [transit, setTransit] = useState(airline?.transit || '');
  const [isActive, setIsActive] = useState(airline ? airline.is_active : true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama maskapai wajib diisi');
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('code', code.trim().toUpperCase());
      fd.append('transit', transit.trim());
      if (isActive) fd.append('is_active', 'on');

      const res = await saveAirline(airline ? airline.id : null, fd);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push(basePath);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4 max-w-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
        <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&gt;</span>
        <Link href={basePath} className="hover:text-slate-600 transition-colors">
          Maskapai
        </Link>
        <span>&gt;</span>
        <span className="text-slate-600 font-medium">
          {isCreate ? 'Tambah' : 'Edit'}
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {isCreate ? 'Tambah Maskapai' : 'Edit Maskapai'}
        </h1>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          {/* Nama Maskapai */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Nama Maskapai <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Saudi Arabian Airlines"
              className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* Row 2: Kode & Transit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Kode
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: SV"
                maxLength={6}
                className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 bg-white uppercase focus:outline-none focus:border-teal-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Transit
              </label>
              <input
                type="text"
                value={transit}
                onChange={(e) => setTransit(e.target.value)}
                placeholder="Contoh: Direct / Langsung"
                className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-teal-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Status Aktif Checkbox */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 accent-teal-600 cursor-pointer"
              />
              <span className="text-[13px] font-medium text-slate-700">Aktif</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isPending}
            style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
            className="py-2.5 px-6 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
          <Link
            href={basePath}
            className="py-2.5 px-6 rounded-md border border-slate-300 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
