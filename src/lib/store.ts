import { createStationStore, type StationState } from "./station-store";
import type { StationSnapshot } from "./station-ops";

export type { StationState as OfficeState };

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
 * WIRE HERE — Office backend.
 * Replace `load` / `mutate` with GET/POST against your Office API.
 * Return a full StationSnapshot. Do not rename methods on StationState.
 */
const office = createStationStore(
  async () => pick(office.useStore.getState()),
  async () => pick(office.useStore.getState()),
);

export const useOffice = office.useStore;
export const hydrateOffice = office.hydrate;
