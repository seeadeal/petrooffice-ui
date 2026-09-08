import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PriceDialog, ScheduleDialog } from "@/components/dialogs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { TankGauge } from "@/components/tank-gauge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { marginCpg, TODAY } from "@/lib/seed";
import { useOffice } from "@/lib/store";
import type { FuelPrice, GradeId } from "@/lib/types";
import { cpg, gallons, money } from "@/lib/utils";

export const Route = createFileRoute("/fuel")({ component: FuelPage });

function FuelPage() {
  const tanks = useOffice((s) => s.tanks);
  const prices = useOffice((s) => s.prices);
  const scheduled = useOffice((s) => s.scheduled);
  const log = useOffice((s) => s.priceLog);
  const match = useOffice((s) => s.matchCompetitor);
  const [price, setPrice] = useState<FuelPrice | null>(null);
  const [grade, setGrade] = useState<GradeId>("dsl");
  const [schedOpen, setSchedOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Fuel"
        subtitle={`Today ${TODAY.gallons.toLocaleString()} gal · margin ${cpg(TODAY.marginCpg)}`}
        actions={
          <Button
            onClick={() => {
              setGrade("dsl");
              setSchedOpen(true);
            }}
          >
            Schedule delivery
          </Button>
        }
      />

      <Tabs defaultValue="tanks">
        <TabsList>
          <TabsTrigger value="tanks">Tanks</TabsTrigger>
          <TabsTrigger value="prices">Prices</TabsTrigger>
        </TabsList>
        <TabsContent value="tanks">
          <div className="grid gap-3 md:grid-cols-3">
            {tanks.map((t) => (
              <div key={t.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-sm font-semibold">{t.name}</div>
                  {t.waterInches >= 1 && <Badge variant="warn">Water</Badge>}
                </div>
                <TankGauge tank={t} />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Temp {t.tempF}°F</span>
                  <span>Water {t.waterInches.toFixed(1)} in</span>
                </div>
                {t.gallons / t.capacity <= t.reorderPct / 100 && (
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    onClick={() => {
                      setGrade(t.id);
                      setSchedOpen(true);
                    }}
                  >
                    Order {t.grade}
                  </Button>
                )}
              </div>
            ))}
          </div>
          {scheduled.length > 0 && (
            <div className="mt-4 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div className="text-sm font-medium">Booked loads</div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {scheduled.map((s) => (
                  <li key={s.id}>
                    {s.supplier} · {gallons(s.gallons, 0)} · {s.window}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>
        <TabsContent value="prices">
          <div className="space-y-3 md:hidden">
            {prices.map((p) => {
              const m = marginCpg(p.posted, p.cost);
              const vs = p.posted - p.competitor;
              return (
                <article key={p.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-medium">{p.name}</h3>
                    <span className="font-mono text-lg font-semibold tabular-nums">
                      {money(p.posted)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Rack</dt>
                      <dd className="font-mono tabular-nums text-muted-foreground">{money(p.cost)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Margin</dt>
                      <dd className="font-mono tabular-nums">{cpg(m)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">Across the street</dt>
                      <dd className="font-mono text-sm tabular-nums">
                        {money(p.competitor)}{" "}
                        <span className={vs > 0 ? "text-destructive" : "text-ok"}>
                          {vs === 0 ? "match" : vs > 0 ? `+${vs.toFixed(3)}` : vs.toFixed(3)}
                        </span>
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      className="h-11 flex-1"
                      onClick={() => match(p.id)}
                    >
                      Match
                    </Button>
                    <Button className="h-11 flex-1" onClick={() => setPrice(p)}>
                      Post
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
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Posted</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Margin</th>
                  <th className="px-4 py-3 font-medium">Across the street</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => {
                  const m = marginCpg(p.posted, p.cost);
                  const vs = p.posted - p.competitor;
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{money(p.posted)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">
                        {money(p.cost)}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums">{cpg(m)}</td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums">
                        {money(p.competitor)}{" "}
                        <span className={vs > 0 ? "text-destructive" : "text-ok"}>
                          {vs === 0 ? "match" : vs > 0 ? `+${vs.toFixed(3)}` : vs.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => match(p.id)}>
                            Match
                          </Button>
                          <Button size="sm" onClick={() => setPrice(p)}>
                            Post
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {log.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {log.slice(0, 5).map((l) => (
                <li key={l.id}>
                  {l.at} · {l.gradeId} {money(l.from)} → {money(l.to)}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <PriceDialog open={!!price} onOpenChange={(v) => !v && setPrice(null)} price={price} />
      <ScheduleDialog open={schedOpen} onOpenChange={setSchedOpen} gradeId={grade} />
    </div>
  );
}
