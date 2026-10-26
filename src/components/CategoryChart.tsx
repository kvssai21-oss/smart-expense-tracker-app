import { useMemo } from "react";
import type { Expense } from "../types";
import { CATEGORIES, getCategoryMeta } from "../types";
import { formatCurrency } from "../utils/format";

interface Props {
  expenses: Expense[];
}

export function CategoryChart({ expenses }: Props) {
  const { segments, total } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    const sorted = CATEGORIES.map((c) => ({
      name: c.name,
      value: totals.get(c.name) ?? 0,
    })).filter((s) => s.value > 0).sort((a, b) => b.value - a.value);

    const t = sorted.reduce((s, x) => s + x.value, 0);
    return { segments: sorted, total: t };
  }, [expenses]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-sm font-medium">No spending data yet</p>
        <p className="text-xs mt-1">Add an expense to see the breakdown</p>
      </div>
    );
  }

  const radius = 70;
  const stroke = 26;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
          {segments.map((seg) => {
            const meta = getCategoryMeta(seg.name);
            const fraction = seg.value / total;
            const dash = fraction * circumference;
            const el = (
              <circle
                key={seg.name}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={meta.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-xs text-slate-400 font-medium">Total</span>
          <span className="text-lg font-bold text-slate-800">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
        {segments.map((seg) => {
          const meta = getCategoryMeta(seg.name);
          const pct = ((seg.value / total) * 100).toFixed(1);
          return (
            <div key={seg.name} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-sm text-slate-600 flex-1 truncate">{seg.name}</span>
              <span className="text-sm font-semibold text-slate-800">{formatCurrency(seg.value)}</span>
              <span className="text-xs text-slate-400 w-12 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
