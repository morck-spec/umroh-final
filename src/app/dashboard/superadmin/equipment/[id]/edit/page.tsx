import { notFound } from 'next/navigation';
import { getEquipmentDetail, getJamaahOptions } from '@/app/dashboard/shared/actions/equipment';
import EquipmentFormClient from '@/components/dashboard/EquipmentFormClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Perlengkapan | Travel Umroh & Haji',
};

export default async function SuperAdminEquipmentEditPage({ params }: Props) {
  const { id } = await params;
  const item = await getEquipmentDetail(id);

  if (!item) {
    notFound();
  }

  const jamaahOptions = await getJamaahOptions();

  return (
    <EquipmentFormClient
      initialItem={item}
      jamaahOptions={jamaahOptions}
      basePath="/dashboard/superadmin/equipment"
      isEdit={true}
    />
  );
}
