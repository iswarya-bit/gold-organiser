/** Local-only extras that the backend does not persist yet. */

const RENEWALS_KEY = "go.renewals";
const IMAGES_KEY = "go.jewelImages";

/* ---------- date helpers (timezone safe) ---------- */

/** Format a Date as YYYY-MM-DD using local calendar values (no UTC shift). */
export const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Parse a YYYY-MM-DD string as a local date (avoids the UTC "one day less" bug). */
export const fromIsoDate = (value: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return new Date(value);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

/* ---------- renewal log ---------- */

export interface RenewalEntry {
  /** date the renewal was performed (YYYY-MM-DD) */
  on: string;
  /** the new due date set by that renewal */
  newDueDate: string;
}

type RenewalLog = Record<string, RenewalEntry[]>;

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore */
  }
};

export const getRenewals = (loanId: string): RenewalEntry[] =>
  readJson<RenewalLog>(RENEWALS_KEY, {})[loanId] ?? [];

export const addRenewal = (loanId: string, newDueDate: string) => {
  const log = readJson<RenewalLog>(RENEWALS_KEY, {});
  const list = log[loanId] ?? [];
  list.push({ on: toIsoDate(new Date()), newDueDate });
  log[loanId] = list;
  writeJson(RENEWALS_KEY, log);
};

/* ---------- jewel images ---------- */

type ImageStore = Record<string, string[]>;

const imageKey = (loanId: number | string, jewelId: number | string) => `${loanId}:${jewelId}`;

export const getJewelImages = (loanId: number | string, jewelId: number | string): string[] =>
  readJson<ImageStore>(IMAGES_KEY, {})[imageKey(loanId, jewelId)] ?? [];

export const setJewelImages = (
  loanId: number | string,
  jewelId: number | string,
  images: string[],
) => {
  const store = readJson<ImageStore>(IMAGES_KEY, {});
  if (images.length) store[imageKey(loanId, jewelId)] = images;
  else delete store[imageKey(loanId, jewelId)];
  writeJson(IMAGES_KEY, store);
};

export const removeJewelImages = (loanId: number | string, jewelId: number | string) =>
  setJewelImages(loanId, jewelId, []);

/** Downscale + compress an image file to a data URL so it fits in local storage. */
export const fileToCompressedDataUrl = (file: File, max = 900): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(`Unsupported image: ${file.name}`));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
