-- ===========================================================================
-- MANIFEST & ROOMING SCHEMA
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.manifests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  package_legacy_id text,
  package_name text,
  jamaah_id uuid REFERENCES public.jamaah(id) ON DELETE SET NULL,
  jamaah_name text NOT NULL,
  registration_code text,
  room_number text,
  room_type text CHECK (room_type IN ('Quad', 'Triple', 'Double', 'Single')),
  bus_number text,
  seat_number text,
  mahram_group text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.manifests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manifests viewable by everyone" ON public.manifests;
DROP POLICY IF EXISTS "Manifests modifiable by admins" ON public.manifests;

CREATE POLICY "Manifests viewable by everyone" ON public.manifests FOR SELECT USING (true);
CREATE POLICY "Manifests modifiable by admins" ON public.manifests FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));
