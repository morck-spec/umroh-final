import { getBankAccounts } from '@/app/dashboard/shared/actions/bankAccounts';
import BankAccountsClient from '@/components/dashboard/BankAccountsClient';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Rekening Bank | Travel Umroh & Haji',
};

export default async function SuperAdminBankAccountsPage() {
  const { data: accounts, source } = await getBankAccounts();

  let branches: { id: string; name: string }[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('branches').select('id, name');
    if (data) branches = data;
  } catch {
    // Keep empty
  }

  return <BankAccountsClient initialAccounts={accounts} branches={branches} source={source} />;
}
