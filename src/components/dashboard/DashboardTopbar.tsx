'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import MobileSidebar from './MobileSidebar';
import { signout } from '@/app/(auth)/actions';
import { ROLE_LABELS } from './navConfig';
import { usePathname } from 'next/navigation';

interface TopbarProps {
  role: string;
  userName: string;
  initial?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] || 'U').slice(0, 2);
  return letters.toUpperCase();
}

function formatToday() {
  const d = new Date();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday}, ${d.getDate()} ${month} ${d.getFullYear()}`;
}

export default function DashboardTopbar({ role, userName }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setToday(formatToday());
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const effectiveRole =
    pathname?.includes('/dashboard/jamaah') || pathname?.startsWith('/dashboard/jamaah')
      ? 'jamaah'
      : pathname?.includes('/dashboard/mitra')
      ? 'mitra_agen'
      : pathname?.includes('/dashboard/muthawif') || pathname?.startsWith('/dashboard/muthawif') || pathname?.includes('/pilgrims')
      ? 'muthawif'
      : pathname?.includes('/dashboard/admin_cabang')
      ? 'admin_cabang'
      : pathname?.includes('/dashboard/admin')
      ? 'admin'
      : role;

  const effectiveUserName =
    effectiveRole === 'jamaah'
      ? userName && userName !== 'Demo Super Admin'
        ? userName
        : 'Ahmad Fauzi'
      : effectiveRole === 'mitra_agen'
      ? userName && userName !== 'Demo Super Admin'
        ? userName
        : 'Hasan Basri'
      : effectiveRole === 'muthawif' || effectiveRole === 'guide'
      ? userName && userName !== 'Demo Super Admin'
        ? userName
        : 'Ustadz Abdullah'
      : userName;

  const isSuper = effectiveRole === 'super_admin' || effectiveRole === 'superadmin' || effectiveRole === 'admin';

  return (
    <header className="sticky top-0 z-20 h-[58px] flex-shrink-0 bg-white border-b border-slate-200">
      <div className="h-full px-4 sm:px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileSidebar role={effectiveRole} />
          <div className="leading-tight">
            <p className="text-[13px] text-slate-800">Selamat datang</p>
            <p className="text-[10px] text-slate-400" suppressHydrationWarning>{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSuper && (
            <select
              id="branch-filter"
              defaultValue=""
              className="hidden sm:block h-[30px] w-[134px] rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700 focus:outline-none focus:border-[#0F9488]"
            >
              <option value="">Semua Cabang</option>
              <option value="jakarta">Kantor Pusat Jakarta</option>
            </select>
          )}

          <div className="relative" ref={ref}>
            <button id="user-menu" onClick={() => setOpen(!open)} className="flex items-center gap-2 text-left">
              <span
                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-[11px] font-semibold transition-colors"
                style={{ backgroundColor: 'var(--brand-primary, #00d4b2)' }}
              >
                {getInitials(effectiveUserName)}
              </span>
              <span className="hidden sm:block leading-tight">
                <span className="block text-[12px] text-slate-800">{effectiveUserName}</span>
                <span className="block text-[9px] text-slate-400">{ROLE_LABELS[effectiveRole] || effectiveRole}</span>
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-md bg-white border border-slate-200 shadow-lg py-1 z-50">
                <form action={signout}>
                  <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50">
                    <LogOut className="w-4 h-4 text-slate-500" /> Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
