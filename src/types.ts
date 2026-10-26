export type Category =
  | "Food"
  | "Travel"
  | "Shopping"
  | "Education"
  | "Bills"
  | "Health"
  | "Other";

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO yyyy-mm-dd
  description: string;
  createdAt: number;
}

export interface CategoryMeta {
  name: Category;
  color: string; // hex
  bg: string; // tailwind bg class
  text: string; // tailwind text class
  ring: string; // tailwind ring class
}

export const CATEGORIES: CategoryMeta[] = [
  { name: "Food", color: "#3b82f6", bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-300" },
  { name: "Travel", color: "#06b6d4", bg: "bg-cyan-100", text: "text-cyan-700", ring: "ring-cyan-300" },
  { name: "Shopping", color: "#8b5cf6", bg: "violet-100", text: "text-violet-700", ring: "ring-violet-300" },
  { name: "Education", color: "#10b981", bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-300" },
  { name: "Bills", color: "#f59e0b", bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-300" },
  { name: "Health", color: "#ef4444", bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-300" },
  { name: "Other", color: "#64748b", bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-300" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export function getCategoryMeta(name: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const DEFAULT_TOTAL_BUDGET = 150000;

export const DEFAULT_CATEGORY_BUDGETS: Record<Category, number> = {
  Food: 30000,
  Travel: 15000,
  Shopping: 25000,
  Education: 20000,
  Bills: 20000,
  Health: 10000,
  Other: 30000,
};

export type CategoryBudgets = Record<Category, number>;
