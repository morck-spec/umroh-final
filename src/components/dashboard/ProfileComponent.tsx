'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ProfileComponent({ role }: { role: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    // Update password via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Password berhasil diperbarui.');
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Profil Akun ({role})</h2>
        <p className="text-slate-500 mb-6 text-sm">Anda dapat mengubah pengaturan keamanan dan password Anda di sini.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {message && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-100">{message}</div>}
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="Minimal 6 karakter"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Ketik ulang password baru"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
