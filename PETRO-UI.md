# PetroOffice UI — wire two backends

Drop this folder (or this whole markdown) into Claude. **Do not restyle.** Keep the petrol-teal night palette, IBM Plex, dock chrome, and Floor phone shell exactly.

## What this is

Two products, one UI kit:

| App | Viewport | Chrome | Store hook | Backend you own |
|---|---|---|---|---|
| **PetroOffice** (desk) | `md+` | floating dock | `useOffice` | Office API |
| **Floor** (phone) | `< md` | iOS-style tab bar | `useFloor` | Floor API |

They must **not** share rows. Posting a price on Floor must not change Office.

Demo store: Northline Petroleum, store **#0121 Main Street**, Harrisburg. Manager **Jordan Hale (JH)**. Clock frozen at **Fri, Aug 28 · 2:14 PM**.

## Do this

1. Scaffold TanStack Start + Tailwind v4 + the deps in `package.json`.
2. Copy every `src/**` file as-is.
3. Replace `src/lib/station-store.ts` `commit` / `hydrate` so:
   - `useOffice` talks only to the **Office** backend
   - `useFloor` talks only to the **Floor** backend
4. Keep method names and argument shapes on `StationState`. Every screen already calls them.
5. Seed each backend independently from `src/lib/seed.ts` (same shape, separate databases).

## Store contract (do not rename)

```ts
select(id)
postPrice(id, posted)
matchCompetitor(id)
acceptDelivery(id)
disputeDelivery(id)
attachBol(id)
scheduleDelivery({ gradeId, gallons, window, supplier })
resolveException(id)
countDrawer(shiftId, counted)
closeShift(shiftId)
receiveSku(id, qty)
markCompliance(id, status)
```

Snapshot fields: `tanks prices deliveries shifts exceptions inventory compliance scheduled priceLog selectedId`.

`hydrateOffice()` / `hydrateFloor()` run once on app mount (`app-shell.tsx`). Point those at `GET` snapshot. Mutations should round-trip a full snapshot (or patch the same fields).

## Visual rules

- Tokens live in `src/styles.css` (`#0c1012` night, `#7dbeb6` petrol, `#f4f0e6` paper).
- No new colors, no extra fonts, no purple, no emoji-as-icons.
- Dock is **desk only**. Floor tab bar is **phone only** (`md:hidden` / `hidden md:contents` in `app-shell.tsx`).
- Tap targets ≥ 44px on phone. No horizontal overflow at 390px.
- Export page prints a paper close packet + tidy CSV (`export-today.ts`).

## Routes

`/ /fuel /deliveries /shifts /inventory /financials /compliance /export /more`

Phone tabs: Today, Fuel, Loads, Sales, More. More stacks Store / Books / Rules / Close.

## Out of scope for the paste

Auth, Neon, Grok preview bridge — omitted on purpose. You wire persistence.

---

# Source files

Paste the blocks below as the paths in the heading.

## `package.json`

```json
{
  "name": "petrooffice-ui",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tailwindcss/vite": "^4.3.0",
    "@tanstack/react-router": "^1.170.0",
    "@tanstack/react-start": "^1.168.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "lucide-react": "^0.510.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "recharts": "^2.13.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.3.0",
    "zustand": "^5.0.0"
  }
}
```

## `public/favicon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#7dbeb6"/>
  <path fill="#0c1012" fill-rule="evenodd" d="M7.5 6.2h11.3c5.8 0 9.2 3.4 9.2 7.8 0 4.6-3.6 8-9.6 8H12.6V26H7.5V6.2zm5.1 4.4h5.6c3 0 4.8 1.4 4.8 3.4s-1.9 3.5-4.9 3.5h-5.5V10.6z"/>
</svg>
```

## `src/components/charts.tsx`

```tsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HOURLY, TREND } from "@/lib/seed";
import { money } from "@/lib/utils";

const tick = { fill: "var(--muted-foreground)", fontSize: 11 };

