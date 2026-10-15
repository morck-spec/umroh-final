-- ===========================================================================
-- MANASIK & ABSENSI SCHEMA
-- Jalankan file ini di Supabase Dashboard > SQL Editor (Opsional jika ingin membuat tabel terpisah)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.manasik_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text,
  title text NOT NULL,
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  package_name text,
  instructor text,
  date date NOT NULL,
  time_start time DEFAULT '08:00',
  time_end time DEFAULT '12:00',
  location text DEFAULT 'Aula Kantor Pusat Jakarta',
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.manasik_attendances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid REFERENCES public.manasik_schedules(id) ON DELETE CASCADE,
  schedule_legacy_id text,
  jamaah_id uuid REFERENCES public.jamaah(id) ON DELETE SET NULL,
  jamaah_name text NOT NULL,
  status text NOT NULL DEFAULT 'Tidak Hadir' CHECK (status IN ('Hadir', 'Izin', 'Tidak Hadir')),
  notes text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.manasik_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manasik_attendances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manasik schedules viewable by everyone" ON public.manasik_schedules;
DROP POLICY IF EXISTS "Manasik schedules modifiable by admins" ON public.manasik_schedules;
DROP POLICY IF EXISTS "Manasik attendances viewable by everyone" ON public.manasik_attendances;
DROP POLICY IF EXISTS "Manasik attendances modifiable by admins" ON public.manasik_attendances;

CREATE POLICY "Manasik schedules viewable by everyone" ON public.manasik_schedules FOR SELECT USING (true);
CREATE POLICY "Manasik schedules modifiable by admins" ON public.manasik_schedules FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));

CREATE POLICY "Manasik attendances viewable by everyone" ON public.manasik_attendances FOR SELECT USING (true);
CREATE POLICY "Manasik attendances modifiable by admins" ON public.manasik_attendances FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));
