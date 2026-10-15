'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BranchItem, saveBranch } from '@/app/dashboard/shared/actions/branches';

interface BranchFormClientProps {
  branch?: BranchItem | null;
  isCreate?: boolean;
}

export default function BranchFormClient({ branch, isCreate }: BranchFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [code, setCode] = useState(branch?.code || '');
  const [name, setName] = useState(branch?.name || '');
  const [phone, setPhone] = useState(branch?.contact_number || '');
  const [email, setEmail] = useState(branch?.email || '');
  const [city, setCity] = useState(branch?.city || '');
  const [address, setAddress] = useState(branch?.address || '');
  const [isActive, setIsActive] = useState(branch?.status !== 'Nonaktif');
  const [isHeadquarters, setIsHeadquarters] = useState(branch?.is_headquarters || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveBranch({
        id: branch?.id,
        code,
        name,
        contact_number: phone,
        email,
        city,
        address,
        is_headquarters: isHeadquarters,
        status: isActive ? 'Aktif' : 'Nonaktif',
      });

      if (res.success) {
        router.push('/branches');
        router.refresh();
      } else {
        alert(res.error || 'Gagal menyimpan cabang');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
            Beranda
          </Link>
          <span>&gt;</span>
          <Link href="/branches" className="hover:text-slate-600 transition-colors">
            Cabang
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600">{isCreate ? 'Tambah' : 'Edit'}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {isCreate ? 'Tambah Cabang' : 'Edit Cabang'}
        </h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          {branch?.name || 'Formulir data cabang travel'}
        </p>
      </div>

      {/* Form Card matching Photo 5 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          {/* Row 1: Kode & Nama Cabang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Kode <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="JKT"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Nama Cabang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kantor Pusat Jakarta"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 2: Telepon & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="021-7654321"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pusat@example.com"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 3: Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Kota</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 4: Alamat */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Alamat</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Melati Indah No. 17, Jakarta Selatan"
              className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-y"
            />
          </div>

          {/* Row 5: Checkboxes */}
          <div className="flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span>Aktif</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={isHeadquarters}
                onChange={(e) => setIsHeadquarters(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span>Kantor Pusat</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            style={{ backgroundColor: 'var(--brand-primary, #00d4b2)' }}
            className="py-2.5 px-5 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <Link
            href="/branches"
            className="py-2.5 px-5 rounded-md border border-slate-300 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
