'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { GuideItem, saveGuide } from '@/app/dashboard/shared/actions/guides';
import { BranchItem } from '@/app/dashboard/shared/actions/branches';

interface GuideFormClientProps {
  guide?: GuideItem | null;
  branches?: BranchItem[];
  isEdit?: boolean;
}

export default function GuideFormClient({
  guide,
  branches = [],
  isEdit = false,
}: GuideFormClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Determine paths
  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/guides'
    : isAdmin
    ? '/dashboard/admin/guides'
    : pathname.startsWith('/guides')
    ? '/guides'
    : '/dashboard/superadmin/guides';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  // Form states
  const [branch, setBranch] = useState(guide?.branch || '');
  const [name, setName] = useState(guide?.name || '');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>(guide?.gender || 'Laki-laki');
  const [phone, setPhone] = useState(guide?.phone || '');
  const [email, setEmail] = useState(guide?.email || '');
  const [specialization, setSpecialization] = useState(guide?.specialization || '');
  const [isActive, setIsActive] = useState<boolean>(guide ? (guide.status === 'Aktif' || guide.is_active) : true);
  const [bio, setBio] = useState(guide?.bio || '');

  // Account login states
  const [createLogin, setCreateLogin] = useState<boolean>(guide?.has_account || false);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama wajib diisi');
      return;
    }

    startTransition(async () => {
      const res = await saveGuide({
        id: guide?.id,
        name,
        branch,
        gender,
        phone,
        email,
        specialization,
        is_active: isActive,
        bio,
        create_login: createLogin,
        password: password.trim() ? password.trim() : undefined,
      });

      if (res.success) {
        router.push(basePath);
        router.refresh();
      } else {
        alert(res.error || 'Gagal menyimpan data muthawif');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
          <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
            Beranda
          </Link>
          <span>&gt;</span>
          <Link href={basePath} className="hover:text-slate-600 transition-colors">
            Muthawif
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600 font-medium">{isEdit ? 'Edit' : 'Tambah'}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {isEdit ? 'Edit Muthawif' : 'Tambah Muthawif'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Data Muthawif / Pembimbing */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-[14px] font-bold text-slate-800 mb-2">
            Data Muthawif / Pembimbing
          </h2>

          {/* Cabang */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Cabang</label>
            <div className="relative">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
              >
                <option value="">Pilih Cabang</option>
                {branches && branches.length > 0 ? (
                  branches.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Kantor Pusat Jakarta">Kantor Pusat Jakarta</option>
                    <option value="Cabang Surabaya">Cabang Surabaya</option>
                    <option value="Cabang Bandung">Cabang Bandung</option>
                    <option value="cabang jember">cabang jember</option>
                    <option value="Padang">Padang</option>
                    <option value="Semua Cabang">Semua Cabang</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Nama <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Row: Jenis Kelamin & Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                  required
                  className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder=""
                className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row: Email & Spesialisasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Spesialisasi</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder=""
                className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mis. Pembimbing Manasik, Penerjemah</p>
            </div>
          </div>

          {/* Aktif Checkbox */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer accent-[#00c292]"
              />
              <span>Aktif</span>
            </label>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-y"
            />
          </div>
        </div>

        {/* Card 2: Akun Login */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-[14px] font-bold text-slate-800 mb-2">Akun Login</h2>

          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={createLogin}
                onChange={(e) => setCreateLogin(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer accent-[#00c292]"
              />
              <span>Buatkan akun login</span>
            </label>

            {createLogin && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                <p className="text-[12px] text-slate-500">
                  {email
                    ? `Akun login akan menggunakan email: ${email}`
                    : 'Harap isi kolom Email di atas untuk digunakan sebagai email login.'}
                </p>
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 mb-1">
                    Kata Sandi {isEdit ? '(Kosongkan jika tidak ingin mengubah sandi)' : ''}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter (default: password123)'}
                    className="w-full sm:w-80 h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}
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
