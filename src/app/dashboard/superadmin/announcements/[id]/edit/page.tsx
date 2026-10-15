import { notFound } from 'next/navigation';
import { getAnnouncementDetail, getPackageChoices } from '@/app/dashboard/shared/actions/announcements';
import AnnouncementFormClient from '@/components/dashboard/AnnouncementFormClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Pengumuman | Travel Umroh & Haji',
};

export default async function SuperAdminAnnouncementsEditPage({ params }: Props) {
  const { id } = await params;
  const item = await getAnnouncementDetail(id);

  if (!item) {
    notFound();
  }

  const packageChoices = await getPackageChoices();

  return (
    <AnnouncementFormClient
      initialItem={item}
      packageChoices={packageChoices}
      basePath="/dashboard/superadmin/announcements"
      isEdit={true}
    />
  );
}
