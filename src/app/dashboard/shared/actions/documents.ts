'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export type PilgrimDocument = {
  id: string;
  label: string;
  status: 'Terverifikasi' | 'Sudah Diunggah' | 'Belum Diunggah' | 'Ditolak';
  verified_at?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  note?: string | null;
};

export type PilgrimWithDocs = {
  id: string;
  legacy_id?: string;
  code: string;
  name: string;
  branch: string;
  documents: PilgrimDocument[];
  verified_count?: number;
  total_count?: number;
};

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'jamaah_documents.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): { pilgrims: PilgrimWithDocs[] } {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { pilgrims: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading jamaah_documents.json:', err);
    return { pilgrims: [] };
  }
}

function writeData(data: { pilgrims: PilgrimWithDocs[] }) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing jamaah_documents.json:', err);
  }
}

const standardChecklist = [
  { type: 'KTP', label: 'KTP' },
  { type: 'KK', label: 'Kartu Keluarga' },
  { type: 'PASPOR', label: 'Paspor' },
  { type: 'VISA', label: 'Visa' },
  { type: 'BUKU_KUNING', label: 'Sertifikat Vaksin Meningitis (Buku Kuning)' },
];

export async function getPilgrimDocumentsList(q = ''): Promise<PilgrimWithDocs[]> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: jamaahList, error: jError } = await supabase
        .from('jamaah')
        .select('id, full_name, nik, phone, branch_id, branches(name)')
        .order('created_at', { ascending: false });

      const { data: allDocs } = await supabase.from('documents').select('*');

      if (jamaahList && jamaahList.length > 0) {
        const pilgrims: PilgrimWithDocs[] = jamaahList.map((j, idx) => {
          const jDocs = (allDocs || []).filter((d) => d.jamaah_id === j.id);

          const docItems: PilgrimDocument[] = standardChecklist.map((std) => {
            const match = jDocs.find((d) => d.document_type === std.type);
            if (match) {
              let uiStatus: 'Terverifikasi' | 'Sudah Diunggah' | 'Belum Diunggah' | 'Ditolak' = 'Sudah Diunggah';
              if (match.status === 'valid') uiStatus = 'Terverifikasi';
              else if (match.status === 'rejected') uiStatus = 'Ditolak';

              return {
                id: match.id,
                label: std.label,
                status: uiStatus,
                verified_at: match.status === 'valid' ? new Date(match.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
                file_name: match.file_url ? match.file_url.split('/').pop() : null,
                file_url: match.file_url,
                note: match.rejection_reason,
              };
            } else {
              return {
                id: `std-${j.id}-${std.type}`,
                label: std.label,
                status: 'Belum Diunggah',
                verified_at: null,
                file_name: null,
                file_url: null,
                note: null,
              };
            }
          });

          const verified = docItems.filter((d) => d.status === 'Terverifikasi').length;

          return {
            id: j.id,
            code: `JM-${String(idx + 1).padStart(4, '0')}`,
            name: j.full_name,
            branch: (j.branches as any)?.name || 'Kantor Pusat',
            documents: docItems,
            verified_count: verified,
            total_count: docItems.length,
          };
        });

        if (q) {
          const lower = q.toLowerCase();
          return pilgrims.filter((p) => p.name.toLowerCase().includes(lower) || p.code.toLowerCase().includes(lower));
        }

        return pilgrims;
      }
    }
  } catch (err) {
    console.error('Error in getPilgrimDocumentsList with Supabase:', err);
  }

  // Fallback to local json data
  const data = readData();
  let list = data.pilgrims.map((p) => {
    const total = p.documents.length;
    const verified = p.documents.filter((d) => d.status === 'Terverifikasi').length;
    return {
      ...p,
      verified_count: verified,
      total_count: total,
    };
  });

  if (q) {
    const lower = q.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(lower) || p.code.toLowerCase().includes(lower));
  }

  return list;
}

export async function getPilgrimDetail(idOrCode: string): Promise<PilgrimWithDocs | null> {
  const list = await getPilgrimDocumentsList('');
  const pilgrim = list.find(
    (p) => p.id === idOrCode || p.legacy_id === idOrCode || p.code.toLowerCase() === idOrCode.toLowerCase()
  );

  return pilgrim || null;
}

export async function seedStandardChecklist(pilgrimId: string): Promise<{ success: boolean; error?: string }> {
  revalidatePath('/dashboard', 'layout');
  revalidatePath(`/dashboard/superadmin/documents/${pilgrimId}`);
  return { success: true };
}

