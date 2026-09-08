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
