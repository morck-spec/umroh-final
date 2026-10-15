import { getJamaahOptions } from '@/app/dashboard/shared/actions/equipment';
import EquipmentFormClient from '@/components/dashboard/EquipmentFormClient';

export const metadata = {
  title: 'Tambah Perlengkapan | Travel Umroh & Haji',
};

export default async function SuperAdminEquipmentCreatePage() {
  const jamaahOptions = await getJamaahOptions();
  return (
    <EquipmentFormClient
      jamaahOptions={jamaahOptions}
      basePath="/dashboard/superadmin/equipment"
      isEdit={false}
    />
  );
}
