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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  // HQ / Designation come from the employee master (sanpharma's own
  // computed columns), never stored on the deviceIdDeletion record itself.
  // Round 12 item 5 — the row's stored fieldForceName can differ from the
  // real Employee.name by case/whitespace only, which silently dropped the
  // row from both this lookup and the Go-button filter below even though
  // the employee genuinely exists — normalize both sides of the match.
  function normalizeName(v: string): string {
    return v.trim().toLowerCase().replace(/\s+/g, " ");
  }
  const employeeByName = useMemo(() => {
    const map = new Map<string, MasterRecord>();
    for (const e of employees) map.set(normalizeName(String(e.name ?? "")), e);
    return map;
  }, [employees]);

  async function go() {
    setError(null);
    setSearched(true);
    setLoading(true);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      const all = res.data;
      const filtered = fieldForceName
        ? all.filter((r) => normalizeName(String(r.fieldForceName ?? "")) === normalizeName(fieldForceName))
        : all;
      setRows(filtered);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected device id record(s) permanently?`)) return;
    setDeleting(true);
    setError(null);
    try {
      const ids = Array.from(selected);
      for (const id of ids) {
        await apiClient.deleteMasterRecord(MASTER_KEY, id);
      }
      setRows((prev) => prev.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record(s)");
    } finally {
      setDeleting(false);
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
          <span className="block text-xs font-medium text-text-muted mb-1">FieldForce Name</span>
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
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-subtle sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">S.No</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={rows.length === 0} />
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Employee Id</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">FieldForce Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">HQ</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Designation</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                  )}
                  {rows.map((row, idx) => {
                    const emp = employeeByName.get(normalizeName(String(row.fieldForceName ?? "")));
                    return (
                      <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                        <td className="px-4 py-3 text-sm text-text-primary">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(emp?.employeeCode ?? row.employeeId ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(row.fieldForceName ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(emp?.territory ?? row.hq ?? "")}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{String(emp?.designation ?? row.designation ?? "")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button className="button" type="button" disabled={deleting || selected.size === 0} onClick={handleDelete}>
              {deleting ? "Deleting..." : `Delete${selected.size ? ` (${selected.size})` : ""}`}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
