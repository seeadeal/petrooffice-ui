import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PHONE_MORE_PATHS, PHONE_TABS } from "@/lib/nav";
import { STORE } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { PhoneScreen } from "./screens";

const TITLES: Record<string, string> = {
  "/": "Today",
  "/fuel": "Fuel",
  "/deliveries": "Loads",
  "/shifts": "Sales",
  "/more": "More",
  "/inventory": "Store",
  "/financials": "Books",
  "/compliance": "Rules",
  "/export": "Close",
};

const STACK = new Set(["/inventory", "/financials", "/compliance", "/export"]);

export function PhoneShell({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const stacked = STACK.has(pathname);
  const title = TITLES[pathname] ?? "PetroOffice";

  return (
    <div className="phone-app flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 px-4 pt-3 pb-2 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          {stacked ? (
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center gap-0.5 text-primary"
              onClick={() => void navigate({ to: "/more" })}
            >
              <ChevronLeft className="size-5" />
              <span className="text-sm font-medium">More</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-medium tracking-wide text-muted-foreground uppercase">
                #{STORE.id}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-2xs font-medium text-secondary-foreground">
                Floor API
              </span>
            </div>
          )}
          <span className="text-2xs tabular-nums text-muted-foreground">{STORE.clock}</span>
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
        {!stacked && pathname === "/" && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {STORE.name} · Harrisburg
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        <PhoneScreen pathname={pathname} />
      </div>

      <nav
        aria-label="Floor app"
        className="phone-tabbar grid grid-cols-5 border-t border-border bg-card/95 print:hidden"
      >
        {PHONE_TABS.map((tab) => {
          const on =
            tab.path === "/more"
              ? PHONE_MORE_PATHS.includes(pathname as (typeof PHONE_MORE_PATHS)[number])
              : pathname === tab.path;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 pt-1 text-2xs font-medium",
                on ? "text-primary" : "text-muted-foreground",
              )}
            >
              <tab.icon className="size-5" />
              {tab.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
