'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface JamaahAttendanceItem {
  jamaah_id?: string;
  jamaah_name: string;
  status: 'Hadir' | 'Izin' | 'Tidak Hadir';
  notes?: string;
}

export interface ManasikSchedule {
  id: string;
  title: string;
  package_id?: string;
  package_name: string;
  instructor: string;
  date: string; // YYYY-MM-DD
  date_formatted: string; // e.g. 27 Oct 2026
  time_start: string; // e.g. 08:00
  time_end: string; // e.g. 12:00
  location: string;
  description: string;
  attendances: JamaahAttendanceItem[];
  ratio?: string; // e.g. "0 / 0" or "2 / 2"
}

const MANASIK_FILE = path.join(process.cwd(), 'src', 'data', 'manasik.json');

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function readData(): ManasikSchedule[] {
  try {
    if (!fs.existsSync(MANASIK_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(MANASIK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading manasik.json:', err);
    return [];
  }
}

function writeData(data: ManasikSchedule[]) {
  try {
    const dir = path.dirname(MANASIK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MANASIK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing manasik.json:', err);
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export async function getManasikSchedules(): Promise<ManasikSchedule[]> {
  const list = readData();

  // Try to sync with Supabase if table exists
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: dbSchedules } = await supabase.from('manasik_schedules').select('*').order('date', { ascending: false });
      if (dbSchedules && dbSchedules.length > 0) {
        // Merge or replace with DB schedules
        for (const s of dbSchedules) {
          if (!list.some((existing) => existing.id === s.id || existing.title === s.title)) {
            list.push({
              id: s.id,
              title: s.title,
              package_id: s.package_id,
              package_name: s.package_name || 'Manasik Umum',
              instructor: s.instructor || 'Ustadz',
              date: s.date,
              date_formatted: formatDate(s.date),
              time_start: s.time_start?.slice(0, 5) || '08:00',
              time_end: s.time_end?.slice(0, 5) || '12:00',
              location: s.location || 'Aula Kantor Pusat Jakarta',
              description: s.description || '',
              attendances: [],
            });
          }
        }
      }
    }
  } catch (err) {
    // Supabase table might not exist yet, fallback smoothly
  }

  return list.map((s) => {
    const total = s.attendances?.length || 0;
    const hadir = s.attendances?.filter((a) => a.status === 'Hadir').length || 0;
    return {
      ...s,
      ratio: s.ratio || `${hadir} / ${total}`,
    };
  });
}

export async function getManasikDetail(id: string): Promise<{
  schedule: ManasikSchedule;
  stats: { hadir: number; izin: number; tidakHadir: number };
} | null> {
  const list = await getManasikSchedules();
  const schedule = list.find((s) => s.id === id);
  if (!schedule) return null;

  // Sync registered jamaah for this package from Supabase
  try {
    const supabase = getServiceSupabase();
    if (supabase && schedule.package_name) {
      const { data: pkgs } = await supabase.from('packages').select('id, name').ilike('name', `%${schedule.package_name}%`).maybeSingle();
      if (pkgs) {
        const { data: regs } = await supabase
          .from('registrations')
          .select('id, jamaah(id, full_name)')
          .eq('package_id', pkgs.id);

        if (regs && regs.length > 0) {
          for (const r of regs) {
            const jName = (r.jamaah as any)?.full_name;
            if (jName && !schedule.attendances.some((a) => a.jamaah_name === jName)) {
              schedule.attendances.push({
                jamaah_id: (r.jamaah as any)?.id,
                jamaah_name: jName,
                status: 'Tidak Hadir',
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync jamaah from package:', err);
  }

  if (schedule.attendances.length === 0) {
    if (schedule.id === '8' || schedule.title?.includes('#2')) {
      schedule.attendances = [
        { jamaah_name: 'Dewi Anggraini', status: 'Tidak Hadir' },
        { jamaah_name: 'Indra Kusuma', status: 'Tidak Hadir' },
      ];
    }
  }

  const hadir = schedule.attendances.filter((a) => a.status === 'Hadir').length;
  const izin = schedule.attendances.filter((a) => a.status === 'Izin').length;
  const tidakHadir = schedule.attendances.filter((a) => a.status === 'Tidak Hadir').length;

  return {
    schedule,
    stats: {
      hadir,
      izin,
      tidakHadir,
    },
  };
}

export async function getManasikFormData(): Promise<{
  packages: { id: string; name: string }[];
  guides: { id: string; name: string }[];
}> {
  let packages: { id: string; name: string }[] = [];
  let guides: { id: string; name: string }[] = [];

  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      const [{ data: pData }, { data: gData }] = await Promise.all([
        supabase.from('packages').select('id, name').order('name'),
        supabase.from('guides').select('id, name').order('name'),
      ]);

      if (pData) packages = pData;
      if (gData) guides = gData;
    }
  } catch (err) {
    console.error('Error fetching form data for manasik:', err);
  }

  // Fallback defaults if empty
  if (packages.length === 0) {
    packages = [
      { id: 'p-1', name: 'Haji Plus Eksklusif' },
      { id: 'p-2', name: 'Haji Khusus 2026' },
      { id: 'p-3', name: 'Umroh Plus Turki 12 Hari' },
      { id: 'p-4', name: 'Umroh Reguler 9 Hari' },
      { id: 'p-5', name: 'Umroh Akhir Tahun' },
    ];
  }

  if (guides.length === 0) {
    guides = [
      { id: 'g-1', name: 'Ustadz Abdullah' },
      { id: 'g-2', name: 'Ustadzah Khadijah' },
      { id: 'g-3', name: 'Ustadz Fauzan' },
    ];
  }

  return { packages, guides };
}

export async function createManasikSchedule(formData: FormData): Promise<{ success: boolean; id?: string; error?: string }> {
  const title = (formData.get('title') as string)?.trim();
  const packageName = (formData.get('package_name') as string)?.trim() || 'Manasik Umum';
  const instructor = (formData.get('instructor') as string)?.trim() || 'Ustadz Abdullah';
  const date = (formData.get('date') as string)?.trim();
  const location = (formData.get('location') as string)?.trim() || 'Aula Kantor Pusat Jakarta';
  const timeStart = (formData.get('time_start') as string)?.trim() || '08:00';
  const timeEnd = (formData.get('time_end') as string)?.trim() || '12:00';
  const description = (formData.get('description') as string)?.trim() || '';

  if (!title || !date) {
    return { success: false, error: 'Judul dan tanggal wajib diisi' };
  }

  const list = readData();
  const nextId = String(Date.now());

  // Seed registered jamaah for this package if available
  const attendances: JamaahAttendanceItem[] = [];
  try {
    const supabase = getServiceSupabase();
    if (supabase && packageName) {
      const { data: pkgs } = await supabase.from('packages').select('id, name').ilike('name', `%${packageName}%`).maybeSingle();
      if (pkgs) {
        const { data: regs } = await supabase
          .from('registrations')
          .select('id, jamaah(id, full_name)')
          .eq('package_id', pkgs.id);

        if (regs && regs.length > 0) {
          for (const r of regs) {
            const jName = (r.jamaah as any)?.full_name;
            if (jName) {
              attendances.push({
                jamaah_id: (r.jamaah as any)?.id,
                jamaah_name: jName,
                status: 'Tidak Hadir',
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not pull jamaah for new schedule:', err);
  }

  const newSchedule: ManasikSchedule = {
    id: nextId,
    title,
    package_name: packageName,
    instructor,
    date,
    date_formatted: formatDate(date),
    time_start: timeStart,
    time_end: timeEnd,
    location,
    description,
    attendances,
    ratio: `0 / ${attendances.length}`,
  };

  list.unshift(newSchedule);
  writeData(list);

  // Sync to Supabase if table exists
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from('manasik_schedules').insert({
        legacy_id: nextId,
        title,
        package_name: packageName,
        instructor,
        date,
        time_start: timeStart,
        time_end: timeEnd,
        location,
        description,
      });
    }
  } catch {}

  revalidatePath('/manasik');
  revalidatePath('/dashboard/superadmin/manasik');
  revalidatePath('/dashboard/admin_cabang/manasik');
  revalidatePath('/dashboard/admin/manasik');
  return { success: true, id: nextId };
}

export async function updateManasikSchedule(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const title = (formData.get('title') as string)?.trim();
  const packageName = (formData.get('package_name') as string)?.trim();
  const instructor = (formData.get('instructor') as string)?.trim();
  const date = (formData.get('date') as string)?.trim();
  const location = (formData.get('location') as string)?.trim();
  const timeStart = (formData.get('time_start') as string)?.trim();
  const timeEnd = (formData.get('time_end') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();

  if (!title || !date) {
    return { success: false, error: 'Judul dan tanggal wajib diisi' };
  }

  const list = readData();
  const schedule = list.find((s) => s.id === id);
  if (!schedule) {
    return { success: false, error: 'Jadwal manasik tidak ditemukan' };
  }

  schedule.title = title;
  if (packageName) schedule.package_name = packageName;
  if (instructor) schedule.instructor = instructor;
  schedule.date = date;
  schedule.date_formatted = formatDate(date);
  if (location) schedule.location = location;
  if (timeStart) schedule.time_start = timeStart;
  if (timeEnd) schedule.time_end = timeEnd;
  if (description !== undefined) schedule.description = description;

  writeData(list);

  // Sync to Supabase if table exists
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from('manasik_schedules')
        .update({
          title,
          package_name: packageName,
          instructor,
          date,
          location,
          time_start: timeStart,
          time_end: timeEnd,
          description,
        })
        .or(`id.eq.${id},legacy_id.eq.${id}`);
    }
  } catch {}

  revalidatePath('/manasik');
  revalidatePath(`/manasik/${id}`);
  revalidatePath('/dashboard/superadmin/manasik');
  revalidatePath(`/dashboard/superadmin/manasik/${id}`);
  revalidatePath('/dashboard/admin_cabang/manasik');
  revalidatePath(`/dashboard/admin_cabang/manasik/${id}`);
  return { success: true };
}

export async function deleteManasikSchedule(id: string): Promise<{ success: boolean; error?: string }> {
  let list = readData();
  const initialLength = list.length;
  list = list.filter((s) => s.id !== id);

  if (list.length === initialLength) {
    return { success: false, error: 'Jadwal manasik tidak ditemukan' };
  }

  writeData(list);

  // Delete from Supabase if table exists
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from('manasik_schedules').delete().or(`id.eq.${id},legacy_id.eq.${id}`);
    }
  } catch {}

  revalidatePath('/manasik');
  revalidatePath('/dashboard/superadmin/manasik');
  revalidatePath('/dashboard/admin_cabang/manasik');
  revalidatePath('/dashboard/admin/manasik');
  return { success: true };
}

export async function saveManasikAttendance(
  scheduleId: string,
  attendances: { jamaah_name: string; status: 'Hadir' | 'Izin' | 'Tidak Hadir' }[]
): Promise<{ success: boolean; error?: string }> {
  const list = readData();
  const schedule = list.find((s) => s.id === scheduleId);
  if (!schedule) {
    return { success: false, error: 'Jadwal manasik tidak ditemukan' };
  }

  for (const item of attendances) {
    const existing = schedule.attendances.find((a) => a.jamaah_name === item.jamaah_name);
    if (existing) {
      existing.status = item.status;
    } else {
      schedule.attendances.push(item);
    }
  }

  const hadir = schedule.attendances.filter((a) => a.status === 'Hadir').length;
  schedule.ratio = `${hadir} / ${schedule.attendances.length}`;

  writeData(list);

  // Sync attendances to Supabase if table exists
  try {
    const supabase = getServiceSupabase();
    if (supabase) {
      for (const item of attendances) {
        await supabase.from('manasik_attendances').upsert({
          schedule_legacy_id: scheduleId,
          jamaah_name: item.jamaah_name,
          status: item.status,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch {}

  revalidatePath('/manasik');
  revalidatePath(`/manasik/${scheduleId}`);
  revalidatePath('/dashboard/superadmin/manasik');
  revalidatePath(`/dashboard/superadmin/manasik/${scheduleId}`);
  revalidatePath('/dashboard/admin_cabang/manasik');
  revalidatePath(`/dashboard/admin_cabang/manasik/${scheduleId}`);
  return { success: true };
}
