import { useFloor } from "@/lib/floor/store";
import { useOffice } from "@/lib/store";
import type { BackendId } from "@/lib/station-ops";

export function useStation(source: BackendId) {
  const office = useOffice();
  const floor = useFloor();
  return source === "floor" ? floor : office;
}
