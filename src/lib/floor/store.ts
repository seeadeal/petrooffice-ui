import { createStationStore, type StationState } from "@/lib/station-store";
import type { StationSnapshot } from "@/lib/station-ops";

function pick(s: StationState): StationSnapshot {
  const {
    tanks,
    prices,
    deliveries,
    shifts,
    exceptions,
    inventory,
    compliance,
    scheduled,
    priceLog,
  } = s;
  return {
    tanks,
    prices,
    deliveries,
    shifts,
    exceptions,
    inventory,
    compliance,
    scheduled,
    priceLog,
  };
}

/**
 * WIRE HERE — Floor backend.
 * Replace `load` / `mutate` with GET/POST against your Floor API.
 * Must be a different store than Office. Rows must not be shared.
 */
const floor = createStationStore(
  async () => pick(floor.useStore.getState()),
  async () => pick(floor.useStore.getState()),
);

export const useFloor = floor.useStore;
export const hydrateFloor = floor.hydrate;
