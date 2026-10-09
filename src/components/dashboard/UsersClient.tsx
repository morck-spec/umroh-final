'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/dashboard/shared/actions/users';
import { Edit2, X, ShieldAlert } from 'lucide-react';

export default function UsersClient({ initialUsers, branches }: { initialUsers: any[], branches: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingId) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await updateUserRole(editingId, formData);
      if (res?.error) alert(res.error);
      else {
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(user: any) {
    setEditingId(user.id);
    setSelectedRole(user.role);
    setIsModalOpen(true);
  }

  const editUser = users.find(u => u.id === editingId);

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Manajemen Pengguna & Hak Akses</h3>
      </div>

      <div className="p-4 bg-blue-50 text-blue-800 text-sm flex gap-3 border-b border-blue-100">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-blue-600" />
        <p>
          Semua pendaftaran baru otomatis menjadi <strong>Jamaah</strong>. Gunakan halaman ini untuk menaikkan level pengguna menjadi <strong>Admin</strong> atau <strong>Admin Cabang</strong>.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama & Kontak</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role Saat Ini</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Afiliasi Cabang</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                  Belum ada data pengguna.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{user.full_name}</div>
                    <div className="text-sm text-slate-500">{user.phone || 'Belum diisi'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'admin_cabang' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.role === 'admin_cabang' ? (user.branches?.name || <span className="text-red-500">Cabang Tidak Valid</span>) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openModal(user)}
                      disabled={user.role === 'super_admin'}
                      className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Ubah Role"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && editUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={() => setIsModalOpen(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                      Ubah Role Pengguna
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Pengguna</p>
                      <p className="text-base font-semibold text-slate-900">{editUser.full_name}</p>
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role / Hak Akses</label>
                      <select
                        name="role"
                        id="role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="input-field"
                      >
                        <option value="jamaah">Jamaah (Hanya bisa akses data sendiri)</option>
                        <option value="admin">Admin Pusat (Bisa akses seluruh operasional)</option>
                        <option value="admin_cabang">Admin Cabang (Hanya operasional cabang)</option>
                      </select>
                    </div>

                    {selectedRole === 'admin_cabang' && (
                      <div>
                        <label htmlFor="branch_id" className="block text-sm font-medium text-slate-700">Pilih Cabang <span className="text-red-500">*</span></label>
                        <select name="branch_id" id="branch_id" required defaultValue={editUser.branch_id || ''} className="input-field">
                          <option value="">-- Pilih Cabang --</option>
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
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
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
