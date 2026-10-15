-- ===========================================================================
-- PERLENGKAPAN (EQUIPMENT) SCHEMA & SEED DATA
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.equipment (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text,
  jamaah_id uuid REFERENCES public.jamaah(id) ON DELETE SET NULL,
  jamaah_name text NOT NULL,
  package_name text,
  item text NOT NULL,
  size text,
  qty integer DEFAULT 1 NOT NULL,
  status text CHECK (status IN ('Belum Disiapkan', 'Disiapkan', 'Sudah Diserahkan')) DEFAULT 'Belum Disiapkan' NOT NULL,
  handed_over_date text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipment viewable by everyone" ON public.equipment;
DROP POLICY IF EXISTS "Equipment modifiable by admins" ON public.equipment;

CREATE POLICY "Equipment viewable by everyone" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Equipment modifiable by admins" ON public.equipment FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));

-- Seed data awal sesuai foto
INSERT INTO public.equipment (legacy_id, jamaah_name, package_name, item, size, qty, status, handed_over_date, notes) VALUES
('16', 'Fitri Handayani', 'Umroh Reguler 9 Hari', 'Koper', '28 inch', 1, 'Sudah Diserahkan', '2026-10-14', ''),
('15', 'Fitri Handayani', 'Umroh Reguler 9 Hari', 'Seragam', 'M', 1, 'Disiapkan', NULL, ''),
('14', 'Fitri Handayani', 'Umroh Reguler 9 Hari', 'Kain Ihram', '-', 1, 'Belum Disiapkan', NULL, ''),
('13', 'Gunawan Wibowo', 'Umroh Plus Turki 12 Hari', 'Koper', '24 inch', 1, 'Sudah Diserahkan', '2026-10-14', ''),
('12', 'Gunawan Wibowo', 'Umroh Plus Turki 12 Hari', 'Seragam', 'L', 1, 'Sudah Diserahkan', '2026-10-13', ''),
('11', 'Gunawan Wibowo', 'Umroh Plus Turki 12 Hari', 'Kain Ihram', '-', 1, 'Belum Disiapkan', NULL, ''),
('10', 'Hesti Purnama', 'Haji Khusus 2026', 'Koper', '28 inch', 1, 'Sudah Diserahkan', '2026-10-14', ''),
('9', 'Hesti Purnama', 'Haji Khusus 2026', 'Seragam', 'XL', 1, 'Disiapkan', NULL, ''),
('8', 'Hesti Purnama', 'Haji Khusus 2026', 'Kain Ihram', '-', 1, 'Belum Disiapkan', NULL, ''),
('7', 'Indra Kusuma', 'Haji Plus Eksklusif', 'Koper', '24 inch', 1, 'Sudah Diserahkan', '2026-10-14', ''),
('6', 'Indra Kusuma', 'Haji Plus Eksklusif', 'Seragam', 'S', 1, 'Disiapkan', NULL, ''),
('5', 'Indra Kusuma', 'Haji Plus Eksklusif', 'Kain Ihram', '-', 1, 'Belum Disiapkan', NULL, ''),
('4', 'Kartika Sari', 'Umroh Akhir Tahun', 'Koper', '24 inch', 1, 'Sudah Diserahkan', '2026-10-14', ''),
('3', 'Kartika Sari', 'Umroh Akhir Tahun', 'Seragam', 'L', 1, 'Disiapkan', NULL, ''),
('2', 'Kartika Sari', 'Umroh Akhir Tahun', 'Kain Ihram', '-', 1, 'Belum Disiapkan', NULL, '');
