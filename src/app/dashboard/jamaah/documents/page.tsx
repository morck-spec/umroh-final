import { getDocuments } from '@/app/dashboard/shared/actions/documents';
import JamaahDocumentsClient from '@/components/dashboard/JamaahDocumentsClient';
import { FileText } from 'lucide-react';

export const metadata = { title: 'Dokumen Saya | Trecer' };

export default async function JamaahDocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-600" /> Dokumen Saya</h1>
          <p className="mt-1 text-sm text-slate-500">Upload dan kelola kelengkapan dokumen persyaratan Anda</p>
        </div>
      </div>
      <div className="card"><JamaahDocumentsClient initialDocuments={documents} /></div>
    </div>
  );
}
