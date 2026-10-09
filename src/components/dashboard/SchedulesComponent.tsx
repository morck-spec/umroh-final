'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SchedulesComponent({ role }: { role: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('departure_date', { ascending: true });

      if (!error && data) {
        setPackages(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) return <div className="animate-pulse p-4 text-slate-500">Memuat Jadwal...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Paket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Keberangkatan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Kepulangan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {packages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                  Belum ada jadwal keberangkatan yang tersedia.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => {
                const today = new Date();
                const start = pkg.departure_date ? new Date(pkg.departure_date) : null;

                let end = null;
                if (start && pkg.duration_days) {
                  end = new Date(start);
                  end.setDate(end.getDate() + pkg.duration_days - 1);
                }

                let status = 'Akan Datang';
                let color = 'bg-blue-100 text-blue-800';

                if (start && end) {
                  if (today > end) {
                    status = 'Selesai';
                    color = 'bg-slate-100 text-slate-800';
                  } else if (today >= start && today <= end) {
                    status = 'Sedang Berlangsung';
                    color = 'bg-emerald-100 text-emerald-800';
                  }
                } else if (!start) {
                  status = 'Belum Dijadwalkan';
                  color = 'bg-amber-100 text-amber-800';
                }

                return (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{pkg.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{start ? start.toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{end ? end.toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
