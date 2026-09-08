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
