import { getAnnouncementList } from '@/app/dashboard/shared/actions/announcements';
import AnnouncementListClient from '@/components/dashboard/AnnouncementListClient';

export const metadata = {
  title: 'Pengumuman | Travel Umroh & Haji',
};

export default async function AdminCabangAnnouncementsPage() {
  const items = await getAnnouncementList();
  return <AnnouncementListClient initialItems={items} basePath="/dashboard/admin_cabang/announcements" />;
}
