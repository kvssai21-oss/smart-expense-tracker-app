import { formatCurrency } from "../utils/format";
import { TrendingUp, TrendingDown, Target, Receipt } from "lucide-react";

interface Props {
  budget: number;
  transactionCount: number;
  monthlySpending: number;
}

export function SummaryCards({ budget, transactionCount, monthlySpending }: Props) {
  const remaining = budget - monthlySpending;
  const pct = budget > 0 ? Math.min((monthlySpending / budget) * 100, 999) : 0;
  const overBudget = budget > 0 && monthlySpending >= budget;
  const warning = budget > 0 && monthlySpending >= budget * 0.8 && !overBudget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Monthly Budget"
        value={budget > 0 ? formatCurrency(budget) : "Not set"}
        icon={<Target className="w-5 h-5" />}
        accent="bg-emerald-50 text-emerald-600"
      />
      <Card
        label="Total Spent"
        value={formatCurrency(monthlySpending)}
        icon={<TrendingUp className="w-5 h-5" />}
        accent={
          overBudget
            ? "bg-rose-50 text-rose-600"
            : warning
            ? "bg-amber-50 text-amber-600"
            : "bg-blue-50 text-blue-600"
        }
        footer={
          budget > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{Math.round(pct)}% of budget</span>
                <span>{formatCurrency(monthlySpending)} / {formatCurrency(budget)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overBudget ? "bg-rose-500" : warning ? "bg-amber-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )
        }
      />
      <Card
        label="Remaining Balance"
        value={budget > 0 ? formatCurrency(Math.max(remaining, 0)) : "—"}
        icon={<TrendingDown className="w-5 h-5" />}
        accent={
          overBudget
            ? "bg-rose-50 text-rose-600"
            : warning
            ? "bg-amber-50 text-amber-600"
            : "bg-violet-50 text-violet-600"
        }
      />
      <Card
        label="Transactions"
        value={String(transactionCount)}
        icon={<Receipt className="w-5 h-5" />}
        accent="bg-cyan-50 text-cyan-600"
      />
    </div>
  );
}

interface CardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  footer?: React.ReactNode;
}

function Card({ label, value, icon, accent, footer }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      {footer}
    </div>
  );
}
