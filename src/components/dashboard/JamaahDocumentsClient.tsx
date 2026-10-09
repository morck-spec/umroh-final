'use client';

import { useState } from 'react';
import { uploadDocument, getSignedUrl } from '@/app/dashboard/shared/actions/documents';
import { Eye, Plus, X } from 'lucide-react';

export default function JamaahDocumentsClient({ initialDocuments }: { initialDocuments: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await uploadDocument(formData);
      if (res?.error) alert(res.error);
      else window.location.reload();
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  }

  async function handleView(filePath: string) {
    const url = await getSignedUrl(filePath);
    if (url) window.open(url, '_blank');
    else alert('Gagal membuka dokumen.');
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Daftar Dokumen</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Dokumen
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Upload</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis Dokumen</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {documents.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada dokumen yang diunggah.</td></tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString('id-ID')}
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={() => setIsModalOpen(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                      Upload Dokumen
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="document_type" className="block text-sm font-medium text-slate-700">Jenis Dokumen <span className="text-red-500">*</span></label>
                      <select name="document_type" id="document_type" required className="input-field">
                        <option value="">-- Pilih Jenis Dokumen --</option>
                        <option value="KTP">KTP</option>
                        <option value="KK">Kartu Keluarga (KK)</option>
                        <option value="PASPOR">Paspor</option>
                        <option value="VISA">Visa</option>
                        <option value="BUKU_KUNING">Buku Kuning (Meningitis)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="file" className="block text-sm font-medium text-slate-700">File Dokumen (PDF, JPG, PNG) <span className="text-red-500">*</span></label>
                      <input type="file" name="file" id="file" accept=".pdf,.jpg,.jpeg,.png" required className="input-field mt-1 py-2" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
                  <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
                    {isLoading ? 'Mengupload...' : 'Upload'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary w-full sm:w-auto">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
