'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface UserItem {
  id: string;
  legacy_id?: string;
  name: string;
  email: string;
  role: 'Admin Cabang' | 'Super Admin' | 'Jamaah' | 'Agen / Marketing' | 'Muthawif';
  branch: string;
  status: 'Aktif' | 'Nonaktif';
  last_login: string;
  phone?: string;
  is_active?: boolean;
}

const USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): UserItem[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users.json:', err);
    return [];
  }
}

function writeData(data: UserItem[]) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users.json:', err);
  }
}

function generateRandomPassword(length = 10): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export async function getUserList(): Promise<UserItem[]> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, branches(name)');

      const { data: authData } = await supabase.auth.admin.listUsers();
      const authUsers = authData?.users || [];

      if (!error && profiles && profiles.length > 0) {
        const localList = readData();

        const dbMapped: UserItem[] = profiles.map((p) => {
          const authUser = authUsers.find((u) => u.id === p.id);
          const email = authUser?.email || `${p.full_name?.toLowerCase().replace(/\s+/g, '') || 'user'}@example.com`;

          let role: UserItem['role'] = 'Jamaah';
          if (p.role === 'admin_cabang') role = 'Admin Cabang';
          else if (p.role === 'super_admin') role = 'Super Admin';
          else if (p.role === 'mitra_agen') role = 'Agen / Marketing';
          else if (p.role === 'muthawif') role = 'Muthawif';

          let lastLogin = '-';
          if (authUser?.last_sign_in_at) {
            try {
              const d = new Date(authUser.last_sign_in_at);
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const hours = String(d.getHours()).padStart(2, '0');
              const mins = String(d.getMinutes()).padStart(2, '0');
              lastLogin = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${hours}:${mins}`;
            } catch {
              lastLogin = '-';
            }
          }

          return {
            id: p.id,
            name: p.full_name || 'Pengguna',
            email,
            role,
            branch: (p.branches as any)?.name || 'Kantor Pusat Jakarta',
            status: 'Aktif',
            last_login: lastLogin,
            phone: p.phone || '',
            is_active: true,
          };
        });

        // Merge with local list to ensure all reference users are present
        for (const loc of localList) {
          if (!dbMapped.some((db) => db.id === loc.id || db.legacy_id === loc.id || db.name.toLowerCase() === loc.name.toLowerCase())) {
            dbMapped.push(loc);
          }
        }

        writeData(dbMapped);
        return dbMapped;
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase profiles, using local fallback:', err);
  }

  return readData();
}

export async function getUserDetail(id: string): Promise<UserItem | null> {
  const list = await getUserList();
  let match = list.find((u) => u.id === id || u.legacy_id === id);
  if (!match) {
    const raw = readData();
    match = raw.find((u) => u.id === id || u.legacy_id === id);
  }
  return match || null;
}

export async function createUser(payload: {
  name: string;
  email: string;
  role: UserItem['role'];
  branch: string;
  phone?: string;
  is_active: boolean;
  password?: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const newId = String(Date.now());
    let createdId = newId;

    const supabase = getServiceSupabase();
    if (supabase) {
      const pwd = payload.password || generateRandomPassword();
      const { data: authCreated, error: authErr } = await supabase.auth.admin.createUser({
        email: payload.email,
        password: pwd,
        email_confirm: true,
        user_metadata: { full_name: payload.name },
      });

      if (!authErr && authCreated?.user) {
        createdId = authCreated.user.id;
        let dbRole = 'jamaah';
        if (payload.role === 'Admin Cabang') dbRole = 'admin_cabang';
        else if (payload.role === 'Super Admin') dbRole = 'super_admin';
        else if (payload.role === 'Agen / Marketing') dbRole = 'mitra_agen';
        else if (payload.role === 'Muthawif') dbRole = 'muthawif';

        await supabase.from('profiles').upsert({
          id: createdId,
          full_name: payload.name,
          role: dbRole,
          phone: payload.phone || null,
        });
      }
    }

    // Save to local cache
    const list = readData();
    const newUser: UserItem = {
      id: createdId,
      legacy_id: newId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      branch: payload.branch || 'Kantor Pusat Jakarta',
      status: payload.is_active ? 'Aktif' : 'Nonaktif',
      last_login: '-',
      phone: payload.phone || '',
      is_active: payload.is_active,
    };
    list.unshift(newUser);
    writeData(list);

    revalidatePath('/users');
    revalidatePath('/dashboard/superadmin/users');
    revalidatePath('/dashboard/admin_cabang/users');
    return { success: true, id: createdId };
  } catch (err: any) {
    console.error('Error creating user:', err);
    return { success: false, error: err.message || 'Gagal menambahkan pengguna' };
  }
}

export async function updateUser(
  id: string,
  payload: {
    name: string;
    email: string;
    role: UserItem['role'];
    branch: string;
    phone?: string;
    is_active: boolean;
    password?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        let dbRole = 'jamaah';
        if (payload.role === 'Admin Cabang') dbRole = 'admin_cabang';
        else if (payload.role === 'Super Admin') dbRole = 'super_admin';
        else if (payload.role === 'Agen / Marketing') dbRole = 'mitra_agen';
        else if (payload.role === 'Muthawif') dbRole = 'muthawif';

        await supabase.from('profiles').update({
          full_name: payload.name,
          role: dbRole,
          phone: payload.phone || null,
        }).eq('id', id);

        if (payload.password && payload.password.trim().length > 0) {
          await supabase.auth.admin.updateUserById(id, { password: payload.password });
        }
      }
    }

    // Update local cache
    const list = readData();
    const idx = list.findIndex((u) => u.id === id || u.legacy_id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        name: payload.name,
        email: payload.email,
        role: payload.role,
        branch: payload.branch,
        phone: payload.phone,
        is_active: payload.is_active,
        status: payload.is_active ? 'Aktif' : 'Nonaktif',
      };
      writeData(list);
    }

    revalidatePath('/users');
    revalidatePath(`/users/${id}/edit`);
    revalidatePath('/dashboard/superadmin/users');
    revalidatePath(`/dashboard/superadmin/users/${id}/edit`);
    revalidatePath('/dashboard/admin_cabang/users');
    revalidatePath(`/dashboard/admin_cabang/users/${id}/edit`);
    return { success: true };
  } catch (err: any) {
    console.error('Error updating user:', err);
    return { success: false, error: err.message || 'Gagal mengubah pengguna' };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.auth.admin.deleteUser(id);
        await supabase.from('profiles').delete().eq('id', id);
      }
    }

    const list = readData();
    const filtered = list.filter((u) => u.id !== id && u.legacy_id !== id);
    writeData(filtered);

    revalidatePath('/users');
    revalidatePath('/dashboard/superadmin/users');
    revalidatePath('/dashboard/admin_cabang/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return { success: false, error: err.message || 'Gagal menghapus pengguna' };
  }
}

export async function resetUserPassword(
  id: string
): Promise<{ success: boolean; tempPassword?: string; userName?: string; error?: string }> {
  try {
    const user = await getUserDetail(id);
    if (!user) return { success: false, error: 'Pengguna tidak ditemukan' };

    const tempPassword = generateRandomPassword(10);

    const supabase = getServiceSupabase();
    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { error } = await supabase.auth.admin.updateUserById(id, { password: tempPassword });
        if (error) console.warn('Supabase reset password error:', error);
      }
    }

    try {
      const { recordActivityLog } = await import('./activity_logs');
      await recordActivityLog({
        user_name: 'Admin Cabang',
        action: 'updated',
        description: `Mereset kata sandi pengguna ${user.name}`,
        ip_address: '127.0.0.1',
      });
    } catch {}

    return {
      success: true,
      tempPassword,
      userName: user.name,
    };
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return { success: false, error: err.message || 'Gagal mereset kata sandi' };
  }
}
