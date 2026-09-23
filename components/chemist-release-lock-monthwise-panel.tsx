"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "chemistReleaseLockMonthwise";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 2027 - 2016 + 1 }, (_, i) => String(2016 + i));

// Matches sanpharma.info's "Update/Delete > Chemist - Release/Lock
// (Month-wise)" screen: Field Force Name / Month / Year dropdown filters
// with a Go button — no Add button — and a results table (Sf Name / HQ /
// Designation / Emp Code / Release) with a per-row Release checkbox and an
// Update button that persists the change for real via the generic masters
// PUT endpoint.
export function ChemistReleaseLockMonthwisePanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [allRows, setAllRows] = useState<MasterRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftRelease, setDraftRelease] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  // Designation / Emp Code come from the employee master (sanpharma's own
  // computed columns), never stored on the chemistReleaseLockMonthwise record.
  const employeeByName = useMemo(() => {
    const map = new Map<string, MasterRecord>();
    for (const e of employees) map.set(String(e.name ?? ""), e);
    return map;
  }, [employees]);

  async function go() {
    setError(null);
    setSearched(true);
    setLoading(true);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setAllRows(res.data);
      const drafts: Record<string, boolean> = {};
      res.data.forEach((r) => { drafts[r.id] = String(r.release ?? "No") === "Yes"; });
      setDraftRelease(drafts);
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
      if (month && String(r.month ?? "") !== month) return false;
      if (year && String(r.year ?? "") !== year) return false;
      return true;
    });
  }, [allRows, fieldForceName, month, year]);

  async function updateRelease(id: string) {
    setSavingId(id);
    setError(null);
    try {
      const value = draftRelease[id] ? "Yes" : "No";
      await apiClient.updateMasterRecord(MASTER_KEY, id, { release: value });
      setAllRows((prev) => prev.map((r) => (r.id === id ? { ...r, release: value } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">Chemist - Release/Lock (Month-wise)</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "220px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect
            value={fieldForceName}
            options={employeeOptions.map((e) => String(e.name ?? ""))}
            onChange={setFieldForceName}
            placeholder="All"
          />
        </div>
        <div style={{ minWidth: "160px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
          <CustomSelect value={month} options={MONTHS} onChange={setMonth} placeholder="All Months" />
        </div>
        <div style={{ minWidth: "120px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={year} options={YEARS} onChange={setYear} placeholder="All Years" />
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
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Sf Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Designation</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Emp Code</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Month</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Year</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Release</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Update</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rows.map((row) => {
                  const emp = employeeByName.get(String(row.fieldForceName ?? ""));
                  return (
                  <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.fieldForceName ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(emp?.designation ?? row.designation ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(emp?.employeeCode ?? row.empCode ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.month ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.year ?? "")}</td>
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={!!draftRelease[row.id]}
                        onChange={(e) => setDraftRelease((prev) => ({ ...prev, [row.id]: e.target.checked }))}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button className="button-secondary" type="button" disabled={savingId === row.id} onClick={() => updateRelease(row.id)}>
                        {savingId === row.id ? "Saving..." : "Update"}
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
