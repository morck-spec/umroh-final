'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import {
  RegistrationBilling,
  updateRegistrationStatusAction,
  deleteRegistrationAction,
  createRegistrationAction
} from './paymentBilling';

const PAYMENTS_FILE = path.join(process.cwd(), 'src', 'data', 'payments.json');

function readData(): { registrations: RegistrationBilling[] } {
  try {
    if (!fs.existsSync(PAYMENTS_FILE)) return { registrations: [] };
    const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading payments.json in registrations.ts:', err);
    return { registrations: [] };
  }
}

export async function getRegistrations() {
  const data = readData();

  // Try to sync/fetch any records from Supabase
  try {
    const supabase = await createClient();
    const { data: dbData } = await supabase
      .from('registrations')
      .select(`
        *,
        jamaah(id, full_name, phone, branches(name)),
        packages(id, name, price, departure_date)
      `)
      .order('created_at', { ascending: false });

    if (dbData && dbData.length > 0) {
      for (const item of dbData) {
        if (!item.jamaah || !item.packages) continue;
        const exists = data.registrations.some(
          (r) => r.jamaah?.name?.toLowerCase() === item.jamaah?.full_name?.toLowerCase()
        );
        if (!exists) {
          const num = data.registrations.length + 1;
          data.registrations.push({
            id: item.id,
            code: `REG-${String(num).padStart(5, '0')}`,
            jamaah: {
              name: item.jamaah.full_name,
              passport: 'A' + Math.floor(1000000 + Math.random() * 9000000),
              phone: item.jamaah.phone || '-',
            },
            package: {
              id: item.packages.id,
              name: item.packages.name,
              type: item.packages.name?.toLowerCase().includes('haji') ? 'Haji' : 'Umroh',
              price: item.packages.price || 30000000,
              departure_date: item.packages.departure_date ? new Date(item.packages.departure_date).toLocaleDateString('id-ID') : '10 Jan 2027',
            },
            status: item.status === 'approved' ? 'Dikonfirmasi' : item.status === 'cancelled' ? 'Batal' : 'Pending',
            reg_date: new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            agent: 'Hasan Basri',
            guide: 'Ustadz Abdullah',
            branch: item.jamaah.branches?.name || 'Kantor Pusat Jakarta',
            total_amount: item.packages.price || 30000000,
            paid_amount: 0,
            remaining_amount: item.packages.price || 30000000,
            payment_status: 'Belum Bayar',
            bills: [],
          });
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync with Supabase registrations:', err);
  }

  // Format list for table view matching Photo 1
  return data.registrations.map((r) => ({
    id: r.id,
    code: r.code,
    jamaah_name: r.jamaah?.name || 'Tanpa Nama',
    package_name: r.package?.name || 'Paket Umroh',
    status: r.status || 'Dikonfirmasi',
    payment_status: r.payment_status || 'Belum Bayar',
    reg_date: r.reg_date || '-',
    total_amount: r.total_amount || 0,
    paid_amount: r.paid_amount || 0,
    remaining_amount: r.remaining_amount || 0,
  }));
}

export async function createRegistration(formData: FormData) {
  const jamaah_name = (formData.get('jamaah_name') as string) || (formData.get('jamaah_id') as string);
  const package_id = (formData.get('package_id') as string) || 'pkg-1';
  const guide = (formData.get('guide') as string) || 'Ustadz Abdullah';
  const agent = (formData.get('agent') as string) || 'Hasan Basri';
  const reg_date = (formData.get('reg_date') as string) || '';
  const notes = (formData.get('notes') as string) || '';

  if (!jamaah_name) {
    return { error: 'Nama Jamaah wajib diisi' };
  }

  return createRegistrationAction({
    jamaah_name,
    package_id,
    guide,
    agent,
    reg_date,
    notes,
    status: 'Dikonfirmasi',
  });
}

export async function updateRegistrationStatus(id: string, status: string) {
  return updateRegistrationStatusAction(id, status);
}

export async function deleteRegistration(id: string) {
  return deleteRegistrationAction(id);
}
