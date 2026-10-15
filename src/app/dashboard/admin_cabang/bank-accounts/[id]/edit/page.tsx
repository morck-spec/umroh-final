import { getBankAccountDetail } from '@/app/dashboard/shared/actions/bankAccounts';
import BankAccountFormClient from '@/components/dashboard/BankAccountFormClient';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Rekening Bank | Travel Umroh & Haji',
};

interface EditBankAccountPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCabangEditBankAccountPage({ params }: EditBankAccountPageProps) {
  const { id } = await params;
  const account = await getBankAccountDetail(id);

  if (!account) {
    return notFound();
  }

  return <BankAccountFormClient account={account} isCreate={false} />;
}
