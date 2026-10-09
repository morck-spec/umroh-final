import ReportsComponent from '@/components/dashboard/ReportsComponent';

export default function AdminCabangReports() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Laporan Cabang</h1>
      </div>
      <ReportsComponent role="admin_cabang" />
    </div>
  );
}