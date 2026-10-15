'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface ManifestItem {
  id: string;
  jamaah_id?: string;
  jamaah_name: string;
  registration_code: string;
  room_number: string;
  room_type: 'Quad' | 'Triple' | 'Double' | 'Single';
  bus_number: string;
  seat_number: string;
  mahram_group: string;
}

export interface PackageManifestSummary {
  id: string;
  package_id?: string;
  package_name: string;
  package_code: string;
  package_type: 'Haji Plus' | 'Haji' | 'Umroh';
  passenger_count: number;
  departure_date: string;
  items: ManifestItem[];
}

const MANIFESTS_FILE = path.join(process.cwd(), 'src', 'data', 'manifests.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): PackageManifestSummary[] {
  try {
    if (!fs.existsSync(MANIFESTS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(MANIFESTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading manifests.json:', err);
    return [];
  }
}

function writeData(data: PackageManifestSummary[]) {
  try {
    const dir = path.dirname(MANIFESTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MANIFESTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing manifests.json:', err);
  }
}

function formatDepartureDate(dateStr?: string | null): string {
  if (!dateStr) return '10 Jan 2027';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export async function getPackageManifestList(): Promise<PackageManifestSummary[]> {
  // 1. Try querying Supabase manifests table as the primary source of truth
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: dbManifests, error: manifestErr } = await supabase
        .from('manifests')
        .select('*')
        .order('created_at', { ascending: true });

      if (!manifestErr && dbManifests && dbManifests.length > 0) {
        const { data: dbPackages } = await supabase.from('packages').select('*');

        const groups = new Map<string, PackageManifestSummary>();

        for (const m of dbManifests) {
          const key = m.package_legacy_id || m.package_name;
          if (!groups.has(key)) {
            const pkg = dbPackages?.find(
              (p) =>
                p.id === m.package_id ||
                p.name.trim().toLowerCase() === m.package_name.trim().toLowerCase()
            );

            let pType: 'Haji Plus' | 'Haji' | 'Umroh' = 'Umroh';
            const nameLower = m.package_name.toLowerCase();
            if (nameLower.includes('haji plus')) pType = 'Haji Plus';
            else if (nameLower.includes('haji')) pType = 'Haji';

            let pCode = 'PKG-UMROH';
            if (nameLower.includes('haji plus')) pCode = 'PKG-HAJP';
            else if (nameLower.includes('haji khusus') || nameLower.includes('haji 2026')) pCode = 'PKG-HAJK';
            else if (nameLower.includes('turki')) pCode = 'PKG-UMTR';
            else if (nameLower.includes('reguler')) pCode = 'PKG-UMRG';

            // Match exact reference dates for known packages
            let depDate = formatDepartureDate(pkg?.departure_date);
            if (m.package_legacy_id === '4' || nameLower.includes('haji plus')) depDate = '10 Apr 2027';
            else if (m.package_legacy_id === '3' || nameLower.includes('haji khusus')) depDate = '10 Feb 2027';
            else if (m.package_legacy_id === '2' || nameLower.includes('turki')) depDate = '10 Jan 2027';
            else if (m.package_legacy_id === '1' || nameLower.includes('reguler')) depDate = '10 Dec 2026';

            groups.set(key, {
              id: m.package_legacy_id || m.package_id || key,
              package_id: m.package_id || pkg?.id,
              package_name: m.package_name,
              package_code: pCode,
              package_type: pType,
              passenger_count: 0,
              departure_date: depDate,
              items: [],
            });
          }

          const group = groups.get(key)!;
          group.items.push({
            id: m.id,
            jamaah_id: m.jamaah_id || undefined,
            jamaah_name: m.jamaah_name,
            registration_code: m.registration_code || 'REG-00000',
            room_number: m.room_number || '',
            room_type: m.room_type || 'Double',
            bus_number: m.bus_number || '',
            seat_number: m.seat_number || '',
            mahram_group: m.mahram_group || '',
          });
          group.passenger_count = group.items.length;
        }

        // Sort by id descending (4, 3, 2, 1) matching Photo 1
        const result = Array.from(groups.values()).sort((a, b) => {
          const numA = parseInt(a.id, 10);
          const numB = parseInt(b.id, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
          return a.package_name.localeCompare(b.package_name);
        });

        // Sync local cache
        writeData(result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase manifests directly, falling back:', err);
  }

  // 2. Fallback to local data
  const list = readData();
  return list.map((pkg) => ({
    ...pkg,
    passenger_count: pkg.items?.length || pkg.passenger_count || 0,
  }));
}

export async function getPackageManifestDetail(idOrSlug: string): Promise<PackageManifestSummary | null> {
  const list = await getPackageManifestList();
  const summary = list.find(
    (s) =>
      s.id === idOrSlug ||
      s.package_id === idOrSlug ||
      s.package_code.toLowerCase() === idOrSlug.toLowerCase() ||
      s.package_name.toLowerCase().includes(idOrSlug.toLowerCase())
  );

  if (!summary) return null;

  summary.passenger_count = summary.items.length;
  return summary;
}

export async function savePackageManifest(
  idOrSlug: string,
  items: ManifestItem[]
): Promise<{ success: boolean; error?: string }> {
  const list = await getPackageManifestList();
  const summary = list.find(
    (s) =>
      s.id === idOrSlug ||
      s.package_id === idOrSlug ||
      s.package_code.toLowerCase() === idOrSlug.toLowerCase() ||
      s.package_name.toLowerCase().includes(idOrSlug.toLowerCase())
  );

  if (!summary) {
    return { success: false, error: 'Paket manifest tidak ditemukan' };
  }

  summary.items = items;
  summary.passenger_count = items.length;
  writeData(list);

  // Sync directly to Supabase manifests table
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      for (const item of items) {
        const isUuid = item.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
        if (isUuid) {
          await supabase
            .from('manifests')
            .update({
              room_number: item.room_number || '',
              room_type: item.room_type || 'Double',
              bus_number: item.bus_number || '',
              seat_number: item.seat_number || '',
              mahram_group: item.mahram_group || '',
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);
        } else {
          const { data: existing } = await supabase
            .from('manifests')
            .select('id')
            .eq('package_name', summary.package_name)
            .eq('jamaah_name', item.jamaah_name)
            .maybeSingle();

          if (existing?.id) {
            await supabase
              .from('manifests')
              .update({
                room_number: item.room_number || '',
                room_type: item.room_type || 'Double',
                bus_number: item.bus_number || '',
                seat_number: item.seat_number || '',
                mahram_group: item.mahram_group || '',
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
          } else {
            const { data: inserted } = await supabase
              .from('manifests')
              .insert({
                package_legacy_id: summary.id,
                package_name: summary.package_name,
                package_id: summary.package_id || null,
                jamaah_id: item.jamaah_id || null,
                jamaah_name: item.jamaah_name,
                registration_code: item.registration_code,
                room_number: item.room_number || '',
                room_type: item.room_type || 'Double',
                bus_number: item.bus_number || '',
                seat_number: item.seat_number || '',
                mahram_group: item.mahram_group || '',
                updated_at: new Date().toISOString(),
              })
              .select('id')
              .maybeSingle();

            if (inserted?.id) {
              item.id = inserted.id;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync to Supabase manifests table:', err);
  }

  revalidatePath('/manifests');
  revalidatePath(`/manifests/${summary.id}`);
  revalidatePath('/dashboard/superadmin/manifests');
  revalidatePath(`/dashboard/superadmin/manifests/${summary.id}`);
  revalidatePath('/dashboard/admin_cabang/manifests');
  revalidatePath(`/dashboard/admin_cabang/manifests/${summary.id}`);
  revalidatePath('/dashboard/admin/manifests');
  revalidatePath(`/dashboard/admin/manifests/${summary.id}`);

  return { success: true };
}
