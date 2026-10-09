'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getJamaah() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('jamaah')
    .select(`
      *,
      profiles(full_name, role),
      branches(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jamaah:', error);
    return [];
  }

  return data;
}

export async function getBranches() {
  const supabase = await createClient();
  const { data } = await supabase.from('branches').select('id, name');
  return data || [];
}

export async function createJamaah(formData: FormData, branchId?: string | null) {
  const supabase = await createClient();

  const full_name = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const nik = formData.get('nik') as string;
  const gender = formData.get('gender') as string;
  const birth_date = formData.get('birth_date') as string;
  const emergency_contact = formData.get('emergency_contact') as string;

  // Admin cabang forces their own branch id (passed from client)
  const finalBranchId = branchId || (formData.get('branch_id') as string) || null;

  if (!full_name || !phone) {
    return { error: 'Nama dan nomor telepon wajib diisi' };
  }

  const { error } = await supabase
    .from('jamaah')
    .insert({
      full_name,
      phone,
      nik: nik || null,
      gender: gender || null,
      birth_date: birth_date || null,
      emergency_contact: emergency_contact || null,
      branch_id: finalBranchId
    });

  if (error) {
    console.error('Error creating jamaah:', error);
    if (error.code === '23505' && error.message.includes('nik')) {
      return { error: 'NIK sudah terdaftar' };
    }
    return { error: 'Gagal mendaftarkan jamaah' };
  }

  revalidatePath('/dashboard/superadmin/jamaah');
  revalidatePath('/dashboard/admin/jamaah');
  revalidatePath('/dashboard/admin_cabang/jamaah');
  return { success: true };
}

export async function updateJamaah(id: string, formData: FormData, branchId?: string | null) {
  const supabase = await createClient();

  const full_name = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const nik = formData.get('nik') as string;
  const gender = formData.get('gender') as string;
  const birth_date = formData.get('birth_date') as string;
  const emergency_contact = formData.get('emergency_contact') as string;

  const finalBranchId = branchId || (formData.get('branch_id') as string) || null;

  if (!full_name || !phone) {
    return { error: 'Nama dan nomor telepon wajib diisi' };
  }

  const { error } = await supabase
    .from('jamaah')
    .update({
      full_name,
      phone,
      nik: nik || null,
      gender: gender || null,
      birth_date: birth_date || null,
      emergency_contact: emergency_contact || null,
      branch_id: finalBranchId
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating jamaah:', error);
    if (error.code === '23505' && error.message.includes('nik')) {
      return { error: 'NIK sudah terdaftar' };
    }
    return { error: 'Gagal memperbarui jamaah' };
  }

  revalidatePath('/dashboard/superadmin/jamaah');
  revalidatePath('/dashboard/admin/jamaah');
  revalidatePath('/dashboard/admin_cabang/jamaah');
  return { success: true };
}

export async function deleteJamaah(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('jamaah')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting jamaah:', error);
    return { error: 'Gagal menghapus jamaah' };
  }

  revalidatePath('/dashboard/superadmin/jamaah');
  revalidatePath('/dashboard/admin/jamaah');
  revalidatePath('/dashboard/admin_cabang/jamaah');
  return { success: true };
}
