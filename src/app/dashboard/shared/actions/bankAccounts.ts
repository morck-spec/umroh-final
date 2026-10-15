'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export type BankAccount = {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  branch_name?: string | null;
  branch_id?: string | null;
  branch_office?: string | null;
  is_active: boolean;
  created_at?: string;
};

type Result = { success?: boolean; error?: string; source?: 'supabase' | 'local'; id?: string };

const BANK_ACCOUNTS_FILE = path.join(process.cwd(), 'src', 'data', 'bank_accounts.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readLocalJson<T>(filePath: string, fallback: T[] = []): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeLocalJson<T>(filePath: string, data: T[]) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

export async function getBankAccounts(q = ''): Promise<{ data: BankAccount[]; source: 'supabase' | 'local'; error?: string }> {
  const adminSupabase = getServiceSupabase();
  let supabaseData: BankAccount[] | null = null;

  if (adminSupabase) {
    try {
      let query = adminSupabase.from('bank_accounts').select('*').order('created_at', { ascending: false });
      if (q) query = query.ilike('bank_name', `%${q}%`);
      const { data, error } = await query;
      if (!error && data) {
        supabaseData = data as BankAccount[];
      }
    } catch {
      // Fallback
    }
  }

  if (supabaseData) {
    writeLocalJson(BANK_ACCOUNTS_FILE, supabaseData);
    return { data: supabaseData, source: 'supabase' };
  }

  let localData = readLocalJson<BankAccount>(BANK_ACCOUNTS_FILE, []);
  if (q) {
    const lower = q.toLowerCase();
    localData = localData.filter((b) => b.bank_name.toLowerCase().includes(lower) || b.account_number.includes(lower));
  }
  return { data: localData, source: 'local' };
}

export async function getBankAccountDetail(id: string): Promise<BankAccount | null> {
  const { data } = await getBankAccounts();
  return data.find((b) => b.id === id) || null;
}

export async function saveBankAccount(id: string | null, fd: FormData): Promise<Result> {
  const payload = {
    bank_name: String(fd.get('bank_name') || '').trim(),
    account_number: String(fd.get('account_number') || '').trim(),
    account_holder: String(fd.get('account_holder') || '').trim(),
    branch_name: String(fd.get('branch_name') || 'Kantor Pusat Jakarta').trim(),
    branch_office: String(fd.get('branch_office') || '').trim() || null,
    is_active: fd.get('is_active') === 'on' || fd.get('is_active') === '1' || fd.get('is_active') === 'true',
  };

  if (!payload.bank_name) return { error: 'Nama bank wajib diisi' };
  if (!payload.account_number) return { error: 'Nomor rekening wajib diisi' };
  if (!payload.account_holder) return { error: 'Atas nama pemilik rekening wajib diisi' };

  let savedSupabase = false;
  let finalId = id;
  const adminSupabase = getServiceSupabase();

  if (adminSupabase) {
    try {
      if (id && !id.startsWith('b-')) {
        const { data, error } = await adminSupabase.from('bank_accounts').update(payload).eq('id', id).select();
        if (!error && data && data.length > 0) {
          savedSupabase = true;
          finalId = data[0].id;
        }
      } else {
        const { data, error } = await adminSupabase.from('bank_accounts').insert(payload).select();
        if (!error && data && data.length > 0) {
          savedSupabase = true;
          finalId = data[0].id;
        }
      }
    } catch {
      savedSupabase = false;
    }
  }

  if (!finalId) {
    finalId = `b-${Date.now()}`;
  }

  const current = readLocalJson<BankAccount>(BANK_ACCOUNTS_FILE, []);
  const idx = current.findIndex((b) => b.id === (id || finalId));
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...payload, id: finalId };
  } else {
    current.unshift({ id: finalId, ...payload, created_at: new Date().toISOString() });
  }
  writeLocalJson(BANK_ACCOUNTS_FILE, current);

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/superadmin/bank-accounts');
  revalidatePath('/bank-accounts');

  return { success: true, source: savedSupabase ? 'supabase' : 'local', id: finalId };
}

export async function deleteBankAccount(id: string): Promise<Result> {
  const adminSupabase = getServiceSupabase();
  if (adminSupabase && !id.startsWith('b-')) {
    try {
      await adminSupabase.from('bank_accounts').delete().eq('id', id);
    } catch {
      // Proceed
    }
  }

  const current = readLocalJson<BankAccount>(BANK_ACCOUNTS_FILE, []);
  const updated = current.filter((b) => b.id !== id);
  writeLocalJson(BANK_ACCOUNTS_FILE, updated);

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/superadmin/bank-accounts');
  revalidatePath('/bank-accounts');

  return { success: true };
}
