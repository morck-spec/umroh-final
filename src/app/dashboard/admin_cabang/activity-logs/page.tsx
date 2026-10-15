import { getActivityLogs } from '@/app/dashboard/shared/actions/activity_logs';
import ActivityLogsClient from '@/components/dashboard/ActivityLogsClient';

export const metadata = {
  title: 'Log Aktivitas | Sistem Manajemen Umroh & Haji',
};

export default async function AdminCabangActivityLogsPage() {
  const logs = await getActivityLogs();

  return <ActivityLogsClient initialLogs={logs} />;
}
