"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

/**
 * Real "Vacant MR Login - Access" screen. Calls POST /company/masters/
 * vacantMrLoginAccess/action/login, which is gated by an Active row in
 * Vacant MR Login - Permission for MR and, if granted, issues a REAL JWT
 * for the selected field-force employee (the same signToken() every real
 * login uses). The token is shown so Admin can use it against the Field
 * portal's API directly (e.g. paste it into Swagger's Authorize button, or
 * a "?token=" deep link) — this build does not have a separate embedded
 * Field-portal shell to auto-launch, so the token itself is the
 * deliverable, exactly like a real backend session hand-off would look.
 */
export function VacantMrLoginPanel({ masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [logRows, setLogRows] = useState<MasterRecord[]>([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [issuedFor, setIssuedFor] = useState<string | null>(null);

  async function load() {
    const [empRes, logRes] = await Promise.all([
      apiClient.masterRecords("employees"),
      apiClient.masterRecords(masterKey)
    ]);
    setEmployees(empRes.data);
    setLogRows(logRes.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey]);

  const byName = new Map(employees.map((e) => [String(e.name ?? ""), e]));
  const employeeNames = Array.from(byName.keys()).filter(Boolean).sort();

  async function submit() {
    setError(null);
    setIssuedToken(null);
    const emp = byName.get(selectedCode);
    if (!emp) { setError("Select a Field Force Name"); return; }

    setSaving(true);
    try {
      const res = await apiClient.vacantMrLogin({ employeeCode: String(emp.employeeCode ?? "") });
      setIssuedToken(res.data.token);
      setIssuedFor(res.data.employee.name);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue vacant login");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
        <h2 className="text-2xl font-bold text-text-primary">Vacant MR Login - Access</h2>
        <p className="text-sm text-text-muted mt-1">
          Issues a real login session token for a field-force employee, gated by an Active row under
          Vacant MR Login - Permission for MR.
        </p>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ maxWidth: "520px" }}>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {issuedToken && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 break-all">
            Session token issued for <strong>{issuedFor}</strong>. Use this bearer token against the Field portal API:
            <div className="mt-2 font-mono text-xs bg-white border border-green-200 rounded p-2 select-all">{issuedToken}</div>
          </div>
        )}

        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect value={selectedCode} options={employeeNames} onChange={setSelectedCode} placeholder="Select employee" />
        </div>
        <button className="button" type="button" disabled={saving} onClick={submit}>
          {saving ? "Logging in..." : "Login"}
        </button>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "360px" }}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Field Force Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Last Accessed On</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Accessed By</th>
              </tr>
            </thead>
            <tbody>
              {logRows.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-text-muted text-sm">No vacant logins yet.</td></tr>
              )}
              {logRows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                  <td className="px-4 py-3 text-sm text-text-primary">{String(row.fieldForceName ?? "")}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{row.lastAccessedOn ? new Date(String(row.lastAccessedOn)).toLocaleString() : ""}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{String(row.accessedBy ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
