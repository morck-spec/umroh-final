'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  UserItem,
  createUser,
  updateUser,
} from '@/app/dashboard/shared/actions/users';

interface Props {
  initialUser?: UserItem | null;
  basePath?: string;
  isEdit?: boolean;
}

export default function UserFormClient({
  initialUser,
  basePath = '/dashboard/superadmin/users',
  isEdit = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/users') ? '/users' : basePath;

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState<string>(initialUser?.name || '');
  const [email, setEmail] = useState<string>(initialUser?.email || '');
  const [role, setRole] = useState<UserItem['role']>(initialUser?.role || 'Jamaah');
  const [branch, setBranch] = useState<string>(initialUser?.branch || 'Kantor Pusat Jakarta');
  const [phone, setPhone] = useState<string>(initialUser?.phone || '');
  const [isActive, setIsActive] = useState<boolean>(initialUser?.is_active ?? true);
  const [password, setPassword] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      if (isEdit && initialUser) {
        const res = await updateUser(initialUser.id, {
          name,
          email,
          role,
          branch,
          phone,
          is_active: isActive,
          password: password.trim() ? password.trim() : undefined,
        });

        if (res.error) {
          alert(res.error);
        } else {
          alert('Pengguna berhasil diperbarui!');
          router.push(activeBasePath);
          router.refresh();
        }
      } else {
        const res = await createUser({
          name,
          email,
          role,
          branch,
          phone,
          is_active: isActive,
          password: password.trim() ? password.trim() : undefined,
        });

        if (res.error) {
          alert(res.error);
        } else {
          alert('Pengguna berhasil ditambahkan!');
          router.push(activeBasePath);
          router.refresh();
        }
      }
    });
  }

  const pageTitle = isEdit ? 'Edit Pengguna' : 'Tambah Pengguna';
  const pageSubtitle = isEdit ? initialUser?.name || 'Pengguna' : 'Form pembuatan akun pengguna baru';
  const backHref = activeBasePath;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={activeBasePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'}
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href={activeBasePath} className="hover:text-slate-600 transition-colors">
          Pengguna
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">{isEdit ? 'Edit' : 'Tambah'}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
        <p className="text-xs text-slate-500 mt-1">{pageSubtitle}</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
        <h2 className="text-sm font-semibold text-slate-800 mb-5">Data Pengguna</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ahmad Fauzi"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jamaah@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>
          </div>

          {/* Role & Cabang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserItem['role'])}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                <option value="Jamaah">Jamaah</option>
                <option value="Admin Cabang">Admin Cabang</option>
                <option value="Agen / Marketing">Agen / Marketing</option>
                <option value="Muthawif">Muthawif</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Cabang</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                <option value="Kantor Pusat Jakarta">Kantor Pusat Jakarta</option>
                <option value="Cabang Surabaya">Cabang Surabaya</option>
                <option value="Cabang Bandung">Cabang Bandung</option>
                <option value="Semua Cabang">Semua Cabang</option>
              </select>
            </div>
          </div>

          {/* Telepon & Aktif Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>

            <div className="pt-5 sm:pt-4">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <span>Aktif</span>
              </label>
            </div>
          </div>

          {/* Kata Sandi */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan jika tidak diubah"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">Kosongkan jika tidak diubah</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
            >
              {isPending
                ? 'Menyimpan...'
                : isEdit
                ? 'Simpan Perubahan'
                : 'Simpan Pengguna'}
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
