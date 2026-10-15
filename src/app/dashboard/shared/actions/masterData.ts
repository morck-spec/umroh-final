'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export type Hotel = {
  id: string;
  name: string;
  city: 'Mekah' | 'Madinah';
  stars: number;
  distance_m: number | null;
  is_active: boolean;
  description?: string;
  created_at?: string;
};

export type Airline = {
  id: string;
  name: string;
  code: string;
  transit: string | null;
  is_active: boolean;
  created_at?: string;
};

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

const HOTELS_FILE = path.join(process.cwd(), 'src', 'data', 'hotels.json');
const AIRLINES_FILE = path.join(process.cwd(), 'src', 'data', 'airlines.json');
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

/* ---------------- HOTELS ---------------- */

export async function getHotels(q = '', city = ''): Promise<{ data: Hotel[]; source: 'supabase' | 'local'; error?: string }> {
  const adminSupabase = getServiceSupabase();
  let supabaseData: Hotel[] | null = null;

  if (adminSupabase) {
    try {
      let query = adminSupabase.from('hotels').select('*').order('created_at', { ascending: false });
      if (q) query = query.ilike('name', `%${q}%`);
      if (city) query = query.eq('city', city);
      const { data, error } = await query;
      if (!error && data) {
        supabaseData = data as Hotel[];
      }
    } catch {
      // Fallback
    }
  }

  if (supabaseData) {
    writeLocalJson(HOTELS_FILE, supabaseData);
    return { data: supabaseData, source: 'supabase' };
  }

  let localData = readLocalJson<Hotel>(HOTELS_FILE, []);
  if (q) {
    const lower = q.toLowerCase();
    localData = localData.filter((h) => h.name.toLowerCase().includes(lower));
  }
  if (city) {
    localData = localData.filter((h) => h.city === city);
  }
  return { data: localData, source: 'local' };
}

export async function getHotelDetail(id: string): Promise<Hotel | null> {
  const { data } = await getHotels();
  return data.find((h) => h.id === id) || null;
}

function hotelPayload(fd: FormData) {
  const distance = fd.get('distance_m') as string;
  const description = fd.get('description') as string;
  const rawCity = String(fd.get('city') || 'Mekah');
  const city: 'Mekah' | 'Madinah' = rawCity === 'Madinah' ? 'Madinah' : 'Mekah';

  return {
    name: String(fd.get('name') || '').trim(),
    city,
    stars: Number(fd.get('stars') || fd.get('star') || 3),
    distance_m: distance ? Number(distance) : null,
    is_active: fd.get('is_active') === 'on' || fd.get('is_active') === '1' || fd.get('is_active') === 'true',
    description: description ? description.trim() : undefined,
  };
}

export async function saveHotel(id: string | null, fd: FormData): Promise<Result> {
  const payload = hotelPayload(fd);
  if (!payload.name) return { error: 'Nama hotel wajib diisi' };

  let savedSupabase = false;
  let finalId = id;
  const adminSupabase = getServiceSupabase();

  if (adminSupabase) {
    try {
      if (id && !id.startsWith('h-')) {
        const { data, error } = await adminSupabase.from('hotels').update(payload).eq('id', id).select();
        if (!error && data && data.length > 0) {
          savedSupabase = true;
          finalId = data[0].id;
        }
      } else {
        const { data, error } = await adminSupabase.from('hotels').insert(payload).select();
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
    finalId = `h-${Date.now()}`;
  }

  const current = readLocalJson<Hotel>(HOTELS_FILE, []);
  const idx = current.findIndex((h) => h.id === (id || finalId));
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...payload, id: finalId };
  } else {
    current.unshift({ id: finalId, ...payload, created_at: new Date().toISOString() });
  }
  writeLocalJson(HOTELS_FILE, current);

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/superadmin/hotels');
  revalidatePath('/hotels');

  return { success: true, source: savedSupabase ? 'supabase' : 'local', id: finalId };
}

