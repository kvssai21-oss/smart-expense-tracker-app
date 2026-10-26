import { useEffect, useState } from "react";
import type { CategoryBudgets } from "../types";
import { CATEGORIES, DEFAULT_CATEGORY_BUDGETS } from "../types";
import { formatCurrency } from "../utils/format";
import { X, Target } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (budgets: CategoryBudgets, total: number) => void;
  current: CategoryBudgets;
  totalBudget: number;
}

export function CategoryBudgetModal({
  open,
  onClose,
  onSave,
  current,
  totalBudget,
}: Props) {
  const [budgets, setBudgets] = useState<CategoryBudgets>(current);
  const [total, setTotal] = useState<number>(totalBudget);

  useEffect(() => {
    if (open) {
      setBudgets(current);
      setTotal(totalBudget);
    }
  }, [open, current, totalBudget]);

  if (!open) return null;

  const sumCat = Object.values(budgets).reduce((s, v) => s + (v || 0), 0);
  const mismatch = total > 0 && sumCat !== total;

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const cleaned = { ...budgets };
    for (const k of Object.keys(cleaned) as (keyof CategoryBudgets)[]) {
      cleaned[k] = Math.max(0, Number((cleaned[k] || 0).toFixed(2)));
    }
    onSave(cleaned, Number(total.toFixed(2)));
  }

  function resetDefaults() {
    setBudgets({ ...DEFAULT_CATEGORY_BUDGETS });
    setTotal(150000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Budget Settings</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total monthly budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={total || ""}
                onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Category budgets</label>
              <button
                type="button"
                onClick={resetDefaults}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Reset to defaults
              </button>
            </div>
            <div className="space-y-2.5">
              {CATEGORIES.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-sm text-slate-600 w-20 sm:w-24 shrink-0">{c.name}</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={budgets[c.name] || ""}
                      onChange={(e) =>
                        setBudgets((b) => ({ ...b, [c.name]: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-100">
            <span className="text-slate-500">Sum of categories: <span className="font-semibold text-slate-800">{formatCurrency(sumCat)}</span></span>
            {mismatch ? (
              <span className="text-amber-600 text-xs font-medium">Differs from total budget</span>
            ) : (
              <span className="text-emerald-600 text-xs font-medium">Matches total</span>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm">
              Save Budgets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
