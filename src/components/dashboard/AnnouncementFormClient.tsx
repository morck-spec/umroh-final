'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  AnnouncementItem,
  createAnnouncement,
  updateAnnouncement,
} from '@/app/dashboard/shared/actions/announcements';

interface Props {
  initialItem?: AnnouncementItem | null;
  packageChoices: string[];
  basePath?: string;
  isEdit?: boolean;
}

export default function AnnouncementFormClient({
  initialItem,
  packageChoices,
  basePath = '/dashboard/superadmin/announcements',
  isEdit = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/announcements') ? '/announcements' : basePath;

  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState<string>(initialItem?.title || '');
  const [content, setContent] = useState<string>(initialItem?.content || '');
  const [audience, setAudience] = useState<'Semua' | 'Jamaah' | 'Agen' | 'Staff'>(
    initialItem?.audience || 'Jamaah'
  );
  const [branch, setBranch] = useState<string>(initialItem?.branch || 'Kantor Pusat Jakarta');
  const [packageName, setPackageName] = useState<string>(
    initialItem?.package_name || 'Semua Paket'
  );
  const [startsAt, setStartsAt] = useState<string>(
    initialItem?.starts_at || '2026-10-13T06:08'
  );
  const [expiresAt, setExpiresAt] = useState<string>(initialItem?.expires_at || '');
  const [isPublished, setIsPublished] = useState<boolean>(
    initialItem?.is_published ?? true
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      if (isEdit && initialItem) {
        const res = await updateAnnouncement(initialItem.id, {
          title,
          content,
          audience,
          branch,
          package_name: packageName,
          starts_at: startsAt,
          expires_at: expiresAt,
          is_published: isPublished,
        });

        if (res.error) {
          alert(res.error);
        } else {
          alert('Pengumuman berhasil diperbarui!');
          router.push(activeBasePath);
          router.refresh();
        }
      } else {
        const res = await createAnnouncement({
          title,
          content,
          audience,
          branch,
          package_name: packageName,
          starts_at: startsAt || new Date().toISOString().slice(0, 16),
          expires_at: expiresAt,
          is_published: isPublished,
        });

        if (res.error) {
          alert(res.error);
        } else {
          alert('Pengumuman berhasil dibuat!');
          router.push(activeBasePath);
          router.refresh();
        }
      }
    });
  }

  const pageTitle = isEdit ? 'Edit Pengumuman' : 'Tambah Pengumuman';
  const pageSubtitle = isEdit ? initialItem?.title || 'Pengumuman' : 'Form pembuatan pengumuman baru';
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
          Pengumuman
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">{isEdit ? 'Edit' : 'Tambah'}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
        <p className="text-xs text-slate-500 mt-1">{pageSubtitle}</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
        <h2 className="text-sm font-semibold text-slate-800 mb-5">Detail Pengumuman</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Judul <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Pelunasan Umroh Reguler"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
          </div>

          {/* Isi Pengumuman */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Isi Pengumuman <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Tuliskan isi pengumuman..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm resize-none"
            />
          </div>

          {/* Audiens & Cabang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Audiens <span className="text-rose-500">*</span>
              </label>
              <select
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value as 'Semua' | 'Jamaah' | 'Agen' | 'Staff')
                }
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                <option value="Semua">Semua</option>
                <option value="Jamaah">Jamaah</option>
                <option value="Agen">Agen</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Cabang</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                <option value="Kantor Pusat Jakarta">Kantor Pusat Jakarta</option>
                <option value="Cabang Surabaya">Cabang Surabaya</option>
                <option value="Cabang Bandung">Cabang Bandung</option>
                <option value="Semua Cabang">Semua Cabang</option>
              </select>
            </div>
          </div>

          {/* Paket (opsional) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Paket (opsional)</label>
            <select
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            >
              {packageChoices.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Tayang Mulai & Kedaluwarsa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Tayang Mulai</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Kedaluwarsa</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>
          </div>

          {/* Checkbox Terbitkan */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
              />
              <span>Terbitkan</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
            >
              {isPending
                ? 'Menyimpan...'
                : isEdit
                ? 'Simpan Perubahan'
                : 'Simpan Pengumuman'}
            </button>
            <Link
              href={backHref}
              className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
