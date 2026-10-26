import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Expense, Category, CategoryBudgets } from "../types";
import { DEFAULT_TOTAL_BUDGET, DEFAULT_CATEGORY_BUDGETS } from "../types";
import { dateInCurrentMonth } from "../utils/format";

const EXPENSES_KEY = "expense-tracker:expenses";
const BUDGET_KEY = "expense-tracker:budget";
const CAT_BUDGETS_KEY = "expense-tracker:category-budgets";
const SEED_KEY = "expense-tracker:seeded";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function seedExpenses(): Expense[] {
  const base = Date.now();
  const rows: Array<[Category, number, string, number]> = [
    ["Food", 150, "Lunch", 1],
    ["Food", 80, "Breakfast", 2],
    ["Travel", 60, "Bus fare", 3],
    ["Shopping", 650, "Clothes", 4],
    ["Education", 500, "Study materials", 5],
    ["Bills", 799, "Internet recharge", 6],
    ["Health", 250, "Medicines", 7],
    ["Other", 200, "Personal expenses", 8],
  ];
  return rows.map(([category, amount, description, day], i) => ({
    id: `${base.toString(36)}-seed-${i}`,
    amount,
    category,
    date: dateInCurrentMonth(day),
    description,
    createdAt: base - i * 1000,
  }));
}

export interface NewExpenseInput {
  amount: number;
  category: Category;
  date: string;
  description: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(EXPENSES_KEY, []);
  const [budget, setBudget] = useLocalStorage<number>(BUDGET_KEY, 0);
  const [categoryBudgets, setCategoryBudgets] = useLocalStorage<CategoryBudgets>(
    CAT_BUDGETS_KEY,
    DEFAULT_CATEGORY_BUDGETS
  );

  const ensureSeedData = useCallback(() => {
    try {
      if (localStorage.getItem(SEED_KEY) === "1") return;
      const raw = localStorage.getItem(EXPENSES_KEY);
      const existing = raw ? (JSON.parse(raw) as Expense[]) : [];
      if (existing.length === 0) {
        setExpenses(seedExpenses());
        setBudget(DEFAULT_TOTAL_BUDGET);
        setCategoryBudgets(DEFAULT_CATEGORY_BUDGETS);
      }
      localStorage.setItem(SEED_KEY, "1");
    } catch {
      // ignore
    }
  }, [setExpenses, setBudget, setCategoryBudgets]);

  const addExpense = useCallback(
    (input: NewExpenseInput) => {
      const expense: Expense = {
        id: uid(),
        amount: input.amount,
        category: input.category,
        date: input.date,
        description: input.description.trim(),
        createdAt: Date.now(),
      };
      setExpenses((prev) => [expense, ...prev]);
      return expense;
    },
    [setExpenses]
  );

  const updateExpense = useCallback(
    (id: string, input: NewExpenseInput) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                amount: input.amount,
                category: input.category,
                date: input.date,
                description: input.description.trim(),
              }
            : e
        )
      );
    },
    [setExpenses]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [setExpenses]
  );

  const totalSpending = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    totalSpending,
    budget,
    setBudget,
    categoryBudgets,
    setCategoryBudgets,
    ensureSeedData,
  };
}
