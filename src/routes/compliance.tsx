import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useOffice } from "@/lib/store";

export const Route = createFileRoute("/compliance")({ component: CompliancePage });

function CompliancePage() {
  const items = useOffice((s) => s.compliance);
  const mark = useOffice((s) => s.markCompliance);
  const due = items.filter((c) => c.status === "due" || c.status === "overdue").length;

  return (
    <div>
      <PageHeader
        title="Compliance"
        subtitle={`${due} items due or overdue. UST, fire, lottery, licenses.`}
      />
      <div className="space-y-2">
        {items.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium">{c.title}</h2>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.owner} · due {c.due} · {c.notes}
              </p>
            </div>
            <div className="flex gap-2">
              {c.status !== "done" && (
                <Button
                  size="sm"
                  onClick={() => {
                    mark(c.id, "done");
                    toast.success("Marked complete");
                  }}
                >
                  Mark done
                </Button>
              )}
              {c.status === "done" && (
                <Button size="sm" variant="outline" onClick={() => mark(c.id, "ok")}>
                  Reopen
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
