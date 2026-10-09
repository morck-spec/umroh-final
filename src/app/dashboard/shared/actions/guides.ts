'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getGuides() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guides:', error);
    return [];
  }

  return data;
}

export async function createGuide(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const experience = formData.get('experience') as string;

  if (!name) return { error: 'Nama wajib diisi' };

  const { error } = await supabase
    .from('guides')
    .insert({
      name,
      phone: phone || null,
      experience: experience || null
    });

  if (error) {
    console.error('Error creating guide:', error);
    return { error: 'Gagal menambah pembimbing' };
  }

  revalidatePath('/dashboard/superadmin/guides');
  revalidatePath('/dashboard/admin/guides');
  return { success: true };
}

export async function updateGuide(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const experience = formData.get('experience') as string;

  if (!name) return { error: 'Nama wajib diisi' };

  const { error } = await supabase
    .from('guides')
    .update({
      name,
      phone: phone || null,
      experience: experience || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating guide:', error);
    return { error: 'Gagal memperbarui pembimbing' };
  }

  revalidatePath('/dashboard/superadmin/guides');
  revalidatePath('/dashboard/admin/guides');
  return { success: true };
}

export async function deleteGuide(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guides')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting guide:', error);
    return { error: 'Gagal menghapus pembimbing' };
  }

  revalidatePath('/dashboard/superadmin/guides');
  revalidatePath('/dashboard/admin/guides');
  return { success: true };
}
