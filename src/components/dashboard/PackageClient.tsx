'use client';

import { useState } from 'react';
import { createPackage, updatePackage, deletePackage } from '@/app/dashboard/shared/actions/packages';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function PackageClient({ initialPackages, role }: { initialPackages: any[], role: string }) {
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingId) {
        const res = await updatePackage(editingId, formData);
        if (res?.error) alert(res.error);
        else {
          window.location.reload();
        }
      } else {
        const res = await createPackage(formData);
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
    if (confirm('Yakin ingin menghapus paket ini? Pastikan tidak ada jamaah yang terdaftar.')) {
      const res = await deletePackage(id);
      if (res?.error) alert(res.error);
      else setPackages(packages.filter(p => p.id !== id));
    }
  }

  function openModal(pkg?: any) {
    if (pkg) setEditingId(pkg.id);
    else setEditingId(null);
    setIsModalOpen(true);
  }

  const editPkg = packages.find(p => p.id === editingId);

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Daftar Paket</h3>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Paket
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Paket</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durasi</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Keberangkatan</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Harga</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sisa Kuota</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {packages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                  Belum ada data paket umroh.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => {
                const registeredCount = pkg.registrations?.[0]?.count || 0;
                const quotaRemaining = pkg.quota > 0 ? pkg.quota - registeredCount : 'Unlimited';

                return (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{pkg.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pkg.duration_days} Hari</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {pkg.departure_date ? new Date(pkg.departure_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className={typeof quotaRemaining === 'number' && quotaRemaining < 10 ? 'text-orange-600 font-medium' : ''}>
                        {quotaRemaining}
                      </span>
                      {pkg.quota > 0 && <span className="text-slate-400 text-xs ml-1">/ {pkg.quota}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => openModal(pkg)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
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
                      {editingId ? 'Edit Paket Umroh' : 'Tambah Paket Baru'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Paket <span className="text-red-500">*</span></label>
                      <input type="text" name="name" id="name" required defaultValue={editPkg?.name} className="input-field" placeholder="Cth: Umroh VIP Ramadhan" />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-slate-700">Deskripsi/Fasilitas</label>
                      <textarea name="description" id="description" rows={3} defaultValue={editPkg?.description} className="input-field" placeholder="Cth: Hotel Bintang 5, Penerbangan Direct..."></textarea>
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-slate-700">Harga (Rp) <span className="text-red-500">*</span></label>
                      <input type="number" name="price" id="price" required defaultValue={editPkg?.price} className="input-field" placeholder="Cth: 35000000" />
                    </div>

                    <div>
                      <label htmlFor="duration_days" className="block text-sm font-medium text-slate-700">Durasi (Hari) <span className="text-red-500">*</span></label>
                      <input type="number" name="duration_days" id="duration_days" required defaultValue={editPkg?.duration_days} className="input-field" placeholder="Cth: 9" />
                    </div>

                    <div>
                      <label htmlFor="departure_date" className="block text-sm font-medium text-slate-700">Tanggal Keberangkatan</label>
                      <input type="date" name="departure_date" id="departure_date" defaultValue={editPkg?.departure_date ? editPkg.departure_date.split('T')[0] : ''} className="input-field" />
                    </div>

                    <div>
                      <label htmlFor="quota" className="block text-sm font-medium text-slate-700">Kuota (Biarkan kosong jika unlimited)</label>
                      <input type="number" name="quota" id="quota" defaultValue={editPkg?.quota} className="input-field" placeholder="Cth: 45" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
                  <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
                    {isLoading ? 'Menyimpan...' : 'Simpan Paket'}
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
