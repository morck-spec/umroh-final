import Link from "next/link";
import { login } from "../actions";
import { Check, Mail } from "lucide-react";
import { DemoAccounts, GoogleButton, PasswordInput } from "./DemoAccounts";

export const metadata = {
  title: "Masuk | Travel Umroh & Haji",
  description: "Masuk ke Sistem Manajemen Umroh & Haji.",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F7A5A] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* Mosque silhouette */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[45%] text-white/10"
          viewBox="0 0 800 360"
          preserveAspectRatio="xMidYMax meet"
          fill="currentColor"
        >
          <rect x="40" y="110" width="22" height="250" rx="4" />
          <path d="M51 60 L62 110 L40 110 Z" />
          <circle cx="51" cy="54" r="5" />
          <rect x="738" y="110" width="22" height="250" rx="4" />
          <path d="M749 60 L760 110 L738 110 Z" />
          <circle cx="749" cy="54" r="5" />
          <path d="M400 30 C 470 90, 600 120, 600 230 L 600 360 L 200 360 L 200 230 C 200 120, 330 90, 400 30 Z" />
          <rect x="397" y="8" width="6" height="24" />
          <path d="M150 360 L150 270 C150 230, 185 215, 200 200 L 200 360 Z" />
          <path d="M650 360 L650 270 C650 230, 615 215, 600 200 L 600 360 Z" />
          <path d="M110 360 L110 300 C 110 270, 135 258, 150 250 L150 360 Z" />
          <path d="M690 360 L690 300 C 690 270, 665 258, 650 250 L650 360 Z" />
        </svg>

        <div className="relative z-10 flex flex-col justify-between p-8 h-full w-full text-white">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/25 text-sm font-bold">
              TU
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">Travel Umroh &amp; Haji</span>
              <span className="text-[11px] text-white/75">Sistem Manajemen Umroh &amp; Haji</span>
            </div>
          </Link>

          <div className="max-w-lg -mt-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Sistem Terintegrasi Multi-Cabang
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-5">
              Kelola perjalanan ibadah dengan lebih tenang.
            </h1>
            <p className="text-sm text-white/80 leading-relaxed mb-6">
              Pendaftaran jamaah, dokumen, pembayaran, manasik, manifest keberangkatan, hingga komisi agen — semuanya
              rapi dalam satu platform.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                "Data jamaah & dokumen terpusat dan aman",
                "Pembayaran, cicilan, dan kuitansi otomatis",
                "Manasik, manifest, serta komisi agen real-time",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[11px] text-white/70">© 2026 Travel Umroh &amp; Haji — Sistem Manajemen Umroh &amp; Haji</div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-between px-6 py-8 sm:px-12">
        <div className="w-full max-w-[460px] flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#172B35] tracking-tight">Selamat datang kembali</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Masuk menggunakan akun Anda untuk melanjutkan.</p>

          <GoogleButton />
          <p className="text-[11px] text-slate-500 text-center mt-2">
            Akun Google otomatis terdaftar dengan peran <span className="text-[#0F7A5A] font-medium">Jamaah</span>.
          </p>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Atau masuk dengan akun demo / email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form action={login} className="space-y-4">
            <DemoAccounts />

            {searchParams?.message && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
                {searchParams.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-800">Email</label>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nama@travel.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F7A5A] focus:ring-2 focus:ring-[#0F7A5A]/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-800">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#0F7A5A] hover:underline">
                  Lupa password?
                </Link>
              </div>
              <PasswordInput />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" name="remember" className="w-3.5 h-3.5 rounded border-slate-300 accent-[#0F7A5A]" />
              Ingat saya di perangkat ini
            </label>

            <button
              type="submit"
              id="login-submit"
              className="w-full py-3 rounded-xl bg-[#0F7A5A] hover:bg-[#0C6A4E] text-white text-sm font-semibold transition-colors"
            >
              Masuk
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-500 leading-relaxed">
            Belum punya akun? Akun jamaah, agen, dan muthawif dibuat oleh staf kantor.{" "}
            <span className="text-[#0F7A5A]">Silakan hubungi admin cabang Anda untuk mendapatkan akses.</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 mt-8">© 2026 Travel Umroh &amp; Haji</div>
      </div>
    </div>
  );
}
