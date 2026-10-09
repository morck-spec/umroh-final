'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ReportsComponent({ role }: { role: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ totalJamaah: 0, totalPayments: 0, totalPackages: 0 });

  useEffect(() => {
    async function fetchData() {
      // In a real scenario, this would use aggregation RPC or specialized queries.
      // For now, doing simple counts using standard select with count.
      const { count: jamaahCount } = await supabase.from('jamaah').select('*', { count: 'exact', head: true });
      const { data: payments } = await supabase.from('payments').select('amount');
      const { count: pkgCount } = await supabase.from('packages').select('*', { count: 'exact', head: true });

      const totalAmount = payments?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      setData({
        totalJamaah: jamaahCount || 0,
        totalPayments: totalAmount,
        totalPackages: pkgCount || 0
      });
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) return <div className="animate-pulse p-4 text-slate-500">Memuat Laporan...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
        <h3 className="text-sm font-medium text-slate-500 mb-1">Total Jamaah</h3>
        <p className="text-3xl font-bold text-slate-800">{data.totalJamaah}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
        <h3 className="text-sm font-medium text-slate-500 mb-1">Total Paket Aktif</h3>
        <p className="text-3xl font-bold text-slate-800">{data.totalPackages}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
        <h3 className="text-sm font-medium text-slate-500 mb-1">Total Pembayaran Masuk</h3>
        <p className="text-3xl font-bold text-emerald-600">Rp {data.totalPayments.toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
