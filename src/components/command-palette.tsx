import { Command } from "cmdk";
import type { ComponentProps } from "react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NAV, type AppPath } from "@/lib/nav";
import { useOffice } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CommandPalette({
  open,
  onOpenChange,
  docked,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  docked?: boolean;
}) {
  const router = useRouter();
  const office = useOffice();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (path: AppPath) => {
    void router.navigate({ to: path });
    onOpenChange(false);
    setQ("");
  };

  const inner = (
    <Command
      className={cn(
        "overflow-hidden bg-card text-card-foreground",
        docked
          ? "rounded-xl shadow-[var(--shadow-border)]"
          : "rounded-xl shadow-[var(--shadow-border)]",
      )}
      loop
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Command.Input
          value={q}
          onValueChange={setQ}
          placeholder="Jump, post, schedule, reconcile…"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          ESC
        </kbd>
      </div>
      <Command.List className="max-h-72 overflow-auto p-1">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
          Nothing matches.
        </Command.Empty>
        <Command.Group
          heading="Go to"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
        >
          {NAV.map((n) => (
            <Item
              key={n.id}
              value={`${n.label} ${n.path}`}
              hint={n.hint}
              onSelect={() => go(n.path)}
            >
              <n.icon className="size-4" />
              {n.label}
            </Item>
          ))}
        </Command.Group>
        <Command.Group
          heading="Actions"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
        >
          <Item
            value="export today close packet csv print"
            hint="G E"
            onSelect={() => go("/export")}
          >
            Export today
          </Item>
          <Item
            value="schedule diesel delivery tank 3"
            hint="N D"
            onSelect={() => {
              office.scheduleDelivery({
                gradeId: "dsl",
                gallons: 2200,
                window: "Tomorrow 6:00 AM",
                supplier: "Valero",
              });
              toast.success("Diesel load booked for tomorrow 6:00 AM");
              onOpenChange(false);
            }}
          >
            Schedule diesel delivery
          </Item>
          <Item
            value="match competitor regular price"
            onSelect={() => {
              office.matchCompetitor("reg");
              toast.success("Regular matched to street price");
              onOpenChange(false);
            }}
          >
            Match Regular to competitor
          </Item>
          <Item
            value="accept load 8841 delivery"
            onSelect={() => {
              office.acceptDelivery("d8841");
              toast.success("Load #8841 posted");
              go("/deliveries");
            }}
          >
            Accept & post load #8841
          </Item>
          <Item
            value="close shift 2 priya"
            onSelect={() => {
              office.closeShift("s2");
              toast.success("Shift 2 closed");
              go("/shifts");
            }}
          >
            Close shift 2
          </Item>
        </Command.Group>
        <Command.Group
          heading="Tanks"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
        >
          {office.tanks.map((t) => (
            <Item
              key={t.id}
              value={`${t.name} ${t.grade} tank`}
              onSelect={() => go("/fuel")}
            >
              {t.name} · {t.grade} · {Math.round((t.gallons / t.capacity) * 100)}%
            </Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command>
  );

  if (docked) return inner;
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-foreground/30 p-4 pt-[12vh]"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </div>
    </div>
  );
}

function Item({
  children,
  hint,
  ...props
}: ComponentProps<typeof Command.Item> & { hint?: string }) {
  return (
    <Command.Item
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground data-[selected=true]:bg-accent"
      {...props}
    >
      {children}
      {hint && (
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
