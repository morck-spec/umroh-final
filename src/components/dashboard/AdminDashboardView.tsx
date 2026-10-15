import { createClient } from '@/utils/supabase/server';
import { UsersRound, AlignJustify, Banknote, Ban } from 'lucide-react';
import { PageHeader, StatCard, Card, LineChart, BarChart, DonutChart, last12MonthLabels, rupiah } from './DashboardWidgets';

async function safeCount(table: string) {
  try {
    const supabase = await createClient();
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return count || 0;
  } catch {
    return 0;
  }
}

export default async function AdminDashboardView({ scope }: { scope: 'pusat' | 'cabang' }) {
  const isCabang = scope === 'cabang';
  const [jamaah, regs] = await Promise.all([safeCount('jamaah'), safeCount('registrations')]);

  const stats = {
    jamaah: jamaah || 12,
    regs: regs || (isCabang ? 10 : 12),
    omzet: isCabang ? 318333333 : 363666667,
    outstanding: isCabang ? 456666667 : 473333333,
  };

  const monthly = isCabang ? [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1] : [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1];

  // Bar chart data matching reference photo
  const perPaketLabels = [
    'Umroh Reguler 9 Hari',
    'Umroh Plus Turki 12 Hari',
    'Haji Khusus 2026',
    'Haji Plus Eksklusif',
    'Umroh Akhir Tahun',
  ];
  const perPaketValues = [3.0, 3.0, 2.0, 2.0, 2.0];

  // Upcoming departures matching reference photo
  const departures = [
    {
      name: 'Umroh Akhir Tahun',
      date: '10 Nov 2026',
      quota: 'sisa kuota 48',
      type: 'Umroh',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      name: 'Umroh Reguler 9 Hari',
      date: '10 Dec 2026',
      quota: 'sisa kuota 42',
      type: 'Umroh',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      name: 'Umroh Plus Turki 12 Hari',
      date: '10 Jan 2027',
      quota: 'sisa kuota 37',
      type: 'Umroh',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      name: 'Haji Khusus 2026',
      date: '10 Feb 2027',
      quota: 'sisa kuota 28',
      type: 'Haji',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    {
      name: 'Haji Plus Eksklusif',
      date: '10 Apr 2027',
      quota: 'sisa kuota 18',
      type: 'Haji Plus',
      badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard Operasional" subtitle="Ringkasan Kantor Pusat Jakarta" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard icon={UsersRound} tone="teal" label="Total Jamaah" value={String(stats.jamaah)} />
        <StatCard icon={AlignJustify} tone="blue" label="Pendaftaran Aktif" value={String(stats.regs)} />
        <StatCard icon={Banknote} tone="green" label="Omzet Diterima" value={rupiah(stats.omzet)} />
        <StatCard icon={Ban} tone="amber" label="Outstanding" value={rupiah(stats.outstanding)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title="Pendaftaran 12 Bulan Terakhir" className="lg:col-span-2">
          <LineChart labels={last12MonthLabels()} values={monthly} legend="Pendaftaran" />
        </Card>
        <Card title="Status Pembayaran">
          <DonutChart
            segments={[
              { label: 'Lunas', value: 4, color: '#16A34A' },
              { label: 'Sebagian', value: isCabang ? 3 : 4, color: '#F59E0B' },
              { label: 'Belum Bayar', value: 4, color: '#DC2626' },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title="Jamaah per Paket" className="lg:col-span-2">
          <BarChart labels={perPaketLabels} values={perPaketValues} customTicks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]} />
        </Card>

        <Card title="Keberangkatan Terdekat">
          <ul className="divide-y divide-slate-100">
            {departures.map((d) => (
              <li key={d.name} className="py-2.5 flex items-center justify-between first:pt-0">
                <div className="min-w-0 pr-2">
                  <p className="text-[12px] font-medium text-slate-800 truncate">{d.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {d.date} · {d.quota}
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${d.badgeClass}`}>
                  {d.type}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Pengumuman Terbaru */}
      <div>
        <Card title="Pengumuman Terbaru">
          <div className="py-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1ECFD] text-[#8B5CF6]">
                Semua Pengguna
              </span>
              <span className="text-[11px] text-slate-400">12 Oct 2026</span>
            </div>
            <p className="font-semibold text-slate-800 text-[13px] mt-1.5">Jadwal Manasik Akbar</p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Manasik akbar akan dilaksanakan akhir bulan ini di aula utama. Wajib hadir.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
