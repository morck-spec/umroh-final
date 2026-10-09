'use client';

import { useState } from 'react';
import { verifyDocument, getSignedUrl } from '@/app/dashboard/shared/actions/documents';
import { FileText, Check, X, Eye } from 'lucide-react';

export default function DocumentsClient({ initialDocuments }: { initialDocuments: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isLoading, setIsLoading] = useState(false);

  async function handleVerify(id: string, status: string) {
    let reason = '';
    if (status === 'rejected') {
      const input = prompt('Alasan penolakan dokumen:');
      if (input === null) return;
      reason = input;
    }

    setIsLoading(true);
    try {
      const res = await verifyDocument(id, status, reason);
      if (res?.error) alert(res.error);
      else window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleView(filePath: string) {
    const url = await getSignedUrl(filePath);
    if (url) window.open(url, '_blank');
    else alert('Gagal membuka dokumen. Pastikan bucket "documents" tersedia dan Anda memiliki akses.');
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-800">Verifikasi Dokumen Jamaah</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Upload</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jamaah</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis Dokumen</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {documents.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada dokumen yang diunggah.</td></tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{doc.jamaah?.full_name}</div>
                    <div className="text-xs text-slate-500">{doc.jamaah?.nik}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {doc.document_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${doc.status === 'valid' ? 'bg-emerald-100 text-emerald-800' :
                        doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'}`}>
                      {doc.status}
                    </span>
                    {doc.rejection_reason && <div className="text-xs text-red-500 mt-1 max-w-xs truncate" title={doc.rejection_reason}>Alasan: {doc.rejection_reason}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleView(doc.file_url)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Lihat Dokumen"><Eye className="w-4 h-4" /></button>
                    {doc.status === 'pending' && (
                      <>
                        <button disabled={isLoading} onClick={() => handleVerify(doc.id, 'valid')} className="text-emerald-600 hover:text-emerald-900 p-1 bg-emerald-50 rounded" title="Valid"><Check className="w-4 h-4" /></button>
                        <button disabled={isLoading} onClick={() => handleVerify(doc.id, 'rejected')} className="text-orange-600 hover:text-orange-900 p-1 bg-orange-50 rounded" title="Tolak"><X className="w-4 h-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
