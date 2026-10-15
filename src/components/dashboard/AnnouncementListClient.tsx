'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { AnnouncementItem, deleteAnnouncement } from '@/app/dashboard/shared/actions/announcements';

interface Props {
  initialItems: AnnouncementItem[];
  basePath?: string;
}

export default function AnnouncementListClient({
  initialItems,
  basePath = '/dashboard/superadmin/announcements',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/announcements') ? '/announcements' : basePath;

  const [items, setItems] = useState<AnnouncementItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  function renderAudienceBadge(audience: string) {
    if (audience === 'Jamaah') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          Jamaah
        </span>
      );
    }
    if (audience === 'Agen') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          Agen
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
        {audience || 'Semua'}
      </span>
    );
  }

  function renderStatusBadge(isPublished: boolean) {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <span>Published</span>
          <span className="text-[10px] opacity-80">&bull; Live</span>
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
        Draft
      </span>
    );
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteAnnouncement(id);
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
        <span className="text-slate-600 font-medium">Pengumuman</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengumuman</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola pengumuman untuk pengguna</p>
        </div>
        <Link
          href={createHref}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0f766e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengumuman</span>
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4">JUDUL</th>
                <th className="px-5 py-4">AUDIENS</th>
                <th className="px-5 py-4">CABANG</th>
                <th className="px-5 py-4">STATUS</th>
                <th className="px-5 py-4">PUBLISH</th>
                <th className="px-5 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Belum ada pengumuman yang dibuat.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap text-sm">
                      {item.title}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderAudienceBadge(item.audience)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.branch || 'Kantor Pusat Jakarta'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderStatusBadge(item.is_published)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.publish_formatted || '-'}
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
                        onClick={() => handleDelete(item.id, item.title)}
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
