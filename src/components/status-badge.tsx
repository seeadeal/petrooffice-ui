import { Badge } from "@/components/ui/badge";

const MAP = {
  posted: { variant: "ok" as const, label: "Posted" },
  pending: { variant: "warn" as const, label: "Review" },
  disputed: { variant: "danger" as const, label: "Disputed" },
  open: { variant: "warn" as const, label: "Open" },
  closed: { variant: "ok" as const, label: "Closed" },
  review: { variant: "warn" as const, label: "Review" },
  resolved: { variant: "ok" as const, label: "Resolved" },
  ok: { variant: "ok" as const, label: "Current" },
  due: { variant: "warn" as const, label: "Due soon" },
  overdue: { variant: "danger" as const, label: "Overdue" },
  done: { variant: "ok" as const, label: "Done" },
};

export function StatusBadge({ status }: { status: keyof typeof MAP | string }) {
  const m = MAP[status as keyof typeof MAP] ?? {
    variant: "outline" as const,
    label: status,
  };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
