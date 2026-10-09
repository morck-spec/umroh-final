'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getRegistrations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      jamaah(id, full_name, phone, branches(name)),
      packages(id, name, price, departure_date)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }

  return data;
}

export async function createRegistration(formData: FormData) {
  const supabase = await createClient();

  const jamaah_id = formData.get('jamaah_id') as string;
  const package_id = formData.get('package_id') as string;
  const status = (formData.get('status') as string) || 'pending';

  if (!jamaah_id || !package_id) {
    return { error: 'Jamaah dan Paket wajib dipilih' };
  }

  // Verify user role/branch logic could be enforced here, but RLS protects DB anyway

  const { error } = await supabase
    .from('registrations')
    .insert({
      jamaah_id,
      package_id,
      status
    });

  if (error) {
    console.error('Error creating registration:', error);
    if (error.code === '23505') return { error: 'Jamaah sudah terdaftar di paket ini' };
    return { error: 'Gagal membuat pendaftaran' };
  }

  revalidatePath('/dashboard/superadmin/registrations');
  revalidatePath('/dashboard/admin/registrations');
  revalidatePath('/dashboard/admin_cabang/registrations');
  return { success: true };
}

export async function updateRegistrationStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating registration:', error);
    return { error: 'Gagal memperbarui status pendaftaran' };
  }

  revalidatePath('/dashboard/superadmin/registrations');
  revalidatePath('/dashboard/admin/registrations');
  revalidatePath('/dashboard/admin_cabang/registrations');
  return { success: true };
}

export async function deleteRegistration(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting registration:', error);
    return { error: 'Gagal membatalkan pendaftaran' };
  }

  revalidatePath('/dashboard/superadmin/registrations');
  revalidatePath('/dashboard/admin/registrations');
  revalidatePath('/dashboard/admin_cabang/registrations');
  return { success: true };
}
