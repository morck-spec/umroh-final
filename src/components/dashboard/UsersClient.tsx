'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Trash2, X } from 'lucide-react';
import {
  UserItem,
  deleteUser,
  resetUserPassword,
} from '@/app/dashboard/shared/actions/users';

interface Props {
  initialUsers: UserItem[];
  basePath?: string;
}

export default function UsersClient({
  initialUsers,
  basePath = '/dashboard/superadmin/users',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/users') ? '/users' : basePath;

  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('Semua Role');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [appliedRole, setAppliedRole] = useState<string>('Semua Role');
  const [isPending, startTransition] = useTransition();

  // Reset password feedback state
  const [resetFeedback, setResetFeedback] = useState<{
    userName: string;
    tempPassword: string;
  } | null>(null);

  function renderRoleBadge(role: UserItem['role']) {
    if (role === 'Admin Cabang') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          Admin Cabang
        </span>
      );
    }
    if (role === 'Agen / Marketing') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          Agen / Marketing
        </span>
      );
    }
    if (role === 'Super Admin') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
          Super Admin
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
        Jamaah
      </span>
    );
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAppliedSearch(searchTerm.trim().toLowerCase());
    setAppliedRole(selectedRole);
  }

  async function handleResetPassword(id: string, name: string) {
    if (!window.confirm(`Reset kata sandi untuk pengguna "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await resetUserPassword(id);
      if (res.error) {
        alert(res.error);
      } else if (res.tempPassword) {
        setResetFeedback({
          userName: res.userName || name,
          tempPassword: res.tempPassword,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.error) {
        alert(res.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id && u.legacy_id !== id));
        router.refresh();
      }
    });
  }

  const filteredUsers = users.filter((u) => {
    if (appliedRole !== 'Semua Role' && u.role !== appliedRole) return false;
    if (appliedSearch) {
      const matchName = u.name.toLowerCase().includes(appliedSearch);
      const matchEmail = u.email.toLowerCase().includes(appliedSearch);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const createHref = `${activeBasePath}/create`;

  return (
    <div className="space-y-6">
      {/* Reset Password Feedback Banners (Foto 3) */}
      {resetFeedback && (
        <div className="space-y-2.5">
          {/* Green Success Banner */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] rounded-xl px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm">
            <span>Kata sandi {resetFeedback.userName} berhasil direset.</span>
            <button
              onClick={() => setResetFeedback(null)}
              className="text-[#15803D] hover:opacity-70 p-1"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Blue Info Banner with Temporary Password */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] rounded-xl px-4 py-3 text-xs sm:text-sm shadow-sm flex items-center justify-between">
            <div>
              <span>Akun login dibuat. Password sementara: </span>
              <span className="bg-white border border-[#BFDBFE] px-2 py-0.5 rounded font-mono font-semibold text-xs tracking-wider text-[#1E3A8A]">
                {resetFeedback.tempPassword}
              </span>
              <span> — mohon catat &amp; sampaikan ke pengguna.</span>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={activeBasePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'}
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Pengguna</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengguna</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola akun login</p>
        </div>
        <Link
          href={createHref}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0f766e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama / email..."
          className="px-3.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 w-56 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
        />

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
        >
          <option value="Semua Role">Semua Role</option>
          <option value="Admin Cabang">Admin Cabang</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Jamaah">Jamaah</option>
          <option value="Agen / Marketing">Agen / Marketing</option>
          <option value="Muthawif">Muthawif</option>
        </select>

        <button
          type="submit"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-lg border border-slate-200/90 font-medium transition-colors shadow-sm"
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
                <th className="px-5 py-4">NAMA</th>
                <th className="px-5 py-4">EMAIL</th>
                <th className="px-5 py-4">ROLE</th>
                <th className="px-5 py-4">CABANG</th>
                <th className="px-5 py-4">STATUS</th>
                <th className="px-5 py-4">LOGIN TERAKHIR</th>
                <th className="px-5 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Tidak ada pengguna yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isProtectedAdmin = user.role === 'Admin Cabang' || user.role === 'Super Admin';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap text-sm">
                        {user.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                        {user.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                        {user.branch || 'Kantor Pusat Jakarta'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-[#059669] font-medium text-xs">
                          {user.status || 'Aktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                        {user.last_login || '-'}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-3 text-sm">
                        <Link
                          href={`${activeBasePath}/${user.id}/edit`}
                          className="text-xs sm:text-sm font-medium text-[#0D9488] hover:text-[#0f766e] hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleResetPassword(user.id, user.name)}
                          disabled={isPending}
                          className="text-xs sm:text-sm font-medium text-amber-600 hover:text-amber-800 hover:underline disabled:opacity-50"
                        >
                          Reset Sandi
                        </button>
                        {!isProtectedAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-rose-500 hover:text-rose-700 hover:underline disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500 inline" />
                            <span>Hapus</span>
                          </button>
                        )}
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
