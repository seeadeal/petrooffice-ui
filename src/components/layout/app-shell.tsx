import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/command-palette";
import { PhoneShell } from "@/components/mobile/shell";
import { hydrateFloor } from "@/lib/floor/store";
import { G_PATH } from "@/lib/nav";
import { hydrateOffice } from "@/lib/store";
import { DockShell } from "./dock";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [cmd, setCmd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.shell =
      window.matchMedia("(max-width: 767px)").matches ? "phone" : "dock";
    void hydrateOffice();
    void hydrateFloor();
  }, []);

  useEffect(() => {
    let armed = false;
    let timer = 0;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "g" && !armed) {
        armed = true;
        timer = window.setTimeout(() => {
          armed = false;
        }, 800);
        return;
      }
      if (!armed) return;
      armed = false;
      window.clearTimeout(timer);
      const path = G_PATH[k];
      if (path) {
        e.preventDefault();
        void navigate({ to: path });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <>
      <div className="md:hidden print:hidden">
        <PhoneShell pathname={pathname} />
      </div>
      <div className="hidden md:contents print:contents">
        <DockShell current={pathname} onCommand={() => setCmd(true)}>
          {children}
        </DockShell>
        <CommandPalette open={cmd} onOpenChange={setCmd} />
      </div>
    </>
  );
}
