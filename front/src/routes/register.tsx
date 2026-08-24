import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BellRing, Loader2, PieChart, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account · Gold Organizer" },
      {
        name: "description",
        content:
          "Create a free Gold Organizer account to record gold loans, track interest and never miss a renewal date.",
      },
      { property: "og:title", content: "Create your account · Gold Organizer" },
      {
        property: "og:description",
        content: "Record gold loans, track interest and never miss a renewal date.",
      },
    ],
  }),
  component: RegisterPage,
});

const strengthOf = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthMeta = [
  { label: "Too weak", cls: "bg-destructive" },
  { label: "Weak", cls: "bg-destructive" },
  { label: "Fair", cls: "bg-warning" },
  { label: "Good", cls: "bg-info" },
  { label: "Strong", cls: "bg-success" },
];

function RegisterPage() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [values, setValues] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const set = (k: keyof typeof values, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const score = strengthOf(values.password);
  const meta = strengthMeta[score] ?? strengthMeta[0]!;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (values.fullName.trim().length < 3) next["fullName"] = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
      next["email"] = "Enter a valid email address";
    if (!/^[0-9+\s-]{10,15}$/.test(values.phone)) next["phone"] = "Enter a valid phone number";
    if (values.password.length < 8) next["password"] = "Use at least 8 characters";
    if (values.confirm !== values.password) next["confirm"] = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await register({
        name: values.fullName.trim(),
        email: values.email,
        password: values.password,
        phoneNumber: values.phone,
      });
      toast.success("Account created — welcome aboard!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    k: keyof typeof values,
    label: string,
    type: string,
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={k}>{label}</Label>
      <Input
        id={k}
        type={type}
        placeholder={placeholder}
        value={values[k]}
        onChange={(e) => set(k, e.target.value)}
        className={cn("h-11 rounded-xl", errors[k] && "border-destructive")}
      />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organising your gold loans in under a minute."
      highlights={[
        { icon: PieChart, text: "Portfolio view across every bank" },
        { icon: BellRing, text: "Reminders 7 days before each due date" },
        { icon: ShieldCheck, text: "Encrypted, private, always yours" },
      ]}
    >
      <form onSubmit={submit} className="space-y-5">
        {field("fullName", "Full Name", "text", "Iswarya R")}
        {field("email", "Email", "email", "iswarya@example.com")}
        {field("phone", "Phone Number", "tel", "+91 98400 12345")}
        {field("password", "Password", "password", "••••••••")}

        {values.password && (
          <div className="animate-rise space-y-1.5">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < score ? meta.cls : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Password strength: {meta.label}</p>
          </div>
        )}

        {field("confirm", "Confirm Password", "password", "••••••••")}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-xl text-base shadow-gold transition-transform hover:-translate-y-0.5"
        >
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Creating account…" : "Register"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/" className="font-medium text-gold-deep hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}