export async function updatePilgrimDocStatus(
  pilgrimId: string,
  docId: string,
  status: 'Terverifikasi' | 'Sudah Diunggah' | 'Belum Diunggah' | 'Ditolak'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const dbStatus = status === 'Terverifikasi' ? 'valid' : status === 'Ditolak' ? 'rejected' : 'pending';

      if (docId.startsWith('std-')) {
        const parts = docId.split('-');
        const docType = parts[parts.length - 1];

        const { data: existing } = await supabase
          .from('documents')
          .select('id')
          .eq('jamaah_id', pilgrimId)
          .eq('document_type', docType)
          .maybeSingle();

        if (existing) {
          await supabase.from('documents').update({ status: dbStatus }).eq('id', existing.id);
        } else {
          await supabase.from('documents').insert({
            jamaah_id: pilgrimId,
            document_type: docType,
            file_url: `manual-verify-${docType}.png`,
            status: dbStatus,
          });
        }
      } else {
        await supabase.from('documents').update({ status: dbStatus }).eq('id', docId);
      }
    }
  } catch (err) {
    console.error('Error updating doc status in Supabase:', err);
  }

  // Also update local cache if it exists
  const data = readData();
  const pilgrim = data.pilgrims.find((p) => p.id === pilgrimId || p.legacy_id === pilgrimId);
  if (pilgrim) {
    const doc = pilgrim.documents.find((d) => d.id === docId);
    if (doc) {
      doc.status = status;
      doc.verified_at =
        status === 'Terverifikasi'
          ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : null;
      writeData(data);
    }
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath(`/dashboard/superadmin/documents/${pilgrimId}`);
  return { success: true };
}

export async function uploadPilgrimDocFile(
  pilgrimId: string,
  docId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; file_name?: string }> {
  const file = formData.get('file') as File;
  if (!file || !file.name) return { success: false, error: 'Pilih berkas terlebih dahulu' };

  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      let docType = 'KTP';
      if (docId.startsWith('std-')) {
        const parts = docId.split('-');
        docType = parts[parts.length - 1];
      } else {
        const { data: dData } = await supabase.from('documents').select('document_type').eq('id', docId).maybeSingle();
        if (dData) docType = dData.document_type;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${pilgrimId}/${Date.now()}-${docType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error to Supabase storage:', uploadError);
      }

      const { data: existing } = await supabase
        .from('documents')
        .select('id')
        .eq('jamaah_id', pilgrimId)
        .eq('document_type', docType)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('documents')
          .update({ file_url: fileName, status: 'valid' })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('documents')
          .insert({
            jamaah_id: pilgrimId,
            document_type: docType,
            file_url: fileName,
            status: 'valid',
          });
      }
    }
  } catch (err) {
    console.error('Error uploading doc to Supabase:', err);
  }

  // Update local cache
  const data = readData();
  const pilgrim = data.pilgrims.find((p) => p.id === pilgrimId || p.legacy_id === pilgrimId);
  if (pilgrim) {
    const doc = pilgrim.documents.find((d) => d.id === docId);
    if (doc) {
      doc.file_name = file.name;
      doc.status = 'Sudah Diunggah';
      writeData(data);
    }
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath(`/dashboard/superadmin/documents/${pilgrimId}`);
  return { success: true, file_name: file.name };
}

export async function deletePilgrimDoc(
  pilgrimId: string,
  docId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase && !docId.startsWith('std-')) {
      await supabase.from('documents').delete().eq('id', docId);
    }
  } catch (err) {
    console.error('Error deleting doc in Supabase:', err);
  }

  const data = readData();
  const pilgrim = data.pilgrims.find((p) => p.id === pilgrimId || p.legacy_id === pilgrimId);
  if (pilgrim) {
    pilgrim.documents = pilgrim.documents.filter((d) => d.id !== docId);
    writeData(data);
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath(`/dashboard/superadmin/documents/${pilgrimId}`);
  return { success: true };
}

/* ---------------- BACKWARD COMPATIBILITY ---------------- */

export async function getDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select(`*, jamaah(id, full_name, nik, phone, branches(name))`)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function verifyDocument(id: string, status: string, rejection_reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('documents')
    .update({
      status,
      rejection_reason: status === 'rejected' ? rejection_reason : null,
      verified_by: user?.id,
    })
    .eq('id', id);

  if (error) return { error: 'Gagal memverifikasi dokumen' };
  return { success: true };
}

export async function getSignedUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(filePath, 60 * 5);
  if (error) return null;
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
      status: 'pending',
    });

  if (dbError) {
    console.error('DB error:', dbError);
    return { error: 'Gagal menyimpan metadata dokumen' };
  }

  revalidatePath('/dashboard/jamaah/documents');
  return { success: true };
}
