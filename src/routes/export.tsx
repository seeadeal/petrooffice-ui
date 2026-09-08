import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { ExportSheet } from "@/components/export-sheet";
import { Button } from "@/components/ui/button";
import { downloadTidyCsv, exportFilename } from "@/lib/export-today";
import { useOffice } from "@/lib/store";

export const Route = createFileRoute("/export")({ component: ExportPage });

function ExportPage() {
  const tanks = useOffice((s) => s.tanks);
  const prices = useOffice((s) => s.prices);
  const deliveries = useOffice((s) => s.deliveries);
  const shifts = useOffice((s) => s.shifts);
  const exceptions = useOffice((s) => s.exceptions);
  const inventory = useOffice((s) => s.inventory);
  const compliance = useOffice((s) => s.compliance);
  const scheduled = useOffice((s) => s.scheduled);
  const data = {
    tanks,
    prices,
    deliveries,
    shifts,
    exceptions,
    inventory,
    compliance,
    scheduled,
  };

  return (
    <div className="pb-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Today’s packet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Print a paper close, or download a tidy CSV for Excel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              downloadTidyCsv(data);
              toast.message(`Saved ${exportFilename()}`);
            }}
          >
            <Download />
            CSV
          </Button>
          <Button onClick={() => window.print()}>
            <Printer />
            Print
          </Button>
        </div>
      </div>
      <ExportSheet data={data} />
    </div>
  );
}
