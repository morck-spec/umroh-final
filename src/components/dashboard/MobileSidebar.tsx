'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Briefcase, LayoutDashboard, Users, UserPlus, Package, FileText, CreditCard, PieChart, Settings } from 'lucide-react';

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

export default function MobileSidebar({ menus, role, userName, initial }: { menus: any[], role: string, userName: string, initial: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="relative z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setIsOpen(false)} />

          <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                  <Briefcase className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">Trecer</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
              {menus.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons] || LayoutDashboard;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex-shrink-0 border-t border-slate-800 p-4">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold">
                  {initial}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs font-medium text-slate-400 capitalize">
                    Role: {role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