export function TrendChart({ height = 180 }: { height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={TREND} barCategoryGap={4}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
          <YAxis
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => money(Number(v), { cents: false })}
          />
          <Bar dataKey="fuel" fill="var(--primary)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="inside" fill="var(--fuel-prem)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HourlyChart({ height = 140 }: { height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={HOURLY} barCategoryGap={6}>
          <XAxis dataKey="hour" tick={tick} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => money(Number(v), { cents: false })}
          />
          <Bar dataKey="fuel" fill="var(--primary)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## `src/components/command-palette.tsx`

```tsx
import { Command } from "cmdk";
import type { ComponentProps } from "react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NAV, type AppPath } from "@/lib/nav";
import { useOffice } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CommandPalette({
  open,
  onOpenChange,
  docked,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  docked?: boolean;
}) {
  const router = useRouter();
  const office = useOffice();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (path: AppPath) => {
    void router.navigate({ to: path });
    onOpenChange(false);
    setQ("");
  };

  const inner = (
    <Command
      className={cn(
        "overflow-hidden bg-card text-card-foreground",
        docked
          ? "rounded-xl shadow-[var(--shadow-border)]"
          : "rounded-xl shadow-[var(--shadow-border)]",
      )}
      loop
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Command.Input
          value={q}
          onValueChange={setQ}
          placeholder="Jump, post, schedule, reconcile…"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          ESC
        </kbd>
      </div>
      <Command.List className="max-h-72 overflow-auto p-1">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
          Nothing matches.
        </Command.Empty>
        <Command.Group
          heading="Go to"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
        >
          {NAV.map((n) => (
            <Item
              key={n.id}
              value={`${n.label} ${n.path}`}
              hint={n.hint}
              onSelect={() => go(n.path)}
            >
              <n.icon className="size-4" />
              {n.label}
            </Item>
          ))}
        </Command.Group>
        <Command.Group
          heading="Actions"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
        >
          <Item
            value="export today close packet csv print"
            hint="G E"
            onSelect={() => go("/export")}
          >
            Export today
          </Item>
          <Item
            value="schedule diesel delivery tank 3"
            hint="N D"
            onSelect={() => {
              office.scheduleDelivery({
                gradeId: "dsl",
                gallons: 2200,
                window: "Tomorrow 6:00 AM",
                supplier: "Valero",
              });
              toast.success("Diesel load booked for tomorrow 6:00 AM");
              onOpenChange(false);
            }}
          >
            Schedule diesel delivery
          </Item>
          <Item
            value="match competitor regular price"
            onSelect={() => {
              office.matchCompetitor("reg");
              toast.success("Regular matched to street price");
              onOpenChange(false);
            }}
          >
            Match Regular to competitor
          </Item>
          <Item
            value="accept load 8841 delivery"
            onSelect={() => {
              office.acceptDelivery("d8841");
              toast.success("Load #8841 posted");
              go("/deliveries");
            }}
          >
            Accept & post load #8841
          </Item>
          <Item
            value="close shift 2 priya"
            onSelect={() => {
              office.closeShift("s2");
              toast.success("Shift 2 closed");
              go("/shifts");
            }}
          >
            Close shift 2
          </Item>
        </Command.Group>
        <Command.Group
          heading="Tanks"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
        >
          {office.tanks.map((t) => (
            <Item
              key={t.id}
              value={`${t.name} ${t.grade} tank`}
              onSelect={() => go("/fuel")}
            >
              {t.name} · {t.grade} · {Math.round((t.gallons / t.capacity) * 100)}%
            </Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command>
  );

  if (docked) return inner;
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-foreground/30 p-4 pt-[12vh]"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </div>
    </div>
  );
}

function Item({
  children,
  hint,
  ...props
}: ComponentProps<typeof Command.Item> & { hint?: string }) {
  return (
    <Command.Item
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground data-[selected=true]:bg-accent"
      {...props}
    >
      {children}
      {hint && (
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
```

## `src/components/dialogs.tsx`

```tsx
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { marginCpg } from "@/lib/seed";
import type { BackendId } from "@/lib/station-ops";
import { useStation } from "@/lib/use-station";
import type { FuelPrice, GradeId } from "@/lib/types";
import { cpg, money } from "@/lib/utils";

export function PriceDialog({
  open,
  onOpenChange,
  price,
  source = "office",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  price: FuelPrice | null;
  source?: BackendId;
}) {
  const postPrice = useStation(source).postPrice;
  const [val, setVal] = useState("");

  const shown = val || (price ? price.posted.toFixed(3) : "");
  const num = Number(shown);
  const nextMargin = price && Number.isFinite(num) ? marginCpg(num, price.cost) : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v && price) setVal(price.posted.toFixed(3));
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post {price?.name} price</DialogTitle>
          <DialogDescription>
            Updates the street sign and POS. Margin is rack vs. posted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`posted-${source}`}>Posted $/gal</Label>
            <Input
              id={`posted-${source}`}
              inputMode="decimal"
              value={shown}
              onChange={(e) => setVal(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          {price && Number.isFinite(num) && (
            <p className="text-sm text-muted-foreground">
              Cost {money(price.cost)} · new margin{" "}
              <span className="font-medium text-foreground">{cpg(nextMargin)}</span>
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!price || !Number.isFinite(num)) return;
                postPrice(price.id, num);
                toast.success(`${price.name} posted at ${money(num)}`);
                onOpenChange(false);
              }}
            >
              Post to pumps
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ScheduleDialog({
  open,
  onOpenChange,
  gradeId,
  source = "office",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  gradeId: GradeId;
  source?: BackendId;
}) {
  const station = useStation(source);
  const schedule = station.scheduleDelivery;
  const tank = station.tanks.find((t) => t.id === gradeId);
  const [gals, setGals] = useState("2200");
  const [window, setWindow] = useState("Tomorrow 6:00 AM");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule {tank?.grade ?? "fuel"} delivery</DialogTitle>
          <DialogDescription>
            Books a drop with Valero. Clears the reorder exception when confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`gals-${source}`}>Gallons</Label>
            <Input
              id={`gals-${source}`}
              inputMode="numeric"
              value={gals}
              onChange={(e) => setGals(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor={`win-${source}`}>Window</Label>
            <Input
              id={`win-${source}`}
              value={window}
              onChange={(e) => setWindow(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                schedule({
                  gradeId,
                  gallons: Number(gals) || 0,
                  window,
                  supplier: "Valero",
                });
                toast.success(`${tank?.grade} load booked · ${window}`);
                onOpenChange(false);
              }}
            >
              Book load
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CountDialog({
  open,
  onOpenChange,
  shiftId,
  source = "office",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shiftId: string | null;
  source?: BackendId;
}) {
  const station = useStation(source);
  const shift = station.shifts.find((x) => x.id === shiftId);
  const countDrawer = station.countDrawer;
  const [val, setVal] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v && shift) setVal((shift.countedCash ?? shift.expectedCash).toFixed(2));
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Count drawer — Shift {shift?.number}</DialogTitle>
          <DialogDescription>
            {shift?.cashier}. Expected {shift ? money(shift.expectedCash) : "—"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`count-${source}`}>Counted cash</Label>
            <Input
              id={`count-${source}`}
              inputMode="decimal"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!shiftId) return;
                countDrawer(shiftId, Number(val) || 0);
                toast.success("Drawer count saved");
                onOpenChange(false);
              }}
            >
              Save count
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## `src/components/exceptions-table.tsx`

```tsx
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
```

## `src/components/export-sheet.tsx`

```tsx
import { deliveryVariance, marginCpg, STORE, tankPct, TODAY } from "@/lib/seed";
import type { ExportSnapshot } from "@/lib/export-today";
import { gallons, money } from "@/lib/utils";

function SheetTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 font-mono text-xs font-medium tracking-wide text-paper-muted uppercase">
        {caption}
      </h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-paper-rule py-1.5 pr-3 text-left text-xs font-medium text-paper-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b border-paper-rule py-1.5 pr-3 align-top tabular-nums"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function ExportSheet({ data }: { data: ExportSnapshot }) {
  const merch = data.shifts.reduce((n, s) => n + s.merchSales, 0);
  const open = data.exceptions.filter((e) => e.status === "open");
  const low = data.inventory.filter((i) => i.onHand < i.min);
  const due = data.compliance.filter((c) => c.status === "due" || c.status === "overdue");

  return (
    <article className="export-sheet rounded-xl px-6 py-8 sm:px-10 sm:py-10">
      <header className="border-b border-paper-rule pb-5">
        <div className="font-mono text-xs tracking-wide text-paper-muted uppercase">
          {STORE.brand} · close packet
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Store #{STORE.id} {STORE.name}
        </h1>
        <p className="mt-1 text-sm text-paper-muted">
          {STORE.address}
          <br />
          As of {STORE.clock} · Prepared by {STORE.manager}
        </p>
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <Stat label="Store sales" value={money(TODAY.fuelSales + TODAY.insideSales + TODAY.lottery, { cents: false })} />
        <Stat label="Fuel" value={money(TODAY.fuelSales, { cents: false })} />
        <Stat label="Merchandise" value={money(merch, { cents: false })} />
        <Stat label="Open exceptions" value={String(open.length)} />
      </dl>

      <SheetTable
        caption="Tanks"
        headers={["Tank", "Grade", "Gallons", "%", "Water"]}
        rows={data.tanks.map((t) => [
          t.name,
          t.grade,
          gallons(t.gallons, 0),
          `${Math.round(tankPct(t))}%`,
          `${t.waterInches.toFixed(1)} in`,
        ])}
      />

      <SheetTable
        caption="Posted prices"
        headers={["Grade", "Posted", "Rack", "Street", "cpg"]}
        rows={data.prices.map((p) => [
          p.name,
          money(p.posted),
          money(p.cost),
          money(p.competitor),
          `${marginCpg(p.posted, p.cost).toFixed(1)}¢`,
        ])}
      />

      <SheetTable
        caption="Deliveries"
        headers={["Load", "Supplier", "Status", "Var", "Invoice"]}
        rows={data.deliveries.map((d) => {
          const v = deliveryVariance(d);
          return [
            `#${d.loadNumber}`,
            d.supplier,
            d.status,
            `${v.gallons} gal`,
            money(d.invoiceTotal, { cents: false }),
          ];
        })}
      />

      <SheetTable
        caption="Shifts"
        headers={["#", "Cashier", "Status", "Expected", "Counted", "O/S"]}
        rows={data.shifts.map((sh) => [
          sh.number,
          sh.cashier,
          sh.status,
          money(sh.expectedCash),
          sh.countedCash === null ? "—" : money(sh.countedCash),
          sh.countedCash === null
            ? "—"
            : money(sh.countedCash - sh.expectedCash),
        ])}
      />

      <SheetTable
        caption="Exceptions still open"
        headers={["Time", "Issue", "Amt"]}
        rows={
          open.length
            ? open.map((e) => [e.time, e.title, e.amount ?? "—"])
            : [["—", "None open", "—"]]
        }
      />

      <SheetTable
        caption="Store ops — below min"
        headers={["Item", "On hand", "Min"]}
        rows={
          low.length
            ? low.map((i) => [i.name, i.onHand, i.min])
            : [["—", "All above min", "—"]]
        }
      />

      <SheetTable
        caption="Compliance due"
        headers={["Item", "Due", "Status"]}
        rows={
          due.length
            ? due.map((c) => [c.title, c.due, c.status])
            : [["—", "Nothing due", "—"]]
        }
      />

      <p className="mt-8 font-mono text-xs text-paper-muted">
        Day snapshot for night audit — not a general ledger. File {`PO-${STORE.id}-Main-Street-2026-08-28.csv`}
      </p>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-paper-muted">{label}</dt>
      <dd className="font-mono text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
```

## `src/components/format.tsx`

```tsx
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
```

## `src/components/kpi.tsx`

```tsx
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
```

## `src/components/layout/app-shell.tsx`

```tsx
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/command-palette";
import { PhoneShell } from "@/components/mobile/shell";
import { hydrateFloor } from "@/lib/floor/store";
import { G_PATH } from "@/lib/nav";
import { hydrateOffice } from "@/lib/store";
import { DockShell } from "./dock";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [cmd, setCmd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.shell =
      window.matchMedia("(max-width: 767px)").matches ? "phone" : "dock";
    void hydrateOffice();
    void hydrateFloor();
  }, []);

  useEffect(() => {
    let armed = false;
    let timer = 0;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "g" && !armed) {
        armed = true;
        timer = window.setTimeout(() => {
          armed = false;
        }, 800);
        return;
      }
      if (!armed) return;
      armed = false;
      window.clearTimeout(timer);
      const path = G_PATH[k];
      if (path) {
        e.preventDefault();
        void navigate({ to: path });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <>
      <div className="md:hidden print:hidden">
        <PhoneShell pathname={pathname} />
      </div>
      <div className="hidden md:contents print:contents">
        <DockShell current={pathname} onCommand={() => setCmd(true)}>
          {children}
        </DockShell>
        <CommandPalette open={cmd} onOpenChange={setCmd} />
      </div>
    </>
  );
}
```

## `src/components/layout/chrome.tsx`

```tsx
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STORE } from "@/lib/seed";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          aria-label="Account"
        >
          {STORE.initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          {STORE.manager}
          <div className="font-normal text-muted-foreground">Store manager</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Desk app · Office API
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="size-11 md:hidden"
        onClick={onClick}
        aria-label="Search"
      >
        <Search className="size-4" />
      </Button>
      <button
        type="button"
        onClick={onClick}
        className="hidden h-9 items-center gap-2 rounded-md bg-card px-3 text-sm text-muted-foreground shadow-[var(--shadow-border)] md:flex md:w-52"
      >
        <Search className="size-3.5" />
        Search
        <kbd className="ml-auto font-mono text-2xs">⌘K</kbd>
      </button>
    </>
  );
}
```

## `src/components/layout/dock.tsx`

```tsx
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV } from "@/lib/nav";
import { STORE } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { SearchTrigger, UserMenu } from "./chrome";

