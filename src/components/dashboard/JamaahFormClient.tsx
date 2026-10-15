'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { JamaahItem, createJamaah, updateJamaah } from '@/app/dashboard/shared/actions/jamaah';

interface Props {
  initialJamaah?: JamaahItem | null;
  branches: Array<{ id: string; name: string }>;
  agents: string[];
  basePath?: string;
  isEdit?: boolean;
}

export default function JamaahFormClient({
  initialJamaah,
  branches,
  agents,
  basePath = '/dashboard/superadmin/jamaah',
  isEdit = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/pilgrims')
    ? '/pilgrims'
    : pathname.startsWith('/jamaah')
    ? '/jamaah'
    : basePath;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (isEdit && initialJamaah?.id) {
        const res = await updateJamaah(initialJamaah.id, formData);
        if (res?.error) {
          setErrorMessage(res.error);
          setIsSubmitting(false);
        } else {
          router.push(activeBasePath);
          router.refresh();
        }
      } else {
        const res = await createJamaah(formData);
        if (res?.error) {
          setErrorMessage(res.error);
          setIsSubmitting(false);
        } else {
          router.push(activeBasePath);
          router.refresh();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
      setIsSubmitting(false);
    }
  };

  const cancelHref = isEdit && initialJamaah?.id
    ? `${activeBasePath}/${initialJamaah.id}`
    : activeBasePath;

  const defaultBranch = initialJamaah?.branch_name || 'Kantor Pusat Jakarta';
  const defaultAgent = initialJamaah?.agent_name && initialJamaah.agent_name !== '-'
    ? initialJamaah.agent_name
    : 'Tanpa Agen';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {isEdit ? 'Edit Jamaah' : 'Tambah Jamaah'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isEdit ? initialJamaah?.full_name : 'Tambah data jamaah baru'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Penempatan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5">Penempatan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Cabang
              </label>
              <select
                name="branch_name"
                defaultValue={defaultBranch}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Agen / Referral
              </label>
              <select
                name="agent_name"
                defaultValue={defaultAgent}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Data Pribadi */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5">Data Pribadi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                defaultValue={initialJamaah?.full_name || ''}
                placeholder="Ahmad Fauzi"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  defaultValue={initialJamaah?.gender === 'P' || initialJamaah?.gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki'}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  NIK
                </label>
                <input
                  type="text"
                  name="nik"
                  maxLength={16}
                  defaultValue={initialJamaah?.nik || ''}
                  placeholder="3201000000000001"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="birth_place"
                  defaultValue={initialJamaah?.birth_place || ''}
                  placeholder="Jakarta"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="birth_date"
                  defaultValue={initialJamaah?.birth_date || ''}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Golongan Darah
                </label>
                <input
                  type="text"
                  name="blood_type"
                  defaultValue={initialJamaah?.blood_type || ''}
                  placeholder="A"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">A/B/AB/O</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={initialJamaah?.phone || ''}
                  placeholder="081200000001"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={initialJamaah?.email || ''}
                  placeholder="jamaah@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Kota
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue={initialJamaah?.city || ''}
                  placeholder="Jakarta"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Alamat
              </label>
              <textarea
                name="address"
                rows={3}
                defaultValue={initialJamaah?.address || ''}
                placeholder="Jl. Contoh No. 1, Jakarta"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Paspor */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5">Paspor</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Nomor Paspor
                </label>
                <input
                  type="text"
                  name="passport_number"
                  defaultValue={initialJamaah?.passport_number || ''}
                  placeholder="A1000000"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Tempat Penerbitan
                </label>
                <input
                  type="text"
                  name="passport_issued_place"
                  defaultValue={initialJamaah?.passport_issued_place || ''}
                  placeholder="Jakarta"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Tanggal Terbit
                </label>
                <input
                  type="date"
                  name="passport_issued_date"
                  defaultValue={initialJamaah?.passport_issued_date || ''}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Tanggal Kadaluarsa
                </label>
                <input
                  type="date"
                  name="passport_expiry_date"
                  defaultValue={initialJamaah?.passport_expiry_date || ''}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Mahram & Kontak Darurat */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5">Mahram &amp; Kontak Darurat</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Nama Mahram
                </label>
                <input
                  type="text"
                  name="mahram_name"
                  defaultValue={initialJamaah?.mahram_name && initialJamaah.mahram_name !== '-' ? initialJamaah.mahram_name : ''}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Hubungan Mahram
                </label>
                <input
                  type="text"
                  name="mahram_relation"
                  defaultValue={initialJamaah?.mahram_relation && initialJamaah.mahram_relation !== '-' ? initialJamaah.mahram_relation : ''}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Mis. Suami, Ayah, Anak</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Nama Kontak Darurat
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  defaultValue={initialJamaah?.emergency_contact_name || ''}
                  placeholder="Keluarga Ahmad Fauzi"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Telepon Kontak Darurat
                </label>
                <input
                  type="text"
                  name="emergency_contact_phone"
                  defaultValue={initialJamaah?.emergency_contact_phone || ''}
                  placeholder="081300000001"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Kesehatan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5">Kesehatan</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Catatan Kesehatan
            </label>
            <textarea
              name="health_notes"
              rows={3}
              defaultValue={initialJamaah?.health_notes || ''}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Riwayat penyakit, alergi, kebutuhan khusus
            </span>
          </div>

          <div className="mt-5">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={initialJamaah ? initialJamaah.is_active ?? true : true}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-700">Aktif</span>
            </label>
          </div>
        </div>

        {/* Buttons at bottom */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#00c5a0] hover:bg-[#00b08f] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting
              ? 'Menyimpan...'
              : isEdit
              ? 'Simpan Perubahan'
              : 'Tambah Jamaah'}
          </button>
          <Link
            href={cancelHref}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
