import { createStationStore } from "@/lib/station-store";

const floor = createStationStore();
export const useFloor = floor.useStore;
export const hydrateFloor = floor.hydrate;
