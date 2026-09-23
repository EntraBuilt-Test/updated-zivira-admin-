"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's "Update/Delete > TP Delete" screen: a Year /
// Month / Field Force Name dropdown filter with a Go button, and a results
// table with a Delete action per row — no Add button. This reads and
// deletes REAL Tour Plan documents (the exact TourPlanModel collection the
// field-force MR's own Tour Plan screen and the manager's approval queue
// both read from — see company.routes.ts GET/DELETE /company/tour-plans),
// not a generic-masters mirror, so a delete here is genuinely gone from
// every portal, and the backend notifies both the MR and their assigned
// manager.
export function TpDeletePanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1].map(String);
  }, []);

  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  async function go() {
    setError(null);
    setSearched(true);
    setLoading(true);
    try {
      const emp = employees.find((e) => String(e.name ?? "") === selectedEmployeeCode);
      const month =
        selectedYear && selectedMonth
          ? `${selectedYear}-${String(monthOptions.indexOf(selectedMonth) + 1).padStart(2, "0")}`
          : undefined;
      const res = await apiClient.companyTourPlans({
        employeeCode: emp ? String(emp.employeeCode ?? "") : undefined,
        month
      });
      setRows(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Tour Plans");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(tpId: string) {
    if (!window.confirm(`Delete Tour Plan ${tpId}? This also removes it from the field force and manager portals, and notifies both.`)) return;
    setDeletingId(tpId);
    setError(null);
    try {
      await apiClient.deleteTourPlan(tpId);
      setRows((prev) => prev.filter((r) => r.tpId !== tpId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete Tour Plan");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">TP Delete</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "140px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={selectedYear} options={yearOptions} onChange={setSelectedYear} placeholder="Year" />
        </div>
        <div style={{ minWidth: "160px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
          <CustomSelect value={selectedMonth} options={monthOptions} onChange={setSelectedMonth} placeholder="Month" />
        </div>
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
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">TP ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Field Force Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Month</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Assigned Manager</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rows.map((row) => {
                  const tpId = String(row.tpId ?? "");
                  return (
                    <tr key={tpId} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                      <td className="px-4 py-3 text-sm text-text-primary">{tpId}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.employeeName ?? "")}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.month ?? "")}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.status ?? "")}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.assignedManagerName ?? row.assignedManager ?? "")}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          className="button"
                          type="button"
                          disabled={deletingId === tpId}
                          onClick={() => handleDelete(tpId)}
                        >
                          {deletingId === tpId ? "Deleting..." : "Delete"}
                        </button>
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
