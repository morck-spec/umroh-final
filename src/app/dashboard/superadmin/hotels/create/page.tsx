import HotelFormClient from '@/components/dashboard/HotelFormClient';

export const metadata = {
  title: 'Tambah Hotel | Travel Umroh & Haji',
};

export default function SuperAdminCreateHotelPage() {
  return <HotelFormClient isCreate={true} />;
}
