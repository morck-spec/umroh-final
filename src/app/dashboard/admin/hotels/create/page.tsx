import HotelFormClient from '@/components/dashboard/HotelFormClient';

export const metadata = {
  title: 'Tambah Hotel | Travel Umroh & Haji',
};

export default function AdminCreateHotelPage() {
  return <HotelFormClient isCreate={true} />;
}
