'use client';

import { useState } from 'react';
import { createRegistration, updateRegistrationStatus, deleteRegistration } from '@/app/dashboard/shared/actions/registrations';
import { Plus, Check, X, Trash2 } from 'lucide-react';

export default function RegistrationsClient({
  initialRegistrations,
  jamaahList,
  packagesList,
  role
}: {
  initialRegistrations: any[],
  jamaahList: any[],
  packagesList: any[],
  role: string
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await createRegistration(formData);
      if (res?.error) alert(res.error);
      else window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatus(id: string, status: string) {
    if (confirm(`Yakin mengubah status menjadi ${status}?`)) {
      const res = await updateRegistrationStatus(id, status);
      if (res?.error) alert(res.error);
      else window.location.reload();
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin membatalkan/menghapus pendaftaran ini?')) {
      const res = await deleteRegistration(id);
      if (res?.error) alert(res.error);
      else setRegistrations(registrations.filter(r => r.id !== id));
    }
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Daftar Pendaftaran</h3>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Pendaftaran Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jamaah</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paket</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {registrations.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada pendaftaran.</td></tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(reg.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{reg.jamaah?.full_name}</div>
                    <div className="text-xs text-slate-500">{reg.jamaah?.phone} | {reg.jamaah?.branches?.name || 'Pusat'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{reg.packages?.name}</div>
                    <div className="text-xs text-slate-500">
                      {reg.packages?.departure_date ? new Date(reg.packages.departure_date).toLocaleDateString('id-ID') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${reg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        reg.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {reg.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatus(reg.id, 'approved')} className="text-emerald-600 hover:text-emerald-900 p-1 bg-emerald-50 rounded" title="Approve"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleStatus(reg.id, 'cancelled')} className="text-orange-600 hover:text-orange-900 p-1 bg-orange-50 rounded" title="Cancel"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    <button onClick={() => handleDelete(reg.id)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
                    <h3 className="text-lg leading-6 font-medium text-slate-900">Pendaftaran Umroh Baru</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="jamaah_id" className="block text-sm font-medium text-slate-700">Pilih Jamaah <span className="text-red-500">*</span></label>
                      <select name="jamaah_id" id="jamaah_id" required className="input-field">
                        <option value="">-- Pilih Jamaah --</option>
                        {jamaahList.map(j => (
                          <option key={j.id} value={j.id}>{j.full_name} ({j.nik || j.phone})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="package_id" className="block text-sm font-medium text-slate-700">Pilih Paket <span className="text-red-500">*</span></label>
                      <select name="package_id" id="package_id" required className="input-field">
                        <option value="">-- Pilih Paket --</option>
                        {packagesList.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString('id-ID')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
                  <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">{isLoading ? 'Menyimpan...' : 'Buat Pendaftaran'}</button>
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
