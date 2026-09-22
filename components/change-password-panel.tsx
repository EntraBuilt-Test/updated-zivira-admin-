"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

/**
 * Real "Password Maintenance" screen, matching sanpharma.info's
 * MasterFiles/Options/ChangePassword.aspx exactly: FieldForce Name (a
 * "Team" grouping dropdown + a searchable "NAME - DESIGNATION -
 * TERRITORY" employee dropdown — the same format and fetch logic as the
 * FieldForceDropdown already used on the Options Dashboard, see
 * components/options-dashboard-panel.tsx), Old Password, New Password,
 * Confirm Password, and just two buttons — Save and Clear. No Add
 * button, no table, no list: this is a pure action form, on purpose.
 *
 * "Team" is grouped by each employee's real `reportingManager` field
 * (Employee Master already has it — see packages/types Employee.
 * reportingManager, and ManagerDashboard.team = the employees reporting
 * to a manager) — the closest honest real grouping this schema has for
 * "which team a field-force person belongs to". Picking a Team here
 * filters the employee dropdown to that manager's reports.
 *
 * Save calls POST /company/masters/optionsChangePassword/action/reset,
 * which now requires and verifies Old Password with a real bcrypt.compare
 * against the target employee's actual UserModel.passwordHash before
 * changing anything, then bcrypt-hashes and stores New Password on that
 * same account — the same hashing auth.routes.ts's own login/change-
 * password already use — so the employee can log into their real
 * Field/Manager portal with the new password right after.
 */
export function ChangePasswordPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Bumped on every Clear (and after a successful Save) so the employee
  // dropdown below fully remounts — not just has its value prop reset —
  // clearing its own internal open/search state too. This is the exact
  // "Clear button stuck" failure mode from earlier in this codebase: a
  // dropdown whose *value* prop was cleared but whose internal open/query
  // state was not, so it looked unchanged until clicked again.
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  // "Team" options: distinct real reportingManager values on the Employee
  // Master, sorted. Selecting one filters the FieldForce Name dropdown to
  // that manager's real reports.
  const teamOptions = useMemo(
    () => Array.from(new Set(employees.map((e) => String(e.reportingManager ?? "")).filter(Boolean))).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(
    () => (selectedTeam ? employees.filter((e) => String(e.reportingManager ?? "") === selectedTeam) : employees),
    [employees, selectedTeam]
  );

  function resetForm() {
    setSelectedTeam("");
    setSelectedEmployeeCode("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
    setFormResetKey((k) => k + 1);
  }

  function handleTeamChange(team: string) {
    setSelectedTeam(team);
    // Selected employee may no longer be in the filtered team — matches
    // sanpharma.info's own behavior of the FieldForce Name dropdown
    // re-populating (and losing its prior pick) whenever Team changes.
    setSelectedEmployeeCode("");
  }

  async function submit() {
    setError(null);
    setSuccess(null);

    const employee = employees.find((e) => e.employeeCode === selectedEmployeeCode);
    if (!employee) { setError("Select a FieldForce Name"); return; }
    if (!oldPassword) { setError("Enter the Old Password"); return; }
    if (newPassword.length < 6) { setError("New Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("New Password and Confirm Password do not match"); return; }

    setSaving(true);
    try {
      await apiClient.resetFieldForcePassword({
        employeeCode: employee.employeeCode,
        oldPassword,
        newPassword
      });
      setSuccess(`Password changed for ${employee.name}. They can log in with the new password immediately.`);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
        <h2 className="text-2xl font-bold text-text-primary">Password Maintenance</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ maxWidth: "620px" }}>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</div>}

        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">FieldForce Name</span>
          <div className="flex items-center gap-2">
            <div style={{ width: "160px", flexShrink: 0 }}>
              <CustomSelect value={selectedTeam} options={teamOptions} onChange={handleTeamChange} placeholder="Team" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <FieldForceEmployeeDropdown
                key={formResetKey}
                employees={filteredEmployees}
                value={selectedEmployeeCode}
                onChange={setSelectedEmployeeCode}
              />
            </div>
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Old Password</span>
          <input
            type="password"
            className="input"
            style={{ width: "100%" }}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">New Password</span>
          <input
            type="password"
            className="input"
            style={{ width: "100%" }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

        <div className="flex items-center gap-3">
          <button className="button" type="button" disabled={saving} onClick={submit}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="button" type="button" onClick={resetForm}>
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}

// Searchable "NAME - DESIGNATION - TERRITORY" FieldForce dropdown — same
// fetch shape (Employee[] from apiClient.employees()) and exact label
// format as the FieldForceDropdown in components/options-dashboard-panel.tsx,
// reproduced here rather than imported since that one is a private,
// unexported helper local to that file.
function FieldForceEmployeeDropdown({
  employees,
  value,
  onChange
}: {
  employees: Employee[];
  value: string;
  onChange: (employeeCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = employees.find((e) => e.employeeCode === value);
  const label = selected ? `${selected.name} - ${selected.designation} - ${selected.territory}` : "";

  const filtered = employees.filter((e) =>
    `${e.name} ${e.designation} ${e.territory}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        className="input flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label || "Select employee"}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
            background: "var(--panel, #fff)", border: "1px solid var(--border, #ddd)", borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: 320, overflowY: "auto"
          }}
        >
          <div style={{ padding: 8, borderBottom: "1px solid var(--border, #eee)", display: "flex", alignItems: "center", gap: 6 }}>
            <Search size={14} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search field force..."
              style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent", color: "inherit" }}
            />
          </div>
          {filtered.map((e) => (
            <div
              key={e.employeeCode}
              role="button"
              tabIndex={0}
              onClick={() => { onChange(e.employeeCode); setOpen(false); setQuery(""); }}
              style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: e.employeeCode === value ? 700 : 400, background: e.employeeCode === value ? "var(--brand-soft, #eef4ff)" : "transparent" }}
            >
              {e.name} - {e.designation} - {e.territory}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 12, fontSize: 12, color: "var(--muted, #888)" }}>No matches</div>}
        </div>
      )}
    </div>
  );
}
