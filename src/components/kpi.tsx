import { Delta } from "@/components/format";
import { cn } from "@/lib/utils";

export function Kpi({
  label,
  value,
  delta,
  deltaUnit,
  invert,
  hint,
  className,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaUnit?: string;
  invert?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
        className,
      )}
    >
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {delta !== undefined && <Delta value={delta} unit={deltaUnit} invert={invert} />}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
