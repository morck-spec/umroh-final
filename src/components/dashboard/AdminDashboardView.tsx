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
  const supabase = await createClient();

  // Query live data from Supabase
  const [
    { count: totalJamaah },
    { data: regsData },
    { data: pkgsData },
    { data: paymentsData },
    { data: announcementsData },
  ] = await Promise.all([
    supabase.from('jamaah').select('*', { count: 'exact', head: true }),
    supabase
      .from('registrations')
      .select('id, created_at, packages(id, name, price, departure_date), payments(amount, status)')
      .order('created_at', { ascending: false }),
    supabase.from('packages').select('*').order('departure_date', { ascending: true }).limit(5),
    supabase.from('payments').select('amount, status'),
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(1),
  ]);

  const regs = regsData || [];
  const payments = paymentsData || [];
  const pkgs = pkgsData || [];

  const omzet = payments
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  let totalPackageBills = 0;
  let lunas = 0;
  let sebagian = 0;
  let belumBayar = 0;
  const perPaketMap: Record<string, number> = {};

  regs.forEach((r: any) => {
    const price = Number(r.packages?.price || 0);
    totalPackageBills += price;

    const paid = (r.payments || [])
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    if (paid >= price && price > 0) lunas++;
    else if (paid > 0) sebagian++;
    else belumBayar++;

    const pName = (r.packages?.name || 'Paket Lainnya').trim();
    perPaketMap[pName] = (perPaketMap[pName] || 0) + 1;
  });

  const outstanding = Math.max(0, totalPackageBills - omzet);

  const stats = {
    jamaah: totalJamaah || regs.length,
    regs: regs.length,
    omzet,
    outstanding,
  };

  // Compute 12 month monthly registration counts
  const now = new Date();
  const monthly = Array(12).fill(0);
  regs.forEach((r: any) => {
    if (!r.created_at) return;
    const d = new Date(r.created_at);
    const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diffMonths >= 0 && diffMonths < 12) {
      monthly[11 - diffMonths]++;
    }
  });

  const perPaketLabels = Object.keys(perPaketMap).length > 0
    ? Object.keys(perPaketMap)
    : ['Belum Ada Pendaftaran'];
  const perPaketValues = Object.keys(perPaketMap).length > 0
    ? Object.values(perPaketMap)
    : [0];

  const departures = pkgs.map((p: any) => {
    const isHajiPlus = p.name?.toLowerCase().includes('haji plus');
    const isHaji = p.name?.toLowerCase().includes('haji');
    const type = isHajiPlus ? 'Haji Plus' : isHaji ? 'Haji' : 'Umroh';
    const badgeClass = isHajiPlus
      ? 'bg-purple-50 text-purple-700 border border-purple-200'
      : isHaji
      ? 'bg-blue-50 text-blue-700 border border-blue-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

    return {
      name: p.name,
      date: p.departure_date
        ? new Date(p.departure_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'TBA',
      quota: `sisa kuota ${p.quota || 0}`,
      type,
      badgeClass,
    };
  });

  const latestAnnouncement = announcementsData?.[0] || null;

  return (
    <div>
      <PageHeader
        title={isCabang ? 'Dashboard Cabang' : 'Dashboard Operasional'}
        subtitle={isCabang ? 'Ringkasan Kantor Cabang' : 'Ringkasan Kantor Pusat Jakarta'}
      />

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
              { label: 'Lunas', value: lunas, color: '#16A34A' },
              { label: 'Sebagian', value: sebagian, color: '#F59E0B' },
              { label: 'Belum Bayar', value: belumBayar, color: '#DC2626' },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title="Jamaah per Paket" className="lg:col-span-2">
          <BarChart labels={perPaketLabels} values={perPaketValues} />
        </Card>

        <Card title="Keberangkatan Terdekat">
          {departures.length === 0 ? (
            <p className="text-[12px] text-slate-400 py-6 text-center">Belum ada paket keberangkatan.</p>
          ) : (
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
          )}
        </Card>
      </div>

      {/* Pengumuman Terbaru */}
      <div>
        <Card title="Pengumuman Terbaru">
          {latestAnnouncement ? (
            <div className="py-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1ECFD] text-[#8B5CF6]">
                  {latestAnnouncement.audience || 'Semua Pengguna'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {latestAnnouncement.created_at
                    ? new Date(latestAnnouncement.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '-'}
                </span>
              </div>
              <p className="font-semibold text-slate-800 text-[13px] mt-1.5">{latestAnnouncement.title}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                {latestAnnouncement.content}
              </p>
            </div>
          ) : (
            <p className="text-[12px] text-slate-400 py-6 text-center">Belum ada pengumuman terbaru.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
