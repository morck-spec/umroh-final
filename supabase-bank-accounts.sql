-- ===========================================================================
-- MASTER DATA: REKENING BANK (BANK ACCOUNTS)
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  branch_name text DEFAULT 'Kantor Pusat Jakarta',
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  branch_office text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bank accounts viewable by everyone" ON public.bank_accounts;
DROP POLICY IF EXISTS "Bank accounts modifiable by admins" ON public.bank_accounts;

CREATE POLICY "Bank accounts viewable by everyone" ON public.bank_accounts FOR SELECT USING (true);
CREATE POLICY "Bank accounts modifiable by admins" ON public.bank_accounts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Data awal (sesuai foto)
INSERT INTO public.bank_accounts (bank_name, account_number, account_holder, branch_name, is_active)
SELECT * FROM (VALUES
  ('Bank Muamalat', '8009876543', 'PT Travel Umroh Haji', 'Kantor Pusat Jakarta', true),
  ('Bank Syariah Indonesia', '7001234567', 'PT Travel Umroh Haji', 'Kantor Pusat Jakarta', true)
) AS v(bank_name, account_number, account_holder, branch_name, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.bank_accounts);
