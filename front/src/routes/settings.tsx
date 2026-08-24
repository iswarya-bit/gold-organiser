import { createFileRoute } from "@tanstack/react-router";
import { Bell, Globe, Moon, ShieldCheck, Sun } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Gold Organizer" },
      {
        name: "description",
        content:
          "Switch between light and dark mode, tune renewal notifications, language and security preferences.",
      },
      { property: "og:title", content: "Settings · Gold Organizer" },
      {
        property: "og:description",
        content: "Theme, notifications, language and security preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const dark = settings.theme === "dark";

  return (
    <AppShell title="Settings" subtitle="Tailor Gold Organizer to the way you work.">
      <div className="grid max-w-4xl gap-4">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            {dark ? <Moon className="size-4 text-gold" /> : <Sun className="size-4 text-gold" />}
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Dark mode</p>
              <p className="text-sm text-muted-foreground">
                Switch between the light and dark theme.
              </p>
            </div>
            <Switch
              checked={dark}
              onCheckedChange={(v) => updateSettings({ theme: v ? "dark" : "light" })}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Bell className="size-4 text-gold" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Due date reminders</p>
                <p className="text-sm text-muted-foreground">Alert me 7 days before a loan is due.</p>
              </div>
              <Switch
                checked={settings.dueReminders}
                onCheckedChange={(v) => updateSettings({ dueReminders: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Email summaries</p>
                <p className="text-sm text-muted-foreground">
                  Monthly digest of renewals, closures and interest.
                </p>
              </div>
              <Switch
                checked={settings.emailAlerts}
                onCheckedChange={(v) => updateSettings({ emailAlerts: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Globe className="size-4 text-gold" />
            <CardTitle className="text-base">Language</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Interface language</p>
            <Select
              value={settings.language}
              onValueChange={(v) => updateSettings({ language: v })}
            >
              <SelectTrigger className="h-11 w-44 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Tamil">Tamil</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <ShieldCheck className="size-4 text-gold" />
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Sign out of every device where your account is open.
            </p>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => toast.success("Signed out of all other devices")}
            >
              Sign out everywhere
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}