'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { EquipmentItem, deleteEquipment } from '@/app/dashboard/shared/actions/equipment';

interface Props {
  initialItems: EquipmentItem[];
  basePath?: string;
}

export default function EquipmentListClient({
  initialItems,
  basePath = '/dashboard/superadmin/equipment',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/equipment') ? '/equipment' : basePath;

  const [items, setItems] = useState<EquipmentItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  function renderStatusBadge(status: string) {
    if (status === 'Sudah Diserahkan') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          Sudah Diserahkan
        </span>
      );
    }
    if (status === 'Disiapkan') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          Disiapkan
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
        Belum Disiapkan
      </span>
    );
  }

  async function handleDelete(id: string, name: string, itemName: string) {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus perlengkapan "${itemName}" untuk "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteEquipment(id);
      if (res.error) {
        alert(res.error);
      } else {
        setItems((prev) => prev.filter((it) => it.id !== id && it.legacy_id !== id));
        router.refresh();
      }
    });
  }

  const createHref = `${activeBasePath}/create`;

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
        <span className="text-slate-600 font-medium">Perlengkapan</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Perlengkapan</h1>
          <p className="text-xs text-slate-500 mt-1">Distribusi perlengkapan jamaah</p>
        </div>
        <Link
          href={createHref}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0f766e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Perlengkapan</span>
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4">JAMAAH</th>
                <th className="px-5 py-4">ITEM</th>
                <th className="px-5 py-4">UKURAN</th>
                <th className="px-5 py-4">QTY</th>
                <th className="px-5 py-4">STATUS</th>
                <th className="px-5 py-4">DISERAHKAN</th>
                <th className="px-5 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Belum ada data perlengkapan.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap text-sm">
                      {item.jamaah_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.item}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.size || '-'}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.qty}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.handed_over_formatted || '-'}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-3 text-sm">
                      <Link
                        href={`${activeBasePath}/${item.id}/edit`}
                        className="text-xs sm:text-sm font-medium text-[#0D9488] hover:text-[#0f766e] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.jamaah_name, item.item)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-rose-500 hover:text-rose-700 hover:underline disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 inline" />
                        <span>Hapus</span>
                      </button>
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
