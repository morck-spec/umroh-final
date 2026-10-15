import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function sync() {
  console.log('--- STARTING SYNC TO SUPABASE ---');

  // 1. Get branches
  const { data: branches } = await supabase.from('branches').select('id, name');
  const jemberBranchId = branches?.find(b => b.name.toLowerCase().includes('jember'))?.id || branches?.[0]?.id || null;
  const paleranBranchId = branches?.find(b => b.name.toLowerCase().includes('paleran'))?.id || branches?.[1]?.id || null;

  // 2. Packages to sync
  const targetPackages = [
    {
      name: 'Umroh Plus Turki 12 Hari',
      description: 'Paket Umroh Plus Turki 12 Hari Bintang 5',
      price: 36500000,
      duration_days: 12,
      departure_date: '2027-01-10',
      quota: 45
    },
    {
      name: 'Haji Khusus 2026',
      description: 'Paket Haji Khusus Kuota Resmi Kemenag',
      price: 125000000,
      duration_days: 25,
      departure_date: '2027-02-10',
      quota: 30
    },
    {
      name: 'Haji Plus Eksklusif',
      description: 'Paket Haji Plus Fasilitas VIP',
      price: 140000000,
      duration_days: 28,
      departure_date: '2027-04-10',
      quota: 20
    },
    {
      name: 'Umroh Reguler 9 Hari',
      description: 'Paket Umroh Hemat Reguler 9 Hari',
      price: 28500000,
      duration_days: 9,
      departure_date: '2026-12-10',
      quota: 50
    },
    {
      name: 'Umroh Akhir Tahun',
      description: 'Paket Umroh Liburan Akhir Tahun Bersama Keluarga',
      price: 32000000,
      duration_days: 10,
      departure_date: '2026-11-10',
      quota: 48
    }
  ];

  const pkgMap = {};
  for (const p of targetPackages) {
    const { data: existing } = await supabase.from('packages').select('id').eq('name', p.name).maybeSingle();
    if (existing) {
      pkgMap[p.name] = existing.id;
      console.log(`Package exists: ${p.name} -> ${existing.id}`);
    } else {
      const { data: created, error } = await supabase.from('packages').insert(p).select().single();
      if (error) {
        console.error(`Error inserting package ${p.name}:`, error.message);
      } else {
        pkgMap[p.name] = created.id;
        console.log(`Created package: ${p.name} -> ${created.id}`);
      }
    }
  }

  // 3. Jamaah to sync
  const targetJamaah = [
    {
      full_name: 'Gunawan Wibowo',
      phone: '081200000007',
      nik: '320100000007',
      gender: 'L',
      branch_id: jemberBranchId,
      passport: 'A1000006'
    },
    {
      full_name: 'Hesti Purnama',
      phone: '081200000008',
      nik: '320100000008',
      gender: 'P',
      branch_id: jemberBranchId,
      passport: 'A1000007'
    },
    {
      full_name: 'Indra Kusuma',
      phone: '081200000009',
      nik: '320100000009',
      gender: 'L',
      branch_id: paleranBranchId,
      passport: 'A1000008'
    },
    {
      full_name: 'Siti Rahmawati',
      phone: '081200000010',
      nik: '320100000010',
      gender: 'P',
      branch_id: paleranBranchId,
      passport: 'A1000009'
    }
  ];

  const jamaahMap = {};
  for (const j of targetJamaah) {
    const { data: existing } = await supabase.from('jamaah').select('id').eq('full_name', j.full_name).maybeSingle();
    if (existing) {
      jamaahMap[j.full_name] = existing.id;
      console.log(`Jamaah exists: ${j.full_name} -> ${existing.id}`);
    } else {
      const { passport, ...jamaahData } = j;
      const { data: created, error } = await supabase.from('jamaah').insert(jamaahData).select().single();
      if (error) {
        console.error(`Error inserting jamaah ${j.full_name}:`, error.message);
      } else {
        jamaahMap[j.full_name] = created.id;
        console.log(`Created jamaah: ${j.full_name} -> ${created.id}`);
      }
    }
  }

  // 4. Registrations to sync
  const targetRegistrations = [
    {
      jamaahName: 'Gunawan Wibowo',
      packageName: 'Umroh Plus Turki 12 Hari',
      status: 'approved',
      code: 'REG-00007',
      payments: [
        { desc: 'DP', amount: 7500000, status: 'paid', method: 'bca_transfer' },
        { desc: 'Cicilan 1', amount: 9666667, status: 'paid', method: 'bca_transfer' },
        { desc: 'Cicilan 2', amount: 9666667, status: 'paid', method: 'bca_transfer' },
        { desc: 'Cicilan 3', amount: 9666666, status: 'paid', method: 'bca_transfer' }
      ]
    },
    {
      jamaahName: 'Hesti Purnama',
      packageName: 'Haji Khusus 2026',
      status: 'approved',
      code: 'REG-00008',
      payments: [
        { desc: 'DP', amount: 25000000, status: 'paid', method: 'mandiri_transfer' },
        { desc: 'Cicilan 1', amount: 20000000, status: 'paid', method: 'mandiri_transfer' },
        { desc: 'Cicilan 2', amount: 20000000, status: 'pending', method: 'mandiri_transfer' },
        { desc: 'Cicilan 3', amount: 20000000, status: 'pending', method: 'mandiri_transfer' },
        { desc: 'Cicilan 4', amount: 20000000, status: 'pending', method: 'mandiri_transfer' },
        { desc: 'Cicilan 5', amount: 20000000, status: 'pending', method: 'mandiri_transfer' }
      ]
    },
    {
      jamaahName: 'Indra Kusuma',
      packageName: 'Haji Plus Eksklusif',
      status: 'pending',
      code: 'REG-00009',
      payments: [
        { desc: 'DP', amount: 30000000, status: 'pending', method: 'bca_transfer' },
        { desc: 'Cicilan 1', amount: 22000000, status: 'pending', method: 'bca_transfer' },
        { desc: 'Cicilan 2', amount: 22000000, status: 'pending', method: 'bca_transfer' },
        { desc: 'Cicilan 3', amount: 22000000, status: 'pending', method: 'bca_transfer' },
        { desc: 'Cicilan 4', amount: 22000000, status: 'pending', method: 'bca_transfer' },
        { desc: 'Cicilan 5', amount: 22000000, status: 'pending', method: 'bca_transfer' }
      ]
    },
    {
      jamaahName: 'Siti Rahmawati',
      packageName: 'Umroh Reguler 9 Hari',
      status: 'approved',
      code: 'REG-00010',
      payments: [
        { desc: 'DP', amount: 5000000, status: 'paid', method: 'bsi_transfer' },
        { desc: 'Cicilan 1', amount: 7833333, status: 'paid', method: 'bsi_transfer' },
        { desc: 'Cicilan 2', amount: 7833333, status: 'paid', method: 'bsi_transfer' },
        { desc: 'Cicilan 3', amount: 7833334, status: 'paid', method: 'bsi_transfer' }
      ]
    }
  ];

  for (const reg of targetRegistrations) {
    const jId = jamaahMap[reg.jamaahName];
    const pId = pkgMap[reg.packageName];
    if (!jId || !pId) {
      console.warn(`Skipping reg for ${reg.jamaahName}, jId: ${jId}, pId: ${pId}`);
      continue;
    }

    let regId = null;
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id')
      .eq('jamaah_id', jId)
      .eq('package_id', pId)
      .maybeSingle();

    if (existingReg) {
      regId = existingReg.id;
      console.log(`Registration exists: ${reg.jamaahName} -> ${regId}`);
    } else {
      const { data: createdReg, error: regError } = await supabase
        .from('registrations')
        .insert({
          jamaah_id: jId,
          package_id: pId,
          status: reg.status
        })
        .select()
        .single();

      if (regError) {
        console.error(`Error creating registration for ${reg.jamaahName}:`, regError.message);
        continue;
      }
      regId = createdReg.id;
      console.log(`Created registration: ${reg.jamaahName} -> ${regId}`);
    }

    // 5. Payments & Invoices for this registration
    for (let idx = 0; idx < reg.payments.length; idx++) {
      const p = reg.payments[idx];
      // Check if payment already exists
      const { data: existingPay } = await supabase
        .from('payments')
        .select('id')
        .eq('registration_id', regId)
        .eq('amount', p.amount)
        .eq('status', p.status)
        .maybeSingle();

      let payId = existingPay?.id;
      if (!payId) {
        const { data: createdPay, error: payError } = await supabase
          .from('payments')
          .insert({
            registration_id: regId,
            amount: p.amount,
            payment_method: p.method,
            status: p.status
          })
          .select()
          .single();

        if (payError) {
          console.error(`Error inserting payment (${p.desc}) for ${reg.jamaahName}:`, payError.message);
        } else {
          payId = createdPay.id;
          console.log(`Created payment ${p.desc} (${p.amount}): ${payId}`);
        }
      }

      // If paid, create invoice if not exists
      if (payId && p.status === 'paid') {
        const invNumber = `INV-${reg.code}-${idx + 1}`;
        const { data: existingInv } = await supabase
          .from('invoices')
          .select('id')
          .eq('payment_id', payId)
          .maybeSingle();

        if (!existingInv) {
          const { error: invError } = await supabase
            .from('invoices')
            .insert({
              invoice_number: invNumber,
              payment_id: payId,
              amount: p.amount,
              issued_at: new Date().toISOString()
            });

          if (invError) {
            console.error(`Error creating invoice ${invNumber}:`, invError.message);
          } else {
            console.log(`Created invoice ${invNumber} for payment ${payId}`);
          }
        }
      }
    }
  }

  console.log('--- SYNC FINISHED SUCCESSFULLY ---');
}

sync().catch(console.error);
