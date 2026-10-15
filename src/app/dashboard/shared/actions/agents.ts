'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { recordActivityLog } from './activity_logs';

export interface AgentItem {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  commission_rate: number;
  branch: string;
  branch_id?: string;
  address?: string;
  is_active: boolean;
  status: 'Aktif' | 'Nonaktif';
  has_account: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentInput {
  id?: string;
  name: string;
  branch?: string;
  phone?: string;
  email?: string;
  commission_rate?: number | string;
  is_active?: boolean;
  address?: string;
  create_login?: boolean;
  password?: string;
}

const AGENTS_FILE = path.join(process.cwd(), 'src', 'data', 'agents.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): AgentItem[] {
  try {
    if (!fs.existsSync(AGENTS_FILE)) return [];
    const raw = fs.readFileSync(AGENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading agents.json:', err);
    return [];
  }
}

function writeData(data: AgentItem[]) {
  try {
    const dir = path.dirname(AGENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(AGENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing agents.json:', err);
  }
}

function generateAgentCode(existing: AgentItem[]): string {
  const count = existing.length + 1;
  const code = `AG-DEMO${count}`;
  if (!existing.some((a) => a.code === code)) return code;
  return `AG-${Date.now().toString().slice(-4)}`;
}

export async function getAgentsList(): Promise<AgentItem[]> {
  const local = readData();
  const supabase = getServiceSupabase();
  if (!supabase) return local;

  try {
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUsers = authData?.users || [];

    let modified = false;
    const merged = local.map((agent) => {
      const matchAuth = authUsers.find(
        (u) => u.email?.toLowerCase() === agent.email?.toLowerCase()
      );
      if (matchAuth && !agent.has_account) {
        modified = true;
        return { ...agent, has_account: true, user_id: matchAuth.id };
      }
      return agent;
    });

    if (modified) {
      writeData(merged);
    }

    return merged;
  } catch (err) {
    console.error('Error checking agents sync:', err);
    return local;
  }
}

export async function getAgentById(id: string): Promise<AgentItem | null> {
  const agents = await getAgentsList();
  return agents.find((a) => a.id === id) || null;
}

export async function saveAgent(payload: AgentInput): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    if (!payload.name?.trim()) {
      return { success: false, error: 'Nama agen wajib diisi' };
    }

    const agents = readData();
    const supabase = getServiceSupabase();
    const now = new Date().toISOString();
    const isActive = payload.is_active ?? true;
    const status = isActive ? 'Aktif' : 'Nonaktif';

    let rate = 0;
    if (typeof payload.commission_rate === 'string') {
      const parsed = parseFloat(payload.commission_rate.replace(',', '.'));
      rate = isNaN(parsed) ? 0 : parsed;
    } else if (typeof payload.commission_rate === 'number') {
      rate = payload.commission_rate;
    }

    let agentId = payload.id;
    let code = '';
    let existingIndex = -1;

    if (agentId) {
      existingIndex = agents.findIndex((a) => a.id === agentId);
      if (existingIndex >= 0) {
        code = agents[existingIndex].code;
      }
    }

    if (!code) {
      code = generateAgentCode(agents);
    }

    let hasAccount = false;
    let userId = '';

    if (existingIndex >= 0) {
      hasAccount = agents[existingIndex].has_account;
      userId = agents[existingIndex].user_id || '';
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
              role: 'mitra_agen',
            },
          });

          if (!createErr && newUser?.user) {
            userId = newUser.user.id;
            hasAccount = true;

            // create profile entry
            await supabase.from('profiles').upsert({
              id: userId,
              full_name: payload.name,
              role: 'mitra_agen',
              phone: payload.phone || null,
            });
          }
        }
      } catch (authErr) {
        console.warn('Failed to manage auth user for agent:', authErr);
      }
    }

    if (existingIndex >= 0) {
      // Update existing
      const updatedItem: AgentItem = {
        ...agents[existingIndex],
        name: payload.name.trim(),
        branch: payload.branch || 'Kantor Pusat Jakarta',
        phone: payload.phone?.trim() || '',
        email: payload.email?.trim() || '',
        commission_rate: rate,
        is_active: isActive,
        status,
        address: payload.address?.trim() || '',
        has_account: hasAccount,
        user_id: userId || agents[existingIndex].user_id,
        updated_at: now,
      };

      agents[existingIndex] = updatedItem;
      writeData(agents);

      await recordActivityLog({
        user_name: 'Super Admin',
        action: 'updated',
        description: `Memperbarui data agen ${updatedItem.name} (${updatedItem.code})`,
      });

      revalidateAll();
      return { success: true, id: agentId };
    } else {
      // Create new
      const id = `ag-${Date.now()}`;
      const newItem: AgentItem = {
        id,
        code,
        name: payload.name.trim(),
        branch: payload.branch || 'Kantor Pusat Jakarta',
        phone: payload.phone?.trim() || '',
        email: payload.email?.trim() || '',
        commission_rate: rate,
        is_active: isActive,
        status,
        address: payload.address?.trim() || '',
        has_account: hasAccount,
        user_id: userId,
        created_at: now,
        updated_at: now,
      };

      agents.unshift(newItem);
      writeData(agents);

      await recordActivityLog({
        user_name: 'Super Admin',
        action: 'created',
        description: `Menambahkan agen baru ${newItem.name} (${newItem.code})`,
      });

      revalidateAll();
      return { success: true, id };
    }
  } catch (err: any) {
    console.error('Error saving agent:', err);
    return { success: false, error: err?.message || 'Terjadi kesalahan sistem' };
  }
}

export async function deleteAgent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const agents = readData();
    const target = agents.find((a) => a.id === id);

    const filtered = agents.filter((a) => a.id !== id);
    writeData(filtered);

    if (target) {
      await recordActivityLog({
        user_name: 'Super Admin',
        action: 'deleted',
        description: `Menghapus agen ${target.name} (${target.code})`,
      });
    }

    revalidateAll();
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting agent:', err);
    return { success: false, error: err?.message || 'Gagal menghapus agen' };
  }
}

function revalidateAll() {
  try {
    revalidatePath('/agents');
    revalidatePath('/dashboard/superadmin/agents');
    revalidatePath('/dashboard/admin/agents');
    revalidatePath('/dashboard/admin_cabang/agents');
    revalidatePath('/commissions');
  } catch {}
}
