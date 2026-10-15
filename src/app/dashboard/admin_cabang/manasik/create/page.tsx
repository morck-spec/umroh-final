import { getManasikFormData } from '@/app/dashboard/shared/actions/manasik';
import ManasikCreateClient from '@/components/dashboard/ManasikCreateClient';

export const metadata = {
  title: 'Tambah Jadwal Manasik | Travel Umroh & Haji',
};

export default async function AdminCabangManasikCreatePage() {
  const formData = await getManasikFormData();

  return (
    <ManasikCreateClient
      packages={formData.packages}
      guides={formData.guides}
      basePath="/dashboard/admin_cabang/manasik"
    />
  );
}
