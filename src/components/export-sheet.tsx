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
