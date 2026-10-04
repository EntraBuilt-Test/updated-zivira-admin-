"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldForceSelect } from "@/components/field-force-select";
import {
  apiClient,
  type Employee,
  type TpConsolidatedView,
  type TpViewResult,
  type TpStatusRow,
  type TpDatewiseResult
} from "@/lib/api-client";

// Round 34 -- Activity Reports > TP, real legacy-parity report screens.
// All four panels pull real tour-plan / holiday / weekly-off / leave data
// off the backend's org-hierarchy + day-status utilities (see
// company.routes.ts for the exact endpoint behavior). Kept in our existing
// tile-grid/workspace visual language rather than cloning legacy ASP.NET
// chrome, per the coordinator's explicit instruction.

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - 3 + i);

function monthLabel(month: string) {
  const [y, m] = month.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES[m - 1]} - ${y}`;
}

const DAY_STATUS_BG: Record<string, string> = {
  holiday: "#fde2e2",
  weeklyOff: "#fde2e2",
  leave: "#fff3cd"
};

function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
  }, []);
  return employees;
}

function MonthYearPicker({
  month, year, onMonth, onYear
}: { month: number; year: number; onMonth: (m: number) => void; onYear: (y: number) => void }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Month</span>
        <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={month} onChange={(e) => onMonth(parseInt(e.target.value, 10))}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Year</span>
        <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={year} onChange={(e) => onYear(parseInt(e.target.value, 10))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </>
  );
}

function EmployeePicker({
  employees, value, onChange, label = "FieldForce Name"
}: { employees: Employee[]; value: string; onChange: (v: string) => void; label?: string }) {
  return <FieldForceSelect value={value} onChange={onChange} employees={employees} label={label} />;
}

// ── Item 1 -- TP > Consolidated View ──────────────────────────────────
export function TpConsolidatedViewReport() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [allBaseLevel, setAllBaseLevel] = useState(false);
  const [result, setResult] = useState<TpConsolidatedView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError(""); setViewed(true);
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    try {
      const r = await apiClient.tpConsolidatedView({ employeeCode, month: monthStr, allBaseLevel });
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Consolidated View");
      setResult(null);
    } finally { setLoading(false); }
  }

  const numDays = result ? result.columns[0]?.days.length ?? 0 : 0;

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <EmployeePicker employees={employees} value={employeeCode} onChange={(v) => { setEmployeeCode(v); setViewed(false); }} />
        <MonthYearPicker month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <label className="flex items-center gap-2 h-9 font-body-sm text-body-sm text-text-primary">
          <input type="checkbox" checked={allBaseLevel} onChange={(e) => { setAllBaseLevel(e.target.checked); setViewed(false); }} />
          All Base Level
        </label>
        <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50">
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && !loading && !result && <p className="text-text-muted text-sm">No data for this field rep.</p>}
          {!error && result && (
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b border-border-subtle pb-4">
                <h2 className="font-headline-sm text-headline-sm text-text-primary underline">
                  Tour Plan - Consolidated View for - ({monthLabel(result.month)})
                </h2>
                <p className="font-body-md text-body-md text-status-danger font-semibold">Field Force Name : {result.fieldForceName}</p>
              </div>
              {result.columns.length === 0 && <p className="text-text-muted text-sm">No subordinates found for this field rep / designation / Base Level selection.</p>}
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {result.columns.map((col) => (
                  <div key={col.employeeCode} className="rounded-lg border border-border-subtle overflow-hidden">
                    <div className="px-2 py-1.5 text-center font-label-sm text-label-sm text-white" style={{ background: "var(--brand-primary, #2563eb)" }}>
                      {col.name} - {col.designation} - {col.hq}
                    </div>
                    <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                      <thead className="bg-brand-primary-subtle">
                        <tr><th className="px-2 py-1 w-10">Dt</th><th className="px-2 py-1">Territory Planed</th></tr>
                      </thead>
                      <tbody>
                        {col.days.map((d) => (
                          <tr key={d.day} style={d.kind !== "tour" && d.kind !== "notPlanned" ? { background: DAY_STATUS_BG[d.kind] } : undefined}>
                            <td className="px-2 py-1 border-t border-border-subtle">{d.day}</td>
                            <td className="px-2 py-1 border-t border-border-subtle">{d.kind === "notPlanned" ? "**** Not Planned ****" : d.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
              {numDays > 0 && <p className="text-xs text-text-muted">Showing {numDays} days per column, real tour-plan / holiday / weekly-off / leave data.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item 2 -- TP > View ────────────────────────────────────────────────
export function TpViewReport() {
  const employees = useEmployees();
  const [filterByCode, setFilterByCode] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [result, setResult] = useState<TpViewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  const teamPool = useMemo(() => {
    if (!filterByCode) return employees;
    return employees.filter((e) => e.employeeCode === filterByCode || e.reportingManager === filterByCode);
  }, [employees, filterByCode]);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError(""); setViewed(true);
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    try {
      const r = await apiClient.tpView({ employeeCode, month: monthStr });
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load TP View");
      setResult(null);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <EmployeePicker employees={employees} value={filterByCode} onChange={(v) => { setFilterByCode(v); setEmployeeCode(""); setViewed(false); }} label="Filter By" />
        <EmployeePicker employees={teamPool} value={employeeCode} onChange={(v) => { setEmployeeCode(v); setViewed(false); }} />
        <MonthYearPicker month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50">
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && !loading && !result && <p className="text-text-muted text-sm">No tour plan found for this field rep / month.</p>}
          {!error && result && (
            <div className="space-y-5">
              <div className="text-center space-y-1 border-b border-border-subtle pb-4">
                <h2 className="font-headline-sm text-headline-sm text-text-primary underline">
                  TP View For {result.employee.name} - {result.employee.designation} - {result.employee.hq} for the Month Of - {monthLabel(`${year}-${String(month).padStart(2,"0")}`)}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-body-sm text-body-sm">
                <div><span className="text-text-muted">FieldForce Name: </span><strong>{result.employee.name}</strong></div>
                <div><span className="text-text-muted">HQ: </span><strong>{result.employee.hq}</strong></div>
                <div><span className="text-text-muted">Status: </span><strong className="text-status-danger">{result.status}</strong></div>
                <div><span className="text-text-muted">Completed: </span><strong style={{ color: "#e11d8f" }}>{result.completedAt ? new Date(result.completedAt).toLocaleString("en-IN") : "-"}</strong></div>
                <div><span className="text-text-muted">Confirmed: </span><strong style={{ color: "#15803d" }}>{result.confirmedAt ? new Date(result.confirmedAt).toLocaleString("en-IN") : "-"}</strong></div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border-subtle max-w-md">
                <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                  <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">Particular</th><th className="px-3 py-2">No.of Days</th></tr></thead>
                  <tbody>
                    {[
                      ["HQ days Planned", result.summary.hqDays],
                      ["EX days Planned", result.summary.exDays],
                      ["OS days Planned", result.summary.osDays],
                      ["Holiday & Sunday", result.summary.holidaySunday],
                      ["Others", result.summary.others]
                    ].map(([label, val], i) => (
                      <tr key={String(label)}><td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td><td className="px-3 py-2 border-t border-border-subtle">{label}</td><td className="px-3 py-2 border-t border-border-subtle">{val}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                  <thead className="bg-brand-primary-subtle">
                    <tr>
                      <th className="px-2 py-2">S.No</th><th className="px-2 py-2">Date</th><th className="px-2 py-2">Work Type</th>
                      <th className="px-2 py-2">Territory</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Joint Work</th>
                      <th className="px-2 py-2">Objective</th><th className="px-2 py-2">Manager_JFW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.days.map((d) => (
                      <tr key={d.day}>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.day}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.date}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.workType}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.territory || "-"}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.type || "-"}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.jointWork || "-"}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.objective || "-"}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{d.managerJfw || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item 3 -- TP > Status ───────────────────────────────────────────────
export function TpStatusReport() {
  const employees = useEmployees();
  const [viewBy, setViewBy] = useState<"fieldforce" | "state">("fieldforce");
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [withVacants, setWithVacants] = useState(false);
  const [rows, setRows] = useState<TpStatusRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError(""); setViewed(true);
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    try {
      const r = await apiClient.tpStatus({ employeeCode, month: monthStr, withVacants });
      setRows(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load TP Status");
      setRows(null);
    } finally { setLoading(false); }
  }

  const selectedName = employees.find((e) => e.employeeCode === employeeCode)?.name ?? "";

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <div className="flex items-center gap-4 h-9 font-body-sm text-body-sm text-text-primary">
          <label className="flex items-center gap-1"><input type="radio" checked={viewBy === "fieldforce"} onChange={() => setViewBy("fieldforce")} /> FieldForce-wise</label>
          <label className="flex items-center gap-1"><input type="radio" checked={viewBy === "state"} onChange={() => setViewBy("state")} /> State-wise</label>
        </div>
        <EmployeePicker employees={employees} value={employeeCode} onChange={(v) => { setEmployeeCode(v); setViewed(false); }} />
        <MonthYearPicker month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <label className="flex items-center gap-2 h-9 font-body-sm text-body-sm text-text-primary">
          <input type="checkbox" checked={withVacants} onChange={(e) => { setWithVacants(e.target.checked); setViewed(false); }} />
          With Vacants
        </label>
        <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50">
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {viewBy === "state" && viewed && (
        <p className="text-xs text-status-warning bg-surface-card rounded-xl p-3">
          State-wise grouping has no distinct real concept in this schema beyond each employee&apos;s own `state` field -- showing the same FieldForce-wise direct-report rollup below rather than fabricating a separate state-grouped view.
        </p>
      )}

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && !loading && (!rows || rows.length === 0) && <p className="text-text-muted text-sm">No direct reports found for this field rep.</p>}
          {!error && rows && rows.length > 0 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b border-border-subtle pb-4">
                <h2 className="font-headline-sm text-headline-sm text-text-primary underline">TP - Status for the Month of {monthLabel(`${year}-${String(month).padStart(2,"0")}`)}</h2>
                <p className="font-body-md text-body-md text-status-danger font-semibold">Field Force Name : {selectedName}   Month : {MONTH_NAMES[month-1]}   Year : {year}</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                  <thead className="bg-brand-primary-subtle">
                    <tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">FieldForce Name</th><th className="px-3 py-2">Designation</th><th className="px-3 py-2">Hq</th><th className="px-3 py-2">Emp_Id</th><th className="px-3 py-2">Tp Status</th><th className="px-3 py-2">Tp Entry_Date</th><th className="px-3 py-2">Tp Approved_Date</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.employeeCode}>
                        <td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td>
                        <td className="px-3 py-2 border-t border-border-subtle">{r.name}</td>
                        <td className="px-3 py-2 border-t border-border-subtle">{r.designation}</td>
                        <td className="px-3 py-2 border-t border-border-subtle">{r.hq}</td>
                        <td className="px-3 py-2 border-t border-border-subtle">{r.employeeCode}</td>
                        <td className="px-3 py-2 border-t border-border-subtle">{r.status}</td>
                        <td className="px-3 py-2 border-t border-border-subtle">{r.entryDate ? new Date(r.entryDate).toLocaleDateString("en-IN") : "-"}</td>
                        <td className="px-3 py-2 border-t border-border-subtle">{r.approvedDate ? new Date(r.approvedDate).toLocaleDateString("en-IN") : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item 4 -- Tour Plan > Datewise ──────────────────────────────────────
export function TpDatewiseReport() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [result, setResult] = useState<TpDatewiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  function toggleDay(d: number) {
    setSelectedDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)));
    setViewed(false);
  }

  async function handleView() {
    if (!employeeCode || selectedDays.length === 0) return;
    setLoading(true); setError(""); setViewed(true);
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    try {
      const r = await apiClient.tpDatewise({ employeeCode, month: monthStr, days: selectedDays });
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Tour Plan Datewise");
      setResult(null);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-5">
          <EmployeePicker employees={employees} value={employeeCode} onChange={(v) => { setEmployeeCode(v); setViewed(false); }} />
          <MonthYearPicker month={month} year={year} onMonth={setMonth} onYear={setYear} />
          <button type="button" onClick={handleView} disabled={!employeeCode || selectedDays.length === 0 || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50">
            {loading ? "Loading..." : "View"}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Day</span>
          {/* Round 36 Item 3 -- replaced the bare checkbox+number row with
              clickable calendar-style day tiles; selected state is the
              tile's own filled background, matching our tile-grid pattern
              elsewhere. Same selectedDays array/behavior underneath. */}
          <div className="grid gap-1.5 max-w-xl" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const active = selectedDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium border transition-colors ${active ? "bg-primary text-on-primary border-primary" : "bg-surface-canvas text-text-primary border-border-subtle hover:bg-surface-subtle"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && !loading && !result && <p className="text-text-muted text-sm">No data for this field rep.</p>}
          {!error && result && (
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b border-border-subtle pb-4">
                <h2 className="font-headline-sm text-headline-sm text-text-primary underline">Tour Plan Datewise of {monthLabel(result.month)}</h2>
                <p className="font-body-md text-body-md text-status-danger font-semibold">Filed Force Name : {result.fieldForceName}</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                  <thead className="bg-brand-primary-subtle">
                    <tr>
                      <th className="px-2 py-2">S.No</th><th className="px-2 py-2">State</th><th className="px-2 py-2">Employee Code</th>
                      <th className="px-2 py-2">FieldForce Name</th><th className="px-2 py-2">Designation</th><th className="px-2 py-2">HQ</th><th className="px-2 py-2">Joining Date</th>
                      {result.days.map((d) => <th key={d} className="px-2 py-2 text-center">{monthLabel(result.month)} - {d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r, i) => (
                      <tr key={r.employeeCode}>
                        <td className="px-2 py-1 border-t border-border-subtle">{i + 1}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.state || "-"}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.employeeCode}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.name}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.designation}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.hq}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.joinDate ? new Date(r.joinDate).toLocaleDateString("en-IN") : "-"}</td>
                        {result.days.map((d) => (
                          <td key={d} className="px-2 py-1 border-t border-border-subtle text-center" style={r.perDay[d] && (r.perDay[d].kind === "holiday" || r.perDay[d].kind === "weeklyOff") ? { background: "#fde2e2" } : undefined}>
                            {r.perDay[d]?.label || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
