import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Archive,
  CalendarClock,
  Coins,
  IndianRupee,
  PlusCircle,
  RefreshCw,
  User,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { daysUntil, displayStatus, formatDate, formatMoney, useStore } from "@/lib/store";
import { dashboardApi, type DashboardResponse } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Gold Organizer" },
      {
        name: "description",
        content:
          "See total pledged value, active loans, upcoming renewals and loan trends across all your banks at a glance.",
      },
      { property: "og:title", content: "Dashboard · Gold Organizer" },
      {
        property: "og:description",
        content: "Total pledged value, active loans and upcoming renewals at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

function DashboardPage() {
  const { user, loans } = useStore();
  const [summary, setSummary] = React.useState<DashboardResponse | null>(null);

  React.useEffect(() => {
    dashboardApi
      .get()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [loans.length]);

  const active = loans.filter((l) => l.status === "active");
  const closed = loans.filter((l) => l.status === "closed");
  const dueSoon = loans.filter((l) => displayStatus(l) === "due-soon");
  const total = active.reduce((s, l) => s + l.amount, 0);

  const stats = [
    {
      label: "Total Loans",
      value: String(summary?.totalLoans ?? loans.length),
      icon: Coins,
      tint: "text-gold",
    },
    {
      label: "Active Loans",
      value: String(summary?.activeLoans ?? active.length),
      icon: Wallet,
      tint: "text-success",
    },
    {
      label: "Closed Loans",
      value: String(summary?.closedLoans ?? closed.length),
      icon: Archive,
      tint: "text-muted-foreground",
    },
    {
      label: "Upcoming Renewals",
      value: String(dueSoon.length),
      icon: CalendarClock,
      tint: "text-warning",
    },
    {
      label: "Total Loan Amount",
      value: formatMoney(Number(summary?.activeLoanAmount ?? total)),
      icon: IndianRupee,
      tint: "text-info",
    },
  ];

  const pieData = [
    { name: "Active", value: active.length - dueSoon.length, color: "var(--success)" },
    { name: "Due Soon", value: dueSoon.length, color: "var(--warning)" },
    { name: "Closed", value: closed.length, color: "var(--muted-foreground)" },
  ].filter((d) => d.value > 0);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toLocaleDateString("en-IN", { month: "short" });
    const amount = loans
      .filter((l) => {
        const p = new Date(l.pledgeDate);
        return p.getMonth() === d.getMonth() && p.getFullYear() === d.getFullYear();
      })
      .reduce((s, l) => s + l.amount, 0);
    return { month: key, amount };
  });

  const timeline = [...active].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const activity = [...loans]
    .flatMap((l) => l.history.map((h) => ({ ...h, loan: l })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const quickActions = [
    { label: "Create Loan", icon: PlusCircle, to: "/loans/new" as const },
    { label: "View Loans", icon: Coins, to: "/loans" as const },
    { label: "Renew Loan", icon: RefreshCw, to: "/loans" as const },
    { label: "Profile", icon: User, to: "/profile" as const },
  ];

  return (
    <AppShell
      title={`${greeting()}, ${user?.fullName.split(" ")[0] ?? "there"} 👋`}
      subtitle="Manage your gold loans securely — everything in one place."
      actions={
        <Button asChild className="rounded-xl shadow-gold">
          <Link to="/loans/new">
            <PlusCircle /> Create Loan
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((s) => (
            <Card key={s.label} className="card-hover rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </span>
                  <s.icon className={`size-4 shrink-0 ${s.tint}`} />
                </div>
                <p className="mt-3 font-display text-2xl font-semibold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl border-border/70 shadow-soft lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Monthly loan trend</CardTitle>
            </CardHeader>
            <CardContent className="h-64 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={months} margin={{ left: 8, right: 12, top: 8 }}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v)}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--gold)"
                    strokeWidth={2.5}
                    fill="url(#goldFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Loan status</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                {pieData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl border-border/70 shadow-soft lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Upcoming due dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No active loans to track.
                </p>
              )}
              {timeline.map((l) => (
                <Link
                  key={l.id}
                  to="/loans/$loanId"
                  params={{ loanId: l.id }}
                  className="flex items-center gap-4 rounded-xl border border-border/70 p-3 transition-colors hover:bg-accent/60"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent font-display text-sm font-semibold text-accent-foreground">
                    {daysUntil(l.dueDate)}d
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{l.bankName}</span>
                    <span className="block text-xs text-muted-foreground">
                      Due {formatDate(l.dueDate)} · {formatMoney(l.amount)}
                    </span>
                  </span>
                  <StatusBadge loan={l} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-2xl border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {quickActions.map((a) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="card-hover flex flex-col gap-2 rounded-xl border border-border/70 p-3 text-sm font-medium"
                  >
                    <a.icon className="size-4 text-gold" />
                    {a.label}
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activity.map((a, i) => (
                  <div key={`${a.loan.id}-${i}`} className="flex items-start gap-3">
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-gold" />
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        {a.label} · <span className="text-muted-foreground">{a.loan.bankName}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.date)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}