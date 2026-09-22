"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

/**
 * Real "Change Password" screen — picks a field-force/employee, sets a new
 * password, and calls POST /company/masters/optionsChangePassword/action/
 * reset, which actually updates that person's bcrypt passwordHash on the
 * real login (UserModel) via the same hashing auth.routes.ts uses. The log
 * table below shows every real reset that action has recorded.
 */
export function ChangePasswordPanel({ masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [logRows, setLogRows] = useState<MasterRecord[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  async function submit() {
    setError(null);
    setSuccess(null);
    if (!selectedName) { setError("Select a Field Force Name"); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    setSaving(true);
    try {
      const res = await apiClient.resetFieldForcePassword({ fieldForceName: selectedName, newPassword });
      setSuccess(`Password reset for ${selectedName} (${res.data.accountsUpdated} login account${res.data.accountsUpdated === 1 ? "" : "s"} updated). They can log in with the new password immediately.`);
      setSelectedName("");
      setNewPassword("");
      setConfirmPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSaving(false);
    }
  }

  const employeeNames = Array.from(new Set(employees.map((e) => String(e.name ?? "")).filter(Boolean))).sort();

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
        <h2 className="text-2xl font-bold text-text-primary">Change Password</h2>
        <p className="text-sm text-text-muted mt-1">Sets a real login password for the selected field force employee.</p>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ maxWidth: "480px" }}>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</div>}

        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect value={selectedName} options={employeeNames} onChange={setSelectedName} placeholder="Select employee" />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">New Password</span>
          <input
            type="password"
            className="input"
            style={{ width: "100%" }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Confirm Password</span>
          <input
            type="password"
            className="input"
            style={{ width: "100%" }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button className="button" type="button" disabled={saving} onClick={submit}>
          {saving ? "Resetting..." : "Reset Password"}
        </button>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "360px" }}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Field Force Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Last Changed On</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Changed By</th>
              </tr>
            </thead>
            <tbody>
              {logRows.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-text-muted text-sm">No password resets yet.</td></tr>
              )}
              {logRows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                  <td className="px-4 py-3 text-sm text-text-primary">{String(row.fieldForceName ?? "")}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{row.lastChangedOn ? new Date(String(row.lastChangedOn)).toLocaleString() : ""}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{String(row.changedBy ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
