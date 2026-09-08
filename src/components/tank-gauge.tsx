import { tankPct } from "@/lib/seed";
import type { Tank } from "@/lib/types";
import { cn, gallons, pct } from "@/lib/utils";

const FILL: Record<string, string> = {
  reg: "bg-fuel-reg",
  prem: "bg-fuel-prem",
  dsl: "bg-fuel-dsl",
};

export function TankGauge({
  tank,
  compact,
}: {
  tank: Tank;
  compact?: boolean;
}) {
  const p = tankPct(tank);
  const low = p <= tank.reorderPct;
  return (
    <div className={cn("flex flex-col gap-2", compact && "gap-1.5")}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{tank.grade}</span>
        <span
          className={cn(
            "text-xs tabular-nums",
            low ? "font-semibold text-destructive" : "text-muted-foreground",
          )}
        >
          {pct(p)} {low ? "reorder" : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", FILL[tank.id] ?? "bg-primary")}
          style={{ width: `${Math.min(100, p)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{gallons(tank.gallons, 0)}</span>
        <span>{gallons(tank.capacity, 0)} cap</span>
      </div>
    </div>
  );
}

export function TankFill({ tank }: { tank: Tank }) {
  const p = tankPct(tank);
  const low = p <= tank.reorderPct;
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-lg bg-muted/60 p-3">
      <div className="text-xs font-medium text-muted-foreground">{tank.grade}</div>
      <div className="relative h-28 w-10 overflow-hidden rounded-md bg-card shadow-[var(--shadow-border)]">
        <div
          className={cn(
            "absolute inset-x-0 bottom-0",
            FILL[tank.id] ?? "bg-primary",
          )}
          style={{ height: `${Math.min(100, p)}%` }}
        />
      </div>
      <div
        className={cn(
          "text-xs font-semibold tabular-nums",
          low && "text-destructive",
        )}
      >
        {pct(p)}
      </div>
      <div className="text-[11px] text-muted-foreground tabular-nums">
        {gallons(tank.gallons, 0)}
      </div>
    </div>
  );
}
