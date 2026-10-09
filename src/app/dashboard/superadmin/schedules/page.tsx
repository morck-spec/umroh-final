import SchedulesComponent from '@/components/dashboard/SchedulesComponent';

export default function SuperAdminSchedules() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Jadwal Keberangkatan</h1>
      </div>
      <SchedulesComponent role="super_admin" />
    </div>
  );
}