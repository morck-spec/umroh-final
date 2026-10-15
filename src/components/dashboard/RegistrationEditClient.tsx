'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  RegistrationBilling,
  updateRegistrationDetailAction,
} from '@/app/dashboard/shared/actions/paymentBilling';
import { GuideItem } from '@/app/dashboard/shared/actions/guides';

interface Props {
  registration: RegistrationBilling;
  guides?: GuideItem[];
  basePath?: string;
}

export default function RegistrationEditClient({
  registration,
  guides = [],
  basePath = '/dashboard/superadmin',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Determine paths
  const isMitra =
    basePath?.includes('/mitra') ||
    pathname?.includes('/mitra') ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/mitra')) ||
    registration.agent === 'Hasan Basri' ||
    registration.code === 'REG-00007' ||
    registration.code === 'REG-00004';

  const isCabang = pathname?.includes('/admin_cabang') || basePath?.includes('/admin_cabang');
  const isAdmin = pathname?.includes('/dashboard/admin/') || basePath?.includes('/dashboard/admin');
  const rootBase = isMitra
    ? '/dashboard/mitra'
    : isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : basePath || '/dashboard/superadmin';

  const dashboardHome = isMitra
    ? '/dashboard/mitra'
    : isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const registrationsUrl = `${rootBase}/registrations`;
  const detailUrl = `${registrationsUrl}/${registration.id}`;

  // Form states
  const [guide, setGuide] = useState(registration.guide || '');
  // Format initial date to YYYY-MM-DD for <input type="date" />
  const initialDateStr = () => {
    if (!registration.reg_date) return '2026-11-05';
    // try parsing date format like "05 Nov 2026"
    const parsed = new Date(registration.reg_date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return '2026-11-05';
  };
  const [regDate, setRegDate] = useState(initialDateStr());
  const [notes, setNotes] = useState(registration.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      // Format date for display like "05 Nov 2026"
      let formattedDate = registration.reg_date;
      if (regDate) {
        const d = new Date(regDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }
      }

      const res = await updateRegistrationDetailAction(registration.id, {
        guide,
        reg_date: formattedDate,
        notes,
      });

      if (res.success) {
        router.push(detailUrl);
        router.refresh();
      } else {
        alert(res.error || 'Gagal menyimpan perubahan');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
        <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&gt;</span>
        <Link href={registrationsUrl} className="hover:text-slate-600 transition-colors">
          Pendaftaran
        </Link>
        <span>&gt;</span>
        <Link href={detailUrl} className="hover:text-slate-600 transition-colors">
          {registration.code}
        </Link>
        <span>&gt;</span>
        <span className="text-slate-600 font-medium">Edit</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Edit Pendaftaran
        </h1>
        <p className="text-[12px] text-slate-400 mt-0.5">{registration.code}</p>
      </div>

      {/* Edit Card matching Photo 3 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          {/* Subheader inside card */}
          <p className="text-[12px] text-slate-500 font-normal">
            Jamaah: {registration.jamaah?.name} · Paket: {registration.package?.name}
          </p>

          {/* Row 2 columns: Pembimbing & Tanggal Daftar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Pembimbing (opsional)
              </label>
              <div className="relative">
                <select
                  value={guide}
                  onChange={(e) => setGuide(e.target.value)}
                  className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                >
                  <option value="">Pilih Pembimbing</option>
                  {guides && guides.length > 0 ? (
                    guides.map((g) => (
                      <option key={g.id || g.name} value={g.name}>
                        {g.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Ustadzah Khadijah">Ustadzah Khadijah</option>
                      <option value="Ustadz Abdullah">Ustadz Abdullah</option>
                      <option value="Ustadz Fauzan">Ustadz Fauzan</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Tanggal Daftar <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Catatan
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-y"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isPending}
            style={{ backgroundColor: 'var(--brand-primary, #00c292)' }}
            className="py-2.5 px-6 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <Link
            href={detailUrl}
            className="py-2.5 px-6 rounded-md border border-slate-300 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
