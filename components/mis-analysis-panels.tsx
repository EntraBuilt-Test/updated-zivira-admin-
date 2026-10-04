"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Printer, FileSpreadsheet, X } from "lucide-react";
import { exportElementToXlsx } from "@/lib/xlsx-export";
import { FieldForceSelect, useFieldForceOptions } from "@/components/field-force-select";
import { MonthYearRangePicker, useManagers, th as baseTh, td as baseTd } from "@/components/manager-analysis-panels";
import {
  apiClient,
  type DcrAnalysisReportData,
  type DcrAnalysisResult,
  type MisTeamMember,
  type PobCell,
  type PobPeriodicResult,
  type PobWiseResult,
  type SalesDetailsResult,
  type SalesEmployeeRow,
  type SalesTriple,
  type VisitAnalysisResult
} from "@/lib/api-client";

// Round 39 Items 3-7 -- MIS Reports > Analysis: DCR, Visit Analysis, Sales
// Details, POB Wise, POB Wise - Periodically. Result screens open as a
// popup (Print / Excel / Close icons top-right) exactly like the legacy
// screens; every number comes from the backend's mis-reports-compute.ts.

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const NOW = new Date();
export const THIS_YEAR = NOW.getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - 3 + i);
export const SELECT = "h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm";
export const LABEL = "font-label-sm text-label-sm uppercase tracking-wider text-text-muted";
export const GO = "h-9 px-8 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50";
export const MIS_BASE = "/admin/workspace/division-dashboard/division-navigation-tabs/mis-reports";

export const th = baseTh + " text-center";
export const td = baseTd + " text-center";
export const tealHead = "bg-teal-700 text-white";
export const link = "text-blue-600 underline cursor-pointer font-semibold";

