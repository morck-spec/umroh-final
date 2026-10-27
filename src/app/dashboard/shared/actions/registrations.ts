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
  // Fetch directly from Supabase as primary source of truth
  try {
    const supabase = await createClient();
    const { data: dbData, error } = await supabase
      .from('registrations')
      .select(`
        *,
        jamaah(id, full_name, phone, branches(name)),
        packages(id, name, price, departure_date),
        payments(id, amount, status, invoices(invoice_number))
      `)
      .order('created_at', { ascending: false });

    if (!error && dbData) {
      return dbData.map((item: any, idx: number) => {
        const pkgPrice = Number(item.packages?.price || 0);
        const paidAmount = (item.payments || [])
          .filter((p: any) => p.status === 'paid')
          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
        const remainingAmount = Math.max(0, pkgPrice - paidAmount);

        let paymentStatus: 'Lunas' | 'Sebagian' | 'Belum Bayar' = 'Belum Bayar';
        if (paidAmount >= pkgPrice && pkgPrice > 0) {
          paymentStatus = 'Lunas';
        } else if (paidAmount > 0) {
          paymentStatus = 'Sebagian';
        }

        let statusText = 'Pending';
        if (item.status === 'approved') statusText = 'Dikonfirmasi';
        else if (item.status === 'rejected' || item.status === 'cancelled') statusText = 'Batal';

        // Dynamically derive code from database invoices or sequential format
        let regCode = '';
        for (const p of item.payments || []) {
          for (const inv of p.invoices || []) {
            const match = inv.invoice_number?.match(/REG-\d+/);
            if (match) {
              regCode = match[0];
              break;
            }
          }
          if (regCode) break;
        }
        if (!regCode) {
          regCode = `REG-${String(dbData.length - idx).padStart(5, '0')}`;
        }

        return {
          id: item.id,
          code: regCode,
          jamaah_name: item.jamaah?.full_name || 'Tanpa Nama',
          package_name: item.packages?.name || 'Paket Umroh',
          status: statusText,
          payment_status: paymentStatus,
          reg_date: item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '-',
          total_amount: pkgPrice,
          paid_amount: paidAmount,
          remaining_amount: remainingAmount,
        };
      });
    }
  } catch (err) {
    console.warn('Could not fetch from Supabase registrations, falling back to local:', err);
  }

  // Fallback ONLY when Supabase connection completely fails
  const data = readData();
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
