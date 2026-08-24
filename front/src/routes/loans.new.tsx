import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { LoanForm } from "@/components/LoanForm";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/loans/new")({
  head: () => ({
    meta: [
      { title: "Create Loan · Gold Organizer" },
      {
        name: "description",
        content:
          "Record a new gold loan with bank, branch, pledged amount, interest rate, pledge date and due date.",
      },
      { property: "og:title", content: "Create Loan · Gold Organizer" },
      {
        property: "og:description",
        content: "Record a new gold loan in seconds with full pledge and interest details.",
      },
    ],
  }),
  component: CreateLoanPage,
});

function CreateLoanPage() {
  const { addLoan } = useStore();
  const navigate = useNavigate();

  return (
    <AppShell title="Create Loan" subtitle="Add a new gold loan to your portfolio.">
      <div className="max-w-3xl">
        <LoanForm
          submitLabel="Save Loan"
          onCancel={() => navigate({ to: "/loans" })}
          onSubmit={async (values) => {
            try {
              const loan = await addLoan(values);
              toast.success("Loan created successfully", {
                description: `${loan.bankName} · #${loan.id}`,
              });
              navigate({ to: "/loans/$loanId", params: { loanId: loan.id } });
            } catch (err) {
              toast.error((err as Error).message || "Could not create the loan");
            }
          }}
        />
      </div>
    </AppShell>
  );
}