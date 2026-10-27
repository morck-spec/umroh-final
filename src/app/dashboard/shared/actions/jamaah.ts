'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export interface JamaahItem {
  id: string;
  legacy_id?: string;
  code: string;
  full_name: string;
  gender: 'Laki-laki' | 'Perempuan' | 'L' | 'P';
  nik?: string;
  phone?: string;
  email?: string;
  birth_place?: string;
  birth_date?: string;
  blood_type?: string;
  city?: string;
  address?: string;
  passport_number?: string;
  passport_issued_place?: string;
  passport_issued_date?: string;
  passport_expiry_date?: string;
  passport_expiry_formatted?: string;
  branch_id?: string | null;
  branch_name?: string;
  agent_name?: string;
  mahram_name?: string;
  mahram_relation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact?: string;
  health_notes?: string;
  is_active?: boolean;
  status?: string;
  account_login?: string;
  document_count?: number;
  profiles?: { full_name: string; role?: string };
  branches?: { name: string };
  profile_id?: string | null;
  created_at?: string;
}

const JAMAAH_FILE = path.join(process.cwd(), 'src', 'data', 'jamaah.json');

function readJamaahFile(): JamaahItem[] {
  try {
    if (!fs.existsSync(JAMAAH_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(JAMAAH_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading jamaah.json:', err);
    return [];
  }
}

function writeJamaahFile(data: JamaahItem[]): void {
  try {
    const dir = path.dirname(JAMAAH_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(JAMAAH_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing jamaah.json:', err);
  }
}

function formatExpiryDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Exp ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export async function getJamaah(): Promise<JamaahItem[]> {
  const fileItems = readJamaahFile();

  try {
    const supabase = await createClient();
    const { data: dbData, error } = await supabase
      .from('jamaah')
      .select(`
        *,
        profiles(full_name, role),
        branches(name)
      `)
      .order('created_at', { ascending: false });

    if (!error && dbData && dbData.length > 0) {
      return dbData.map((dbItem: any, idx: number) => {
        // Enriched details if matches local file
        const matchLocal = fileItems.find(
          (f) => f.id === dbItem.id || f.full_name?.toLowerCase().trim() === dbItem.full_name?.toLowerCase().trim()
        );

        return {
          id: dbItem.id,
          legacy_id: matchLocal?.legacy_id,
          code: matchLocal?.code || `JM-${String(idx + 1).padStart(4, '0')}`,
          full_name: dbItem.full_name || dbItem.profiles?.full_name || 'Tanpa Nama',
          gender: (dbItem.gender === 'P' || dbItem.gender === 'Perempuan' || matchLocal?.gender === 'Perempuan') ? 'Perempuan' : 'Laki-laki',
          nik: dbItem.nik || matchLocal?.nik || '',
          phone: dbItem.phone || matchLocal?.phone || '',
          email: matchLocal?.email || '',
          birth_place: matchLocal?.birth_place || '',
          birth_date: dbItem.birth_date || matchLocal?.birth_date || '',
          blood_type: matchLocal?.blood_type || '',
          city: matchLocal?.city || '',
          address: matchLocal?.address || '',
          passport_number: matchLocal?.passport_number || '',
          passport_issued_place: matchLocal?.passport_issued_place || '',
          passport_issued_date: matchLocal?.passport_issued_date || '',
          passport_expiry_date: matchLocal?.passport_expiry_date || '',
          passport_expiry_formatted: matchLocal?.passport_expiry_formatted || (matchLocal?.passport_expiry_date ? formatExpiryDate(matchLocal.passport_expiry_date) : '-'),
          branch_id: dbItem.branch_id || matchLocal?.branch_id || null,
          branch_name: dbItem.branches?.name || matchLocal?.branch_name || 'Kantor Pusat Jakarta',
          agent_name: matchLocal?.agent_name || '-',
          mahram_name: matchLocal?.mahram_name || '-',
          mahram_relation: matchLocal?.mahram_relation || '-',
          emergency_contact_name: matchLocal?.emergency_contact_name || dbItem.emergency_contact || '-',
          emergency_contact_phone: matchLocal?.emergency_contact_phone || '',
          emergency_contact: dbItem.emergency_contact || matchLocal?.emergency_contact || '',
          health_notes: matchLocal?.health_notes || '',
          is_active: matchLocal?.is_active ?? true,
          status: matchLocal?.status || 'Aktif',
          account_login: (dbItem.profile_id || matchLocal?.account_login === 'Aktif') ? 'Aktif' : 'Belum Ada Akun',
          document_count: matchLocal?.document_count ?? 0,
          profiles: dbItem.profiles,
          branches: dbItem.branches,
          profile_id: dbItem.profile_id,
          created_at: dbItem.created_at,
        };
      });
    }
  } catch (err) {
    // If supabase fails, rely purely on local json file
  }

  return fileItems;
}

export async function getJamaahDetail(id: string): Promise<JamaahItem | null> {
  const all = await getJamaah();
  const match = all.find((j) => j.id === id || j.legacy_id === id || j.code === id);
  return match || null;
}

export async function getBranches() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('branches').select('id, name');
    if (data && data.length > 0) return data;
  } catch {
    // fallback
  }

  const branchesPath = path.join(process.cwd(), 'src', 'data', 'branches.json');
  if (fs.existsSync(branchesPath)) {
    try {
      const raw = fs.readFileSync(branchesPath, 'utf-8');
      const parsed = JSON.parse(raw);
      return [
        { id: 'pusat', name: 'Kantor Pusat Jakarta' },
        ...parsed.map((b: any) => ({ id: b.id, name: b.name })),
      ];
    } catch {
      // ignore
    }
  }

  return [
    { id: 'pusat', name: 'Kantor Pusat Jakarta' },
    { id: 'jember', name: 'Cabang Jember' },
    { id: 'padang', name: 'Cabang Padang' },
    { id: 'surabaya', name: 'Cabang Surabaya' },
    { id: 'bandung', name: 'Cabang Bandung' },
  ];
}

export async function getAgents() {
  const agentsPath = path.join(process.cwd(), 'src', 'data', 'agents.json');
  if (fs.existsSync(agentsPath)) {
    try {
      const raw = fs.readFileSync(agentsPath, 'utf-8');
      const agents = JSON.parse(raw);
      if (agents.length > 0) {
        return ['Tanpa Agen', ...agents.map((a: any) => a.name)];
      }
    } catch {
      // ignore
    }
  }

  const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
  if (fs.existsSync(usersPath)) {
    try {
      const raw = fs.readFileSync(usersPath, 'utf-8');
      const users = JSON.parse(raw);
      const agents = users.filter((u: any) => u.role === 'Agen / Marketing' || u.role === 'mitra_agen');
      if (agents.length > 0) {
        return ['Tanpa Agen', ...agents.map((a: any) => a.name)];
      }
    } catch {
      // ignore
    }
  }

  return ['Tanpa Agen', 'Siti Aminah', 'Rahmat Hidayat', 'Hasan Basri'];
}

export async function createJamaah(
  formDataOrObj: FormData | Record<string, any>,
  branchId?: string | null
): Promise<{ success?: boolean; id?: string; error?: string }> {
  const getField = (key: string): string => {
    if (formDataOrObj instanceof FormData) {
      return (formDataOrObj.get(key) as string) || '';
    }
    return (formDataOrObj[key] as string) || '';
  };

  const getBool = (key: string): boolean => {
    if (formDataOrObj instanceof FormData) {
      return formDataOrObj.get(key) === 'true' || formDataOrObj.get(key) === 'on' || formDataOrObj.get(key) === '1';
    }
    return Boolean(formDataOrObj[key]);
  };

  const full_name = getField('full_name').trim();
  const phone = getField('phone').trim();
  const nik = getField('nik').trim();
  const genderRaw = getField('gender').trim();
  const gender: 'Laki-laki' | 'Perempuan' =
    genderRaw === 'P' || genderRaw === 'Perempuan' ? 'Perempuan' : 'Laki-laki';
  const birth_place = getField('birth_place').trim();
  const birth_date = getField('birth_date').trim();
  const blood_type = getField('blood_type').trim();
  const email = getField('email').trim();
  const city = getField('city').trim();
  const address = getField('address').trim();

  const passport_number = getField('passport_number').trim();
  const passport_issued_place = getField('passport_issued_place').trim();
  const passport_issued_date = getField('passport_issued_date').trim();
  const passport_expiry_date = getField('passport_expiry_date').trim();

  const branch_name = getField('branch_name') || getField('branch') || 'Kantor Pusat Jakarta';
  const agent_name = getField('agent_name') || getField('agent') || '-';

  const mahram_name = getField('mahram_name').trim() || '-';
  const mahram_relation = getField('mahram_relation').trim() || '-';
  const emergency_contact_name = getField('emergency_contact_name').trim();
  const emergency_contact_phone = getField('emergency_contact_phone').trim();
  const emergency_contact = emergency_contact_name
    ? `${emergency_contact_name}${emergency_contact_phone ? ` - ${emergency_contact_phone}` : ''}`
    : getField('emergency_contact').trim();

  const health_notes = getField('health_notes').trim();
  const is_active = getBool('is_active');

  const finalBranchId = branchId || getField('branch_id') || null;

  if (!full_name) {
    return { error: 'Nama lengkap wajib diisi' };
  }

  const items = readJamaahFile();

  // Generate code: JM-00XX
  const maxNum = items.reduce((max, item) => {
    const numPart = parseInt(item.code.replace(/[^0-9]/g, ''), 10);
    return !isNaN(numPart) && numPart > max ? numPart : max;
  }, items.length);

  const nextCode = `JM-${String(maxNum + 1).padStart(4, '0')}`;
  const newId = String(Date.now());

  const newItem: JamaahItem = {
    id: newId,
    legacy_id: String(items.length + 1),
    code: nextCode,
    full_name,
    gender,
    nik: nik || undefined,
    phone: phone || undefined,
    email: email || undefined,
    birth_place: birth_place || undefined,
    birth_date: birth_date || undefined,
    blood_type: blood_type || undefined,
    city: city || undefined,
    address: address || undefined,
    passport_number: passport_number || undefined,
    passport_issued_place: passport_issued_place || undefined,
    passport_issued_date: passport_issued_date || undefined,
    passport_expiry_date: passport_expiry_date || undefined,
    passport_expiry_formatted: passport_expiry_date ? formatExpiryDate(passport_expiry_date) : undefined,
    branch_id: finalBranchId,
    branch_name: branch_name || 'Kantor Pusat Jakarta',
    agent_name: agent_name === 'Tanpa Agen' ? '-' : agent_name,
    mahram_name: mahram_name || '-',
    mahram_relation: mahram_relation || '-',
    emergency_contact_name: emergency_contact_name || undefined,
    emergency_contact_phone: emergency_contact_phone || undefined,
    emergency_contact: emergency_contact || undefined,
    health_notes: health_notes || '',
    is_active: is_active ?? true,
    status: is_active ? 'Aktif' : 'Nonaktif',
    account_login: 'Aktif',
    document_count: 0,
    created_at: new Date().toISOString(),
  };

  items.unshift(newItem);
  writeJamaahFile(items);

  // Sync to Supabase if accessible
  try {
    const supabase = await createClient();
    await supabase.from('jamaah').insert({
      full_name,
      phone: phone || null,
      nik: nik || null,
      gender: gender === 'Laki-laki' ? 'L' : 'P',
      birth_date: birth_date || null,
      emergency_contact: emergency_contact || null,
      branch_id: finalBranchId,
    });
  } catch {
    // ignore DB errors in mock mode
  }

  revalidatePath('/dashboard/superadmin/jamaah');
  revalidatePath('/dashboard/admin/jamaah');
  revalidatePath('/dashboard/admin_cabang/jamaah');
  revalidatePath('/pilgrims');
  revalidatePath('/jamaah');

  return { success: true, id: newId };
}

export async function updateJamaah(
  id: string,
  formDataOrObj: FormData | Record<string, any>,
  branchId?: string | null
): Promise<{ success?: boolean; error?: string }> {
  const getField = (key: string): string => {
    if (formDataOrObj instanceof FormData) {
      return (formDataOrObj.get(key) as string) || '';
    }
    return (formDataOrObj[key] as string) || '';
  };

  const getBool = (key: string): boolean => {
    if (formDataOrObj instanceof FormData) {
      return formDataOrObj.get(key) === 'true' || formDataOrObj.get(key) === 'on' || formDataOrObj.get(key) === '1';
    }
    return Boolean(formDataOrObj[key]);
  };

  const full_name = getField('full_name').trim();
  const phone = getField('phone').trim();
  const nik = getField('nik').trim();
  const genderRaw = getField('gender').trim();
  const gender: 'Laki-laki' | 'Perempuan' =
    genderRaw === 'P' || genderRaw === 'Perempuan' ? 'Perempuan' : 'Laki-laki';
  const birth_place = getField('birth_place').trim();
  const birth_date = getField('birth_date').trim();
  const blood_type = getField('blood_type').trim();
  const email = getField('email').trim();
  const city = getField('city').trim();
  const address = getField('address').trim();

  const passport_number = getField('passport_number').trim();
  const passport_issued_place = getField('passport_issued_place').trim();
  const passport_issued_date = getField('passport_issued_date').trim();
  const passport_expiry_date = getField('passport_expiry_date').trim();

  const branch_name = getField('branch_name') || getField('branch');
  const agent_name = getField('agent_name') || getField('agent');

  const mahram_name = getField('mahram_name').trim();
  const mahram_relation = getField('mahram_relation').trim();
  const emergency_contact_name = getField('emergency_contact_name').trim();
  const emergency_contact_phone = getField('emergency_contact_phone').trim();
  const emergency_contact = emergency_contact_name
    ? `${emergency_contact_name}${emergency_contact_phone ? ` - ${emergency_contact_phone}` : ''}`
    : getField('emergency_contact').trim();

  const health_notes = getField('health_notes').trim();
  const is_active = getBool('is_active');

  const finalBranchId = branchId || getField('branch_id') || null;

  if (!full_name) {
    return { error: 'Nama lengkap wajib diisi' };
  }

  const items = readJamaahFile();
  const idx = items.findIndex((j) => j.id === id || j.legacy_id === id);

  if (idx !== -1) {
    items[idx] = {
      ...items[idx],
      full_name,
      gender,
      nik: nik || items[idx].nik,
      phone: phone || items[idx].phone,
      email: email || items[idx].email,
      birth_place: birth_place || items[idx].birth_place,
      birth_date: birth_date || items[idx].birth_date,
      blood_type: blood_type || items[idx].blood_type,
      city: city || items[idx].city,
      address: address || items[idx].address,
      passport_number: passport_number || items[idx].passport_number,
      passport_issued_place: passport_issued_place || items[idx].passport_issued_place,
      passport_issued_date: passport_issued_date || items[idx].passport_issued_date,
      passport_expiry_date: passport_expiry_date || items[idx].passport_expiry_date,
      passport_expiry_formatted: passport_expiry_date
        ? formatExpiryDate(passport_expiry_date)
        : items[idx].passport_expiry_formatted,
      branch_id: finalBranchId || items[idx].branch_id,
      branch_name: branch_name || items[idx].branch_name,
      agent_name: agent_name === 'Tanpa Agen' ? '-' : (agent_name || items[idx].agent_name),
      mahram_name: mahram_name !== '' ? mahram_name : items[idx].mahram_name,
      mahram_relation: mahram_relation !== '' ? mahram_relation : items[idx].mahram_relation,
      emergency_contact_name: emergency_contact_name || items[idx].emergency_contact_name,
      emergency_contact_phone: emergency_contact_phone || items[idx].emergency_contact_phone,
      emergency_contact: emergency_contact || items[idx].emergency_contact,
      health_notes: health_notes !== '' ? health_notes : items[idx].health_notes,
      is_active: is_active,
      status: is_active ? 'Aktif' : 'Nonaktif',
    };
    writeJamaahFile(items);
  }

  try {
    const supabase = await createClient();
    await supabase
      .from('jamaah')
      .update({
        full_name,
        phone: phone || null,
        nik: nik || null,
        gender: gender === 'Laki-laki' ? 'L' : 'P',
        birth_date: birth_date || null,
        emergency_contact: emergency_contact || null,
        branch_id: finalBranchId,
      })
      .eq('id', id);
  } catch {
    // ignore DB errors
  }

  revalidatePath('/dashboard/superadmin/jamaah');
  revalidatePath(`/dashboard/superadmin/jamaah/${id}`);
  revalidatePath('/dashboard/admin/jamaah');
  revalidatePath('/dashboard/admin_cabang/jamaah');
  revalidatePath('/pilgrims');
  revalidatePath('/jamaah');

  return { success: true };
}

export async function deleteJamaah(id: string): Promise<{ success?: boolean; error?: string }> {
  const items = readJamaahFile();
  const filtered = items.filter((j) => j.id !== id && j.legacy_id !== id);
  writeJamaahFile(filtered);

  try {
    const supabase = await createClient();
    await supabase.from('jamaah').delete().eq('id', id);
  } catch {
    // ignore DB errors
  }

  revalidatePath('/dashboard/superadmin/jamaah');
  revalidatePath('/dashboard/admin/jamaah');
  revalidatePath('/dashboard/admin_cabang/jamaah');
  revalidatePath('/pilgrims');
  revalidatePath('/jamaah');

  return { success: true };
}
