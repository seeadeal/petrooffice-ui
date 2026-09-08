import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV } from "@/lib/nav";
import { STORE } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { SearchTrigger, UserMenu } from "./chrome";

export function DockShell({
  current,
  onCommand,
  children,
}: {
  current: string;
  onCommand: () => void;
  children: ReactNode;
}) {
  const active = NAV.find((n) => n.path === current);
  const section = current === "/export" ? "Export" : current === "/more" ? "More" : active?.label;

  return (
    <div className="min-h-dvh pb-24 sm:pb-28">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-background px-3 print:hidden sm:h-16 sm:gap-3 sm:px-8">
        <Logo className="shrink-0" />
        <span className="hidden min-w-0 truncate rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground sm:inline">
          #{STORE.id} {STORE.name}
        </span>
        <span className="hidden rounded-full bg-card px-2.5 py-1 text-2xs font-medium text-muted-foreground shadow-[var(--shadow-border)] lg:inline">
          Office API
        </span>
        {section && (
          <span className="hidden text-sm text-muted-foreground md:inline">{section}</span>
        )}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="hidden text-sm text-muted-foreground lg:inline">{STORE.clock}</span>
          <SearchTrigger onClick={onCommand} />
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/export">
              <Download />
              Export today
            </Link>
          </Button>
          <Button size="icon" variant="ghost" asChild className="size-11 sm:hidden">
            <Link to="/export" aria-label="Export today">
              <Download />
            </Link>
          </Button>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-8 print:max-w-none print:px-0">
        {children}
      </main>
      <nav
        aria-label="Modules"
        className="dock-nav fixed left-1/2 z-50 flex max-w-[calc(100vw-1.25rem)] -translate-x-1/2 gap-0.5 overflow-x-auto rounded-2xl bg-card p-1 shadow-[var(--shadow-border)] print:hidden sm:gap-1 sm:p-1.5"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {NAV.map((n) => {
          const on = current === n.path;
          return (
            <Tooltip key={n.id}>
              <TooltipTrigger asChild>
                <Link
                  to={n.path}
                  aria-label={n.label}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 min-w-11 shrink-0 flex-col items-center justify-center rounded-xl px-2.5 transition-[background-color,color,transform] duration-150 ease-out sm:min-h-14 sm:min-w-16",
                    on
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <n.icon className="size-5" />
                  <span className="mt-0.5 hidden text-2xs font-medium leading-none sm:block">
                    {n.short}
                  </span>
                  <span className="sr-only sm:hidden">{n.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">{n.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </div>
  );
}
