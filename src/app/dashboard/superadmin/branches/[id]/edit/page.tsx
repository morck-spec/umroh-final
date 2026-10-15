import { getBranchDetail } from '@/app/dashboard/shared/actions/branches';
import BranchFormClient from '@/components/dashboard/BranchFormClient';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Cabang | Travel Umroh & Haji',
};

interface EditBranchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBranchPage({ params }: EditBranchPageProps) {
  const { id } = await params;
  const branch = await getBranchDetail(id);

  if (!branch) {
    // If not found by exact ID, fallback or notFound
    return notFound();
  }

  return <BranchFormClient branch={branch} isCreate={false} />;
}
