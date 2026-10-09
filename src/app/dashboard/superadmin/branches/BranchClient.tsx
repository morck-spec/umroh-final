'use client';

import { useState } from 'react';
import { createBranch, updateBranch, deleteBranch } from './actions';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function BranchClient({ initialBranches }: { initialBranches: any[] }) {
  const [branches, setBranches] = useState(initialBranches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingId) {
        const res = await updateBranch(editingId, formData);
        if (res?.error) alert(res.error);
        else {
          // Optimistic update
          setBranches(branches.map(b => b.id === editingId ? {
            ...b,
            name: formData.get('name'),
            address: formData.get('address'),
            contact_number: formData.get('contact_number')
          } : b));
          setIsModalOpen(false);
        }
      } else {
        const res = await createBranch(formData);
        if (res?.error) alert(res.error);
        else {
          // Refresh page or trigger a real revalidate but since we are client side and revalidatePath works on server, we can just reload or rely on server action redirect/revalidate.
          // For simplicity, reload window since revalidatePath will send fresh HTML on next navigation.
          window.location.reload();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus cabang ini?')) {
      const res = await deleteBranch(id);
      if (res?.error) alert(res.error);
      else setBranches(branches.filter(b => b.id !== id));
    }
  }

  function openModal(branch?: any) {
    if (branch) setEditingId(branch.id);
    else setEditingId(null);
    setIsModalOpen(true);
  }

  const editBranch = branches.find(b => b.id === editingId);

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Daftar Cabang</h3>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Cabang
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Cabang</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kontak</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {branches.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                  Belum ada data cabang.
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{branch.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{branch.address || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{branch.contact_number || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openModal(branch)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded">
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
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                      {editingId ? 'Edit Cabang' : 'Tambah Cabang Baru'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Cabang <span className="text-red-500">*</span></label>
                      <input type="text" name="name" id="name" required defaultValue={editBranch?.name} className="input-field" placeholder="Cth: Cabang Jakarta Selatan" />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-slate-700">Alamat Lengkap</label>
                      <textarea name="address" id="address" rows={3} defaultValue={editBranch?.address} className="input-field" placeholder="Cth: Jl. Jend. Sudirman..."></textarea>
                    </div>
                    <div>
                      <label htmlFor="contact_number" className="block text-sm font-medium text-slate-700">Nomor Kontak</label>
                      <input type="text" name="contact_number" id="contact_number" defaultValue={editBranch?.contact_number} className="input-field" placeholder="Cth: 081234567890" />
                    </div>
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
