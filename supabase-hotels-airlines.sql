-- ===========================================================================
-- MASTER DATA: HOTELS & AIRLINES
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.hotels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL CHECK (city IN ('Mekah', 'Madinah')),
  stars int NOT NULL DEFAULT 3 CHECK (stars BETWEEN 1 AND 5),
  distance_m int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.airlines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  transit text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hotels viewable by everyone" ON public.hotels;
DROP POLICY IF EXISTS "Hotels modifiable by admins" ON public.hotels;
DROP POLICY IF EXISTS "Airlines viewable by everyone" ON public.airlines;
DROP POLICY IF EXISTS "Airlines modifiable by admins" ON public.airlines;

CREATE POLICY "Hotels viewable by everyone" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Hotels modifiable by admins" ON public.hotels FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));

CREATE POLICY "Airlines viewable by everyone" ON public.airlines FOR SELECT USING (true);
CREATE POLICY "Airlines modifiable by admins" ON public.airlines FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));

-- Data awal (sesuai contoh)
INSERT INTO public.hotels (name, city, stars, distance_m)
SELECT * FROM (VALUES
  ('Al Eiman Royal Hotel', 'Madinah', 4, 300),
  ('Anwar Al Madinah Mövenpick', 'Madinah', 5, 80),
  ('Dallah Taibah Hotel', 'Madinah', 4, 150),
  ('Anjum Hotel Makkah', 'Mekah', 4, 400),
  ('Hilton Makkah Convention', 'Mekah', 5, 250),
  ('Swissôtel Al Maqam Makkah', 'Mekah', 5, 100)
) AS v(name, city, stars, distance_m)
WHERE NOT EXISTS (SELECT 1 FROM public.hotels);

INSERT INTO public.airlines (name, code, transit)
SELECT * FROM (VALUES
  ('Emirates', 'EK', 'Transit Dubai'),
  ('Garuda Indonesia', 'GA', 'Langsung'),
  ('Saudi Arabian Airlines', 'SV', 'Langsung')
) AS v(name, code, transit)
WHERE NOT EXISTS (SELECT 1 FROM public.airlines);
