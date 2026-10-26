import { useEffect, useState } from "react";
import type { Category, Expense } from "../types";
import { CATEGORIES } from "../types";
import { todayISO } from "../utils/format";
import { X } from "lucide-react";

export interface ExpenseFormValues {
  amount: number;
  category: Category;
  date: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
  editing?: Expense | null;
}

const EMPTY: ExpenseFormValues = {
  amount: 0,
  category: "Food",
  date: todayISO(),
  description: "",
};

export function ExpenseModal({ open, onClose, onSubmit, editing }: Props) {
  const [values, setValues] = useState<ExpenseFormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({});

  useEffect(() => {
    if (open) {
      setValues(
        editing
          ? {
              amount: editing.amount,
              category: editing.category,
              date: editing.date,
              description: editing.description,
            }
          : EMPTY
      );
      setErrors({});
    }
  }, [open, editing]);

  if (!open) return null;

  function validate(): boolean {
    const e: Partial<Record<keyof ExpenseFormValues, string>> = {};
    if (!values.amount || values.amount <= 0) e.amount = "Enter an amount greater than 0";
    if (!values.date) e.date = "Pick a date";
    if (values.date && Number.isNaN(new Date(values.date).getTime())) e.date = "Invalid date";
    if (!values.description.trim()) e.description = "Add a short description";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({ ...values, amount: Number(values.amount.toFixed(2)) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-[slideUp_.2s_ease]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-800">
            {editing ? "Edit Expense" : "Add Expense"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.amount || ""}
                onChange={(e) => setValues((v) => ({ ...v, amount: parseFloat(e.target.value) || 0 }))}
                className={`w-full pl-7 pr-3 py-2 rounded-lg border ${
                  errors.amount ? "border-rose-400" : "border-slate-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => {
                const active = values.category === c.name;
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => setValues((v) => ({ ...v, category: c.name }))}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition ${
                      active
                        ? `${c.bg} ${c.text} border-transparent ring-2 ${c.ring}`
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={values.date}
              onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.date ? "border-rose-400" : "border-slate-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.description ? "border-rose-400" : "border-slate-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none`}
              placeholder="e.g. Lunch with team"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm"
            >
              {editing ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
