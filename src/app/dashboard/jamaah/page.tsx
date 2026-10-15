import { AlignJustify, Banknote, FileText, CalendarDays } from 'lucide-react';
import { PageHeader, StatCard, Card, rupiah, EmptyNote } from '@/components/dashboard/DashboardWidgets';
import { createClient } from '@/utils/supabase/server';

export const metadata = { title: 'Dashboard Jamaah | Travel Umroh & Haji' };

const badge = {
  ok: 'bg-[#E7F6EC] text-[#16A34A]',
  up: 'bg-[#FDF3D8] text-[#B7791F]',
  no: 'bg-slate-100 text-slate-500',
};

export default async function JamaahDashboard() {
  let name = 'Ahmad Fauzi';
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (p?.full_name) name = p.full_name;
    }
  } catch {}

  const total = 28500000;
  const paid = 28500000;
  const depart = new Date(2026, 11, 10);
  const days = Math.max(0, Math.ceil((depart.getTime() - Date.now()) / 86400000));

  const docs: { name: string; status: keyof typeof badge; label: string }[] = [
    { name: 'KTP', status: 'ok', label: 'Terverifikasi' },
    { name: 'Kartu Keluarga', status: 'up', label: 'Sudah Diunggah' },
    { name: 'Paspor', status: 'no', label: 'Belum Diunggah' },
    { name: 'Pas Foto 4x6 (latar putih)', status: 'ok', label: 'Terverifikasi' },
    { name: 'Buku Nikah / Akta Lahir', status: 'ok', label: 'Terverifikasi' },
    { name: 'Sertifikat Vaksin Meningitis', status: 'up', label: 'Sudah Diunggah' },
  ];
  const verified = docs.filter((d) => d.status === 'ok').length;

  return (
    <div>
      <PageHeader title="Dashboard Jamaah" subtitle={`Selamat datang, ${name}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard icon={AlignJustify} tone="blue" label="Status Pendaftaran" value="Dikonfirmasi" />
        <StatCard
          icon={Banknote}
          tone="green"
          label="Progress Pembayaran"
          value={`${Math.round((paid / total) * 100)}%`}
          sub={`${rupiah(paid)} / ${rupiah(total)}`}
        />
        <StatCard icon={FileText} tone="teal" label="Dokumen Terverifikasi" value={`${verified} / ${docs.length}`} />
        <StatCard icon={CalendarDays} tone="purple" label="Hitung Mundur" value={`${days} hari`} sub="10 Dec 2026" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        <Card title="Progress Pembayaran" className="lg:col-span-2">
          <div className="flex justify-between text-[11px] text-slate-600 mb-2">
            <span>Terbayar</span>
            <span className="font-semibold text-slate-800">{rupiah(paid)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-[#0F9488]" style={{ width: `${(paid / total) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-600 mt-2 pb-4 border-b border-slate-100">
            <span>Sisa Tagihan</span>
            <span className="font-semibold text-red-600">{rupiah(total - paid)}</span>
          </div>
          <p className="text-[11px] font-medium text-slate-800 mt-4">Umroh Reguler 9 Hari</p>
          <p className="text-[9px] text-slate-400">Umroh · 9 hari · Berangkat 10 Dec 2026</p>
        </Card>

        <Card title="Checklist Dokumen">
          <ul className="divide-y divide-slate-100">
            {docs.map((d) => (
              <li key={d.name} className="flex items-center justify-between py-2 first:pt-0">
                <span className="text-[11px] text-slate-700">{d.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full ${badge[d.status]}`}>{d.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card title="Jadwal Manasik" className="lg:col-span-2">
          <EmptyNote text="Belum ada jadwal manasik." />
        </Card>
        <Card title="Pengumuman Terbaru">
          <EmptyNote text="Belum ada pengumuman." />
        </Card>
      </div>
    </div>
  );
}
