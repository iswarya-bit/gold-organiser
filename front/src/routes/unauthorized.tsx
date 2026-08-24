import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Unauthorized · Gold Organizer" },
      {
        name: "description",
        content: "You need to sign in to your Gold Organizer account to view this page.",
      },
      { property: "og:title", content: "Unauthorized · Gold Organizer" },
      { property: "og:description", content: "Sign in to continue to your gold loan dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md animate-rise text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-accent">
          <ShieldAlert className="size-9 text-warning" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold">401 — Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your session has expired or you don&apos;t have access to this page. Sign in again to
          continue managing your loans.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-xl shadow-gold">
          <Link to="/">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}