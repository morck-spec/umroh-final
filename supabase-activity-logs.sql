-- ========================================================
-- Activity Logs Schema & Seed Data (Optional)
-- ========================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  time_formatted TEXT,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1'
);

-- Seed initial 10 records matching reference photo
INSERT INTO public.activity_logs (id, created_at, time_formatted, user_name, action, description, ip_address)
VALUES
  ('log-1', '2026-10-14 16:41:00+00', '14 Oct 2026 16:41', 'Super Admin', 'updated', 'Memperbarui pengaturan white-label', '127.0.0.1'),
  ('log-2', '2026-10-14 16:27:00+00', '14 Oct 2026 16:27', 'Admin Cabang', 'updated', 'Mereset kata sandi pengguna Lukman Hakim', '127.0.0.1'),
  ('log-3', '2026-10-14 16:25:00+00', '14 Oct 2026 16:25', 'Admin Cabang', 'updated', 'Mereset kata sandi pengguna Siti Aminah', '127.0.0.1'),
  ('log-4', '2026-10-14 16:25:00+00', '14 Oct 2026 16:25', 'Admin Cabang', 'updated', 'Mereset kata sandi pengguna Fitri Handayani', '127.0.0.1'),
  ('log-5', '2026-10-06 08:22:00+00', '06 Oct 2026 08:22', 'Super Admin', 'updated', 'Memperbarui pengguna Indra Kusuma', '127.0.0.1'),
  ('log-6', '2026-10-06 08:21:00+00', '06 Oct 2026 08:21', 'Ahmad Fauzi', 'printed', 'Cetak kwitansi REG-00001-DP', '127.0.0.1'),
  ('log-7', '2026-10-06 04:42:00+00', '06 Oct 2026 04:42', 'Admin Cabang', 'updated', 'Mencatat pembayaran REG-00008-C3', '127.0.0.1'),
  ('log-8', '2026-10-06 04:42:00+00', '06 Oct 2026 04:42', 'Admin Cabang', 'generated', 'Membuat tagihan massal paket Haji Khusus 2026 (0 jamaah)', '127.0.0.1'),
  ('log-9', '2026-10-06 04:20:00+00', '06 Oct 2026 04:20', 'Super Admin', 'updated', 'Memperbarui pengguna Admin Cabang', '127.0.0.1'),
  ('log-10', '2026-10-05 13:54:00+00', '05 Oct 2026 13:54', 'Super Admin', 'updated', 'Memperbarui pengguna Ahmad Fauzi', '127.0.0.1')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all" ON public.activity_logs;
CREATE POLICY "Allow select for all" ON public.activity_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for all" ON public.activity_logs;
CREATE POLICY "Allow insert for all" ON public.activity_logs FOR INSERT WITH CHECK (true);
