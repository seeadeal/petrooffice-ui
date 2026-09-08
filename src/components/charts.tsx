import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HOURLY, TREND } from "@/lib/seed";
import { money } from "@/lib/utils";

const tick = { fill: "var(--muted-foreground)", fontSize: 11 };

export function TrendChart({ height = 180 }: { height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={TREND} barCategoryGap={4}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
          <YAxis
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => money(Number(v), { cents: false })}
          />
          <Bar dataKey="fuel" fill="var(--primary)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="inside" fill="var(--fuel-prem)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HourlyChart({ height = 140 }: { height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={HOURLY} barCategoryGap={6}>
          <XAxis dataKey="hour" tick={tick} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => money(Number(v), { cents: false })}
          />
          <Bar dataKey="fuel" fill="var(--primary)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
