'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { createRegistrationAction } from '@/app/dashboard/shared/actions/paymentBilling';
import { GuideItem } from '@/app/dashboard/shared/actions/guides';
import { AgentItem } from '@/app/dashboard/shared/actions/agents';

interface Props {
  jamaahList?: Array<{ id: string; name: string }>;
  packagesList?: Array<{ id: string; name: string; price: number }>;
  guides?: GuideItem[];
  agents?: AgentItem[];
  basePath?: string;
}

export default function RegistrationCreateClient({
  jamaahList = [],
  packagesList = [],
  guides = [],
  agents = [],
  basePath,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Determine paths
  const isMitra = pathname.includes('/mitra');
  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const rootBase = basePath
    ? basePath.replace('/registrations', '')
    : isMitra
    ? '/dashboard/mitra'
    : isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : pathname.startsWith('/registrations')
    ? ''
    : '/dashboard/superadmin';

  const dashboardHome = isMitra
    ? '/dashboard/mitra'
    : isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const registrationsUrl = basePath || (rootBase ? `${rootBase}/registrations` : '/registrations');

  // Form states
  const [jamaahName, setJamaahName] = useState('');
  const [packageId, setPackageId] = useState(packagesList[0]?.id || 'pkg-1');
  const [guide, setGuide] = useState(guides[0]?.name || 'Ustadzah Khadijah');
  const [agent, setAgent] = useState(agents[0]?.name || 'Hasan Basri');
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Dikonfirmasi');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jamaahName.trim()) {
      alert('Nama jamaah wajib dipilih atau diisi');
      return;
    }

    startTransition(async () => {
      let formattedDate = '';
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

      const res = await createRegistrationAction({
        jamaah_name: jamaahName,
        package_id: packageId,
        guide,
        agent,
        reg_date: formattedDate,
        notes,
        status,
      });

      if (res.success) {
        router.push(registrationsUrl);
        router.refresh();
      } else {
        alert(res.error || 'Gagal mendaftarkan jamaah');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
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
        <span className="text-slate-600 font-medium">Tambah</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Daftarkan Jamaah
        </h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Form pendaftaran booking paket Umroh &amp; Haji
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-[14px] font-bold text-slate-800 mb-2">
            Data Pendaftaran
          </h2>

          {/* Pilih Jamaah */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Jamaah <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={jamaahName}
                onChange={(e) => setJamaahName(e.target.value)}
                className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Jamaah --</option>
                {jamaahList && jamaahList.length > 0 ? (
                  jamaahList.map((j) => (
                    <option key={j.id || j.name} value={j.name}>
                      {j.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Belum ada data jamaah</option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Pilih Paket */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Paket Perjalanan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
              >
                {packagesList && packagesList.length > 0 ? (
                  packagesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Rp {Number(p.price).toLocaleString('id-ID')}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="pkg-1">Umroh Plus Turki 12 Hari - Rp 36.500.000</option>
                    <option value="pkg-4">Umroh Reguler 9 Hari - Rp 28.500.000</option>
                    <option value="pkg-5">Umroh Akhir Tahun - Rp 32.000.000</option>
                    <option value="pkg-3">Haji Plus Eksklusif - Rp 140.000.000</option>
                    <option value="pkg-2">Haji Khusus 2026 - Rp 125.000.000</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

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

          {/* Row 2 columns: Agen & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Agen (opsional)
              </label>
              <div className="relative">
                <select
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                >
                  <option value="">Tanpa Agen</option>
                  {agents && agents.length > 0 ? (
                    agents.map((a) => (
                      <option key={a.id || a.name} value={a.name}>
                        {a.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Hasan Basri">Hasan Basri</option>
                      <option value="Rahmat Hidayat">Rahmat Hidayat</option>
                      <option value="Siti Aminah">Siti Aminah</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                >
                  <option value="Dikonfirmasi">Dikonfirmasi</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Catatan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pendaftaran (opsional)..."
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
            {isPending ? 'Menyimpan...' : 'Daftarkan Jamaah'}
          </button>
          <Link
            href={registrationsUrl}
            className="py-2.5 px-6 rounded-md border border-slate-300 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
