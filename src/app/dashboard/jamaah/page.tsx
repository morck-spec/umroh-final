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
  let name = 'Jamaah';
  let jamaahId: string | null = null;
  const supabase = await createClient();
  let isAuthenticated = false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isAuthenticated = true;
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (p?.full_name) name = p.full_name;
      const { data: j } = await supabase.from('jamaah').select('id, full_name').eq('profile_id', user.id).maybeSingle();
      if (j) jamaahId = j.id;
    }
  } catch {}

  // Only fallback to demo Ahmad Fauzi if NOT logged in at all (public demo view)
  if (!isAuthenticated && !jamaahId) {
    const { data: defaultJamaah } = await supabase
      .from('jamaah')
      .select('id, full_name')
      .ilike('full_name', '%ahmad fauzi%')
      .maybeSingle();
    if (defaultJamaah) {
      jamaahId = defaultJamaah.id;
      name = defaultJamaah.full_name;
    }
  }

  // Fetch registration for this jamaah
  let reg: any = null;
  let dbDocs: any[] = [];
  let announcements: any[] = [];

  if (jamaahId) {
    const [regRes, docsRes, annRes] = await Promise.all([
      supabase
        .from('registrations')
        .select(`
          id,
          status,
          packages(id, name, price, duration_days, departure_date),
          payments(amount, status)
        `)
        .eq('jamaah_id', jamaahId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('documents').select('*').eq('jamaah_id', jamaahId),
      supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2),
    ]);

    reg = regRes.data;
    dbDocs = docsRes.data || [];
    announcements = annRes.data || [];
  }

  const hasRegistered = !!reg;
  const pkgPrice = Number(reg?.packages?.price || 0);
  const total = pkgPrice;
  const paid = (reg?.payments || [])
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  const departDateStr = reg?.packages?.departure_date;
  const depart = departDateStr ? new Date(departDateStr) : null;
  const days = depart ? Math.max(0, Math.ceil((depart.getTime() - Date.now()) / 86400000)) : 0;

  const packageName = reg?.packages?.name || 'Belum Terdaftar';
  const durationDays = reg?.packages?.duration_days || 0;
  const regStatus = reg?.status === 'approved' ? 'Dikonfirmasi' : reg?.status === 'pending' ? 'Pending' : reg?.status ? reg.status : 'Belum Terdaftar';

  // Checklist mapping based on real Supabase documents table
  const docTypes: { typeKey: string; name: string }[] = [
    { typeKey: 'KTP', name: 'KTP' },
    { typeKey: 'KK', name: 'Kartu Keluarga' },
    { typeKey: 'PASPOR', name: 'Paspor' },
    { typeKey: 'FOTO', name: 'Pas Foto 4x6 (latar putih)' },
    { typeKey: 'BUKU_NIKAH', name: 'Buku Nikah / Akta Lahir' },
    { typeKey: 'BUKU_KUNING', name: 'Sertifikat Vaksin Meningitis' },
  ];

  const docs = docTypes.map((dt) => {
    const matched = dbDocs.find((d) => d.document_type?.toUpperCase() === dt.typeKey);
    if (!matched) {
      return { name: dt.name, status: 'no' as keyof typeof badge, label: 'Belum Diunggah' };
    }
    if (matched.status === 'valid') {
      return { name: dt.name, status: 'ok' as keyof typeof badge, label: 'Terverifikasi' };
    }
    return { name: dt.name, status: 'up' as keyof typeof badge, label: 'Sudah Diunggah' };
  });

  const verified = docs.filter((d) => d.status === 'ok').length;
  const progressPercent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <div>
      <PageHeader title="Dashboard Jamaah" subtitle={`Selamat datang, ${name}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard icon={AlignJustify} tone="blue" label="Status Pendaftaran" value={regStatus} />
        <StatCard
          icon={Banknote}
          tone="green"
          label="Progress Pembayaran"
          value={hasRegistered ? `${progressPercent}%` : '0%'}
          sub={hasRegistered ? `${rupiah(paid)} / ${rupiah(total)}` : 'Belum ada tagihan'}
        />
        <StatCard icon={FileText} tone="teal" label="Dokumen Terverifikasi" value={`${verified} / ${docs.length}`} />
        <StatCard
          icon={CalendarDays}
          tone="purple"
          label="Hitung Mundur"
          value={depart ? `${days} hari` : '-'}
          sub={depart ? depart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Belum ada jadwal'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        <Card title="Progress Pembayaran" className="lg:col-span-2">
          {hasRegistered ? (
            <>
              <div className="flex justify-between text-[11px] text-slate-600 mb-2">
                <span>Terbayar</span>
                <span className="font-semibold text-slate-800">{rupiah(paid)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-[#0F9488]" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 mt-2 pb-4 border-b border-slate-100">
                <span>Sisa Tagihan</span>
                <span className="font-semibold text-red-600">{rupiah(Math.max(0, total - paid))}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-800 mt-4">{packageName}</p>
              <p className="text-[9px] text-slate-400">
                Umroh · {durationDays} hari · Berangkat {depart ? depart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </p>
            </>
          ) : (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Banknote className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Belum Terdaftar di Paket Umroh</p>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Pilih paket umroh yang sesuai dan lakukan pendaftaran untuk mulai merencanakan perjalanan ibadah Anda.
              </p>
              <a
                href="/packages"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                Lihat Pilihan Paket
              </a>
            </div>
          )}
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
          {announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="border-b border-slate-50 last:border-b-0 pb-2 last:pb-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#F1ECFD] text-[#8B5CF6]">
                      {a.audience || 'Semua'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-'}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800">{a.title}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyNote text="Belum ada pengumuman." />
          )}
        </Card>
      </div>
    </div>
  );
}
