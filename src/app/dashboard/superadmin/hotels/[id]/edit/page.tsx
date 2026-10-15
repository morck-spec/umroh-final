import { getHotelDetail } from '@/app/dashboard/shared/actions/masterData';
import HotelFormClient from '@/components/dashboard/HotelFormClient';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Hotel | Travel Umroh & Haji',
};

interface EditHotelPageProps {
  params: Promise<{ id: string }>;
}

export default async function SuperAdminEditHotelPage({ params }: EditHotelPageProps) {
  const { id } = await params;
  const hotel = await getHotelDetail(id);

  if (!hotel) {
    return notFound();
  }

  return <HotelFormClient hotel={hotel} isCreate={false} />;
}
