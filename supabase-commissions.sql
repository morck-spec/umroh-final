-- ===========================================================================
-- KOMISI AGEN (COMMISSIONS) SCHEMA & SEED DATA
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text,
  agent_name text NOT NULL,
  jamaah_name text NOT NULL,
  package_name text NOT NULL,
  base_amount numeric(15,2) DEFAULT 0 NOT NULL,
  rate numeric(5,2) DEFAULT 0 NOT NULL,
  commission_amount numeric(15,2) DEFAULT 0 NOT NULL,
  status text CHECK (status IN ('Menunggu', 'Disetujui', 'Dibayar', 'Dibatalkan')) DEFAULT 'Menunggu' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Commissions viewable by everyone" ON public.commissions;
DROP POLICY IF EXISTS "Commissions modifiable by admins" ON public.commissions;

CREATE POLICY "Commissions viewable by everyone" ON public.commissions FOR SELECT USING (true);
CREATE POLICY "Commissions modifiable by admins" ON public.commissions FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'));

-- Seed data awal persis sesuai screenshot
INSERT INTO public.commissions (legacy_id, agent_name, jamaah_name, package_name, base_amount, rate, commission_amount, status) VALUES
('1', 'Rahmat Hidayat', 'Lukman Hakim', 'Umroh Plus Turki 12 Hari', 36500000, 6.00, 2190000, 'Menunggu'),
('2', 'Siti Aminah', 'Kartika Sari', 'Umroh Reguler 9 Hari', 28500000, 5.00, 1425000, 'Dibayar'),
('3', 'Siti Aminah', 'Hesti Purnama', 'Haji Khusus 2026', 125000000, 5.00, 6250000, 'Dibayar'),
('4', 'Hasan Basri', 'Gunawan Wibowo', 'Umroh Plus Turki 12 Hari', 36500000, 7.50, 2737500, 'Disetujui'),
('5', 'Rahmat Hidayat', 'Fitri Handayani', 'Umroh Reguler 9 Hari', 28500000, 6.00, 1710000, 'Menunggu'),
('6', 'Hasan Basri', 'Dewi Anggraini', 'Haji Plus Eksklusif', 165000000, 7.50, 12375000, 'Disetujui'),
('7', 'Rahmat Hidayat', 'Citra Lestari', 'Haji Khusus 2026', 125000000, 6.00, 7500000, 'Menunggu'),
('8', 'Siti Aminah', 'Budi Santoso', 'Umroh Plus Turki 12 Hari', 36500000, 5.00, 1825000, 'Dibayar');
