'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Download, Trash2, ArrowLeft } from 'lucide-react';
import {
  PilgrimWithDocs,
  PilgrimDocument,
  seedStandardChecklist,
  updatePilgrimDocStatus,
  uploadPilgrimDocFile,
  deletePilgrimDoc,
  getSignedUrl,
} from '@/app/dashboard/shared/actions/documents';

interface Props {
  pilgrim: PilgrimWithDocs;
  backHref?: string;
  isJamaah?: boolean;
}

export default function PilgrimDocumentsDetailClient({
  pilgrim: initialPilgrim,
  backHref = '/dashboard/superadmin/documents',
  isJamaah = false,
}: Props) {
  const router = useRouter();
  const [pilgrim, setPilgrim] = useState<PilgrimWithDocs>(initialPilgrim);
  const [isPending, startTransition] = useTransition();

  // Status selector states
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, 'Terverifikasi' | 'Sudah Diunggah' | 'Belum Diunggah' | 'Ditolak'>>({});

  function handleStatusChange(docId: string, val: 'Terverifikasi' | 'Sudah Diunggah' | 'Belum Diunggah' | 'Ditolak') {
    setSelectedStatuses((prev) => ({ ...prev, [docId]: val }));
  }

  async function handleApplyStatus(docId: string) {
    const newStatus = selectedStatuses[docId];
    if (!newStatus) return;

    startTransition(async () => {
      const res = await updatePilgrimDocStatus(pilgrim.id, docId, newStatus);
      if (res.error) {
        alert(res.error);
      } else {
        setPilgrim((prev) => ({
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  status: newStatus,
                  verified_at:
                    newStatus === 'Terverifikasi'
                      ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : null,
                }
              : d
          ),
        }));
        router.refresh();
      }
    });
  }

  async function handleSeed() {
    startTransition(async () => {
      const res = await seedStandardChecklist(pilgrim.id);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
        window.location.reload();
      }
    });
  }

  async function handleUpload(docId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await uploadPilgrimDocFile(pilgrim.id, docId, formData);
      if (res.error) {
        alert(res.error);
      } else {
        setPilgrim((prev) => ({
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === docId ? { ...d, file_name: res.file_name, status: 'Sudah Diunggah' } : d
          ),
        }));
        form.reset();
        router.refresh();
      }
    });
  }

  async function handleDelete(docId: string, label: string) {
    if (!confirm(`Hapus item dokumen "${label}" dari checklist?`)) return;

    startTransition(async () => {
      const res = await deletePilgrimDoc(pilgrim.id, docId);
      if (res.error) {
        alert(res.error);
      } else {
        setPilgrim((prev) => ({
          ...prev,
          documents: prev.documents.filter((d) => d.id !== docId),
        }));
        router.refresh();
      }
    });
  }

  async function handleDownload(doc: PilgrimDocument) {
    if (doc.file_url) {
      if (doc.file_url.startsWith('http') || doc.file_url.startsWith('/')) {
        window.open(doc.file_url, '_blank');
        return;
      }
      try {
        const url = await getSignedUrl(doc.file_url);
        if (url) {
          window.open(url, '_blank');
          return;
        }
      } catch {}
    }
    alert(`Membuka berkas: ${doc.file_name || doc.label}`);
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
        <Link href={isJamaah ? '/dashboard/jamaah' : '/dashboard/superadmin'} className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href={isJamaah ? '/dashboard/jamaah/documents' : backHref} className="hover:text-slate-600 transition-colors">
          Dokumen
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">{pilgrim.name}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dokumen &mdash; {pilgrim.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Kode: {pilgrim.code}</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
        >
          <Check className="w-4 h-4 text-[#0D9488]" />
          <span>Buat Checklist Standar</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 w-1/4">DOKUMEN</th>
                <th className="px-5 py-3.5 w-1/5">STATUS</th>
                <th className="px-5 py-3.5 w-1/4">BERKAS</th>
                <th className="px-5 py-3.5">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pilgrim.documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm">
                    <p className="font-medium text-slate-700 mb-1">Checklist masih kosong</p>
                    <p className="text-xs text-slate-400 mb-3">
                      Klik &ldquo;Buat Checklist Standar&rdquo; untuk membuat daftar dokumen wajib jamaah.
                    </p>
                    <button
                      onClick={handleSeed}
                      className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#0D9488] text-white hover:bg-[#0F766E]"
                    >
                      Buat Checklist Standar
                    </button>
                  </td>
                </tr>
              ) : (
                pilgrim.documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors align-top">
                    {/* DOKUMEN */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{doc.label}</p>
                      {doc.note && <p className="text-xs text-slate-400 mt-0.5">Catatan: {doc.note}</p>}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      {doc.status === 'Terverifikasi' && (
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E7F6EC] text-[#16A34A]">
                            Terverifikasi
                          </span>
                          {doc.verified_at && (
                            <p className="text-[11px] text-slate-400 mt-1">{doc.verified_at}</p>
                          )}
                        </div>
                      )}
                      {doc.status === 'Sudah Diunggah' && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706]">
                          Sudah Diunggah
                        </span>
                      )}
                      {doc.status === 'Belum Diunggah' && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Belum Diunggah
                        </span>
                      )}
                      {doc.status === 'Ditolak' && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          Ditolak
                        </span>
                      )}
                    </td>

                    {/* BERKAS */}
                    <td className="px-5 py-4">
                      {doc.file_name ? (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDownload(doc);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-[#0D9488] hover:underline font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{doc.file_name}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Belum diunggah</span>
                      )}
                    </td>

                    {/* AKSI */}
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        {/* Upload Form */}
                        <form onSubmit={(e) => handleUpload(doc.id, e)} className="flex items-center gap-2">
                          <input
                            type="file"
                            name="file"
                            required
                            className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                          />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="px-2.5 py-1 rounded bg-[#0D9488] text-white text-xs font-medium hover:bg-[#0F766E] transition-colors"
                          >
                            Unggah
                          </button>
                        </form>

                        {/* Status Verification dropdown and Delete action (Staff only, hidden for Jamaah) */}
                        {!isJamaah && (
                          <>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedStatuses[doc.id] || doc.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    doc.id,
                                    e.target.value as 'Terverifikasi' | 'Sudah Diunggah' | 'Belum Diunggah' | 'Ditolak'
                                  )
                                }
                                className="text-xs rounded border border-slate-300 py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                              >
                                <option value="Terverifikasi">Terverifikasi</option>
                                <option value="Sudah Diunggah">Sudah Diunggah</option>
                                <option value="Belum Diunggah">Belum Diunggah</option>
                                <option value="Ditolak">Ditolak</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleApplyStatus(doc.id)}
                                disabled={isPending}
                                className="text-xs px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                              >
                                Set
                              </button>
                            </div>

                            <div>
                              <button
                                type="button"
                                onClick={() => handleDelete(doc.id, doc.label)}
                                className="text-red-500 hover:underline text-xs font-medium"
                              >
                                Hapus
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
