import Link from "next/link";
import { CheckCircle2, ChevronRight, MapPin, Phone, Mail, Clock, Calendar, Shield, CreditCard, Users, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Trecer<span className="text-emerald-600">Umroh</span></span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#beranda" className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Beranda</a>
              <a href="#paket" className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Paket Umroh</a>
              <a href="#tata-cara" className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Tata Cara</a>
              <a href="#informasi" className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Informasi</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-slate-600 hover:text-emerald-600 px-3 py-2 font-medium text-sm transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="btn-primary">
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="relative bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6 border border-emerald-100">
                <Shield className="w-4 h-4" />
                <span>Biro Perjalanan Umroh Resmi & Terpercaya</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Langkah Mudah Menuju <span className="text-emerald-600">Baitullah</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                Sistem Informasi Manajemen Umroh yang memberikan kemudahan dalam pendaftaran, pemilihan paket, hingga proses administrasi dan pembayaran yang transparan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn-primary text-base px-8 py-3">
                  Pilih Paket Umroh
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="#tata-cara" className="btn-secondary text-base px-8 py-3">
                  Pelajari Alur
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Professional structural image placeholder */}
              <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-emerald-900/5 mix-blend-multiply"></div>
                <Users className="w-32 h-32 text-slate-300" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Sistem Terintegrasi</p>
                      <p className="text-xs text-slate-500">Pendaftaran hingga Kepulangan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paket Umroh Section */}
      <section id="paket" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Pilihan Paket Umroh</h2>
            <p className="text-slate-600 text-lg">Berbagai pilihan paket perjalanan ibadah yang disesuaikan dengan kebutuhan dan kenyamanan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Paket 1 */}
            <div className="card hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100 bg-white">
                <h3 className="text-xl font-bold text-slate-900">Paket Reguler</h3>
                <p className="text-sm text-slate-500 mt-1">Standar pelayanan profesional</p>
                <div className="mt-4 flex items-baseline text-3xl font-bold text-emerald-600">
                  Rp 25.000.000
                </div>
              </div>
              <div className="p-6 bg-slate-50/50">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Durasi 9 Hari</span>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Keberangkatan: Nov 2026</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Hotel Bintang 3 (Makkah & Madinah)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Pesawat Ekonomi</span>
                  </li>
                </ul>
                <Link href="/register?paket=reguler" className="btn-secondary w-full">Detail Paket</Link>
              </div>
            </div>

            {/* Paket 2 */}
            <div className="card shadow-md border-emerald-200 relative">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                TERPOPULER
              </div>
              <div className="p-6 border-b border-slate-100 bg-white">
                <h3 className="text-xl font-bold text-slate-900">Paket VIP</h3>
                <p className="text-sm text-slate-500 mt-1">Kenyamanan maksimal untuk ibadah</p>
                <div className="mt-4 flex items-baseline text-3xl font-bold text-emerald-600">
                  Rp 35.000.000
                </div>
              </div>
              <div className="p-6 bg-slate-50/50">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Durasi 12 Hari</span>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Keberangkatan: Des 2026</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Hotel Bintang 5 (Jarak dekat)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Kereta Cepat Haramain</span>
                  </li>
                </ul>
                <Link href="/register?paket=vip" className="btn-primary w-full">Detail Paket</Link>
              </div>
            </div>

            {/* Paket 3 */}
            <div className="card hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100 bg-white">
                <h3 className="text-xl font-bold text-slate-900">Paket Ramadhan</h3>
                <p className="text-sm text-slate-500 mt-1">Raih keberkahan bulan suci</p>
                <div className="mt-4 flex items-baseline text-3xl font-bold text-emerald-600">
                  Rp 40.000.000
                </div>
              </div>
              <div className="p-6 bg-slate-50/50">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Durasi 15 Hari</span>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Keberangkatan: Mar 2027</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Hotel Bintang 4</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Program Iktikaf</span>
                  </li>
                </ul>
                <Link href="/register?paket=ramadhan" className="btn-secondary w-full">Detail Paket</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tata Cara Section */}
      <section id="tata-cara" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tata Cara Pendaftaran</h2>
            <p className="text-slate-600 text-lg">Proses administrasi yang sistematis dan terstruktur.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Buat Akun", desc: "Daftar di portal pendaftaran dengan data diri yang valid sesuai KTP." },
              { num: "2", title: "Pilih Paket", desc: "Pilih paket keberangkatan yang sesuai dengan rencana perjalanan Anda." },
              { num: "3", title: "Daftar Umroh", desc: "Lengkapi formulir administrasi dan persetujuan syarat ketentuan." },
              { num: "4", title: "Lakukan Pembayaran", desc: "Selesaikan tagihan melalui transfer bank atau metode pembayaran lain." },
              { num: "5", title: "Verifikasi Dokumen", desc: "Unggah paspor dan dokumen pendukung, lalu tunggu verifikasi admin." },
              { num: "6", title: "Berangkat Umroh", desc: "Ikuti manasik dan persiapkan diri untuk jadwal keberangkatan Anda." }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 p-6 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 flex-shrink-0 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan / Informasi Sederhana */}
      <section id="informasi" className="py-16 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <Shield className="w-10 h-10 text-emerald-400 mb-4 mx-auto md:mx-0" />
              <h3 className="text-xl font-semibold mb-2">Legalitas Resmi</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">Berizin resmi dari Kementerian Agama RI sebagai penyelenggara perjalanan ibadah umroh PPIU.</p>
            </div>
            <div>
              <CreditCard className="w-10 h-10 text-emerald-400 mb-4 mx-auto md:mx-0" />
              <h3 className="text-xl font-semibold mb-2">Pembayaran Terintegrasi</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">Sistem pembayaran yang transparan, mudah, dan tercatat otomatis dalam sistem dashboard jamaah.</p>
            </div>
            <div>
              <Users className="w-10 h-10 text-emerald-400 mb-4 mx-auto md:mx-0" />
              <h3 className="text-xl font-semibold mb-2">Pelayanan Profesional</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">Dibimbing oleh muthawwif berpengalaman dengan standar pelayanan administrasi yang cepat dan tanggap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="text-emerald-500 w-6 h-6" />
              <span className="text-xl font-bold text-white tracking-tight">Trecer<span className="text-emerald-500">Umroh</span></span>
            </div>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              Sistem Informasi Manajemen Terpadu untuk Biro Perjalanan Umroh. Mengutamakan kemudahan, keamanan, dan kepastian ibadah Anda.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#beranda" className="hover:text-emerald-400 transition-colors">Beranda</a></li>
              <li><a href="#paket" className="hover:text-emerald-400 transition-colors">Paket Umroh</a></li>
              <li><a href="#tata-cara" className="hover:text-emerald-400 transition-colors">Tata Cara</a></li>
              <li><a href="/login" className="hover:text-emerald-400 transition-colors">Login Sistem</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak Kami</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Gedung Perkantoran Trecer, Jl. Sudirman No. 123, Jakarta Pusat 10220</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>(021) 1234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>info@trecerumroh.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center md:text-left text-slate-500">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2026 Trecer Umroh. Hak Cipta Dilindungi.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
