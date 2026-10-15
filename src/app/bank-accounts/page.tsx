import { redirect } from 'next/navigation';

export default function BankAccountsRedirect() {
  redirect('/dashboard/superadmin/bank-accounts');
}
