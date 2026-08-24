import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Coins,
  PlusCircle,
  RefreshCw,
  Archive,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useStore, displayStatus, formatMoney } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/loans", label: "My Loans", icon: Coins },
  { to: "/loans/new", label: "Create Loan", icon: PlusCircle },
  { to: "/loans", label: "Renew Loan", icon: RefreshCw, search: { view: "renew" } },
  { to: "/loans", label: "Closed Loans", icon: Archive, search: { view: "closed" } },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Brand({ compact }: { compact?: boolean | undefined }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="gradient-gold grid size-9 shrink-0 place-items-center rounded-xl font-display text-base font-bold text-primary-foreground shadow-gold">
        G
      </span>
      {!compact && (
        <span className="truncate font-display text-[15px] font-semibold tracking-tight">
          Gold Organizer
        </span>
      )}
    </div>
  );
}

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  return (
    <nav className="flex flex-col gap-1 px-3">
      {nav.map((item) => {
        const view = "search" in item ? item.search.view : null;
        const active = view
          ? pathname === item.to && searchStr.includes(view)
          : pathname === item.to && !searchStr.includes("view=");
        return (
          <Link
            key={item.label}
            to={item.to}
            search={"search" in item ? item.search : {}}
            onClick={onNavigate}
            title={item.label}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const { logout } = useStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col gap-6 py-5">
      <div className={cn("px-4", collapsed && "flex justify-center px-0")}>
        <Brand compact={collapsed} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavList collapsed={collapsed} onNavigate={onNavigate} />
      </div>
      <div className="px-3">
        <button
          onClick={() => {
            logout();
            toast.success("Signed out securely");
            navigate({ to: "/", replace: true });
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/15 hover:text-destructive",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const { loans } = useStore();
  const [q, setQ] = React.useState("");
  const results = q
    ? loans
        .filter((l) =>
          `${l.bankName} ${l.branchName} ${l.id}`.toLowerCase().includes(q.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  return (
    <div className="relative hidden w-full max-w-sm md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search loans, banks, branches…"
        className="h-10 rounded-xl bg-muted/60 pl-9"
      />
      {results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full animate-rise overflow-hidden rounded-xl border bg-popover shadow-lift">
          {results.map((l) => (
            <Link
              key={l.id}
              to="/loans/$loanId"
              params={{ loanId: l.id }}
              onClick={() => setQ("")}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-accent"
            >
              <span className="min-w-0 truncate">
                {l.bankName} · {l.branchName}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatMoney(l.amount)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { ready, user, loans, logout } = useStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (ready && !user) navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  const dueSoon = loans.filter((l) => displayStatus(l) === "due-soon");

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "gradient-navy sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 lg:block",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-40 border-b">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="gradient-navy w-72 border-sidebar-border p-0 text-sidebar-foreground">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SidebarBody onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              </Button>
              <div className="lg:hidden">
                <Brand compact />
              </div>
            </div>

            <div className="flex justify-center">
              <GlobalSearch />
            </div>

            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    {dueSoon.length > 0 && (
                      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {dueSoon.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      You&apos;re all caught up.
                    </div>
                  ) : (
                    dueSoon.map((l) => (
                      <DropdownMenuItem key={l.id} className="flex-col items-start gap-0.5">
                        <span className="text-sm font-medium">{l.bankName} due soon</span>
                        <span className="text-xs text-muted-foreground">
                          {l.id} · {formatMoney(l.amount)}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition-colors hover:bg-accent">
                    <span className="gradient-gold grid size-7 place-items-center rounded-full text-xs font-semibold text-primary-foreground">
                      {initials}
                    </span>
                    <span className="hidden max-w-[9rem] truncate text-sm font-medium sm:block">
                      {user.fullName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 size-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 size-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      logout();
                      toast.success("Signed out securely");
                      navigate({ to: "/", replace: true });
                    }}
                  >
                    <LogOut className="mr-2 size-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
          </div>
          <div className="animate-rise">{children}</div>
        </main>
      </div>
    </div>
  );
}