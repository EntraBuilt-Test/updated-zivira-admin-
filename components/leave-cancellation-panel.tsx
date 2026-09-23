"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "leaveCancellation";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 2027 - 2016 + 1 }, (_, i) => String(2016 + i));

function monthYearOf(dateStr: unknown): { month: string; year: string } {
  if (!dateStr || typeof dateStr !== "string") return { month: "", year: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { month: "", year: "" };
  return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
}

// Matches sanpharma.info's "Update/Delete > Leave Cancellation (After
// Approval)" screen: Applied Year / Applied Month / Field Force Name
// dropdown filters with a Go button — no Add button — and a results table
// with a per-row checkbox plus a "Select All" checkbox and a single
// "Cancel Leave" button that marks every checked row Cancelled in one
// action (a real write via the generic masters PUT, not a mirror).
export function LeaveCancellationPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [appliedMonth, setAppliedMonth] = useState("");
  const [appliedYear, setAppliedYear] = useState("");
  const [allRows, setAllRows] = useState<MasterRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  async function go() {
    setError(null);
    setSearched(true);
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setAllRows(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    return allRows.filter((r) => {
      if (fieldForceName && String(r.fieldForceName ?? "") !== fieldForceName) return false;
      const { month, year } = monthYearOf(r.leaveAppliedDate);
      if (appliedMonth && month !== appliedMonth) return false;
      if (appliedYear && year !== appliedYear) return false;
      return true;
    });
  }, [allRows, fieldForceName, appliedMonth, appliedYear]);

  const cancellableRows = rows.filter((r) => String(r.status ?? "Active") !== "Cancelled");
  const allSelected = cancellableRows.length > 0 && cancellableRows.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cancellableRows.map((r) => r.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function cancelSelected() {
    if (selected.size === 0) return;
    if (!window.confirm(`Cancel ${selected.size} selected leave record(s)?`)) return;
    setCancelling(true);
    setError(null);
    try {
      const ids = Array.from(selected);
      for (const id of ids) {
        await apiClient.updateMasterRecord(MASTER_KEY, id, { status: "Cancelled" });
      }
      setAllRows((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, status: "Cancelled" } : r)));
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel leave");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">Leave Cancellation (After Approval)</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "160px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Applied Year</span>
          <CustomSelect value={appliedYear} options={YEARS} onChange={setAppliedYear} placeholder="All Years" />
        </div>
        <div style={{ minWidth: "160px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Applied Month</span>
          <CustomSelect value={appliedMonth} options={MONTHS} onChange={setAppliedMonth} placeholder="All Months" />
        </div>
        <div style={{ minWidth: "220px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect
            value={fieldForceName}
            options={employeeOptions.map((e) => String(e.name ?? ""))}
            onChange={setFieldForceName}
            placeholder="All"
          />
        </div>
        <button className="button" type="button" onClick={go} disabled={loading}>
          {loading ? "Searching..." : "Go"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <>
          <div className="flex items-center justify-end">
            <button className="button" type="button" disabled={cancelling || selected.size === 0} onClick={cancelSelected}>
              {cancelling ? "Cancelling..." : `Cancel Leave${selected.size ? ` (${selected.size})` : ""}`}
            </button>
          </div>
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-subtle sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={cancellableRows.length === 0} />
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Employee Id</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Field Force Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">HQ</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Designation</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">From Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">To Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">No of Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Approved By</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={10} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                  )}
                  {rows.map((row) => {
                    const isCancelled = String(row.status ?? "Active") === "Cancelled";
                    return (
                      <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(row.id)}
                            disabled={isCancelled}
                            onChange={() => toggleOne(row.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.employeeId ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.fieldForceName ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.hq ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.designation ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.fromDate ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.toDate ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.noOfDays ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.approvedBy ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{isCancelled ? "Cancelled" : "Active"}</td>
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
