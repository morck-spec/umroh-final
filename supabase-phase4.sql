-- 1. ALTER PAYMENTS
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS proof_url text;

-- 2. BUCKETS STORAGE (If you have permissions)
-- This creates private buckets for documents and payments
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', false),
  ('payment_proofs', 'payment_proofs', false)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE POLICIES
-- Create policies for documents bucket
CREATE POLICY "Jamaah can upload their own documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Jamaah can view their own documents" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admin can view all documents" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'documents' AND (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
);

-- Create policies for payment_proofs bucket
CREATE POLICY "Jamaah can upload their own payment proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'payment_proofs' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Jamaah can view their own payment proofs" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'payment_proofs' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admin can view all payment proofs" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'payment_proofs' AND (public.get_my_role() IN ('super_admin', 'admin', 'admin_cabang'))
);
