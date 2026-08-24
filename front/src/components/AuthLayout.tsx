import type { LucideIcon } from "lucide-react";
import authArt from "@/assets/auth-gold.jpg";

export function AuthLayout({
  title,
  subtitle,
  highlights,
  children,
}: {
  title: string;
  subtitle: string;
  highlights: { icon: LucideIcon; text: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={authArt}
          alt="Abstract flowing gold ribbons on a deep navy background"
          width={1024}
          height={1536}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="gradient-navy absolute inset-0 opacity-70" />
        <div className="relative flex h-full flex-col justify-between p-12 text-navy-foreground">
          <div className="flex items-center gap-3">
            <span className="gradient-gold grid size-10 place-items-center rounded-xl font-display text-lg font-bold text-primary-foreground">
              G
            </span>
            <span className="font-display text-lg font-semibold">Gold Organizer</span>
          </div>

          <div className="max-w-md space-y-6">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Your gold loans, <span className="text-gold-gradient">organised</span>.
            </h2>
            <ul className="space-y-4">
              {highlights.map((h) => (
                <li key={h.text} className="flex items-center gap-3 text-sm text-navy-foreground/85">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
                    <h.icon className="size-4 text-gold" />
                  </span>
                  {h.text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-navy-foreground/60">
            Bank-grade privacy · Renewal reminders · Interest insights
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
        <div className="w-full max-w-md animate-rise">
          <div className="mb-8 lg:hidden">
            <span className="gradient-gold inline-grid size-10 place-items-center rounded-xl font-display text-lg font-bold text-primary-foreground">
              G
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}