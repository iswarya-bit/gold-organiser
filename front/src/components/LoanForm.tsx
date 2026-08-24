import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { fromIsoDate, toIsoDate } from "@/lib/local-extras";

export interface LoanFormValues {
  bankName: string;
  branchName: string;
  amount: number;
  interestRate: number;
  pledgeDate: string;
  dueDate: string;
}

const empty = {
  bankName: "",
  branchName: "",
  amount: "",
  interestRate: "",
  pledgeDate: "",
  dueDate: "",
};

type Errors = Partial<Record<keyof typeof empty, string>>;

function DateField({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-start rounded-xl text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <CalendarIcon className="mr-2" />
            {value ? format(fromIsoDate(value), "dd MMM yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? fromIsoDate(value) : undefined}
            onSelect={(d) => d && onChange(toIsoDate(d))}
            initialFocus
            className={cn("pointer-events-auto p-3")}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function LoanForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  lockedFields = [],
}: {
  initial?: LoanFormValues | undefined;
  submitLabel: string;
  onSubmit: (values: LoanFormValues) => void | Promise<void>;
  onCancel: () => void;
  lockedFields?: Array<keyof LoanFormValues>;
}) {
  const isLocked = (k: keyof LoanFormValues) => lockedFields.includes(k);
  const [values, setValues] = React.useState({
    ...empty,
    ...(initial
      ? {
          ...initial,
          amount: String(initial.amount),
          interestRate: String(initial.interestRate),
        }
      : {}),
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [saving, setSaving] = React.useState(false);

  const set = (key: keyof typeof empty, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e: Errors = {};
    if (!values.bankName.trim()) e.bankName = "Bank name is required";
    if (!values.branchName.trim()) e.branchName = "Branch name is required";
    if (!values.amount || Number(values.amount) <= 0) e.amount = "Enter a valid loan amount";
    if (!values.interestRate || Number(values.interestRate) <= 0)
      e.interestRate = "Enter a valid interest rate";
    if (!values.pledgeDate) e.pledgeDate = "Pledge date is required";
    if (!values.dueDate) e.dueDate = "Due date is required";
    if (values.pledgeDate && values.dueDate && values.dueDate <= values.pledgeDate)
      e.dueDate = "Due date must be after the pledge date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        bankName: values.bankName.trim(),
        branchName: values.branchName.trim(),
        amount: Number(values.amount),
        interestRate: Number(values.interestRate),
        pledgeDate: values.pledgeDate,
        dueDate: values.dueDate,
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof empty, label: string, props: React.ComponentProps<"input">) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        disabled={isLocked(key as keyof LoanFormValues)}
        className={cn("h-11 rounded-xl", errors[key] && "border-destructive")}
        {...props}
      />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {field("bankName", "Bank Name", { placeholder: "e.g. State Bank of India" })}
            {field("branchName", "Branch Name", { placeholder: "e.g. Anna Nagar" })}
            {field("amount", "Loan Amount (₹)", {
              placeholder: "250000",
              inputMode: "numeric",
            })}
            {field("interestRate", "Interest Rate (%)", { placeholder: "8.5", inputMode: "decimal" })}
            <DateField
              label="Pledge Date"
              value={values.pledgeDate}
              onChange={(v) => set("pledgeDate", v)}
              error={errors.pledgeDate}
              disabled={isLocked("pledgeDate")}
            />
            <DateField
              label="Due Date"
              value={values.dueDate}
              onChange={(v) => set("dueDate", v)}
              error={errors.dueDate}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" size="lg" disabled={saving} className="rounded-xl shadow-gold">
              {saving && <Loader2 className="animate-spin" />}
              {submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-xl"
              onClick={() => {
                if (initial) onCancel();
                else {
                  setValues(empty);
                  setErrors({});
                }
              }}
            >
              {initial ? "Cancel" : "Reset"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}