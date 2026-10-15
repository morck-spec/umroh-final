import Link from "next/link";
import { CheckCircle2, MapPin, Phone, Mail, Clock, Calendar, Shield, CreditCard, Users, ArrowRight, Building2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

interface PackageItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_days?: number;
  departure_date?: string;
  quota?: number;
}

interface BranchItem {
  name: string;
  address?: string;
  contact_number?: string;
}

export default async function Home() {
  const supabase = await createClient();

  // Fetch active packages from Supabase database
  let packages: PackageItem[] = [];
  try {
    const { data } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      packages = data as PackageItem[];
    }
  } catch {
    packages = [];
  }

  // Fetch branches for footer
  let branches: BranchItem[] = [];
  try {
    const { data } = await supabase.from('branches').select('name, address, contact_number');
    if (data) branches = data as BranchItem[];
  } catch {
    branches = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF9] text-[#172B35]">
      {/* 1. Announcement Bar */}
      <div className="bg-[#065F46] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <span>📢 Pendaftaran Umroh Musim 1448H Telah Dibuka. Hubungi kantor cabang terdekat kami!</span>
      </div>

      {/* 2. Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo & Legal Subtitle */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-[#065F46] rounded-xl flex items-center justify-center shadow-xs group-hover:bg-[#159B70] transition-colors">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#172B35] leading-tight">
                  Al-Madinah Tour & Travel
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#159B70]">
                  PENYELENGGARA RESMI IZIN KEMENAG RI
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#paket" className="text-slate-600 hover:text-[#159B70] font-medium text-sm transition-colors">Paket Perjalanan</a>
              <a href="#keunggulan" className="text-slate-600 hover:text-[#159B70] font-medium text-sm transition-colors">Keunggulan</a>
              <a href="#kontak" className="text-slate-600 hover:text-[#159B70] font-medium text-sm transition-colors">Kontak Kami</a>
            </nav>

            {/* Portal Button */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="bg-[#065F46] hover:bg-[#044E39] text-white px-5 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 shadow-xs transition-all"
              >
                <span>Masuk ke Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Centered matching Reference Image 1) */}
      <section className="relative bg-[#F7FAF9] bg-dot-pattern py-20 lg:py-28 border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D1FAE5]/60 text-[#065F46] border border-[#159B70]/30 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#159B70]" />
            <span>Amanah, Resmi, & Berizin Kemenag</span>
          </div>

          {/* Dual-color Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#172B35] leading-[1.15] tracking-tight">
            Menuju Baitullah dengan<br />
            <span className="text-[#159B70]">Penuh Kekhusyukan & Keberkahan</span>
          </h1>

          {/* Subtitle Description */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Pelayanan perjalanan ibadah Umroh dan Haji Khusus bertaraf bintang 5 dengan bimbingan muthawif berkompeten, hotel dekat Masjidil Haram, dan kepastian jadwal keberangkatan.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="#paket"
              className="w-full sm:w-auto bg-[#159B70] hover:bg-[#0F7657] text-white px-8 py-3.5 rounded-lg font-semibold text-base shadow-sm inline-flex items-center justify-center transition-all"
            >
              Lihat Paket Tersedia
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white border border-[#159B70]/40 hover:bg-emerald-50/60 text-[#065F46] px-8 py-3.5 rounded-lg font-semibold text-base shadow-xs inline-flex items-center justify-center transition-all"
            >
              Portal Staf & Jamaah
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Section Divider & Katalog Paket Umroh & Haji */}
      <section id="paket" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block bg-[#D1FAE5]/60 text-[#065F46] border border-[#159B70]/30 text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full mb-3 shadow-xs">
              KATALOG PERJALANAN TERBUKA
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B35]">
              Pilihan Paket Umroh & Haji Khusus
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Berbagai pilihan paket perjalanan ibadah yang disesuaikan dengan kenyamanan ibadah Anda dan keluarga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <div key={pkg.id} className="card-hover flex flex-col justify-between">
                  <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-[#172B35]">{pkg.name}</h3>
                      <span className="bg-emerald-50 text-[#159B70] text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        Sisa Kuota: {pkg.quota || 0}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{pkg.description || 'Fasilitas premium hotel dekat pelataran Haram.'}</p>
                    <div className="mt-4 flex items-baseline text-2xl sm:text-3xl font-extrabold text-[#159B70]">
                      Rp {Number(pkg.price).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="p-6 bg-[#F7FAF9]/60 flex-1 flex flex-col justify-between">
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center text-sm text-slate-700">
                        <Clock className="w-4 h-4 text-[#159B70] mr-2.5 flex-shrink-0" />
                        <span>Durasi: {pkg.duration_days || 9} Hari</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-700">
                        <Calendar className="w-4 h-4 text-[#159B70] mr-2.5 flex-shrink-0" />
                        <span>Keberangkatan: {pkg.departure_date ? new Date(pkg.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Segera Diumumkan'}</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-700">
                        <Building2 className="w-4 h-4 text-[#159B70] mr-2.5 flex-shrink-0" />
                        <span>Hotel Bintang 5 Dekat Masjid</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-700">
                        <Shield className="w-4 h-4 text-[#159B70] mr-2.5 flex-shrink-0" />
                        <span>Bimbingan Muthawif Penuh</span>
                      </li>
                    </ul>
                    <Link
                      href={`/register?paket=${pkg.id}`}
                      className="btn-emerald w-full justify-center text-center font-semibold"
                    >
                      Daftar Paket Ini
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Fallback cards if DB packages are empty
              [
                { title: "Umroh Reguler Syawal 1447H", price: "Rp 29.500.000", days: "9 Hari", desc: "Penerbangan Saudia Airlines direct Jakarta - Jeddah." },
                { title: "Umroh Ramadhan Berkah 1448H", price: "Rp 38.500.000", days: "12 Hari", desc: "Iktikaf 10 hari terakhir di Masjidil Haram & Nabawi." },
                { title: "Haji Khusus Furoda VIP", price: "Rp 245.000.000", days: "25 Hari", desc: "Tanpa antre visa resmi haji langsung bertaraf maktab VIP." }
              ].map((item, idx) => (
                <div key={idx} className="card-hover flex flex-col justify-between">
                  <div className="p-6 border-b border-slate-100 bg-white">
                    <h3 className="text-xl font-bold text-[#172B35]">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    <div className="mt-4 flex items-baseline text-2xl sm:text-3xl font-extrabold text-[#159B70]">
                      {item.price}
                    </div>
                  </div>
                  <div className="p-6 bg-[#F7FAF9]/60 flex-1 flex flex-col justify-between">
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center text-sm text-slate-700">
                        <Clock className="w-4 h-4 text-[#159B70] mr-2.5 flex-shrink-0" />
                        <span>Durasi: {item.days}</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-700">
                        <Building2 className="w-4 h-4 text-[#159B70] mr-2.5 flex-shrink-0" />
                        <span>Hotel Bintang 5 Dekat Masjid</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-700">
                        <Shield className="w-4 h-4 text-[#159B70] mr-2.5 flex-shrink-0" />
                        <span>Bimbingan Muthawif Penuh</span>
                      </li>
                    </ul>
                    <Link
                      href="/register"
                      className="btn-emerald w-full justify-center text-center font-semibold"
                    >
                      Pilih Paket
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Keunggulan Layanan Al-Madinah */}
      <section id="keunggulan" className="py-20 bg-[#F7FAF9] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B35]">
              Keunggulan Al-Madinah Tour & Travel
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Menghadirkan rasa aman, tenang, dan kekhusyukan penuh dalam setiap derap langkah ibadah Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-6 bg-white hover:border-[#159B70]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#159B70] flex items-center justify-center mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B35] mb-2">Legalitas Resmi Kemenag</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Terdaftar resmi dengan izin PPIU Kementerian Agama RI, menjamin kepastian visa dan kuota.
              </p>
            </div>

            <div className="card p-6 bg-white hover:border-[#159B70]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#159B70] flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B35] mb-2">Muthawif Berkompeten</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dibimbing oleh ustadz dan muthawif berpengalaman lulusan universitas Islam terkemuka Timur Tengah.
              </p>
            </div>

            <div className="card p-6 bg-white hover:border-[#159B70]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#159B70] flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B35] mb-2">Hotel Dekat Haram</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Akomodasi hotel bintang 5 dengan jarak dekat ke pelataran Masjidil Haram dan Masjid Nabawi.
              </p>
            </div>

            <div className="card p-6 bg-white hover:border-[#159B70]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#159B70] flex items-center justify-center mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B35] mb-2">Portal Digital Transparan</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pantau progres dokumen, jadwal manasik, dan verifikasi kuitansi pembayaran secara real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer & Cabang Terdaftar */}
      <footer id="kontak" className="bg-[#172B35] text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#159B70] rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight block">Al-Madinah Tour & Travel</span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Penyelenggara Perjalanan Ibadah Umroh Resmi</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
              Melayani tamu Allah dengan amanah, profesionalitas, dan dedikasi penuh sejak hari pertama pendaftaran hingga kepulangan ke tanah air.
            </p>
            {branches.length > 0 && (
              <div className="space-y-1 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Kantor Cabang Terdaftar:</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {branches.map((b, i) => (
                    <span key={i} className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 capitalize">
                      {b.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">Akses Cepat</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#paket" className="hover:text-emerald-400 transition-colors">Paket Umroh</a></li>
              <li><a href="#keunggulan" className="hover:text-emerald-400 transition-colors">Keunggulan Layanan</a></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Portal Staf & Jamaah</Link></li>
              <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Pendaftaran Mandiri</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">Layanan Informasi</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#159B70] flex-shrink-0 mt-0.5" />
                <span>Gedung Al-Madinah Tower, Jl. M.H. Thamrin No. 88, Jakarta Pusat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#159B70] flex-shrink-0" />
                <span>Hotline: (021) 7890-1234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#159B70] flex-shrink-0" />
                <span>info@almadinah-travel.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Al-Madinah Tour & Travel. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-4">
            <span className="text-emerald-500 font-medium">Izin Kemenag RI No. 892/PPIU</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
