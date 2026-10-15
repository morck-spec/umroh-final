import BankAccountFormClient from '@/components/dashboard/BankAccountFormClient';

export const metadata = {
  title: 'Tambah Rekening Bank | Travel Umroh & Haji',
};

export default function AdminCreateBankAccountPage() {
  return <BankAccountFormClient isCreate={true} />;
}
