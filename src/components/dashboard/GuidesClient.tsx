'use client';

import { useState } from 'react';
import { createGuide, updateGuide, deleteGuide } from '@/app/dashboard/shared/actions/guides';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function GuidesClient({ initialGuides, role }: { initialGuides: any[], role: string }) {
  const [guides, setGuides] = useState(initialGuides);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingId) {
        const res = await updateGuide(editingId, formData);
        if (res?.error) alert(res.error);
        else window.location.reload();
      } else {
        const res = await createGuide(formData);
        if (res?.error) alert(res.error);
        else window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus pembimbing ini?')) {
      const res = await deleteGuide(id);
      if (res?.error) alert(res.error);
      else setGuides(guides.filter(g => g.id !== id));
    }
  }

  function openModal(guide?: any) {
    if (guide) setEditingId(guide.id);
    else setEditingId(null);
    setIsModalOpen(true);
  }

  const editGuide = guides.find(g => g.id === editingId);

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Daftar Pembimbing/Muthawif</h3>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Tambah Pembimbing
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kontak</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pengalaman / Bio</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {guides.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada data pembimbing.</td>
              </tr>
            ) : (
              guides.map((guide) => (
                <tr key={guide.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{guide.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{guide.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{guide.experience || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openModal(guide)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(guide.id)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-slate-900">{editingId ? 'Edit Pembimbing' : 'Tambah Pembimbing'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama <span className="text-red-500">*</span></label>
                      <input type="text" name="name" id="name" required defaultValue={editGuide?.name} className="input-field" placeholder="Cth: Ustadz Ahmad" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Nomor Kontak</label>
                      <input type="text" name="phone" id="phone" defaultValue={editGuide?.phone} className="input-field" placeholder="Cth: 08123456789" />
                    </div>
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-slate-700">Pengalaman / Biografi Singkat</label>
                      <textarea name="experience" id="experience" rows={3} defaultValue={editGuide?.experience} className="input-field" placeholder="Cth: 5 Tahun muthawif di Makkah"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
                  <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">{isLoading ? 'Menyimpan...' : 'Simpan Data'}</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary w-full sm:w-auto">Batal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
