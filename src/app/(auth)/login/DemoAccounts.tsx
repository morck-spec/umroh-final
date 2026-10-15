"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const DEMO_PASSWORD = "password123";

export function DemoAccounts() {
  const fillDemo = (email: string) => {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;

    if (emailInput && passwordInput) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(emailInput, email);
      emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      setter?.call(passwordInput, DEMO_PASSWORD);
      passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const accounts = [
    { email: "super_admin@demo.com", role: "Super Admin", icon: "👑" },
    { email: "admin_cabang@demo.com", role: "Admin Cabang", icon: "🏢" },
    { email: "mitra@demo.com", role: "Mitra Agen", icon: "💼" },
    { email: "jamaah@example.com", role: "Jamaah Umroh", icon: "🕋" },
    { email: "muthawif@demo.com", role: "Muthawif", icon: "🤲" },
  ];

  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
        Pilih akun demo (password: {DEMO_PASSWORD})
      </p>
      <div className="grid grid-cols-3 gap-2">
        {accounts.map((acc) => (
          <button
            type="button"
            key={acc.email}
            id={`demo-${acc.role.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => fillDemo(acc.email)}
            className="flex items-center gap-1.5 bg-white px-2.5 py-2 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-[#0F7A5A] hover:bg-emerald-50/50 transition-colors text-left"
          >
            <span className="text-xs">{acc.icon}</span>
            <span className="truncate">{acc.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
  };

  return (
    <button
      type="button"
      id="google-login"
      onClick={handle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
    >
      <svg className="w-4 h-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {loading ? "Mengalihkan..." : "Masuk dengan Google"}
    </button>
  );
}

export function PasswordInput() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1.5">
      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        id="password"
        name="password"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        required
        placeholder="••••••••"
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F7A5A] focus:ring-2 focus:ring-[#0F7A5A]/15"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
