import { useEffect, useMemo, useState } from "react";
import { useExpenses } from "./hooks/useExpenses";
import { SummaryCards } from "./components/SummaryCards";
import { CategoryChart } from "./components/CategoryChart";
import { MonthlyChart } from "./components/MonthlyChart";
import { BudgetVsActual } from "./components/BudgetVsActual";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseModal, type ExpenseFormValues } from "./components/ExpenseModal";
import { CategoryBudgetModal } from "./components/CategoryBudgetModal";
import type { Expense, CategoryBudgets } from "./types";
import {
  formatCurrency,
  currentMonthKey,
  monthKey,
  monthLabel,
} from "./utils/format";
import {
  Wallet,
  Plus,
  Target,
  LayoutDashboard,
  Receipt,
  PieChart,
  BarChart3,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";

type View = "dashboard" | "transactions";

export default function App() {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    budget,
    setBudget,
    categoryBudgets,
    setCategoryBudgets,
    ensureSeedData,
  } = useExpenses();

  const [view, setView] = useState<View>("dashboard");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  // Seed sample data only on first launch, never overwriting existing data.
  useEffect(() => {
    ensureSeedData();
  }, [ensureSeedData]);

  const thisMonth = currentMonthKey();
  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === thisMonth),
    [expenses, thisMonth]
  );
  const monthlySpending = useMemo(
    () => monthlyExpenses.reduce((s, e) => s + e.amount, 0),
    [monthlyExpenses]
  );

  const overBudget = budget > 0 && monthlySpending >= budget;
  const warning = budget > 0 && monthlySpending >= budget * 0.8 && !overBudget;

  function openAdd() {
    setEditing(null);
    setExpenseOpen(true);
  }
  function openEdit(e: Expense) {
    setEditing(e);
    setExpenseOpen(true);
  }
  function handleSubmit(v: ExpenseFormValues) {
    if (editing) updateExpense(editing.id, v);
    else addExpense(v);
    setExpenseOpen(false);
    setEditing(null);
  }
  function handleDelete(id: string) {
    deleteExpense(id);
  }
  function handleSaveBudgets(budgets: CategoryBudgets, total: number) {
    setCategoryBudgets(budgets);
    setBudget(total);
    setBudgetOpen(false);
  }

  const navItems = [
    { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions" as View, label: "Transactions", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-blue-700 text-white flex flex-col transition-transform duration-300 ${
          mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 flex items-center gap-2 border-b border-blue-600">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold leading-tight">ExpenseWise</h1>
            <p className="text-xs text-blue-200">Smart Tracker</p>
          </div>
          <button
            onClick={() => setMobileNav(false)}
            className="ml-auto lg:hidden p-1 rounded hover:bg-blue-600"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setMobileNav(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? "bg-white text-blue-700 shadow-sm" : "text-blue-100 hover:bg-blue-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 space-y-2">
          <button
            onClick={() => setBudgetOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-600 transition"
          >
            <Target className="w-4 h-4" />
            {budget > 0 ? "Edit Budget" : "Set Budget"}
          </button>
          <div className="px-3 py-3 rounded-lg bg-blue-600/40 border border-blue-500/30">
            <p className="text-xs text-blue-200">Monthly Budget</p>
            <p className="text-lg font-bold">
              {budget > 0 ? formatCurrency(budget) : "Not set"}
            </p>
          </div>
        </div>
      </aside>

      {mobileNav && (
        <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMobileNav(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileNav(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 capitalize">
              {view === "dashboard" ? "Dashboard" : "Transactions"}
            </h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              {monthLabel(thisMonth)} · {expenses.length} total {expenses.length === 1 ? "expense" : "expenses"}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
          {(overBudget || warning) && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                overBudget ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${overBudget ? "text-rose-500" : "text-amber-500"}`} />
              <div>
                <p className="text-sm font-semibold">
                  {overBudget ? "You've exceeded your monthly budget" : "Approaching your monthly budget"}
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {overBudget
                    ? `You've spent ${formatCurrency(monthlySpending)} of your ${formatCurrency(budget)} budget this month.`
                    : `You've used ${Math.round((monthlySpending / budget) * 100)}% of your ${formatCurrency(budget)} budget. Consider slowing down.`}
                </p>
              </div>
            </div>
          )}

          {view === "dashboard" ? (
            <>
              <SummaryCards
                budget={budget}
                transactionCount={expenses.length}
                monthlySpending={monthlySpending}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Spending by Category</h3>
                  </div>
                  <CategoryChart expenses={expenses} />
                </section>
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-semibold text-slate-700">Budget vs Actual</h3>
                    </div>
                    <button
                      onClick={() => setBudgetOpen(true)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit budgets
                    </button>
                  </div>
                  <BudgetVsActual expenses={monthlyExpenses} categoryBudgets={categoryBudgets} />
                </section>
              </div>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Monthly Trend</h3>
                </div>
                <MonthlyChart expenses={expenses} months={6} budget={budget} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Recent Transactions</h3>
                  <button
                    onClick={() => setView("transactions")}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>
                </div>
                <ExpenseList
                  expenses={expenses.slice(0, 6)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </section>
            </>
          ) : (
            <ExpenseList expenses={expenses} onEdit={openEdit} onDelete={handleDelete} />
          )}
        </main>
      </div>

      <ExpenseModal
        open={expenseOpen}
        onClose={() => { setExpenseOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        editing={editing}
      />
      <CategoryBudgetModal
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        onSave={handleSaveBudgets}
        current={categoryBudgets}
        totalBudget={budget}
      />
    </div>
  );
}
