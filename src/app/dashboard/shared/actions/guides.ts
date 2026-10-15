'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { recordActivityLog } from './activity_logs';

export interface GuideItem {
  id: string;
  code: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email: string;
  specialization: string;
  branch: string;
  branch_id?: string;
  is_active: boolean;
  status: 'Aktif' | 'Nonaktif';
  bio: string;
  has_account: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GuideInput {
  id?: string;
  name: string;
  branch?: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone?: string;
  email?: string;
  specialization?: string;
  is_active?: boolean;
  bio?: string;
  create_login?: boolean;
  password?: string;
}

const GUIDES_FILE = path.join(process.cwd(), 'src', 'data', 'guides.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): GuideItem[] {
  try {
    if (!fs.existsSync(GUIDES_FILE)) return [];
    const raw = fs.readFileSync(GUIDES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading guides.json:', err);
    return [];
  }
}

function writeData(data: GuideItem[]) {
  try {
    const dir = path.dirname(GUIDES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(GUIDES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing guides.json:', err);
  }
}

function generateGuideCode(existing: GuideItem[]): string {
  const count = existing.length + 1;
  const numStr = String(count).padStart(3, '0');
  const code = `GD-${numStr}`;
  if (!existing.some((g) => g.code === code)) return code;
  return `GD-${Date.now().toString().slice(-4)}`;
}

export async function getGuides(): Promise<GuideItem[]> {
  const local = readData();
  const supabase = getServiceSupabase();
  if (!supabase) return local;

  try {
    const { data: dbGuides, error } = await supabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !dbGuides) {
      return local;
    }

    let modified = false;
    const merged = [...local];

    for (const dbG of dbGuides) {
      const idx = merged.findIndex((m) => m.id === dbG.id);
      if (idx >= 0) {
        // sync basic fields
        if (dbG.name && merged[idx].name !== dbG.name) {
          merged[idx].name = dbG.name;
          modified = true;
        }
        if (dbG.phone && merged[idx].phone !== dbG.phone) {
          merged[idx].phone = dbG.phone;
          modified = true;
        }
        if (dbG.experience && merged[idx].bio !== dbG.experience) {
          merged[idx].bio = dbG.experience;
          modified = true;
        }
      } else {
        // new item from database
        const newGuide: GuideItem = {
          id: dbG.id,
          code: generateGuideCode(merged),
          name: dbG.name,
          gender: 'Laki-laki',
          phone: dbG.phone || '',
          email: `${dbG.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
          specialization: 'Fiqih Manasik',
          branch: 'Kantor Pusat Jakarta',
          is_active: true,
          status: 'Aktif',
          bio: dbG.experience || '',
          has_account: false,
          created_at: dbG.created_at,
          updated_at: dbG.updated_at,
        };
        merged.push(newGuide);
        modified = true;
      }
    }

    if (modified) {
      writeData(merged);
    }

    return merged;
  } catch (err) {
    console.error('Error fetching/merging guides:', err);
    return local;
  }
}

export async function getGuideById(id: string): Promise<GuideItem | null> {
  const guides = await getGuides();
  return guides.find((g) => g.id === id) || null;
}

export async function saveGuide(payload: GuideInput): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    if (!payload.name?.trim()) {
      return { success: false, error: 'Nama muthawif wajib diisi' };
    }

    const guides = readData();
    const supabase = getServiceSupabase();
    const now = new Date().toISOString();
    const isActive = payload.is_active ?? true;
    const status = isActive ? 'Aktif' : 'Nonaktif';

    let guideId = payload.id;
    let code = '';
    let existingIndex = -1;

    if (guideId) {
      existingIndex = guides.findIndex((g) => g.id === guideId);
      if (existingIndex >= 0) {
        code = guides[existingIndex].code;
      }
    }

    if (!code) {
      code = generateGuideCode(guides);
    }

    let hasAccount = false;
    let userId = '';

    if (existingIndex >= 0) {
      hasAccount = guides[existingIndex].has_account;
      userId = guides[existingIndex].user_id || '';
    }

    // Handle account creation / password update if requested
    if (payload.create_login && payload.email?.trim() && supabase) {
      try {
        const email = payload.email.trim();
        const pwd = payload.password?.trim() || 'password123';

        // Check if user already exists
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingAuthUser = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

        if (existingAuthUser) {
          userId = existingAuthUser.id;
          hasAccount = true;
          if (payload.password?.trim()) {
            await supabase.auth.admin.updateUserById(userId, { password: pwd });
          }
        } else {
          const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password: pwd,
            email_confirm: true,
            user_metadata: {
              name: payload.name,
              role: 'muthawif',
            },
          });

          if (!createErr && newUser?.user) {
            userId = newUser.user.id;
            hasAccount = true;

            // create profile entry
            await supabase.from('profiles').upsert({
              id: userId,
              full_name: payload.name,
              role: 'muthawif',
              phone: payload.phone || null,
            });
          }
        }
      } catch (authErr) {
        console.warn('Failed to manage auth user for muthawif:', authErr);
      }
    }

    if (existingIndex >= 0) {
      // Update existing
      const updatedItem: GuideItem = {
        ...guides[existingIndex],
        name: payload.name.trim(),
        gender: payload.gender || 'Laki-laki',
        branch: payload.branch || 'Kantor Pusat Jakarta',
        phone: payload.phone?.trim() || '',
        email: payload.email?.trim() || '',
        specialization: payload.specialization?.trim() || 'Fiqih Manasik',
        is_active: isActive,
        status,
        bio: payload.bio?.trim() || '',
        has_account: hasAccount,
        user_id: userId || guides[existingIndex].user_id,
        updated_at: now,
      };

      guides[existingIndex] = updatedItem;
      writeData(guides);

      // Sync with Supabase table
      if (supabase && guideId) {
        await supabase
          .from('guides')
          .update({
            name: updatedItem.name,
            phone: updatedItem.phone || null,
            experience: updatedItem.bio || null,
            updated_at: now,
          })
          .eq('id', guideId);
      }

      await recordActivityLog({
        user_name: 'Super Admin',
        action: 'updated',
        description: `Memperbarui data muthawif ${updatedItem.name} (${updatedItem.code})`,
      });

      revalidateAll();
      return { success: true, id: guideId };
    } else {
      // Create new
      let newDbId: string | undefined = undefined;

      if (supabase) {
        const { data: inserted, error: insertErr } = await supabase
          .from('guides')
          .insert({
            name: payload.name.trim(),
            phone: payload.phone?.trim() || null,
            experience: payload.bio?.trim() || null,
          })
          .select('id')
          .single();

        if (!insertErr && inserted) {
          newDbId = inserted.id;
        }
      }

      const id = newDbId || `gd-${Date.now()}`;
      const newItem: GuideItem = {
        id,
        code,
        name: payload.name.trim(),
        gender: payload.gender || 'Laki-laki',
        branch: payload.branch || 'Kantor Pusat Jakarta',
        phone: payload.phone?.trim() || '',
        email: payload.email?.trim() || '',
        specialization: payload.specialization?.trim() || 'Fiqih Manasik',
        is_active: isActive,
        status,
        bio: payload.bio?.trim() || '',
        has_account: hasAccount,
        user_id: userId,
        created_at: now,
        updated_at: now,
      };

      guides.unshift(newItem);
      writeData(guides);

      await recordActivityLog({
        user_name: 'Super Admin',
        action: 'created',
        description: `Menambahkan muthawif baru ${newItem.name} (${newItem.code})`,
      });

      revalidateAll();
      return { success: true, id };
    }
  } catch (err: any) {
    console.error('Error saving guide:', err);
    return { success: false, error: err?.message || 'Terjadi kesalahan sistem' };
  }
}

export async function deleteGuide(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const guides = readData();
    const target = guides.find((g) => g.id === id);

    const filtered = guides.filter((g) => g.id !== id);
    writeData(filtered);

    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from('guides').delete().eq('id', id);
    }

    if (target) {
      await recordActivityLog({
        user_name: 'Super Admin',
        action: 'deleted',
        description: `Menghapus muthawif ${target.name} (${target.code})`,
      });
    }

    revalidateAll();
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting guide:', err);
    return { success: false, error: err?.message || 'Gagal menghapus pembimbing' };
  }
}

// Legacy helpers
export async function createGuide(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const experience = formData.get('experience') as string;
  return saveGuide({
    name,
    phone,
    bio: experience,
    gender: 'Laki-laki',
  });
}

export async function updateGuide(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const experience = formData.get('experience') as string;
  return saveGuide({
    id,
    name,
    phone,
    bio: experience,
    gender: 'Laki-laki',
  });
}

function revalidateAll() {
  try {
    revalidatePath('/guides');
    revalidatePath('/dashboard/superadmin/guides');
    revalidatePath('/dashboard/admin/guides');
    revalidatePath('/dashboard/admin_cabang/guides');
    revalidatePath('/dashboard/muthawif');
  } catch {}
}
