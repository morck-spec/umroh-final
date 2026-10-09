'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      branches(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
}

export async function updateUserRole(id: string, formData: FormData) {
  const supabase = await createClient(); // we use normal client because super_admin bypasses RLS anyway for profiles updates!
  // Wait, the RLS policy: `Users can update own profile`.
  // SUPER ADMIN CANNOT UPDATE OTHER PROFILES BY DEFAULT!
  // Let me check policy:
  // `CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);`
  // Ah! There is NO policy allowing super_admin to update other profiles!
  // We MUST use service_role_key for this action.

  const { createClient: createServiceClient } = require('@supabase/supabase-js');
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify current user is super_admin!
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'Hanya super_admin yang dapat mengubah role' };

  const role = formData.get('role') as string;
  const branch_id = formData.get('branch_id') as string;

  const { error } = await serviceClient
    .from('profiles')
    .update({
      role,
      branch_id: role === 'admin_cabang' ? (branch_id || null) : null
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating user:', error);
    return { error: 'Gagal memperbarui peran pengguna' };
  }

  revalidatePath('/dashboard/superadmin/users');
  return { success: true };
}
