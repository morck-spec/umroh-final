import ReportsComponent from '@/components/dashboard/ReportsComponent';

export default function SuperAdminReports() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan & Jamaah</h1>
      </div>
      <ReportsComponent role="super_admin" />
    </div>
  );
}