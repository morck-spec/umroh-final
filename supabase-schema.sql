---------------------------------------------------------------------------
-- 1. CREATE NEW TABLES (IF NOT EXISTS)
---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  contact_number text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE TABEL JAMAAH (Operasional)
CREATE TABLE IF NOT EXISTS public.jamaah (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text,
  nik text UNIQUE,
  birth_date date,
  gender text CHECK (gender IN ('L', 'P')),
  emergency_contact text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE TABEL DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jamaah_id uuid REFERENCES public.jamaah(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('KTP', 'KK', 'PASPOR', 'VISA', 'BUKU_KUNING')),
  file_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'rejected')),
  rejection_reason text,
  verified_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE TABEL INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number text NOT NULL UNIQUE,
  payment_id uuid NOT NULL, -- FK added below
  amount numeric NOT NULL,
  issued_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------------------------
-- 2. ALTER EXISTING TABLES
---------------------------------------------------------------------------

-- PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL;

-- Update profiles role constraint safely
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('super_admin', 'admin_cabang', 'admin', 'jamaah'));

-- JAMAAH FK Fix
ALTER TABLE public.jamaah DROP CONSTRAINT IF EXISTS jamaah_profile_id_fkey;
ALTER TABLE public.jamaah ADD CONSTRAINT jamaah_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- REGISTRATIONS
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_jamaah_id_fkey;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_jamaah_id_fkey FOREIGN KEY (jamaah_id) REFERENCES public.jamaah(id) ON DELETE CASCADE;

-- PAYMENTS
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status IN ('pending', 'waiting_verification', 'paid', 'rejected', 'cancelled'));

-- INVOICES FK
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_payment_id_fkey;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;

---------------------------------------------------------------------------
-- 3. DATA MIGRATION (Safe Insert for Existing Profiles)
---------------------------------------------------------------------------
INSERT INTO public.jamaah (id, profile_id)
SELECT gen_random_uuid(), id FROM public.profiles WHERE role = 'jamaah'
ON CONFLICT (profile_id) DO NOTHING;

---------------------------------------------------------------------------
-- 4. SECURITY DEFINER FUNCTIONS (Untuk Mencegah RLS Recursion)
---------------------------------------------------------------------------
-- Mengambil role user saat ini dengan bypass RLS untuk keamanan checking
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  my_role text;
BEGIN
  SELECT role INTO my_role FROM public.profiles WHERE id = auth.uid();
  RETURN my_role;
END;
$$;

-- Mengambil branch_id user saat ini dengan bypass RLS untuk admin cabang
CREATE OR REPLACE FUNCTION public.get_my_branch()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  my_branch uuid;
BEGIN
  SELECT branch_id INTO my_branch FROM public.profiles WHERE id = auth.uid();
  RETURN my_branch;
END;
$$;

---------------------------------------------------------------------------
-- 5. ENABLE RLS
---------------------------------------------------------------------------
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jamaah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------------------------
-- 6. RLS POLICIES (Berdasarkan Security Definer)
---------------------------------------------------------------------------
-- Hapus policy lama
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Packages viewable by everyone" ON public.packages;
DROP POLICY IF EXISTS "Only admins can modify packages" ON public.packages;
DROP POLICY IF EXISTS "Jamaah can view own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admin can view all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Jamaah can insert own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Jamaah can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Jamaah can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can update payments" ON public.payments;
DROP POLICY IF EXISTS "Profiles viewable by related roles" ON public.profiles;
DROP POLICY IF EXISTS "Branches viewable by everyone" ON public.branches;
DROP POLICY IF EXISTS "Branches modifiable by super_admin only" ON public.branches;
DROP POLICY IF EXISTS "Jamaah can view own data" ON public.jamaah;
DROP POLICY IF EXISTS "Super admin and admin can manage all jamaah" ON public.jamaah;
DROP POLICY IF EXISTS "Admin cabang can manage branch jamaah" ON public.jamaah;
DROP POLICY IF EXISTS "Packages modifiable by super_admin and admin" ON public.packages;
DROP POLICY IF EXISTS "Super admin and admin can manage all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admin cabang can manage branch registrations" ON public.registrations;
DROP POLICY IF EXISTS "Super admin and admin can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Admin cabang can manage branch payments" ON public.payments;
DROP POLICY IF EXISTS "Jamaah can view and insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Jamaah can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Super admin and admin can manage all documents" ON public.documents;
DROP POLICY IF EXISTS "Admin cabang can manage branch documents" ON public.documents;

-- 1. BRANCHES
CREATE POLICY "Branches viewable by everyone" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Branches modifiable by super_admin only" ON public.branches FOR ALL USING (
  public.get_my_role() = 'super_admin'
);

