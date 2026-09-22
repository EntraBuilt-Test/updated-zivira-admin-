"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

/**
 * sanpharma.info's DCR_Bulk_Approval.aspx shape: a manager picks a field
 * rep + month and reviews EVERY activity date in that month as one grid
 * (checkbox per row), approving or rejecting many dates in a single
 * action, instead of the single-request "Click Here to Approve" detail
 * popup ApprovalQueueTable renders one row at a time.
 *
 * This is an ADDITIONAL view over the exact same `approvalDcr` master
 * collection ApprovalQueueTable already reads and writes (see
 * components/approval-queue-table.tsx and the `approvalDcr` entry in
 * src/masters/registry.ts) — it does not replace that screen. Anyone
 * still using the single-row "Activities > Approvals > DCR" tab keeps
 * getting the exact same behavior as before.
 */
const MASTER_KEY = "approvalDcr";

export function DcrBulkApproval() {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [sfName, setSfName] = useState("");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .masterRecords("employees")
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const employeeNames = useMemo(
    () =>
      Array.from(
        new Set(
          employees
            .map((e) => (typeof e.name === "string" ? e.name : ""))
            .filter((n) => n.trim() !== "")
        )
      ).sort(),
    [employees]
  );

  async function loadRows() {
    if (!sfName || !/^\d{4}-\d{2}$/.test(month)) {
      setError("Pick a field rep and a month first.");
      return;
    }
    setLoadingRows(true);
    setError(null);
    setSelected(new Set());
    try {
      const res = await apiClient.masterBulkRecords(MASTER_KEY, { sfName, month });
      setRows(res.data);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load DCR rows");
    } finally {
      setLoadingRows(false);
    }
  }

  const pendingRows = rows.filter((r) => String(r.approvalStatus ?? "Pending") === "Pending");

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllPending() {
    setSelected(new Set(pendingRows.map((r) => String(r.id))));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function applyBulkAction(status: "Approved" | "Rejected") {
    if (!selected.size) return;
    setWorking(true);
    setError(null);
    try {
      const res = await apiClient.masterBulkAction(MASTER_KEY, { ids: Array.from(selected), status });
      const failed = res.data.results.filter((r) => !r.ok);
      if (failed.length) {
        setError(`${failed.length} of ${res.data.results.length} row(s) could not be updated.`);
      }
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${status === "Approved" ? "approve" : "reject"} selected rows`);
    } finally {
      setWorking(false);
    }
  }

  function formatDate(v: unknown): string {
    if (!v) return "—";
    const d = new Date(v as string);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  const commonStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    fontSize: "13px",
    background: "var(--panel)",
    color: "var(--ink)"
  };

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Approvals</p>
        <h2 className="text-2xl font-bold text-text-primary">DCR Bulk Approval</h2>
        <p className="text-sm text-text-muted mt-1">
          Pick a field rep and a month to review every activity date at once — approve or reject many in one action, like sanpharma.info&apos;s DCR_Bulk_Approval.aspx.
        </p>
      </div>

      {error && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", minWidth: "320px", maxWidth: "440px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#ef4444" }}>Something went wrong</h3>
              </div>
              <button onClick={() => setError(null)} type="button" aria-label="Close"><X size={20} /></button>
            </div>
            <p style={{ margin: 0, fontSize: "13px" }}>{error}</p>
            <button className="button button-secondary" style={{ marginTop: "16px", width: "100%" }} onClick={() => setError(null)} type="button">Close</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 bg-surface-card p-4 rounded-xl border border-border-subtle shadow-sm">
        <label className="flex flex-col gap-1" style={{ minWidth: "220px" }}>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Field Rep (SF Name)</span>
          <CustomSelect
            value={sfName}
            options={employeeNames}
            onChange={setSfName}
            placeholder={loadingEmployees ? "Loading…" : "Select field rep"}
          />
        </label>
        <label className="flex flex-col gap-1" style={{ minWidth: "160px" }}>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Month</span>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={commonStyle} />
        </label>
        <button className="button" type="button" onClick={loadRows} disabled={loadingRows}>
          {loadingRows ? "Loading…" : "Show DCRs"}
        </button>
      </div>

      {hasSearched && (
        <>
          <div className="flex flex-wrap items-center gap-4 bg-surface-card p-4 rounded-xl border border-border-subtle shadow-sm">
            <article className="flex items-center gap-3 pr-4 border-r border-border-subtle">
              <span className="text-sm text-text-muted">Pending</span>
              <strong className="text-lg font-semibold text-text-primary">{pendingRows.length}</strong>
            </article>
            <article className="flex items-center gap-3 pr-4 border-r border-border-subtle">
              <span className="text-sm text-text-muted">Selected</span>
              <strong className="text-lg font-semibold text-text-primary">{selected.size}</strong>
            </article>
            <button className="button button-secondary" type="button" onClick={selectAllPending} disabled={!pendingRows.length}>
              Select All Pending
            </button>
            <button className="button button-secondary" type="button" onClick={clearSelection} disabled={!selected.size}>
              Clear Selection
            </button>
            <button
              className="bg-status-success text-white hover:opacity-90 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              type="button"
              onClick={() => applyBulkAction("Approved")}
              disabled={!selected.size || working}
            >
              {working ? "Working…" : "Approve Selected"}
            </button>
            <button
              className="bg-status-danger text-white hover:opacity-90 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              type="button"
              onClick={() => applyBulkAction("Rejected")}
              disabled={!selected.size || working}
            >
              {working ? "Working…" : "Reject Selected"}
            </button>
          </div>

          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col" style={{ maxHeight: "calc(100vh - 380px)", minHeight: "220px" }}>
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Select</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Activity Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Work Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Hospitals Met</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Remarks</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">
                        No DCR activity found for this field rep in this month
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => {
                    const id = String(row.id);
                    const status = String(row.approvalStatus ?? "Pending");
                    const isPending = status === "Pending";
                    return (
                      <tr key={id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={selected.has(id)}
                            disabled={!isPending}
                            onChange={() => toggleRow(id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{formatDate(row.activityDate)}</td>
                        <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{String(row.workType ?? "—")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{String(row.hospitalClinic ?? "—")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.remarks ?? "—")}</td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === "Approved" ? "bg-status-success/10 text-status-success" : status === "Rejected" ? "bg-status-danger/10 text-status-danger" : "bg-surface-subtle text-text-secondary"}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
