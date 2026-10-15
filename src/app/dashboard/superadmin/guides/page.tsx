import { getGuides } from '@/app/dashboard/shared/actions/guides';
import GuidesClient from '@/components/dashboard/GuidesClient';

export const metadata = {
  title: 'Pembimbing Umroh | Trecer',
};

export default async function SuperAdminGuidesPage() {
  const guides = await getGuides();
  return <GuidesClient initialGuides={guides} role="super_admin" />;
}
