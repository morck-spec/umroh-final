import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

/* Re-export interactive client chart components */
export { LineChart, BarChart } from './DashboardCharts';

/* ---------- Helpers ---------- */

export function last12MonthLabels(): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.toLocaleDateString('en-US', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`);
  }
  return out;
}

export function rupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

/* ---------- Layout pieces ---------- */

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 mt-1">
      <h1 className="text-[17px] font-semibold text-slate-800">{title}</h1>
      <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

const toneMap = {
  teal: 'bg-[#E6F6F3] text-[#0F9488]',
  blue: 'bg-[#E8EFFC] text-[#3B6FD8]',
  green: 'bg-[#E7F6EC] text-[#16A34A]',
  amber: 'bg-[#FDF5E1] text-[#D99A0B]',
  purple: 'bg-[#F1ECFD] text-[#8B5CF6]',
};
export type Tone = keyof typeof toneMap;

export function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/70 px-3.5 py-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${toneMap[tone]}`}>
        <Icon className="w-4 h-4" strokeWidth={1.7} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400">{label}</p>
        <p className="text-[15px] font-semibold text-slate-800 leading-tight truncate">{value}</p>
        {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Card({ title, children, className = '', id }: { title: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`bg-white rounded-lg border border-slate-200/70 flex flex-col ${className}`}>
      <div className="px-4 py-3.5 border-b border-slate-100">
        <h2 className="text-[12px] font-medium text-slate-800">{title}</h2>
      </div>
      <div className="p-4 flex-1">{children}</div>
    </section>
  );
}

export function EmptyNote({ text = 'Belum ada data.' }: { text?: string }) {
  return <p className="text-[11px] text-slate-400 py-6 text-center">{text}</p>;
}

export function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-4 text-[9px] text-slate-500">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2 rounded-[1px]" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 160 160" className="w-full max-w-[170px] mx-auto -rotate-90">
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx={80}
              cy={80}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={32}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
        <circle cx={80} cy={80} r={r + 16} fill="none" stroke="#fff" strokeWidth={0.8} />
      </svg>
    </div>
  );
}
