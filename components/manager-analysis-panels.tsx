"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  apiClient,
  type ManagerAnalysisManager,
  type HqCoverageResult,
  type CoverageAnalysis1Result,
  type JointWorkResult,
  type DayCallsSummary
} from "@/lib/api-client";

// Round 37 Items 3/4/5 -- Manager Analysis: HQ-Coveragewise, Coverage
// Analysis 1, Joint Workwise. Real data throughout, scoped via the
// backend's org-hierarchy.ts + manager-analysis-compute.ts (itself built
// on Rounds 34-36's day-status.ts / custom-report-compute.ts). Kept in
// our existing tile-grid/workspace visual language, same as the Round 34
// TP/DCR panels.

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - 3 + i);

export function monthLabel(month: string) {
  const [y, m] = month.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function useManagers() {
  const [managers, setManagers] = useState<ManagerAnalysisManager[]>([]);
  useEffect(() => { apiClient.managerAnalysisManagers().then((r) => setManagers(r.data)).catch(() => setManagers([])); }, []);
  return managers;
}

export function ManagerPicker({ managers, value, onChange }: { managers: ManagerAnalysisManager[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Filed Force Name</span>
      <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[260px]" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">---Select---</option>
        {managers.map((m) => <option key={m.employeeCode} value={m.employeeCode}>{m.name} - {m.designation} - {m.territory}</option>)}
      </select>
    </div>
  );
}

export function MonthYearRangePicker({
  fromMonth, fromYear, toMonth, toYear, onChange
}: { fromMonth: number; fromYear: number; toMonth: number; toYear: number; onChange: (v: { fromMonth: number; fromYear: number; toMonth: number; toYear: number }) => void }) {
  const sel = "h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm";
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">From Month</span>
        <select className={sel} value={fromMonth} onChange={(e) => onChange({ fromMonth: parseInt(e.target.value, 10), fromYear, toMonth, toYear })}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">From Year</span>
        <select className={sel} value={fromYear} onChange={(e) => onChange({ fromMonth, fromYear: parseInt(e.target.value, 10), toMonth, toYear })}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">To Month</span>
        <select className={sel} value={toMonth} onChange={(e) => onChange({ fromMonth, fromYear, toMonth: parseInt(e.target.value, 10), toYear })}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">To Year</span>
        <select className={sel} value={toYear} onChange={(e) => onChange({ fromMonth, fromYear, toMonth, toYear: parseInt(e.target.value, 10) })}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </>
  );
}

function summaryCell(summary: DayCallsSummary | undefined, key: keyof DayCallsSummary): number {
  return summary ? (summary[key] as number) : 0;
}

export const th = "px-3 py-2 border-r border-border-subtle";
export const td = "px-3 py-1.5 border-t border-r border-border-subtle";

// ── Item 3 -- Manager Analysis > HQ - Coveragewise ──────────────────────
export function HqCoveragewiseReport() {
  const router = useRouter();
  function onDrilldown(employeeCode: string, month: string) {
    router.push(`/admin/workspace/division-dashboard/division-navigation-tabs/mis-reports/manager-analysis/coverage-analysis-1?employeeCode=${employeeCode}&month=${month}`);
  }
  const managers = useManagers();
  const [employeeCode, setEmployeeCode] = useState("");
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [fromYear, setFromYear] = useState(THIS_YEAR);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [toYear, setToYear] = useState(THIS_YEAR);
  const [mode, setMode] = useState("---Select---");
  const [result, setResult] = useState<HqCoverageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleView() {
    if (!employeeCode || mode === "---Select---") return;
    setLoading(true); setError("");
    try {
      const fromMonthStr = `${fromYear}-${String(fromMonth).padStart(2, "0")}`;
      const toMonthStr = `${toYear}-${String(toMonth).padStart(2, "0")}`;
      const r = await apiClient.hqCoverageAnalysis({ employeeCode, fromMonth: fromMonthStr, toMonth: toMonthStr, mode });
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load report");
      setResult(null);
    } finally { setLoading(false); }
  }

  const months = result?.months || [];

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Manager - HQ Wise Visit Coverage Analysis</h2>
        <div className="flex flex-wrap items-end gap-4">
          <ManagerPicker managers={managers} value={employeeCode} onChange={setEmployeeCode} />
          <MonthYearRangePicker fromMonth={fromMonth} fromYear={fromYear} toMonth={toMonth} toYear={toYear} onChange={(v) => { setFromMonth(v.fromMonth); setFromYear(v.fromYear); setToMonth(v.toMonth); setToYear(v.toYear); }} />
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Mode</span>
            <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option>---Select---</option>
              <option>Days/Calls Only</option>
              <option>HQ/EX/OS wise</option>
              <option>Detail</option>
            </select>
          </div>
          <button type="button" onClick={handleView} disabled={!employeeCode || mode === "---Select---" || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>

      {result && result.mode !== "Detail" && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">Manager - HQ - Coverage From {months[0] ? monthLabel(months[0]) : ""} to {months[months.length - 1] ? monthLabel(months[months.length - 1]) : ""}</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq} {result.doj ? `(DOJ: ${new Date(result.doj).toLocaleDateString()})` : ""}</p>

          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
              <thead className="bg-brand-primary-subtle">
                <tr><th className={th}>Day Wise Detail</th>{months.map((m) => <th key={m} className={th + " text-center"}>{monthLabel(m)}</th>)}<th className={th + " text-center"}>Total</th></tr>
              </thead>
              <tbody>
                {([
                  ["Calendar Days", "calendarDays"], ["Sundays & Holidays", "sundaysHolidays"],
                  ["Working Days (Excl/Holidays & Sundays)", "workingDaysExclHolSun"], ["Fieldwork days", "fieldworkDays"],
                  ["No Fieldwork Days", "noFieldworkDays"], ["Leave", "leave"], ["TP Deviation Days", "tpDeviationDays"]
                ] as const).map(([label, key]) => (
                  <tr key={key}>
                    <td className={td}>{label}</td>
                    {months.map((m) => <td key={m} className={td + " text-center"}>{summaryCell(result.summaryPerMonth?.[m], key)}</td>)}
                    <td className={td + " text-center font-semibold"}>{summaryCell(result.summaryTotal, key)}</td>
                  </tr>
                ))}
                <tr className="bg-brand-primary-subtle"><td className={th} colSpan={months.length + 2}>Doctor Details</td></tr>
                {([
                  ["No of Listed Drs Met", "listedDrsMet"], ["No of Listed Drs Seen", "listedDrsSeen"], ["Call Average", "callAverage"],
                  ["Morning Calls", "morningCalls"], ["Evening Calls", "eveningCalls"], ["Both Calls", "bothCalls"],
                  ["Nil Drs Met", "nilDrsMet"], ["CORE Drs Met", "coreDrsMet"], ["N CORE Drs Met", "nCoreDrsMet"], ["S CORE Drs Met", "sCoreDrsMet"]
                ] as const).map(([label, key]) => (
                  <tr key={key}>
                    <td className={td}>{label}</td>
                    {months.map((m) => <td key={m} className={td + " text-center"}>{summaryCell(result.summaryPerMonth?.[m], key)}</td>)}
                    <td className={td + " text-center font-semibold"}>{summaryCell(result.summaryTotal, key)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.mode === "Days/Calls Only" && (
            <p className="text-center text-status-danger font-semibold py-3 bg-surface-subtle rounded-lg">No Records Found</p>
          )}

          {result.mode === "HQ/EX/OS wise" && result.hqRows && (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
                <thead className="bg-brand-primary-subtle">
                  <tr>
                    <th className={th} rowSpan={2}>HQ Name</th>
                    {months.map((m) => <th key={m} className={th + " text-center"} colSpan={8}>{monthLabel(m)}</th>)}
                    <th className={th + " text-center"} colSpan={8}>Total</th>
                  </tr>
                  <tr>
                    {[...months, "total"].map((m) => (
                      <>
                        <th key={m + "hqw"} className={th + " text-center"}>HQ</th><th key={m + "exw"} className={th + " text-center"}>EX</th><th key={m + "osw"} className={th + " text-center"}>OS</th><th key={m + "tw"} className={th + " text-center"}>Total</th>
                        <th key={m + "hqc"} className={th + " text-center"}>HQ Calls</th><th key={m + "exc"} className={th + " text-center"}>EX Calls</th><th key={m + "osc"} className={th + " text-center"}>OS Calls</th><th key={m + "tc"} className={th + " text-center"}>Total Calls</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.hqRows.map((row) => (
                    <tr key={row.employeeCode}>
                      <td className={td}>{row.hqName} ({row.repName})</td>
                      {months.map((m) => {
                        const cell = row.perMonth[m];
                        return (
                          <>
                            <td key={m + "hqw"} className={td + " text-center"}>{cell?.daysWorked.hq ?? 0}</td><td key={m + "exw"} className={td + " text-center"}>{cell?.daysWorked.ex ?? 0}</td><td key={m + "osw"} className={td + " text-center"}>{cell?.daysWorked.os ?? 0}</td><td key={m + "tw"} className={td + " text-center"}>{cell?.daysWorked.total ?? 0}</td>
                            <td key={m + "hqc"} className={td + " text-center"}>{cell?.totalDoctorCalls.hq ?? 0}</td><td key={m + "exc"} className={td + " text-center"}>{cell?.totalDoctorCalls.ex ?? 0}</td><td key={m + "osc"} className={td + " text-center"}>{cell?.totalDoctorCalls.os ?? 0}</td><td key={m + "tc"} className={td + " text-center"}>{cell?.totalDoctorCalls.total ?? 0}</td>
                          </>
                        );
                      })}
                      <td className={td + " text-center"}>{row.totals.daysWorked.hq}</td><td className={td + " text-center"}>{row.totals.daysWorked.ex}</td><td className={td + " text-center"}>{row.totals.daysWorked.os}</td><td className={td + " text-center font-semibold"}>{row.totals.daysWorked.total}</td>
                      <td className={td + " text-center"}>{row.totals.totalDoctorCalls.hq}</td><td className={td + " text-center"}>{row.totals.totalDoctorCalls.ex}</td><td className={td + " text-center"}>{row.totals.totalDoctorCalls.os}</td><td className={td + " text-center font-semibold"}>{row.totals.totalDoctorCalls.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {result && result.mode === "Detail" && result.detailRows && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">HQ Coverage Analysis Detail Between - {months[0] ? monthLabel(months[0]) : ""} To {months[months.length - 1] ? monthLabel(months[months.length - 1]).split(" ")[1] : ""}</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name : {result.fieldForceName}</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
              <thead className="bg-brand-primary-subtle">
                <tr>
                  <th className={th} rowSpan={2}>S.No</th><th className={th} rowSpan={2}>Emp Code</th><th className={th} rowSpan={2}>FieldForce Name</th>
                  <th className={th} rowSpan={2}>Designation</th><th className={th} rowSpan={2}>HQ</th><th className={th} rowSpan={2}>DOJ</th>
                  <th className={th} rowSpan={2}>Start DCR Date</th><th className={th} rowSpan={2}>Last DCR Date</th>
                  {months.map((m) => <th key={m} className={th + " text-center"} colSpan={8}>{monthLabel(m)}</th>)}
                </tr>
                <tr>
                  {months.map((m) => (
                    <>
                      <th key={m + "fw"} className={th + " text-center"}>FW Days</th><th key={m + "nfw"} className={th + " text-center"}>NFW Days</th>
                      <th key={m + "v1"} className={th + " text-center"}>V1</th><th key={m + "v2"} className={th + " text-center"}>V2</th><th key={m + "miss"} className={th + " text-center"}>Missed</th>
                      <th key={m + "mor"} className={th + " text-center"}>Mor. Calls</th><th key={m + "eve"} className={th + " text-center"}>Eve. Calls</th><th key={m + "both"} className={th + " text-center"}>Both Calls</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.detailRows.map((row, i) => (
                  <tr key={row.employeeCode}>
                    <td className={td}>{i + 1}</td><td className={td}>{row.employeeCode}</td><td className={td}>{row.name}</td>
                    <td className={td}>{row.designation}</td><td className={td}>{row.hq}</td><td className={td}>{row.doj ? new Date(row.doj).toLocaleDateString() : "-"}</td>
                    <td className={td}>{row.startDcrDate || "-"}</td><td className={td}>{row.lastDcrDate || "-"}</td>
                    {months.map((m) => {
                      const cell = row.perMonth[m];
                      if (!cell || cell.totalCalls === 0) {
                        return <>{Array.from({ length: 8 }).map((_, idx) => <td key={m + idx} className={td}></td>)}</>;
                      }
                      return (
                        <>
                          <td key={m + "fw"} className={td + " text-center"}>{cell.fwDays}</td><td key={m + "nfw"} className={td + " text-center"}>{cell.nfwDays}</td>
                          <td key={m + "v1"} className={td + " text-center"}>{cell.v1}</td><td key={m + "v2"} className={td + " text-center"}>{cell.v2}</td><td key={m + "miss"} className={td + " text-center"}>{cell.missed}</td>
                          <td key={m + "mor"} className={td + " text-center"}>{cell.morningCalls}</td><td key={m + "eve"} className={td + " text-center"}>{cell.eveningCalls}</td>
                          <td key={m + "both"} className={td + " text-center"}>
                            <button type="button" className="text-primary underline" onClick={() => onDrilldown(row.employeeCode, m)}>{cell.bothCalls}</button>
                          </td>
                        </>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted">Numeric cells in the Dr Call Detail group link into Coverage Analysis 1 for that rep/month.</p>
        </div>
      )}
    </div>
  );
}

// ── Item 4 -- Coverage Analysis 1 ───────────────────────────────────────
export function CoverageAnalysis1Report() {
  const searchParams = useSearchParams();
  const initialEmployeeCode = searchParams.get("employeeCode") || "";
  const initialMonth = searchParams.get("month") || "";
  const [employeeCode, setEmployeeCode] = useState(initialEmployeeCode);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employees, setEmployees] = useState<{ employeeCode: string; name: string; designation: string; territory: string }[]>([]);
  const [month, setMonth] = useState(initialMonth || new Date().toISOString().slice(0, 7));
  const [result, setResult] = useState<CoverageAnalysis1Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([])); }, []);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError("");
    try { setResult((await apiClient.coverageAnalysis1(employeeCode, month)).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  // Intentionally runs only when the drill-down's own initial query params
  // change, not on every handleView identity change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialEmployeeCode && initialMonth) handleView(); }, [initialEmployeeCode, initialMonth]);

  const matching = employeeSearch.trim() ? employees.filter((e) => e.name.toLowerCase().includes(employeeSearch.toLowerCase())).slice(0, 8) : [];
  const selectedEmployee = employees.find((e) => e.employeeCode === employeeCode);

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Coverage Analysis 1</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 relative">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Filed Force Name</span>
            {selectedEmployee ? (
              <div className="flex items-center justify-between h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[260px]">
                <span>{selectedEmployee.name} - {selectedEmployee.designation} - {selectedEmployee.territory}</span>
                <button type="button" onClick={() => setEmployeeCode("")} className="text-text-muted text-xs underline">change</button>
              </div>
            ) : (
              <>
                <input type="text" placeholder="type a name" className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[260px]" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} />
                {matching.length > 0 && (
                  <div className="absolute z-20 mt-14 w-full bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden">
                    {matching.map((e) => (
                      <button key={e.employeeCode} type="button" onClick={() => { setEmployeeCode(e.employeeCode); setEmployeeSearch(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-subtle">{e.name} - {e.designation} - {e.territory}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Month</span>
            <input type="month" className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>

      {result && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">Coverage Analysis 1 - {monthLabel(result.month)}</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
              <thead className="bg-brand-primary-subtle">
                <tr>
                  <th className={th + " text-center"} colSpan={5}>Call Details</th>
                  <th className={th + " text-center"} colSpan={4}>Attendance</th>
                  <th className={th + " text-center"} colSpan={4}>Summary</th>
                  <th className={th + " text-center"} colSpan={4}>Joint Work</th>
                  <th className={th + " text-center"} colSpan={2}>Repeated Calls</th>
                </tr>
                <tr>
                  <th className={th}>Master List Doctors</th><th className={th}>Doctors Met</th><th className={th}>Coverage(%)</th><th className={th}>Listed Drs Missed</th><th className={th}>UnListed Drs Met</th>
                  <th className={th}>Days Worked</th><th className={th}>Days Field</th><th className={th}>Days Non Field</th><th className={th}>Days On Leave</th>
                  <th className={th}>Doctors Calls Seen</th><th className={th}>Call Average</th><th className={th}>Chemist Calls Seen</th><th className={th}>Call Average</th>
                  <th className={th}>Days</th><th className={th}>Calls Met</th><th className={th}>Calls Seen</th><th className={th}>Call Average</th>
                  <th className={th}>Met</th><th className={th}>Coverage(%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>{result.callDetails.masterListDoctors}</td><td className={td}>{result.callDetails.doctorsMet}</td><td className={td}>{result.callDetails.coveragePct}</td><td className={td}>{result.callDetails.listedDrsMissed}</td><td className={td}>{result.callDetails.unlistedDrsMet}</td>
                  <td className={td}>{result.attendance.daysWorked}</td><td className={td}>{result.attendance.daysField}</td><td className={td}>{result.attendance.daysNonField}</td><td className={td}>{result.attendance.daysOnLeave}</td>
                  <td className={td}>{result.summary.doctorsCallsSeen}</td><td className={td}>{result.summary.doctorsCallAverage}</td><td className={td}>{result.summary.chemistCallsSeen}</td><td className={td}>{result.summary.chemistCallAverage}</td>
                  <td className={td}>{result.jointWork.days}</td><td className={td}>{result.jointWork.callsMet}</td><td className={td}>{result.jointWork.callsSeen}</td><td className={td}>{result.jointWork.callAverage}</td>
                  <td className={td}>{result.repeatedCalls.met}</td><td className={td}>{result.repeatedCalls.coveragePct}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted">UnListed Drs Met is 0 -- no real unlisted-doctor-visit link exists in this schema (DCRs only ever reference the listed Doctor master).</p>
        </div>
      )}
    </div>
  );
}

// ── Item 5 -- Joint Workwise ─────────────────────────────────────────────
export function JointWorkwiseReport() {
  const managers = useManagers();
  const [employeeCode, setEmployeeCode] = useState("");
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [fromYear, setFromYear] = useState(THIS_YEAR);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [toYear, setToYear] = useState(THIS_YEAR);
  const [mode, setMode] = useState("Based on MGR - DCR");
  const [result, setResult] = useState<JointWorkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError("");
    try {
      const fromMonthStr = `${fromYear}-${String(fromMonth).padStart(2, "0")}`;
      const toMonthStr = `${toYear}-${String(toMonth).padStart(2, "0")}`;
      const r = await apiClient.jointWorkAnalysis({ employeeCode, fromMonth: fromMonthStr, toMonth: toMonthStr, mode });
      setResult(r.data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  const months = result?.months || [];
  function cellText(entry: { days: number; dates: string[]; calls: number } | null | undefined) {
    if (!entry) return "-";
    return `${entry.days} / ${entry.dates.join(",")} / ${entry.calls}`;
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Joint Work Analysis</h2>
        <div className="flex flex-wrap items-end gap-4">
          <ManagerPicker managers={managers} value={employeeCode} onChange={setEmployeeCode} />
          <MonthYearRangePicker fromMonth={fromMonth} fromYear={fromYear} toMonth={toMonth} toYear={toYear} onChange={(v) => { setFromMonth(v.fromMonth); setFromYear(v.fromYear); setToMonth(v.toMonth); setToYear(v.toYear); }} />
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Mode</span>
            <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option>Based on MGR - DCR</option>
              <option>Based on MR - DCR</option>
            </select>
          </div>
          <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>

      {result && result.mode === "Based on MGR - DCR" && result.managerRow && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">Joint Work Analysis From {months[0] ? monthLabel(months[0]) : ""} to {months[months.length - 1] ? monthLabel(months[months.length - 1]) : ""}</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name : {result.managerRow.name}</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
              <thead className="bg-brand-primary-subtle">
                <tr><th className={th}>S.No</th><th className={th}>FieldForce Name/HQ/Designation</th><th className={th}>Joining Date</th>{months.map((m) => <th key={m} className={th}>{monthLabel(m)} JFW DAYS/DATE/Calls</th>)}</tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>1</td>
                  <td className={td}>{result.managerRow.name} / {result.managerRow.hq} / {result.managerRow.designation}</td>
                  <td className={td}>{result.managerRow.joinDate ? new Date(result.managerRow.joinDate).toLocaleDateString() : "-"}</td>
                  {months.map((m) => <td key={m} className={td}>{cellText(result.managerRow!.perMonth[m])}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.mode === "Based on MR - DCR" && result.repRows && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">Joint Work Analysis From {months[0] ? monthLabel(months[0]) : ""} to {months[months.length - 1] ? monthLabel(months[months.length - 1]) : ""}</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name : {managers.find((m) => m.employeeCode === employeeCode)?.name}</p>
          {result.repRows.map((rep, i) => (
            <div key={rep.employeeCode} className="border border-border-subtle rounded-lg overflow-hidden">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
                <thead className="bg-brand-primary-subtle">
                  <tr><th className={th}>S.No</th><th className={th}>BaseLevel/HQ/Designation</th><th className={th}>Joining Date</th>{months.map((m) => <th key={m} className={th}>{monthLabel(m)} JFW DAYS/DATE/Calls</th>)}</tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={td}>{i + 1}</td>
                    <td className={td}>{rep.name} / {rep.hq} / {rep.designation}</td>
                    <td className={td}>{rep.joinDate ? new Date(rep.joinDate).toLocaleDateString() : "-"}</td>
                    {months.map((m) => <td key={m} className={td}>{cellText(rep.perMonth[m])}</td>)}
                  </tr>
                  {rep.chain.map((mgr) => (
                    <tr key={mgr.employeeCode} className="bg-surface-subtle">
                      <td className={td}></td>
                      <td className={td}>&nbsp;&nbsp;&#8627; {mgr.name} / {mgr.hq} / {mgr.designation}</td>
                      <td className={td}>{mgr.joinDate ? new Date(mgr.joinDate).toLocaleDateString() : "-"}</td>
                      {months.map((m) => <td key={m} className={td}>{cellText(mgr.perMonth[m])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
