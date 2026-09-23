"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "deviceIdDeletion";

// Matches sanpharma.info's "Update/Delete > Mobile App - Device Id
// Deletion" screen: a Field Force Name dropdown filter with a Go button —
// no Add button — and a results table with a real Delete button per row.
// Delete calls the hard-delete endpoint (DELETE /company/masters/:key/:id,
// restricted server-side to this master and Mail Delete), not the usual
// soft-deactivate every other master uses, matching sanpharma's own
// "Delete" action on this specific screen.
export function DeviceIdDeletionPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [rows, setRows] = useState<MasterRecord[]>([]);
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

  // HQ / Designation come from the employee master (sanpharma's own
  // computed columns), never stored on the deviceIdDeletion record itself.
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
      const all = res.data;
      const filtered = fieldForceName ? all.filter((r) => String(r.fieldForceName ?? "") === fieldForceName) : all;
      setRows(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this device id record permanently?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await apiClient.deleteMasterRecord(MASTER_KEY, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">Mobile App - Device Id Deletion</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "240px" }}>
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
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Field Force Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">HQ</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Designation</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Device Id</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Delete</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rows.map((row) => {
                  const emp = employeeByName.get(String(row.fieldForceName ?? ""));
                  return (
                  <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.fieldForceName ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(emp?.territory ?? row.hq ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(emp?.designation ?? row.designation ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.deviceId ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.status ?? "")}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="button-secondary" type="button" disabled={deletingId === row.id} onClick={() => handleDelete(row.id)}>
                        {deletingId === row.id ? "Deleting..." : "Delete"}
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
