'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface WhiteLabelSettings {
  id: string;
  app_name: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
  footer_text: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  favicon_url?: string;
  updated_at?: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'whitelabel.json');

const DEFAULT_SETTINGS: WhiteLabelSettings = {
  id: 'default',
  app_name: 'Travel Umroh & Haji',
  subtitle: 'Sistem Manajemen Umroh & Haji',
  phone: '+62 21 7654 3210',
  email: 'info@example.com',
  address: 'Jl. Melati Indah No. 17, Jakarta Selatan',
  footer_text: '© 2026 Travel Umroh & Haji — Sistem Manajemen Umroh & Haji.',
  primary_color: '#00d4b2',
  secondary_color: '#126259',
  logo_url: '',
  favicon_url: '',
};

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readLocalSettings(): WhiteLabelSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Error reading whitelabel.json:', err);
    return DEFAULT_SETTINGS;
  }
}

function writeLocalSettings(data: WhiteLabelSettings) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing whitelabel.json:', err);
  }
}

export async function getWhiteLabelSettings(): Promise<WhiteLabelSettings> {
  const local = readLocalSettings();
  const supabase = getServiceSupabase();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from('whitelabel_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return local;
    }

    return {
      id: 'default',
      app_name: data.app_name || local.app_name,
      subtitle: data.subtitle || local.subtitle,
      phone: data.phone || local.phone,
      email: data.email || local.email,
      address: data.address || local.address,
      footer_text: data.footer_text || local.footer_text,
      primary_color: data.primary_color || local.primary_color,
      secondary_color: data.secondary_color || local.secondary_color,
      logo_url: data.logo_url || local.logo_url || '',
      favicon_url: data.favicon_url || local.favicon_url || '',
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.warn('Supabase whitelabel fetch error, falling back to local:', err);
    return local;
  }
}

export async function saveWhiteLabelSettings(payload: Partial<WhiteLabelSettings>): Promise<{
  success: boolean;
  message: string;
  data: WhiteLabelSettings;
}> {
  const current = await getWhiteLabelSettings();
  const updated: WhiteLabelSettings = {
    ...current,
    ...payload,
    id: 'default',
    updated_at: new Date().toISOString(),
  };

  // 1. Save to local JSON
  writeLocalSettings(updated);

  // 2. Save to Supabase if available
  const supabase = getServiceSupabase();
  if (supabase) {
    try {
      await supabase
        .from('whitelabel_settings')
        .upsert({
          id: 'default',
          app_name: updated.app_name,
          subtitle: updated.subtitle,
          phone: updated.phone,
          email: updated.email,
          address: updated.address,
          footer_text: updated.footer_text,
          primary_color: updated.primary_color,
          secondary_color: updated.secondary_color,
          logo_url: updated.logo_url || '',
          favicon_url: updated.favicon_url || '',
          updated_at: updated.updated_at,
        });
    } catch (err) {
      console.warn('Could not save to Supabase whitelabel_settings table:', err);
    }
  }

  // 3. Record Activity Log
  try {
    const { recordActivityLog } = await import('./activity_logs');
    await recordActivityLog({
      user_name: 'Super Admin',
      action: 'updated',
      description: 'Memperbarui pengaturan white-label',
      ip_address: '127.0.0.1',
    });
  } catch (err) {
    console.warn('Could not record activity log:', err);
  }

  // 4. Revalidate paths
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/settings');
    revalidatePath('/dashboard/superadmin/settings');
    revalidatePath('/activity-logs');
    revalidatePath('/dashboard/superadmin/activity-logs');
  } catch {
    // Ignore in non-server action contexts
  }

  return {
    success: true,
    message: 'Pengaturan white-label berhasil disimpan.',
    data: updated,
  };
}
