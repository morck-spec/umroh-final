import { redirect } from 'next/navigation';

export default async function PilgrimRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/superadmin/documents/${id}`);
}
