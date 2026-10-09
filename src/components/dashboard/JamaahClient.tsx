'use client';

import { useState } from 'react';
import { createJamaah, updateJamaah, deleteJamaah } from '@/app/dashboard/shared/actions/jamaah';
import { Plus, Edit2, Trash2, X, Eye, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function JamaahClient({ initialJamaah, branches, role, currentBranchId }: { initialJamaah: any[], branches: any[], role: string, currentBranchId?: string }) {
  const [jamaahData, setJamaahData] = useState(initialJamaah);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingId) {
        const res = await updateJamaah(editingId, formData, currentBranchId);
        if (res?.error) alert(res.error);
        else {
          window.location.reload();
        }
      } else {
        const res = await createJamaah(formData, currentBranchId);
        if (res?.error) alert(res.error);
        else {
          window.location.reload();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus data jamaah ini? Seluruh data pendaftaran dan pembayaran terkait akan terhapus juga (Cascade).')) {
      const res = await deleteJamaah(id);
      if (res?.error) alert(res.error);
      else setJamaahData(jamaahData.filter(j => j.id !== id));
    }
  }

  function openModal(jamaah?: any) {
    if (jamaah) setEditingId(jamaah.id);
    else setEditingId(null);
    setIsModalOpen(true);
  }

  const editJamaah = jamaahData.find(j => j.id === editingId);

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Daftar Jamaah</h3>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Pendaftaran Jamaah Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Jamaah</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kontak</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIK</th>
              {role !== 'admin_cabang' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cabang</th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Akun</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {jamaahData.length === 0 ? (
              <tr>
                <td colSpan={role !== 'admin_cabang' ? 6 : 5} className="px-6 py-8 text-center text-sm text-slate-500">
                  Belum ada data jamaah.
                </td>
              </tr>
            ) : (
              jamaahData.map((jamaah) => (
                <tr key={jamaah.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{jamaah.full_name || jamaah.profiles?.full_name}</div>
                    <div className="text-xs text-slate-500">{jamaah.gender === 'L' ? 'Laki-laki' : jamaah.gender === 'P' ? 'Perempuan' : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div>{jamaah.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {jamaah.nik || '-'}
                  </td>
                  {role !== 'admin_cabang' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {jamaah.branches?.name || 'Pusat/Umum'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {jamaah.profile_id ? (
                      <span className="inline-flex items-center text-emerald-600">
                        <CheckCircle className="w-4 h-4 mr-1" /> Terhubung
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-600">
                        <Clock className="w-4 h-4 mr-1" /> Belum Ada Akun
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openModal(jamaah)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(jamaah.id)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={() => setIsModalOpen(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                      {editingId ? 'Edit Data Jamaah' : 'Pendaftaran Jamaah Baru'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">Nama Lengkap Sesuai KTP <span className="text-red-500">*</span></label>
                      <input type="text" name="full_name" id="full_name" required defaultValue={editJamaah?.full_name || editJamaah?.profiles?.full_name} className="input-field" placeholder="Cth: Ahmad Fulan" />
                    </div>

                    <div>
                      <label htmlFor="nik" className="block text-sm font-medium text-slate-700">NIK (Nomor Induk Kependudukan)</label>
                      <input type="text" name="nik" id="nik" defaultValue={editJamaah?.nik} className="input-field" placeholder="16 Digit NIK" maxLength={16} />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Nomor Telepon/WhatsApp <span className="text-red-500">*</span></label>
                      <input type="text" name="phone" id="phone" required defaultValue={editJamaah?.phone} className="input-field" placeholder="Cth: 08123456789" />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
                      <select name="gender" id="gender" defaultValue={editJamaah?.gender || ''} className="input-field">
                        <option value="">-- Pilih --</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700">Tanggal Lahir</label>
                      <input type="date" name="birth_date" id="birth_date" defaultValue={editJamaah?.birth_date} className="input-field" />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="emergency_contact" className="block text-sm font-medium text-slate-700">Kontak Darurat (Nama & Nomor)</label>
                      <input type="text" name="emergency_contact" id="emergency_contact" defaultValue={editJamaah?.emergency_contact} className="input-field" placeholder="Cth: Istri - 0812345678" />
                    </div>

                    {role !== 'admin_cabang' && (
                      <div className="md:col-span-2">
                        <label htmlFor="branch_id" className="block text-sm font-medium text-slate-700">Afiliasi Cabang</label>
                        <select name="branch_id" id="branch_id" defaultValue={editJamaah?.branch_id || ''} className="input-field">
                          <option value="">-- Pusat/Umum --</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
                  <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
                    {isLoading ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary w-full sm:w-auto">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
