'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyReferralButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="bg-white hover:bg-amber-50 text-[#C2410C] px-4 py-2 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
    </button>
  );
}
