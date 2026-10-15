'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  contact_number: string;
  email: string;
  is_headquarters: boolean;
  status: 'Aktif' | 'Nonaktif';
  created_at?: string;
}

const BRANCHES_FILE = path.join(process.cwd(), 'src', 'data', 'branches.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): BranchItem[] {
  try {
    if (!fs.existsSync(BRANCHES_FILE)) return [];
    const raw = fs.readFileSync(BRANCHES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading branches.json:', err);
    return [];
  }
}

function writeData(data: BranchItem[]) {
  try {
    const dir = path.dirname(BRANCHES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BRANCHES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing branches.json:', err);
  }
}

function generateBranchCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (clean.length >= 3) return clean.slice(0, 3);
  return (clean + 'BRN').slice(0, 3);
}

export async function getBranchesList(): Promise<BranchItem[]> {
  const local = readData();
  const supabase = getServiceSupabase();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return local;
    }

    // Merge Supabase data with local metadata (city, is_headquarters, code)
    const merged: BranchItem[] = data.map((d: any, idx: number) => {
      const match = local.find((l) => l.id === d.id || l.name?.toLowerCase() === d.name?.toLowerCase());
      const isHeadquarters = match ? match.is_headquarters : idx === 0 || d.name?.toLowerCase().includes('pusat');
      return {
        id: d.id,
        code: match?.code || generateBranchCode(d.name || 'Cabang'),
        name: d.name,
        city: match?.city || (d.address ? d.address.split(',')[0].trim() : 'Jakarta'),
        address: d.address || match?.address || '',
        contact_number: d.contact_number || match?.contact_number || '-',
        email: match?.email || `${(d.name || 'cabang').toLowerCase().replace(/\s+/g, '')}@example.com`,
        is_headquarters: isHeadquarters,
        status: match?.status || 'Aktif',
        created_at: d.created_at,
      };
    });

    return merged;
  } catch (err) {
    console.warn('Supabase branches fetch failed, using local:', err);
    return local;
  }
}

export async function getBranchDetail(id: string): Promise<BranchItem | null> {
  const branches = await getBranchesList();
  let found = branches.find((b) => b.id === id || b.code?.toLowerCase() === id.toLowerCase());
  if (!found) {
    const num = parseInt(id, 10);
    if (!isNaN(num) && num > 0 && num <= branches.length) {
      found = branches[num - 1];
    }
  }
  return found || null;
}

export async function saveBranch(payload: {
  id?: string;
  code: string;
  name: string;
  city: string;
  address: string;
  contact_number: string;
  email: string;
  is_headquarters: boolean;
  status: 'Aktif' | 'Nonaktif';
}): Promise<{ success: boolean; data?: BranchItem; error?: string }> {
  try {
    const isNew = !payload.id || payload.id === 'create';
    const id = isNew ? `branch-${Date.now()}` : payload.id!;
    const branchItem: BranchItem = {
      ...payload,
      id,
      created_at: new Date().toISOString(),
    };

    const supabase = getServiceSupabase();
    if (supabase) {
      try {
        if (isNew) {
          const { data } = await supabase.from('branches').insert({
            name: branchItem.name,
            address: branchItem.address,
            contact_number: branchItem.contact_number,
          }).select().single();
          if (data?.id) branchItem.id = data.id;
        } else {
          await supabase.from('branches').update({
            name: branchItem.name,
            address: branchItem.address,
            contact_number: branchItem.contact_number,
          }).eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase branch save warning:', err);
      }
    }

    const local = readData();
    const idx = local.findIndex((l) => l.id === id);
    if (idx !== -1) {
      local[idx] = branchItem;
    } else {
      local.push(branchItem);
    }
    writeData(local);

    try {
      revalidatePath('/branches');
      revalidatePath('/dashboard/superadmin/branches');
    } catch {}

    return { success: true, data: branchItem };
  } catch (err: any) {
    console.error('Error saving branch:', err);
    return { success: false, error: err.message || 'Gagal menyimpan cabang' };
  }
}

export async function deleteBranch(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      try {
        await supabase.from('branches').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase branch delete error:', err);
      }
    }

    const local = readData().filter((l) => l.id !== id);
    writeData(local);

    try {
      revalidatePath('/branches');
      revalidatePath('/dashboard/superadmin/branches');
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus cabang' };
  }
}
