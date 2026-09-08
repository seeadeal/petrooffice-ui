import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  Download,
  Package,
  Printer,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CountDialog, PriceDialog, ScheduleDialog } from "@/components/dialogs";
import { StatusBadge } from "@/components/status-badge";
import { TankGauge } from "@/components/tank-gauge";
import { Button } from "@/components/ui/button";
import { downloadTidyCsv, exportFilename } from "@/lib/export-today";
import { useFloor } from "@/lib/floor/store";
import { deliveryVariance, marginCpg, STORE, tankPct, TODAY } from "@/lib/seed";
import type { Exception, FuelPrice, GradeId } from "@/lib/types";
import { cn, cpg, gallons, money, pct, signedMoney } from "@/lib/utils";

export function PhoneScreen({ pathname }: { pathname: string }) {
  switch (pathname) {
    case "/fuel":
      return <PhoneFuel />;
    case "/deliveries":
      return <PhoneLoads />;
    case "/shifts":
      return <PhoneSales />;
    case "/more":
      return <PhoneMore />;
    case "/inventory":
      return <PhoneStore />;
    case "/financials":
      return <PhoneBooks />;
    case "/compliance":
      return <PhoneRules />;
    case "/export":
      return <PhoneClose />;
    default:
      return <PhoneToday />;
  }
}

