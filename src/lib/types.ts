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
