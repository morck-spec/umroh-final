import { ChevronLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { createJamaah } from './actions';

export default function CreateJamaahPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin" className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Jamaah Baru</h1>
          <p className="text-sm text-slate-500">Daftarkan akun jamaah dan pilih paket umroh</p>
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-emerald-600" />
            Formulir Pendaftaran
          </h2>
        </div>
        <div className="p-6">
          <form action={createJamaah} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data Diri */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Informasi Pribadi</h3>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <input type="text" name="name" id="name" required className="input-field" placeholder="Sesuai KTP" />
                </div>

                <div>
                  <label htmlFor="nik" className="block text-sm font-medium text-slate-700">NIK</label>
                  <input type="text" name="nik" id="nik" required className="input-field" placeholder="16 Digit NIK" />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
                  <select name="gender" id="gender" required className="input-field bg-white">
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">Tanggal Lahir</label>
                  <input type="date" name="birthDate" id="birthDate" required className="input-field" />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">No. HP / WhatsApp</label>
                  <input type="text" name="phone" id="phone" required className="input-field" placeholder="081234567890" />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700">Alamat Lengkap</label>
                  <textarea name="address" id="address" rows={3} required className="input-field" placeholder="Alamat domisili saat ini"></textarea>
                </div>
              </div>

              {/* Akun & Paket */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Kredensial & Paket</h3>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" name="email" id="email" required className="input-field" placeholder="email@contoh.com" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                  <input type="password" name="password" id="password" required className="input-field" placeholder="Minimal 6 karakter" />
                </div>

                <div>
                  <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                  <input type="password" name="passwordConfirm" id="passwordConfirm" required className="input-field" placeholder="Ulangi password" />
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <label htmlFor="packageId" className="block text-sm font-medium text-slate-700">Pilih Paket Umroh</label>
                  <select name="packageId" id="packageId" required className="input-field bg-white mt-1">
                    <option value="">-- Pilih Paket --</option>
                    {/* In a real app, this should be fetched from DB */}
                    <option value="reguler">Paket Reguler 9 Hari (Rp 25.000.000)</option>
                    <option value="vip">Paket VIP 12 Hari (Rp 35.000.000)</option>
                    <option value="ramadhan">Paket Ramadhan 15 Hari (Rp 40.000.000)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <Link href="/dashboard/admin" className="btn-secondary">
                Batal
              </Link>
              <button type="submit" className="btn-primary">
                Simpan & Daftarkan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
