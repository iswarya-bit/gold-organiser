import { cn } from "@/lib/utils";
import { displayStatus, type Loan } from "@/lib/store";

const styles = {
  active: "bg-success/12 text-success border-success/25",
  closed: "bg-muted text-muted-foreground border-border",
  "due-soon": "bg-warning/15 text-warning border-warning/30",
} as const;

const labels = { active: "Active", closed: "Closed", "due-soon": "Due Soon" } as const;

export function StatusBadge({ loan, size = "sm" }: { loan: Loan; size?: "sm" | "lg" }) {
  const status = displayStatus(loan);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        styles[status],
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-sm",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}