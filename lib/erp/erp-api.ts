// Phase 2 ERP -- small API helper for /company/erp/* (company admin token).
import { clearToken, getToken } from "@/lib/api-client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function erpRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}/company/erp${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers }
  });
  if (res.status === 401 && typeof window !== "undefined") {
    clearToken();
    window.location.replace("/admin/login");
    throw new Error("Your session has expired. Please sign in again.");
  }
  const body = await res.json().catch(() => null) as { data?: unknown; error?: { message?: string } } | null;
  if (!res.ok) throw new Error(body?.error?.message ?? "Request failed");
  return body as T;
}

export type SalesProduct = { id: string; name: string; pack: string; division: string; pts: number | null; aliases: string[]; active: boolean };
export type SalesStockist = { id: string; name: string; gstin: string; state: string; hq: string; place: string; division: string };
export type StatementSummary = { id: string; stockistName: string; month: string; sourceFile: string; format: string; updatedAt?: string; lineCount: number; primary: number; secondary: number };
export type CompilationCell = { primary: number; primaryFree: number; ret: number; nPrimary: number; secondary: number; nSecondary: number; nSecondaryVal: number | null; closing: number };
export type CompilationRow = { state: string; hq: string; place: string; customer: string; division: string; product: string; batch: string; pts: number | null; months: Record<string, CompilationCell> };
