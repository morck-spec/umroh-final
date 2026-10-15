import { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import DesktopSidebar from "@/components/dashboard/DesktopSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { getWhiteLabelSettings } from "@/app/dashboard/shared/actions/whitelabel";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  let user = null;
  let role = 'super_admin';
  let userName = 'Demo Super Admin';

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        let detectedRole = user.user_metadata?.role || profile?.role || 'jamaah';
        if (user.email === 'mitra@demo.com' || user.email?.startsWith('mitra')) {
          detectedRole = 'mitra_agen';
        } else if (user.email === 'muthawif@demo.com' || user.email?.startsWith('muthawif')) {
          detectedRole = 'muthawif';
        } else if (user.email === 'jamaah@example.com' || user.email?.includes('jamaah')) {
          detectedRole = 'jamaah';
        } else if (profile?.role && ['super_admin', 'admin', 'admin_cabang'].includes(profile.role)) {
          detectedRole = profile.role;
        }
        role = detectedRole;
        userName = user.user_metadata?.name || profile?.full_name || (detectedRole === 'jamaah' ? 'Ahmad Fauzi' : detectedRole === 'mitra_agen' ? 'Hasan Basri' : detectedRole === 'muthawif' ? 'Ustadz Abdullah' : 'Pengguna Al-Madinah');
      }
    } catch {
      // Keep defaults
    }
  }

  const initial = (userName.charAt(0) || 'U').toUpperCase();
  const brand = await getWhiteLabelSettings();

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row">
      {/* Dynamic Brand CSS Variables */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --brand-primary: ${brand.primary_color || '#00d4b2'};
              --brand-secondary: ${brand.secondary_color || '#126259'};
              --brand-primary-light: ${brand.primary_color ? brand.primary_color + '1a' : '#E3F2EF'};
            }
          `,
        }}
      />

      {/* Sidebar - Desktop */}
      <DesktopSidebar role={role} userName={userName} initial={initial} brand={brand} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <DashboardTopbar role={role} userName={userName} initial={initial} />

        <main className="flex-1">
          <div className="px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>

        {/* Global White-label Footer */}
        <footer className="py-6 text-center text-xs text-slate-400">
          <div>{brand.footer_text || '© 2026 Travel Umroh & Haji — Sistem Manajemen Umroh & Haji.'}</div>
          <div className="text-[11px] mt-0.5">© 2026 <span className="text-[#00c5a0] font-medium">Toko Source Code</span></div>
        </footer>
      </div>
    </div>
  );
}
