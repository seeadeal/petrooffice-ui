import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { marginCpg } from "@/lib/seed";
import type { BackendId } from "@/lib/station-ops";
import { useStation } from "@/lib/use-station";
import type { FuelPrice, GradeId } from "@/lib/types";
import { cpg, money } from "@/lib/utils";

export function PriceDialog({
  open,
  onOpenChange,
  price,
  source = "office",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  price: FuelPrice | null;
  source?: BackendId;
}) {
  const postPrice = useStation(source).postPrice;
  const [val, setVal] = useState("");

  const shown = val || (price ? price.posted.toFixed(3) : "");
  const num = Number(shown);
  const nextMargin = price && Number.isFinite(num) ? marginCpg(num, price.cost) : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v && price) setVal(price.posted.toFixed(3));
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post {price?.name} price</DialogTitle>
          <DialogDescription>
            Updates the street sign and POS. Margin is rack vs. posted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`posted-${source}`}>Posted $/gal</Label>
            <Input
              id={`posted-${source}`}
              inputMode="decimal"
              value={shown}
              onChange={(e) => setVal(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          {price && Number.isFinite(num) && (
            <p className="text-sm text-muted-foreground">
              Cost {money(price.cost)} · new margin{" "}
              <span className="font-medium text-foreground">{cpg(nextMargin)}</span>
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!price || !Number.isFinite(num)) return;
                postPrice(price.id, num);
                toast.success(`${price.name} posted at ${money(num)}`);
                onOpenChange(false);
              }}
            >
              Post to pumps
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ScheduleDialog({
  open,
  onOpenChange,
  gradeId,
  source = "office",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  gradeId: GradeId;
  source?: BackendId;
}) {
  const station = useStation(source);
  const schedule = station.scheduleDelivery;
  const tank = station.tanks.find((t) => t.id === gradeId);
  const [gals, setGals] = useState("2200");
  const [window, setWindow] = useState("Tomorrow 6:00 AM");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule {tank?.grade ?? "fuel"} delivery</DialogTitle>
          <DialogDescription>
            Books a drop with Valero. Clears the reorder exception when confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`gals-${source}`}>Gallons</Label>
            <Input
              id={`gals-${source}`}
              inputMode="numeric"
              value={gals}
              onChange={(e) => setGals(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor={`win-${source}`}>Window</Label>
            <Input
              id={`win-${source}`}
              value={window}
              onChange={(e) => setWindow(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                schedule({
                  gradeId,
                  gallons: Number(gals) || 0,
                  window,
                  supplier: "Valero",
                });
                toast.success(`${tank?.grade} load booked · ${window}`);
                onOpenChange(false);
              }}
            >
              Book load
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CountDialog({
  open,
  onOpenChange,
  shiftId,
  source = "office",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shiftId: string | null;
  source?: BackendId;
}) {
  const station = useStation(source);
  const shift = station.shifts.find((x) => x.id === shiftId);
  const countDrawer = station.countDrawer;
  const [val, setVal] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v && shift) setVal((shift.countedCash ?? shift.expectedCash).toFixed(2));
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Count drawer — Shift {shift?.number}</DialogTitle>
          <DialogDescription>
            {shift?.cashier}. Expected {shift ? money(shift.expectedCash) : "—"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`count-${source}`}>Counted cash</Label>
            <Input
              id={`count-${source}`}
              inputMode="decimal"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!shiftId) return;
                countDrawer(shiftId, Number(val) || 0);
                toast.success("Drawer count saved");
                onOpenChange(false);
              }}
            >
              Save count
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
