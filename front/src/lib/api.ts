export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8080";

const TOKEN_KEY = "go.token";

export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string> | undefined;
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface BackendError {
  message?: string;
  errors?: Record<string, string>;
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined
        ? { body: isForm ? (body as FormData) : JSON.stringify(body) }
        : {}),
    });
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${API_BASE_URL}. Is the backend running?`);
  }

  const text = await response.text();
  const parsed: unknown = text ? safeJson(text) : null;

  if (!response.ok) {
    const err = (parsed ?? {}) as BackendError;
    const fieldErrors = err.errors;
    const firstField = fieldErrors ? Object.values(fieldErrors)[0] : undefined;
    throw new ApiError(
      response.status,
      firstField ?? err.message ?? (typeof parsed === "string" ? parsed : response.statusText),
      fieldErrors,
    );
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* ---- Backend DTO mirrors ---- */

export type LoanStatusApi = "ACTIVE" | "CLOSED";

export type JewelType =
  | "CHAIN"
  | "RING"
  | "COIN"
  | "BRACELET"
  | "BANGLE"
  | "NECKLACE"
  | "EARRING"
  | "ANKLET"
  | "OTHER";

export const JEWEL_TYPES: JewelType[] = [
  "CHAIN",
  "RING",
  "COIN",
  "BRACELET",
  "BANGLE",
  "NECKLACE",
  "EARRING",
  "ANKLET",
  "OTHER",
];

export interface AuthResponse {
  message: string;
  token: string;
}

export interface LoanResponse {
  id: number;
  bankName: string;
  branchName: string;
  loanAmount: number;
  interestRate: number;
  pledgeDate: string;
  dueDate: string;
  renewalDate: string | null;
  closedDate: string | null;
  status: LoanStatusApi;
}

export interface DashboardResponse {
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  totalLoanAmount: number;
  activeLoanAmount: number;
}

export interface JewelResponse {
  id: number;
  jewelType: JewelType;
  weight: number;
  quantity: number;
  description: string | null;
  imageUrls?: string[] | null;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<AuthResponse>("/api/auth/login", { method: "POST", body, auth: false }),
  register: (body: { name: string; email: string; password: string; phoneNumber: string }) =>
    api<AuthResponse>("/api/auth/register", { method: "POST", body, auth: false }),
};

export const loansApi = {
  list: () => api<LoanResponse[]>("/api/loans"),
  get: (id: number) => api<LoanResponse>(`/api/loans/${id}`),
  create: (body: {
    bankName: string;
    branchName: string;
    loanAmount: number;
    interestRate: number;
    pledgeDate: string;
    dueDate: string;
  }) => api<LoanResponse>("/api/loans", { method: "POST", body }),
  update: (
    id: number,
    body: { branchName?: string; interestRate?: number; dueDate?: string },
  ) => api<LoanResponse>(`/api/loans/${id}`, { method: "PUT", body }),
  renew: (id: number, newDueDate: string) =>
    api<LoanResponse>(`/api/loans/${id}/renew`, { method: "PATCH", body: { newDueDate } }),
  close: (id: number) => api<LoanResponse>(`/api/loans/${id}/close`, { method: "PATCH" }),
};

export const dashboardApi = {
  get: () => api<DashboardResponse>("/api/dashboard"),
};

export const jewelsApi = {
  list: (loanId: number) => api<JewelResponse[]>(`/api/loans/${loanId}/jewels`),
  get: (loanId: number, jewelId: number) =>
    api<JewelResponse>(`/api/loans/${loanId}/jewels/${jewelId}`),
  create: (
    loanId: number,
    body: { jewelType: JewelType; weight: number; quantity: number; description: string },
    images?: File[],
  ) => {
    const form = new FormData();
    form.append("jewel", new Blob([JSON.stringify(body)], { type: "application/json" }));
    images?.forEach((f) => form.append("images", f));
    return api<JewelResponse>(`/api/loans/${loanId}/jewels`, { method: "POST", body: form });
  },
  update: (
    loanId: number,
    jewelId: number,
    body: { jewelType: JewelType; weight: number; quantity: number; description: string },
  ) => api<JewelResponse>(`/api/loans/${loanId}/jewels/${jewelId}`, { method: "PUT", body }),
  remove: (loanId: number, jewelId: number) =>
    api<string>(`/api/loans/${loanId}/jewels/${jewelId}`, { method: "DELETE" }),
};
