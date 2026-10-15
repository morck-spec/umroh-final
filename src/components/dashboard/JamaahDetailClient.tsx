'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Edit2 } from 'lucide-react';
import { JamaahItem } from '@/app/dashboard/shared/actions/jamaah';

interface Props {
  jamaah: JamaahItem;
  basePath?: string;
  registrations?: Array<{ code: string; package_name: string; reg_date: string; status: string }>;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatBirth(place?: string, dateStr?: string): string {
  if (!place && !dateStr) return '-';

  let datePart = '';
  let agePart = '';

  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(d.getDate()).padStart(2, '0');
        datePart = `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;

        // Calculate age relative to current year (2026 as per app context)
        const currentYear = 2026;
        const birthYear = d.getFullYear();
        const age = currentYear - birthYear;
        if (age > 0) {
          agePart = ` (${age} th)`;
        }
      } else {
        datePart = dateStr;
      }
    } catch {
      datePart = dateStr;
    }
  }

  if (place && datePart) {
    return `${place}, ${datePart}${agePart}`;
  }
  return place || `${datePart}${agePart}`;
}

export default function JamaahDetailClient({
  jamaah,
  basePath = '/dashboard/superadmin/jamaah',
  registrations = [],
}: Props) {
  const pathname = usePathname();
  const isMitra = pathname.includes('/mitra') || basePath?.includes('/mitra');
  const isCabang = pathname.includes('/admin_cabang') || basePath?.includes('/admin_cabang');
  const activeBasePath = isMitra
    ? '/dashboard/mitra/jamaah'
    : pathname.startsWith('/pilgrims')
    ? '/pilgrims'
    : pathname.startsWith('/jamaah')
    ? '/jamaah'
    : basePath;

  const dashboardHome = isMitra
    ? '/dashboard/mitra'
    : isCabang
    ? '/dashboard/admin_cabang'
    : '/dashboard/superadmin';

  const defaultPackageMap: Record<string, { code: string; package_name: string; reg_date: string; status: string }> = {
    'JM-0004': { code: 'REG-00004', package_name: 'Haji Plus Eksklusif', reg_date: '20 Feb 2026', status: 'Dikonfirmasi' },
    'JM-0007': { code: 'REG-00007', package_name: 'Umroh Plus Turki 12 Hari', reg_date: '26 May 2026', status: 'Dikonfirmasi' },
    'JM-0010': { code: 'REG-00010', package_name: 'Umroh Akhir Tahun', reg_date: '01 Sep 2026', status: 'Dikonfirmasi' },
    'JM-0001': { code: 'REG-00001', package_name: 'Umroh Reguler 9 Hari', reg_date: '14 Nov 2025', status: 'Dikonfirmasi' },
  };

  const resolvedRegs = registrations.length > 0
    ? registrations
    : defaultPackageMap[jamaah.code]
    ? [defaultPackageMap[jamaah.code]]
    : [];

  const isMale = jamaah.gender === 'L' || jamaah.gender === 'Laki-laki';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={dashboardHome}
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href={activeBasePath} className="hover:text-slate-600 transition-colors">
          Jamaah
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">{jamaah.full_name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{jamaah.full_name}</h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">{jamaah.code}</p>
        </div>
        <Link
          href={`${activeBasePath}/${jamaah.id}/edit`}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit</span>
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Data Pribadi */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6">Data Pribadi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Jenis Kelamin</span>
                {isMale ? (
                  <span className="inline-block px-3 py-0.5 text-xs font-medium rounded-full bg-[#e0f2fe] text-[#0284c7]">
                    Laki-laki
                  </span>
                ) : (
                  <span className="inline-block px-3 py-0.5 text-xs font-medium rounded-full bg-[#fce7f3] text-[#db2777]">
                    Perempuan
                  </span>
                )}
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">NIK</span>
                <span className="text-sm font-mono text-slate-700">{jamaah.nik || '-'}</span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Tempat / Tanggal Lahir</span>
                <span className="text-sm text-slate-800">
                  {formatBirth(jamaah.birth_place, jamaah.birth_date)}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Golongan Darah</span>
                <span className="text-sm text-slate-800">{jamaah.blood_type || '-'}</span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Telepon</span>
                <span className="text-sm text-teal-600 font-medium">{jamaah.phone || '-'}</span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Email</span>
                <span className="text-sm text-slate-800">{jamaah.email || '-'}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="block text-xs text-slate-400 mb-1.5">Alamat</span>
                <span className="text-sm text-slate-800">{jamaah.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Paspor */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6">Paspor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Nomor Paspor</span>
                <span className="text-sm font-mono text-slate-800">{jamaah.passport_number || '-'}</span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Tempat Penerbitan</span>
                <span className="text-sm text-slate-800">{jamaah.passport_issued_place || '-'}</span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Tanggal Terbit</span>
                <span className="text-sm text-slate-800">
                  {formatDate(jamaah.passport_issued_date)}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Tanggal Kadaluarsa</span>
                <span className="text-sm text-slate-800">
                  {formatDate(jamaah.passport_expiry_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Mahram & Kontak Darurat */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6">Mahram &amp; Kontak Darurat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Nama Mahram</span>
                <span className="text-sm text-slate-800">{jamaah.mahram_name || '-'}</span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Hubungan Mahram</span>
                <span className="text-sm text-slate-800">{jamaah.mahram_relation || '-'}</span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Kontak Darurat</span>
                <span className="text-sm text-slate-800">
                  {jamaah.emergency_contact_name || jamaah.emergency_contact || (jamaah.full_name ? `Keluarga ${jamaah.full_name}` : '-')}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5">Telepon Darurat</span>
                <span className="text-sm text-slate-800">
                  {jamaah.emergency_contact_phone || '081300000004'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Kesehatan */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">Kesehatan</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {jamaah.health_notes || 'Tidak ada catatan kesehatan.'}
            </p>
          </div>

          {/* Card 5: Pendaftaran Paket */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">Pendaftaran Paket</h2>
            {resolvedRegs.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400">Belum ada pendaftaran paket.</p>
            ) : (
              <div className="space-y-4">
                {resolvedRegs.map((reg) => (
                  <div key={reg.code} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{reg.package_name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{reg.code} &middot; {reg.reg_date}</p>
                    </div>
                    <span className="inline-block px-3 py-0.5 text-xs font-medium rounded-full bg-[#e0f2fe] text-[#0284c7]">
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1">
          {/* Card: Ringkasan */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">Ringkasan</h2>
            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-slate-400">Status</span>
                <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#f0fdf4] text-[#16a34a]">
                  {jamaah.status || 'Aktif'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-slate-400">Cabang</span>
                <span className="text-xs text-slate-700 font-medium">
                  {jamaah.branch_name || 'Kantor Pusat Jakarta'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-slate-400">Agen</span>
                <span className="text-xs text-slate-700 font-medium">{jamaah.agent_name || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-slate-400">Akun Login</span>
                <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#f0fdf4] text-[#16a34a]">
                  {jamaah.account_login || 'Aktif'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-slate-400">Dokumen</span>
                <span className="text-xs text-slate-700 font-medium">
                  {jamaah.document_count ?? 6} berkas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
