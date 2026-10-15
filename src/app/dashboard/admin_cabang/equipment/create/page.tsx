import { getJamaahOptions } from '@/app/dashboard/shared/actions/equipment';
import EquipmentFormClient from '@/components/dashboard/EquipmentFormClient';

export const metadata = {
  title: 'Tambah Perlengkapan | Travel Umroh & Haji',
};

export default async function AdminCabangEquipmentCreatePage() {
  const jamaahOptions = await getJamaahOptions();
  return (
    <EquipmentFormClient
      jamaahOptions={jamaahOptions}
      basePath="/dashboard/admin_cabang/equipment"
      isEdit={false}
    />
  );
}
