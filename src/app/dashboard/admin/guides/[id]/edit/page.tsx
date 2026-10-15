import { notFound } from 'next/navigation';
import GuideFormClient from '@/components/dashboard/GuideFormClient';
import { getGuideById } from '@/app/dashboard/shared/actions/guides';
import { getBranchesList } from '@/app/dashboard/shared/actions/branches';

export const metadata = {
  title: 'Edit Muthawif | Travel Umroh & Haji',
};

export default async function AdminEditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [guide, branches] = await Promise.all([
    getGuideById(id),
    getBranchesList(),
  ]);

  if (!guide) {
    notFound();
  }

  return <GuideFormClient guide={guide} branches={branches} isEdit={true} />;
}
