'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      jamaah(id, full_name, nik, phone, branches(name))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return data;
}

export async function verifyDocument(id: string, status: string, rejection_reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('documents')
    .update({
      status,
      rejection_reason: status === 'rejected' ? rejection_reason : null,
      verified_by: user?.id
    })
    .eq('id', id);

  if (error) {
    console.error('Error verifying document:', error);
    return { error: 'Gagal memverifikasi dokumen' };
  }

  revalidatePath('/dashboard/superadmin/documents');
  revalidatePath('/dashboard/admin/documents');
  revalidatePath('/dashboard/admin_cabang/documents');
  return { success: true };
}

export async function getSignedUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .storage
    .from('documents')
    .createSignedUrl(filePath, 60 * 5); // 5 minutes

  if (error) {
    console.error('Error getting signed url:', error);
    return null;
  }

  return data.signedUrl;
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: jamaahData } = await supabase
    .from('jamaah')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!jamaahData) return { error: 'Data jamaah tidak ditemukan' };

  const file = formData.get('file') as File;
  const document_type = formData.get('document_type') as string;

  if (!file || !document_type) return { error: 'File dan jenis dokumen wajib diisi' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}-${document_type}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { error: 'Gagal mengupload file ke storage' };
  }

  const { error: dbError } = await supabase
    .from('documents')
    .insert({
      jamaah_id: jamaahData.id,
      document_type,
      file_url: fileName,
      status: 'pending'
    });

  if (dbError) {
    console.error('DB error:', dbError);
    return { error: 'Gagal menyimpan metadata dokumen' };
  }

  revalidatePath('/dashboard/jamaah/documents');
  return { success: true };
}
