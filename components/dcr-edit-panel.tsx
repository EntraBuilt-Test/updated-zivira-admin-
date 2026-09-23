"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const WORK_TYPES = ["Field Work", "Holiday", "Weekly Off", "Transit", "Meeting"];

// Matches sanpharma.info's "Update/Delete > DCR Edit" screen: a Field Force
// Name dropdown filter with a Go button, and a results table where each
// row's Work Type can be changed via its own dropdown — no Add button.
// This reads and edits REAL DCR documents (the exact DcrModel collection
// the field-force MR's own DCR history and the manager's DCR review queue
// both read from — see company.routes.ts GET /company/dcrs and
// PATCH /company/dcrs/:id/work-type), not a generic-masters mirror, so an
// edit here is genuinely reflected in every portal, and the backend
// notifies both the MR and their reporting manager.
export function DcrEditPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

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
    try {
      const emp = employees.find((e) => String(e.name ?? "") === selectedEmployeeCode);
      const res = await apiClient.companyDcrs({
        employeeCode: emp ? String(emp.employeeCode ?? "") : undefined
      });
      setRows(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load DCRs");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleWorkTypeChange(id: string, workType: string) {
    setSavingId(id);
    setError(null);
    try {
      await apiClient.updateDcrWorkType(id, workType);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, workType } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update DCR");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">DCR Edit</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "240px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect
            value={selectedEmployeeCode}
            options={employeeOptions.map((e) => String(e.name ?? ""))}
            onChange={setSelectedEmployeeCode}
            placeholder="All"
          />
        </div>
        <button className="button" type="button" onClick={go} disabled={loading}>
          {loading ? "Searching..." : "Go"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Field Force Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">DCR Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Work Type</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rows.map((row) => {
                  const id = String(row.id ?? "");
                  const dcrDate = row.visitDate ? new Date(String(row.visitDate)).toLocaleDateString() : "";
                  return (
                    <tr key={id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.employeeCodeName ?? row.employeeCode ?? "")}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{dcrDate}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.status ?? "")}</td>
                      <td className="px-4 py-3 text-sm" style={{ minWidth: "200px" }}>
                        <CustomSelect
                          value={savingId === id ? "Saving..." : String(row.workType ?? "Field Work")}
                          options={WORK_TYPES}
                          onChange={(v) => handleWorkTypeChange(id, v)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
