import { getWhiteLabelSettings } from '@/app/dashboard/shared/actions/whitelabel';
import WhiteLabelClient from '@/components/dashboard/WhiteLabelClient';

export const metadata = {
  title: 'Pengaturan White-label | Sistem Manajemen Umroh & Haji',
};

export default async function SettingsPage() {
  const settings = await getWhiteLabelSettings();

  return <WhiteLabelClient initialSettings={settings} />;
}
