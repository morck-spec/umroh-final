'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plane, Calendar, MapPin, Users } from 'lucide-react';

export default function JourneyComponent() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data: jamaahData } = await supabase
        .from('jamaah')
        .select('id')
        .eq('profile_id', userData.user.id)
        .single();

      if (jamaahData) {
        // Fetch active registration and its package
        const { data: regData } = await supabase
          .from('registrations')
          .select('*, packages(*)')
          .eq('jamaah_id', jamaahData.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (regData) {
          setRegistration(regData);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) return <div className="animate-pulse p-4 text-slate-500">Memuat Jadwal Perjalanan...</div>;

  if (!registration) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plane className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Belum Ada Perjalanan Aktif</h3>
        <p className="text-slate-500 max-w-md mx-auto">Anda belum terdaftar atau pendaftaran Anda belum disetujui untuk keberangkatan manapun saat ini.</p>
      </div>
    );
  }

  const pkg = registration.packages;
  const startDate = pkg.departure_date ? new Date(pkg.departure_date) : null;
  const today = new Date();

  let diffDays = 0;
  let isPast = false;

  if (startDate) {
    const diffTime = Math.abs(startDate.getTime() - today.getTime());
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isPast = today > startDate;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg shadow-lg overflow-hidden text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Plane className="w-48 h-48 transform rotate-45" />
        </div>
        <div className="p-8 relative z-10">
          <div className="uppercase tracking-wider text-emerald-200 font-semibold text-xs mb-2">Paket Perjalanan Anda</div>
          <h2 className="text-3xl font-bold mb-4">{pkg.name}</h2>

          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Keberangkatan</p>
                <p className="font-semibold">{startDate ? startDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Belum Ditentukan'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Durasi</p>
                <p className="font-semibold">{pkg.duration_days} Hari</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> Countdown Keberangkatan
          </h3>
          <div className="text-center py-6">
            {isPast ? (
              <div>
                <p className="text-lg text-slate-500 mb-2">Keberangkatan telah lewat</p>
                <p className="text-4xl font-bold text-slate-800">Alhamdulillah</p>
              </div>
            ) : (
              <div>
                <p className="text-5xl font-extrabold text-emerald-600 mb-2">{diffDays}</p>
                <p className="text-slate-500 font-medium">Hari lagi menuju Tanah Suci</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Informasi Pendukung
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Status Pendaftaran</p>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Disetujui</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Maskapai & Hotel</p>
              <p className="font-medium text-slate-800 text-sm">Menunggu informasi kloter</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Pembimbing / Muthawif</p>
              <p className="font-medium text-slate-800 text-sm">Akan diumumkan mendekati keberangkatan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
