import {
  Home,
  Building2,
  Package,
  Hotel,
  Plane,
  Landmark,
  User,
  GraduationCap,
  Users,
  AlignJustify,
  FileText,
  Banknote,
  CalendarDays,
  ClipboardList,
  Briefcase,
  BadgePercent,
  Megaphone,
  UserCog,
  Settings,
  Activity,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  superadmin: 'Super Admin',
  admin: 'Super Admin',
  admin_cabang: 'Admin Cabang',
  mitra_agen: 'Agen / Marketing',
  jamaah: 'Jamaah',
  muthawif: 'Muthawif / Pembimbing',
  guide: 'Muthawif / Pembimbing',
};

export const DASHBOARD_HOME: Record<string, string> = {
  super_admin: '/dashboard/superadmin',
  superadmin: '/dashboard/superadmin',
  admin: '/dashboard/admin',
  admin_cabang: '/dashboard/admin_cabang',
  mitra_agen: '/dashboard/mitra',
  jamaah: '/dashboard/jamaah',
  muthawif: '/dashboard/muthawif',
  guide: '/dashboard/muthawif',
};

export function getNavGroups(role: string): NavGroup[] {
  if (role === 'mitra_agen') {
    return [
      { items: [{ name: 'Dashboard', href: '/dashboard/mitra', icon: Home }] },
      {
        title: 'MARKETING',
        items: [
          { name: 'Jamaah Referral', href: '/dashboard/mitra/jamaah', icon: Users },
          { name: 'Pendaftaran', href: '/dashboard/mitra/registrations', icon: AlignJustify },
          { name: 'Komisi Saya', href: '/dashboard/mitra/commissions', icon: CheckCircle2 },
        ],
      },
    ];
  }

  if (role === 'jamaah') {
    return [
      { items: [{ name: 'Dashboard', href: '/dashboard/jamaah', icon: Home }] },
      {
        title: 'PERJALANAN SAYA',
        items: [
          { name: 'Pendaftaran Saya', href: '/dashboard/jamaah/registrations', icon: AlignJustify },
          { name: 'Dokumen Saya', href: '/dashboard/jamaah/documents', icon: FileText },
          { name: 'Pembayaran', href: '/dashboard/jamaah/payment', icon: Banknote },
          { name: 'Jadwal Manasik', href: '/dashboard/jamaah/manasik', icon: CalendarDays },
        ],
      },
    ];
  }

  if (role === 'muthawif' || role === 'guide') {
    return [
      { items: [{ name: 'Dashboard', href: '/dashboard/muthawif', icon: Home }] },
      {
        title: 'BIMBINGAN',
        items: [
          { name: 'Jamaah Bimbingan', href: '/dashboard/muthawif/pilgrims', icon: Users },
          { name: 'Manasik & Absensi', href: '/dashboard/muthawif/manasik', icon: CalendarDays },
        ],
      },
    ];
  }

  const isCabang = role === 'admin_cabang';
  const base = isCabang ? '/dashboard/admin_cabang' : role === 'admin' ? '/dashboard/admin' : '/dashboard/superadmin';

  const master: NavItem[] = [
    ...(isCabang ? [] : [{ name: 'Cabang', href: `${base}/branches`, icon: Building2 }]),
    { name: 'Paket', href: `${base}/packages`, icon: Package },
    { name: 'Hotel', href: `${base}/hotels`, icon: Hotel },
    { name: 'Maskapai', href: `${base}/airlines`, icon: Plane },
    { name: 'Rekening Bank', href: `${base}/bank-accounts`, icon: Landmark },
    { name: 'Agen', href: `${base}/agents`, icon: User },
    { name: 'Muthawif', href: `${base}/guides`, icon: GraduationCap },
    { name: 'Jamaah', href: `${base}/jamaah`, icon: Users },
  ];

  return [
    { items: [{ name: 'Dashboard', href: base, icon: Home }] },
    { title: 'Master Data', items: master },
    {
      title: 'Operasional',
      items: [
        { name: 'Pendaftaran', href: `${base}/registrations`, icon: AlignJustify },
        { name: 'Dokumen', href: `${base}/documents`, icon: FileText },
        { name: 'Pembayaran', href: `${base}/payments`, icon: Banknote },
        { name: 'Manasik', href: `${base}/manasik`, icon: CalendarDays },
        { name: 'Manifest & Rooming', href: `${base}/manifests`, icon: ClipboardList },
        { name: 'Perlengkapan', href: `${base}/equipment`, icon: Briefcase },
        { name: 'Komisi Agen', href: `${base}/commissions`, icon: BadgePercent },
        { name: 'Pengumuman', href: `${base}/announcements`, icon: Megaphone },
      ],
    },
    {
      title: 'Sistem',
      items: [
        { name: 'Pengguna', href: `${base}/users`, icon: UserCog },
        ...(isCabang ? [] : [{ name: 'White-label', href: `${base}/settings`, icon: Settings }]),
        { name: 'Log Aktivitas', href: `${base}/activity-logs`, icon: Activity },
      ],
    },
  ];
}

export function isNavActive(pathname: string, href: string): boolean {
  const clean = href.split('#')[0];
  if (href.includes('#')) return false;
  if (Object.values(DASHBOARD_HOME).includes(clean)) return pathname === clean;
  if (pathname === clean || pathname.startsWith(clean + '/')) return true;

  // Support top-level rewritten routes (e.g. /announcements matching /dashboard/superadmin/announcements)
  const segments = clean.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && (pathname === `/${lastSegment}` || pathname.startsWith(`/${lastSegment}/`))) {
    return true;
  }

  // Support /muthawif rewrite matching /guides
  if (lastSegment === 'guides' && (pathname === '/muthawif' || pathname.startsWith('/muthawif/'))) {
    return true;
  }

  // Support /agen rewrite matching /agents
  if (lastSegment === 'agents' && (pathname === '/agen' || pathname.startsWith('/agen/'))) {
    return true;
  }

  // Support /maskapai rewrite matching /airlines
  if (lastSegment === 'airlines' && (pathname === '/maskapai' || pathname.startsWith('/maskapai/'))) {
    return true;
  }

  // Support /hotel rewrite matching /hotels
  if (lastSegment === 'hotels' && (pathname === '/hotel' || pathname.startsWith('/hotel/'))) {
    return true;
  }

  // Support /rekening-bank rewrite matching /bank-accounts
  if (lastSegment === 'bank-accounts' && (pathname === '/rekening-bank' || pathname.startsWith('/rekening-bank/'))) {
    return true;
  }

  // Support /pilgrims matching /dashboard/mitra/jamaah
  if (clean === '/dashboard/mitra/jamaah' && (pathname === '/pilgrims' || pathname.startsWith('/pilgrims/'))) {
    return true;
  }

  // Support /registrations matching /dashboard/mitra/registrations or /dashboard/jamaah/registrations
  if (
    (clean === '/dashboard/mitra/registrations' || clean === '/dashboard/jamaah/registrations') &&
    (pathname === '/registrations' || pathname.startsWith('/registrations/'))
  ) {
    return true;
  }

  // Support /commissions matching /dashboard/mitra/commissions
  if (clean === '/dashboard/mitra/commissions' && (pathname === '/commissions' || pathname.startsWith('/commissions/'))) {
    return true;
  }

  // Support /payments matching /dashboard/jamaah/payment
  if (
    clean === '/dashboard/jamaah/payment' &&
    (pathname === '/payments' || pathname.startsWith('/payments') || pathname === '/payment' || pathname.startsWith('/payment'))
  ) {
    return true;
  }

  return false;
}
