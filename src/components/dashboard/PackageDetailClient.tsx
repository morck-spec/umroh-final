'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PackageItem } from '@/app/dashboard/shared/actions/packages';
import { Banknote, Users, AlignJustify, Edit } from 'lucide-react';

interface PackageDetailClientProps {
  pkg: PackageItem;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatRupiah(amount: number): string {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

export default function PackageDetailClient({ pkg }: PackageDetailClientProps) {
  const pathname = usePathname();
  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/packages'
    : isAdmin
    ? '/dashboard/admin/packages'
    : pathname.startsWith('/packages')
    ? '/packages'
    : '/dashboard/superadmin/packages';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const registeredCount = pkg.registered_count || 0;
  const remainingQuota = Math.max(0, (pkg.quota || 0) - registeredCount);

  let typeBadgeBg = 'bg-emerald-50 text-emerald-600';
  if (pkg.type?.toLowerCase().includes('haji plus')) typeBadgeBg = 'bg-purple-50 text-purple-600';
  else if (pkg.type?.toLowerCase().includes('haji')) typeBadgeBg = 'bg-blue-50 text-blue-600';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
            <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
              Beranda
            </Link>
            <span>&gt;</span>
            <Link href={basePath} className="hover:text-slate-600 transition-colors">
              Paket
            </Link>
            <span>&gt;</span>
            <span className="text-slate-600">{pkg.name}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{pkg.name}</h1>
          <p className="text-[12px] text-slate-400 mt-0.5 font-mono">{pkg.code}</p>
        </div>

        <Link
          href={`${basePath}/${pkg.id}/edit`}
          style={{ backgroundColor: 'var(--brand-primary, #00d4b2)' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </Link>
      </div>

      {/* 3 Summary Stat Cards matching Photo 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Harga */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Harga</div>
            <div className="text-lg font-bold text-slate-800 tracking-tight">
              {formatRupiah(pkg.price)}
            </div>
            <div className="text-[11px] text-slate-400">
              DP {formatRupiah(pkg.down_payment || 5000000)}
            </div>
          </div>
        </div>

        {/* Card 2: Pendaftar Aktif */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Pendaftar Aktif</div>
            <div className="text-lg font-bold text-slate-800 tracking-tight">
              {registeredCount}
            </div>
            <div className="text-[11px] text-slate-400">Kuota {pkg.quota}</div>
          </div>
        </div>

        {/* Card 3: Sisa Kuota */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <AlignJustify className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Sisa Kuota</div>
            <div className="text-lg font-bold text-slate-800 tracking-tight">
              {remainingQuota}
            </div>
            <div className="text-[11px] text-slate-400">Tersedia</div>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of Detail Cards matching Photo 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Informasi Paket */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-5">Informasi Paket</h2>
          <div className="space-y-3.5 text-[12px]">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Jenis</span>
              <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${typeBadgeBg}`}>
                {pkg.type}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Status</span>
              <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">
                {pkg.status || 'Dibuka'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Cabang</span>
              <span className="text-slate-800 font-medium">{pkg.branch_name || 'Kantor Pusat Jakarta'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Durasi</span>
              <span className="text-slate-800 font-medium">{pkg.duration_days} hari</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Tanggal Berangkat</span>
              <span className="text-slate-800 font-medium">{formatDate(pkg.departure_date)}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Kota Keberangkatan</span>
              <span className="text-slate-800 font-medium">{pkg.departure_city || 'Jakarta'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Akomodasi & Transportasi */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-5">Akomodasi &amp; Transportasi</h2>
          <div className="space-y-4 text-[12px]">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Hotel Mekah</span>
              <span className="text-slate-800 font-medium">{pkg.hotel_makkah || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Hotel Madinah</span>
              <span className="text-slate-800 font-medium">{pkg.hotel_madinah || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Maskapai</span>
              <span className="text-slate-800 font-medium">{pkg.airline || '-'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Fasilitas Termasuk */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-5">Fasilitas Termasuk</h2>
          <ul className="space-y-2.5 text-[12px] text-slate-700">
            {(pkg.facilities_included && pkg.facilities_included.length > 0
              ? pkg.facilities_included
              : ['Tiket pesawat PP', 'Hotel bintang 4/5', 'Visa & manasik', 'Makan 3x sehari', 'Bus AC']
            ).map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4: Fasilitas Tidak Termasuk */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-5">Fasilitas Tidak Termasuk</h2>
          <ul className="space-y-2.5 text-[12px] text-slate-700">
            {(pkg.facilities_excluded && pkg.facilities_excluded.length > 0
              ? pkg.facilities_excluded
              : ['Pengeluaran pribadi', 'Kelebihan bagasi', 'Vaksin']
            ).map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5">
                <span className="text-orange-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card 5: Deskripsi */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-[14px] font-semibold text-slate-800 mb-3">Deskripsi</h2>
        <p className="text-[13px] text-slate-600 leading-relaxed">
          {pkg.description || 'Tidak ada deskripsi.'}
        </p>
      </div>
    </div>
  );
}
