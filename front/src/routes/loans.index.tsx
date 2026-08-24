import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  XCircle,
  Inbox,
  MoreHorizontal,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { RenewDialog, CloseLoanDialog } from "@/components/LoanDialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { displayStatus, formatDate, formatMoney, useStore, type Loan } from "@/lib/store";

type View = "all" | "closed" | "renew";

export const Route = createFileRoute("/loans/")({
  validateSearch: (search: Record<string, unknown>): { view?: View } => {
    const view = search["view"];
    return view === "closed" || view === "renew" ? { view } : {};
  },
  head: () => ({
    meta: [
      { title: "My Loans · Gold Organizer" },
      {
        name: "description",
        content:
          "Browse, search, filter, renew and close every gold loan you hold across banks and branches.",
      },
      { property: "og:title", content: "My Loans · Gold Organizer" },
      {
        property: "og:description",
        content: "Search, filter, renew and close all your gold loans in one table.",
      },
    ],
  }),
  component: LoansPage,
});

const PAGE_SIZE = 5;

function LoansPage() {
  const { view } = Route.useSearch();
  const { loans } = useStore();
  const navigate = useNavigate();

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>(view === "closed" ? "closed" : "all");
  const [sort, setSort] = React.useState("due-asc");
  const [page, setPage] = React.useState(1);
  const [renewing, setRenewing] = React.useState<Loan | null>(null);
  const [closing, setClosing] = React.useState<Loan | null>(null);

  React.useEffect(() => {
    setStatus(view === "closed" ? "closed" : "all");
    setPage(1);
  }, [view]);

  const filtered = loans
    .filter((l) =>
      `${l.bankName} ${l.branchName} ${l.id}`.toLowerCase().includes(query.toLowerCase()),
    )
    .filter((l) => (status === "all" ? true : displayStatus(l) === status))
    .filter((l) => (view === "renew" ? l.status === "active" : true))
    .sort((a, b) => {
      if (sort === "due-asc") return a.dueDate.localeCompare(b.dueDate);
      if (sort === "due-desc") return b.dueDate.localeCompare(a.dueDate);
      if (sort === "amount-desc") return b.amount - a.amount;
      return a.amount - b.amount;
    });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rowActions = (loan: Loan) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => navigate({ to: "/loans/$loanId", params: { loanId: loan.id } })}>
          <Eye className="mr-2 size-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate({ to: "/loans/$loanId/edit", params: { loanId: loan.id } })}
        >
          <Pencil className="mr-2 size-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={loan.status === "closed"}
          onClick={() => setRenewing(loan)}
        >
          <RefreshCw className="mr-2 size-4" /> Renew
        </DropdownMenuItem>
        <DropdownMenuItem disabled={loan.status === "closed"} onClick={() => setClosing(loan)}>
          <XCircle className="mr-2 size-4" /> Close Loan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const title = view === "closed" ? "Closed Loans" : view === "renew" ? "Renew Loan" : "My Loans";

  return (
    <AppShell
      title={title}
      subtitle={
        view === "renew"
          ? "Pick an active loan and extend its due date."
          : `${filtered.length} loan${filtered.length === 1 ? "" : "s"} in your portfolio.`
      }
      actions={
        <Button asChild className="rounded-xl shadow-gold">
          <Link to="/loans/new">
            <PlusCircle /> Create Loan
          </Link>
        </Button>
      }
    >
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search bank, branch or loan ID"
                className="h-11 rounded-xl pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="due-soon">Due soon</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-11 rounded-xl sm:w-48">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-asc">Due date — soonest</SelectItem>
                <SelectItem value="due-desc">Due date — latest</SelectItem>
                <SelectItem value="amount-desc">Amount — high to low</SelectItem>
                <SelectItem value="amount-asc">Amount — low to high</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-accent">
                <Inbox className="size-7 text-gold" />
              </span>
              <h3 className="font-display text-lg font-semibold">No loans found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Nothing matches your filters yet. Create your first loan to start tracking pledges,
                interest and renewals.
              </p>
              <Button asChild className="mt-2 rounded-xl">
                <Link to="/loans/new">
                  <PlusCircle /> Create your first loan
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Bank</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Pledge</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {current.map((l) => (
                      <TableRow key={l.id} className="hover:bg-accent/40">
                        <TableCell className="font-medium">{l.bankName}</TableCell>
                        <TableCell className="text-muted-foreground">{l.branchName}</TableCell>
                        <TableCell>{formatMoney(l.amount)}</TableCell>
                        <TableCell>{l.interestRate}%</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(l.pledgeDate)}
                        </TableCell>
                        <TableCell>{formatDate(l.dueDate)}</TableCell>
                        <TableCell>
                          <StatusBadge loan={l} />
                        </TableCell>
                        <TableCell className="text-right">{rowActions(l)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {current.map((l) => (
                  <div key={l.id} className="rounded-xl border p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{l.bankName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {l.branchName} · {l.id}
                        </p>
                      </div>
                      {rowActions(l)}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-right font-medium">{formatMoney(l.amount)}</span>
                      <span className="text-muted-foreground">Interest</span>
                      <span className="text-right">{l.interestRate}%</span>
                      <span className="text-muted-foreground">Due</span>
                      <span className="text-right">{formatDate(l.dueDate)}</span>
                    </div>
                    <div className="mt-3">
                      <StatusBadge loan={l} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={page === pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <RenewDialog loan={renewing} onOpenChange={() => setRenewing(null)} />
      <CloseLoanDialog loan={closing} onOpenChange={() => setClosing(null)} />
    </AppShell>
  );
}