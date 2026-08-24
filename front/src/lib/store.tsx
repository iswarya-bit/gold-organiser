import * as React from "react";

import {
  ApiError,
  authApi,
  getToken,
  loansApi,
  setToken,
  type LoanResponse,
} from "./api";
import { addRenewal, fromIsoDate, getRenewals, toIsoDate } from "./local-extras";

export type LoanStatus = "active" | "closed";

export interface LoanEvent {
  label: string;
  date: string;
}

export interface Loan {
  id: string;
  bankName: string;
  branchName: string;
  amount: number;
  interestRate: number;
  pledgeDate: string;
  dueDate: string;
  renewalDate: string | null;
  closedDate: string | null;
  status: LoanStatus;
  history: LoanEvent[];
}

export interface AppUser {
  fullName: string;
  email: string;
  phone: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  emailAlerts: boolean;
  dueReminders: boolean;
  language: string;
}

const USER_KEY = "go.user";
const SETTINGS_KEY = "go.settings";

const iso = (d: Date) => toIsoDate(d);

export const mapLoan = (l: LoanResponse): Loan => {
  const history: LoanEvent[] = [{ label: "Loan created", date: l.pledgeDate }];
  const logged = getRenewals(String(l.id));
  if (logged.length) {
    logged.forEach((r, i) =>
      history.push({ label: `Loan renewed (#${i + 1}) · due ${formatDate(r.newDueDate)}`, date: r.on }),
    );
  } else if (l.renewalDate) {
    history.push({ label: "Loan renewed", date: l.renewalDate });
  }
  if (l.closedDate) history.push({ label: "Loan closed", date: l.closedDate });
  history.sort((a, b) => a.date.localeCompare(b.date));
  return {
    id: String(l.id),
    bankName: l.bankName,
    branchName: l.branchName ?? "",
    amount: Number(l.loanAmount),
    interestRate: Number(l.interestRate),
    pledgeDate: l.pledgeDate,
    dueDate: l.dueDate,
    renewalDate: l.renewalDate ?? null,
    closedDate: l.closedDate ?? null,
    status: l.status === "CLOSED" ? "closed" : "active",
    history,
  };
};

export const daysUntil = (date: string) =>
  Math.ceil((fromIsoDate(date).getTime() - Date.now()) / 86_400_000);

export const displayStatus = (loan: Loan): "active" | "closed" | "due-soon" => {
  if (loan.status === "closed") return "closed";
  return daysUntil(loan.dueDate) <= 30 ? "due-soon" : "active";
};

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const formatDate = (d: string) =>
  fromIsoDate(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

interface StoreValue {
  ready: boolean;
  loading: boolean;
  error: string | null;
  user: AppUser | null;
  loans: Loan[];
  settings: AppSettings;
  refreshLoans: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<AppUser>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  addLoan: (loan: {
    bankName: string;
    branchName: string;
    amount: number;
    interestRate: number;
    pledgeDate: string;
    dueDate: string;
  }) => Promise<Loan>;
  updateLoan: (
    id: string,
    patch: { branchName?: string; interestRate?: number; dueDate?: string },
  ) => Promise<void>;
  renewLoan: (id: string, newDueDate: string) => Promise<void>;
  closeLoan: (id: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: "light",
  emailAlerts: true,
  dueReminders: true,
  language: "English",
};

const StoreContext = React.createContext<StoreValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings);

  const persistUser = React.useCallback((u: AppUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const refreshLoans = React.useCallback(async () => {
    if (!getToken()) {
      setLoans([]);
      return;
    }
    setLoading(true);
    try {
      const data = await loansApi.list();
      setLoans(data.map(mapLoan));
      setError(null);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401 || err.status === 403) {
        setToken(null);
        persistUser(null);
        setLoans([]);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  React.useEffect(() => {
    const stored = read<AppUser | null>(USER_KEY, null);
    setUser(getToken() ? stored : null);
    if (!getToken()) localStorage.removeItem(USER_KEY);
    setSettings(read<AppSettings>(SETTINGS_KEY, defaultSettings));
    setReady(true);
    void refreshLoans();
  }, [refreshLoans]);

  React.useEffect(() => {
    if (!ready) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings, ready]);

  const value: StoreValue = {
    ready,
    loading,
    error,
    user,
    loans,
    settings,
    refreshLoans,
    login: async (email, password) => {
      const res = await authApi.login({ email, password });
      setToken(res.token);
      const existing = read<AppUser | null>(USER_KEY, null);
      persistUser({
        fullName:
          existing?.email === email && existing.fullName
            ? existing.fullName
            : (email.split("@")[0] ?? "User")
                .replace(/[._]/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        phone: existing?.email === email ? existing.phone : "",
      });
      await refreshLoans();
    },
    register: async (input) => {
      const res = await authApi.register(input);
      setToken(res.token);
      persistUser({ fullName: input.name, email: input.email, phone: input.phoneNumber });
      await refreshLoans();
    },
    logout: () => {
      setToken(null);
      persistUser(null);
      setLoans([]);
    },
    updateUser: (patch) => persistUser(user ? { ...user, ...patch } : null),
    updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
    addLoan: async (draft) => {
      const created = await loansApi.create({
        bankName: draft.bankName,
        branchName: draft.branchName,
        loanAmount: draft.amount,
        interestRate: draft.interestRate,
        pledgeDate: draft.pledgeDate,
        dueDate: draft.dueDate,
      });
      const loan = mapLoan(created);
      setLoans((prev) => [loan, ...prev]);
      return loan;
    },
    updateLoan: async (id, patch) => {
      const updated = await loansApi.update(Number(id), patch);
      const loan = mapLoan(updated);
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? loan : l)));
    },
    renewLoan: async (id, newDueDate) => {
      const updated = await loansApi.renew(Number(id), newDueDate);
      addRenewal(id, newDueDate);
      const loan = mapLoan(updated);
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? loan : l)));
    },
    closeLoan: async (id) => {
      const updated = await loansApi.close(Number(id));
      const loan = mapLoan(updated);
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? loan : l)));
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export { iso };
