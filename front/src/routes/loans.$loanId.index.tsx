import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  Percent,
  Pencil,
  RefreshCw,
  XCircle,
  ArrowLeft,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { RenewDialog, CloseLoanDialog } from "@/components/LoanDialogs";
import { JewelsCard } from "@/components/JewelsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatMoney, daysUntil, useStore } from "@/lib/store";

export const Route = createFileRoute("/loans/$loanId/")({
  head: () => ({
    meta: [
      { title: "Loan Details · Gold Organizer" },
      {
        name: "description",
        content:
          "Full details of a gold loan: bank and branch information, pledged amount, interest, key dates and activity timeline.",
      },
      { property: "og:title", content: "Loan Details · Gold Organizer" },
      {
        property: "og:description",
        content: "Bank details, interest, key dates and the full timeline of a gold loan.",
      },
    ],
  }),
  component: LoanDetailsPage,
});

function LoanDetailsPage() {
  const { loanId } = Route.useParams();
  const { loans, ready } = useStore();
  const loan = loans.find((l) => l.id === loanId);
  const [renewing, setRenewing] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  if (!loan) {
    return (
      <AppShell title="Loan not found" subtitle="This loan may have been deleted.">
        {ready && (
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/loans">
              <ArrowLeft /> Back to My Loans
            </Link>
          </Button>
        )}
      </AppShell>
    );
  }

  const interest = (loan.amount * loan.interestRate) / 100;

  const infoCards = [
    {
      title: "Bank information",
      icon: Building2,
      rows: [
        ["Bank name", loan.bankName],
        ["Branch", loan.branchName],
        ["Loan ID", `#${loan.id}`],
      ],
    },
    {
      title: "Loan information",
      icon: Percent,
      rows: [
        ["Principal", formatMoney(loan.amount)],
        ["Interest rate", `${loan.interestRate}% p.a.`],
        ["Yearly interest", formatMoney(Math.round(interest))],
      ],
    },
    {
      title: "Key dates",
      icon: CalendarDays,
      rows: [
        ["Pledge date", formatDate(loan.pledgeDate)],
        ["Due date", formatDate(loan.dueDate)],
        [
          "Days remaining",
          loan.status === "closed" ? "—" : `${Math.max(daysUntil(loan.dueDate), 0)} days`,
        ],
      ],
    },
  ];

  return (
    <AppShell
      title={loan.bankName}
      subtitle={`${loan.branchName} · #${loan.id}`}
      actions={
        <>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/loans/$loanId/edit" params={{ loanId: loan.id }}>
              <Pencil /> Edit
            </Link>
          </Button>
          <Button
            className="rounded-xl shadow-gold"
            disabled={loan.status === "closed"}
            onClick={() => setRenewing(true)}
          >
            <RefreshCw /> Renew
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Card className="gradient-navy overflow-hidden rounded-2xl border-0 text-navy-foreground shadow-lift">
          <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-navy-foreground/60">
                Pledged amount
              </p>
              <p className="mt-1 font-display text-4xl font-semibold text-gold-gradient">
                {formatMoney(loan.amount)}
              </p>
              <p className="mt-2 text-sm text-navy-foreground/70">
                {loan.interestRate}% p.a. · due {formatDate(loan.dueDate)}
              </p>
            </div>
            <StatusBadge loan={loan} size="lg" />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {infoCards.map((c) => (
            <Card key={c.title} className="card-hover rounded-2xl border-border/70 shadow-soft">
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <c.icon className="size-4 text-gold" />
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {c.rows.map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-right font-medium">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <JewelsCard loanId={loan.id} />

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-6 border-l border-border pl-6">
              {loan.history.map((h, i) => (
                <li key={`${h.label}-${i}`} className="relative">
                  <span className="gradient-gold absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-background" />
                  <p className="text-sm font-medium">{h.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(h.date)}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={loan.status === "closed"}
            onClick={() => setClosing(true)}
          >
            <XCircle /> Close Loan
          </Button>
        </div>
      </div>

      <RenewDialog loan={renewing ? loan : null} onOpenChange={() => setRenewing(false)} />
      <CloseLoanDialog loan={closing ? loan : null} onOpenChange={() => setClosing(false)} />
    </AppShell>
  );
}