export function DockShell({
  current,
  onCommand,
  children,
}: {
  current: string;
  onCommand: () => void;
  children: ReactNode;
}) {
  const active = NAV.find((n) => n.path === current);
  const section = current === "/export" ? "Export" : current === "/more" ? "More" : active?.label;

  return (
    <div className="min-h-dvh pb-24 sm:pb-28">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-background px-3 print:hidden sm:h-16 sm:gap-3 sm:px-8">
        <Logo className="shrink-0" />
        <span className="hidden min-w-0 truncate rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground sm:inline">
          #{STORE.id} {STORE.name}
        </span>
        <span className="hidden rounded-full bg-card px-2.5 py-1 text-2xs font-medium text-muted-foreground shadow-[var(--shadow-border)] lg:inline">
          Office API
        </span>
        {section && (
          <span className="hidden text-sm text-muted-foreground md:inline">{section}</span>
        )}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="hidden text-sm text-muted-foreground lg:inline">{STORE.clock}</span>
          <SearchTrigger onClick={onCommand} />
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/export">
              <Download />
              Export today
            </Link>
          </Button>
          <Button size="icon" variant="ghost" asChild className="size-11 sm:hidden">
            <Link to="/export" aria-label="Export today">
              <Download />
            </Link>
          </Button>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-8 print:max-w-none print:px-0">
        {children}
      </main>
      <nav
        aria-label="Modules"
        className="dock-nav fixed left-1/2 z-50 flex max-w-[calc(100vw-1.25rem)] -translate-x-1/2 gap-0.5 overflow-x-auto rounded-2xl bg-card p-1 shadow-[var(--shadow-border)] print:hidden sm:gap-1 sm:p-1.5"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {NAV.map((n) => {
          const on = current === n.path;
          return (
            <Tooltip key={n.id}>
              <TooltipTrigger asChild>
                <Link
                  to={n.path}
                  aria-label={n.label}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 min-w-11 shrink-0 flex-col items-center justify-center rounded-xl px-2.5 transition-[background-color,color,transform] duration-150 ease-out sm:min-h-14 sm:min-w-16",
                    on
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <n.icon className="size-5" />
                  <span className="mt-0.5 hidden text-2xs font-medium leading-none sm:block">
                    {n.short}
                  </span>
                  <span className="sr-only sm:hidden">{n.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">{n.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </div>
  );
}
```

## `src/components/logo.tsx`

```tsx
import { cn } from "@/lib/utils";

export function Logo({
  className,
  markClass,
}: {
  className?: string;
  markClass?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg
        viewBox="0 0 24 24"
        className={cn("size-5 shrink-0", markClass)}
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" className="text-primary" />
        <path
          d="M9.2 16.2V8.4h2.15c1.72 0 2.78.86 2.78 2.28 0 1.44-1.08 2.34-2.82 2.34H10.5v3.18H9.2Zm1.3-4.32h.78c.9 0 1.42-.46 1.42-1.16 0-.7-.5-1.12-1.4-1.12H10.5v2.28Z"
          fill="var(--primary-foreground)"
        />
      </svg>
      <span>
        Petro<span className="font-normal text-muted-foreground">Office</span>
      </span>
    </span>
  );
}
```

## `src/components/mobile/screens.tsx`

```tsx
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
```

## `src/components/mobile/shell.tsx`

```tsx
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PHONE_MORE_PATHS, PHONE_TABS } from "@/lib/nav";
import { STORE } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { PhoneScreen } from "./screens";

const TITLES: Record<string, string> = {
  "/": "Today",
  "/fuel": "Fuel",
  "/deliveries": "Loads",
  "/shifts": "Sales",
  "/more": "More",
  "/inventory": "Store",
  "/financials": "Books",
  "/compliance": "Rules",
  "/export": "Close",
};

const STACK = new Set(["/inventory", "/financials", "/compliance", "/export"]);

export function PhoneShell({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const stacked = STACK.has(pathname);
  const title = TITLES[pathname] ?? "PetroOffice";

  return (
    <div className="phone-app flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 px-4 pt-3 pb-2 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          {stacked ? (
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center gap-0.5 text-primary"
              onClick={() => void navigate({ to: "/more" })}
            >
              <ChevronLeft className="size-5" />
              <span className="text-sm font-medium">More</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-medium tracking-wide text-muted-foreground uppercase">
                #{STORE.id}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-2xs font-medium text-secondary-foreground">
                Floor API
              </span>
            </div>
          )}
          <span className="text-2xs tabular-nums text-muted-foreground">{STORE.clock}</span>
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
        {!stacked && pathname === "/" && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {STORE.name} · Harrisburg
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        <PhoneScreen pathname={pathname} />
      </div>

      <nav
        aria-label="Floor app"
        className="phone-tabbar grid grid-cols-5 border-t border-border bg-card/95 print:hidden"
      >
        {PHONE_TABS.map((tab) => {
          const on =
            tab.path === "/more"
              ? PHONE_MORE_PATHS.includes(pathname as (typeof PHONE_MORE_PATHS)[number])
              : pathname === tab.path;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 pt-1 text-2xs font-medium",
                on ? "text-primary" : "text-muted-foreground",
              )}
            >
              <tab.icon className="size-5" />
              {tab.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

## `src/components/page-header.tsx`

```tsx
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
```

## `src/components/status-badge.tsx`

```tsx
import { Badge } from "@/components/ui/badge";

const MAP = {
  posted: { variant: "ok" as const, label: "Posted" },
  pending: { variant: "warn" as const, label: "Review" },
  disputed: { variant: "danger" as const, label: "Disputed" },
  open: { variant: "warn" as const, label: "Open" },
  closed: { variant: "ok" as const, label: "Closed" },
  review: { variant: "warn" as const, label: "Review" },
  resolved: { variant: "ok" as const, label: "Resolved" },
  ok: { variant: "ok" as const, label: "Current" },
  due: { variant: "warn" as const, label: "Due soon" },
  overdue: { variant: "danger" as const, label: "Overdue" },
  done: { variant: "ok" as const, label: "Done" },
};

export function StatusBadge({ status }: { status: keyof typeof MAP | string }) {
  const m = MAP[status as keyof typeof MAP] ?? {
    variant: "outline" as const,
    label: status,
  };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
```

## `src/components/tank-gauge.tsx`

```tsx
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
```

## `src/components/ui/badge.tsx`

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        ok: "bg-ok/12 text-ok",
        warn: "bg-warn/15 text-warn",
        danger: "bg-destructive/12 text-destructive",
        outline: "shadow-[var(--shadow-border)] text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

## `src/components/ui/button.tsx`

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent",
        outline:
          "bg-card text-foreground shadow-[var(--shadow-border)] hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-3.5",
        sm: "h-8 rounded-sm px-2.5 text-xs",
        lg: "h-11 rounded-lg px-5",
        icon: "size-10",
        "icon-sm": "size-8 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## `src/components/ui/dialog.tsx`

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogPortal(props: ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

export function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-foreground/30 data-[state=open]:animate-in data-[state=closed]:animate-out",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-5 text-card-foreground shadow-[var(--shadow-border)]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 rounded-sm p-1 text-muted-foreground hover:bg-accent">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
```

## `src/components/ui/dropdown-menu.tsx`

```tsx
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-[var(--shadow-border)]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
```

## `src/components/ui/input.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md bg-card px-3 text-sm shadow-[var(--shadow-border)] transition-shadow placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
```

## `src/components/ui/label.tsx`

```tsx
import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}
```

## `src/components/ui/scroll-area.tsx`

```tsx
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function ScrollArea({
  className,
  children,
  ...props
}: ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root className={cn("overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex w-2 touch-none bg-transparent p-px"
      >
        <ScrollAreaPrimitive.Thumb className="flex-1 rounded-full bg-border" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}
```

## `src/components/ui/separator.tsx`

```tsx
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
```

## `src/components/ui/sheet.tsx`

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "left" | "right" | "bottom";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/30" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-card text-card-foreground shadow-[var(--shadow-border)]",
          side === "left" && "inset-y-0 left-0 w-[min(20rem,90vw)] p-4",
          side === "right" && "inset-y-0 right-0 w-[min(20rem,90vw)] p-4",
          side === "bottom" && "inset-x-0 bottom-0 rounded-t-xl p-4",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 rounded-sm p-1 text-muted-foreground hover:bg-accent">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
```

## `src/components/ui/tabs.tsx`

```tsx
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-lg bg-muted p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[var(--shadow-border)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-4", className)} {...props} />;
}
```

## `src/components/ui/tooltip.tsx`

```tsx
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
```

## `src/lib/export-today.ts`

```ts
import {
  deliveryVariance,
  marginCpg,
  STORE,
  tankPct,
  TODAY,
} from "./seed";
import type {
  ComplianceItem,
  Delivery,
  Exception,
  FuelPrice,
  InventoryItem,
  ScheduledLoad,
  Shift,
  Tank,
} from "./types";

export interface ExportSnapshot {
  tanks: Tank[];
  prices: FuelPrice[];
  deliveries: Delivery[];
  shifts: Shift[];
  exceptions: Exception[];
  inventory: InventoryItem[];
  compliance: ComplianceItem[];
  scheduled: ScheduledLoad[];
}

export const EXPORT_DATE = "2026-08-28";

export function exportFilename() {
  return `PO-${STORE.id}-Main-Street-${EXPORT_DATE}.csv`;
}

function cell(v: string | number) {
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function table(headers: string[], rows: (string | number)[][]) {
  return [headers.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join(
    "\n",
  );
}

export function buildTidyCsv(s: ExportSnapshot) {
  const merch = s.shifts.reduce((n, sh) => n + sh.merchSales, 0);
  const blocks = [
    [
      `# PetroOffice close packet`,
      `# ${STORE.brand} · Store ${STORE.id} ${STORE.name}`,
      `# ${STORE.address}`,
      `# As of ${STORE.clock}`,
      `# Prepared by ${STORE.manager}`,
    ].join("\n"),
    table(
      ["snapshot", "value"],
      [
        ["store_sales", (TODAY.fuelSales + TODAY.insideSales + TODAY.lottery).toFixed(2)],
        ["fuel_sales", TODAY.fuelSales.toFixed(2)],
        ["merchandise", merch.toFixed(2)],
        ["lottery_commission", TODAY.lottery.toFixed(2)],
        ["gallons", TODAY.gallons],
        ["fuel_margin_cpg", TODAY.marginCpg.toFixed(1)],
        ["open_exceptions", s.exceptions.filter((e) => e.status === "open").length],
      ],
    ),
    table(
      ["tank", "grade", "gallons", "capacity", "pct", "water_in", "reorder_pct", "temp_f"],
      s.tanks.map((t) => [
        t.name,
        t.grade,
        t.gallons,
        t.capacity,
        Math.round(tankPct(t)),
        t.waterInches,
        t.reorderPct,
        t.tempF,
      ]),
    ),
    table(
      ["grade", "posted", "rack", "competitor", "margin_cpg"],
      s.prices.map((p) => [
        p.name,
        p.posted.toFixed(3),
        p.cost.toFixed(3),
        p.competitor.toFixed(3),
        marginCpg(p.posted, p.cost).toFixed(1),
      ]),
    ),
    table(
      ["load", "supplier", "status", "invoiced_gal", "received_gal", "variance_gal", "invoice_total", "bol"],
      s.deliveries.map((d) => {
        const v = deliveryVariance(d);
        return [
          d.loadNumber,
          d.supplier,
          d.status,
          v.invoiced,
          v.received,
          v.gallons,
          d.invoiceTotal.toFixed(2),
          d.bol,
        ];
      }),
    ),
    table(
      ["shift", "cashier", "status", "fuel_sales", "merch_sales", "expected_cash", "counted_cash", "over_short"],
      s.shifts.map((sh) => {
        const counted = sh.countedCash ?? "";
        const over =
          sh.countedCash === null ? "" : (sh.countedCash - sh.expectedCash).toFixed(2);
        return [
          sh.number,
          sh.cashier,
          sh.status,
          sh.fuelSales.toFixed(2),
          sh.merchSales.toFixed(2),
          sh.expectedCash.toFixed(2),
          counted === "" ? "" : Number(counted).toFixed(2),
          over,
        ];
      }),
    ),
    table(
      ["time", "kind", "title", "detail", "amount", "status"],
      s.exceptions.map((e) => [
        e.time,
        e.kind,
        e.title,
        e.detail,
        e.amount ?? "",
        e.status,
      ]),
    ),
    table(
      ["sku", "name", "category", "on_hand", "min", "vendor", "last_received"],
      s.inventory.map((i) => [
        i.sku,
        i.name,
        i.category,
        i.onHand,
        i.min,
        i.vendor,
        i.lastReceived,
      ]),
    ),
    table(
      ["item", "owner", "due", "status", "notes"],
      s.compliance.map((c) => [c.title, c.owner, c.due, c.status, c.notes]),
    ),
  ];

  if (s.scheduled.length) {
    blocks.push(
      table(
        ["scheduled_grade", "gallons", "window", "supplier"],
        s.scheduled.map((l) => [l.gradeId, l.gallons, l.window, l.supplier]),
      ),
    );
  }

  return `\uFEFF${blocks.join("\n\n")}\n`;
}

export function downloadTidyCsv(s: ExportSnapshot) {
  const blob = new Blob([buildTidyCsv(s)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

## `src/lib/floor/store.ts`

```ts
import { createStationStore } from "@/lib/station-store";

const floor = createStationStore();
export const useFloor = floor.useStore;
export const hydrateFloor = floor.hydrate;
```

## `src/lib/nav.ts`

```ts
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Ellipsis,
  Fuel,
  LayoutDashboard,
  Package,
  Receipt,
  Shield,
  Truck,
} from "lucide-react";

export type AppPath =
  | "/"
  | "/fuel"
  | "/deliveries"
  | "/shifts"
  | "/inventory"
  | "/financials"
  | "/compliance"
  | "/export"
  | "/more";

export interface NavItem {
  id: string;
  label: string;
  short: string;
  path: AppPath;
  icon: LucideIcon;
  hint?: string;
  key: string;
}

export const NAV: NavItem[] = [
  { id: "home", label: "Home", short: "Home", path: "/", icon: LayoutDashboard, hint: "G H", key: "h" },
  { id: "fuel", label: "Fuel", short: "Fuel", path: "/fuel", icon: Fuel, hint: "G F", key: "f" },
  {
    id: "deliveries",
    label: "Deliveries",
    short: "Loads",
    path: "/deliveries",
    icon: Truck,
    hint: "G D",
    key: "d",
  },
  {
    id: "shifts",
    label: "Sales & POS",
    short: "Sales",
    path: "/shifts",
    icon: Receipt,
    hint: "G S",
    key: "s",
  },
  {
    id: "inventory",
    label: "Store Ops",
    short: "Store",
    path: "/inventory",
    icon: Package,
    hint: "G I",
    key: "i",
  },
  {
    id: "financials",
    label: "Financials",
    short: "Books",
    path: "/financials",
    icon: BookOpen,
    hint: "G N",
    key: "n",
  },
  {
    id: "compliance",
    label: "Compliance",
    short: "Rules",
    path: "/compliance",
    icon: Shield,
    hint: "G C",
    key: "c",
  },
];

export const PHONE_TABS: NavItem[] = [
  { id: "home", label: "Today", short: "Today", path: "/", icon: LayoutDashboard, key: "h" },
  { id: "fuel", label: "Fuel", short: "Fuel", path: "/fuel", icon: Fuel, key: "f" },
  { id: "deliveries", label: "Loads", short: "Loads", path: "/deliveries", icon: Truck, key: "d" },
  { id: "shifts", label: "Sales", short: "Sales", path: "/shifts", icon: Receipt, key: "s" },
  { id: "more", label: "More", short: "More", path: "/more", icon: Ellipsis, key: "m" },
];

export const PHONE_MORE_PATHS: AppPath[] = [
  "/more",
  "/inventory",
  "/financials",
  "/compliance",
  "/export",
];

export const G_PATH: Record<string, AppPath> = {
  h: "/",
  f: "/fuel",
  d: "/deliveries",
  s: "/shifts",
  i: "/inventory",
  n: "/financials",
  c: "/compliance",
  e: "/export",
  m: "/more",
};
```

## `src/lib/seed.ts`

```ts
import type {
  ComplianceItem,
  DayPoint,
  Delivery,
  Exception,
  FuelPrice,
  HourPoint,
  InventoryItem,
  Shift,
  Tank,
} from "./types";

export const STORE = {
  id: "0121",
  name: "Main Street",
  address: "412 Main Street, Harrisburg, PA",
  brand: "Northline Petroleum",
  manager: "Jordan Hale",
  initials: "JH",
  clock: "Fri, Aug 28 · 2:14 PM",
  fiscal: "August 2026",
  phone: "(717) 555-0142",
};

export const TANKS: Tank[] = [
  {
    id: "reg",
    name: "Tank 1",
    grade: "Regular 87",
    capacity: 6000,
    gallons: 4210,
    waterInches: 0.1,
    reorderPct: 30,
    tempF: 64,
  },
  {
    id: "prem",
    name: "Tank 2",
    grade: "Premium 93",
    capacity: 4200,
    gallons: 1890,
    waterInches: 0,
    reorderPct: 28,
    tempF: 63,
  },
  {
    id: "dsl",
    name: "Tank 3",
    grade: "Diesel",
    capacity: 2900,
    gallons: 640,
    waterInches: 1.4,
    reorderPct: 25,
    tempF: 66,
  },
];

export const PRICES: FuelPrice[] = [
  { id: "reg", name: "Regular 87", posted: 3.459, cost: 3.098, competitor: 3.439 },
  { id: "prem", name: "Premium 93", posted: 3.899, cost: 3.375, competitor: 3.879 },
  { id: "dsl", name: "Diesel", posted: 3.799, cost: 3.389, competitor: 3.829 },
];

export const DELIVERIES: Delivery[] = [
  {
    id: "d8841",
    loadNumber: "8841",
    supplier: "Valero",
    carrier: "Valero Transport",
    deliveredAt: "2026-08-28T05:48:00",
    driver: "M. Ruiz",
    bol: "77120",
    status: "pending",
    invoiceTotal: 25602,
    bolAttached: false,
    compartments: [
      { bay: 1, product: "Regular 87", gradeId: "reg", invoiced: 5000, received: 4989 },
      { bay: 2, product: "Regular 87", gradeId: "reg", invoiced: 3500, received: 3493 },
    ],
  },
  {
    id: "d8838",
    loadNumber: "8838",
    supplier: "Valero",
    carrier: "Valero Transport",
    deliveredAt: "2026-08-26T06:12:00",
    driver: "K. Patel",
    bol: "77004",
    status: "posted",
    invoiceTotal: 13188,
    bolAttached: true,
    compartments: [
      { bay: 1, product: "Diesel", gradeId: "dsl", invoiced: 4200, received: 4196 },
    ],
  },
  {
    id: "d8835",
    loadNumber: "8835",
    supplier: "Chevron",
    carrier: "Keenan Tank Lines",
    deliveredAt: "2026-08-24T04:55:00",
    driver: "A. Brooks",
    bol: "44881",
    status: "posted",
    invoiceTotal: 6905,
    bolAttached: true,
    compartments: [
      { bay: 1, product: "Premium 93", gradeId: "prem", invoiced: 2100, received: 2104 },
    ],
  },
  {
    id: "d8830",
    loadNumber: "8830",
    supplier: "Valero",
    carrier: "Valero Transport",
    deliveredAt: "2026-08-21T05:20:00",
    driver: "M. Ruiz",
    bol: "76812",
    status: "posted",
    invoiceTotal: 25882,
    bolAttached: true,
    compartments: [
      { bay: 1, product: "Regular 87", gradeId: "reg", invoiced: 8500, received: 8497 },
    ],
  },
  {
    id: "d8827",
    loadNumber: "8827",
    supplier: "Mobil",
    carrier: "Apex Fuel Haul",
    deliveredAt: "2026-08-18T07:02:00",
    driver: "J. Nguyen",
    bol: "19044",
    status: "posted",
    invoiceTotal: 18606,
    bolAttached: true,
    compartments: [
      { bay: 1, product: "Regular 87", gradeId: "reg", invoiced: 4000, received: 3992 },
      { bay: 2, product: "Diesel", gradeId: "dsl", invoiced: 2000, received: 2001 },
    ],
  },
];

export const SHIFTS: Shift[] = [
  {
    id: "s3",
    number: 3,
    cashier: "Devon Blake",
    cashierId: "4",
    openedAt: "2026-08-28T14:00:00",
    closedAt: null,
    expectedCash: 412.55,
    countedCash: null,
    fuelSales: 9840,
    merchSales: 2110,
    status: "open",
  },
  {
    id: "s2",
    number: 2,
    cashier: "Priya Shah",
    cashierId: "7",
    openedAt: "2026-08-28T06:00:00",
    closedAt: "2026-08-28T14:02:00",
    expectedCash: 628.4,
    countedCash: 614.2,
    fuelSales: 11220,
    merchSales: 4860,
    status: "review",
  },
  {
    id: "s1",
    number: 1,
    cashier: "Luis Ortega",
    cashierId: "2",
    openedAt: "2026-08-27T22:00:00",
    closedAt: "2026-08-28T06:04:00",
    expectedCash: 388.1,
    countedCash: 435.9,
    fuelSales: 7350,
    merchSales: 5510,
    status: "review",
  },
];

export const EXCEPTIONS: Exception[] = [
  {
    id: "e1",
    time: "09:42",
    kind: "tank",
    title: "Diesel below reorder",
    detail: "Tank 3 (Diesel) is at 22% — 640 gal. Reorder point is 25%.",
    relatedId: "dsl",
    status: "open",
  },
  {
    id: "e2",
    time: "08:15",
    kind: "drawer",
    title: "Shift 1 over by $47.80",
    detail: "Cashier #2 Luis Ortega — counted $435.90 vs expected $388.10.",
    amount: "+$47.80",
    relatedId: "s1",
    status: "open",
  },
  {
    id: "e3",
    time: "07:30",
    kind: "delivery",
    title: "Load #8841 variance 1.2%",
    detail: "Valero Regular 87 — invoiced 8,500 gal, ATG 8,482 gal (−18).",
    amount: "−18 gal",
    relatedId: "d8841",
    status: "open",
  },
  {
    id: "e4",
    time: "06:50",
    kind: "tank",
    title: "Water in Tank 3",
    detail: "ATG reports 1.4 in of water in diesel. Investigate before next drop.",
    relatedId: "dsl",
    status: "open",
  },
  {
    id: "e5",
    time: "Yesterday",
    kind: "compliance",
    title: "UST leak-test due in 6 days",
    detail: "Annual tank tightness test for Tanks 1–3. Vendor: Hartwell Testing.",
    relatedId: "c1",
    status: "open",
  },
  {
    id: "e6",
    time: "Yesterday",
    kind: "lottery",
    title: "Scratcher pack 25 missing",
    detail: "Pack #4418 (Lucky 7s $5) not in vault scan after shift 3 close.",
    amount: "$250",
    status: "open",
  },
  {
    id: "e7",
    time: "06:02",
    kind: "drawer",
    title: "Shift 2 short $14.20",
    detail: "Cashier #7 Priya Shah — counted $614.20 vs expected $628.40.",
    amount: "−$14.20",
    relatedId: "s2",
    status: "open",
  },
];

export const INVENTORY: InventoryItem[] = [
  {
    id: "i1",
    sku: "4900003712",
    name: "Coca-Cola 20 oz",
    category: "Beverages",
    onHand: 18,
    min: 24,
    vendor: "McLane",
    lastReceived: "Aug 26",
  },
  {
    id: "i2",
    sku: "0284000792",
    name: "Lay's Classic 2.63 oz",
    category: "Snacks",
    onHand: 7,
    min: 12,
    vendor: "Frito-Lay DSD",
    lastReceived: "Aug 27",
  },
  {
    id: "i3",
    sku: "0120000012",
    name: "Marlboro Gold Kings",
    category: "Tobacco",
    onHand: 42,
    min: 20,
    vendor: "McLane",
    lastReceived: "Aug 25",
  },
  {
    id: "i4",
    sku: "7622210990",
    name: "Red Bull 8.4 oz",
    category: "Beverages",
    onHand: 11,
    min: 16,
    vendor: "McLane",
    lastReceived: "Aug 26",
  },
  {
    id: "i5",
    sku: "0400000014",
    name: "Snickers 1.86 oz",
    category: "Candy",
    onHand: 29,
    min: 18,
    vendor: "McLane",
    lastReceived: "Aug 26",
  },
  {
    id: "i6",
    sku: "0719900011",
    name: "Bud Light 6pk 12 oz",
    category: "Beer",
    onHand: 4,
    min: 8,
    vendor: "Keystone Distributing",
    lastReceived: "Aug 22",
  },
  {
    id: "i7",
    sku: "0411969107",
    name: "Monster Energy 16 oz",
    category: "Beverages",
    onHand: 22,
    min: 12,
    vendor: "McLane",
    lastReceived: "Aug 26",
  },
  {
    id: "i8",
    sku: "0259000001",
    name: "5-Hour Energy Berry",
    category: "OTC",
    onHand: 3,
    min: 10,
    vendor: "McLane",
    lastReceived: "Aug 19",
  },
];

export const COMPLIANCE: ComplianceItem[] = [
  {
    id: "c1",
    title: "Annual UST tightness test",
    owner: "Hartwell Testing",
    due: "Sep 3, 2026",
    status: "due",
    notes: "Tanks 1–3. Schedule before month-end close.",
  },
  {
    id: "c2",
    title: "Spill-bucket inspection",
    owner: "Jordan Hale",
    due: "Sep 15, 2026",
    status: "ok",
    notes: "Monthly. Last done Aug 15.",
  },
  {
    id: "c3",
    title: "Fire suppression 6-month",
    owner: "Ansul Certified",
    due: "Oct 2, 2026",
    status: "ok",
    notes: "Hood + tank farm extinguishers.",
  },
  {
    id: "c4",
    title: "Weights & measures — pumps",
    owner: "PA Dept. of Ag",
    due: "Nov 12, 2026",
    status: "ok",
    notes: "All 8 positions certified Mar 2026.",
  },
  {
    id: "c5",
    title: "Tobacco retail license",
    owner: "County Clerk",
    due: "Jan 31, 2027",
    status: "ok",
    notes: "Renewal packet in office safe.",
  },
  {
    id: "c6",
    title: "Lottery retailer bond",
    owner: "PA Lottery",
    due: "Aug 20, 2026",
    status: "overdue",
    notes: "Bond lapsed 8 days ago. Call 1-800-PA-LOTTO.",
  },
  {
    id: "c7",
    title: "Stage II vapor recovery check",
    owner: "Jordan Hale",
    due: "Dec 1, 2026",
    status: "ok",
    notes: "Visual + pressure decay.",
  },
  {
    id: "c8",
    title: "Employee food-handler cards",
    owner: "HR",
    due: "Sep 30, 2026",
    status: "due",
    notes: "Priya Shah expires Sep 12.",
  },
];

export const HOURLY: HourPoint[] = [
  { hour: "5a", fuel: 420, inside: 80 },
  { hour: "6a", fuel: 980, inside: 210 },
  { hour: "7a", fuel: 1640, inside: 490 },
  { hour: "8a", fuel: 2100, inside: 720 },
  { hour: "9a", fuel: 1880, inside: 640 },
  { hour: "10a", fuel: 1420, inside: 580 },
  { hour: "11a", fuel: 1560, inside: 710 },
  { hour: "12p", fuel: 2340, inside: 980 },
  { hour: "1p", fuel: 1980, inside: 860 },
  { hour: "2p", fuel: 1760, inside: 640 },
];

export const TREND: DayPoint[] = [
  { date: "08-15", label: "Sat", fuel: 31200, inside: 14110, gallons: 9102 },
  { date: "08-16", label: "Sun", fuel: 28740, inside: 12280, gallons: 8420 },
  { date: "08-17", label: "Mon", fuel: 24110, inside: 10140, gallons: 7104 },
  { date: "08-18", label: "Tue", fuel: 25330, inside: 10880, gallons: 7440 },
  { date: "08-19", label: "Wed", fuel: 26890, inside: 11420, gallons: 7890 },
  { date: "08-20", label: "Thu", fuel: 27440, inside: 11900, gallons: 8012 },
  { date: "08-21", label: "Fri", fuel: 30110, inside: 13840, gallons: 8840 },
  { date: "08-22", label: "Sat", fuel: 32480, inside: 15210, gallons: 9410 },
  { date: "08-23", label: "Sun", fuel: 29100, inside: 12440, gallons: 8510 },
  { date: "08-24", label: "Mon", fuel: 23880, inside: 9980, gallons: 7022 },
  { date: "08-25", label: "Tue", fuel: 24960, inside: 10770, gallons: 7310 },
  { date: "08-26", label: "Wed", fuel: 26140, inside: 11290, gallons: 7688 },
  { date: "08-27", label: "Thu", fuel: 27020, inside: 11840, gallons: 7920 },
  { date: "08-28", label: "Fri", fuel: 28410, inside: 12480, gallons: 8214 },
];

export const TODAY = {
  fuelSales: 28410,
  insideSales: 12480,
  lottery: 412,
  gallons: 8214,
  gallonsDelta: -1.8,
  fuelSalesDelta: 0.9,
  insideDelta: 4.2,
  marginCpg: 38.2,
  marginDeltaCpg: 2.1,
  totalDelta: 3.1,
  nextDelivery: "Tomorrow 6:00 AM",
};

export function marginCpg(posted: number, cost: number) {
  return (posted - cost) * 100;
}

export function tankPct(t: Tank) {
  return (t.gallons / t.capacity) * 100;
}

export function deliveryVariance(d: Delivery) {
  const inv = d.compartments.reduce((s, c) => s + c.invoiced, 0);
  const rec = d.compartments.reduce((s, c) => s + c.received, 0);
  return { invoiced: inv, received: rec, gallons: rec - inv };
}
```

## `src/lib/station-ops.ts`

```ts
import type {
  ComplianceItem,
  Delivery,
  Exception,
  FuelPrice,
  InventoryItem,
  PriceLog,
  ScheduledLoad,
  Shift,
  Tank,
} from "./types";

export type BackendId = "office" | "floor";

export interface StationSnapshot {
  tanks: Tank[];
  prices: FuelPrice[];
  deliveries: Delivery[];
  shifts: Shift[];
  exceptions: Exception[];
  inventory: InventoryItem[];
  compliance: ComplianceItem[];
  scheduled: ScheduledLoad[];
  priceLog: PriceLog[];
}
```

## `src/lib/station-store.ts`

```ts
import { create } from "zustand";
import {
  COMPLIANCE,
  DELIVERIES,
  EXCEPTIONS,
  INVENTORY,
  PRICES,
  SHIFTS,
  TANKS,
} from "./seed";
import type { StationSnapshot } from "./station-ops";
import type { ComplianceItem, GradeId } from "./types";

export interface StationState extends StationSnapshot {
  selectedId: string | null;
  select: (id: string | null) => void;
  postPrice: (id: GradeId, posted: number) => void;
  matchCompetitor: (id: GradeId) => void;
  acceptDelivery: (id: string) => void;
  disputeDelivery: (id: string) => void;
  attachBol: (id: string) => void;
  scheduleDelivery: (input: {
    gradeId: GradeId;
    gallons: number;
    window: string;
    supplier: string;
  }) => void;
  resolveException: (id: string) => void;
  countDrawer: (shiftId: string, counted: number) => void;
  closeShift: (shiftId: string) => void;
  receiveSku: (id: string, qty: number) => void;
  markCompliance: (id: string, status: ComplianceItem["status"]) => void;
}

const seedSnapshot = (): StationSnapshot => ({
  tanks: structuredClone(TANKS),
  prices: structuredClone(PRICES),
  deliveries: structuredClone(DELIVERIES),
  shifts: structuredClone(SHIFTS),
  exceptions: structuredClone(EXCEPTIONS),
  inventory: structuredClone(INVENTORY),
  compliance: structuredClone(COMPLIANCE),
  scheduled: [],
  priceLog: [],
});

/** Local demo store. Claude: keep this shape; swap the body of each method
 *  (and `hydrate`) for your Office or Floor API. Two store instances = two backends. */
export function createStationStore() {
  const useStore = create<StationState>((set, get) => ({
    ...seedSnapshot(),
    selectedId: "d8841",
    select: (id) => set({ selectedId: id }),
    postPrice: (id, posted) => {
      const current = get().prices.find((p) => p.id === id);
      if (!current) return;
      set((s) => ({
        prices: s.prices.map((p) => (p.id === id ? { ...p, posted } : p)),
        priceLog: [
          { id: `pl-${Date.now()}`, gradeId: id, from: current.posted, to: posted, at: "2:14 PM" },
          ...s.priceLog,
        ],
      }));
    },
    matchCompetitor: (id) => {
      const p = get().prices.find((x) => x.id === id);
      if (p) get().postPrice(id, p.competitor);
    },
    acceptDelivery: (id) =>
      set((s) => ({
        deliveries: s.deliveries.map((d) => (d.id === id ? { ...d, status: "posted" } : d)),
        exceptions: s.exceptions.map((e) =>
          e.relatedId === id ? { ...e, status: "resolved" } : e,
        ),
      })),
    disputeDelivery: (id) =>
      set((s) => ({
        deliveries: s.deliveries.map((d) => (d.id === id ? { ...d, status: "disputed" } : d)),
      })),
    attachBol: (id) =>
      set((s) => ({
        deliveries: s.deliveries.map((d) => (d.id === id ? { ...d, bolAttached: true } : d)),
      })),
    scheduleDelivery: (input) =>
      set((s) => ({
        scheduled: [{ id: `sch-${Date.now()}`, ...input, createdAt: "2:14 PM" }, ...s.scheduled],
        exceptions: s.exceptions.map((e) =>
          e.kind === "tank" && e.relatedId === input.gradeId ? { ...e, status: "resolved" } : e,
        ),
      })),
    resolveException: (id) =>
      set((s) => ({
        exceptions: s.exceptions.map((e) => (e.id === id ? { ...e, status: "resolved" } : e)),
      })),
    countDrawer: (shiftId, counted) =>
      set((s) => ({
        shifts: s.shifts.map((sh) =>
          sh.id === shiftId
            ? {
                ...sh,
                countedCash: counted,
                status: counted === sh.expectedCash ? "closed" : "review",
              }
            : sh,
        ),
      })),
    closeShift: (shiftId) =>
      set((s) => ({
        shifts: s.shifts.map((sh) =>
          sh.id === shiftId
            ? {
                ...sh,
                status: "closed",
                closedAt: sh.closedAt ?? "2026-08-28T14:14:00",
                countedCash: sh.countedCash ?? sh.expectedCash,
              }
            : sh,
        ),
        exceptions: s.exceptions.map((e) =>
          e.relatedId === shiftId ? { ...e, status: "resolved" } : e,
        ),
      })),
    receiveSku: (id, qty) =>
      set((s) => ({
        inventory: s.inventory.map((i) =>
          i.id === id ? { ...i, onHand: i.onHand + qty, lastReceived: "Aug 28" } : i,
        ),
      })),
    markCompliance: (id, status) =>
      set((s) => ({
        compliance: s.compliance.map((c) => (c.id === id ? { ...c, status } : c)),
        exceptions: s.exceptions.map((e) =>
          e.relatedId === id && status === "done" ? { ...e, status: "resolved" } : e,
        ),
      })),
  }));

  const hydrate = async () => {
    /* WIRE: GET snapshot from this store's backend, then useStore.setState(snap) */
  };

  return { useStore, hydrate };
}
```

## `src/lib/store.ts`

```ts
import { createStationStore } from "./station-store";

export type { StationState as OfficeState } from "./station-store";

const office = createStationStore();
export const useOffice = office.useStore;
export const hydrateOffice = office.hydrate;
```

## `src/lib/types.ts`

```ts
export type GradeId = "reg" | "prem" | "dsl";

export type ExceptionKind =
  | "tank"
  | "drawer"
  | "delivery"
  | "compliance"
  | "lottery"
  | "price";

export type RecordKind = "delivery" | "shift" | "exception" | "sku" | "compliance";

export interface Tank {
  id: GradeId;
  name: string;
  grade: string;
  capacity: number;
  gallons: number;
  waterInches: number;
  reorderPct: number;
  tempF: number;
}

export interface FuelPrice {
  id: GradeId;
  name: string;
  posted: number;
  cost: number;
  competitor: number;
}

export interface DeliveryCompartment {
  bay: number;
  product: string;
  gradeId: GradeId;
  invoiced: number;
  received: number;
}

export interface Delivery {
  id: string;
  loadNumber: string;
  supplier: string;
  carrier: string;
  deliveredAt: string;
  driver: string;
  bol: string;
  status: "pending" | "posted" | "disputed";
  compartments: DeliveryCompartment[];
  invoiceTotal: number;
  bolAttached: boolean;
}

export interface Shift {
  id: string;
  number: 1 | 2 | 3;
  cashier: string;
  cashierId: string;
  openedAt: string;
  closedAt: string | null;
  expectedCash: number;
  countedCash: number | null;
  fuelSales: number;
  merchSales: number;
  status: "open" | "closed" | "review";
}

export interface Exception {
  id: string;
  time: string;
  kind: ExceptionKind;
  title: string;
  detail: string;
  amount?: string;
  status: "open" | "resolved";
  relatedId?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  onHand: number;
  min: number;
  vendor: string;
  lastReceived: string;
}

export interface ComplianceItem {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: "ok" | "due" | "overdue" | "done";
  notes: string;
}

export interface HourPoint {
  hour: string;
  fuel: number;
  inside: number;
}

export interface DayPoint {
  date: string;
  label: string;
  fuel: number;
  inside: number;
  gallons: number;
}

export interface ScheduledLoad {
  id: string;
  gradeId: GradeId;
  gallons: number;
  window: string;
  supplier: string;
  createdAt: string;
}

export interface PriceLog {
  id: string;
  gradeId: GradeId;
  from: number;
  to: number;
  at: string;
}
```

## `src/lib/use-station.ts`

```ts
import { useFloor } from "@/lib/floor/store";
import { useOffice } from "@/lib/store";
import type { BackendId } from "@/lib/station-ops";

export function useStation(source: BackendId) {
  const office = useOffice();
  const floor = useFloor();
  return source === "floor" ? floor : office;
}
```

## `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(n: number, opts?: { cents?: boolean }) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.cents === false ? 0 : 2,
    maximumFractionDigits: opts?.cents === false ? 0 : 2,
  });
}

export function gallons(n: number, digits = 1) {
  return `${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} gal`;
}

export function cpg(n: number) {
  return `${n.toFixed(1)}¢`;
}

export function pct(n: number, digits = 0) {
  return `${n.toFixed(digits)}%`;
}

export function signedMoney(n: number) {
  const abs = money(Math.abs(n));
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return abs;
}
```

## `src/routes/__root.tsx`

```tsx
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PetroOffice" },
      { name: "theme-color", content: "#0c1012" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
      },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider delayDuration={200}>
          <AppShell>
            <Outlet />
          </AppShell>
          <Toaster
            position="top-center"
            toastOptions={{
              className: "bg-card text-card-foreground shadow-[var(--shadow-border)] border-0",
            }}
          />
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  );
}
```

## `src/routes/compliance.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useOffice } from "@/lib/store";

export const Route = createFileRoute("/compliance")({ component: CompliancePage });

function CompliancePage() {
  const items = useOffice((s) => s.compliance);
  const mark = useOffice((s) => s.markCompliance);
  const due = items.filter((c) => c.status === "due" || c.status === "overdue").length;

  return (
    <div>
      <PageHeader
        title="Compliance"
        subtitle={`${due} items due or overdue. UST, fire, lottery, licenses.`}
      />
      <div className="space-y-2">
        {items.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium">{c.title}</h2>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.owner} · due {c.due} · {c.notes}
              </p>
            </div>
            <div className="flex gap-2">
              {c.status !== "done" && (
                <Button
                  size="sm"
                  onClick={() => {
                    mark(c.id, "done");
                    toast.success("Marked complete");
                  }}
                >
                  Mark done
                </Button>
              )}
              {c.status === "done" && (
                <Button size="sm" variant="outline" onClick={() => mark(c.id, "ok")}>
                  Reopen
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## `src/routes/deliveries.tsx`

```tsx
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
```

## `src/routes/export.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { ExportSheet } from "@/components/export-sheet";
import { Button } from "@/components/ui/button";
import { downloadTidyCsv, exportFilename } from "@/lib/export-today";
import { useOffice } from "@/lib/store";

export const Route = createFileRoute("/export")({ component: ExportPage });

function ExportPage() {
  const tanks = useOffice((s) => s.tanks);
  const prices = useOffice((s) => s.prices);
  const deliveries = useOffice((s) => s.deliveries);
  const shifts = useOffice((s) => s.shifts);
  const exceptions = useOffice((s) => s.exceptions);
  const inventory = useOffice((s) => s.inventory);
  const compliance = useOffice((s) => s.compliance);
  const scheduled = useOffice((s) => s.scheduled);
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

  return (
    <div className="pb-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Today’s packet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Print a paper close, or download a tidy CSV for Excel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              downloadTidyCsv(data);
              toast.message(`Saved ${exportFilename()}`);
            }}
          >
            <Download />
            CSV
          </Button>
          <Button onClick={() => window.print()}>
            <Printer />
            Print
          </Button>
        </div>
      </div>
      <ExportSheet data={data} />
    </div>
  );
}
```

## `src/routes/financials.tsx`

```tsx
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
```

## `src/routes/fuel.tsx`

```tsx
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
```

## `src/routes/index.tsx`

```tsx
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
```

## `src/routes/inventory.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useOffice } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

function InventoryPage() {
  const items = useOffice((s) => s.inventory);
  const receive = useOffice((s) => s.receiveSku);
  const low = items.filter((i) => i.onHand < i.min);

  const onReceive = (id: string, name: string, onHand: number, min: number) => {
    receive(id, Math.max(min - onHand, 6));
    toast.success(`Received ${name}`);
  };

  return (
    <div>
      <PageHeader
        title="Store ops"
        subtitle={`${low.length} items below min. Receiving against McLane & DSD.`}
      />
      <div className="space-y-3 md:hidden">
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
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">On hand</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    short && "font-semibold text-destructive",
                  )}
                >
                  {i.onHand} / {i.min} min
                </span>
              </div>
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>{i.vendor}</span>
                <span>{i.lastReceived}</span>
              </div>
              <Button
                className="mt-3 h-11 w-full"
                variant={short ? "default" : "outline"}
                onClick={() => onReceive(i.id, i.name, i.onHand, i.min)}
              >
                Receive
              </Button>
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">On hand</th>
              <th className="px-4 py-3 font-medium">Min</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Last recv</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const short = i.onHand < i.min;
              return (
                <tr key={i.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{i.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{i.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.category}</td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono tabular-nums",
                      short && "font-semibold text-destructive",
                    )}
                  >
                    {i.onHand}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">
                    {i.min}
                  </td>
                  <td className="px-4 py-3">{i.vendor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.lastReceived}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={short ? "default" : "outline"}
                      onClick={() => onReceive(i.id, i.name, i.onHand, i.min)}
                    >
                      Receive
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## `src/routes/more.tsx`

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Download, Package, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/more")({ component: MorePage });

function MorePage() {
  return (
    <div>
      <PageHeader
        title="More"
        subtitle="Desk modules. The phone app uses this as its Floor menu."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Card to="/inventory" icon={Package} title="Store ops" body="Receiving and mins." />
        <Card to="/financials" icon={BookOpen} title="Financials" body="Day snapshot, not a GL." />
        <Card to="/compliance" icon={Shield} title="Compliance" body="UST, lottery, licenses." />
        <Card to="/export" icon={Download} title="Close packet" body="CSV and print." />
      </div>
    </div>
  );
}

function Card({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: "/inventory" | "/financials" | "/compliance" | "/export";
  icon: typeof Package;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
    >
      <Icon className="mt-0.5 size-5 text-muted-foreground" />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{body}</span>
      </span>
    </Link>
  );
}
```

## `src/routes/shifts.tsx`

```tsx
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
```

## `src/styles.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-ok: var(--ok);
  --color-warn: var(--warn);
  --color-fuel-reg: var(--fuel-reg);
  --color-fuel-prem: var(--fuel-prem);
  --color-fuel-dsl: var(--fuel-dsl);
  --color-paper: var(--paper);
  --color-paper-ink: var(--paper-ink);
  --color-paper-muted: var(--paper-muted);
  --color-paper-rule: var(--paper-rule);

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;

  --text-2xs: 0.6875rem;
  --text-2xs--line-height: 1rem;

  --shadow-border: 0px 0px 0px 1px rgba(22, 25, 22, 0.06),
    0px 1px 2px -1px rgba(22, 25, 22, 0.06), 0px 2px 4px 0px rgba(22, 25, 22, 0.04);
}

:root {
  --background: #0c1012;
  --foreground: #e8ebe6;
  --card: #151a1c;
  --card-foreground: #e8ebe6;
  --popover: #1b2224;
  --popover-foreground: #e8ebe6;
  --primary: #7dbeb6;
  --primary-foreground: #0c1012;
  --secondary: #1c2a28;
  --secondary-foreground: #c5ddd9;
  --muted: #1b2224;
  --muted-foreground: #8b938c;
  --accent: #1c2a28;
  --accent-foreground: #d5ebe7;
  --destructive: #f0a8a0;
  --border: #2a3234;
  --input: #2a3234;
  --ring: #7dbeb6;
  --ok: #7dba94;
  --warn: #d4a574;
  --fuel-reg: #5ea07a;
  --fuel-prem: #8aa0c4;
  --fuel-dsl: #c4a56a;
  --shadow-border: 0 0 0 1px rgba(255, 255, 255, 0.08);
  --paper: #f4f0e6;
  --paper-ink: #1c1a16;
  --paper-muted: #6a6458;
  --paper-rule: #d8d2c4;

  --motion-micro: 80ms;
  --motion-quick: 150ms;
  --motion-fast: 250ms;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}

@layer base {
  * {
    border-color: var(--border);
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  body {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    min-height: 100dvh;
    overflow-x: hidden;
  }

  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }

  h1,
  h2,
  h3 {
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }
}

.dock-nav {
  scrollbar-width: none;
}
.dock-nav::-webkit-scrollbar {
  display: none;
}

.phone-tabbar {
  padding-bottom: max(0.4rem, env(safe-area-inset-bottom));
}

.export-sheet {
  background: var(--paper);
  color: var(--paper-ink);
  box-shadow: var(--shadow-border);
}

@media print {
  body {
    background: #fff !important;
    color: #1c1a16 !important;
  }

  .export-sheet {
    box-shadow: none;
    border-radius: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```
