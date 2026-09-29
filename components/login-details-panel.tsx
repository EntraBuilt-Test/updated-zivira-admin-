"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 item 10 / Round 11 item 4 — real Login Details / "Not Login
// Details" report from real LoginEventModel rows. Two genuinely different
// result tables (List mode vs Not-Login mode), matching sanpharma's
// Login_Details.aspx exactly, including its "Filed Force Name" label typo.
const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - 3 + i));

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
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

type ListRow = {
  empCode: string; joiningDate: string | null; fieldForceName: string; designation: string; hq: string;
  reportingTo: string; loginTimestamps: string[]; lastDcrDate: string | null; lastLoginDate: string | null;
  daysBetweenLastDcrAndLogin: number | null;
};

type NotLoginRow = {
  empCode: string; joiningDate: string | null; fieldForceName: string; designation: string; hq: string;
  firstLevelManager: string; secondLevelManager: string; lastDcrDate: string | null; lastLoginDate: string | null;
  durationOfWoLoginDays: number; highlight: boolean;
};

export function LoginDetailsPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fieldForceName, setFieldForceName] = useState("admin");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [withoutVacant, setWithoutVacant] = useState(true);
  const [notLoginEnabled, setNotLoginEnabled] = useState(false);
  const [notLoginDays, setNotLoginDays] = useState("4");
  const [listRows, setListRows] = useState<ListRow[] | null>(null);
  const [notLoginRows, setNotLoginRows] = useState<NotLoginRow[] | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  async function view() {
    setError(null);
    setLoading(true);
    setListRows(null);
    setNotLoginRows(null);
    try {
      const fieldForce = fieldForceName === "admin" ? "" : fieldForceName.split(" - ")[0];
      if (notLoginEnabled) {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - (Number(notLoginDays) || 0));
        const fromIso = from.toISOString().slice(0, 10);
        const toIso = to.toISOString().slice(0, 10);
        setRange({ from: fromIso, to: toIso });
        const res = await apiClient.loginDetails({
          fieldForceName: fieldForce,
          from: fromIso,
          to: toIso,
          withoutVacant: String(withoutVacant),
          notLoginDays,
          mode: "notlogin"
        });
        setNotLoginRows(res.data as unknown as NotLoginRow[]);
      } else {
        const monthIdx = MONTHS.indexOf(month);
        const fromIso = new Date(Date.UTC(Number(year), monthIdx, 1)).toISOString().slice(0, 10);
        const toIso = new Date(Date.UTC(Number(year), monthIdx + 1, 0)).toISOString().slice(0, 10);
        setRange({ from: fromIso, to: toIso });
        const res = await apiClient.loginDetails({
          fieldForceName: fieldForce,
          from: fromIso,
          to: toIso,
          withoutVacant: String(withoutVacant),
          mode: "list"
        });
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
          <div style={{ minWidth: 100 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
            <CustomSelect value={month} options={MONTHS} onChange={setMonth} />
          </div>
          <div style={{ minWidth: 100 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
            <CustomSelect value={year} options={YEARS} onChange={setYear} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withoutVacant}
              onChange={(e) => {
                // Round 11 item 4 — sanpharma treats these two like radio
                // buttons: only one applies to a given View.
                setWithoutVacant(e.target.checked);
                if (e.target.checked) setNotLoginEnabled(false);
              }}
            />
            Without Vacant
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notLoginEnabled}
              onChange={(e) => {
                setNotLoginEnabled(e.target.checked);
                if (e.target.checked) setWithoutVacant(false);
              }}
            />
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
          <h3 className="text-lg font-bold mb-1">Login Details For the Month Of - {month} {year}</h3>
          <p className="text-sm font-medium text-text-muted mb-3">Field Force Name : {fieldForceName}</p>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>Emp Code</th>
                <th style={head}>Joining Date</th>
                <th style={head}>FieldForce Name</th>
                <th style={head}>Designation</th>
                <th style={head}>HQ</th>
                <th style={head}>Reporting to</th>
                <th style={head}>Login Date(MM/DD/YY)</th>
                <th style={head}>Last DCR Date</th>
                <th style={head}>Last Login Date</th>
                <th style={head}>No. of days b/w Last DCR date and Login date</th>
              </tr>
            </thead>
            <tbody>
              {listRows.length === 0 && <tr><td style={cell} colSpan={11}>No Records Found</td></tr>}
              {listRows.map((r, i) => (
                <tr key={r.empCode} style={{ background: i % 2 === 0 ? "#fff7ed" : "#fef3c7" }}>
                  <td style={cell}>{i + 1}</td>
                  <td style={cell}>{r.empCode}</td>
                  <td style={cell}>{fmtDate(r.joiningDate)}</td>
                  <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.hq}</td>
                  <td style={cell}>{r.reportingTo}</td>
                  <td style={{ ...cell, textAlign: "left", whiteSpace: "pre-line" }}>
                    {r.loginTimestamps.length ? r.loginTimestamps.map((t) => fmtDateTime(t)).join("\n") : "-"}
                  </td>
                  <td style={cell}>{fmtDate(r.lastDcrDate)}</td>
                  <td style={cell}>{fmtDate(r.lastLoginDate)}</td>
                  <td style={cell}>{r.daysBetweenLastDcrAndLogin ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {notLoginRows && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-1">
            Not - Login Details (Duration Between {range ? fmtDate(range.from) : ""} and {range ? fmtDate(range.to) : ""})
          </h3>
          <p className="text-xs text-red-600 font-medium mb-3">* Yellow Color Indicates, Whoever Not login in between Selected Dates</p>
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
              {notLoginRows
                .slice()
                .sort((a, b) => b.durationOfWoLoginDays - a.durationOfWoLoginDays)
                .map((r, i) => (
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
        </div>
      )}
    </section>
  );
}
