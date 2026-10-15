import AirlineFormClient from '@/components/dashboard/AirlineFormClient';

export const metadata = {
  title: 'Maskapai | Travel Umroh & Haji',
};

export default function AdminCreateAirlinePage() {
  return <AirlineFormClient isCreate={true} />;
}
