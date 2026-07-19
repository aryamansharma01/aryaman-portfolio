import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateRange(start: string, end: string, presentIfFuture = false): string {
  const startLabel = formatMonthYear(start);
  const endDate = new Date(end);
  const isFuture = endDate.getTime() > Date.now();
  const endLabel = presentIfFuture && isFuture ? "Present" : formatMonthYear(end);
  return `${startLabel} — ${endLabel}`;
}
