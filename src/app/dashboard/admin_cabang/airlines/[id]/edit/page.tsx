import { getAirlineDetail } from '@/app/dashboard/shared/actions/masterData';
import AirlineFormClient from '@/components/dashboard/AirlineFormClient';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Maskapai | Travel Umroh & Haji',
};

interface EditAirlinePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCabangEditAirlinePage({ params }: EditAirlinePageProps) {
  const { id } = await params;
  const airline = await getAirlineDetail(id);

  if (!airline) {
    return notFound();
  }

  return <AirlineFormClient airline={airline} isCreate={false} />;
}
