import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, KeyRound, Mail, Phone, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMoney, useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Gold Organizer" },
      {
        name: "description",
        content: "View and edit your Gold Organizer account details, contact info and password.",
      },
      { property: "og:title", content: "Profile · Gold Organizer" },
      {
        property: "og:description",
        content: "Manage your account details and security settings.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loans, updateUser, logout } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = React.useState(false);
  const [changing, setChanging] = React.useState(false);
  const [draft, setDraft] = React.useState({ fullName: "", email: "", phone: "" });

  const openEdit = () => {
    if (user) setDraft({ fullName: user.fullName, email: user.email, phone: user.phone });
    setEditing(true);
  };

  const initials = (user?.fullName ?? "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const totalPledged = loans
    .filter((l) => l.status === "active")
    .reduce((s, l) => s + l.amount, 0);

  return (
    <AppShell title="Profile" subtitle="Your account details and security options.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-soft lg:col-span-2">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="gradient-gold grid size-20 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold text-primary-foreground shadow-gold">
                {initials}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-2xl font-semibold">{user?.fullName}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BadgeCheck className="size-4 text-success" /> Account verified
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Mail className="size-3.5" /> Email
                </p>
                <p className="mt-1.5 truncate text-sm font-medium">{user?.email}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Phone className="size-3.5" /> Phone
                </p>
                <p className="mt-1.5 text-sm font-medium">{user?.phone}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-xl shadow-gold" onClick={openEdit}>
                Edit Profile
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setChanging(true)}>
                <KeyRound /> Change Password
              </Button>
              <Button
                variant="ghost"
                className="rounded-xl text-destructive"
                onClick={() => {
                  logout();
                  toast.success("Signed out securely");
                  navigate({ to: "/", replace: true });
                }}
              >
                <LogOut /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Portfolio snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total loans</span>
              <span className="font-medium">{loans.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active pledged value</span>
              <span className="font-medium">{formatMoney(totalPledged)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account status</span>
              <span className="font-medium text-success">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                className="h-11 rounded-xl"
                value={draft.fullName}
                onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail">Email</Label>
              <Input
                id="mail"
                className="h-11 rounded-xl"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tel">Phone number</Label>
              <Input
                id="tel"
                className="h-11 rounded-xl"
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl shadow-gold"
              onClick={() => {
                updateUser(draft);
                setEditing(false);
                toast.success("Profile updated");
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changing} onOpenChange={setChanging}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cur">Current password</Label>
              <Input id="cur" type="password" className="h-11 rounded-xl" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" className="h-11 rounded-xl" placeholder="••••••••" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setChanging(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl shadow-gold"
              onClick={() => {
                setChanging(false);
                toast.success("Password updated");
              }}
            >
              Update password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}