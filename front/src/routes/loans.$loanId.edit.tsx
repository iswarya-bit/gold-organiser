import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { LoanForm } from "@/components/LoanForm";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/loans/$loanId/edit")({
  head: () => ({
    meta: [
      { title: "Update Loan · Gold Organizer" },
      {
        name: "description",
        content: "Update the bank, branch, amount, interest rate and dates of an existing gold loan.",
      },
      { property: "og:title", content: "Update Loan · Gold Organizer" },
      {
        property: "og:description",
        content: "Edit the details of an existing gold loan record.",
      },
    ],
  }),
  component: EditLoanPage,
});

function EditLoanPage() {
  const { loanId } = Route.useParams();
  const { loans, updateLoan } = useStore();
  const navigate = useNavigate();
  const loan = loans.find((l) => l.id === loanId);

  if (!loan) {
    return (
      <AppShell title="Loan not found" subtitle="This loan may have been deleted.">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/loans">
            <ArrowLeft /> Back to My Loans
          </Link>
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Update Loan"
      subtitle={`${loan.bankName} · #${loan.id} — bank name, amount and pledge date are fixed after creation.`}
    >
      <div className="max-w-3xl">
        <LoanForm
          submitLabel="Update Loan"
          lockedFields={["bankName", "amount", "pledgeDate"]}
          initial={{
            bankName: loan.bankName,
            branchName: loan.branchName,
            amount: loan.amount,
            interestRate: loan.interestRate,
            pledgeDate: loan.pledgeDate,
            dueDate: loan.dueDate,
          }}
          onCancel={() => navigate({ to: "/loans/$loanId", params: { loanId: loan.id } })}
          onSubmit={async (values) => {
            try {
              await updateLoan(loan.id, {
                branchName: values.branchName,
                interestRate: values.interestRate,
                dueDate: values.dueDate,
              });
              toast.success("Loan updated successfully");
              navigate({ to: "/loans/$loanId", params: { loanId: loan.id } });
            } catch (err) {
              toast.error((err as Error).message || "Could not update the loan");
            }
          }}
        />
      </div>
    </AppShell>
  );
}