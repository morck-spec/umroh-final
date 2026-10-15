'use client';

import { ReactNode, useState } from 'react';

const W = 500;
const H = 160;
const PAD_L = 34;
const PAD_B = 18;
const PAD_T = 8;

function niceTicks(max: number, count = 7) {
  if (max <= 1) return Array.from({ length: 11 }, (_, i) => +(i / 10).toFixed(1));
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = Math.ceil(raw / mag) * mag;
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top; v += step) out.push(v);
  return out;
}

function Axes({ labels, ticks, legend }: { labels: string[]; ticks: number[]; legend?: ReactNode }) {
  const top = ticks[ticks.length - 1] || 1;
  const plotW = W - PAD_L;
  const plotH = H - PAD_B - PAD_T;
  return (
    <>
      {legend}
      {ticks.map((t) => {
        const y = PAD_T + plotH - (t / top) * plotH;
        return (
          <g key={t} suppressHydrationWarning>
            <line x1={PAD_L} x2={W} y1={y} y2={y} stroke="#EEF1F4" strokeWidth={0.6} />
            <text x={PAD_L - 4} y={y + 2} fontSize={5.5} textAnchor="end" fill="#475569" suppressHydrationWarning>
              {t >= 1000 ? Math.round(t).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : t.toFixed(ticks[1] < 1 ? 1 : 0)}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => {
        const x = PAD_L + (i + 0.5) * (plotW / labels.length);
        return (
          <g key={l}>
            <line x1={x} x2={x} y1={PAD_T} y2={PAD_T + plotH} stroke="#F1F4F6" strokeWidth={0.6} />
            <text x={x} y={H - 6} fontSize={5.5} textAnchor="middle" fill="#475569">{l}</text>
          </g>
        );
      })}
    </>
  );
}

export function LineChart({ labels, values, legend }: { labels: string[]; values: number[]; legend: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const ticks = niceTicks(Math.max(...values, 1));
  const top = ticks[ticks.length - 1] || 1;
  const plotW = W - PAD_L;
  const plotH = H - PAD_B - PAD_T;
  const slot = plotW / labels.length;
  const pts = values.map((v, i) => [PAD_L + (i + 0.5) * (plotW / labels.length), PAD_T + plotH - (v / top) * plotH]);

  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const t = 0.4 / 2;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, Math.min(PAD_T + plotH, p1[1] + (p2[1] - p0[1]) * t)];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, Math.min(PAD_T + plotH, p2[1] - (p3[1] - p1[1]) * t)];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  const area = `${d} L${pts[pts.length - 1][0]},${PAD_T + plotH} L${pts[0][0]},${PAD_T + plotH} Z`;

  let tooltipLeft = 0;
  let tooltipTop = 0;
  let tooltipTransform = 'translate(-50%, -100%)';

  if (hoveredIndex !== null && pts[hoveredIndex]) {
    const [ptX, ptY] = pts[hoveredIndex];
    tooltipLeft = Math.max(12, Math.min(88, (ptX / W) * 100));
    const isNearTop = ptY <= 40;
    if (isNearTop) {
      tooltipTop = ((ptY + 14) / H) * 100;
      tooltipTransform = 'translate(-50%, 0)';
    } else {
      tooltipTop = ((ptY - 8) / H) * 100;
      tooltipTransform = 'translate(-50%, -100%)';
    }
  }

  return (
    <div className="relative w-full select-none" onMouseLeave={() => setHoveredIndex(null)}>
      <div className="flex justify-center items-center gap-1.5 mb-1 text-[9px] text-slate-500">
        <span className="w-3 h-2 border-2 border-[#0F9488] bg-[#0F9488]/15" /> {legend}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
        <Axes labels={labels} ticks={ticks} />
        <path d={area} fill="#0F9488" fillOpacity={0.12} />
        <path d={d} fill="none" stroke="#0F9488" strokeWidth={1.4} />
        {pts.map(([x, y], i) => {
          const isHovered = hoveredIndex === i;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isHovered ? 2.6 : 1.3}
              fill={isHovered ? '#0F9488' : '#fff'}
              stroke="#0F9488"
              strokeWidth={isHovered ? 1 : 0.6}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
          );
        })}
        {/* Full column hit targets for easy hovering on line chart */}
        {values.map((_, i) => {
          const colX = PAD_L + i * slot;
          return (
            <rect
              key={`line-hit-${i}`}
              x={colX}
              y={PAD_T}
              width={slot}
              height={plotH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
          );
        })}
      </svg>

      {/* Line Chart Hover Tooltip */}
      {hoveredIndex !== null && values[hoveredIndex] !== undefined && (
        <div
          className="pointer-events-none absolute z-30 flex flex-col rounded-md bg-[#18181B] px-3 py-2 text-white shadow-xl border border-slate-700/70 transition-all duration-100 ease-out"
          style={{
            left: `${tooltipLeft}%`,
            top: `${tooltipTop}%`,
            transform: tooltipTransform,
          }}
        >
          <p className="text-[11px] font-semibold text-white whitespace-nowrap leading-tight">
            {labels[hoveredIndex]}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-200">
            <span className="w-2 h-2 rounded-[1.5px] inline-block bg-[#0D9488] shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {legend}: {values[hoveredIndex]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function BarChart({
  labels,
  values,
  customTicks,
  seriesName = 'Jamaah',
  valueType = 'number',
}: {
  labels: string[];
  values: number[];
  customTicks?: number[];
  seriesName?: string;
  valueType?: 'number' | 'currency';
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartW = 560;
  const chartH = 210;
  const padL = valueType === 'currency' ? 46 : 34;
  const padR = 16;
  const padB = 28;
  const padT = 16;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padB - padT;

  const maxVal = Math.max(...values, 1);
  const ticks = customTicks || (maxVal <= 3 ? [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0] : niceTicks(maxVal));
  const top = ticks[ticks.length - 1] || 1;
  const slot = plotW / labels.length;

  function formatIndonesianNumber(val: number): string {
    if (val === 0) return '0';
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function formatVal(v: number) {
    if (valueType === 'currency') {
      return 'Rp ' + formatIndonesianNumber(v);
    }
    if (Number.isInteger(v) || v % 1 === 0) return String(Math.round(v));
    return v.toFixed(1);
  }

  let tooltipLeft = 0;
  let tooltipTop = 0;
  let tooltipTransform = 'translate(-50%, 0)';

  if (hoveredIndex !== null && values[hoveredIndex] !== undefined) {
    const v = values[hoveredIndex];
    const h = (v / top) * plotH;
    const barW = Math.min(slot * 0.58, 56);
    const barX = padL + hoveredIndex * slot + (slot - barW) / 2;
    const barY = padT + plotH - h;
    const barCenterX = barX + barW / 2;

    const rawLeft = (barCenterX / chartW) * 100;
    tooltipLeft = Math.max(14, Math.min(86, rawLeft));

    // When the bar reaches near the top of the chart (e.g. 3.0), position inside top of the bar like reference photo
    const isTall = barY <= 65;
    if (isTall) {
      tooltipTop = ((barY + 18) / chartH) * 100;
      tooltipTransform = 'translate(-50%, 0)';
    } else {
      tooltipTop = ((barY - 6) / chartH) * 100;
      tooltipTransform = 'translate(-50%, -100%)';
    }
  }

  return (
    <div className="relative w-full select-none" suppressHydrationWarning onMouseLeave={() => setHoveredIndex(null)}>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible" suppressHydrationWarning>
        {/* Horizontal grid lines & Y labels */}
        {ticks.map((t) => {
          const y = padT + plotH - (t / top) * plotH;
          const displayVal =
            t === 0
              ? '0'
              : valueType === 'currency'
              ? formatIndonesianNumber(t)
              : t >= 1000
              ? formatIndonesianNumber(t)
              : t.toFixed(1);

          return (
            <g key={t} suppressHydrationWarning>
              <line x1={padL} x2={chartW - padR} y1={y} y2={y} stroke="#EEF2F6" strokeWidth={0.8} />
              <text
                x={padL - 6}
                y={y + 2.5}
                fontSize={6}
                textAnchor="end"
                fill="#64748B"
                suppressHydrationWarning
              >
                {displayVal}
              </text>
            </g>
          );
        })}

        {/* Vertical divider lines */}
        {labels.map((_, i) => {
          const x = padL + i * slot;
          return (
            <line
              key={i}
              x1={x}
              x2={x}
              y1={padT}
              y2={padT + plotH}
              stroke="#F1F5F9"
              strokeWidth={0.6}
            />
          );
        })}
        <line
          x1={padL + plotW}
          x2={padL + plotW}
          y1={padT}
          y2={padT + plotH}
          stroke="#F1F5F9"
          strokeWidth={0.6}
        />

        {/* Bars */}
        {values.map((v, i) => {
          const h = (v / top) * plotH;
          const barW = Math.min(slot * 0.58, 56);
          const barX = padL + i * slot + (slot - barW) / 2;
          const barY = padT + plotH - h;
          const isHovered = hoveredIndex === i;
          return (
            <g key={i}>
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={h}
                rx={3}
                fill={isHovered ? '#0F766E' : '#0D9488'}
                className="transition-colors duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            </g>
          );
        })}

        {/* X labels */}
        {labels.map((l, i) => {
          const x = padL + (i + 0.5) * slot;
          const isHovered = hoveredIndex === i;
          return (
            <text
              key={l}
              x={x}
              y={chartH - 8}
              fontSize={6.2}
              textAnchor="middle"
              fill={isHovered ? '#0D9488' : '#475569'}
              fontWeight={isHovered ? '600' : '400'}
              className="transition-colors duration-150"
            >
              {l}
            </text>
          );
        })}

        {/* Column hit targets covering full plot height for easy hovering */}
        {values.map((_, i) => {
          const colX = padL + i * slot;
          return (
            <rect
              key={`bar-hit-${i}`}
              x={colX}
              y={padT}
              width={slot}
              height={plotH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip matching user screenshot */}
      {hoveredIndex !== null && values[hoveredIndex] !== undefined && (
        <div
          className="pointer-events-none absolute z-30 flex flex-col rounded-md bg-[#18181B] px-3 py-2 text-white shadow-xl border border-slate-700/70 transition-all duration-100 ease-out"
          style={{
            left: `${tooltipLeft}%`,
            top: `${tooltipTop}%`,
            transform: tooltipTransform,
          }}
        >
          <p className="text-[11px] font-semibold text-white whitespace-nowrap leading-tight">
            {labels[hoveredIndex]}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-200">
            <span className="w-2 h-2 rounded-[1.5px] inline-block bg-[#0D9488] shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {seriesName}: {formatVal(values[hoveredIndex])}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
