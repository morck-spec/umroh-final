import { UsersRound, CalendarDays, Check } from 'lucide-react';
import { PageHeader, StatCard, Card, DonutChart, EmptyNote } from '@/components/dashboard/DashboardWidgets';

export const metadata = { title: 'Dashboard Muthawif | Travel Umroh & Haji' };

export default function MuthawifDashboard() {
  const upcoming = [
    { day: '24', mon: 'Oct', title: 'Manasik Umroh Reguler 9 Hari #2', place: 'Aula Kantor Pusat Jakarta' },
    { day: '27', mon: 'Oct', title: 'Manasik Haji Plus Eksklusif #2', place: 'Aula Kantor Pusat Jakarta' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard Muthawif" subtitle="Jamaah bimbingan & jadwal manasik Anda" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3" id="jamaah">
        <StatCard icon={UsersRound} tone="teal" label="Jamaah Bimbingan" value="4" />
        <StatCard icon={CalendarDays} tone="blue" label="Manasik Hari Ini" value="0" />
        <StatCard icon={Check} tone="green" label="Total Kehadiran" value="4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        <Card title="Manasik Mendatang" className="lg:col-span-2" id="manasik">
          <ul className="divide-y divide-slate-100">
            {upcoming.map((m) => (
              <li key={m.title} className="flex items-center gap-3 py-3 first:pt-0">
                <div className="w-9 text-center rounded-md bg-[#E6F6F3] text-[#0F9488] py-1 leading-tight">
                  <p className="text-[11px] font-semibold">{m.day}</p>
                  <p className="text-[8px]">{m.mon}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-800 truncate">{m.title}</p>
                  <p className="text-[9px] text-slate-400">{m.place}</p>
                </div>
                <a href="/dashboard/muthawif/manasik" className="text-[10px] text-[#0F9488] hover:underline">Absensi</a>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Rekap Kehadiran">
          <DonutChart
            segments={[
              { label: 'Hadir', value: 4, color: '#16A34A' },
              { label: 'Tidak Hadir', value: 1, color: '#DC2626' },
              { label: 'Izin', value: 0, color: '#F59E0B' },
            ]}
          />
        </Card>
      </div>

      <Card title="Pengumuman Terbaru">
        <EmptyNote text="Belum ada pengumuman." />
      </Card>
    </div>
  );
}
