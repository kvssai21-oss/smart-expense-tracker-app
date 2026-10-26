import { useMemo, useState } from "react";
import type { Expense, Category } from "../types";
import { getCategoryMeta, CATEGORY_NAMES } from "../types";
import { formatCurrency, formatDate, lastNMonthKeys, monthKey, monthLabel } from "../utils/format";
import { Pencil, Trash2, Search, Filter, Inbox } from "lucide-react";

interface Props {
  expenses: Expense[];
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

type CatFilter = "All" | Category;
type SortKey = "recent" | "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [catFilter, setCatFilter] = useState<CatFilter>("All");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  const monthOptions = useMemo(() => lastNMonthKeys(12), []);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (catFilter !== "All") list = list.filter((e) => e.category === catFilter);
    if (monthFilter !== "all") list = list.filter((e) => monthKey(e.date) === monthFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((e) => e.description.toLowerCase().includes(q));

    list.sort((a, b) => {
      switch (sort) {
        case "date-desc": return b.date.localeCompare(a.date);
        case "date-asc": return a.date.localeCompare(b.date);
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc": return a.amount - b.amount;
        default: return b.createdAt - a.createdAt;
      }
    });
    return list;
  }, [expenses, catFilter, monthFilter, search, sort]);

  function resetFilters() {
    setCatFilter("All");
    setMonthFilter("all");
    setSearch("");
    setSort("recent");
  }

  const activeFilters = catFilter !== "All" || monthFilter !== "all" || search.trim() !== "";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Filter transactions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as CatFilter)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="All">All categories</option>
            {CATEGORY_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="all">All months</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="recent">Most recent</option>
            <option value="date-desc">Date (newest)</option>
            <option value="date-asc">Date (oldest)</option>
            <option value="amount-desc">Amount (high to low)</option>
            <option value="amount-asc">Amount (low to high)</option>
          </select>
        </div>
        {activeFilters && (
          <button
            onClick={resetFilters}
            className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Inbox className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              {expenses.length === 0 ? "No expenses yet" : "No matching transactions"}
            </p>
            <p className="text-xs mt-1">
              {expenses.length === 0
                ? "Click Add Expense to create your first one"
                : "Try adjusting or clearing your filters"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((e) => {
              const meta = getCategoryMeta(e.category);
              return (
                <li key={e.id} className="flex items-center gap-3 py-3 group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg} ${meta.text} shrink-0`}>
                    <span className="text-sm font-bold">{e.category[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{e.description}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(e.date)} · {e.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-800">−{formatCurrency(e.amount)}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {filtered.length > 0 && (
          <p className="mt-3 text-xs text-slate-400 text-center">
            Showing {filtered.length} of {expenses.length} transactions
          </p>
        )}
      </div>
    </div>
  );
}
