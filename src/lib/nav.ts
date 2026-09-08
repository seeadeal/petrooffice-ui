import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Ellipsis,
  Fuel,
  LayoutDashboard,
  Package,
  Receipt,
  Shield,
  Truck,
} from "lucide-react";

export type AppPath =
  | "/"
  | "/fuel"
  | "/deliveries"
  | "/shifts"
  | "/inventory"
  | "/financials"
  | "/compliance"
  | "/export"
  | "/more";

export interface NavItem {
  id: string;
  label: string;
  short: string;
  path: AppPath;
  icon: LucideIcon;
  hint?: string;
  key: string;
}

export const NAV: NavItem[] = [
  { id: "home", label: "Home", short: "Home", path: "/", icon: LayoutDashboard, hint: "G H", key: "h" },
  { id: "fuel", label: "Fuel", short: "Fuel", path: "/fuel", icon: Fuel, hint: "G F", key: "f" },
  {
    id: "deliveries",
    label: "Deliveries",
    short: "Loads",
    path: "/deliveries",
    icon: Truck,
    hint: "G D",
    key: "d",
  },
  {
    id: "shifts",
    label: "Sales & POS",
    short: "Sales",
    path: "/shifts",
    icon: Receipt,
    hint: "G S",
    key: "s",
  },
  {
    id: "inventory",
    label: "Store Ops",
    short: "Store",
    path: "/inventory",
    icon: Package,
    hint: "G I",
    key: "i",
  },
  {
    id: "financials",
    label: "Financials",
    short: "Books",
    path: "/financials",
    icon: BookOpen,
    hint: "G N",
    key: "n",
  },
  {
    id: "compliance",
    label: "Compliance",
    short: "Rules",
    path: "/compliance",
    icon: Shield,
    hint: "G C",
    key: "c",
  },
];

export const PHONE_TABS: NavItem[] = [
  { id: "home", label: "Today", short: "Today", path: "/", icon: LayoutDashboard, key: "h" },
  { id: "fuel", label: "Fuel", short: "Fuel", path: "/fuel", icon: Fuel, key: "f" },
  { id: "deliveries", label: "Loads", short: "Loads", path: "/deliveries", icon: Truck, key: "d" },
  { id: "shifts", label: "Sales", short: "Sales", path: "/shifts", icon: Receipt, key: "s" },
  { id: "more", label: "More", short: "More", path: "/more", icon: Ellipsis, key: "m" },
];

export const PHONE_MORE_PATHS: AppPath[] = [
  "/more",
  "/inventory",
  "/financials",
  "/compliance",
  "/export",
];

export const G_PATH: Record<string, AppPath> = {
  h: "/",
  f: "/fuel",
  d: "/deliveries",
  s: "/shifts",
  i: "/inventory",
  n: "/financials",
  c: "/compliance",
  e: "/export",
  m: "/more",
};
