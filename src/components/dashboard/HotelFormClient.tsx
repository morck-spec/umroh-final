'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Hotel, saveHotel } from '@/app/dashboard/shared/actions/masterData';
import { ChevronDown, Star } from 'lucide-react';

interface HotelFormClientProps {
  hotel?: Hotel | null;
  isCreate?: boolean;
}

export default function HotelFormClient({ hotel, isCreate = false }: HotelFormClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/hotels'
    : isAdmin
    ? '/dashboard/admin/hotels'
    : pathname.startsWith('/hotels')
    ? '/hotels'
    : '/dashboard/superadmin/hotels';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const [name, setName] = useState(hotel?.name || '');
  const [city, setCity] = useState<'Mekah' | 'Madinah'>(hotel?.city || 'Mekah');
  const [stars, setStars] = useState<number>(hotel?.stars || 5);
  const [distanceM, setDistanceM] = useState<number | string>(hotel?.distance_m ?? 150);
  const [description, setDescription] = useState(hotel?.description || '');
  const [isActive, setIsActive] = useState(hotel ? hotel.is_active : true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama hotel wajib diisi');
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('city', city);
      fd.append('stars', String(stars));
      if (distanceM !== '') fd.append('distance_m', String(distanceM));
      if (description) fd.append('description', description.trim());
      if (isActive) fd.append('is_active', 'on');

      const res = await saveHotel(hotel ? hotel.id : null, fd);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push(basePath);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4 max-w-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
        <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&gt;</span>
        <Link href={basePath} className="hover:text-slate-600 transition-colors">
          Hotel
        </Link>
        <span>&gt;</span>
        <span className="text-slate-600 font-medium">
          {isCreate ? 'Tambah' : 'Edit'}
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {isCreate ? 'Tambah Hotel' : 'Edit Hotel'}
        </h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          {isCreate ? 'Tambah data hotel Mekah atau Madinah' : hotel?.name}
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          {/* Nama Hotel */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Nama Hotel <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Swissôtel Al Maqam Makkah"
              className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* Row 2: Kota & Bintang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Kota <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as 'Mekah' | 'Madinah')}
                  className="w-full h-[38px] rounded-md border border-slate-300 pl-3 pr-8 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer shadow-2xs"
                >
                  <option value="Mekah">Mekah</option>
                  <option value="Madinah">Madinah</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                Rating Bintang
              </label>
              <div className="flex items-center gap-1.5 h-[38px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-slate-600 ml-1">
                  {stars} Bintang
                </span>
              </div>
            </div>
          </div>

          {/* Jarak ke Masjid */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Jarak ke Masjid (meter)
            </label>
            <input
              type="number"
              min={0}
              value={distanceM}
              onChange={(e) => setDistanceM(e.target.value)}
              placeholder="Contoh: 150"
              className="w-full h-[38px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fasilitas dan catatan hotel..."
              className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-y"
            />
          </div>

          {/* Status Aktif */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 accent-teal-600 cursor-pointer"
              />
              <span className="text-[13px] font-medium text-slate-700">Aktif</span>
            </label>
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
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
          <Link
            href={basePath}
            className="py-2.5 px-6 rounded-md border border-slate-300 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
