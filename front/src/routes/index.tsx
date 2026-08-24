import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, TrendingUp, Vault } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · Gold Organizer" },
      {
        name: "description",
        content:
          "Sign in to Gold Organizer to track, renew and close every gold loan across your banks in one secure dashboard.",
      },
      { property: "og:title", content: "Sign in · Gold Organizer" },
      {
        property: "og:description",
        content: "Manage all your gold loans from every bank in one premium dashboard.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { ready, user, login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to Gold Organizer");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message || "Invalid email or password");
      setErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your gold loan portfolio."
      highlights={[
        { icon: Vault, text: "Every bank, one secure vault" },
        { icon: TrendingUp, text: "Interest and renewals tracked automatically" },
        { icon: ShieldCheck, text: "Private by design — your data stays yours" },
      ]}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="iswarya@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn("h-11 rounded-xl", errors.email && "border-destructive")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn("h-11 rounded-xl", errors.password && "border-destructive")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked /> Remember me
          </label>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-xl text-base shadow-gold transition-transform hover:-translate-y-0.5"
        >
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Signing in…" : "Login"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-gold-deep hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
