import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STORE } from "@/lib/seed";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          aria-label="Account"
        >
          {STORE.initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          {STORE.manager}
          <div className="font-normal text-muted-foreground">Store manager</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Desk app · Office API
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="size-11 md:hidden"
        onClick={onClick}
        aria-label="Search"
      >
        <Search className="size-4" />
      </Button>
      <button
        type="button"
        onClick={onClick}
        className="hidden h-9 items-center gap-2 rounded-md bg-card px-3 text-sm text-muted-foreground shadow-[var(--shadow-border)] md:flex md:w-52"
      >
        <Search className="size-3.5" />
        Search
        <kbd className="ml-auto font-mono text-2xs">⌘K</kbd>
      </button>
    </>
  );
}
