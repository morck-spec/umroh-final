'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  PackageManifestSummary,
  ManifestItem,
  savePackageManifest,
} from '@/app/dashboard/shared/actions/manifests';

interface Props {
  manifest: PackageManifestSummary;
  basePath?: string;
}

export default function ManifestDetailClient({
  manifest: initialManifest,
  basePath = '/dashboard/superadmin/manifests',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/manifests') ? '/manifests' : basePath;

  const [manifest, setManifest] = useState<PackageManifestSummary>(initialManifest);
  const [items, setItems] = useState<ManifestItem[]>(initialManifest.items || []);
  const [isPending, startTransition] = useTransition();

  function handleChange(idx: number, field: keyof ManifestItem, value: string) {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        [field]: value,
      };
      return copy;
    });
  }

  async function handleSave() {
    startTransition(async () => {
      const res = await savePackageManifest(manifest.id, items);
      if (res.error) {
        alert(res.error);
      } else {
        alert('Manifest berhasil disimpan!');
        router.refresh();
      }
    });
  }

  const backHref = activeBasePath;

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
        <Link href={activeBasePath} className="hover:text-slate-600 transition-colors">
          Manifest
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium truncate max-w-xs">{manifest.package_name}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Manifest: {manifest.package_name}
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase font-medium tracking-wide">
          {manifest.package_code}
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">JAMAAH</th>
                <th className="pb-3 px-3">NO. KAMAR</th>
                <th className="pb-3 px-3">TIPE KAMAR</th>
                <th className="pb-3 px-3">NO. BUS</th>
                <th className="pb-3 px-3">NO. KURSI</th>
                <th className="pb-3 pl-3">GRUP MAHRAM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Belum ada jamaah yang terdaftar di paket ini.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/40 transition-colors">
                    {/* JAMAAH */}
                    <td className="py-4 pr-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 text-sm">{item.jamaah_name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.registration_code}</div>
                    </td>

                    {/* NO. KAMAR */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.room_number || ''}
                        onChange={(e) => handleChange(idx, 'room_number', e.target.value)}
                        placeholder="100"
                        className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>

                    {/* TIPE KAMAR */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <select
                        value={item.room_type || 'Quad'}
                        onChange={(e) => handleChange(idx, 'room_type', e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="Quad">Quad</option>
                        <option value="Triple">Triple</option>
                        <option value="Double">Double</option>
                        <option value="Single">Single</option>
                      </select>
                    </td>

                    {/* NO. BUS */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.bus_number || ''}
                        onChange={(e) => handleChange(idx, 'bus_number', e.target.value)}
                        placeholder="BUS-1"
                        className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>

                    {/* NO. KURSI */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.seat_number || ''}
                        onChange={(e) => handleChange(idx, 'seat_number', e.target.value)}
                        placeholder="1"
                        className="w-20 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>

                    {/* GRUP MAHRAM */}
                    <td className="py-4 pl-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.mahram_group || ''}
                        onChange={(e) => handleChange(idx, 'mahram_group', e.target.value)}
                        placeholder="GRUP-A"
                        className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Manifest'}
          </button>
          <Link
            href={backHref}
            className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}
