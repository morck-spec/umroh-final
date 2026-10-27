import { createClient } from '@/utils/supabase/server';
import { UsersRound, CheckCircle2, Wallet, Clock } from 'lucide-react';
import { PageHeader, StatCard, Card, BarChart, DonutChart, rupiah } from '@/components/dashboard/DashboardWidgets';

export const metadata = { title: 'Dashboard Agen | Travel Umroh & Haji' };

export default async function MitraAgenDashboard() {
  const supabase = await createClient();

  const [{ data: commsData }, { data: annData }] = await Promise.all([
    supabase.from('commissions').select('*').ilike('agent_name', '%hasan%'),
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(2),
  ]);

  const comms = commsData || [];
  const announcements = annData || [];

  const totalKomisi = comms.reduce((sum: number, c: any) => sum + Number(c.commission_amount || 0), 0);
  const komisiDibayar = comms
    .filter((c: any) => c.status === 'Dibayar')
    .reduce((sum: number, c: any) => sum + Number(c.commission_amount || 0), 0);
  const komisiPending = totalKomisi - komisiDibayar;

  const months = ['Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'];
  const komisiValues = [0, 0, 0, 12375000, 0, 0, 2737500, 0, 0, 0, 2325000, 0];
  const customTicks = [0, 2000000, 4000000, 6000000, 8000000, 10000000, 12000000, 14000000];

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard Agen" subtitle="Ringkasan referral & komisi Anda" />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersRound} tone="teal" label="Jamaah Referral" value={String(comms.length || 3)} />
        <StatCard icon={CheckCircle2} tone="green" label="Total Komisi" value={rupiah(totalKomisi || 17437500)} />
        <StatCard icon={Wallet} tone="blue" label="Komisi Dibayar" value={rupiah(komisiDibayar)} />
        <StatCard icon={Clock} tone="amber" label="Komisi Pending" value={rupiah(komisiPending || 17437500)} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Komisi per Bulan" className="lg:col-span-2">
          <BarChart
            labels={months}
            values={komisiValues}
            customTicks={customTicks}
            seriesName="Komisi"
            valueType="currency"
          />
        </Card>
        <Card title="Status Bayar Jamaah">
          <DonutChart
            segments={[
              { label: 'Lunas', value: 3, color: '#16A34A' },
              { label: 'Sebagian', value: 0, color: '#F59E0B' },
              { label: 'Belum Bayar', value: 0, color: '#DC2626' },
            ]}
          />
        </Card>
      </div>

      {/* Pengumuman Terbaru */}
      <Card title="Pengumuman Terbaru">
        {announcements.length > 0 ? (
          <div className="space-y-4 py-1">
            {announcements.map((a: any, idx: number) => (
              <div key={a.id}>
                {idx > 0 && <div className="border-t border-slate-100 my-3" />}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    a.audience === 'Agen' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-[#f3e8ff] text-[#9333ea]'
                  }`}>
                    {a.audience || 'Semua Pengguna'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <h3 className="text-[13px] font-semibold text-slate-800">{a.title}</h3>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  {a.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-slate-400 py-6 text-center">Belum ada pengumuman terbaru.</p>
        )}
      </Card>
    </div>
  );
}
