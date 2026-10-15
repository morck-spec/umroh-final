'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface AnnouncementItem {
  id: string;
  legacy_id?: string;
  title: string;
  content: string;
  audience: 'Semua' | 'Jamaah' | 'Agen' | 'Staff';
  branch: string;
  package_name?: string;
  starts_at?: string;
  expires_at?: string;
  is_published: boolean;
  publish_formatted?: string;
}

const ANNOUNCEMENTS_FILE = path.join(process.cwd(), 'src', 'data', 'announcements.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): AnnouncementItem[] {
  try {
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading announcements.json:', err);
    return [];
  }
}

function writeData(data: AnnouncementItem[]) {
  try {
    const dir = path.dirname(ANNOUNCEMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing announcements.json:', err);
  }
}

function formatPublishDate(dateStr?: string | null): string {
  if (!dateStr) return '13 Oct 2026 06:08';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

export async function getAnnouncementList(): Promise<AnnouncementItem[]> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: dbItems, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbItems && dbItems.length > 0) {
        const list: AnnouncementItem[] = dbItems.map((item) => ({
          id: item.id,
          legacy_id: item.legacy_id,
          title: item.title,
          content: item.content,
          audience: item.audience || 'Semua',
          branch: item.branch || 'Kantor Pusat Jakarta',
          package_name: item.package_name || 'Semua Paket',
          starts_at: item.starts_at || '',
          expires_at: item.expires_at || '',
          is_published: item.is_published ?? true,
          publish_formatted: formatPublishDate(item.starts_at || item.created_at),
        }));

        writeData(list);
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase announcements table:', err);
  }

  // Fallback to local JSON
  const local = readData();
  return local.map((item) => ({
    ...item,
    publish_formatted: formatPublishDate(item.starts_at),
  }));
}

export async function getAnnouncementDetail(id: string): Promise<AnnouncementItem | null> {
  const list = await getAnnouncementList();
  const match = list.find((item) => item.id === id || item.legacy_id === id);
  return match || null;
}

export async function getPackageChoices(): Promise<string[]> {
  const defaultPkgs = [
    'Semua Paket',
    'Umroh Reguler 9 Hari',
    'Umroh Plus Turki 12 Hari',
    'Haji Khusus 2026',
    'Haji Plus Eksklusif',
    'Umroh Akhir Tahun',
  ];

  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: pkgs } = await supabase.from('packages').select('name');
      if (pkgs && pkgs.length > 0) {
        const set = new Set(['Semua Paket', ...pkgs.map((p) => p.name.trim())]);
        return Array.from(set);
      }
    }
  } catch {
    // fallback
  }

  return defaultPkgs;
}

export async function createAnnouncement(payload: {
  title: string;
  content: string;
  audience: 'Semua' | 'Jamaah' | 'Agen' | 'Staff';
  branch?: string;
  package_name?: string;
  starts_at?: string;
  expires_at?: string;
  is_published: boolean;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const newId = String(Date.now());
    let createdId = newId;

    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from('announcements')
        .insert({
          title: payload.title,
          content: payload.content,
          audience: payload.audience,
          branch: payload.branch || 'Kantor Pusat Jakarta',
          package_name: payload.package_name || 'Semua Paket',
          starts_at: payload.starts_at || null,
          expires_at: payload.expires_at || null,
          is_published: payload.is_published,
        })
        .select('id')
        .maybeSingle();

      if (!error && inserted?.id) {
        createdId = inserted.id;
      }
    }

    // Save to local cache as well
    const list = readData();
    const newItem: AnnouncementItem = {
      id: createdId,
      legacy_id: newId,
      title: payload.title,
      content: payload.content,
      audience: payload.audience,
      branch: payload.branch || 'Kantor Pusat Jakarta',
      package_name: payload.package_name || 'Semua Paket',
      starts_at: payload.starts_at || '',
      expires_at: payload.expires_at || '',
      is_published: payload.is_published,
      publish_formatted: formatPublishDate(payload.starts_at),
    };
    list.unshift(newItem);
    writeData(list);

    revalidatePath('/announcements');
    revalidatePath('/dashboard/superadmin/announcements');
    revalidatePath('/dashboard/admin_cabang/announcements');
    return { success: true, id: createdId };
  } catch (err: any) {
    console.error('Error creating announcement:', err);
    return { success: false, error: err.message || 'Gagal menambahkan pengumuman' };
  }
}

export async function updateAnnouncement(
  id: string,
  payload: {
    title: string;
    content: string;
    audience: 'Semua' | 'Jamaah' | 'Agen' | 'Staff';
    branch?: string;
    package_name?: string;
    starts_at?: string;
    expires_at?: string;
    is_published: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase
          .from('announcements')
          .update({
            title: payload.title,
            content: payload.content,
            audience: payload.audience,
            branch: payload.branch || 'Kantor Pusat Jakarta',
            package_name: payload.package_name || 'Semua Paket',
            starts_at: payload.starts_at || null,
            expires_at: payload.expires_at || null,
            is_published: payload.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } else {
        await supabase
          .from('announcements')
          .update({
            title: payload.title,
            content: payload.content,
            audience: payload.audience,
            branch: payload.branch || 'Kantor Pusat Jakarta',
            package_name: payload.package_name || 'Semua Paket',
            starts_at: payload.starts_at || null,
            expires_at: payload.expires_at || null,
            is_published: payload.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq('legacy_id', id);
      }
    }

    // Update local cache
    const list = readData();
    const idx = list.findIndex((item) => item.id === id || item.legacy_id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...payload,
        publish_formatted: formatPublishDate(payload.starts_at || list[idx].starts_at),
      };
      writeData(list);
    }

    revalidatePath('/announcements');
    revalidatePath(`/announcements/${id}/edit`);
    revalidatePath('/dashboard/superadmin/announcements');
    revalidatePath(`/dashboard/superadmin/announcements/${id}/edit`);
    revalidatePath('/dashboard/admin_cabang/announcements');
    revalidatePath(`/dashboard/admin_cabang/announcements/${id}/edit`);
    return { success: true };
  } catch (err: any) {
    console.error('Error updating announcement:', err);
    return { success: false, error: err.message || 'Gagal mengubah pengumuman' };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('announcements').delete().eq('id', id);
      } else {
        await supabase.from('announcements').delete().eq('legacy_id', id);
      }
    }

    // Update local cache
    const list = readData();
    const filtered = list.filter((item) => item.id !== id && item.legacy_id !== id);
    writeData(filtered);

    revalidatePath('/announcements');
    revalidatePath('/dashboard/superadmin/announcements');
    revalidatePath('/dashboard/admin_cabang/announcements');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting announcement:', err);
    return { success: false, error: err.message || 'Gagal menghapus pengumuman' };
  }
}
