"use client";

import { useState } from "react";
import {
  apiClient,
  type FieldworkManagerAnalysisResult,
  type ManagerWiseCoverageResult,
  type SpecialityCategoryVisitResult
} from "@/lib/api-client";
import { useManagers, ManagerPicker, MonthYearRangePicker, monthLabel, th, td } from "./manager-analysis-panels";

const THIS_YEAR = new Date().getFullYear();

// Round 38 -- FieldWork Manager - Analysis, Manager Wise - Coverage
// Analysis, Speciality/Category Visit Wise. Reuses the exact filter-form
// building blocks (ManagerPicker/MonthYearRangePicker/monthLabel/th/td)
// Round 37's manager-analysis-panels.tsx already built, same visual
// language as every other Activity Reports / MIS Reports screen.

const FIELDWORK_DESIGNATION_CODES = ["BM", "BH", "BDE", "RBM", "Sr.RBM", "ABM", "ZBM", "BDM", "BRM", "NBM", "Sr ABM", "HM", "MH", "SM"];

// ── Item 1 -- FieldWork Manager - Analysis ──────────────────────────────
export function FieldworkManagerAnalysisReport() {
  const managers = useManagers();
  const [employeeCode, setEmployeeCode] = useState("");
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [fromYear, setFromYear] = useState(THIS_YEAR);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [toYear, setToYear] = useState(THIS_YEAR);
  const [result, setResult] = useState<FieldworkManagerAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError("");
    try {
      const r = await apiClient.fieldworkManagerAnalysis({
        employeeCode,
        fromMonth: `${fromYear}-${String(fromMonth).padStart(2, "0")}`,
        toMonth: `${toYear}-${String(toMonth).padStart(2, "0")}`
      });
      setResult(r.data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  const months = result?.months || [];

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">FieldWork Manager - Analysis</h2>
        <div className="flex flex-wrap items-end gap-4">
          <ManagerPicker managers={managers} value={employeeCode} onChange={setEmployeeCode} />
          <MonthYearRangePicker fromMonth={fromMonth} fromYear={fromYear} toMonth={toMonth} toYear={toYear} onChange={(v) => { setFromMonth(v.fromMonth); setFromYear(v.fromYear); setToMonth(v.toMonth); setToYear(v.toYear); }} />
          <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>

      {result && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">Field Manager Work Analysis - View for the month of {months[0] ? monthLabel(months[0]) : ""} To {months[months.length - 1] ? monthLabel(months[months.length - 1]) : ""}</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
              <thead className="bg-brand-primary-subtle">
                <tr>
                  <th className={th} rowSpan={2}>S.No</th><th className={th} rowSpan={2}>Joining Date</th><th className={th} rowSpan={2}>Field Force Name</th>
                  <th className={th} rowSpan={2}>Desig</th><th className={th} rowSpan={2}>HQ</th><th className={th} rowSpan={2}>First Level Manager</th><th className={th} rowSpan={2}>Second Level Manager</th>
                  {months.map((m) => <th key={m} className={th + " text-center"} colSpan={FIELDWORK_DESIGNATION_CODES.length}>{monthLabel(m)}</th>)}
                </tr>
                <tr>
                  {months.map((m) => FIELDWORK_DESIGNATION_CODES.map((code) => <th key={m + code} className={th + " text-center"}>{code}</th>))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={row.employeeCode}>
                    <td className={td}>{i + 1}</td>
                    <td className={td}>{row.joinDate ? new Date(row.joinDate).toLocaleDateString() : "-"}</td>
                    <td className={td}>{row.name}</td>
                    <td className={td}>{row.designation}</td>
                    <td className={td}>{row.hq}</td>
                    <td className={td}>{row.firstLevelManager || "-"}</td>
                    <td className={td}>-</td>
                    {months.map((m) => FIELDWORK_DESIGNATION_CODES.map((code) => (
                      <td key={m + code} className={td + " text-center"}>{row.perMonth[m]?.[code] ?? ""}</td>
                    )))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted">Second Level Manager is not tracked as a distinct field anywhere in this schema (Employee.reportingManager gives only one direct manager) -- shown as &quot;-&quot; rather than fabricated.</p>
        </div>
      )}
    </div>
  );
}

// ── Item 2 -- Manager Wise - Coverage Analysis (INFERRED result shape --
// see manager-analysis-compute.ts's header comment; the coordinator's own
// legacy description was cut off with no screenshot) ────────────────────
export function ManagerWiseCoverageReport() {
  const managers = useManagers();
  const [employeeCode, setEmployeeCode] = useState("");
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [fromYear, setFromYear] = useState(THIS_YEAR);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [toYear, setToYear] = useState(THIS_YEAR);
  const [result, setResult] = useState<ManagerWiseCoverageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError("");
    try {
      const r = await apiClient.managerWiseCoverage({
        employeeCode,
        fromMonth: `${fromYear}-${String(fromMonth).padStart(2, "0")}`,
        toMonth: `${toYear}-${String(toMonth).padStart(2, "0")}`
      });
      setResult(r.data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Manager Wise - Coverage Analysis</h2>
        <div className="flex flex-wrap items-end gap-4">
          <ManagerPicker managers={managers} value={employeeCode} onChange={setEmployeeCode} />
          <MonthYearRangePicker fromMonth={fromMonth} fromYear={fromYear} toMonth={toMonth} toYear={toYear} onChange={(v) => { setFromMonth(v.fromMonth); setFromYear(v.fromYear); setToMonth(v.toMonth); setToYear(v.toYear); }} />
          <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>

      {result && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">Manager Wise Coverage Analysis</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          <p className="text-xs text-status-warning bg-surface-subtle rounded-lg p-2">
            This screen&apos;s legacy result shape wasn&apos;t confirmed with a screenshot -- the table below is an inferred best match (Coverage Analysis 1&apos;s own real column structure, one row per team member, aggregated over the selected date range). Please confirm against the real legacy screen next round.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
              <thead className="bg-brand-primary-subtle">
                <tr>
                  <th className={th} rowSpan={2}>FieldForce Name</th>
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
                {result.rows.map((row) => (
                  <tr key={row.employeeCode}>
                    <td className={td}>{row.name} - {row.designation} - {row.hq}</td>
                    <td className={td}>{row.callDetails.masterListDoctors}</td><td className={td}>{row.callDetails.doctorsMet}</td><td className={td}>{row.callDetails.coveragePct}</td><td className={td}>{row.callDetails.listedDrsMissed}</td><td className={td}>{row.callDetails.unlistedDrsMet}</td>
                    <td className={td}>{row.attendance.daysWorked}</td><td className={td}>{row.attendance.daysField}</td><td className={td}>{row.attendance.daysNonField}</td><td className={td}>{row.attendance.daysOnLeave}</td>
                    <td className={td}>{row.summary.doctorsCallsSeen}</td><td className={td}>{row.summary.doctorsCallAverage}</td><td className={td}>{row.summary.chemistCallsSeen}</td><td className={td}>{row.summary.chemistCallAverage}</td>
                    <td className={td}>{row.jointWork.days}</td><td className={td}>{row.jointWork.callsMet}</td><td className={td}>{row.jointWork.callsSeen}</td><td className={td}>{row.jointWork.callAverage}</td>
                    <td className={td}>{row.repeatedCalls.met}</td><td className={td}>{row.repeatedCalls.coveragePct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Item 3 -- Speciality/Category Visit Wise ────────────────────────────
export function SpecialityCategoryVisitReport() {
  const managers = useManagers();
  const [employeeCode, setEmployeeCode] = useState("");
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [fromYear, setFromYear] = useState(THIS_YEAR);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [toYear, setToYear] = useState(THIS_YEAR);
  const [mode, setMode] = useState<"Specialitywise Visit" | "Categorywise Visit">("Specialitywise Visit");
  const [result, setResult] = useState<SpecialityCategoryVisitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setError("");
    try {
      const r = await apiClient.specialityCategoryVisit({
        employeeCode,
        fromMonth: `${fromYear}-${String(fromMonth).padStart(2, "0")}`,
        toMonth: `${toYear}-${String(toMonth).padStart(2, "0")}`,
        mode
      });
      setResult(r.data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  const months = result?.months || [];
  const rowLabels = result?.mode === "Categorywise Visit" ? (result.categories || []) : (result?.specialties || []);

  function cell(bucket: { v1: number; v2: number; v3: number; vMore: number } | undefined, key: "v1" | "v2" | "v3" | "vMore") {
    const v = bucket?.[key] ?? 0;
    return v > 0 ? v : "-";
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Speciality &amp; Categorywise - Visit</h2>
        <div className="flex flex-wrap items-end gap-4">
          <ManagerPicker managers={managers} value={employeeCode} onChange={setEmployeeCode} />
          <MonthYearRangePicker fromMonth={fromMonth} fromYear={fromYear} toMonth={toMonth} toYear={toYear} onChange={(v) => { setFromMonth(v.fromMonth); setFromYear(v.fromYear); setToMonth(v.toMonth); setToYear(v.toYear); }} />
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Mode</span>
            <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={mode} onChange={(e) => setMode(e.target.value as "Specialitywise Visit" | "Categorywise Visit")}>
              <option>Specialitywise Visit</option>
              <option>Categorywise Visit</option>
            </select>
          </div>
          <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>

      {result && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">{result.mode === "Categorywise Visit" ? "Categorywise" : "Specialitywise"} Visit for the Period of {months[0] ? monthLabel(months[0]) : ""} To {months[months.length - 1] ? monthLabel(months[months.length - 1]) : ""}</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Filed Force Name : {result.fieldForceName}</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary border-collapse">
              <thead className="bg-brand-primary-subtle">
                <tr>
                  <th className={th} rowSpan={2}>S.No</th>
                  <th className={th} rowSpan={2}>{result.mode === "Categorywise Visit" ? "Category" : "Speciality"}</th>
                  {months.map((m) => <th key={m} className={th + " text-center"} colSpan={4}>{monthLabel(m)}</th>)}
                </tr>
                <tr>
                  {months.map((m) => (
                    <>
                      <th key={m + "v1"} className={th + " text-center"}>V1</th><th key={m + "v2"} className={th + " text-center"}>V2</th><th key={m + "v3"} className={th + " text-center"}>V3</th><th key={m + "vm"} className={th + " text-center"}>&gt;V3</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowLabels.length === 0 && (
                  <tr><td className={td} colSpan={2 + months.length * 4}>No real specialities found for this team&apos;s listed doctors.</td></tr>
                )}
                {rowLabels.map((label, i) => (
                  <tr key={label}>
                    <td className={td}>{i + 1}</td>
                    <td className={td}>{label}</td>
                    {months.map((m) => {
                      const bucket = result.perMonth[m]?.[label];
                      return (
                        <>
                          <td key={m + "v1"} className={td + " text-center"}>{cell(bucket, "v1")}</td>
                          <td key={m + "v2"} className={td + " text-center"}>{cell(bucket, "v2")}</td>
                          <td key={m + "v3"} className={td + " text-center"}>{cell(bucket, "v3")}</td>
                          <td key={m + "vm"} className={td + " text-center"}>{cell(bucket, "vMore")}</td>
                        </>
                      );
                    })}
                  </tr>
                ))}
                {result.mode === "Categorywise Visit" && rowLabels.length > 0 && (
                  <tr className="font-bold text-status-danger">
                    <td className={td} colSpan={2}>Total</td>
                    {months.map((m) => {
                      const totals = { v1: 0, v2: 0, v3: 0, vMore: 0 };
                      for (const label of rowLabels) {
                        const bucket = result.perMonth[m]?.[label];
                        if (bucket) { totals.v1 += bucket.v1; totals.v2 += bucket.v2; totals.v3 += bucket.v3; totals.vMore += bucket.vMore; }
                      }
                      return (
                        <>
                          <td key={m + "tv1"} className={td + " text-center"}>{totals.v1 || "-"}</td>
                          <td key={m + "tv2"} className={td + " text-center"}>{totals.v2 || "-"}</td>
                          <td key={m + "tv3"} className={td + " text-center"}>{totals.v3 || "-"}</td>
                          <td key={m + "tvm"} className={td + " text-center"}>{totals.vMore || "-"}</td>
                        </>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {result.mode === "Categorywise Visit" && (
            <p className="text-xs text-text-muted">Nil and SUPER CORE rows show real 0s/&quot;-&quot; throughout -- this schema only has a binary isCore Yes/No tag (managerwiseCoreDoctorMap), not a real 4-tier Nil/CORE/NON CORE/SUPER CORE classification.</p>
          )}
        </div>
      )}
    </div>
  );
}
