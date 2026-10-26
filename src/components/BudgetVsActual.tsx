import { useMemo } from "react";
import type { Expense, CategoryBudgets } from "../types";
import { CATEGORIES, getCategoryMeta } from "../types";
import { formatCurrency } from "../utils/format";
import { AlertTriangle } from "lucide-react";

interface Props {
  expenses: Expense[];
  categoryBudgets: CategoryBudgets;
}

interface Row {
  name: string;
  spent: number;
  budget: number;
  pct: number;
  over: boolean;
  warning: boolean;
}

export function BudgetVsActual({ expenses, categoryBudgets }: Props) {
  const rows = useMemo<Row[]>(() => {
    const spentMap = new Map<string, number>();
    for (const e of expenses) {
      spentMap.set(e.category, (spentMap.get(e.category) ?? 0) + e.amount);
    }
    return CATEGORIES.map((c) => {
      const spent = spentMap.get(c.name) ?? 0;
      const budget = categoryBudgets[c.name] ?? 0;
      const pct = budget > 0 ? (spent / budget) * 100 : 0;
      const over = budget > 0 && spent > budget;
      const warning = budget > 0 && pct >= 80 && !over;
      return { name: c.name, spent, budget, pct, over, warning };
    }).filter((r) => r.budget > 0 || r.spent > 0);
  }, [expenses, categoryBudgets]);

  const flagged = rows.filter((r) => r.over || r.warning);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <p className="text-sm font-medium">No budget set yet</p>
        <p className="text-xs mt-1">Set category budgets to see the comparison</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flagged.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {flagged.map((r) => {
            const meta = getCategoryMeta(r.name as Expense["category"]);
            return (
              <span
                key={r.name}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  r.over
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <AlertTriangle className={`w-3 h-3 ${r.over ? "text-rose-500" : "text-amber-500"}`} />
                {r.name} {r.over ? "exceeded" : "near limit"}
                <span className="opacity-70">({Math.round(r.pct)}%)</span>
              </span>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => {
          const meta = getCategoryMeta(r.name as Expense["category"]);
          const barPct = Math.min(r.pct, 100);
          return (
            <div key={r.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="font-medium text-slate-700">{r.name}</span>
                </div>
                <span className="text-slate-500">
                  <span className="font-semibold text-slate-800">{formatCurrency(r.spent)}</span>
                  {" / "}
                  {formatCurrency(r.budget)}
                  {r.budget > 0 && (
                    <span className={`ml-1.5 ${r.over ? "text-rose-600" : r.warning ? "text-amber-600" : "text-slate-400"}`}>
                      {Math.round(r.pct)}%
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barPct}%`,
                    backgroundColor: r.over ? "#ef4444" : r.warning ? "#f59e0b" : meta.color,
                  }}
                />
              </div>
              {r.over && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Over by {formatCurrency(r.spent - r.budget)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
