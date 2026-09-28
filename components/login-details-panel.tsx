"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 item 10 — real Login Details / "Not Login Details" report, from
// LoginEventModel rows recorded on every successful login going forward
// (see auth.routes.ts / login-event.model.ts). An employee with no recorded
// login shows a real blank "-" rather than a fabricated date.
const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

function fmtDate(v: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function fmtDateTime(v: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.toLocaleDateString("en-GB").replace(/\//g, "-")} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

type ListRow = {
  empCode: string; joiningDate: string | null; fieldForceName: string; designation: string; hq: string;
  firstLevelManager: string; secondLevelManager: string; loginTimestamps: string[];
};

type NotLoginRow = {
  empCode: string; joiningDate: string | null; fieldForceName: string; designation: string; hq: string;
  firstLevelManager: string; secondLevelManager: string; lastDcrDate: string | null; lastLoginDate: string | null;
  durationOfWoLoginDays: number; highlight: boolean;
};

export function LoginDetailsPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Round 10 item 3 — Field Force Name was only ever populated after the
  // panel's own View/Search action ran, so the dropdown showed nothing
  // until then (and never, if that action is gated behind another required
  // field). Prefetch on mount like every other populated dropdown does.
  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const [fieldForceName, setFieldForceName] = useState("admin");
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [withoutVacant, setWithoutVacant] = useState(false);
  const [notLoginEnabled, setNotLoginEnabled] = useState(true);
  const [notLoginDays, setNotLoginDays] = useState("4");
  const [listRows, setListRows] = useState<ListRow[] | null>(null);
  const [notLoginRows, setNotLoginRows] = useState<NotLoginRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function view() {
    setError(null);
    setLoading(true);
    setListRows(null);
    setNotLoginRows(null);
    try {
      const empRes = employees.length ? { data: employees } : await apiClient.employees();
      setEmployees(empRes.data);
      const params = {
        fieldForceName: fieldForceName === "admin" ? "" : fieldForceName.split(" - ")[0],
        from,
        to,
        withoutVacant: String(withoutVacant)
      };
      if (notLoginEnabled) {
        const res = await apiClient.loginDetails({ ...params, notLoginDays, mode: "notlogin" });
        setNotLoginRows(res.data as unknown as NotLoginRow[]);
      } else {
        const res = await apiClient.loginDetails({ ...params, mode: "list" });
        setListRows(res.data as unknown as ListRow[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Login Details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">Login Details</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-3 w-full">
        <div className="flex flex-wrap items-end gap-3">
          <div style={{ minWidth: "260px" }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Filed Force Name</span>
            <CustomSelect
              value={fieldForceName}
              options={["admin", ...employees.map(employeeLabel)]}
              onChange={setFieldForceName}
              placeholder="admin"
            />
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">*From</span>
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">*To</span>
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={withoutVacant} onChange={(e) => setWithoutVacant(e.target.checked)} />
            Without Vacant
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notLoginEnabled} onChange={(e) => setNotLoginEnabled(e.target.checked)} />
            Whoever Not login more than....
            <input
              className="input"
              style={{ width: 56, color: "#dc2626", fontWeight: 700, textAlign: "center", padding: "2px 4px" }}
              value={notLoginDays}
              onChange={(e) => setNotLoginDays(e.target.value.replace(/[^0-9]/g, ""))}
              disabled={!notLoginEnabled}
            />
            Days.
          </label>
          <button className="button" type="button" onClick={view} disabled={loading}>
            {loading ? "Loading..." : "View"}
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {listRows && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3">Login Details ({from} to {to})</h3>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>Emp Code</th>
                <th style={head}>Joining Date</th>
                <th style={head}>FieldForce Name</th>
                <th style={head}>Designation</th>
                <th style={head}>HQ</th>
                <th style={head}>First Level Manager</th>
                <th style={head}>Second Level Manager</th>
                <th style={head}>Login Timestamps</th>
              </tr>
            </thead>
            <tbody>
              {listRows.length === 0 && <tr><td style={cell} colSpan={9}>No Records Found</td></tr>}
              {listRows.map((r, i) => (
                <tr key={r.empCode}>
                  <td style={cell}>{i + 1}</td>
                  <td style={cell}>{r.empCode}</td>
                  <td style={cell}>{fmtDate(r.joiningDate)}</td>
                  <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.hq}</td>
                  <td style={cell}>{r.firstLevelManager}</td>
                  <td style={cell}>{r.secondLevelManager}</td>
                  <td style={{ ...cell, textAlign: "left" }}>
                    {r.loginTimestamps.length
                      ? r.loginTimestamps.map((t) => fmtDateTime(t)).join(", ")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {notLoginRows && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3">Not - Login Details (Duration Between {from} and {to})</h3>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>Emp Code</th>
                <th style={head}>Joining Date</th>
                <th style={head}>FieldForce Name</th>
                <th style={head}>Designation</th>
                <th style={head}>HQ</th>
                <th style={head}>First Level Manager</th>
                <th style={head}>Second Level Manager</th>
                <th style={head}>Last DCR Date</th>
                <th style={head}>Last Login Date</th>
                <th style={head}>Duration of WO Login Days</th>
              </tr>
            </thead>
            <tbody>
              {notLoginRows.length === 0 && <tr><td style={cell} colSpan={11}>No Records Found</td></tr>}
              {notLoginRows.map((r, i) => (
                <tr key={r.empCode} style={r.highlight ? { background: "#fef9c3" } : undefined}>
                  <td style={cell}>{i + 1}</td>
                  <td style={cell}>{r.empCode}</td>
                  <td style={cell}>{fmtDate(r.joiningDate)}</td>
                  <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.hq}</td>
                  <td style={cell}>{r.firstLevelManager}</td>
                  <td style={cell}>{r.secondLevelManager}</td>
                  <td style={cell}>{fmtDate(r.lastDcrDate)}</td>
                  <td style={cell}>{fmtDate(r.lastLoginDate)}</td>
                  <td style={{ ...cell, color: "#dc2626", fontWeight: 700 }}>{r.durationOfWoLoginDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-text-muted mt-2">* Yellow Color Indicates more than double the threshold days without login.</p>
        </div>
      )}
    </section>
  );
}
