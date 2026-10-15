'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const PAYMENTS_FILE = path.join(process.cwd(), 'src', 'data', 'payments.json');

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

export interface BillItem {
  id: string;
  code: string;
  type: string;
  amount: number;
  paid: number;
  remaining: number;
  status: 'Lunas' | 'Sebagian' | 'Belum Bayar';
  due_date: string;
}

export interface RegistrationBilling {
  id: string;
  code: string;
  jamaah: {
    name: string;
    passport: string;
    phone: string;
  };
  package: {
    id: string;
    name: string;
    type: string;
    price: number;
    departure_date: string;
  };
  status: string;
  reg_date: string;
  agent: string;
  guide: string;
  branch: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'Lunas' | 'Sebagian' | 'Belum Bayar';
  notes?: string;
  bills: BillItem[];
}

export interface FlatBillRow extends BillItem {
  registration_id: string;
  registration_code: string;
  jamaah_name: string;
  package_name: string;
}

export interface PaymentSummary {
  total_bills: number;
  total_paid: number;
  total_unpaid: number;
  pending_verification: number;
}

function readData(): { summary: PaymentSummary; packages: any[]; registrations: RegistrationBilling[] } {
  try {
    if (!fs.existsSync(PAYMENTS_FILE)) {
      return {
        summary: { total_bills: 0, total_paid: 0, total_unpaid: 0, pending_verification: 0 },
        packages: [],
        registrations: [],
      };
    }
    const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading payments.json:', err);
    return {
      summary: { total_bills: 0, total_paid: 0, total_unpaid: 0, pending_verification: 0 },
      packages: [],
      registrations: [],
    };
  }
}

