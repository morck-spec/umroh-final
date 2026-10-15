import { getHotels } from '@/app/dashboard/shared/actions/masterData';
import HotelsClient from '@/components/dashboard/HotelsClient';

export const metadata = {
  title: 'Hotel | Travel Umroh & Haji',
};

export default async function AdminCabangHotelsPage() {
  const { data: hotels, source } = await getHotels();
  return <HotelsClient initialHotels={hotels} source={source} />;
}