-- 2. PROFILES
CREATE POLICY "Profiles viewable by related roles" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR
  public.get_my_role() IN ('super_admin', 'admin') OR
  (
    public.get_my_role() = 'admin_cabang' AND
    branch_id = public.get_my_branch()
  )
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (
  role = public.get_my_role() AND
  branch_id IS NOT DISTINCT FROM public.get_my_branch()
);

-- 3. JAMAAH
CREATE POLICY "Jamaah can view own data" ON public.jamaah FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Super admin and admin can manage all jamaah" ON public.jamaah FOR ALL USING (
  public.get_my_role() IN ('super_admin', 'admin')
);
CREATE POLICY "Admin cabang can manage branch jamaah" ON public.jamaah FOR ALL USING (
  public.get_my_role() = 'admin_cabang' AND
  branch_id = public.get_my_branch()
);

-- 4. PACKAGES
CREATE POLICY "Packages viewable by everyone" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Packages modifiable by super_admin and admin" ON public.packages FOR ALL USING (
  public.get_my_role() IN ('super_admin', 'admin')
);

-- 5. REGISTRATIONS
CREATE POLICY "Jamaah can view own registrations" ON public.registrations FOR SELECT USING (
  jamaah_id IN (SELECT id FROM public.jamaah WHERE profile_id = auth.uid())
);
CREATE POLICY "Super admin and admin can manage all registrations" ON public.registrations FOR ALL USING (
  public.get_my_role() IN ('super_admin', 'admin')
);
CREATE POLICY "Admin cabang can manage branch registrations" ON public.registrations FOR ALL USING (
  public.get_my_role() = 'admin_cabang' AND
  jamaah_id IN (SELECT id FROM public.jamaah WHERE branch_id = public.get_my_branch())
);

-- 6. PAYMENTS
CREATE POLICY "Jamaah can view own payments" ON public.payments FOR SELECT USING (
  registration_id IN (
    SELECT id FROM public.registrations WHERE jamaah_id IN (
      SELECT id FROM public.jamaah WHERE profile_id = auth.uid()
    )
  )
);
CREATE POLICY "Jamaah can insert own payments" ON public.payments FOR INSERT WITH CHECK (
  registration_id IN (
    SELECT id FROM public.registrations WHERE jamaah_id IN (
      SELECT id FROM public.jamaah WHERE profile_id = auth.uid()
    )
  )
);
CREATE POLICY "Super admin and admin can manage all payments" ON public.payments FOR ALL USING (
  public.get_my_role() IN ('super_admin', 'admin')
);
CREATE POLICY "Admin cabang can manage branch payments" ON public.payments FOR ALL USING (
  public.get_my_role() = 'admin_cabang' AND
  registration_id IN (
    SELECT id FROM public.registrations WHERE jamaah_id IN (
      SELECT id FROM public.jamaah WHERE branch_id = public.get_my_branch()
    )
  )
);

-- 7. DOCUMENTS
CREATE POLICY "Jamaah can view and insert own documents" ON public.documents FOR SELECT USING (
  jamaah_id IN (SELECT id FROM public.jamaah WHERE profile_id = auth.uid())
);
CREATE POLICY "Jamaah can insert own documents" ON public.documents FOR INSERT WITH CHECK (
  jamaah_id IN (SELECT id FROM public.jamaah WHERE profile_id = auth.uid())
);
CREATE POLICY "Super admin and admin can manage all documents" ON public.documents FOR ALL USING (
  public.get_my_role() IN ('super_admin', 'admin')
);
CREATE POLICY "Admin cabang can manage branch documents" ON public.documents FOR ALL USING (
  public.get_my_role() = 'admin_cabang' AND
  jamaah_id IN (SELECT id FROM public.jamaah WHERE branch_id = public.get_my_branch())
);

---------------------------------------------------------------------------
-- 7. TRIGGER AUTH USER (DIKUNCI KE JAMAAH)
---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Secara paksa semua pendaftaran baru (client) akan di-set menjadi 'jamaah'
  -- Mencegah injeksi role privilege via raw_user_meta_data
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    'jamaah'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

---------------------------------------------------------------------------
-- 8. SCHEMA UPDATES (PHASE 3)
---------------------------------------------------------------------------
---------------------------------------------------------------------------
-- 9. SCHEMA UPDATES: GUIDES (PHASE 3)
---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  experience text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides viewable by everyone" ON public.guides FOR SELECT USING (true);
CREATE POLICY "Guides modifiable by super_admin and admin" ON public.guides FOR ALL USING (
  public.get_my_role() IN ('super_admin', 'admin')
);
