'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { PackageItem, savePackage } from '@/app/dashboard/shared/actions/packages';

interface PackageFormClientProps {
  pkg?: PackageItem | null;
  isCreate?: boolean;
}

export default function PackageFormClient({ pkg, isCreate }: PackageFormClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isCabang = pathname.includes('/admin_cabang');
  const isAdmin = pathname.includes('/dashboard/admin/');
  const basePath = isCabang
    ? '/dashboard/admin_cabang/packages'
    : isAdmin
    ? '/dashboard/admin/packages'
    : pathname.startsWith('/packages')
    ? '/packages'
    : '/dashboard/superadmin/packages';

  const dashboardHome = isCabang
    ? '/dashboard/admin_cabang'
    : isAdmin
    ? '/dashboard/admin'
    : '/dashboard/superadmin';

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(pkg?.name || '');
  const [code, setCode] = useState(pkg?.code || '');
  const [branchName, setBranchName] = useState(pkg?.branch_name || 'Kantor Pusat Jakarta');
  const [type, setType] = useState(pkg?.type || 'Umroh');
  const [status, setStatus] = useState(pkg?.status || 'Dibuka');
  const [price, setPrice] = useState<number | string>(pkg?.price || '');
  const [downPayment, setDownPayment] = useState<number | string>(pkg?.down_payment || '');
  const [quota, setQuota] = useState<number | string>(pkg?.quota || 45);
  const [durationDays, setDurationDays] = useState<number | string>(pkg?.duration_days || 9);
  const [departureDate, setDepartureDate] = useState(pkg?.departure_date || '2026-12-10');
  const [departureCity, setDepartureCity] = useState(pkg?.departure_city || 'Jakarta');
  const [hotelMakkah, setHotelMakkah] = useState(pkg?.hotel_makkah || 'Swissôtel Al Maqam Makkah');
  const [hotelMadinah, setHotelMadinah] = useState(pkg?.hotel_madinah || 'Anwar Al Madinah Mövenpick');
  const [airline, setAirline] = useState(pkg?.airline || 'Saudi Arabian Airlines');
  const [facilitiesIncluded, setFacilitiesIncluded] = useState(
    pkg?.facilities_included?.join('\n') ||
      'Tiket pesawat PP\nHotel bintang 4/5\nVisa & manasik\nMakan 3x sehari\nBus AC'
  );
  const [facilitiesExcluded, setFacilitiesExcluded] = useState(
    pkg?.facilities_excluded?.join('\n') || 'Pengeluaran pribadi\nKelebihan bagasi\nVaksin'
  );
  const [description, setDescription] = useState(
    pkg?.description || 'Paket perjalanan ibadah dengan bimbingan muthawif berpengalaman.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await savePackage({
        id: pkg?.id,
        name,
        code,
        type,
        status,
        branch_name: branchName,
        price: Number(price) || 0,
        down_payment: Number(downPayment) || 5000000,
        quota: Number(quota) || 45,
        duration_days: Number(durationDays) || 9,
        departure_date: departureDate,
        departure_city: departureCity,
        hotel_makkah: hotelMakkah,
        hotel_madinah: hotelMadinah,
        airline,
        facilities_included: facilitiesIncluded
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        facilities_excluded: facilitiesExcluded
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        description,
      });

      if (res.success) {
        router.push(pkg?.id ? `${basePath}/${pkg.id}` : basePath);
        router.refresh();
      } else {
        alert(res.error || 'Gagal menyimpan paket');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
          <Link href={dashboardHome} className="hover:text-slate-600 transition-colors">
            Beranda
          </Link>
          <span>&gt;</span>
          <Link href={basePath} className="hover:text-slate-600 transition-colors">
            Paket
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600">{isCreate ? 'Tambah' : 'Edit'}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {isCreate ? 'Tambah Paket' : 'Edit Paket'}
        </h1>
        <p className="text-[12px] text-slate-500 mt-0.5">{pkg?.name || 'Formulir paket travel umroh & haji'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Informasi Paket */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-[14px] font-semibold text-slate-800">Informasi Paket</h2>

          {/* Row 1: Nama Paket */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
              Nama Paket <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Umroh Reguler 9 Hari"
              className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Row 2: Kode & Cabang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Kode</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PKG-UMR9"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Kosongkan untuk dibuat otomatis</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Cabang</label>
              <select
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Kantor Pusat Jakarta">Kantor Pusat Jakarta</option>
                <option value="cabang jember">cabang jember</option>
                <option value="paleran">paleran</option>
              </select>
            </div>
          </div>

          {/* Row 3: Jenis & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Jenis <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Umroh">Umroh</option>
                <option value="Haji">Haji</option>
                <option value="Haji Plus">Haji Plus</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Dibuka">Dibuka</option>
                <option value="Penuh">Penuh</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Row 4: Harga & Uang Muka */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Harga <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="28500000"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Uang Muka (DP)</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="5000000"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 5: Kuota & Durasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Kuota <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="45"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Durasi (hari) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="9"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Keberangkatan & Akomodasi */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-[14px] font-semibold text-slate-800">Keberangkatan &amp; Akomodasi</h2>

          {/* Row 1: Tanggal Berangkat & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Tanggal Berangkat</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Kota Keberangkatan</label>
              <input
                type="text"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                placeholder="Jakarta"
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 2: Hotel Mekah & Madinah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Hotel Mekah</label>
              <select
                value={hotelMakkah}
                onChange={(e) => setHotelMakkah(e.target.value)}
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Swissôtel Al Maqam Makkah">Swissôtel Al Maqam Makkah</option>
                <option value="Pullman Zamzam Makkah">Pullman Zamzam Makkah</option>
                <option value="Fairmont Makkah Clock Royal Tower">Fairmont Makkah Clock Royal Tower</option>
                <option value="Raffles Makkah Palace">Raffles Makkah Palace</option>
                <option value="Makkah Hotel & Towers">Makkah Hotel & Towers</option>
                <option value="hotel 2">hotel 2</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Hotel Madinah</label>
              <select
                value={hotelMadinah}
                onChange={(e) => setHotelMadinah(e.target.value)}
                className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Anwar Al Madinah Mövenpick">Anwar Al Madinah Mövenpick</option>
                <option value="Dar Al Taqwa Madinah">Dar Al Taqwa Madinah</option>
                <option value="The Oberoi Madinah">The Oberoi Madinah</option>
                <option value="Madinah Hilton">Madinah Hilton</option>
                <option value="Grand Plaza Badr Al Maqam">Grand Plaza Badr Al Maqam</option>
                <option value="hotel 2">hotel 2</option>
              </select>
            </div>
          </div>

          {/* Row 3: Maskapai */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Maskapai</label>
            <select
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="Saudi Arabian Airlines">Saudi Arabian Airlines</option>
              <option value="Garuda Indonesia">Garuda Indonesia</option>
              <option value="Turkish Airlines">Turkish Airlines</option>
              <option value="Lion Air Umrah Direct">Lion Air Umrah Direct</option>
              <option value="Saudia">Saudia</option>
            </select>
          </div>
        </div>

        {/* Card 3: Fasilitas & Deskripsi */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-[14px] font-semibold text-slate-800">Fasilitas &amp; Deskripsi</h2>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Fasilitas Termasuk
            </label>
            <p className="text-[10px] text-slate-400 mb-1.5">Satu fasilitas per baris</p>
            <textarea
              rows={4}
              value={facilitiesIncluded}
              onChange={(e) => setFacilitiesIncluded(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Fasilitas Tidak Termasuk
            </label>
            <p className="text-[10px] text-slate-400 mb-1.5">Satu fasilitas per baris</p>
            <textarea
              rows={3}
              value={facilitiesExcluded}
              onChange={(e) => setFacilitiesExcluded(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Deskripsi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-y"
            />
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            style={{ backgroundColor: 'var(--brand-primary, #00d4b2)' }}
            className="py-2.5 px-5 rounded-md text-white text-[13px] font-medium shadow-xs hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <Link
            href={pkg?.id ? `${basePath}/${pkg.id}` : basePath}
            className="py-2.5 px-5 rounded-md border border-slate-300 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
