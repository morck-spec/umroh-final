import { getEquipmentList } from '@/app/dashboard/shared/actions/equipment';
import EquipmentListClient from '@/components/dashboard/EquipmentListClient';

export const metadata = {
  title: 'Perlengkapan | Travel Umroh & Haji',
};

export default async function AdminCabangEquipmentPage() {
  const items = await getEquipmentList();
  return <EquipmentListClient initialItems={items} basePath="/dashboard/admin_cabang/equipment" />;
}
