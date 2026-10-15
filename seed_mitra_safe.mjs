import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Environment variables NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Mode Dry-Run / Static Check
const isDryRun = process.argv.includes('--dry-run');

async function seedMitraSafe() {
  console.log('====================================================');
  console.log('  SEED MITRA AGEN SAFE EXECUTION PROTOCOL');
  console.log(`  Mode: ${isDryRun ? 'DRY-RUN (Pemeriksaan Statis/Uji Logika)' : 'LIVE EXECUTION'}`);
  console.log('====================================================\n');

  if (isDryRun) {
    console.log('🔍 [DRY-RUN] Memeriksa konektivitas Supabase...');
    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (error) {
      console.error('❌ [DRY-RUN] Gagal menghubungkan ke Supabase:', error.message);
      process.exit(1);
    }
    console.log(`✅ [DRY-RUN] Terhubung ke Supabase. Total baris profil: ${count}`);

    console.log('🔍 [DRY-RUN] Memeriksa apakah akun mitra@demo.com sudah ada...');
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error('❌ [DRY-RUN] Gagal mengambil daftar pengguna auth:', userError.message);
      process.exit(1);
    }
    const existing = usersData.users.find(u => u.email === 'mitra@demo.com');
    console.log(`ℹ️ [DRY-RUN] Status akun mitra@demo.com: ${existing ? 'SUDAH ADA (ID: ' + existing.id + ')' : 'BELUM ADA'}`);

    console.log('\n✅ [DRY-RUN] Pemeriksaan statis dan logika script berhasil tanpa mengubah data apa pun.');
    return;
  }

  // --- LIVE EXECUTION ---
  let newlyCreatedUserId = null;
  let isPreExisting = false;

  try {
    // LANGKAH 1: Cek apakah akun mitra@demo.com sudah ada sebelumnya
    console.log('Langkah 1: Memeriksa daftar user Auth...');
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Gagal memeriksa daftar user: ${listError.message}`);
    }

    const existingUser = usersData.users.find(u => u.email === 'mitra@demo.com');
    let targetUserId = null;

    if (existingUser) {
      isPreExisting = true;
      targetUserId = existingUser.id;
      console.log(`ℹ️ Akun mitra@demo.com sudah ada sebelumnya (ID: ${targetUserId}). Mode: Pembaruan Profil Aman.`);
    } else {
      isPreExisting = false;
      console.log('Langkah 2: Membuat akun Auth baru mitra@demo.com...');
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: 'mitra@demo.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: { name: 'Hasan Basri' }
      });

      if (createError) {
        throw new Error(`Gagal membuat user Auth: ${createError.message}`);
      }

      if (!createData?.user?.id) {
        throw new Error('User Auth dibuat tetapi tidak mengembalikan ID pengguna yang valid.');
      }

      newlyCreatedUserId = createData.user.id;
      targetUserId = newlyCreatedUserId;
      console.log(`✅ Akun Auth baru berhasil dibuat (ID: ${targetUserId}).`);
    }

    // LANGKAH 3: Tunggu & verifikasi ketersediaan baris di public.profiles
    console.log('Langkah 3: Menunggu sinkronisasi profil database...');
    let profileFound = false;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', targetUserId)
        .maybeSingle();

      if (!profErr && prof) {
        profileFound = true;
        console.log(`✅ Profil ditemukan pada percobaan ke-${attempt}.`);
        break;
      }
      console.log(`⏳ Menunggu trigger profil (percobaan ${attempt}/4)...`);
      await new Promise(r => setTimeout(r, 600));
    }

    if (!profileFound) {
      throw new Error(`Profil tidak ditemukan di tabel profiles untuk user ID: ${targetUserId} setelah 4 kali percobaan.`);
    }

    // LANGKAH 4: Update role ke 'mitra_agen' dan nama ke 'Hasan Basri'
    console.log('Langkah 4: Memperbarui role profil ke "mitra_agen"...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'mitra_agen',
        full_name: 'Hasan Basri'
      })
      .eq('id', targetUserId)
      .select('id, role, full_name');

    if (updateError) {
      throw new Error(`Gagal memperbarui profil: ${updateError.message} (Detail: ${updateError.details || '-'})`);
    }

    console.log('✅ Profil berhasil diperbarui:', updateData);

    // LANGKAH 5: Verifikasi final
    const { data: finalVerify, error: verifyError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', targetUserId)
      .single();

    if (verifyError || finalVerify.role !== 'mitra_agen') {
      throw new Error(`Verifikasi akhir gagal. Role profil saat ini: ${finalVerify?.role}`);
    }

    console.log('\n🎉 PROSES SELESAI DENGAN SUKSES!');
    console.log(`   User: mitra@demo.com | Nama: ${finalVerify.full_name} | Role: ${finalVerify.role}`);

  } catch (err) {
    console.error('\n❌ TERJADI KESALAHAN:', err.message);

    // MEKANISME ROLLBACK YANG AMAN:
    // Rollback HANYA DAN HANYA JIKA user baru benar-benar dibuat oleh eksekusi script ini!
    if (newlyCreatedUserId && !isPreExisting) {
      console.warn('⚠️ Menjalankan Rollback: Menghapus akun Auth baru yang gagal dikonfigurasi...');
      try {
        await supabase.auth.admin.deleteUser(newlyCreatedUserId);
        console.log('✅ Rollback selesai: User Auth baru telah dihapus secara bersih.');
      } catch (rollbackErr) {
        console.error('❌ Gagal menjalankan rollback deleteUser:', rollbackErr.message);
      }
    } else if (isPreExisting) {
      console.log('🛡️ Akun sudah ada sebelumnya (Pre-existing). Penghapusan akun Auth dibatalkan untuk melindungi data lama.');
    }

    process.exit(1);
  }
}

seedMitraSafe();
