import Link from "next/link";
import { ReactNode } from "react";
import { signout } from "@/app/(auth)/actions";
import { createClient } from "@/utils/supabase/server";
import { LayoutDashboard, Users, UserPlus, Package, FileText, CreditCard, PieChart, Settings, LogOut, Briefcase } from "lucide-react";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import DesktopSidebar from "@/components/dashboard/DesktopSidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  let user = null;
  let role = 'jamaah';

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        role = profile?.role || user.user_metadata?.role || 'jamaah';
      }
    } catch {
    }
  }

  const userName = user?.user_metadata?.name || 'Demo User';
  const initial = userName.charAt(0).toUpperCase();

  // Define menus based on role
  const menus = {
    super_admin: [
      { name: 'Dashboard', href: '/dashboard/superadmin', icon: 'LayoutDashboard' },
      { name: 'Data Cabang', href: '/dashboard/superadmin/branches', icon: 'Briefcase' },
      { name: 'Data Jamaah', href: '/dashboard/superadmin/jamaah', icon: 'Users' },
      { name: 'Paket Umroh', href: '/dashboard/superadmin/packages', icon: 'Package' },
      { name: 'Pembimbing/Muthawif', href: '/dashboard/superadmin/guides', icon: 'UserPlus' },
      { name: 'Pendaftaran', href: '/dashboard/superadmin/registrations', icon: 'FileText' },
      { name: 'Dokumen Jamaah', href: '/dashboard/superadmin/documents', icon: 'FileText' },
      { name: 'Pembayaran & Tagihan', href: '/dashboard/superadmin/payments', icon: 'CreditCard' },
      { name: 'Jadwal Keberangkatan', href: '/dashboard/superadmin/schedules', icon: 'LayoutDashboard' },
      { name: 'Manajemen Pengguna', href: '/dashboard/superadmin/users', icon: 'Settings' },
      { name: 'Laporan Keuangan', href: '/dashboard/superadmin/reports', icon: 'PieChart' },
    ],
    admin_cabang: [
      { name: 'Dashboard Cabang', href: '/dashboard/admin_cabang', icon: 'LayoutDashboard' },
      { name: 'Jamaah Cabang', href: '/dashboard/admin_cabang/jamaah', icon: 'Users' },
      { name: 'Pendaftaran', href: '/dashboard/admin_cabang/registrations', icon: 'FileText' },
      { name: 'Dokumen Jamaah', href: '/dashboard/admin_cabang/documents', icon: 'FileText' },
      { name: 'Pembayaran', href: '/dashboard/admin_cabang/payments', icon: 'CreditCard' },
      { name: 'Laporan Cabang', href: '/dashboard/admin_cabang/reports', icon: 'PieChart' },
    ],
    admin: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      { name: 'Data Jamaah', href: '/dashboard/admin/jamaah', icon: 'Users' },
      { name: 'Paket Umroh', href: '/dashboard/admin/packages', icon: 'Package' },
      { name: 'Pembimbing/Muthawif', href: '/dashboard/admin/guides', icon: 'UserPlus' },
      { name: 'Pendaftaran', href: '/dashboard/admin/registrations', icon: 'FileText' },
      { name: 'Dokumen Jamaah', href: '/dashboard/admin/documents', icon: 'FileText' },
      { name: 'Pembayaran', href: '/dashboard/admin/payments', icon: 'CreditCard' },
      { name: 'Jadwal Keberangkatan', href: '/dashboard/admin/schedules', icon: 'LayoutDashboard' },
      { name: 'Laporan', href: '/dashboard/admin/reports', icon: 'PieChart' },
    ],
    jamaah: [
      { name: 'Portal Jamaah', href: '/dashboard/jamaah', icon: 'LayoutDashboard' },
      { name: 'Perjalanan Saya', href: '/dashboard/jamaah/journey', icon: 'Package' },
      { name: 'Dokumen Saya', href: '/dashboard/jamaah/documents', icon: 'FileText' },
      { name: 'Tagihan & Pembayaran', href: '/dashboard/jamaah/payment', icon: 'CreditCard' },
      { name: 'Profil & Pengaturan', href: '/dashboard/jamaah/profile', icon: 'Settings' },
    ]
  };

  const currentMenu = menus[role as keyof typeof menus] || menus.jamaah;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <DesktopSidebar menus={currentMenu} role={role} userName={userName} initial={initial} />

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-slate-200">
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex flex-1 items-center">
              <MobileSidebar menus={currentMenu} role={role} userName={userName} initial={initial} />
              {/* Optional Search / Breadcrumbs */}
              <div className="hidden sm:flex items-center text-sm text-slate-500 font-medium">
                Portal Manajemen Administrasi
              </div>
            </div>
            <div className="ml-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 hidden sm:block">Halo, {userName}</span>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              <form action={signout}>
                <button type="submit" className="flex items-center text-sm text-slate-600 hover:text-red-600 font-medium transition-colors">
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
