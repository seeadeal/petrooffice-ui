import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useOffice } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

function InventoryPage() {
  const items = useOffice((s) => s.inventory);
  const receive = useOffice((s) => s.receiveSku);
  const low = items.filter((i) => i.onHand < i.min);

  const onReceive = (id: string, name: string, onHand: number, min: number) => {
    receive(id, Math.max(min - onHand, 6));
    toast.success(`Received ${name}`);
  };

  return (
    <div>
      <PageHeader
        title="Store ops"
        subtitle={`${low.length} items below min. Receiving against McLane & DSD.`}
      />
      <div className="space-y-3 md:hidden">
        {items.map((i) => {
          const short = i.onHand < i.min;
          return (
            <article key={i.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{i.sku}</div>
                </div>
                <span className="text-xs text-muted-foreground">{i.category}</span>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">On hand</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    short && "font-semibold text-destructive",
                  )}
                >
                  {i.onHand} / {i.min} min
                </span>
              </div>
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>{i.vendor}</span>
                <span>{i.lastReceived}</span>
              </div>
              <Button
                className="mt-3 h-11 w-full"
                variant={short ? "default" : "outline"}
                onClick={() => onReceive(i.id, i.name, i.onHand, i.min)}
              >
                Receive
              </Button>
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">On hand</th>
              <th className="px-4 py-3 font-medium">Min</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Last recv</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const short = i.onHand < i.min;
              return (
                <tr key={i.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{i.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{i.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.category}</td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono tabular-nums",
                      short && "font-semibold text-destructive",
                    )}
                  >
                    {i.onHand}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">
                    {i.min}
                  </td>
                  <td className="px-4 py-3">{i.vendor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.lastReceived}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={short ? "default" : "outline"}
                      onClick={() => onReceive(i.id, i.name, i.onHand, i.min)}
                    >
                      Receive
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
