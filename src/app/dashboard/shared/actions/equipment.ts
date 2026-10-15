'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface EquipmentItem {
  id: string;
  legacy_id?: string;
  jamaah_id?: string;
  jamaah_name: string;
  package_name?: string;
  item: string;
  size?: string;
  qty: number;
  status: 'Belum Disiapkan' | 'Disiapkan' | 'Sudah Diserahkan';
  handed_over_date?: string;
  handed_over_formatted?: string;
  notes?: string;
}

export interface JamaahOption {
  id: string;
  jamaah_id?: string;
  jamaah_name: string;
  package_name: string;
  label: string;
}

const EQUIPMENT_FILE = path.join(process.cwd(), 'src', 'data', 'equipment.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): EquipmentItem[] {
  try {
    if (!fs.existsSync(EQUIPMENT_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(EQUIPMENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading equipment.json:', err);
    return [];
  }
}

function writeData(data: EquipmentItem[]) {
  try {
    const dir = path.dirname(EQUIPMENT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(EQUIPMENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing equipment.json:', err);
  }
}

function formatHandedDate(dateStr?: string | null, status?: string): string {
  if (!dateStr || status !== 'Sudah Diserahkan') return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export async function getEquipmentList(): Promise<EquipmentItem[]> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: dbItems, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbItems && dbItems.length > 0) {
        const list: EquipmentItem[] = dbItems.map((item) => ({
          id: item.id,
          legacy_id: item.legacy_id,
          jamaah_id: item.jamaah_id,
          jamaah_name: item.jamaah_name,
          package_name: item.package_name,
          item: item.item,
          size: item.size || '-',
          qty: item.qty || 1,
          status: item.status || 'Belum Disiapkan',
          handed_over_date: item.handed_over_date || '',
          handed_over_formatted: formatHandedDate(item.handed_over_date, item.status),
          notes: item.notes || '',
        }));

        writeData(list);
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase equipment table:', err);
  }

  // Fallback to local JSON
  const local = readData();
  return local.map((item) => ({
    ...item,
    handed_over_formatted: formatHandedDate(item.handed_over_date, item.status),
  }));
}

export async function getEquipmentDetail(id: string): Promise<EquipmentItem | null> {
  const list = await getEquipmentList();
  const match = list.find((item) => item.id === id || item.legacy_id === id);
  return match || null;
}

export async function getJamaahOptions(): Promise<JamaahOption[]> {
  const defaultOptions: JamaahOption[] = [
    { id: 'opt-1', jamaah_name: 'Fitri Handayani', package_name: 'Umroh Reguler 9 Hari', label: 'Fitri Handayani - Umroh Reguler 9 Hari' },
    { id: 'opt-2', jamaah_name: 'Gunawan Wibowo', package_name: 'Umroh Plus Turki 12 Hari', label: 'Gunawan Wibowo - Umroh Plus Turki 12 Hari' },
    { id: 'opt-3', jamaah_name: 'Hesti Purnama', package_name: 'Haji Khusus 2026', label: 'Hesti Purnama - Haji Khusus 2026' },
    { id: 'opt-4', jamaah_name: 'Indra Kusuma', package_name: 'Haji Plus Eksklusif', label: 'Indra Kusuma - Haji Plus Eksklusif' },
    { id: 'opt-5', jamaah_name: 'Kartika Sari', package_name: 'Umroh Akhir Tahun', label: 'Kartika Sari - Umroh Akhir Tahun' },
    { id: 'opt-6', jamaah_name: 'Dewi Anggraini', package_name: 'Haji Plus Eksklusif', label: 'Dewi Anggraini - Haji Plus Eksklusif' },
    { id: 'opt-7', jamaah_name: 'Ahmad Fauzi', package_name: 'Haji Khusus 2026', label: 'Ahmad Fauzi - Haji Khusus 2026' },
    { id: 'opt-8', jamaah_name: 'Budi Santoso', package_name: 'Umroh Plus Turki 12 Hari', label: 'Budi Santoso - Umroh Plus Turki 12 Hari' },
    { id: 'opt-9', jamaah_name: 'Eko Prasetyo', package_name: 'Umroh Plus Turki 12 Hari', label: 'Eko Prasetyo - Umroh Plus Turki 12 Hari' },
    { id: 'opt-10', jamaah_name: 'Siti Rahmawati', package_name: 'Umroh Reguler 9 Hari', label: 'Siti Rahmawati - Umroh Reguler 9 Hari' },
  ];

  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: jamaahs } = await supabase.from('jamaah').select('id, full_name');
      const { data: pkgs } = await supabase.from('packages').select('id, name');

      if (jamaahs && jamaahs.length > 0) {
        const dynamicOptions: JamaahOption[] = [];
        for (const j of jamaahs) {
          const pkgName = pkgs?.[0]?.name || 'Umroh Reguler 9 Hari';
          dynamicOptions.push({
            id: j.id,
            jamaah_id: j.id,
            jamaah_name: j.full_name,
            package_name: pkgName,
            label: `${j.full_name} - ${pkgName}`,
          });
        }

        // Merge with defaults to ensure all reference jamaah are present
        for (const d of defaultOptions) {
          if (!dynamicOptions.some((o) => o.jamaah_name.toLowerCase() === d.jamaah_name.toLowerCase())) {
            dynamicOptions.push(d);
          }
        }
        return dynamicOptions;
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase for jamaah options:', err);
  }

  return defaultOptions;
}

export async function createEquipment(payload: {
  jamaah_name: string;
  package_name?: string;
  item: string;
  size?: string;
  qty: number;
  status: 'Belum Disiapkan' | 'Disiapkan' | 'Sudah Diserahkan';
  handed_over_date?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const newId = String(Date.now());
    let createdId = newId;

    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from('equipment')
        .insert({
          jamaah_name: payload.jamaah_name,
          package_name: payload.package_name || '',
          item: payload.item,
          size: payload.size || '-',
          qty: payload.qty,
          status: payload.status,
          handed_over_date: payload.handed_over_date || null,
          notes: payload.notes || '',
        })
        .select('id')
        .maybeSingle();

      if (!error && inserted?.id) {
        createdId = inserted.id;
      }
    }

    // Save to local cache as well
    const list = readData();
    const newItem: EquipmentItem = {
      id: createdId,
      legacy_id: newId,
      jamaah_name: payload.jamaah_name,
      package_name: payload.package_name || '',
      item: payload.item,
      size: payload.size || '-',
      qty: payload.qty,
      status: payload.status,
      handed_over_date: payload.handed_over_date || '',
      handed_over_formatted: formatHandedDate(payload.handed_over_date, payload.status),
      notes: payload.notes || '',
    };
    list.unshift(newItem);
    writeData(list);

    revalidatePath('/equipment');
    revalidatePath('/dashboard/superadmin/equipment');
    revalidatePath('/dashboard/admin_cabang/equipment');
    return { success: true, id: createdId };
  } catch (err: any) {
    console.error('Error creating equipment:', err);
    return { success: false, error: err.message || 'Gagal menambahkan perlengkapan' };
  }
}

export async function updateEquipment(
  id: string,
  payload: {
    jamaah_name: string;
    package_name?: string;
    item: string;
    size?: string;
    qty: number;
    status: 'Belum Disiapkan' | 'Disiapkan' | 'Sudah Diserahkan';
    handed_over_date?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase
          .from('equipment')
          .update({
            jamaah_name: payload.jamaah_name,
            package_name: payload.package_name || '',
            item: payload.item,
            size: payload.size || '-',
            qty: payload.qty,
            status: payload.status,
            handed_over_date: payload.handed_over_date || null,
            notes: payload.notes || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } else {
        await supabase
          .from('equipment')
          .update({
            jamaah_name: payload.jamaah_name,
            package_name: payload.package_name || '',
            item: payload.item,
            size: payload.size || '-',
            qty: payload.qty,
            status: payload.status,
            handed_over_date: payload.handed_over_date || null,
            notes: payload.notes || '',
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
        handed_over_formatted: formatHandedDate(payload.handed_over_date, payload.status),
      };
      writeData(list);
    }

    revalidatePath('/equipment');
    revalidatePath(`/equipment/${id}/edit`);
    revalidatePath('/dashboard/superadmin/equipment');
    revalidatePath(`/dashboard/superadmin/equipment/${id}/edit`);
    revalidatePath('/dashboard/admin_cabang/equipment');
    revalidatePath(`/dashboard/admin_cabang/equipment/${id}/edit`);
    return { success: true };
  } catch (err: any) {
    console.error('Error updating equipment:', err);
    return { success: false, error: err.message || 'Gagal mengubah perlengkapan' };
  }
}

export async function deleteEquipment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('equipment').delete().eq('id', id);
      } else {
        await supabase.from('equipment').delete().eq('legacy_id', id);
      }
    }

    // Update local cache
    const list = readData();
    const filtered = list.filter((item) => item.id !== id && item.legacy_id !== id);
    writeData(filtered);

    revalidatePath('/equipment');
    revalidatePath('/dashboard/superadmin/equipment');
    revalidatePath('/dashboard/admin_cabang/equipment');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting equipment:', err);
    return { success: false, error: err.message || 'Gagal menghapus perlengkapan' };
  }
}
