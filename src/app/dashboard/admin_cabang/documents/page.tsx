import { getPilgrimDocumentsList } from '@/app/dashboard/shared/actions/documents';
import DocumentsClient from '@/components/dashboard/DocumentsClient';

export const metadata = {
  title: 'Dokumen Jamaah | Travel Umroh & Haji',
};

export default async function AdminCabangDocumentsPage() {
  const pilgrims = await getPilgrimDocumentsList();
  return <DocumentsClient initialPilgrims={pilgrims} basePath="/dashboard/admin_cabang/documents" />;
}
