import { getDocuments } from '@/app/dashboard/shared/actions/documents';
import DocumentsClient from '@/components/dashboard/DocumentsClient';
import { FileCheck } from 'lucide-react';

export const metadata = { title: 'Verifikasi Dokumen Cabang | Trecer' };

export default async function AdminCabangDocumentsPage() {
  const documents = await getDocuments();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileCheck className="w-6 h-6 text-emerald-600" /> Verifikasi Dokumen Cabang</h1>
          <p className="mt-1 text-sm text-slate-500">Review dan validasi kelengkapan dokumen jamaah cabang Anda</p>
        </div>
      </div>
      <div className="card"><DocumentsClient initialDocuments={documents} /></div>
    </div>
  );
}
