import { useMemo } from "react";
import type { Expense } from "../types";
import { lastNMonthKeys, monthKey, formatCurrency, shortMonthLabel } from "../utils/format";

interface Props {
  expenses: Expense[];
  months?: number;
  budget?: number;
}

export function MonthlyChart({ expenses, months = 6, budget = 0 }: Props) {
  const { keys, values, max } = useMemo(() => {
    const ks = lastNMonthKeys(months);
    const map = new Map<string, number>();
    for (const e of expenses) {
      const k = monthKey(e.date);
      map.set(k, (map.get(k) ?? 0) + e.amount);
    }
    const vals = ks.map((k) => map.get(k) ?? 0);
    const m = Math.max(...vals, budget, 1);
    return { keys: ks, values: vals, max: m };
  }, [expenses, months, budget]);

  const chartH = 200;
  const barGap = 14;
  const barWidth = 38;
  const totalW = keys.length * (barWidth + barGap) + barGap;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={Math.max(totalW, 280)}
        height={chartH + 40}
        viewBox={`0 0 ${Math.max(totalW, 280)} ${chartH + 40}`}
        className="block"
      >
        {budget > 0 && budget <= max && (
          <g>
            <line
              x1={barGap / 2}
              x2={Math.max(totalW, 280) - barGap / 2}
              y1={chartH - (budget / max) * chartH + 10}
              y2={chartH - (budget / max) * chartH + 10}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text
              x={Math.max(totalW, 280) - barGap / 2}
              y={chartH - (budget / max) * chartH + 6}
              textAnchor="end"
              fontSize="10"
              fill="#b45309"
              fontWeight="600"
            >
              Budget {formatCurrency(budget)}
            </text>
          </g>
        )}

        {keys.map((k, i) => {
          const v = values[i];
          const h = (v / max) * chartH;
          const x = barGap + i * (barWidth + barGap);
          const y = chartH - h + 10;
          const active = v > 0;
          return (
            <g key={k}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx="6"
                fill={active ? "#3b82f6" : "#e2e8f0"}
              />
              {active && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#1e293b"
                  fontWeight="600"
                >
                  {formatCurrency(v).replace(".00", "")}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={chartH + 28}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {shortMonthLabel(k)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
