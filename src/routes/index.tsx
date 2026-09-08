import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HourlyChart } from "@/components/charts";
import { ExceptionsTable } from "@/components/exceptions-table";
import { Kpi } from "@/components/kpi";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { STORE, TODAY, tankPct } from "@/lib/seed";
import { useOffice } from "@/lib/store";
import { gallons, money, pct } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const open = useOffice((s) => s.exceptions.filter((e) => e.status === "open").length);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Today’s picture"
        subtitle={`Store #${STORE.id} · ${STORE.name} · Harrisburg`}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi
          label="Total store sales today"
          value={money(TODAY.fuelSales + TODAY.insideSales, { cents: false })}
          delta={TODAY.totalDelta}
        />
        <Kpi
          label="Fuel margin"
          value={`${TODAY.marginCpg.toFixed(1)}¢/gal`}
          delta={TODAY.marginDeltaCpg}
          deltaUnit="¢"
        />
        <Kpi
          label="Open exceptions"
          value={String(open)}
          hint={open === 1 ? "needs action" : "need action"}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] lg:col-span-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Hourly sales</div>
          <HourlyChart />
        </div>
        <DashboardTanks />
      </div>
      <div className="rounded-xl bg-card py-2 shadow-[var(--shadow-border)]">
        <div className="px-4 py-2 text-sm font-medium">Needs attention</div>
        <ExceptionsTable compact limit={4} />
      </div>
    </div>
  );
}

function DashboardTanks() {
  const tanks = useOffice((s) => s.tanks);
  const navigate = useNavigate();
  const diesel = tanks.find((t) => t.id === "dsl");
  if (!diesel) return null;
  const p = tankPct(diesel);
  return (
    <div className="flex flex-col rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="text-xs font-medium text-muted-foreground">Tank 3 — Diesel</div>
      <div className="mt-3 font-mono text-2xl font-semibold tracking-tight whitespace-nowrap tabular-nums sm:text-3xl">
        {pct(p, 0)} remaining
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-fuel-dsl" style={{ width: `${p}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">{gallons(diesel.gallons, 0)}</span>
        <span className="text-warn">Reorder at {diesel.reorderPct}%</span>
      </div>
      <Button className="mt-4 w-full" onClick={() => void navigate({ to: "/fuel" })}>
        Schedule diesel
      </Button>
    </div>
  );
}
