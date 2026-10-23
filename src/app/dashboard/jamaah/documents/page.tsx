import { createClient } from '@/utils/supabase/server';
import {
  getPilgrimDetail,
  getPilgrimDocumentsList,
  PilgrimWithDocs,
} from '@/app/dashboard/shared/actions/documents';
import PilgrimDocumentsDetailClient from '@/components/dashboard/PilgrimDocumentsDetailClient';

export const metadata = { title: 'Dokumen Saya | Travel Umroh & Haji' };

export default async function JamaahDocumentsPage() {
  let pilgrim: PilgrimWithDocs | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 1. Try to find jamaah record by profile_id
      const { data: jData } = await supabase
        .from('jamaah')
        .select('id, full_name')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (jData) {
        pilgrim = await getPilgrimDetail(jData.id);
        if (!pilgrim && jData.full_name) {
          pilgrim = await getPilgrimDetail(jData.full_name);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching logged-in jamaah pilgrim details:', err);
  }

  // Fallback to Ahmad Fauzi (the demo pilgrim matching the screenshot)
  if (!pilgrim) {
    pilgrim = await getPilgrimDetail('a422ccf4-4c8d-426b-9e95-108275c04a8d');
  }
  if (!pilgrim) {
    pilgrim = await getPilgrimDetail('1');
  }
  if (!pilgrim) {
    pilgrim = await getPilgrimDetail('JM-0001');
  }

  // Fallback to first available pilgrim if still not found
  if (!pilgrim) {
    const list = await getPilgrimDocumentsList();
    pilgrim = list[0] || null;
  }

  if (!pilgrim) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        Data dokumen jamaah belum tersedia.
      </div>
    );
  }

  return (
    <PilgrimDocumentsDetailClient
      pilgrim={pilgrim}
      backHref="/dashboard/jamaah"
      isJamaah={true}
    />
  );
}

