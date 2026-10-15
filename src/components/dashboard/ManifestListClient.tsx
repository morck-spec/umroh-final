'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PackageManifestSummary } from '@/app/dashboard/shared/actions/manifests';

interface Props {
  manifests: PackageManifestSummary[];
  basePath?: string;
}

export default function ManifestListClient({
  manifests,
  basePath = '/dashboard/superadmin/manifests',
}: Props) {
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/manifests') ? '/manifests' : basePath;

  function renderTypeBadge(type: string) {
    if (type === 'Haji Plus') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
          Haji Plus
        </span>
      );
    }
    if (type === 'Haji') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
          Haji
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
        Umroh
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={activeBasePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'}
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Manifest</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manifest &amp; Rooming</h1>
        <p className="text-xs text-slate-500 mt-1">Pengaturan kamar, bus, dan kursi jamaah per paket</p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4">PAKET</th>
                <th className="px-5 py-4">JENIS</th>
                <th className="px-5 py-4">JUMLAH JAMAAH</th>
                <th className="px-5 py-4">BERANGKAT</th>
                <th className="px-5 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {manifests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Belum ada paket yang terdaftar.
                  </td>
                </tr>
              ) : (
                manifests.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap text-sm">
                      {m.package_name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderTypeBadge(m.package_type)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm font-medium">
                      {m.passenger_count}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {m.departure_date}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`${activeBasePath}/${m.id}`}
                        className="text-xs sm:text-sm font-medium text-[#0D9488] hover:text-[#0f766e] hover:underline"
                      >
                        Kelola Manifest
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
