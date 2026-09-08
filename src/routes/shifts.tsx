import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CountDialog } from "@/components/dialogs";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useOffice } from "@/lib/store";
import { money, signedMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shifts")({ component: ShiftsPage });

function ShiftsPage() {
  const shifts = useOffice((s) => s.shifts);
  const selectedId = useOffice((s) => s.selectedId);
  const select = useOffice((s) => s.select);
  const closeShift = useOffice((s) => s.closeShift);
  const [countId, setCountId] = useState<string | null>(null);
  const current = shifts.find((s) => s.id === selectedId) ?? shifts[0];

  const onCount = (id: string) => setCountId(id);
  const onClose = (id: string, number: number) => {
    closeShift(id);
    toast.success(`Shift ${number} closed`);
  };

  return (
    <div>
      <PageHeader
        title="Sales & POS"
        subtitle="Shift close, drawer over/short, cashier performance."
      />
      <div className="space-y-3 md:hidden">
        {shifts.map((s) => {
          const counted = s.countedCash;
          const v = counted === null ? null : counted - s.expectedCash;
          return (
            <article key={s.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">
                    Shift {s.number} · {s.cashier}
                  </div>
                  <div className="text-xs text-muted-foreground">#{s.cashierId}</div>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Fuel</dt>
                  <dd className="font-mono tabular-nums">{money(s.fuelSales, { cents: false })}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Inside</dt>
                  <dd className="font-mono tabular-nums">{money(s.merchSales, { cents: false })}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Expected</dt>
                  <dd className="font-mono tabular-nums">{money(s.expectedCash)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Variance</dt>
                  <dd
                    className={cn(
                      "font-mono tabular-nums",
                      v !== null && v < 0 && "text-destructive",
                      v !== null && v > 0 && "text-ok",
                    )}
                  >
                    {v === null ? "—" : signedMoney(v)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => onCount(s.id)}
                >
                  Count
                </Button>
                <Button
                  className="h-11 flex-1"
                  disabled={s.status === "closed"}
                  onClick={() => onClose(s.id, s.number)}
                >
                  Close
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Shift</th>
              <th className="px-4 py-3 font-medium">Cashier</th>
              <th className="px-4 py-3 font-medium">Fuel</th>
              <th className="px-4 py-3 font-medium">Inside</th>
              <th className="px-4 py-3 font-medium">Expected</th>
              <th className="px-4 py-3 font-medium">Counted</th>
              <th className="px-4 py-3 font-medium">Var</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => {
              const counted = s.countedCash;
              const v = counted === null ? null : counted - s.expectedCash;
              return (
                <tr
                  key={s.id}
                  className={cn(
                    "border-t border-border",
                    current?.id === s.id && "bg-accent/40",
                  )}
                  onClick={() => select(s.id)}
                >
                  <td className="px-4 py-3 font-medium">{s.number}</td>
                  <td className="px-4 py-3">
                    {s.cashier}
                    <div className="text-xs text-muted-foreground">#{s.cashierId}</div>
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {money(s.fuelSales, { cents: false })}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {money(s.merchSales, { cents: false })}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">{money(s.expectedCash)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {counted === null ? "—" : money(counted)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono tabular-nums",
                      v !== null && v < 0 && "text-destructive",
                      v !== null && v > 0 && "text-ok",
                    )}
                  >
                    {v === null ? "—" : signedMoney(v)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCount(s.id);
                        }}
                      >
                        Count
                      </Button>
                      <Button
                        size="sm"
                        disabled={s.status === "closed"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose(s.id, s.number);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <CountDialog
        open={!!countId}
        onOpenChange={(v) => !v && setCountId(null)}
        shiftId={countId}
      />
    </div>
  );
}
