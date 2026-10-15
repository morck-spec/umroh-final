'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { AgentItem, saveAgent } from '@/app/dashboard/shared/actions/agents';
import { BranchItem } from '@/app/dashboard/shared/actions/branches';

interface AgentFormClientProps {
  agent?: AgentItem | null;
  branches?: BranchItem[];
  isEdit?: boolean;
}

export default function AgentFormClient({
  agent,
  branches = [],
  isEdit = false,
}: AgentFormClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Determine paths
  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/agents'
    : isAdmin
    ? '/dashboard/admin/agents'
    : pathname.startsWith('/agents')
    ? '/agents'
    : '/dashboard/superadmin/agents';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  // Form states
  const [branch, setBranch] = useState(agent?.branch || '');
  const [name, setName] = useState(agent?.name || '');
  const [phone, setPhone] = useState(agent?.phone || '');
  const [email, setEmail] = useState(agent?.email || '');
  const [commissionRate, setCommissionRate] = useState(
    agent?.commission_rate !== undefined ? String(agent.commission_rate).replace('.', ',') : '0,00'
  );
  const [isActive, setIsActive] = useState<boolean>(agent ? (agent.status === 'Aktif' || agent.is_active) : true);
  const [address, setAddress] = useState(agent?.address || '');

  // Account login states
  const [createLogin, setCreateLogin] = useState<boolean>(agent?.has_account || false);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama agen wajib diisi');
      return;
    }

    startTransition(async () => {
      const res = await saveAgent({
        id: agent?.id,
        name,
        branch,
        phone,
        email,
        commission_rate: commissionRate,
        is_active: isActive,
        address,
        create_login: createLogin,
        password: password.trim() ? password.trim() : undefined,
      });

      if (res.success) {
        router.push(basePath);
        router.refresh();
      } else {
        alert(res.error || 'Gagal menyimpan data agen');
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
            Agen
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600 font-medium">{isEdit ? 'Edit' : 'Tambah'}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {isEdit ? 'Edit Agen' : 'Tambah Agen'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Data Agen */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-[14px] font-bold text-slate-800 mb-2">
            Data Agen
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

          {/* Row: Telepon / WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Row: Komisi (%) & Aktif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Komisi (%)
              </label>
              <input
                type="text"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="0,00"
                className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-0 sm:pt-6">
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
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Alamat</label>
            <textarea
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
                    ? `Akun login agen akan menggunakan email: ${email}`
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
