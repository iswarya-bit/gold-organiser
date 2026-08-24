import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, useStore, type Loan } from "@/lib/store";
import { fromIsoDate, toIsoDate } from "@/lib/local-extras";

export function RenewDialog({
  loan,
  onOpenChange,
}: {
  loan: Loan | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { renewLoan } = useStore();
  const [date, setDate] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (loan) {
      const d = fromIsoDate(loan.dueDate);
      d.setMonth(d.getMonth() + 6);
      setDate(toIsoDate(d));
      setDone(false);
    }
  }, [loan]);

  if (!loan) return null;

  const confirm = async () => {
    setSaving(true);
    try {
      await renewLoan(loan.id, date);
      setDone(true);
      toast.success("Loan renewed successfully");
      setTimeout(() => onOpenChange(false), 1100);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!loan} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="size-14 animate-rise text-success" />
            <p className="font-display text-lg font-semibold">Renewed successfully</p>
            <p className="text-sm text-muted-foreground">New due date: {formatDate(date)}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Renew loan</DialogTitle>
              <DialogDescription>
                {loan.bankName} · {loan.branchName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/60 p-3 text-sm">
                <span className="text-muted-foreground">Current due date</span>
                <p className="font-medium">{formatDate(loan.dueDate)}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">New due date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-11 w-full justify-start rounded-xl font-normal">
                      <CalendarIcon className="mr-2" />
                      {date ? format(fromIsoDate(date), "dd MMM yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date ? fromIsoDate(date) : undefined}
                      onSelect={(d) => d && setDate(toIsoDate(d))}
                      initialFocus
                      className={cn("pointer-events-auto p-3")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="rounded-xl shadow-gold" disabled={saving} onClick={confirm}>
                {saving && <Loader2 className="animate-spin" />} Renew
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CloseLoanDialog({
  loan,
  onOpenChange,
}: {
  loan: Loan | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { closeLoan } = useStore();
  if (!loan) return null;

  return (
    <AlertDialog open={!!loan} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to close this loan?</AlertDialogTitle>
          <AlertDialogDescription>
            {loan.bankName} · {loan.branchName} will be marked as closed and moved out of your
            active portfolio. You can still view its history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              void closeLoan(loan.id)
                .then(() => toast.success("Loan closed"))
                .catch((e: Error) => toast.error(e.message));
            }}
          >
            Close Loan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
