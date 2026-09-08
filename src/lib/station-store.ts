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
