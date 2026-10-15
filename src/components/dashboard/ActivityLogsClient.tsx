'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ActivityLogItem } from '@/app/dashboard/shared/actions/activity_logs';

interface ActivityLogsClientProps {
  initialLogs: ActivityLogItem[];
}

export default function ActivityLogsClient({ initialLogs }: ActivityLogsClientProps) {
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [appliedAction, setAppliedAction] = useState<string>('all');
  const [appliedUser, setAppliedUser] = useState<string>('all');

  // Extract unique actions and users for filter options
  const actionsList = useMemo(() => {
    const set = new Set<string>();
    initialLogs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set);
  }, [initialLogs]);

  const usersList = useMemo(() => {
    const set = new Set<string>();
    initialLogs.forEach((l) => {
      if (l.user_name) set.add(l.user_name);
    });
    return Array.from(set);
  }, [initialLogs]);

  const handleApplyFilter = () => {
    setAppliedAction(selectedAction);
    setAppliedUser(selectedUser);
  };

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      if (appliedAction !== 'all' && log.action.toLowerCase() !== appliedAction.toLowerCase()) {
        return false;
      }
      if (appliedUser !== 'all' && log.user_name !== appliedUser) {
        return false;
      }
      return true;
    });
  }, [initialLogs, appliedAction, appliedUser]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1">
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
            Beranda
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600">Log Aktivitas</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Log Aktivitas</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">Riwayat aktivitas pengguna</p>
      </div>

      {/* Main Card with Filters & Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="relative">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="h-[34px] rounded-md border border-slate-300 bg-white px-3 pr-8 text-[12px] text-slate-700 appearance-none focus:outline-none focus:border-teal-500 cursor-pointer min-w-[130px]"
            >
              <option value="all">Semua Aksi</option>
              {actionsList.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* User Filter */}
          <div className="relative">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="h-[34px] rounded-md border border-slate-300 bg-white px-3 pr-8 text-[12px] text-slate-700 appearance-none focus:outline-none focus:border-teal-500 cursor-pointer min-w-[150px]"
            >
              <option value="all">Semua Pengguna</option>
              {usersList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={handleApplyFilter}
            className="h-[34px] px-4 rounded-md border border-slate-300 bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                <th className="py-3 px-4 sm:px-6">WAKTU</th>
                <th className="py-3 px-4">PENGGUNA</th>
                <th className="py-3 px-4">AKSI</th>
                <th className="py-3 px-4">DESKRIPSI</th>
                <th className="py-3 px-4 sm:px-6 text-right sm:text-left">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[13px] text-slate-400">
                    Tidak ada aktivitas ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors text-[12px]">
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700 whitespace-nowrap">
                      {log.time_formatted}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {log.user_name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 min-w-[280px]">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-mono text-right sm:text-left whitespace-nowrap">
                      {log.ip_address}
                    </td>
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
