import { getPackageChoices } from '@/app/dashboard/shared/actions/announcements';
import AnnouncementFormClient from '@/components/dashboard/AnnouncementFormClient';

export const metadata = {
  title: 'Tambah Pengumuman | Travel Umroh & Haji',
};

export default async function SuperAdminAnnouncementsCreatePage() {
  const packageChoices = await getPackageChoices();
  return (
    <AnnouncementFormClient
      packageChoices={packageChoices}
      basePath="/dashboard/superadmin/announcements"
      isEdit={false}
    />
  );
}
