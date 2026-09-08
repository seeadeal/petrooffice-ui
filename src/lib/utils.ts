import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(n: number, opts?: { cents?: boolean }) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.cents === false ? 0 : 2,
    maximumFractionDigits: opts?.cents === false ? 0 : 2,
  });
}

export function gallons(n: number, digits = 1) {
  return `${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} gal`;
}

export function cpg(n: number) {
  return `${n.toFixed(1)}¢`;
}

export function pct(n: number, digits = 0) {
  return `${n.toFixed(digits)}%`;
}

export function signedMoney(n: number) {
  const abs = money(Math.abs(n));
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return abs;
}
