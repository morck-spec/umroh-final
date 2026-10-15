import { getPackageChoices } from '@/app/dashboard/shared/actions/announcements';
import AnnouncementFormClient from '@/components/dashboard/AnnouncementFormClient';

export const metadata = {
  title: 'Tambah Pengumuman | Travel Umroh & Haji',
};

export default async function AdminCabangAnnouncementsCreatePage() {
  const packageChoices = await getPackageChoices();
  return (
    <AnnouncementFormClient
      packageChoices={packageChoices}
      basePath="/dashboard/admin_cabang/announcements"
      isEdit={false}
    />
  );
}
