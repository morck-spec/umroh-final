'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPayments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      registrations(jamaah(full_name, phone, branches(name)), packages(name, price))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }

  return data;
}

export async function verifyPayment(id: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('payments')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error verifying payment:', error);
    return { error: 'Gagal memverifikasi pembayaran: ' + error.message };
  }

  // If payment is paid, we can generate an invoice here (in a real app)

  revalidatePath('/dashboard/superadmin/payments');
  revalidatePath('/dashboard/admin/payments');
  revalidatePath('/dashboard/admin_cabang/payments');
  return { success: true };
}

export async function createPayment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const registration_id = formData.get('registration_id') as string;
  const amount = formData.get('amount') as string;
  const payment_method = formData.get('payment_method') as string;
  const file = formData.get('proof_file') as File;

  if (!registration_id || !amount || !payment_method || !file) {
    return { error: 'Semua field dan bukti pembayaran wajib diisi' };
  }

  // Upload proof
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}-proof.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('payment_proofs')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { error: 'Gagal mengupload bukti pembayaran' };
  }

  const { error: dbError } = await supabase
    .from('payments')
    .insert({
      registration_id,
      amount: parseInt(amount),
      payment_method,
      proof_url: fileName,
      status: 'waiting_verification'
    });

  if (dbError) {
    console.error('DB error:', dbError);
    return { error: 'Gagal menyimpan data pembayaran' };
  }

  revalidatePath('/dashboard/jamaah/payment');
  return { success: true };
}

export async function getSignedProofUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .storage
    .from('payment_proofs')
    .createSignedUrl(filePath, 60 * 5); // 5 minutes

  if (error) {
    console.error('Error getting signed url:', error);
    return null;
  }

  return data.signedUrl;
}
