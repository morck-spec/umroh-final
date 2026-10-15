import { getAirlines } from '@/app/dashboard/shared/actions/masterData';
import AirlinesClient from '@/components/dashboard/AirlinesClient';

export const metadata = {
  title: 'Maskapai | Travel Umroh & Haji',
};

export default async function AdminCabangAirlinesPage() {
  const { data: airlines, source } = await getAirlines();
  return <AirlinesClient initialAirlines={airlines} source={source} />;
}
