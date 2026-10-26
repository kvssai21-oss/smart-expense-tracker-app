export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function currentMonthKey(): string {
  return todayISO().slice(0, 7); // yyyy-mm
}

export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function dateInCurrentMonth(day: number): string {
  const d = new Date();
  const today = d.getDate();
  const clamped = Math.min(Math.max(day, 1), today);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

export function formatDate(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function shortMonthLabel(key: string): string {
  const m = Number(key.split("-")[1]);
  return MONTH_NAMES[m - 1];
}

export function lastNMonthKeys(n: number, anchor = currentMonthKey()): string[] {
  const [y, m] = anchor.split("-").map(Number);
  const keys: string[] = [];
  let yr = y;
  let mo = m;
  for (let i = 0; i < n; i++) {
    keys.push(`${yr}-${String(mo).padStart(2, "0")}`);
    mo -= 1;
    if (mo < 1) {
      mo = 12;
      yr -= 1;
    }
  }
  return keys.reverse();
}
