import { UsersRound, CheckCircle2, Wallet, Clock } from 'lucide-react';
import { PageHeader, StatCard, Card, BarChart, DonutChart, rupiah } from '@/components/dashboard/DashboardWidgets';

export const metadata = { title: 'Dashboard Agen | Travel Umroh & Haji' };

export default function MitraAgenDashboard() {
  const months = ['Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'];
  const komisiValues = [0, 0, 0, 12375000, 0, 0, 2737500, 0, 0, 0, 2325000, 0];
  const customTicks = [0, 2000000, 4000000, 6000000, 8000000, 10000000, 12000000, 14000000];

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard Agen" subtitle="Ringkasan referral & komisi Anda" />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersRound} tone="teal" label="Jamaah Referral" value="3" />
        <StatCard icon={CheckCircle2} tone="green" label="Total Komisi" value={rupiah(17437500)} />
        <StatCard icon={Wallet} tone="blue" label="Komisi Dibayar" value={rupiah(0)} />
        <StatCard icon={Clock} tone="amber" label="Komisi Pending" value={rupiah(17437500)} />
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
        <div className="space-y-4 py-1">
          {/* Announcement 1: Jadwal Manasik Akbar */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f3e8ff] text-[#9333ea]">
                Semua Pengguna
              </span>
              <span className="text-[11px] text-slate-400">12 Oct 2026</span>
            </div>
            <h3 className="text-[13px] font-semibold text-slate-800">Jadwal Manasik Akbar</h3>
            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
              Manasik akbar akan dilaksanakan akhir bulan ini di aula utama. Wajib hadir.
            </p>
          </div>

          <div className="border-t border-slate-100" />

          {/* Announcement 2: Target Komisi Bulanan */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fef3c7] text-[#d97706]">
                Agen
              </span>
              <span className="text-[11px] text-slate-400">11 Oct 2026</span>
            </div>
            <h3 className="text-[13px] font-semibold text-slate-800">Target Komisi Bulanan</h3>
            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
              Selamat kepada para agen! Mari capai target referral bulan ini.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
