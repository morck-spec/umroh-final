import BranchFormClient from '@/components/dashboard/BranchFormClient';

export const metadata = {
  title: 'Tambah Cabang | Travel Umroh & Haji',
};

export default function CreateBranchPage() {
  return <BranchFormClient isCreate={true} />;
}
