import { getMuthawifPilgrims } from '@/app/dashboard/shared/actions/muthawif';
import MuthawifPilgrimsClient from '@/components/dashboard/MuthawifPilgrimsClient';

export const metadata = {
  title: 'Jamaah Bimbingan | Trecer',
};

export default async function MuthawifPilgrimsPage() {
  const pilgrims = await getMuthawifPilgrims();
  return <MuthawifPilgrimsClient pilgrims={pilgrims} />;
}
