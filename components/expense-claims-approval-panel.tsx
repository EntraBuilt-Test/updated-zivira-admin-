"use client";

// QA-25 (Nov 2026): Admin approval of individual expense claims. Lists the
// claims still waiting (any manager) and lets the admin approve or reject
// them. Backed by PATCH /company/expense-claims/:claimId/approve|reject.
import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl, getToken } from "@/lib/api-client";

type Claim = {
  id: string;
  claimId: string;
  employeeCode: string;
  employeeName?: string;
  month: string;
  category?: string;
  amountRs: number;
  description?: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  assignedManagerName?: string;
  assignedManager?: string;
  createdAt?: string;
};

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}`, ...(init.headers ?? {}) }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
  return body as T;
}

export function ExpenseClaimsApprovalPanel() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await call<{ data: Claim[] }>("/company/expense-claims?status=SUBMITTED");
      setClaims(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load expense claims");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function decide(claim: Claim, action: "approve" | "reject") {
    setMessage(""); setError("");
    let reason = "";
    if (action === "reject") {
      reason = window.prompt(`Reason for rejecting ${claim.claimId}?`)?.trim() ?? "";
      if (!reason) return;
    }
    setBusy(claim.claimId);
    try {
      await call(`/company/expense-claims/${encodeURIComponent(claim.claimId)}/${action}`, {
        method: "PATCH",
        body: action === "reject" ? JSON.stringify({ reason }) : "{}"
      });
      setMessage(`${claim.claimId} ${action === "approve" ? "approved" : "rejected"}. The rep has been notified.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-text-primary">Expense Claims Awaiting Approval</h3>
          <p className="text-sm text-text-muted">Approve or reject individual claims. The rep sees the decision and who made it.</p>
        </div>
        <button type="button" onClick={() => void load()} className="px-3 py-1.5 text-sm rounded-lg border border-border-subtle hover:bg-surface-subtle">Refresh</button>
      </div>
      {message && <p className="text-sm text-status-success mb-2">{message}</p>}
      {error && <p className="text-sm text-status-danger mb-2">{error}</p>}
      {loading ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : claims.length === 0 ? (
        <p className="text-sm text-text-muted">No expense claims are waiting for approval.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-text-secondary border-b border-border-subtle">
                <th className="py-2 pr-3">Claim</th>
                <th className="py-2 pr-3">Employee</th>
                <th className="py-2 pr-3">Month</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3 text-right">Amount (Rs)</th>
                <th className="py-2 pr-3">Manager</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">{c.claimId}</td>
                  <td className="py-2 pr-3">{c.employeeName ?? c.employeeCode}</td>
                  <td className="py-2 pr-3">{c.month}</td>
                  <td className="py-2 pr-3">{c.category ?? "—"}</td>
                  <td className="py-2 pr-3 text-right">{Number(c.amountRs).toLocaleString("en-IN")}</td>
                  <td className="py-2 pr-3">{c.assignedManagerName ?? c.assignedManager ?? "—"}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button type="button" disabled={busy === c.claimId} onClick={() => void decide(c, "approve")} className="px-2.5 py-1 mr-1.5 text-xs font-semibold rounded-md bg-primary text-white disabled:opacity-60">Approve</button>
                    <button type="button" disabled={busy === c.claimId} onClick={() => void decide(c, "reject")} className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border-subtle text-status-danger disabled:opacity-60">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
