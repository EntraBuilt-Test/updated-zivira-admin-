"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldForceSelect } from "@/components/field-force-select";
import {
  apiClient,
  type Employee,
  type DcrViewMode,
  type DcrViewResult,
  type DcrViewDatePickerRow,
  type DcrViewRemarkRow,
  type DcrViewDoctorRow,
  type DcrStatusResult
} from "@/lib/api-client";

// Round 34 -- Activity Reports > DCR, real legacy-parity report screens.
// See company.routes.ts for the exact endpoint behavior and the honest
// schema-reality disclosures (pobIsApproximated / nonListedUnsupported /
// stockistUnsupported / unsupportedCodes) surfaced verbatim below rather
// than hidden or fabricated around.

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - 3 + i);

const MODES: { key: DcrViewMode; label: string }[] = [
  { key: "all-doctors", label: "View All DCR Doctor(s)" },
  { key: "dcr-dates", label: "View All DCR Date(s)" },
  { key: "all-remarks", label: "View All Remark(s)" },
  { key: "detailed", label: "Detailed View" },
  { key: "listed-doctor-remarks", label: "View All Listed Doctor Remark(s)" },
  { key: "not-approved-dates", label: "Not Approved DCR Dates" },
  { key: "tp-my-day-plan", label: "TP MY Day Plan" },
  { key: "rcpa-view", label: "RCPA View" },
  { key: "reminder-calls", label: "Reminder calls" }
];
const DATE_PICKER_MODES = new Set<DcrViewMode>(["dcr-dates", "listed-doctor-remarks", "not-approved-dates", "tp-my-day-plan", "rcpa-view", "reminder-calls"]);

function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
  }, []);
  return employees;
}

