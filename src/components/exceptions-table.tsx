import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useOffice } from "@/lib/store";
import type { Exception } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ExceptionsTable({
  compact,
  limit,
}: {
  compact?: boolean;
  limit?: number;
}) {
  const exceptions = useOffice((s) => s.exceptions);
  const resolve = useOffice((s) => s.resolveException);
  const navigate = useNavigate();
  const rows = exceptions.filter((e) => e.status === "open").slice(0, limit ?? 20);

  if (rows.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        No open exceptions. Store is clean.
      </p>
    );
  }

  const go = (e: Exception) => {
    if (e.kind === "delivery") void navigate({ to: "/deliveries" });
    else if (e.kind === "drawer") void navigate({ to: "/shifts" });
    else if (e.kind === "tank") void navigate({ to: "/fuel" });
    else if (e.kind === "compliance") void navigate({ to: "/compliance" });
    else if (e.kind === "lottery") void navigate({ to: "/inventory" });
  };

  return (
    <>
      <div className="space-y-2 px-3 pb-3 md:hidden">
        {rows.map((e) => (
          <article key={e.id} className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{e.time}</div>
                <h3 className="mt-0.5 text-sm font-medium">{e.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>
              </div>
              {e.amount && (
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs tabular-nums",
                    e.amount.startsWith("−") || e.amount.startsWith("-")
                      ? "text-destructive"
                      : "",
                  )}
                >
                  {e.amount}
                </span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="h-10 flex-1" onClick={() => go(e)}>
                Open
              </Button>
              <Button size="sm" variant="ghost" className="h-10 flex-1" onClick={() => resolve(e.id)}>
                Dismiss
              </Button>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Issue</th>
              {!compact && <th className="px-4 py-2 font-medium">Detail</th>}
              <th className="px-4 py-2 font-medium">Amt</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">{e.time}</td>
                <td className="px-4 py-2.5">
                  <div className="font-medium">{e.title}</div>
                  {compact && <div className="text-xs text-muted-foreground">{e.detail}</div>}
                </td>
                {!compact && (
                  <td className="px-4 py-2.5 text-muted-foreground">{e.detail}</td>
                )}
                <td
                  className={cn(
                    "px-4 py-2.5 font-mono text-xs whitespace-nowrap",
                    e.amount?.startsWith("−") || e.amount?.startsWith("-")
                      ? "text-destructive"
                      : "",
                  )}
                >
                  {e.amount ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => go(e)}>
                      Open
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => resolve(e.id)}>
                      Dismiss
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export { StatusBadge };