function writeData(data: any) {
  try {
    const dir = path.dirname(PAYMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing payments.json:', err);
  }
}

export async function getPaymentDashboardData() {
  const data = readData();

  // Try to load packages from Supabase
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: dbPkgs } = await supabase.from('packages').select('id, name, price, departure_date, quota');
      if (dbPkgs && dbPkgs.length > 0) {
        for (const p of dbPkgs) {
          if (!data.packages.some((existing) => existing.name === p.name || existing.id === p.id)) {
            data.packages.push({
              id: p.id,
              name: p.name,
              type: p.name.toLowerCase().includes('haji') ? 'Haji' : 'Umroh',
              price: p.price,
              departure_date: p.departure_date || 'TBA',
              quota: p.quota || 40,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not load packages from Supabase:', err);
  }

  // Compute live flat bills
  const flatBills: FlatBillRow[] = [];
  let totalBills = 0;
  let totalPaid = 0;

  for (const reg of data.registrations) {
    for (const b of reg.bills) {
      flatBills.push({
        ...b,
        registration_id: reg.id,
        registration_code: reg.code,
        jamaah_name: reg.jamaah.name,
        package_name: reg.package.name,
      });
      totalBills += b.amount;
      totalPaid += b.paid;
    }
  }

  const totalUnpaid = Math.max(0, totalBills - totalPaid);

  return {
    summary: {
      total_bills: data.summary.total_bills || totalBills,
      total_paid: data.summary.total_paid || totalPaid,
      total_unpaid: data.summary.total_unpaid || totalUnpaid,
      pending_verification: data.summary.pending_verification || 0,
    },
    packages: data.packages,
    bills: flatBills,
  };
}

export async function getRegistrationBilling(idOrCode: string): Promise<RegistrationBilling | null> {
  const data = readData();
  const found = data.registrations.find((r) => r.id === idOrCode || r.code === idOrCode);
  if (found) return found;

  // Fallback to Supabase if not in JSON
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let query = supabase
        .from('registrations')
        .select(`
          *,
          jamaah(id, full_name, passport_number, phone, branches(name)),
          packages(id, name, type, price, departure_date)
        `);

      if (idOrCode.includes('-') && idOrCode.length > 20) {
        query = query.eq('id', idOrCode);
      } else {
        query = query.eq('id', idOrCode);
      }

      const { data: dbItem } = await query.maybeSingle();
      if (dbItem && dbItem.jamaah && dbItem.packages) {
        const pkgPrice = dbItem.packages.price || 35000000;
        const fallbackReg: RegistrationBilling = {
          id: dbItem.id,
          code: `REG-${String(dbItem.id).slice(0, 5)}`,
          jamaah: {
            name: dbItem.jamaah.full_name || 'Jamaah',
            passport: dbItem.jamaah.passport_number || 'A1000011',
            phone: dbItem.jamaah.phone || '-',
          },
          package: {
            id: dbItem.packages.id,
            name: dbItem.packages.name,
            type: dbItem.packages.type || 'Umroh',
            price: pkgPrice,
            departure_date: dbItem.packages.departure_date
              ? new Date(dbItem.packages.departure_date).toLocaleDateString('id-ID')
              : '10 Jan 2027',
          },
          status: dbItem.status === 'approved' ? 'Dikonfirmasi' : dbItem.status === 'rejected' ? 'Batal' : 'Pending',
          reg_date: new Date(dbItem.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          agent: 'Hasan Basri',
          guide: 'Ustadzah Khadijah',
          branch: dbItem.jamaah.branches?.name || 'Kantor Pusat Jakarta',
          total_amount: pkgPrice,
          paid_amount: 0,
          remaining_amount: pkgPrice,
          payment_status: 'Belum Bayar',
          bills: [],
        };
        return fallbackReg;
      }
    }
  } catch (err) {
    console.warn('Error fetching registration from Supabase:', err);
  }

  return null;
}

export async function updateRegistrationStatusAction(regId: string, status: string) {
  const data = readData();
  const reg = data.registrations.find((r) => r.id === regId || r.code === regId);
  if (!reg) return { error: 'Pendaftaran tidak ditemukan' };

  reg.status = status;
  writeData(data);

  // Sync to Supabase database
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      // Map UI status to DB status
      let dbStatus = 'pending';
      const lower = status.toLowerCase();
      if (lower.includes('konfirmasi') || lower.includes('approve') || lower.includes('aktif')) {
        dbStatus = 'approved';
      } else if (lower.includes('batal') || lower.includes('reject') || lower.includes('tolak')) {
        dbStatus = 'rejected';
      }

      // Find jamaah by name
      const { data: jData } = await supabase
        .from('jamaah')
        .select('id')
        .eq('full_name', reg.jamaah.name)
        .maybeSingle();

      if (jData) {
        await supabase
          .from('registrations')
          .update({ status: dbStatus })
          .eq('jamaah_id', jData.id);
      }
    }
  } catch (err) {
    console.error('Error syncing registration status to Supabase:', err);
  }

  revalidatePath('/dashboard/superadmin/registrations');
  revalidatePath('/dashboard/superadmin/payments');
  return { success: true };
}

export async function generateMassBillingAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const packageId = formData.get('package_id') as string;
  const dpAmount = Number(formData.get('dp_amount') || 0);
  const installmentsCount = Math.max(1, Number(formData.get('installments_count') || 1));
  const firstDueDate = (formData.get('first_due_date') as string) || '2026-11-14';

  const data = readData();
  const pkg = data.packages.find((p) => p.id === packageId || p.name === packageId);

  // If a package is matched or created
  const pkgPrice = pkg ? pkg.price : 35000000;
  const remainingAfterDp = Math.max(0, pkgPrice - dpAmount);
  const perInstallment = Math.round(remainingAfterDp / installmentsCount);

  // Add bills for any registration with this package that has 0 bills, or create demonstration registration
  const targetRegs = data.registrations.filter((r) => !packageId || r.package.id === packageId || r.bills.length === 0);

  for (const reg of targetRegs) {
    const newBills: BillItem[] = [];
    if (dpAmount > 0) {
      newBills.push({
        id: `b-${reg.id}-dp-${Date.now()}`,
        code: `${reg.code}-DP`,
        type: 'Uang Muka (DP)',
        amount: dpAmount,
        paid: 0,
        remaining: dpAmount,
        status: 'Belum Bayar',
        due_date: firstDueDate,
      });
    }

    for (let i = 1; i <= installmentsCount; i++) {
      const d = new Date(firstDueDate);
      d.setMonth(d.getMonth() + (i - 1));
      newBills.push({
        id: `b-${reg.id}-c${i}-${Date.now()}`,
        code: `${reg.code}-C${i}`,
        type: 'Cicilan',
        amount: perInstallment,
        paid: 0,
        remaining: perInstallment,
        status: 'Belum Bayar',
        due_date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
    }

    reg.bills = newBills;
    reg.total_amount = dpAmount + perInstallment * installmentsCount;
    reg.paid_amount = 0;
    reg.remaining_amount = reg.total_amount;
    reg.payment_status = 'Belum Bayar';
  }

  writeData(data);

  revalidatePath('/dashboard/superadmin/payments');
  return { success: true };
}

export async function payBillAction(regId: string, billId: string, payAmount: number, paymentMethod: string = 'midtrans_va') {
  const data = readData();
  let reg = data.registrations.find((r) => r.id === regId);
  if (!reg) {
    reg = data.registrations.find((r) => r.bills?.some((b) => b.id === billId || b.code === billId));
  }
  if (!reg) return { error: 'Pendaftaran tidak ditemukan' };

  const bill = reg.bills.find((b) => b.id === billId || b.code === billId);
  if (!bill) return { error: 'Tagihan tidak ditemukan' };

  bill.paid = Math.min(bill.amount, bill.paid + payAmount);
  bill.remaining = Math.max(0, bill.amount - bill.paid);
  bill.status = bill.remaining === 0 ? 'Lunas' : bill.paid > 0 ? 'Sebagian' : 'Belum Bayar';

  // Recalculate reg
  reg.paid_amount = reg.bills.reduce((sum, b) => sum + b.paid, 0);
  reg.remaining_amount = Math.max(0, reg.total_amount - reg.paid_amount);
  reg.payment_status = reg.remaining_amount === 0 ? 'Lunas' : reg.paid_amount > 0 ? 'Sebagian' : 'Belum Bayar';

  writeData(data);

  // Sync payment and invoice to Supabase database
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      // Find registration in Supabase
      const { data: jData } = await supabase
        .from('jamaah')
        .select('id')
        .eq('full_name', reg.jamaah.name)
        .maybeSingle();

      if (jData) {
        const { data: rData } = await supabase
          .from('registrations')
          .select('id')
          .eq('jamaah_id', jData.id)
          .maybeSingle();

        if (rData) {
          const { data: payRecord } = await supabase
            .from('payments')
            .insert({
              registration_id: rData.id,
              amount: payAmount,
              payment_method: paymentMethod || 'midtrans_simulator',
              status: 'paid'
            })
            .select()
            .single();

          if (payRecord) {
            const invoiceNumber = `INV-${bill.code || Date.now()}`;
            await supabase.from('invoices').insert({
              invoice_number: invoiceNumber,
              payment_id: payRecord.id,
              amount: payAmount,
              issued_at: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Error syncing payment to Supabase:', err);
  }

  try {
    revalidatePath('/dashboard/superadmin/payments');
    revalidatePath('/dashboard/admin/payments');
    revalidatePath('/dashboard/admin_cabang/payments');
    revalidatePath('/dashboard/jamaah/payment');
    revalidatePath('/payments');
  } catch {
    // Ignore in non-action context
  }
  return { success: true };
}

export async function updateRegistrationDetailAction(
  idOrCode: string,
  payload: { guide?: string; reg_date?: string; notes?: string }
): Promise<{ success: boolean; error?: string }> {
  const data = readData();
  const reg = data.registrations.find((r) => r.id === idOrCode || r.code === idOrCode);
  if (!reg) return { success: false, error: 'Pendaftaran tidak ditemukan' };

  if (payload.guide !== undefined) reg.guide = payload.guide;
  if (payload.reg_date !== undefined) reg.reg_date = payload.reg_date;
  if (payload.notes !== undefined) reg.notes = payload.notes;

  writeData(data);

  revalidatePath('/registrations');
  revalidatePath(`/registrations/${reg.id}`);
  revalidatePath(`/registrations/${reg.id}/edit`);
  revalidatePath('/dashboard/superadmin/registrations');
  revalidatePath('/dashboard/admin/registrations');
  revalidatePath('/dashboard/admin_cabang/registrations');
  return { success: true };
}

export async function deleteRegistrationAction(idOrCode: string): Promise<{ success: boolean; error?: string }> {
  const data = readData();
  const target = data.registrations.find((r) => r.id === idOrCode || r.code === idOrCode);
  if (!target) return { success: false, error: 'Pendaftaran tidak ditemukan' };

  data.registrations = data.registrations.filter((r) => r.id !== idOrCode && r.code !== idOrCode);
  writeData(data);

  // Sync delete to Supabase database
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: jData } = await supabase
        .from('jamaah')
        .select('id')
        .eq('full_name', target.jamaah.name)
        .maybeSingle();

      if (jData) {
        await supabase
          .from('registrations')
          .delete()
          .eq('jamaah_id', jData.id);
      }
    }
  } catch (err) {
    console.warn('Error deleting registration in Supabase:', err);
  }

  revalidatePath('/registrations');
  revalidatePath('/dashboard/superadmin/registrations');
  revalidatePath('/dashboard/admin/registrations');
  revalidatePath('/dashboard/admin_cabang/registrations');
  return { success: true };
}

export async function createRegistrationAction(payload: {
  jamaah_name: string;
  package_id: string;
  guide?: string;
  agent?: string;
  reg_date?: string;
  notes?: string;
  status?: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const data = readData();
  const pkg = data.packages.find((p) => p.id === payload.package_id || p.name === payload.package_id);
  const pkgPrice = pkg ? pkg.price : 35000000;
  const pkgName = pkg ? pkg.name : 'Umroh Reguler';
  const pkgType = pkg ? pkg.type : 'Umroh';
  const pkgDeparture = pkg ? pkg.departure_date : '10 Jan 2027';

  const newNum = data.registrations.length + 1;
  const code = `REG-${String(newNum).padStart(5, '0')}`;
  const id = String(newNum);

  const dpAmount = Math.round(pkgPrice * 0.2);
  const remaining = pkgPrice - dpAmount;
  const installmentAmount = Math.round(remaining / 3);

  const regDateFormatted = payload.reg_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const newReg: RegistrationBilling = {
    id,
    code,
    jamaah: {
      name: payload.jamaah_name,
      passport: `A${Math.floor(1000000 + Math.random() * 9000000)}`,
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
    },
    package: {
      id: pkg ? pkg.id : 'pkg-1',
      name: pkgName,
      type: pkgType,
      price: pkgPrice,
      departure_date: pkgDeparture,
    },
    status: payload.status || 'Dikonfirmasi',
    reg_date: regDateFormatted,
    agent: payload.agent || 'Hasan Basri',
    guide: payload.guide || 'Ustadz Abdullah',
    branch: 'Kantor Pusat Jakarta',
    total_amount: pkgPrice,
    paid_amount: 0,
    remaining_amount: pkgPrice,
    payment_status: 'Belum Bayar',
    notes: payload.notes || '',
    bills: [
      {
        id: `b-${id}-dp`,
        code: `${code}-DP`,
        type: 'Uang Muka (DP)',
        amount: dpAmount,
        paid: 0,
        remaining: dpAmount,
        status: 'Belum Bayar',
        due_date: regDateFormatted,
      },
      {
        id: `b-${id}-c1`,
        code: `${code}-C1`,
        type: 'Cicilan',
        amount: installmentAmount,
        paid: 0,
        remaining: installmentAmount,
        status: 'Belum Bayar',
        due_date: '05 Dec 2026',
      },
      {
        id: `b-${id}-c2`,
        code: `${code}-C2`,
        type: 'Cicilan',
        amount: installmentAmount,
        paid: 0,
        remaining: installmentAmount,
        status: 'Belum Bayar',
        due_date: '05 Jan 2027',
      },
      {
        id: `b-${id}-c3`,
        code: `${code}-C3`,
        type: 'Cicilan',
        amount: remaining - (installmentAmount * 2),
        paid: 0,
        remaining: remaining - (installmentAmount * 2),
        status: 'Belum Bayar',
        due_date: '05 Feb 2027',
      },
    ],
  };

  data.registrations.unshift(newReg);
  writeData(data);

  // Sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: jData } = await supabase.from('jamaah').select('id').eq('full_name', payload.jamaah_name).maybeSingle();
      const { data: pData } = await supabase.from('packages').select('id').eq('name', pkgName).maybeSingle();
      if (jData && pData) {
        await supabase.from('registrations').insert({
          jamaah_id: jData.id,
          package_id: pData.id,
          status: 'approved',
        });
      }
    }
  } catch (err) {
    console.warn('Error inserting to Supabase:', err);
  }

  revalidatePath('/registrations');
  revalidatePath('/dashboard/superadmin/registrations');
  revalidatePath('/dashboard/admin/registrations');
  revalidatePath('/dashboard/admin_cabang/registrations');
  return { success: true, id };
}