export function ym(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}
export function shortMonth(month: string) {
  const [y, m] = month.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES[m - 1].slice(0, 3)} - ${y}`;
}
export function longMonth(month: string) {
  const [y, m] = month.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES[m - 1]} - ${y}`;
}
export function dmy(date: string | null | undefined) {
  if (!date) return "-";
  const [y, m, d] = date.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
export function dash(n: number) {
  return n === 0 ? "-" : n;
}

// ── Popup shell with Print / Excel / Close ──────────────────────────────
export function ReportModal({ title, fileName, onClose, children, textButtons }: { title: string; fileName: string; onClose: () => void; children: ReactNode; textButtons?: boolean }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  function handlePrint() {
    const html = bodyRef.current?.innerHTML || "";
    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) return;
    w.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;font-size:12px}table{border-collapse:collapse;width:100%;margin-bottom:12px}th,td{border:1px solid #999;padding:3px 6px;text-align:center}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }
  async function handleExcel() {
    if (!bodyRef.current) return;
    try {
      const ok = await exportElementToXlsx(bodyRef.current, fileName);
      if (!ok) window.alert("There is no table to export.");
    } catch (err) {
      window.alert(`Excel export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-surface-card rounded-xl shadow-2xl border border-border-subtle w-full max-w-[96vw] my-4">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
          <span className="font-label-md text-label-md text-text-secondary truncate">{title}</span>
          <div className="flex items-center gap-2">
            {textButtons ? (
              <>
                <button type="button" onClick={handlePrint} className="px-3 py-1 rounded border border-border-subtle text-sm hover:bg-surface-subtle">Print</button>
                <button type="button" onClick={() => void handleExcel()} className="px-3 py-1 rounded border border-border-subtle text-sm hover:bg-surface-subtle">Excel</button>
                <button type="button" onClick={onClose} className="px-3 py-1 rounded border border-border-subtle text-sm hover:bg-surface-subtle">Close</button>
              </>
            ) : (
              <>
                <button type="button" title="Print" onClick={handlePrint} className="p-1.5 rounded hover:bg-surface-subtle"><Printer size={18} /></button>
                <button type="button" title="Excel" onClick={() => void handleExcel()} className="p-1.5 rounded hover:bg-surface-subtle text-green-600"><FileSpreadsheet size={18} /></button>
                <button type="button" title="Close" onClick={onClose} className="p-1.5 rounded hover:bg-surface-subtle text-red-600"><X size={18} /></button>
              </>
            )}
          </div>
        </div>
        <div ref={bodyRef} className="p-4 space-y-3 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}

export function ScreenTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-bold text-purple-800 underline decoration-purple-800">{children}</h2>;
}

export function MonthYearSelect({ month, year, onChange }: { month: number; year: number; onChange: (month: number, year: number) => void }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className={LABEL}>Month</span>
        <select className={SELECT} value={month} onChange={(e) => onChange(parseInt(e.target.value, 10), year)}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m.slice(0, 3)}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className={LABEL}>Year</span>
        <select className={SELECT} value={year} onChange={(e) => onChange(month, parseInt(e.target.value, 10))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </>
  );
}

export function useRange() {
  const [range, setRange] = useState({ fromMonth: NOW.getMonth() + 1, fromYear: THIS_YEAR, toMonth: NOW.getMonth() + 1, toYear: THIS_YEAR });
  return { range, setRange, fromKey: ym(range.fromYear, range.fromMonth), toKey: ym(range.toYear, range.toMonth) };
}

function ProductGrid({ products, selected, onToggle }: { products: string[]; selected: Set<string>; onToggle: (p: string) => void }) {
  if (products.length === 0) return <p className="text-xs text-text-muted">No products found in the product master.</p>;
  const half = Math.ceil(products.length / 2);
  const cols = [products.slice(0, half), products.slice(half)];
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-1 border border-border-subtle rounded-lg p-3 max-w-2xl">
      {cols.map((col, ci) => (
        <div key={ci} className="space-y-1">
          {col.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <input type="checkbox" checked={selected.has(p)} onChange={() => onToggle(p)} /> {p}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function useProducts() {
  const [products, setProducts] = useState<string[]>([]);
  useEffect(() => { apiClient.pobProducts().then((r) => setProducts(r.data)).catch(() => setProducts([])); }, []);
  return products;
}

function toggled(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value); else next.add(value);
  return next;
}

// ═══ Item 3 -- DCR Analysis ══════════════════════════════════════════════
function DcrAnalysisBlock({ report }: { report: DcrAnalysisReportData }) {
  const { rows, totals, callsDetails: c } = report;
  const [y, m] = report.month.split("-").map((v) => parseInt(v, 10));
  return (
    <div className="space-y-3 border-b border-border-subtle pb-6">
      <h3 className="text-center text-lg font-bold text-purple-800">DCR Analysis For the Month of : {MONTH_NAMES[m - 1]} - {y}</h3>
      <div className="grid grid-cols-3 text-sm font-semibold bg-pink-200 px-3 py-1.5 rounded">
        <span>FieldForce Name : {report.employee.name} - ( {report.employee.designation} )</span>
        <span className="text-center">Emp Code : {report.employee.employeeCode}</span>
        <span className="text-right">HQ Name : {report.employee.hq}</span>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead className="bg-brand-primary-subtle">
          <tr>
            {["Date", "Submitted Date", "Work Type", "Worked With", "Joint Calls", "As Per TP", "Worked", "Dev", "Listed Dr Met", "Drs POB", "Unlist Dr Met", "Chemist Met", "Chemist POB", "Stockist Met", "Start Time", "End Time"].map((h) => <th key={h} className={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td className={td} colSpan={16}>No DCR submitted for this month.</td></tr>}
          {rows.map((r) => (
            <tr key={r.date}>
              <td className={td}>{dmy(r.date)}</td><td className={td}>{dmy(r.submittedDate)}</td><td className={td}>{r.workType}</td><td className={td}>{r.workedWith}</td>
              <td className={td}>{r.jointCalls}</td><td className={td}>{r.asPerTp}</td><td className={td}>{r.worked}</td><td className={td}>{r.dev}</td>
              <td className={td}>{r.listedDrMet}</td><td className={td}>{r.drsPob.toFixed(2)}</td><td className={td}>{r.unlistDrMet}</td><td className={td}>{r.chemistMet}</td>
              <td className={td}>{r.chemistPob.toFixed(2)}</td><td className={td}>{r.stockistMet}</td><td className={td}>{r.startTime}</td><td className={td}>{r.endTime}</td>
            </tr>
          ))}
          <tr className="bg-yellow-200 font-bold">
            <td className={td} colSpan={4}>Total</td>
            <td className={td}>{totals.jointCalls}</td><td className={td}>{totals.asPerTp}</td><td className={td}>{totals.worked}</td><td className={td}>{totals.dev}</td>
            <td className={td}>{totals.listedDrMet}({totals.listedDrUnique})</td><td className={td}>{totals.drsPob.toFixed(2)}</td><td className={td}>{totals.unlistDrMet}</td>
            <td className={td}>{totals.chemistMet}</td><td className={td}>{totals.chemistPob.toFixed(2)}</td><td className={td}>{totals.stockistMet}</td><td className={td} colSpan={2}></td>
          </tr>
        </tbody>
      </table>
      <div className="bg-blue-600 text-white font-bold text-center py-1 rounded">DCR Delayed Status</div>
      <table className="w-full text-sm border-collapse">
        <tbody>
          <tr><td className={td + " font-semibold"}>Locked Date</td><td className={td}>{report.delayed.locks?.length ? report.delayed.locks.map((l) => `${dmy(l.date)} (locked ${l.lockedAt ? dmy(l.lockedAt) : "-"})`).join(", ") : "Nil"}</td></tr>
          <tr><td className={td + " font-semibold"}>Released Date</td><td className={td}>{report.delayed.locks?.some((l) => l.releasedAt) ? report.delayed.locks.filter((l) => l.releasedAt).map((l) => `${dmy(l.date)} (released ${dmy(l.releasedAt as string)}${l.releasedBy ? ` by ${l.releasedBy.replace(/^admin:/, "admin ")}` : ""})`).join(", ") : report.delayed.releasedDate ? report.delayed.releasedDate.split(", ").map(dmy).join(", ") : "Nil"}</td></tr>
        </tbody>
      </table>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="border-2 border-red-500 rounded p-3 min-h-[120px]">
          {rows.length === 0 ? (
            <p className="text-red-600 font-bold text-center mt-8">*** No Data ***</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead><tr><th className={th}>Work Type / Day</th><th className={th}>Days</th></tr></thead>
              <tbody>{report.workTypeDays.map((w) => <tr key={w.label}><td className={td}>{w.label}</td><td className={td}>{w.days}</td></tr>)}</tbody>
            </table>
          )}
        </div>
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-green-600 text-white"><th className={th}>Calls Details</th><th className={th}>Total</th></tr></thead>
          <tbody>
            {([
              ["Total No Of Doctors", c.totalDoctors, false], ["Total No Of Doctors Met", c.doctorsMet, false], ["Total Calls Seen", c.totalCallsSeen, true],
              ["No of N.L Drs Met", c.nlDrsMet, false], ["Coverage", `${c.coveragePct}%`, false], ["Call Average", c.callAverage, true],
              ["No of TP Deviation", c.tpDeviation, false], ["No of Joint Work Days", c.jointWorkDays, false], ["Joint Work Call Avg", c.jointWorkCallAvg, false],
              ["Chemist POB Value", c.chemistPobValue.toFixed(2), false], ["Chemist Met", c.chemistMet, false], ["Chemist Seen", c.chemistSeen, false], ["Chemist Call Avg", c.chemistCallAvg, false]
            ] as [string, string | number, boolean][]).map(([label, value, bold]) => (
              <tr key={label} className={bold ? "font-bold" : ""}><td className={td + " text-left"}>{label}</td><td className={td}>{value}</td></tr>
            ))}
          </tbody>
        </table>
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-yellow-300"><th className={th}>Joint Work Details</th><th className={th}>No of Dates</th><th className={th}>No of Calls</th></tr></thead>
          <tbody>
            {report.jointWorkDetails.rows.map((j) => <tr key={j.name}><td className={td + " text-left"}>{j.name}</td><td className={td}>{j.dates}</td><td className={td}>{j.calls}</td></tr>)}
            <tr className="font-bold"><td className={td + " text-left"}>ZTotal</td><td className={td}>{report.jointWorkDetails.total.dates}</td><td className={td}>{report.jointWorkDetails.total.calls}</td></tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-muted">
        Drs POB / Chemist POB are values in Rs (per-product POB value, else quantity x the product master rate, else the POB amount entered on the call). Locked Date is when the DCR date was auto-locked after the company delay window; Released Date comes from the admin Delayed Release action. Dev = a worked day with no Tour Plan entry; No of TP Deviation also counts planned days with no DCR. DCRs submitted before the field app captured POB have none.</p>
    </div>
  );
}

export function DcrAnalysisReport() {
  const searchParams = useSearchParams();
  const qpCode = searchParams.get("employeeCode") || "";
  const qpMonth = searchParams.get("month") || "";
  const employees = useFieldForceOptions();
  const [employeeCode, setEmployeeCode] = useState(qpCode);
  const [individual, setIndividual] = useState(!!qpCode);
  const [baseLevel, setBaseLevel] = useState("");
  const [team, setTeam] = useState<MisTeamMember[]>([]);
  const [month, setMonth] = useState(qpMonth ? parseInt(qpMonth.slice(5, 7), 10) : NOW.getMonth() + 1);
  const [year, setYear] = useState(qpMonth ? parseInt(qpMonth.slice(0, 4), 10) : THIS_YEAR);
  const [result, setResult] = useState<DcrAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBaseLevel("");
    if (!employeeCode) { setTeam([]); return; }
    let alive = true;
    apiClient.misTeam(employeeCode).then((r) => { if (alive) setTeam(r.data); }).catch(() => { if (alive) setTeam([]); });
    return () => { alive = false; };
  }, [employeeCode]);

  async function run(code: string, individualOnly: boolean, base: string, key: string) {
    setLoading(true); setError("");
    try { setResult((await apiClient.dcrAnalysis({ employeeCode: code, month: key, individual: individualOnly, baseLevel: base })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  // Drill-down links from POB Wise - Periodically arrive with ?employeeCode=&month=.
  useEffect(() => {
    if (qpCode && qpMonth) void run(qpCode, true, "", qpMonth);
  }, [qpCode, qpMonth]);

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-3xl">
        <ScreenTitle>DCR Analysis</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={employeeCode} onChange={setEmployeeCode} employees={employees} label="Field Force Name" />
          <label className="flex items-center gap-2 h-9 font-body-sm text-body-sm text-text-primary">
            <input type="checkbox" checked={individual} onChange={(e) => setIndividual(e.target.checked)} /> Individual - Manager Only
          </label>
        </div>
        {team.length > 0 && !individual && (
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Base Level</span>
            <select className={SELECT + " min-w-[260px]"} value={baseLevel} onChange={(e) => setBaseLevel(e.target.value)}>
              <option value="">---Select Clear---</option>
              {team.map((t) => <option key={t.employeeCode} value={t.employeeCode}>{t.name} - {t.designation} - {t.territory}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-wrap items-end gap-4">
          <MonthYearSelect month={month} year={year} onChange={(mo, yr) => { setMonth(mo); setYear(yr); }} />
        </div>
        <div className="flex justify-center">
          <button type="button" className={GO} disabled={!employeeCode || loading} onClick={() => run(employeeCode, individual, baseLevel, ym(year, month))}>{loading ? "Loading..." : "Go"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
        <p className="text-xs text-text-muted">Leave Base Level on the default to report for the manager&apos;s whole team; tick Individual - Manager Only for the manager alone.</p>
      </div>
      {result && (
        <ReportModal title="DCR Analysis" fileName={`dcr-analysis-${result.month}`} onClose={() => setResult(null)}>
          {result.reports.map((r) => <DcrAnalysisBlock key={r.employee.employeeCode} report={r} />)}
          {result.truncated && <p className="text-xs text-text-muted">Showing the first 100 field force members.</p>}
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 4 -- Visit Analysis ════════════════════════════════════════════
export function VisitAnalysisReport() {
  const router = useRouter();
  const employees = useFieldForceOptions();
  const [employeeCode, setEmployeeCode] = useState("");
  const [level, setLevel] = useState("MR");
  const [type, setType] = useState("");
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<VisitAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGo() {
    setLoading(true); setError("");
    try { setResult((await apiClient.visitAnalysis({ employeeCode, level, fromMonth: fromKey, toMonth: toKey, type })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  const groupHeader = result?.type || "Category";
  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-4xl">
        <ScreenTitle>Visit Analysis</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={employeeCode} onChange={setEmployeeCode} employees={employees} label="Field Force Name" />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Level</span>
            <select className={SELECT} value={level} onChange={(e) => setLevel(e.target.value)}><option>MR</option><option>Manager</option></select>
          </div>
          <MonthYearRangePicker {...range} onChange={setRange} />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Type</span>
            <select className={SELECT} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">---Select---</option><option>Category</option><option>Speciality</option><option>Class</option><option>Campaign</option>
            </select>
          </div>
        </div>
        <div className="flex justify-center">
          <button type="button" className={GO} disabled={!employeeCode || !type || loading} onClick={handleGo}>{loading ? "Loading..." : "Go"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>
      {result && (
        <ReportModal title="Visit Analysis" fileName={`visit-analysis-${result.type.toLowerCase()}`} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold text-purple-800">Visit Analysis Of {result.type} Wise Between - {shortMonth(result.months[0])} To {shortMonth(result.months[result.months.length - 1])}</h3>
          <p className="text-center text-sm font-semibold text-red-600">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          {!result.campaignsAvailable && (
            <p className="text-sm text-status-warning bg-surface-subtle rounded p-2">No Doctor - Campaign mappings exist for this team (Doctor - Campaign Map master is empty), so there is no Campaign grouping to show. Nothing has been fabricated.</p>
          )}
          <table className="w-full text-xs border-collapse">
            <thead className={tealHead}>
              <tr>
                {["S.No", "Emp Code", "FieldForce Name", "Designation", "HQ", "DOJ", "Last DCR Recvd", "Month", groupHeader].map((h) => <th key={h} className={th} rowSpan={3}>{h}</th>)}
                <th className={th} colSpan={9}>Dr Call Detail</th><th className={th} colSpan={4}>Total Dr Calls</th><th className={th} colSpan={4}>Call Details</th><th className={th} colSpan={4}>Daywise Detail</th><th className={th} colSpan={3}>Territory Coverage</th>
              </tr>
              <tr>
                <th className={th} colSpan={3}>Total</th><th className={th} colSpan={3}>V1</th><th className={th} colSpan={3}>V2</th>
                {["Morning Calls", "Evening Calls", "Both Calls", "Dr Call average", "Dr Met 1 Times", "Dr Met 2 Times", "Dr Met Above 2 Times", "Dr missed", "Avail Work Days", "Field Work", "Leave", "Other", "HQ Worked", "EX Worked", "OS Worked"].map((h) => <th key={h} className={th} rowSpan={2}>{h}</th>)}
              </tr>
              <tr>{[0, 1, 2].map((i) => <Fragment key={i}><th className={th}>List Dr</th><th className={th}>Dr Met</th><th className={th}>Dr Seen</th></Fragment>)}</tr>
            </thead>
            <tbody>
              {result.rows.length === 0 && <tr><td className={td} colSpan={33}>No {result.type.toLowerCase()} data for this selection.</td></tr>}
              {result.rows.map((r, i) => (
                <tr key={`${r.employeeCode}-${r.month}-${r.group}`} className="bg-pink-100">
                  <td className={td}>{i + 1}</td><td className={td}>{r.employeeCode}</td><td className={td}>{r.name}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td>
                  <td className={td}>{dmy(r.doj)}</td><td className={td}>{dmy(r.lastDcr)}</td>
                  <td className={td + " text-blue-700 font-bold underline cursor-pointer"} onClick={() => router.push(`${MIS_BASE}/manager-analysis/coverage-analysis-1?employeeCode=${r.employeeCode}&month=${r.month}`)}>{shortMonth(r.month)}</td>
                  <td className={td}>{r.group}</td>
                  {[r.total, r.v1, r.v2].map((b, bi) => <Fragment key={bi}><td className={td}>{dash(b.list)}</td><td className={td}>{dash(b.met)}</td><td className={td}>{dash(b.seen)}</td></Fragment>)}
                  <td className={td}>{dash(r.morning)}</td><td className={td}>{dash(r.evening)}</td><td className={td}>{dash(r.both)}</td><td className={td}>{dash(r.callAvg)}</td>
                  <td className={td}>{dash(r.met1)}</td><td className={td}>{dash(r.met2)}</td><td className={td}>{dash(r.metAbove2)}</td><td className={td + " text-red-600 font-bold"}>{dash(r.missed)}</td>
                  <td className={td}>{r.daywise.avail}</td><td className={td}>{dash(r.daywise.fieldWork)}</td><td className={td}>{dash(r.daywise.leave)}</td><td className={td}>{dash(r.daywise.other)}</td>
                  <td className={td}>{dash(r.territory.hq)}</td><td className={td}>{dash(r.territory.ex)}</td><td className={td}>{dash(r.territory.os)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-text-muted space-y-1">
            <p>Each field force member has one row per month per {result.type.toLowerCase()} (the {result.type} column is the grouping this report is run by; it is the only addition to the legacy column set).</p>
            <p>V1 / V2 split the {result.type.toLowerCase()}&apos;s doctors by their planned visit frequency from the Doctor - Classification master (Monthly or less = V1, Twice a Month / Fortnightly = V2; Weekly doctors appear under Total only). Dr Met 1 / 2 / Above 2 Times are actual visits that month; Dr Seen counts calls.</p>
            {result.type === "Category" && <p>Category is the doctor category (Nil / CORE / N CORE / S CORE) set on the Doctor master.</p>}
          </div>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 5 -- Sales Details ═════════════════════════════════════════════
function sumTriples(list: SalesTriple[]): SalesTriple {
  const total = list.reduce((s, t) => s + t.total, 0);
  const visited = list.reduce((s, t) => s + t.visited, 0);
  const productive = list.reduce((s, t) => s + t.productive, 0);
  const missed = list.reduce((s, t) => s + t.missed, 0);
  return { total, visited, productive, missed, missedPct: total > 0 ? Number(((missed / total) * 100).toFixed(2)) : 0 };
}

function SalesEmployeeTable({ rows }: { rows: SalesEmployeeRow[] }) {
  const totals = { listed: sumTriples(rows.map((r) => r.listed)), unlisted: sumTriples(rows.map((r) => r.unlisted)), chemist: sumTriples(rows.map((r) => r.chemist)) };
  const cells = (t: SalesTriple, cls = "") => [t.total, t.visited, t.productive, t.missed, t.missedPct].map((v, i) => <td key={i} className={td + " " + cls}>{v}</td>);
  const sub = ["Total Customer's", "Visited", "Productive Calls", "Missed", "Missed (%)"];
  return (
    <table className="w-full text-sm border-collapse">
      <thead className={tealHead}>
        <tr>{["S.No", "Fieldforce Name", "Designation", "HQ"].map((h) => <th key={h} className={th} rowSpan={2}>{h}</th>)}<th className={th} colSpan={5}>Listed Doctor</th><th className={th} colSpan={5}>UnListed Doctor</th><th className={th} colSpan={5}>Chemist</th></tr>
        <tr>{[0, 1, 2].map((g) => sub.map((s) => <th key={`${g}${s}`} className={th}>{s}</th>))}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.employeeCode} className="bg-pink-100">
            <td className={td}>{i + 1}</td><td className={td}>{r.name}{r.isSelf ? "(Self)" : ""}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td>
            {cells(r.listed)}{cells(r.unlisted)}{cells(r.chemist)}
          </tr>
        ))}
        <tr className="font-bold text-red-600"><td className={td} colSpan={4}>Total</td>{cells(totals.listed)}{cells(totals.unlisted)}{cells(totals.chemist)}</tr>
      </tbody>
    </table>
  );
}

export function SalesDetailsReport() {
  const managers = useManagers();
  const [mode, setMode] = useState("Statewise");
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [result, setResult] = useState<SalesDetailsResult | null>(null);
  const [drill, setDrill] = useState<SalesDetailsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const key = ym(year, month);

  async function handleView() {
    setLoading(true); setError(""); setDrill(null);
    try { setResult((await apiClient.salesDetails({ mode, month: key, employeeCode: mode === "Managerwise" ? employeeCode : undefined })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  async function openState(state: string) {
    try { setDrill((await apiClient.salesDetails({ mode: "Statewise", month: key, state })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load state"); }
  }

  const title = `Sales Details for the Month of ${MONTH_NAMES[month - 1].slice(0, 3)} ${year}`;
  const money = (n: number) => n.toFixed(2);
  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-3xl">
        <ScreenTitle>Sales Details</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }}><option>Statewise</option><option>Managerwise</option></select>
          </div>
          {mode === "Managerwise" && <FieldForceSelect value={employeeCode} onChange={setEmployeeCode} employees={managers} label="Fieldforce Name" />}
          <MonthYearSelect month={month} year={year} onChange={(mo, yr) => { setMonth(mo); setYear(yr); }} />
        </div>
        <div className="flex justify-center">
          <button type="button" className={GO} disabled={loading || (mode === "Managerwise" && !employeeCode)} onClick={handleView}>{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>
      {result && (
        <ReportModal title={title} fileName={`sales-details-${key}`} onClose={() => { setResult(null); setDrill(null); }}>
          <h3 className="text-center text-lg font-bold text-purple-800">{title}</h3>
          {result.mode === "Statewise" && !drill && result.states && (
            <>
              <p className="text-center text-sm font-semibold text-red-600">Fieldforce Name: admin</p>
              <table className="w-full text-sm border-collapse">
                <thead className={tealHead}>
                  <tr><th className={th} rowSpan={2}>S.No</th><th className={th} rowSpan={2}>State Name</th><th className={th} colSpan={3}>Listed Doctor</th><th className={th} colSpan={3}>UnListed Doctor</th><th className={th} colSpan={3}>Chemist</th><th className={th} rowSpan={2}>Total Sales Value</th></tr>
                  <tr>{[0, 1, 2].map((g) => ["Till Yesterday", "Today", "Total"].map((s) => <th key={`${g}${s}`} className={th}>{s}</th>))}</tr>
                </thead>
                <tbody>
                  {result.states.map((s, i) => (
                    <tr key={s.state} className="bg-pink-100">
                      <td className={td}>{i + 1}</td>
                      <td className={td + " " + link} onClick={() => openState(s.state)}>{s.state}</td>
                      {[s.listed, s.unlisted, s.chemist].map((c, ci) => <Fragment key={ci}><td className={td}>{money(c.till)}</td><td className={td}>{money(c.today)}</td><td className={td}>{money(c.total)}</td></Fragment>)}
                      <td className={td + " text-red-600 font-bold"}>{money(s.totalSalesValue)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className={td} colSpan={2}>Total</td>
                    {(["listed", "unlisted", "chemist"] as const).map((k) => (
                      <Fragment key={k}>
                        <td className={td}>{money(result.states!.reduce((a, s) => a + s[k].till, 0))}</td>
                        <td className={td}>{money(result.states!.reduce((a, s) => a + s[k].today, 0))}</td>
                        <td className={td}>{money(result.states!.reduce((a, s) => a + s[k].total, 0))}</td>
                      </Fragment>
                    ))}
                    <td className={td + " text-red-600"}>{money(result.states.reduce((a, s) => a + s.totalSalesValue, 0))}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-text-muted">Values are POB sales value in Rs (explicit value, else quantity x product master rate). Listed Doctor POB only exists for calls where POB was entered (new DCR field); UnListed Doctor visits carry no POB capture, so that group is genuinely 0.00. Click a state to see its field force.</p>
            </>
          )}
          {drill && drill.rows && (
            <>
              <button type="button" className="text-sm underline text-blue-600" onClick={() => setDrill(null)}>&larr; Back to states</button>
              <p className="text-center text-sm font-semibold text-red-600">State: {drill.state}</p>
              <SalesEmployeeTable rows={drill.rows} />
            </>
          )}
          {result.mode === "Managerwise" && result.rows && (
            <>
              <p className="text-center text-sm font-semibold text-red-600">Fieldforce Name: {result.fieldForceName} - {result.designation} - {result.hq}</p>
              <SalesEmployeeTable rows={result.rows} />
              <p className="text-xs text-text-muted">Total Customer&apos;s = mapped master records (doctors, unlisted doctors, chemists). Visited = distinct customers called on in the month; Productive Calls = those with POB; Missed = Total - Visited. UnListed productive calls are 0 (no POB capture on those visits).</p>
            </>
          )}
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 6 -- POB Wise ══════════════════════════════════════════════════
function pobCols(products: string[]) {
  return ["Drs POB", "Chem POB", ...products];
}
function pobCellValues(cell: PobCell, products: string[]) {
  return [cell.drs, cell.chem, ...products.map((p) => cell.products[p] || 0)];
}

export function PobWiseReport() {
  const employees = useFieldForceOptions();
  const productList = useProducts();
  const [employeeCode, setEmployeeCode] = useState("");
  const [mode, setMode] = useState("Drs/Chem POB wise");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<PobWiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const productMode = mode === "With Produc POB/Rx";

  async function handleView() {
    setLoading(true); setError("");
    try { setResult((await apiClient.pobWise({ employeeCode, fromMonth: fromKey, toMonth: toKey, mode, products: productList.filter((p) => selected.has(p)) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  const products = result?.products || [];
  const months = result?.months || [];
  const fromLabel = months[0] ? longMonth(months[0]).replace(" - ", " ") : "";
  const toLabel = months[months.length - 1] ? longMonth(months[months.length - 1]).replace(" - ", " ") : "";
  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-4xl">
        <ScreenTitle>POB Wise</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={employeeCode} onChange={setEmployeeCode} employees={employees} label="Filed Force Name" />
          <MonthYearRangePicker {...range} onChange={setRange} />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }}><option>Drs/Chem POB wise</option><option>With Produc POB/Rx</option></select>
          </div>
        </div>
        {productMode && <ProductGrid products={productList} selected={selected} onToggle={(p) => setSelected((s) => toggled(s, p))} />}
        <div className="flex justify-center">
          <button type="button" className={GO} disabled={!employeeCode || loading || (productMode && selected.size === 0)} onClick={handleView}>{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>
      {result && (
        <ReportModal title="POB Wise Report" fileName="pob-wise" onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold text-purple-800">{result.mode === "With Produc POB/Rx" ? "Product POB Wise Report" : "POB Wise Report"} for the month of {fromLabel} To {toLabel}</h3>
          <p className="text-center text-sm font-semibold text-red-600">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          <table className="w-full text-sm border-collapse">
            <thead className={tealHead}>
              <tr>
                {["S.No", "Emp Code", "FieldForce Name", "Designation Name", "HQ", "Joining Date"].map((h) => <th key={h} className={th} rowSpan={2}>{h}</th>)}
                {months.map((m) => <th key={m} className={th} colSpan={2 + products.length}>{shortMonth(m)}</th>)}
                {productMode && <th className={th} colSpan={2 + products.length}>Total</th>}
              </tr>
              <tr>
                {months.map((m) => pobCols(products).map((c) => <th key={m + c} className={th}>{c}</th>))}
                {productMode && pobCols(products).map((c) => <th key={"t" + c} className={th}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={r.employeeCode} className="bg-pink-100">
                  <td className={td}>{i + 1}</td><td className={td}>{r.employeeCode}</td><td className={td}>{r.name}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td><td className={td}>{dmy(r.joinDate)}</td>
                  {months.map((m) => pobCellValues(r.perMonth[m], products).map((v, vi) => <td key={m + vi} className={td}>{dash(v)}</td>))}
                  {productMode && pobCellValues(r.total, products).map((v, vi) => <td key={"t" + vi} className={td}>{dash(v)}</td>)}
                </tr>
              ))}
              <tr className="text-red-600 font-bold">
                <td className={td} colSpan={6}>Grand Total</td>
                {months.map((m) => pobCellValues(result.grandTotal.perMonth[m], products).map((v, vi) => <td key={m + vi} className={td}>{dash(v)}</td>))}
                {productMode && pobCellValues(result.grandTotal.total, products).map((v, vi) => <td key={"t" + vi} className={td}>{dash(v)}</td>)}
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-text-muted">Drs POB / Chem POB are counts of calls that carried POB. Product columns are POB quantity. Shows the selected field force and everyone reporting to them.</p>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 7 -- POB Wise - Periodically ═══════════════════════════════════
export function PobPeriodicReport() {
  const router = useRouter();
  const employees = useFieldForceOptions();
  const productList = useProducts();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";
  const [employeeCode, setEmployeeCode] = useState("");
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<PobPeriodicResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleView() {
    setLoading(true); setError("");
    try { setResult((await apiClient.pobPeriodic({ employeeCode, from, to, products: productList.filter((p) => selected.has(p)) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  const drill = useMemo(
    () => (code: string) => router.push(`${MIS_BASE}/analysis/dcr?employeeCode=${code}&month=${from.slice(0, 7)}`),
    [router, from]
  );

  const products = result?.products || [];
  const pretty = (d: string) => {
    const dt = new Date(d + "T00:00:00Z");
    return `${MONTH_NAMES[dt.getUTCMonth()].slice(0, 3)} ${dt.getUTCDate()} ${dt.getUTCFullYear()}`;
  };
  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-4xl">
        <ScreenTitle>POB Wise - Periodically</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={employeeCode} onChange={setEmployeeCode} employees={employees} label="Filed Force Name" />
          <div className="flex flex-col gap-1"><span className={LABEL}>Eff From</span><input type="date" className={SELECT} value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="flex flex-col gap-1"><span className={LABEL}>Eff To</span><input type="date" className={SELECT} value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        <ProductGrid products={productList} selected={selected} onToggle={(p) => setSelected((s) => toggled(s, p))} />
        <div className="flex justify-center">
          <button type="button" className={GO} disabled={!employeeCode || !from || !to || loading} onClick={handleView}>{loading ? "Loading..." : "View"}</button>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
      </div>
      {result && (
        <ReportModal title="Rx Report" fileName="pob-wise-periodically" onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold text-purple-800">Rx Report between <span className="text-red-600">{pretty(result.from)}</span> To <span className="text-red-600">{pretty(result.to)}</span></h3>
          <p className="text-center text-sm font-semibold text-red-600">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          <table className="w-full text-sm border-collapse">
            <thead className={tealHead}>
              <tr>
                {["S.No", "Emp Code", "FieldForce Name", "Designation Name", "HQ", "Joining Date"].map((h) => <th key={h} className={th} rowSpan={2}>{h}</th>)}
                <th className={th} colSpan={7 + products.length}>{dmy(result.from)} To {dmy(result.to)}</th>
              </tr>
              <tr>{["FWD", "Morning Calls", "Evening Calls", "Drs Seen", "Call Avg", "Drs POB", "Chem POB", ...products].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={r.employeeCode} className={i === 0 ? "bg-yellow-200" : "bg-pink-100"}>
                  <td className={td}>{i + 1}</td><td className={td}>{r.employeeCode}</td><td className={td}>{r.name}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td><td className={td}>{dmy(r.joinDate)}</td>
                  {[r.fwd, r.morning, r.evening, r.drsSeen].map((v, vi) => (
                    <td key={vi} className={td}>{v > 0 ? <span className={link} onClick={() => drill(r.employeeCode)}>{v}</span> : "-"}</td>
                  ))}
                  <td className={td}>{dash(r.callAvg)}</td><td className={td}>{dash(r.drsPob)}</td><td className={td}>{dash(r.chemPob)}</td>
                  {products.map((p) => <td key={p} className={td}>{dash(r.products[p] || 0)}</td>)}
                </tr>
              ))}
              <tr className="font-bold">
                <td className={td}>{result.rows.length + 1}</td><td className={td} colSpan={5}></td>
                <td className={td}>{dash(result.totals.fwd)}</td><td className={td}>{dash(result.totals.morning)}</td><td className={td}>{dash(result.totals.evening)}</td><td className={td}>{dash(result.totals.drsSeen)}</td>
                <td className={td}>{dash(result.totals.callAvg)}</td><td className={td}>{dash(result.totals.drsPob)}</td><td className={td}>{dash(result.totals.chemPob)}</td>
                {products.map((p) => <td key={p} className={td}>{dash(result.totals.products[p] || 0)}</td>)}
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-text-muted">FWD = distinct days with a DCR in the period; Drs Seen = doctor calls; Call Avg = Drs Seen / FWD. The first (yellow) row is the selected field force, then their team. Blue numbers open that person&apos;s DCR Analysis. Doctor POB exists only for calls where POB was entered (new field not yet captured by the field app); product columns are POB quantity.</p>
        </ReportModal>
      )}
    </div>
  );
}
