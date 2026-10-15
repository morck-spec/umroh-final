'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SidebarBrand, SidebarNav } from './DesktopSidebar';

export default function MobileSidebar({ role }: { role: string; userName?: string; initial?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800"
        aria-label="Buka Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="relative z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col shadow-xl">
            <div className="h-[58px] flex items-center justify-between px-3 border-b border-slate-200">
              <SidebarBrand />
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Tutup Menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav role={role} onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
