'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface PackageItem {
  id: string;
  code: string;
  name: string;
  type: 'Umroh' | 'Haji' | 'Haji Plus' | string;
  status: 'Dibuka' | 'Penuh' | 'Selesai' | 'Dibatalkan' | string;
  branch_name: string;
  price: number;
  down_payment: number;
  duration_days: number;
  departure_date: string;
  departure_city: string;
  quota: number;
  registered_count: number;
  hotel_makkah: string;
  hotel_madinah: string;
  airline: string;
  facilities_included: string[];
  facilities_excluded: string[];
  description: string;
  created_at?: string;
}

const PACKAGES_FILE = path.join(process.cwd(), 'src', 'data', 'packages.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): PackageItem[] {
  try {
    if (!fs.existsSync(PACKAGES_FILE)) return [];
    const raw = fs.readFileSync(PACKAGES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading packages.json:', err);
    return [];
  }
}

function writeData(data: PackageItem[]) {
  try {
    const dir = path.dirname(PACKAGES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing packages.json:', err);
  }
}

function derivePackageCode(name: string, duration: number): string {
  const clean = name.toLowerCase();
  if (clean.includes('haji plus')) return 'PKG-HAJP';
  if (clean.includes('haji')) return 'PKG-HAJ';
  if (clean.includes('turki')) return 'PKG-UMR12';
  if (clean.includes('akhir')) return 'PKG-UMRA';
  return `PKG-UMR${duration || 9}`;
}

function derivePackageType(name: string): string {
  const clean = name.toLowerCase();
  if (clean.includes('haji plus')) return 'Haji Plus';
  if (clean.includes('haji')) return 'Haji';
  return 'Umroh';
}

export async function getPackagesList(): Promise<PackageItem[]> {
  const local = readData();
  const supabase = getServiceSupabase();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        registrations:registrations(count)
      `)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return local;
    }

    // Merge Supabase active rows with local enriched details
    const merged: PackageItem[] = data.map((d: any) => {
      const match = local.find(
        (l) => l.id === d.id || l.name?.toLowerCase().trim() === d.name?.toLowerCase().trim()
      );
      const regCount = d.registrations?.[0]?.count ?? (match?.registered_count || 0);

      return {
        id: d.id,
        code: match?.code || derivePackageCode(d.name || '', d.duration_days),
        name: d.name,
        type: match?.type || derivePackageType(d.name || ''),
        status: match?.status || 'Dibuka',
        branch_name: match?.branch_name || 'Kantor Pusat Jakarta',
        price: Number(d.price) || 0,
        down_payment: match?.down_payment || Math.min(5000000, Number(d.price) * 0.2),
        duration_days: d.duration_days || match?.duration_days || 9,
        departure_date: d.departure_date || match?.departure_date || '2026-12-10',
        departure_city: match?.departure_city || 'Jakarta',
        quota: d.quota || match?.quota || 45,
        registered_count: regCount,
        hotel_makkah: match?.hotel_makkah || 'Swissôtel Al Maqam Makkah',
        hotel_madinah: match?.hotel_madinah || 'Anwar Al Madinah Mövenpick',
        airline: match?.airline || 'Saudi Arabian Airlines',
        facilities_included: match?.facilities_included || [
          'Tiket pesawat PP',
          'Hotel bintang 4/5',
          'Visa & manasik',
          'Makan 3x sehari',
          'Bus AC',
        ],
        facilities_excluded: match?.facilities_excluded || [
          'Pengeluaran pribadi',
          'Kelebihan bagasi',
          'Vaksin',
        ],
        description: d.description || match?.description || 'Paket perjalanan ibadah dengan bimbingan muthawif berpengalaman.',
        created_at: d.created_at,
      };
    });

    return merged;
  } catch (err) {
    console.warn('Supabase packages fetch failed, using local:', err);
    return local;
  }
}

export async function getPackageDetail(idOrSlug: string): Promise<PackageItem | null> {
  const packages = await getPackagesList();
  // Support finding by id, index (e.g. /packages/1 matches first package if not found), or code
  let found = packages.find((p) => p.id === idOrSlug || p.code?.toLowerCase() === idOrSlug.toLowerCase());
  if (!found) {
    if (idOrSlug.toLowerCase().startsWith('pkg-')) {
      const suffix = parseInt(idOrSlug.toLowerCase().replace('pkg-', ''), 10);
      if (!isNaN(suffix) && suffix > 0 && suffix <= packages.length) {
        found = packages[suffix - 1];
      }
    }
    if (!found) {
      const num = parseInt(idOrSlug, 10);
      if (!isNaN(num) && num > 0 && num <= packages.length) {
        found = packages[num - 1];
      }
    }
  }
  return found || null;
}

export async function savePackage(payload: {
  id?: string;
  name: string;
  code?: string;
  type: string;
  status: string;
  branch_name: string;
  price: number;
  down_payment?: number;
  duration_days: number;
  departure_date: string;
  departure_city: string;
  quota: number;
  hotel_makkah: string;
  hotel_madinah: string;
  airline: string;
  facilities_included: string[];
  facilities_excluded: string[];
  description: string;
}): Promise<{ success: boolean; data?: PackageItem; error?: string }> {
  try {
    const isNew = !payload.id || payload.id === 'create';
    const id = isNew ? `pkg-${Date.now()}` : payload.id!;
    const code = payload.code || derivePackageCode(payload.name, payload.duration_days);

    const packageItem: PackageItem = {
      ...payload,
      id,
      code,
      down_payment: payload.down_payment || 5000000,
      registered_count: 0,
      created_at: new Date().toISOString(),
    };

    const supabase = getServiceSupabase();
    if (supabase) {
      try {
        if (isNew) {
          const { data } = await supabase.from('packages').insert({
            name: packageItem.name,
            description: packageItem.description,
            price: packageItem.price,
            duration_days: packageItem.duration_days,
            departure_date: packageItem.departure_date,
            quota: packageItem.quota,
          }).select().single();
          if (data?.id) packageItem.id = data.id;
        } else {
          await supabase.from('packages').update({
            name: packageItem.name,
            description: packageItem.description,
            price: packageItem.price,
            duration_days: packageItem.duration_days,
            departure_date: packageItem.departure_date,
            quota: packageItem.quota,
          }).eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase package save warning:', err);
      }
    }

    const local = readData();
    const idx = local.findIndex((l) => l.id === id);
    if (idx !== -1) {
      packageItem.registered_count = local[idx].registered_count;
      local[idx] = packageItem;
    } else {
      local.push(packageItem);
    }
    writeData(local);

    try {
      revalidatePath('/packages');
      revalidatePath(`/packages/${id}`);
      revalidatePath('/dashboard/superadmin/packages');
    } catch {}

    return { success: true, data: packageItem };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan paket' };
  }
}

export async function deletePackage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      try {
        await supabase.from('packages').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase package delete error:', err);
      }
    }

    const local = readData().filter((l) => l.id !== id);
    writeData(local);

    try {
      revalidatePath('/packages');
      revalidatePath('/dashboard/superadmin/packages');
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus paket' };
  }
}

// Keep backwards-compatibility for existing imports
export async function getPackages() {
  return getPackagesList();
}
export async function createPackage(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string) || 0;
  const duration_days = parseInt(formData.get('duration_days') as string) || 9;
  const departure_date = formData.get('departure_date') as string;
  const quota = parseInt(formData.get('quota') as string) || 0;

  return savePackage({
    name,
    description,
    price,
    duration_days,
    departure_date,
    quota,
    type: derivePackageType(name),
    status: 'Dibuka',
    branch_name: 'Kantor Pusat Jakarta',
    departure_city: 'Jakarta',
    hotel_makkah: 'Swissôtel Al Maqam Makkah',
    hotel_madinah: 'Anwar Al Madinah Mövenpick',
    airline: 'Saudi Arabian Airlines',
    facilities_included: ['Tiket pesawat PP', 'Hotel bintang 4/5', 'Visa & manasik'],
    facilities_excluded: ['Pengeluaran pribadi'],
  });
}
export async function updatePackage(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string) || 0;
  const duration_days = parseInt(formData.get('duration_days') as string) || 9;
  const departure_date = formData.get('departure_date') as string;
  const quota = parseInt(formData.get('quota') as string) || 0;

  return savePackage({
    id,
    name,
    description,
    price,
    duration_days,
    departure_date,
    quota,
    type: derivePackageType(name),
    status: 'Dibuka',
    branch_name: 'Kantor Pusat Jakarta',
    departure_city: 'Jakarta',
    hotel_makkah: 'Swissôtel Al Maqam Makkah',
    hotel_madinah: 'Anwar Al Madinah Mövenpick',
    airline: 'Saudi Arabian Airlines',
    facilities_included: ['Tiket pesawat PP', 'Hotel bintang 4/5', 'Visa & manasik'],
    facilities_excluded: ['Pengeluaran pribadi'],
  });
}
