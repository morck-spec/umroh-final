'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBranches() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching branches:', error);
    return [];
  }

  return data;
}

export async function createBranch(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const contact_number = formData.get('contact_number') as string;

  if (!name) return { error: 'Nama cabang wajib diisi' };

  const { error } = await supabase
    .from('branches')
    .insert({
      name,
      address,
      contact_number
    });

  if (error) {
    console.error('Error creating branch:', error);
    return { error: 'Gagal membuat cabang' };
  }

  revalidatePath('/dashboard/superadmin/branches');
  return { success: true };
}

export async function updateBranch(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const contact_number = formData.get('contact_number') as string;

  if (!name) return { error: 'Nama cabang wajib diisi' };

  const { error } = await supabase
    .from('branches')
    .update({
      name,
      address,
      contact_number
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating branch:', error);
    return { error: 'Gagal memperbarui cabang' };
  }

  revalidatePath('/dashboard/superadmin/branches');
  return { success: true };
}

export async function deleteBranch(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting branch:', error);
    return { error: 'Gagal menghapus cabang' };
  }

  revalidatePath('/dashboard/superadmin/branches');
  return { success: true };
}
