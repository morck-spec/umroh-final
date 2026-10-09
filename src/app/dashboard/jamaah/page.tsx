import { createClient } from '@/utils/supabase/server';
import { Package, User, FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Portal Jamaah | Trecer' };

export default async function JamaahDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get jamaah data
  let jamaahData = null;
  let registrations = [];

  if (user) {
    const { data } = await supabase.from('jamaah').select('*').eq('profile_id', user.id).single();
    jamaahData = data;

    if (jamaahData) {
      const { data: regs } = await supabase
        .from('registrations')
        .select('*, packages(name, departure_date)')
        .eq('jamaah_id', jamaahData.id);
      if (regs) registrations = regs;
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Ahlan wa Sahlan, {user?.user_metadata?.name || 'Jamaah'}!</h1>
          <p className="text-emerald-100 max-w-2xl">Selamat datang di Portal Jamaah Trecer. Di sini Anda dapat melihat status pendaftaran, melengkapi dokumen, dan melakukan pembayaran umroh.</p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
          <User className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/jamaah/registrations" className="card hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center group cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900">Pendaftaran Umroh</h3>
          <p className="text-slate-500 text-sm mt-1">Lihat status pendaftaran dan jadwal keberangkatan paket Anda.</p>
        </Link>

        <Link href="/dashboard/jamaah/documents" className="card hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center group cursor-pointer">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900">Dokumen Saya</h3>
          <p className="text-slate-500 text-sm mt-1">Unggah paspor, KTP, dan kelengkapan dokumen persyaratan.</p>
        </Link>

        <Link href="/dashboard/jamaah/payment" className="card hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center group cursor-pointer">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900">Pembayaran</h3>
          <p className="text-slate-500 text-sm mt-1">Lihat riwayat pembayaran dan status pelunasan paket umroh.</p>
        </Link>
      </div>

      {registrations.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Status Keberangkatan Anda</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {registrations.map((reg: any) => (
                <div key={reg.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center bg-slate-50">
                  <div>
                    <h4 className="font-semibold text-slate-900">{reg.packages?.name}</h4>
                    <p className="text-sm text-slate-500">Keberangkatan: {reg.packages?.departure_date ? new Date(reg.packages.departure_date).toLocaleDateString('id-ID') : 'Belum Ditentukan'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                    ${reg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
