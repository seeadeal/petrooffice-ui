import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { deliveryVariance } from "@/lib/seed";
import { useOffice } from "@/lib/store";
import { gallons, money } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deliveries")({ component: DeliveriesPage });

function DeliveriesPage() {
  const deliveries = useOffice((s) => s.deliveries);
  const selectedId = useOffice((s) => s.selectedId);
  const select = useOffice((s) => s.select);
  const accept = useOffice((s) => s.acceptDelivery);
  const dispute = useOffice((s) => s.disputeDelivery);
  const attach = useOffice((s) => s.attachBol);
  const current =
    deliveries.find((d) => d.id === selectedId) ?? deliveries[0];

  if (!current) {
    return <p className="text-sm text-muted-foreground">No deliveries on file.</p>;
  }

  const v = deliveryVariance(current);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div>
        <PageHeader title="Deliveries" subtitle="BOL vs. ATG stick. Post or dispute before AP." />
        <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
          {deliveries.map((d) => {
            const dv = deliveryVariance(d);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => select(d.id)}
                className={cn(
                  "block w-full border-b border-border px-4 py-3 text-left last:border-0",
                  current.id === d.id && "bg-accent",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">Load #{d.loadNumber}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {d.supplier} · {gallons(dv.invoiced, 0)} · var {dv.gallons} gal
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">
            Load #{current.loadNumber} — {current.supplier}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatWhen(current.deliveredAt)} · {current.driver} · BOL {current.bol}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Invoiced" value={gallons(v.invoiced, 0)} />
          <Stat label="Stick / ATG" value={gallons(v.received, 0)} />
          <Stat
            label="Variance"
            value={`${v.gallons} gal`}
            warn={Math.abs(v.gallons / v.invoiced) > 0.005}
          />
          <Stat label="Invoice" value={money(current.invoiceTotal, { cents: false })} />
        </div>

        <div className="overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Bay</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Invoiced</th>
                <th className="px-3 py-2 font-medium">Received</th>
                <th className="px-3 py-2 font-medium">Var</th>
              </tr>
            </thead>
            <tbody>
              {current.compartments.map((c) => (
                <tr key={c.bay} className="border-t border-border">
                  <td className="px-3 py-2">{c.bay}</td>
                  <td className="px-3 py-2">{c.product}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{c.invoiced.toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{c.received.toLocaleString()}</td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono tabular-nums",
                      c.received - c.invoiced < 0 && "text-destructive",
                    )}
                  >
                    {c.received - c.invoiced}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            disabled={current.status === "posted"}
            onClick={() => {
              accept(current.id);
              toast.success(`Load #${current.loadNumber} posted to inventory`);
            }}
          >
            Accept & post
          </Button>
          <Button
            variant="outline"
            disabled={current.status === "disputed"}
            onClick={() => {
              dispute(current.id);
              toast.message("Dispute sent to carrier");
            }}
          >
            Dispute with carrier
          </Button>
          <Button
            variant="outline"
            disabled={current.bolAttached}
            onClick={() => {
              attach(current.id);
              toast.success("BOL scan attached");
            }}
          >
            {current.bolAttached ? "BOL attached" : "Attach BOL scan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl bg-card p-3 shadow-[var(--shadow-border)]">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-lg font-semibold tabular-nums", warn && "text-warn")}>
        {value}
      </div>
    </div>
  );
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
