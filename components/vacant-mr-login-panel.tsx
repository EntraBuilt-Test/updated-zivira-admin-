"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { autoLoginUrl } from "@/lib/portal-urls";
import { Eye, EyeOff } from "lucide-react";

// Standing convention for every employee's Field/Manager portal login —
// see Zivira-Backend-swagger-ui-main/src/utils/credentials.ts:
// username = employee code, password = this fixed value for every
// employee, current and future. Pre-filling it here is applying that known
// convention, not reading back anyone's actual stored password hash (which
// stays a one-way bcrypt hash everywhere, exactly like Change Password).
const DEFAULT_EMPLOYEE_PASSWORD = "Zivirachennai";

/**
 * Real "Vacant MR Login - Access" screen, matching sanpharma.info's
 * MasterFiles/Options/Vacant_MR_Access.aspx layout: a scrollable Field
 * Force Name list on the left, and a Login panel on the right showing
 * Password + "Login To: <selected name>" + a Login button. No table.
 *
 * Selecting a name auto-fills the known default password and shows
 * "Login To". Login calls POST /company/masters/vacantMrLoginAccess/
 * action/login, which now requires and bcrypt-verifies that password
 * against the employee's real account before issuing a real JWT (same
 * signToken() every login uses) gated by an Active row under Vacant MR
 * Login - Permission for MR. On success this opens the employee's real
 * Field or Manager portal in a new tab, already signed in as them.
 */
export function VacantMrLoginPanel({ masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey]);

  const byCode = useMemo(() => new Map(employees.map((e) => [String(e.employeeCode ?? ""), e])), [employees]);
  const sortedEmployees = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  const selected = byCode.get(selectedCode);

  function selectEmployee(code: string) {
    setSelectedCode(code);
    setPassword(DEFAULT_EMPLOYEE_PASSWORD);
    setError(null);
    setSuccess(null);
  }

  async function submit() {
    setError(null);
    setSuccess(null);
    if (!selected) { setError("Select a Field Force Name"); return; }
    if (!password) { setError("Enter the password"); return; }

    setSaving(true);
    try {
      const res = await apiClient.vacantMrLogin({
        employeeCode: String(selected.employeeCode ?? ""),
        password
      });
      setSuccess(`Signed in as ${res.data.employee.name}. Opening their portal…`);
      window.open(autoLoginUrl(res.data.portalType, res.data.token), "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full items-center">
      <div className="w-full" style={{ maxWidth: "820px" }}>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
        <h2 className="text-2xl font-bold text-text-primary">Vacant MR Login - Access</h2>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden w-full" style={{ maxWidth: "820px" }}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="border-r border-border-subtle">
            <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-subtle border-b border-border-subtle">
              Field Force Name
            </div>
            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "360px" }}>
              {sortedEmployees.length === 0 && (
                <div className="px-4 py-6 text-sm text-text-muted">No employees found.</div>
              )}
              {sortedEmployees.map((e) => {
                const code = String(e.employeeCode ?? "");
                const active = code === selectedCode;
                return (
                  <div
                    key={code}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectEmployee(code)}
                    className="px-4 py-2 text-sm cursor-pointer border-b border-border-subtle/60 hover:bg-surface-subtle/60"
                    style={active ? { background: "var(--brand-soft, #eef4ff)", fontWeight: 600 } : undefined}
                  >
                    {String(e.name ?? "")} - {String(e.designation ?? "")} - {String(e.territory ?? "")}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Login</div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</div>}

            <div>
              <span className="block text-xs font-medium text-text-muted mb-1">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  style={{ width: "100%", paddingRight: "2.25rem" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type your own password"
                  autoComplete="new-password"
                  name="vacant-mr-login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-text-muted hover:text-text-primary"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-text-muted mb-1">Login To</span>
              <div className="text-sm text-text-primary font-medium">
                {selected ? `${selected.name} - ${selected.designation} - ${selected.territory}` : "—"}
              </div>
            </div>

            <button className="button" type="button" disabled={saving || !selected} onClick={submit}>
              {saving ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
