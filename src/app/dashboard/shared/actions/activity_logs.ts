'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface ActivityLogItem {
  id: string;
  created_at: string;
  time_formatted: string;
  user_name: string;
  action: 'updated' | 'created' | 'deleted' | 'printed' | 'generated' | string;
  description: string;
  ip_address: string;
}

const LOGS_FILE = path.join(process.cwd(), 'src', 'data', 'activity_logs.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readLocalLogs(): ActivityLogItem[] {
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading activity_logs.json:', err);
    return [];
  }
}

function writeLocalLogs(data: ActivityLogItem[]) {
  try {
    const dir = path.dirname(LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing activity_logs.json:', err);
  }
}

function formatDateToLog(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  const local = readLocalLogs();
  const supabase = getServiceSupabase();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return local;
    }

    return data.map((d: any) => ({
      id: d.id,
      created_at: d.created_at,
      time_formatted: d.time_formatted || formatDateToLog(new Date(d.created_at)),
      user_name: d.user_name,
      action: d.action,
      description: d.description,
      ip_address: d.ip_address || '127.0.0.1',
    }));
  } catch (err) {
    console.warn('Supabase activity_logs fetch failed, using local:', err);
    return local;
  }
}

export async function recordActivityLog(params: {
  user_name: string;
  action: string;
  description: string;
  ip_address?: string;
}): Promise<ActivityLogItem> {
  const now = new Date();
  const newLog: ActivityLogItem = {
    id: `log-${Date.now()}`,
    created_at: now.toISOString(),
    time_formatted: formatDateToLog(now),
    user_name: params.user_name || 'Super Admin',
    action: params.action || 'updated',
    description: params.description,
    ip_address: params.ip_address || '127.0.0.1',
  };

  const logs = readLocalLogs();
  logs.unshift(newLog);
  writeLocalLogs(logs);

  const supabase = getServiceSupabase();
  if (supabase) {
    try {
      await supabase.from('activity_logs').insert({
        id: newLog.id,
        created_at: newLog.created_at,
        time_formatted: newLog.time_formatted,
        user_name: newLog.user_name,
        action: newLog.action,
        description: newLog.description,
        ip_address: newLog.ip_address,
      });
    } catch {
      // Ignore Supabase error if table doesn't exist
    }
  }

  try {
    revalidatePath('/activity-logs');
    revalidatePath('/dashboard/superadmin/activity-logs');
  } catch {}

  return newLog;
}
