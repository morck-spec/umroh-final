'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  EquipmentItem,
  JamaahOption,
  createEquipment,
  updateEquipment,
} from '@/app/dashboard/shared/actions/equipment';

interface Props {
  initialItem?: EquipmentItem | null;
  jamaahOptions: JamaahOption[];
  basePath?: string;
  isEdit?: boolean;
}

export default function EquipmentFormClient({
  initialItem,
  jamaahOptions,
  basePath = '/dashboard/superadmin/equipment',
  isEdit = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeBasePath = pathname.startsWith('/equipment') ? '/equipment' : basePath;

  const [isPending, startTransition] = useTransition();

  // Find initial selected jamaah option
  const initialJamaahVal = initialItem
    ? `${initialItem.jamaah_name}::${initialItem.package_name || ''}`
    : jamaahOptions[0]
    ? `${jamaahOptions[0].jamaah_name}::${jamaahOptions[0].package_name}`
    : '';

  const [selectedJamaahKey, setSelectedJamaahKey] = useState<string>(initialJamaahVal);
  const [item, setItem] = useState<string>(initialItem?.item || 'Koper');
  const [size, setSize] = useState<string>(initialItem?.size || '28 inch');
  const [qty, setQty] = useState<number>(initialItem?.qty || 1);
  const [status, setStatus] = useState<'Belum Disiapkan' | 'Disiapkan' | 'Sudah Diserahkan'>(
    initialItem?.status || 'Belum Disiapkan'
  );
  const [handedOverDate, setHandedOverDate] = useState<string>(
    initialItem?.handed_over_date || ''
  );
  const [notes, setNotes] = useState<string>(initialItem?.notes || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const [jName, pName] = selectedJamaahKey.split('::');

    startTransition(async () => {
      if (isEdit && initialItem) {
        const res = await updateEquipment(initialItem.id, {
          jamaah_name: jName || initialItem.jamaah_name,
          package_name: pName || initialItem.package_name,
          item,
          size: size || '-',
          qty: Number(qty) || 1,
          status,
          handed_over_date: status === 'Sudah Diserahkan' ? handedOverDate || new Date().toISOString().split('T')[0] : '',
          notes,
        });

        if (res.error) {
          alert(res.error);
        } else {
          alert('Perlengkapan berhasil diperbarui!');
          router.push(activeBasePath);
          router.refresh();
        }
      } else {
        const res = await createEquipment({
          jamaah_name: jName || 'Fitri Handayani',
          package_name: pName || 'Umroh Reguler 9 Hari',
          item,
          size: size || '-',
          qty: Number(qty) || 1,
          status,
          handed_over_date: status === 'Sudah Diserahkan' ? handedOverDate || new Date().toISOString().split('T')[0] : '',
          notes,
        });

        if (res.error) {
          alert(res.error);
        } else {
          alert('Perlengkapan berhasil ditambahkan!');
          router.push(activeBasePath);
          router.refresh();
        }
      }
    });
  }

  const title = isEdit ? 'Edit Perlengkapan' : 'Tambah Perlengkapan';
  const subtitle = isEdit ? initialItem?.item || 'Perlengkapan' : 'Form distribusi perlengkapan jamaah';
  const backHref = activeBasePath;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={activeBasePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'}
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href={activeBasePath} className="hover:text-slate-600 transition-colors">
          Perlengkapan
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">{isEdit ? 'Edit' : 'Tambah'}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Jamaah */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Jamaah <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedJamaahKey}
              onChange={(e) => setSelectedJamaahKey(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            >
              {jamaahOptions.map((opt) => (
                <option key={opt.id} value={`${opt.jamaah_name}::${opt.package_name}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Item & Ukuran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Item <span className="text-rose-500">*</span>
              </label>
              <select
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                <option value="Koper">Koper</option>
                <option value="Seragam">Seragam</option>
                <option value="Kain Ihram">Kain Ihram</option>
                <option value="Buku Doa">Buku Doa</option>
                <option value="Tas Paspor">Tas Paspor</option>
                <option value="Mukena">Mukena</option>
                <option value="Batik">Batik</option>
                <option value="Payung">Payung</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Ukuran</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="28 inch / M / L"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>
          </div>

          {/* Jumlah & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Jumlah <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Belum Disiapkan' | 'Disiapkan' | 'Sudah Diserahkan')
                }
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                <option value="Belum Disiapkan">Belum Disiapkan</option>
                <option value="Disiapkan">Disiapkan</option>
                <option value="Sudah Diserahkan">Sudah Diserahkan</option>
              </select>
            </div>
          </div>

          {/* Tanggal Diserahkan */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tanggal Diserahkan
            </label>
            <input
              type="date"
              value={handedOverDate}
              onChange={(e) => setHandedOverDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Catatan</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
            >
              {isPending
                ? 'Menyimpan...'
                : isEdit
                ? 'Simpan Perubahan'
                : 'Simpan Perlengkapan'}
            </button>
            <Link
              href={backHref}
              className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
