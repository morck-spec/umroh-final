import Link from "next/link";
import { login } from "../actions";
import { Briefcase, ArrowLeft } from "lucide-react";
import { DemoAccounts } from "./DemoAccounts";

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex">
      {/* Left Column - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-800 opacity-90 z-10"></div>
        {/* Placeholder background, normally would be an image URL */}
        <div className="absolute inset-0 z-0 bg-slate-800 mix-blend-overlay"></div>
        <div className="relative z-20 flex flex-col justify-between p-12 h-full text-white">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Trecer<span className="text-emerald-400">Umroh</span></span>
            </Link>
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4 leading-tight">Selamat Datang di Portal Manajemen Umroh</h1>
            <p className="text-emerald-100 text-lg">Silakan masuk untuk mengelola pendaftaran, melihat jadwal keberangkatan, dan memproses pembayaran Anda.</p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="lg:hidden inline-flex items-center justify-center lg:justify-start gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                <Briefcase className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Trecer<span className="text-emerald-600">Umroh</span></span>
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Masuk ke Akun</h2>
            <p className="text-slate-500">Masukkan email dan password Anda</p>
          </div>

          <form action={login} className="space-y-6">
            {searchParams?.message && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                {searchParams.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email atau Username</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <div className="text-sm">
                  <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">Lupa password?</a>
                </div>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field mt-1"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">Ingat saya</label>
            </div>

            <div>
              <button type="submit" className="w-full btn-primary py-2.5 text-base">
                Masuk
              </button>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <DemoAccounts />
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
              Daftar sekarang
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center lg:justify-start">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
