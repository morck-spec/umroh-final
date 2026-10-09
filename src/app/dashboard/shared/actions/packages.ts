'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      registrations:registrations(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching packages:', error);
    return [];
  }

  return data;
}

export async function createPackage(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const duration_days = parseInt(formData.get('duration_days') as string);
  const departure_date = formData.get('departure_date') as string;
  const quota = formData.get('quota') ? parseInt(formData.get('quota') as string) : 0;

  if (!name || isNaN(price) || isNaN(duration_days)) {
    return { error: 'Nama, Harga, dan Durasi wajib diisi dengan benar' };
  }

  const { error } = await supabase
    .from('packages')
    .insert({
      name,
      description,
      price,
      duration_days,
      departure_date: departure_date || null,
      quota
    });

  if (error) {
    console.error('Error creating package:', error);
    return { error: 'Gagal membuat paket' };
  }

  revalidatePath('/dashboard/superadmin/packages');
  revalidatePath('/dashboard/admin/packages');
  return { success: true };
}

export async function updatePackage(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const duration_days = parseInt(formData.get('duration_days') as string);
  const departure_date = formData.get('departure_date') as string;
  const quota = formData.get('quota') ? parseInt(formData.get('quota') as string) : 0;

  if (!name || isNaN(price) || isNaN(duration_days)) {
    return { error: 'Nama, Harga, dan Durasi wajib diisi dengan benar' };
  }

  const { error } = await supabase
    .from('packages')
    .update({
      name,
      description,
      price,
      duration_days,
      departure_date: departure_date || null,
      quota
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating package:', error);
    return { error: 'Gagal memperbarui paket' };
  }

  revalidatePath('/dashboard/superadmin/packages');
  revalidatePath('/dashboard/admin/packages');
  return { success: true };
}

export async function deletePackage(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting package:', error);
    return { error: 'Gagal menghapus paket' };
  }

  revalidatePath('/dashboard/superadmin/packages');
  revalidatePath('/dashboard/admin/packages');
  return { success: true };
}
