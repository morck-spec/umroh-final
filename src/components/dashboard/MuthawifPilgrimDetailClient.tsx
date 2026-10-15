'use client';

import Link from 'next/link';
import { MuthawifPilgrim } from '@/app/dashboard/shared/actions/muthawif';

interface Props {
  pilgrim: MuthawifPilgrim;
}

export default function MuthawifPilgrimDetailClient({ pilgrim }: Props) {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
        <Link href="/dashboard/muthawif" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&gt;</span>
        <Link href="/dashboard/muthawif/pilgrims" className="hover:text-slate-600 transition-colors">
          Jamaah
        </Link>
        <span>&gt;</span>
        <span className="text-slate-500 font-normal">{pilgrim.name}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{pilgrim.name}</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">{pilgrim.code}</p>
      </div>

      {/* 2-Column Content Layout (Foto 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Data Pribadi */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-4">Data Pribadi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-[12px]">
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Jenis Kelamin</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#e0f2fe] text-[#0284c7]">
                  {pilgrim.gender || 'Laki-laki'}
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">NIK</p>
                <p className="font-normal text-slate-800">{pilgrim.nik}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Tempat / Tanggal Lahir</p>
                <p className="font-normal text-slate-800">{pilgrim.birth_info || 'Jakarta, 01 Jan 1975 (51 th)'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Golongan Darah</p>
                <p className="font-normal text-slate-800">{pilgrim.blood_type || 'A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Telepon</p>
                <p className="font-normal text-[#00c292]">{pilgrim.phone}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Email</p>
                <p className="font-normal text-slate-800">{pilgrim.email}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-400 text-[11px] mb-1">Alamat</p>
                <p className="font-normal text-slate-800">{pilgrim.address || '-'}</p>
              </div>
            </div>
          </div>

          {/* Paspor */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-4">Paspor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-[12px]">
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Nomor Paspor</p>
                <p className="font-normal text-slate-800">{pilgrim.passport_number}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Tempat Penerbitan</p>
                <p className="font-normal text-slate-800">{pilgrim.passport_issued_place || 'Jakarta'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Tanggal Terbit</p>
                <p className="font-normal text-slate-800">{pilgrim.passport_issued_date || '14 Oct 2024'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Tanggal Kadaluarsa</p>
                <p className="font-normal text-slate-800">{pilgrim.passport_expiry || '14 Oct 2029'}</p>
              </div>
            </div>
          </div>

          {/* Mahram Lamp: Kontak Darurat */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-4">Mahram Lamp: Kontak Darurat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-[12px]">
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Nama Mahram</p>
                <p className="font-normal text-slate-800">{pilgrim.mahram_name || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Hubungan Mahram</p>
                <p className="font-normal text-slate-800">{pilgrim.mahram_relation || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Kontak Darurat</p>
                <p className="font-normal text-slate-800">{pilgrim.emergency_name || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1">Telepon Darurat</p>
                <p className="font-normal text-slate-800">{pilgrim.emergency_phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Kesehatan */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-3">Kesehatan</h2>
            <p className="text-xs text-slate-400">{pilgrim.health_notes || 'Tidak ada catatan kesehatan.'}</p>
          </div>

          {/* Pendaftaran Paket */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-4">Pendaftaran Paket</h2>
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{pilgrim.package_name || 'Umroh Reguler 9 Hari'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {pilgrim.registration_code || 'REG-00001'} &bull; {pilgrim.registration_date || '14 Nov 2025'}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#e0f2fe] text-[#0284c7]">
                {pilgrim.registration_status || 'Dikonfirmasi'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Card) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-4">Ringkasan</h2>
            <div className="divide-y divide-slate-100 text-[12px]">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#dcfce7] text-[#16a34a]">
                  {pilgrim.status || 'Aktif'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Cabang</span>
                <span className="font-normal text-slate-700">{pilgrim.branch_name || 'Kantor Pusat Jakarta'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Agen</span>
                <span className="font-normal text-slate-700">{pilgrim.agent_name || '-'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Akses Login</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#dcfce7] text-[#16a34a]">
                  {pilgrim.login_access || 'Aktif'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Dokumen</span>
                <span className="font-normal text-slate-700">{pilgrim.document_count || 6} Berkas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
