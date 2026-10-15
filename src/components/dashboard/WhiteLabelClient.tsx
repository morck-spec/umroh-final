'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { WhiteLabelSettings, saveWhiteLabelSettings } from '@/app/dashboard/shared/actions/whitelabel';

function getBrandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => /^[a-zA-Z0-9]/.test(w));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || 'TU').toUpperCase();
}

interface WhiteLabelClientProps {
  initialSettings: WhiteLabelSettings;
}

export default function WhiteLabelClient({ initialSettings }: WhiteLabelClientProps) {
  const [appName, setAppName] = useState(initialSettings.app_name || 'Travel Umroh & Haji');
  const [subtitle, setSubtitle] = useState(initialSettings.subtitle || 'Sistem Manajemen Umroh & Haji');
  const [phone, setPhone] = useState(initialSettings.phone || '+62 21 7654 3210');
  const [email, setEmail] = useState(initialSettings.email || 'info@example.com');
  const [address, setAddress] = useState(initialSettings.address || 'Jl. Melati Indah No. 17, Jakarta Selatan');
  const [footerText, setFooterText] = useState(initialSettings.footer_text || '© 2026 Travel Umroh & Haji — Sistem Manajemen Umroh & Haji.');
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color || '#00d4b2');
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondary_color || '#126259');
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url || '');
  const [faviconUrl, setFaviconUrl] = useState(initialSettings.favicon_url || '');

  const [savedBanner, setSavedBanner] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Apply colors live to CSS variables as user modifies them
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--brand-primary', primaryColor);
      document.documentElement.style.setProperty('--brand-secondary', secondaryColor);
      document.documentElement.style.setProperty('--brand-primary-light', primaryColor + '20');
    }
  }, [primaryColor, secondaryColor]);

  const previewInitials = getBrandInitials(appName);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFaviconUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    startTransition(async () => {
      try {
        const res = await saveWhiteLabelSettings({
          app_name: appName,
          subtitle,
          phone,
          email,
          address,
          footer_text: footerText,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
        });

        if (res.success) {
          setSavedBanner(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Broadcast to any listening client components (Sidebar, Topbar)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('brand-updated', {
                detail: res.data,
              })
            );
          }
        }
      } catch (err) {
        console.error('Failed to save whitelabel settings:', err);
      }
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Success banner matching screenshot */}
      {savedBanner && (
        <div className="rounded-md bg-[#EDFBF4] border border-[#B3EBC8] px-4 py-2.5 text-[13px] text-[#1E7E4E] flex items-center justify-between transition-all">
          <span>Pengaturan white-label berhasil disimpan.</span>
          <button
            onClick={() => setSavedBanner(false)}
            className="text-[#1E7E4E] hover:opacity-75 text-xs font-semibold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
            Beranda
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600">White-label</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pengaturan White-label</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Branding tampil di seluruh aplikasi (cache otomatis diperbarui).
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Identitas */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-[14px] font-semibold text-slate-800 mb-5">Identitas</h2>
              <div className="space-y-4">
                {/* Row 1: Nama Aplikasi & Subjudul */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Nama Aplikasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Travel Umroh & Haji"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Subjudul
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Sistem Manajemen Umroh & Haji"
                    />
                  </div>
                </div>

                {/* Row 2: Telepon & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Telepon
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="+62 21 7654 3210"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="info@example.com"
                    />
                  </div>
                </div>

                {/* Row 3: Alamat */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                    Alamat
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors resize-y"
                    placeholder="Jl. Melati Indah No. 17, Jakarta Selatan"
                  />
                </div>

                {/* Row 4: Teks Footer */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                    Teks Footer
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full h-[36px] rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="© 2026 Travel Umroh & Haji — Sistem Manajemen Umroh & Haji."
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Warna & Logo */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-[14px] font-semibold text-slate-800 mb-5">Warna & Logo</h2>
              <div className="space-y-5">
                {/* Row 1: Warna Utama & Warna Sekunder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-medium text-slate-700">
                        Warna Utama (hex) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">{primaryColor.toUpperCase()}</span>
                    </div>
                    {/* Full-width color swatch bar matching screenshot */}
                    <div className="relative">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-[32px] rounded border border-slate-300 cursor-pointer p-0.5 bg-white block"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-medium text-slate-700">
                        Warna Sekunder (hex) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">{secondaryColor.toUpperCase()}</span>
                    </div>
                    {/* Full-width color swatch bar matching screenshot */}
                    <div className="relative">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full h-[32px] rounded border border-slate-300 cursor-pointer p-0.5 bg-white block"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Logo & Favicon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Logo (PNG/JPG, maks 2MB)
                    </label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleLogoChange}
                      className="block w-full text-[12px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-[11px] file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika tidak ingin mengubah.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Favicon
                    </label>
                    <input
                      type="file"
                      accept="image/x-icon, image/png, image/jpeg"
                      onChange={handleFaviconChange}
                      className="block w-full text-[12px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-[11px] file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika tidak ingin mengubah.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Pratinjau */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs sticky top-20">
              <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Pratinjau</h2>

              {/* Box Preview */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-xs transition-colors overflow-hidden"
                  style={{ backgroundColor: primaryColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    previewInitials
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[13px] text-slate-800 truncate">
                    {appName || 'Travel Umroh & Haji'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {subtitle || 'Sistem Manajemen Umroh & Haji'}
                  </div>
                </div>
              </div>

              {/* Simpan Pengaturan Button */}
              <button
                type="submit"
                disabled={isPending}
                style={{ backgroundColor: primaryColor }}
                className="w-full mt-4 py-2.5 px-4 text-white text-[13px] font-medium rounded-lg shadow-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