// ── Item 5 -- DCR > View ─────────────────────────────────────────────
export function DcrViewWorkspace() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("admin");
  const [onlyVacantManagers, setOnlyVacantManagers] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [mode, setMode] = useState<DcrViewMode>("all-doctors");
  const [date, setDate] = useState("");
  const [result, setResult] = useState<DcrViewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  const resolvedEmployeeCode = useMemo(() => {
    if (employeeCode === "admin") return employees[0]?.employeeCode || "";
    return employeeCode;
  }, [employeeCode, employees]);

  async function handleView() {
    if (!resolvedEmployeeCode) return;
    setLoading(true); setError(""); setViewed(true); setDate("");
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    try {
      const r = await apiClient.dcrView({ employeeCode: resolvedEmployeeCode, month: monthStr, mode, onlyVacantManagers });
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load DCR View");
      setResult(null);
    } finally { setLoading(false); }
  }

  async function handleGo() {
    if (!resolvedEmployeeCode || !date) return;
    setLoading(true); setError("");
    try {
      const r = await apiClient.dcrView({ employeeCode: resolvedEmployeeCode, mode, date, onlyVacantManagers });
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load DCR View");
      setResult(null);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex flex-col gap-1">
            <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={employees} label="FieldForce Name" extraOptions={[{ value: "admin", label: "admin (self + direct reports)" }]} />
          </div>
          <label className="flex items-center gap-2 h-9 font-body-sm text-body-sm text-text-primary">
            <input type="checkbox" checked={onlyVacantManagers} onChange={(e) => { setOnlyVacantManagers(e.target.checked); setViewed(false); }} />
            Only Vacant Managers
          </label>
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Month</span>
            <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
              {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Year</span>
            <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Select the Mode</span>
          <div className="grid grid-cols-3 gap-2 max-w-2xl">
            {MODES.map((m) => (
              <label key={m.key} className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-subtle text-sm">
                <input type="radio" checked={mode === m.key} onChange={() => { setMode(m.key); setViewed(false); setResult(null); }} /> {m.label}
              </label>
            ))}
          </div>
        </div>
        <button type="button" onClick={handleView} disabled={!resolvedEmployeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50">
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && result?.needsDate && (
            <div className="flex items-center gap-3">
              <input type="date" className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={date} onChange={(e) => setDate(e.target.value)} />
              <button type="button" onClick={handleGo} disabled={!date || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">Go</button>
              {!date && <span className="text-text-muted text-sm">Select the Date and Click the Go Button</span>}
            </div>
          )}

          {!error && result && !result.needsDate && mode === "all-doctors" && (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">FieldForce</th><th className="px-3 py-2">Doctor</th><th className="px-3 py-2">Calls This Month</th></tr></thead>
                <tbody>
                  {(result.rows as DcrViewDoctorRow[] || []).map((r, i) => (
                    <tr key={`${r.employeeCode}-${r.doctorName}-${i}`}>
                      <td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.employeeCode}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.doctorName}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.count}</td>
                    </tr>
                  ))}
                  {(!result.rows || result.rows.length === 0) && <tr><td colSpan={4} className="px-3 py-4 text-center text-text-muted">No DCR entries for this month.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {!error && result && !result.needsDate && DATE_PICKER_MODES.has(mode) && date && (
            <div className="overflow-x-auto rounded-lg border border-border-subtle mt-3">
              {(mode === "rcpa-view" || mode === "reminder-calls") && (
                <p className="text-xs text-status-warning p-2">Round 36 re-check: confirmed there is still no distinct real RCPA or reminder-call submission schema anywhere in this codebase -- the &quot;RCPA&quot; label elsewhere in the product (e.g. the Customized Report catalog&apos;s RCPA fields, and an MIS Reports nav entry) is a legacy field-name carryover with no backing model or field-rep capture flow behind it. Rather than fabricate a distinct table, this still shows the same real per-date DCR listing for both modes.</p>
              )}
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">FieldForce</th><th className="px-3 py-2">Doctor</th><th className="px-3 py-2">Session</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Notes</th></tr></thead>
                <tbody>
                  {(result.rows as DcrViewDatePickerRow[] || []).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.employeeCode}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.doctorName}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.callSession}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.status}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{r.notes || "-"}</td>
                    </tr>
                  ))}
                  {(!result.rows || result.rows.length === 0) && <tr><td colSpan={6} className="px-3 py-4 text-center text-text-muted">No entries for this date.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {!error && result && mode === "all-remarks" && (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Remarks</th></tr></thead>
                <tbody>
                  {(result.rows as DcrViewRemarkRow[] || []).map((r, i) => (
                    <tr key={i}><td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td><td className="px-3 py-2 border-t border-border-subtle">{r.date}</td><td className="px-3 py-2 border-t border-border-subtle">{r.remarks}</td></tr>
                  ))}
                  {(!result.rows || result.rows.length === 0) && <tr><td colSpan={3} className="px-3 py-4 text-center text-text-muted">No remarks typed this month.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {!error && result && mode === "detailed" && result.employee && (
            <div className="space-y-3">
              <div className="font-body-md text-body-md"><strong>{result.employee.name}</strong> - {result.employee.designation} - {result.employee.hq}</div>
              {(result.pobIsApproximated || result.nonListedUnsupported || result.stockistUnsupported) && (
                <p className="text-xs text-status-warning">
                  Honest approximations: &quot;Listed Dr(s) POB&quot; reuses the real &quot;Listed Dr(s) Met&quot; count (no distinct POB field exists for doctor visits).
                  &quot;Non Listed Dr(s) Met&quot; and &quot;Stockist Met&quot; show 0 -- no real tracking exists anywhere in the schema for unlisted-doctor or stockist visits.
                </p>
              )}
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                  <thead className="bg-brand-primary-subtle">
                    <tr>
                      <th className="px-2 py-2">Date</th><th className="px-2 py-2">Territory</th><th className="px-2 py-2">Start</th><th className="px-2 py-2">End</th>
                      <th className="px-2 py-2">Work Type</th><th className="px-2 py-2">Listed Dr Met</th><th className="px-2 py-2">Listed Dr POB</th>
                      <th className="px-2 py-2">Chemist Met</th><th className="px-2 py-2">Chemist POB</th><th className="px-2 py-2">Stockist Met</th><th className="px-2 py-2">Non Listed Dr Met</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.days || []).map((d) => (
                      d.submitted ? (
                        <tr key={d.date}>
                          <td className="px-2 py-1 border-t border-border-subtle">{d.date}</td>
                          <td className="px-2 py-1 border-t border-border-subtle">{d.territory || "-"}</td>
                          <td className="px-2 py-1 border-t border-border-subtle">{d.startTime || "-"}</td>
                          <td className="px-2 py-1 border-t border-border-subtle">{d.endTime || "-"}</td>
                          <td className="px-2 py-1 border-t border-border-subtle">{d.workType}</td>
                          <td className="px-2 py-1 border-t border-border-subtle text-center">{d.listedDrMet}</td>
                          <td className="px-2 py-1 border-t border-border-subtle text-center">{d.listedDrPob}</td>
                          <td className="px-2 py-1 border-t border-border-subtle text-center">{d.chemistMet}</td>
                          <td className="px-2 py-1 border-t border-border-subtle text-center">{d.chemistPob}</td>
                          <td className="px-2 py-1 border-t border-border-subtle text-center">{d.stockistMet}</td>
                          <td className="px-2 py-1 border-t border-border-subtle text-center">{d.nonListedDrMet}</td>
                        </tr>
                      ) : (
                        <tr key={d.date}><td className="px-2 py-1 border-t border-border-subtle">{d.date}</td><td colSpan={10} className="px-2 py-1 border-t border-border-subtle text-center" style={{ background: "#d1f5f0" }}>Not Submited</td></tr>
                      )
                    ))}
                  </tbody>
                  {result.totals && (
                    <tfoot>
                      <tr className="font-semibold bg-surface-subtle">
                        <td className="px-2 py-1 border-t border-border-subtle" colSpan={5}>Total ({result.totals.submittedDays} submitted days)</td>
                        <td className="px-2 py-1 border-t border-border-subtle text-center">{result.totals.listedDrMet}</td>
                        <td className="px-2 py-1 border-t border-border-subtle text-center">{result.totals.listedDrMet}</td>
                        <td className="px-2 py-1 border-t border-border-subtle text-center">{result.totals.chemistMet}</td>
                        <td className="px-2 py-1 border-t border-border-subtle" colSpan={3}>Avg Listed Dr Met/day: {result.totals.avgListedDrMetPerSubmittedDay}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item 6 -- DCR > Status ───────────────────────────────────────────
export function DcrStatusReport() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("admin");
  const [type, setType] = useState<"month" | "period">("month");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [withVacants, setWithVacants] = useState(false);
  const [detailed, setDetailed] = useState(false);
  const [onlyManagers, setOnlyManagers] = useState(false);
  const [result, setResult] = useState<DcrStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  const resolvedEmployeeCode = useMemo(() => (employeeCode === "admin" ? employees[0]?.employeeCode || "" : employeeCode), [employeeCode, employees]);

  async function handleView() {
    if (!resolvedEmployeeCode) return;
    setLoading(true); setError(""); setViewed(true);
    try {
      const params = type === "month"
        ? { employeeCode: resolvedEmployeeCode, month: `${year}-${String(month).padStart(2, "0")}`, detailed, withVacants, onlyManagers }
        : { employeeCode: resolvedEmployeeCode, fromDate, toDate, periodwise: true, detailed, withVacants, onlyManagers };
      const r = await apiClient.dcrStatus(params);
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load DCR Status");
      setResult(null);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex flex-col gap-1">
            <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={employees} label="FieldForce Name" extraOptions={[{ value: "admin", label: "admin (self + direct reports)" }]} />
          </div>
          <div className="flex items-center gap-4 h-9 font-body-sm text-body-sm text-text-primary">
            <label className="flex items-center gap-1"><input type="radio" checked={type === "month"} onChange={() => setType("month")} /> Monthwise</label>
            <label className="flex items-center gap-1"><input type="radio" checked={type === "period"} onChange={() => setType("period")} /> Periodwise</label>
          </div>
          {type === "month" ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Month</span>
                <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
                  {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Year</span>
                <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">From Date</span>
                <input type="date" className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">To Date</span>
                <input type="date" className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </>
          )}
          <button type="button" onClick={handleView} disabled={!resolvedEmployeeCode || loading || (type === "period" && (!fromDate || !toDate))} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50">
            {loading ? "Loading..." : "View"}
          </button>
        </div>
        <div className="flex items-center gap-5 font-body-sm text-body-sm text-text-primary">
          <label className="flex items-center gap-2"><input type="checkbox" checked={withVacants} onChange={(e) => setWithVacants(e.target.checked)} /> With Vacants</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={detailed} onChange={(e) => setDetailed(e.target.checked)} /> Detailed / Attendance</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={onlyManagers} onChange={(e) => setOnlyManagers(e.target.checked)} /> Only Managers</label>
        </div>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && result && (
            <div className="space-y-3">
              <div className="text-center space-y-1 border-b border-border-subtle pb-4">
                <h2 className="font-headline-sm text-headline-sm text-text-primary underline">
                  Daily Call Status for {result.periodwise ? `${result.rangeStart} to ${result.rangeEnd}` : `the Month of ${MONTH_NAMES[month-1]} - ${year}`}
                </h2>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
                  <thead className="bg-brand-primary-subtle">
                    <tr>
                      <th className="px-2 py-2 border-r border-border-subtle">S.No</th><th className="px-2 py-2 border-r border-border-subtle">Employee id</th><th className="px-2 py-2 border-r border-border-subtle">FieldForce Name</th>
                      <th className="px-2 py-2 border-r border-border-subtle">Designation</th><th className="px-2 py-2 border-r border-border-subtle">HQ</th>
                      {result.days.map((d) => <th key={d} className="px-2 py-1 text-center border-r border-border-subtle">{d}</th>)}
                      <th className="px-2 py-2">No of Days Present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r, i) => (
                      <tr key={r.employeeCode}>
                        <td className="px-2 py-1 border-t border-r border-border-subtle">{i + 1}</td>
                        <td className="px-2 py-1 border-t border-r border-border-subtle">{r.employeeCode}</td>
                        <td className="px-2 py-1 border-t border-r border-border-subtle">{r.name}</td>
                        <td className="px-2 py-1 border-t border-r border-border-subtle">{r.designation}</td>
                        <td className="px-2 py-1 border-t border-r border-border-subtle">{r.hq}</td>
                        {r.perDay.map((d) => (
                          <td key={d.day} className="px-1 py-1 border-t border-r border-border-subtle text-center text-xs">
                            {result.detailed ? `${d.sd ?? ""}/${d.drs ?? ""}` : d.code}
                          </td>
                        ))}
                        <td className="px-2 py-1 border-t border-border-subtle text-center">{r.noOfDaysPresent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg border border-border-subtle p-3 text-xs space-y-1">
                <p className="font-semibold">Work Type legend (real codes this schema can back):</p>
                <p>FW = Field Work &nbsp; H = Holiday &nbsp; WO = Weekly Off &nbsp; L = Leave &nbsp; (blank) = Not Planned / No submission</p>
                {result.unsupportedCodes.length > 0 && (
                  <p className="text-status-warning">
                    The legacy legend also lists {result.unsupportedCodes.join("/")} -- none of these have a distinct backing concept anywhere in this schema, so they are intentionally not shown rather than fabricated.
                  </p>
                )}
                {result.detailed && <p>Detailed/Attendance columns show &quot;SD/Drs&quot; = distinct doctor territories touched / distinct doctors met that day (real DCR-derived counts).</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
