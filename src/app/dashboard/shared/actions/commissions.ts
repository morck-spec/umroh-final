'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface CommissionItem {
  id: string;
  legacy_id?: string;
  agent_name: string;
  jamaah_name: string;
  package_name: string;
  base_amount: number;
  rate: number;
  commission_amount: number;
  status: 'Menunggu' | 'Disetujui' | 'Dibayar' | 'Dibatalkan';
}

export interface CommissionStats {
  menunggu: { total: number; count: number };
  disetujui: { total: number; count: number };
  dibayar: { total: number; count: number };
  dibatalkan: { total: number; count: number };
}

const COMMISSIONS_FILE = path.join(process.cwd(), 'src', 'data', 'commissions.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): CommissionItem[] {
  try {
    if (!fs.existsSync(COMMISSIONS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(COMMISSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading commissions.json:', err);
    return [];
  }
}

function writeData(data: CommissionItem[]) {
  try {
    const dir = path.dirname(COMMISSIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(COMMISSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing commissions.json:', err);
  }
}

export async function getCommissionList(): Promise<CommissionItem[]> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: dbItems, error } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && dbItems && dbItems.length > 0) {
        const list: CommissionItem[] = dbItems.map((item) => ({
          id: item.id,
          legacy_id: item.legacy_id,
          agent_name: item.agent_name,
          jamaah_name: item.jamaah_name,
          package_name: item.package_name,
          base_amount: Number(item.base_amount) || 0,
          rate: Number(item.rate) || 0,
          commission_amount: Number(item.commission_amount) || 0,
          status: item.status || 'Menunggu',
        }));

        writeData(list);
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase commissions table:', err);
  }

  // Fallback to local JSON
  return readData();
}

export async function updateCommissionStatus(
  id: string,
  newStatus: CommissionItem['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase
          .from('commissions')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } else {
        await supabase
          .from('commissions')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('legacy_id', id);
      }
    }

    // Update local cache
    const list = readData();
    const idx = list.findIndex((item) => item.id === id || item.legacy_id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      writeData(list);
    }

    revalidatePath('/commissions');
    revalidatePath('/dashboard/superadmin/commissions');
    revalidatePath('/dashboard/admin_cabang/commissions');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating commission status:', err);
    return { success: false, error: err.message || 'Gagal mengubah status komisi' };
  }
}
