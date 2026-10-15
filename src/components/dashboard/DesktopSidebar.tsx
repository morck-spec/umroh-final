'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signout } from '@/app/(auth)/actions';
import { getNavGroups, isNavActive } from './navConfig';

export interface BrandData {
  app_name: string;
  subtitle: string;
  primary_color: string;
  logo_url?: string;
}

function getBrandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => /^[a-zA-Z0-9]/.test(w));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || 'TU').toUpperCase();
}

export function SidebarBrand({ initialBrand }: { initialBrand?: BrandData }) {
  const [brand, setBrand] = useState<BrandData>(
    initialBrand || {
      app_name: 'Travel Umroh & Haji',
      subtitle: 'Sistem Manajemen Umroh & Haji',
      primary_color: '#00d4b2',
      logo_url: '',
    }
  );

  useEffect(() => {
    function handleUpdate(e: Event) {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setBrand({
          app_name: customEvent.detail.app_name,
          subtitle: customEvent.detail.subtitle,
          primary_color: customEvent.detail.primary_color,
          logo_url: customEvent.detail.logo_url,
        });
      }
    }
    window.addEventListener('brand-updated', handleUpdate);
    return () => window.removeEventListener('brand-updated', handleUpdate);
  }, []);

  const initials = getBrandInitials(brand.app_name);

  return (
    <Link href="/" className="flex items-center gap-2.5 min-w-0">
      <div
        className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors shadow-xs overflow-hidden"
        style={{ backgroundColor: brand.primary_color || 'var(--brand-primary, #00d4b2)' }}
      >
        {brand.logo_url ? (
          <img src={brand.logo_url} alt={brand.app_name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="leading-tight min-w-0">
        <span className="block text-[13px] font-semibold text-slate-800 whitespace-nowrap truncate">{brand.app_name}</span>
        <span className="block text-[10px] text-slate-400 whitespace-nowrap truncate">{brand.subtitle}</span>
      </div>
    </Link>
  );
}

export function SidebarNav({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const pathname = usePathname();
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

  const groups = getNavGroups(effectiveRole);

  return (
    <nav className="flex-1 px-2 py-3">
      {groups.map((group, gIdx) => (
        <div key={gIdx} className={gIdx > 0 ? 'mt-4' : ''}>
          {group.title && (
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{group.title}</p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  suppressHydrationWarning
                  style={active ? { backgroundColor: 'var(--brand-primary-light, #E3F2EF)' } : undefined}
                  className={`flex items-center gap-3 px-2 py-2 rounded-md text-[13px] transition-colors ${
                    active ? 'text-[#008f6b] font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#00c292]' : 'text-slate-600'}`} strokeWidth={1.6} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function DesktopSidebar({
  role,
  brand,
}: {
  role: string;
  userName?: string;
  initial?: string;
  brand?: BrandData;
}) {
  return (
    <aside className="hidden md:flex md:w-[228px] lg:w-[228px] flex-col flex-shrink-0 z-10 bg-white border-r border-slate-200 self-stretch min-h-screen">
      <div className="h-[58px] flex items-center px-3.5 border-b border-slate-200 flex-shrink-0">
        <SidebarBrand initialBrand={brand} />
      </div>
      <SidebarNav role={role} />
      <div className="p-3 border-t border-slate-200 mt-auto">
        <form action={signout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-600 flex-shrink-0" strokeWidth={1.6} />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
