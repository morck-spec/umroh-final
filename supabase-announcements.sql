-- ===========================================================================
-- PENGUMUMAN (ANNOUNCEMENTS) SCHEMA & SEED DATA
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text,
  title text NOT NULL,
  content text NOT NULL,
  audience text CHECK (audience IN ('Semua', 'Jamaah', 'Agen', 'Staff')) DEFAULT 'Semua' NOT NULL,
  branch text DEFAULT 'Kantor Pusat Jakarta',
  package_name text DEFAULT 'Semua Paket',
  starts_at text,
  expires_at text,
  is_published boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Announcements viewable by everyone" ON public.announcements;
DROP POLICY IF EXISTS "Announcements modifiable by admins" ON public.announcements;

CREATE POLICY "Announcements viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Announcements modifiable by admins" ON public.announcements FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));

-- Seed data awal persis sesuai screenshot
INSERT INTO public.announcements (legacy_id, title, content, audience, branch, package_name, starts_at, expires_at, is_published) VALUES
('1', 'Pelunasan Umroh Reguler', 'Mohon segera melunasi biaya paket Umroh Reguler sebelum H-30 keberangkatan.', 'Jamaah', 'Kantor Pusat Jakarta', 'Semua Paket', '2026-10-13T06:08', NULL, true),
('2', 'Target Komisi Bulanan', 'Pemberitahuan mengenai pencapaian target komisi bulanan untuk seluruh mitra agen.', 'Agen', 'Kantor Pusat Jakarta', 'Semua Paket', '2026-10-11T06:08', NULL, true);
