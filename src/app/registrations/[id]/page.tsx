import { redirect } from 'next/navigation';

export default async function RegistrationDetailRootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/jamaah/registrations/${id}`);
}
