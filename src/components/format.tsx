import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Delta({
  value,
  unit,
  invert,
  className,
}: {
  value: number;
  unit?: string;
  invert?: boolean;
  className?: string;
}) {
  const up = invert ? value < 0 : value > 0;
  const down = invert ? value > 0 : value < 0;
  const sign = value > 0 ? "▲" : value < 0 ? "▼" : "·";
  const text =
    unit === "¢"
      ? `${sign} ${Math.abs(value).toFixed(1)}¢`
      : unit === "gal"
        ? `${sign} ${Math.abs(value).toFixed(0)} gal`
        : `${sign} ${Math.abs(value).toFixed(1)}%`;
  return (
    <span
      className={cn(
        "text-xs font-medium",
        up && "text-ok",
        down && "text-destructive",
        !up && !down && "text-muted-foreground",
        className,
      )}
    >
      {text}
    </span>
  );
}

export function Num({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums font-medium", className)}>{children}</span>
  );
}
