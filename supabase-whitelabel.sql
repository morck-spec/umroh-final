-- ========================================================
-- Whitelabel Settings Table & Seed Data
-- ========================================================

CREATE TABLE IF NOT EXISTS public.whitelabel_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  app_name TEXT NOT NULL DEFAULT 'Travel Umroh & Haji',
  subtitle TEXT DEFAULT 'Sistem Manajemen Umroh & Haji',
  phone TEXT DEFAULT '+62 21 7654 3210',
  email TEXT DEFAULT 'info@example.com',
  address TEXT DEFAULT 'Jl. Melati Indah No. 17, Jakarta Selatan',
  footer_text TEXT DEFAULT '© 2026 Travel Umroh & Haji — Sistem Manajemen Umroh & Haji.',
  primary_color TEXT DEFAULT '#00d4b2',
  secondary_color TEXT DEFAULT '#126259',
  logo_url TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert or update default configuration
INSERT INTO public.whitelabel_settings (
  id,
  app_name,
  subtitle,
  phone,
  email,
  address,
  footer_text,
  primary_color,
  secondary_color,
  logo_url,
  favicon_url,
  updated_at
) VALUES (
  'default',
  'Travel Umroh & Haji',
  'Sistem Manajemen Umroh & Haji',
  '+62 21 7654 3210',
  'info@example.com',
  'Jl. Melati Indah No. 17, Jakarta Selatan',
  '© 2026 Travel Umroh & Haji — Sistem Manajemen Umroh & Haji.',
  '#00d4b2',
  '#126259',
  '',
  '',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  app_name = EXCLUDED.app_name,
  subtitle = EXCLUDED.subtitle,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  footer_text = EXCLUDED.footer_text,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  logo_url = EXCLUDED.logo_url,
  favicon_url = EXCLUDED.favicon_url,
  updated_at = NOW();

-- Row level security
ALTER TABLE public.whitelabel_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view whitelabel settings" ON public.whitelabel_settings;
CREATE POLICY "Public can view whitelabel settings"
  ON public.whitelabel_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can update whitelabel settings" ON public.whitelabel_settings;
CREATE POLICY "Authenticated can update whitelabel settings"
  ON public.whitelabel_settings
  FOR ALL
  USING (true);
