'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Clock, Check, Banknote, XCircle, ChevronDown } from 'lucide-react';
import { CommissionItem, updateCommissionStatus } from '@/app/dashboard/shared/actions/commissions';

interface Props {
  initialItems: CommissionItem[];
  basePath?: string;
  role?: string;
}

export default function CommissionsClient({
  initialItems,
  basePath = '/dashboard/superadmin/commissions',
  role = 'super_admin',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isMitra = role === 'mitra_agen' || pathname.includes('/mitra');
  const activeBasePath = pathname.startsWith('/commissions') ? '/commissions' : basePath;

  const [items, setItems] = useState<CommissionItem[]>(initialItems);
  const [filterStatus, setFilterStatus] = useState<string>('Semua Status');
  const [filterAgent, setFilterAgent] = useState<string>('Semua Agen');
  const [appliedStatus, setAppliedStatus] = useState<string>('Semua Status');
  const [appliedAgent, setAppliedAgent] = useState<string>('Semua Agen');
  const [isPending, startTransition] = useTransition();

  // Dynamic list of unique agents
  const agentNames = Array.from(new Set(items.map((i) => i.agent_name)));

  // Calculate live stats
  const menungguItems = items.filter((i) => i.status === 'Menunggu');
  const disetujuiItems = items.filter((i) => i.status === 'Disetujui');
  const dibayarItems = items.filter((i) => i.status === 'Dibayar');
  const dibatalkanItems = items.filter((i) => i.status === 'Dibatalkan');

  const menungguTotal = menungguItems.reduce((acc, cur) => acc + cur.commission_amount, 0);
  const disetujuiTotal = disetujuiItems.reduce((acc, cur) => acc + cur.commission_amount, 0);
  const dibayarTotal = dibayarItems.reduce((acc, cur) => acc + cur.commission_amount, 0);
  const dibatalkanTotal = dibatalkanItems.reduce((acc, cur) => acc + cur.commission_amount, 0);

  function formatRp(val: number) {
    return `Rp ${val.toLocaleString('id-ID')}`;
  }

  function renderStatusBadge(status: CommissionItem['status']) {
    if (status === 'Dibayar') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          Dibayar
        </span>
      );
    }
    if (status === 'Disetujui') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
          Disetujui
        </span>
      );
    }
    if (status === 'Dibatalkan') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
          Dibatalkan
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
        Menunggu
      </span>
    );
  }

  async function handleStatusChange(id: string, newStatus: CommissionItem['status']) {
    startTransition(async () => {
      const res = await updateCommissionStatus(id, newStatus);
      if (res.error) {
        alert(res.error);
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id || item.legacy_id === id ? { ...item, status: newStatus } : item
          )
        );
        router.refresh();
      }
    });
  }

  function handleApplyFilter() {
    setAppliedStatus(filterStatus);
    setAppliedAgent(filterAgent);
  }

  const filteredItems = items.filter((item) => {
    if (appliedStatus !== 'Semua Status' && item.status !== appliedStatus) return false;
    if (appliedAgent !== 'Semua Agen' && item.agent_name !== appliedAgent) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href={isMitra ? '/dashboard/mitra' : activeBasePath.includes('admin_cabang') ? '/dashboard/admin_cabang' : '/dashboard/superadmin'}
          className="hover:text-slate-600 transition-colors"
        >
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">Komisi Agen</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Komisi Agen</h1>
        <p className="text-xs text-slate-500 mt-1">Rekap &amp; pembayaran komisi agen</p>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Menunggu */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Menunggu</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mt-0.5">
              {formatRp(menungguTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{menungguItems.length} komisi</div>
          </div>
        </div>

        {/* Disetujui */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center shrink-0 text-sky-600">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Disetujui</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mt-0.5">
              {formatRp(disetujuiTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{disetujuiItems.length} komisi</div>
          </div>
        </div>

        {/* Dibayar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-600">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Dibayar</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mt-0.5">
              {formatRp(dibayarTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{dibayarItems.length} komisi</div>
          </div>
        </div>

        {/* Dibatalkan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center shrink-0 text-rose-500">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Dibatalkan</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mt-0.5">
              {formatRp(dibatalkanTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{dibatalkanItems.length} komisi</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
        >
          <option value="Semua Status">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Dibayar">Dibayar</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>

        {!isMitra && (
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-3.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
          >
            <option value="Semua Agen">Semua Agen</option>
            {agentNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={handleApplyFilter}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-lg border border-slate-200/90 font-medium transition-colors shadow-sm"
        >
          Filter
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4">AGEN</th>
                <th className="px-5 py-4">JAMAAH</th>
                <th className="px-5 py-4">PAKET</th>
                <th className="px-5 py-4">DASAR</th>
                <th className="px-5 py-4">RATE</th>
                <th className="px-5 py-4">KOMISI</th>
                <th className="px-5 py-4">STATUS</th>
                {!isMitra && <th className="px-5 py-4 text-right"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isMitra ? 7 : 8} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Tidak ada data komisi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap text-sm">
                      {item.agent_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.jamaah_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.package_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {formatRp(item.base_amount)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-sm">
                      {item.rate.toFixed(2)}%
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap text-sm">
                      {formatRp(item.commission_amount)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>
                    {!isMitra && (
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {item.status === 'Dibayar' ? (
                          <span className="text-xs text-slate-400 font-medium px-2 py-1">
                            Final
                          </span>
                        ) : (
                          <div className="inline-block relative">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  item.id,
                                  e.target.value as CommissionItem['status']
                                )
                              }
                              disabled={isPending}
                              className="appearance-none bg-white border border-[#2563EB] text-[#2563EB] hover:bg-blue-50/40 text-xs font-medium pl-3 pr-7 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              <option value={item.status}>Ubah status...</option>
                              <option value="Menunggu">Menunggu</option>
                              <option value="Disetujui">Disetujui</option>
                              <option value="Dibayar">Dibayar</option>
                              <option value="Dibatalkan">Dibatalkan</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#2563EB] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
