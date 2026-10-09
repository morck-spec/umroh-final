'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ProfileComponent from '@/components/dashboard/ProfileComponent';

export default function JamaahProfileComponent() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [profile, setProfile] = useState({
    id: '',
    full_name: '',
    phone: '',
    emergency_contact: '',
    birth_date: ''
  });

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from('jamaah')
        .select('*')
        .eq('profile_id', userData.user.id)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || '',
          phone: data.phone || '',
          emergency_contact: data.emergency_contact || '',
          birth_date: data.birth_date || ''
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('jamaah')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        emergency_contact: profile.emergency_contact,
        birth_date: profile.birth_date || null
      })
      .eq('id', profile.id);

    if (!error) {
      setMessage('Profil berhasil diperbarui!');
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse p-4 text-slate-500">Memuat Profil...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Data Pribadi</h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          {message && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-100">{message}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={e => setProfile({...profile, full_name: e.target.value})}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={profile.birth_date}
                onChange={e => setProfile({...profile, birth_date: e.target.value})}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kontak Darurat (Nama & No HP)</label>
            <input
              type="text"
              value={profile.emergency_contact}
              onChange={e => setProfile({...profile, emergency_contact: e.target.value})}
              className="input-field"
              placeholder="Contoh: Budi (Istri) - 0812345678"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Security Profile Component */}
      <ProfileComponent role="jamaah" />
    </div>
  );
}
