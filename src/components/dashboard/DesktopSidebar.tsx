'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LayoutDashboard, Users, UserPlus, Package, FileText, CreditCard, PieChart, Settings } from 'lucide-react';

const icons = {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  FileText,
  CreditCard,
  PieChart,
  Settings,
  Briefcase
};

export default function DesktopSidebar({ menus, role, userName, initial }: { menus: any[], role: string, userName: string, initial: string }) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900 border-r border-slate-800 text-white">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Trecer</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-4 py-4 border-b border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Menu Utama</p>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menus.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons] || LayoutDashboard;
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/dashboard/${role.replace('_', '')}`);
              // Note: the active state logic might be tricky for root dashboard, so we match exact for root, startsWith for others
              const isTrulyActive = item.href === pathname || (item.href !== `/dashboard/${role === 'admin_cabang' ? 'admin_cabang' : role === 'super_admin' ? 'superadmin' : role}` && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isTrulyActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isTrulyActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-slate-800 p-4">
          <Link href={`/dashboard/${role === 'admin_cabang' ? 'admin_cabang' : role === 'super_admin' ? 'superadmin' : role}/profile`} className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="inline-block h-9 w-9 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold">
                  {initial}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300 capitalize">
                  Role: {role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
