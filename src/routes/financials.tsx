import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { HourlyChart, TrendChart } from "@/components/charts";
import { Kpi } from "@/components/kpi";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { marginCpg, TODAY } from "@/lib/seed";
import { useOffice } from "@/lib/store";
import { cpg, money } from "@/lib/utils";

export const Route = createFileRoute("/financials")({ component: FinancialsPage });

function FinancialsPage() {
  const prices = useOffice((s) => s.prices);
  const shifts = useOffice((s) => s.shifts);
  const navigate = useNavigate();
  const merch = shifts.reduce((n, s) => n + s.merchSales, 0);
  const fuel = TODAY.fuelSales;
  const total = fuel + TODAY.insideSales + TODAY.lottery;

  return (
    <div>
      <PageHeader
        title="Financials"
        subtitle="Day snapshot — not a general ledger. Post to AP from deliveries."
        actions={
          <Button variant="outline" onClick={() => void navigate({ to: "/export" })}>
            <Download />
            Export today
          </Button>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Store sales" value={money(total, { cents: false })} delta={TODAY.totalDelta} />
        <Kpi label="Fuel" value={money(fuel, { cents: false })} delta={TODAY.fuelSalesDelta} />
        <Kpi label="Merchandise" value={money(merch, { cents: false })} delta={TODAY.insideDelta} />
        <Kpi label="Lottery commission" value={money(TODAY.lottery, { cents: false })} delta={6} />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="mb-2 text-sm font-medium">14-day sales</div>
          <TrendChart />
        </div>
        <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="mb-2 text-sm font-medium">Hourly fuel today</div>
          <HourlyChart />
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Posted</th>
              <th className="px-4 py-3 font-medium">Rack</th>
              <th className="px-4 py-3 font-medium">cpg</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{money(p.posted)}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{money(p.cost)}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{cpg(marginCpg(p.posted, p.cost))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
