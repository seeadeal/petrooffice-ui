import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Download, Package, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/more")({ component: MorePage });

function MorePage() {
  return (
    <div>
      <PageHeader
        title="More"
        subtitle="Desk modules. The phone app uses this as its Floor menu."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Card to="/inventory" icon={Package} title="Store ops" body="Receiving and mins." />
        <Card to="/financials" icon={BookOpen} title="Financials" body="Day snapshot, not a GL." />
        <Card to="/compliance" icon={Shield} title="Compliance" body="UST, lottery, licenses." />
        <Card to="/export" icon={Download} title="Close packet" body="CSV and print." />
      </div>
    </div>
  );
}

function Card({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: "/inventory" | "/financials" | "/compliance" | "/export";
  icon: typeof Package;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
    >
      <Icon className="mt-0.5 size-5 text-muted-foreground" />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{body}</span>
      </span>
    </Link>
  );
}