export async function deleteHotel(id: string): Promise<Result> {
  const adminSupabase = getServiceSupabase();
  if (adminSupabase && !id.startsWith('h-')) {
    try {
      await adminSupabase.from('hotels').delete().eq('id', id);
    } catch {
      // Proceed
    }
  }

  const current = readLocalJson<Hotel>(HOTELS_FILE, []);
  const updated = current.filter((h) => h.id !== id);
  writeLocalJson(HOTELS_FILE, updated);

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/superadmin/hotels');
  revalidatePath('/hotels');

  return { success: true };
}

/* ---------------- AIRLINES ---------------- */

export async function getAirlines(q = ''): Promise<{ data: Airline[]; source: 'supabase' | 'local'; error?: string }> {
  const adminSupabase = getServiceSupabase();
  let supabaseData: Airline[] | null = null;

  if (adminSupabase) {
    try {
      let query = adminSupabase.from('airlines').select('*').order('created_at', { ascending: false });
      if (q) query = query.ilike('name', `%${q}%`);
      const { data, error } = await query;
      if (!error && data) {
        supabaseData = data as Airline[];
      }
    } catch {
      // Fallback
    }
  }

  if (supabaseData) {
    writeLocalJson(AIRLINES_FILE, supabaseData);
    return { data: supabaseData, source: 'supabase' };
  }

  let localData = readLocalJson<Airline>(AIRLINES_FILE, []);
  if (q) {
    const lower = q.toLowerCase();
    localData = localData.filter((a) => a.name.toLowerCase().includes(lower) || a.code.toLowerCase().includes(lower));
  }
  return { data: localData, source: 'local' };
}

export async function getAirlineDetail(id: string): Promise<Airline | null> {
  const { data } = await getAirlines();
  return data.find((a) => a.id === id || a.code?.toLowerCase() === id.toLowerCase()) || null;
}

export async function saveAirline(id: string | null, fd: FormData): Promise<Result> {
  const payload = {
    name: String(fd.get('name') || '').trim(),
    code: String(fd.get('code') || '').trim().toUpperCase(),
    transit: String(fd.get('transit') || '').trim() || 'Langsung',
    is_active: fd.get('is_active') === 'on' || fd.get('is_active') === '1' || fd.get('is_active') === 'true',
  };
  if (!payload.name) return { error: 'Nama maskapai wajib diisi' };
  if (!payload.code) return { error: 'Kode maskapai wajib diisi' };

  let savedSupabase = false;
  let finalId = id;
  const adminSupabase = getServiceSupabase();

  if (adminSupabase) {
    try {
      if (id && !id.startsWith('a-')) {
        const { data, error } = await adminSupabase.from('airlines').update(payload).eq('id', id).select();
        if (!error && data && data.length > 0) {
          savedSupabase = true;
          finalId = data[0].id;
        }
      } else {
        const { data, error } = await adminSupabase.from('airlines').insert(payload).select();
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
    finalId = `a-${Date.now()}`;
  }

  const current = readLocalJson<Airline>(AIRLINES_FILE, []);
  const idx = current.findIndex((a) => a.id === (id || finalId));
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...payload, id: finalId };
  } else {
    current.unshift({ id: finalId, ...payload, created_at: new Date().toISOString() });
  }
  writeLocalJson(AIRLINES_FILE, current);

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/superadmin/airlines');
  revalidatePath('/airlines');

  return { success: true, source: savedSupabase ? 'supabase' : 'local', id: finalId };
}

export async function deleteAirline(id: string): Promise<Result> {
  const adminSupabase = getServiceSupabase();
  if (adminSupabase && !id.startsWith('a-')) {
    try {
      await adminSupabase.from('airlines').delete().eq('id', id);
    } catch {
      // Proceed
    }
  }

  const current = readLocalJson<Airline>(AIRLINES_FILE, []);
  const updated = current.filter((a) => a.id !== id);
  writeLocalJson(AIRLINES_FILE, updated);

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/superadmin/airlines');
  revalidatePath('/airlines');

  return { success: true };
}

/* ---------------- BANK ACCOUNTS ---------------- */

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