function PhoneToday() {
  const tanks = useFloor((s) => s.tanks);
  const exceptions = useFloor((s) => s.exceptions);
  const resolve = useFloor((s) => s.resolveException);
  const navigate = useNavigate();
  const diesel = tanks.find((t) => t.id === "dsl");
  const open = exceptions.filter((e) => e.status === "open");
  const p = diesel ? tankPct(diesel) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Store sales"
          value={money(TODAY.fuelSales + TODAY.insideSales, { cents: false })}
        />
        <StatCard label="Fuel margin" value={`${TODAY.marginCpg.toFixed(1)}¢`} />
      </div>

      {diesel && (
        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="text-xs font-medium text-muted-foreground">Tank 3 — Diesel</div>
          <div className="mt-2 font-mono text-3xl font-semibold tracking-tight whitespace-nowrap tabular-nums">
            {pct(p, 0)}
            <span className="ml-2 text-sm font-medium text-muted-foreground">left</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-fuel-dsl" style={{ width: `${p}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">{gallons(diesel.gallons, 0)}</span>
            <span className="text-warn">Reorder {diesel.reorderPct}%</span>
          </div>
          <Button className="mt-4 h-11 w-full" onClick={() => void navigate({ to: "/fuel" })}>
            Schedule diesel
          </Button>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium">Needs you</h2>
        {open.length === 0 ? (
          <p className="rounded-xl bg-card px-4 py-8 text-center text-sm text-muted-foreground shadow-[var(--shadow-border)]">
            Floor is clean.
          </p>
        ) : (
          <div className="space-y-2">
            {open.slice(0, 5).map((e) => (
              <ExceptionCard key={e.id} e={e} onOpen={() => goException(e, navigate)} onDismiss={() => resolve(e.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PhoneFuel() {
  const tanks = useFloor((s) => s.tanks);
  const prices = useFloor((s) => s.prices);
  const scheduled = useFloor((s) => s.scheduled);
  const match = useFloor((s) => s.matchCompetitor);
  const [price, setPrice] = useState<FuelPrice | null>(null);
  const [grade, setGrade] = useState<GradeId>("dsl");
  const [schedOpen, setSchedOpen] = useState(false);

  return (
    <div className="space-y-4">
      {tanks.map((t) => (
        <section key={t.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t.name}</h2>
            {t.waterInches >= 1 && (
              <span className="text-2xs font-medium text-warn">Water {t.waterInches.toFixed(1)} in</span>
            )}
          </div>
          <TankGauge tank={t} />
          {t.gallons / t.capacity <= t.reorderPct / 100 && (
            <Button
              className="mt-3 h-11 w-full"
              onClick={() => {
                setGrade(t.id);
                setSchedOpen(true);
              }}
            >
              Order {t.grade}
            </Button>
          )}
        </section>
      ))}

      {scheduled.length > 0 && (
        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-sm font-medium">Booked</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {scheduled.map((s) => (
              <li key={s.id}>
                {s.supplier} · {gallons(s.gallons, 0)} · {s.window}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Street prices</h2>
        {prices.map((p) => {
          const m = marginCpg(p.posted, p.cost);
          const vs = p.posted - p.competitor;
          return (
            <article key={p.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-medium">{p.name}</h3>
                <span className="font-mono text-lg font-semibold tabular-nums">{money(p.posted)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Margin {cpg(m)} · street {money(p.competitor)}{" "}
                <span className={vs > 0 ? "text-destructive" : "text-ok"}>
                  {vs === 0 ? "match" : vs > 0 ? `+${vs.toFixed(3)}` : vs.toFixed(3)}
                </span>
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" className="h-11 flex-1" onClick={() => match(p.id)}>
                  Match
                </Button>
                <Button className="h-11 flex-1" onClick={() => setPrice(p)}>
                  Post
                </Button>
              </div>
            </article>
          );
        })}
      </section>

      <PriceDialog
        open={!!price}
        onOpenChange={(v) => !v && setPrice(null)}
        price={price}
        source="floor"
      />
      <ScheduleDialog open={schedOpen} onOpenChange={setSchedOpen} gradeId={grade} source="floor" />
    </div>
  );
}

function PhoneLoads() {
  const deliveries = useFloor((s) => s.deliveries);
  const selectedId = useFloor((s) => s.selectedId);
  const select = useFloor((s) => s.select);
  const accept = useFloor((s) => s.acceptDelivery);
  const dispute = useFloor((s) => s.disputeDelivery);
  const attach = useFloor((s) => s.attachBol);
  const current = deliveries.find((d) => d.id === selectedId) ?? deliveries[0];

  if (!current) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No loads on file.</p>;
  }

  const v = deliveryVariance(current);

  return (
    <div className="space-y-3">
      {deliveries.map((d) => {
        const dv = deliveryVariance(d);
        const on = d.id === current.id;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => select(d.id)}
            className={cn(
              "block w-full rounded-xl p-4 text-left shadow-[var(--shadow-border)]",
              on ? "bg-accent" : "bg-card",
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

      <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <h2 className="font-semibold">
          #{current.loadNumber} · {current.supplier}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatWhen(current.deliveredAt)} · {current.driver} · BOL {current.bol}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Invoiced</dt>
            <dd className="font-mono tabular-nums">{gallons(v.invoiced, 0)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">ATG</dt>
            <dd className="font-mono tabular-nums">{gallons(v.received, 0)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Variance</dt>
            <dd className="font-mono tabular-nums">{v.gallons} gal</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Invoice</dt>
            <dd className="font-mono tabular-nums">{money(current.invoiceTotal, { cents: false })}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-col gap-2">
          {current.status === "pending" && (
            <>
              <Button
                className="h-11 w-full"
                onClick={() => {
                  accept(current.id);
                  toast.success(`Load #${current.loadNumber} posted`);
                }}
              >
                Accept & post
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={() => {
                  dispute(current.id);
                  toast.message(`Load #${current.loadNumber} disputed`);
                }}
              >
                Dispute
              </Button>
            </>
          )}
          {!current.bolAttached && (
            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={() => {
                attach(current.id);
                toast.success("BOL attached");
              }}
            >
              Attach BOL
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function PhoneSales() {
  const shifts = useFloor((s) => s.shifts);
  const closeShift = useFloor((s) => s.closeShift);
  const [countId, setCountId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {shifts.map((s) => {
        const counted = s.countedCash;
        const v = counted === null ? null : counted - s.expectedCash;
        return (
          <article key={s.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-medium">
                  Shift {s.number} · {s.cashier}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Fuel {money(s.fuelSales, { cents: false })} · inside {money(s.merchSales, { cents: false })}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Expected</span>
              <span className="font-mono tabular-nums">{money(s.expectedCash)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Counted</span>
              <span className="font-mono tabular-nums">
                {counted === null ? "—" : money(counted)}
              </span>
            </div>
            {v !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Over/short</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    v !== 0 && "text-destructive",
                  )}
                >
                  {signedMoney(v)}
                </span>
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="h-11 flex-1" onClick={() => setCountId(s.id)}>
                Count
              </Button>
              {s.status !== "closed" && (
                <Button
                  className="h-11 flex-1"
                  onClick={() => {
                    closeShift(s.id);
                    toast.success(`Shift ${s.number} closed`);
                  }}
                >
                  Close
                </Button>
              )}
            </div>
          </article>
        );
      })}
      <CountDialog
        open={!!countId}
        onOpenChange={(v) => !v && setCountId(null)}
        shiftId={countId}
        source="floor"
      />
    </div>
  );
}

function PhoneMore() {
  const open = useFloor((s) => s.exceptions.filter((e) => e.status === "open").length);
  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {STORE.initials}
          </div>
          <div>
            <div className="font-medium">{STORE.manager}</div>
            <div className="text-xs text-muted-foreground">Floor · {STORE.brand}</div>
          </div>
        </div>
      </section>
      <nav className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
        <MoreLink to="/inventory" icon={Package} label="Store ops" hint="Receiving & mins" />
        <MoreLink to="/financials" icon={BookOpen} label="Books" hint="Day snapshot" />
        <MoreLink to="/compliance" icon={Shield} label="Rules" hint="UST, lottery, licenses" />
        <MoreLink to="/export" icon={Download} label="Close packet" hint={`${open} open exceptions`} last />
      </nav>
    </div>
  );
}

function PhoneStore() {
  const items = useFloor((s) => s.inventory);
  const receive = useFloor((s) => s.receiveSku);
  return (
    <div className="space-y-2">
      {items.map((i) => {
        const short = i.onHand < i.min;
        return (
          <article key={i.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{i.sku}</div>
              </div>
              <span className="text-xs text-muted-foreground">{i.category}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">On hand</span>
              <span className={cn("font-mono tabular-nums", short && "text-destructive")}>
                {i.onHand} / {i.min}
              </span>
            </div>
            {short && (
              <Button
                className="mt-3 h-11 w-full"
                onClick={() => {
                  receive(i.id, Math.max(i.min - i.onHand, 6));
                  toast.success(`Received ${i.name}`);
                }}
              >
                Receive
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function PhoneBooks() {
  const prices = useFloor((s) => s.prices);
  const shifts = useFloor((s) => s.shifts);
  const merch = shifts.reduce((n, s) => n + s.merchSales, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Store sales"
          value={money(TODAY.fuelSales + TODAY.insideSales + TODAY.lottery, { cents: false })}
        />
        <StatCard label="Merchandise" value={money(merch, { cents: false })} />
        <StatCard label="Fuel" value={money(TODAY.fuelSales, { cents: false })} />
        <StatCard label="Lottery" value={money(TODAY.lottery, { cents: false })} />
      </div>
      <section className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
        {prices.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              "flex items-center justify-between px-4 py-3",
              i > 0 && "border-t border-border",
            )}
          >
            <span className="text-sm">{p.name}</span>
            <span className="font-mono text-sm tabular-nums">{cpg(marginCpg(p.posted, p.cost))}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

function PhoneRules() {
  const items = useFloor((s) => s.compliance);
  const mark = useFloor((s) => s.markCompliance);
  return (
    <div className="space-y-2">
      {items.map((c) => (
        <article key={c.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-medium">{c.title}</h2>
            <StatusBadge status={c.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {c.owner} · {c.due}
          </p>
          {c.status !== "done" && (
            <Button
              className="mt-3 h-11 w-full"
              onClick={() => {
                mark(c.id, "done");
                toast.success("Marked done");
              }}
            >
              Mark done
            </Button>
          )}
        </article>
      ))}
    </div>
  );
}

function PhoneClose() {
  const tanks = useFloor((s) => s.tanks);
  const prices = useFloor((s) => s.prices);
  const deliveries = useFloor((s) => s.deliveries);
  const shifts = useFloor((s) => s.shifts);
  const exceptions = useFloor((s) => s.exceptions);
  const inventory = useFloor((s) => s.inventory);
  const compliance = useFloor((s) => s.compliance);
  const scheduled = useFloor((s) => s.scheduled);
  const data = {
    tanks,
    prices,
    deliveries,
    shifts,
    exceptions,
    inventory,
    compliance,
    scheduled,
  };
  const open = exceptions.filter((e) => e.status === "open").length;
  const diesel = tanks.find((t) => t.id === "dsl");

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted-foreground">Floor close · {STORE.clock}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Open exceptions</dt>
            <dd className="font-mono tabular-nums">{open}</dd>
          </div>
          {diesel && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Diesel remaining</dt>
              <dd className="font-mono tabular-nums">{pct(tankPct(diesel), 0)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Fuel sales</dt>
            <dd className="font-mono tabular-nums">{money(TODAY.fuelSales, { cents: false })}</dd>
          </div>
        </dl>
      </section>
      <Button
        className="h-11 w-full"
        onClick={() => {
          downloadTidyCsv(data);
          toast.message(`Saved ${exportFilename()}`);
        }}
      >
        <Download />
        Download CSV
      </Button>
      <Button variant="outline" className="h-11 w-full" onClick={() => window.print()}>
        <Printer />
        Print packet
      </Button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

function ExceptionCard({
  e,
  onOpen,
  onDismiss,
}: {
  e: Exception;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <article className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{e.time}</div>
          <h3 className="mt-0.5 text-sm font-medium">{e.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>
        </div>
        {e.amount && (
          <span className="shrink-0 font-mono text-xs tabular-nums">{e.amount}</span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="h-11 flex-1" onClick={onOpen}>
          Open
        </Button>
        <Button size="sm" variant="ghost" className="h-11 flex-1" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </article>
  );
}

function MoreLink({
  to,
  icon: Icon,
  label,
  hint,
  last,
}: {
  to: "/inventory" | "/financials" | "/compliance" | "/export";
  icon: typeof Package;
  label: string;
  hint: string;
  last?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-14 items-center gap-3 px-4",
        !last && "border-b border-border",
      )}
    >
      <Icon className="size-5 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}

function goException(
  e: Exception,
  navigate: ReturnType<typeof useNavigate>,
) {
  if (e.kind === "delivery") void navigate({ to: "/deliveries" });
  else if (e.kind === "drawer") void navigate({ to: "/shifts" });
  else if (e.kind === "tank") void navigate({ to: "/fuel" });
  else if (e.kind === "compliance") void navigate({ to: "/compliance" });
  else if (e.kind === "lottery") void navigate({ to: "/inventory" });
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
