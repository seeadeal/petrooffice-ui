import { createStationStore } from "./station-store";

export type { StationState as OfficeState } from "./station-store";

const office = createStationStore();
export const useOffice = office.useStore;
export const hydrateOffice = office.hydrate;
