"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FieldForceSelect } from "@/components/field-force-select";
import {
  GO, LABEL, SELECT, MONTH_NAMES, NOW, THIS_YEAR, ReportModal, ScreenTitle, MonthYearSelect, useRange, ym, longMonth, dmy, dash, th, td, tealHead, link
} from "@/components/mis-analysis-panels";
import {
  apiClient,
  type AssessmentResult,
  type ClassWiseResult,
  type ForceDoctor,
  type MissedCallResult,
  type RepVsManagerResult,
  type ReviewReportResult,
  type SingleDoctorResult,
  type WorkHygieneResult
} from "@/lib/api-client";

// Round 40 -- MIS Reports legacy-parity screens (admin). Every number comes
// from the backend's mis-reports-2-compute.ts; blank cells mean "no real
// source / zero", never an invented value. Gaps are footnoted on-screen.

const TH = th + " " + tealHead;
const CARD = "bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-4xl";
const SELECT_ALL_LABEL = "--- Select the Field force ---";

function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs text-text-muted italic">{children}</p>;
}
function Err({ msg }: { msg: string }) {
  return msg ? <p className="text-sm text-status-danger">{msg}</p> : null;
}
function RangeFields({ range, setRange, hideTo }: { range: ReturnType<typeof useRange>["range"]; setRange: ReturnType<typeof useRange>["setRange"]; hideTo?: boolean }) {
  return (
    <>
      <div className="flex items-end gap-2">
        <span className={LABEL}>From</span>
        <MonthYearSelect month={range.fromMonth} year={range.fromYear} onChange={(m, y) => setRange({ ...range, fromMonth: m, fromYear: y })} />
      </div>
      {!hideTo && (
        <div className="flex items-end gap-2">
          <span className={LABEL}>To</span>
          <MonthYearSelect month={range.toMonth} year={range.toYear} onChange={(m, y) => setRange({ ...range, toMonth: m, toYear: y })} />
        </div>
      )}
    </>
  );
}
function useMonthYear() {
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  return { month, year, key: ym(year, month), set: (m: number, y: number) => { setMonth(m); setYear(y); } };
}
function monthLong(key: string) {
  const [y, m] = key.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES[m - 1]} ${y}`;
}
function monthShort(key: string) {
  const [y, m] = key.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}
function fmt(n: number | null | undefined, dp = 2) {
  if (n == null || n === 0) return "-";
  return Number.isInteger(n) ? String(n) : n.toFixed(dp);
}
function blank(n: number | null | undefined) {
  return n == null || n === 0 ? "" : Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// ═══ Item 1 -- Work Hygiene Report ═══════════════════════════════════════
export function WorkHygieneReport() {
  const [code, setCode] = useState("");
  const my = useMonthYear();
  const [result, setResult] = useState<WorkHygieneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.workHygiene({ employeeCode: code, month: my.key })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Work Hygeine Report</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel={SELECT_ALL_LABEL} />
          <MonthYearSelect month={my.month} year={my.year} onChange={my.set} />
          <button type="button" className={GO} disabled={!code || loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title={`Work Hygiene Report - ${monthLong(result.month)}`} fileName={`Work_Hygiene_${result.month}`} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold text-purple-800">Work Hygiene Report - {monthLong(result.month)}</h3>
          <p className="text-sm font-semibold">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {["S.No", "Emp.Code", "DOJ", "FieldForce Name", "Designation Name", "HQ", "First Level Manager", "Second Level Manager", "Last DCR Date", "No of FWD", "Leave", "Listed Dr. Visits", "Lst. Call Avg", "Unlisted Dr.Visits", "Unlst. Call Avg", "Cumulative Call Avg", "DCR Submitted days", "App. Pending Dates", "Delay Reporting Dates", "Total Delay Reporting"].map((h) => <th key={h} className={TH}>{h}</th>)}
                {result.designations.map((d) => <th key={d} className={TH}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={r.employeeCode} className={r.isSelected ? "bg-yellow-200" : "bg-pink-100"}>
                  <td className={td}>{i + 1}</td><td className={td}>{r.employeeCode}</td>
                  <td className={td}>{r.doj ? dmy(r.doj).replace(/\//g, "-") : "-"}</td>
                  <td className={td}>{r.name}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td>
                  <td className={td}>{r.firstLevelManager || "-"}</td><td className={td}>{r.secondLevelManager || "-"}</td>
                  <td className={td}>{r.lastDcrDate ? dmy(r.lastDcrDate).replace(/\//g, "-") : "-"}</td>
                  <td className={td}>{dash(r.fwd)}</td><td className={td}>{dash(r.leave)}</td>
                  <td className={td}>{dash(r.listedVisits)}</td><td className={td}>{fmt(r.listedCallAvg)}</td>
                  <td className={td}>{dash(r.unlistedVisits)}</td><td className={td}>{fmt(r.unlistedCallAvg)}</td>
                  <td className={td}>{fmt(r.cumulativeCallAvg)}</td><td className={td}>{dash(r.dcrSubmittedDays)}</td>
                  <td className={td}>{dash(r.approvalPendingDates)}</td><td className={td}>{dash(r.delayReportingDates)}</td><td className={td}>{dash(r.totalDelayReporting)}</td>
                  {result.designations.map((d) => <td key={d} className={td}>{dash(r.joint[d] || 0)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <Note>Second Level Manager shows only where the employee has a two-level reporting chain. Approval pending = DCRs still in SUBMITTED status. Joint-work columns count days worked with each designation.</Note>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 2 -- Class Wise View ═══════════════════════════════════════════
export function ClassWiseViewReport() {
  const [code, setCode] = useState("");
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<ClassWiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.classWise({ employeeCode: code, fromMonth: fromKey, toMonth: toKey })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Class Wise View</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Fieldforce Name" clearLabel={SELECT_ALL_LABEL} />
          <RangeFields range={range} setRange={setRange} />
          <button type="button" className={GO} disabled={!code || loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Class wise view" fileName={`Class_Wise_View_${fromKey}_${toKey}`} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold text-purple-800">Class wise view from {monthShort(result.months[0])} To {monthShort(result.months[result.months.length - 1])}</h3>
          <p className="text-sm font-semibold">Field Force Name : {result.fieldForceName} - {result.designation} - {result.hq}</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {["Sl No", "Listed dr Name", "Speciality Name", "Category Name", "Class Name", "Territory Name"].map((h) => <th key={h} className={TH} rowSpan={2}>{h}</th>)}
                {result.months.map((m) => <th key={m} className={TH} colSpan={2}>{monthShort(m)}</th>)}
                <th className={TH} rowSpan={2}>Total Amount</th>
              </tr>
              <tr>{result.months.map((m) => <Fragment key={m}><th className={TH}>Business Amount</th><th className={TH}>Class Name</th></Fragment>)}</tr>
            </thead>
            <tbody>
              {result.rows.length === 0 && <tr><td className={td} colSpan={7 + result.months.length * 2}>No mapped doctors.</td></tr>}
              {result.rows.map((r, i) => (
                <tr key={`${r.doctorName}-${i}`}>
                  <td className={td}>{i + 1}</td><td className={td + " text-left"}>{r.doctorName}</td><td className={td}>{r.speciality}</td>
                  <td className={td}>{r.category}</td><td className={td}>{r.className}</td><td className={td}>{r.territory}</td>
                  {result.months.map((m) => <Fragment key={m}><td className={td}>{blank(r.perMonth[m]?.amount)}</td><td className={td}>{r.perMonth[m]?.className || "Nil"}</td></Fragment>)}
                  <td className={td}>{blank(r.total)}</td>
                </tr>
              ))}
              <tr className="font-bold"><td className={td} colSpan={6 + result.months.length * 2}>Total</td><td className={td}>{blank(result.grandTotal)}</td></tr>
            </tbody>
          </table>
          <Note>Business Amount is the real POB recorded on doctor DCRs (blank when none; the field app does not capture doctor POB on older DCRs). Class Name is Nil when the doctor has no A/B/C class assigned.</Note>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 3 -- DCR Analysis Dump ═════════════════════════════════════════
export function DcrAnalysisDumpReport() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const my = useMonthYear();
  const [days, setDays] = useState<Set<number>>(new Set());
  const [vacant, setVacant] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const toggle = (d: number) => setDays((prev) => { const n = new Set(prev); if (n.has(d)) n.delete(d); else n.add(d); return n; });
  async function download(format: "csv" | "xlsx") {
    setBusy(format); setError("");
    try {
      await apiClient.downloadDcrDump({ employeeCode: code || "admin", month: my.key, days: Array.from(days).sort((a, b) => a - b), vacant, format });
    } catch (e) { setError(e instanceof Error ? e.message : "Download failed"); }
    finally { setBusy(""); }
  }
  const rows = [[1, 7], [8, 14], [15, 21], [22, 28], [29, 31]];
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex items-start justify-between">
          <ScreenTitle>DCR Analysis Dump</ScreenTitle>
          <button type="button" className="h-8 px-4 rounded-lg border border-border-subtle text-sm font-semibold" onClick={() => router.back()}>Back</button>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Fieldforce Name" clearLabel="--- All (whole company) ---" />
          <MonthYearSelect month={my.month} year={my.year} onChange={my.set} />
        </div>
        <div className="space-y-1">
          <span className={LABEL}>Day (none ticked = all days)</span>
          {rows.map(([a, b]) => (
            <div key={a} className="flex gap-4">
              {Array.from({ length: b - a + 1 }, (_, i) => a + i).map((d) => (
                <label key={d} className="flex items-center gap-1 text-sm w-10"><input type="checkbox" checked={days.has(d)} onChange={() => toggle(d)} />{d}</label>
              ))}
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={vacant} onChange={(e) => setVacant(e.target.checked)} /> Vacant</label>
        <div className="flex gap-8">
          <button type="button" className={link} disabled={!!busy} onClick={() => download("csv")}>{busy === "csv" ? "Preparing..." : "Download CSV"}</button>
          <button type="button" className={link} disabled={!!busy} onClick={() => download("xlsx")}>{busy === "xlsx" ? "Preparing..." : "Download Excel"}</button>
        </div>
        <Err msg={error} />
        <Note>One row per call (listed doctor, chemist, stockist/unlisted) plus leave days. Vacant adds inactive vacant manager seats (no vacancy flag exists, so this is derived). Address1, Qualification and POB are blank/NA where the field app does not capture them.</Note>
      </div>
    </div>
  );
}

// ═══ Item 4 -- Missed Call ═══════════════════════════════════════════════
const MISSED_COLORS: Record<string, string> = { BE: "bg-pink-200", ABM: "bg-yellow-200", RBM: "bg-orange-300" };

export function MissedCallReport() {
  const [mode, setMode] = useState("Listed Doctor");
  const detailed = mode !== "Listed Doctor";
  const [code, setCode] = useState("");
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<MissedCallResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.missedCall({ mode, employeeCode: code || "admin", fromMonth: fromKey, toMonth: detailed ? fromKey : toKey })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); }
    finally { setLoading(false); }
  }
  const catColor: Record<string, string> = { Nil: "bg-sky-100", "CORE": "bg-sky-100" };
  void catColor;
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Missed Call</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }}>
              <option>Listed Doctor</option><option>Call Monitor(Detailed)</option>
            </select>
          </div>
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel={detailed ? "--Select--" : "--- All (admin) ---"} />
          <RangeFields range={range} setRange={setRange} hideTo={detailed} />
          <button type="button" className={GO} disabled={loading || (detailed && !code)} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && result.mode === "Listed Doctor" && result.months && result.rows && (
        <ReportModal title="Missed Call Report" fileName={`Missed_Call_${fromKey}_${toKey}`} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold text-purple-800">Missed Call Report From {monthLong(result.months[0])} to {monthLong(result.months[result.months.length - 1])}</h3>
          <p className="text-sm font-semibold">Field Force Name : {result.fieldForceName}</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {["S.No", "FieldForce Name", "Designation Name", "HQ"].map((h) => <th key={h} className={TH} rowSpan={2}>{h}</th>)}
                {result.months.map((m) => <th key={m} className={TH} colSpan={3}>{monthLong(m)}</th>)}
              </tr>
              <tr>{result.months.map((m) => <Fragment key={m}><th className={TH}>Listed DR</th><th className={TH}>Met</th><th className={TH}>Missed</th></Fragment>)}</tr>
            </thead>
            <tbody>
              {result.rows.length === 0 && <tr><td className={td} colSpan={4 + result.months.length * 3}>No field force found.</td></tr>}
              {result.rows.map((r, i) => (
                <tr key={r.employeeCode} className={MISSED_COLORS[r.designation] || ""}>
                  <td className={td}>{i + 1}</td><td className={td + " text-left"}>{r.name}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td>
                  {result.months!.map((m) => (
                    <Fragment key={m}>
                      <td className={td}>{r.isManager ? "-" : dash(r.perMonth[m]?.list || 0)}</td>
                      <td className={td}>{r.isManager ? "-" : dash(r.perMonth[m]?.met || 0)}</td>
                      <td className={td}>{r.isManager ? "-" : dash(r.perMonth[m]?.missed || 0)}</td>
                    </Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ReportModal>
      )}
      {result && result.mode !== "Listed Doctor" && result.employee && result.summary && result.visitDetails && (
        <ReportModal title="Missed Doctor List" fileName={`Missed_Doctors_${result.month}`} onClose={() => setResult(null)}>
          <div className="bg-white text-black p-3 space-y-3">
            <h3 className="text-center text-base font-bold text-green-700 underline">
              Missed Doctor List for the Month of {MONTH_NAMES[parseInt((result.month || "").slice(5, 7), 10) - 1]} ( {result.employee.name} - {result.employee.designation} - {result.employee.hq} )
            </h3>
            <div className="bg-black text-white text-center font-bold py-1">Visit Based</div>
            <table className="w-full text-xs border-collapse"><tbody>
              {chunk(result.missedDoctors || [], 10).map((row, ri) => (
                <tr key={ri}>
                  {Array.from({ length: 10 }, (_, ci) => row[ci]).map((d, ci) => (
                    <td key={ci} className={"border border-gray-300 p-1 text-center align-top " + (d ? "" : "bg-gray-200")}>
                      {d && <><div>{d.name}</div><div className="font-bold text-red-600">{d.category}</div><div className="text-[9px]">-</div></>}
                    </td>
                  ))}
                </tr>
              ))}
              {(result.missedDoctors || []).length === 0 && <tr><td className="border border-gray-300 p-2 text-center" colSpan={10}>No missed doctors.</td></tr>}
            </tbody></table>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-center">Summary</p>
                <table className="w-full text-xs border-collapse">
                  <thead><tr><th className={TH}>Description</th><th className={TH}>Count</th></tr></thead>
                  <tbody>
                    <SumRow label="No.of Listed Drs in List" v={result.summary.listedDrsInList} />
                    <SumRow label="Total No.of Calls Met" v={result.summary.callsMet} />
                    <SumRow label="Total No.of Calls Seen" v={result.summary.callsSeen} />
                    <SumRow label="Total No.of Listed Drs Missed" v={result.summary.listedDrsMissed} />
                    {(["Nil", "CORE", "N CORE", "S CORE"] as const).map((c) => <SumRow key={`t${c}`} cls="bg-sky-100" label={`Total ${c} Calls`} v={result.summary!.byCategory[c]?.total || 0} />)}
                    {(["Nil", "CORE", "N CORE", "S CORE"] as const).map((c) => <SumRow key={`m${c}`} cls="bg-pink-200" label={`${c} Calls Met`} v={result.summary!.byCategory[c]?.met || 0} />)}
                    {(["Nil", "CORE", "N CORE", "S CORE"] as const).map((c) => <SumRow key={`x${c}`} cls="bg-gray-200" label={`${c} Calls Missed`} v={result.summary!.byCategory[c]?.missed || 0} />)}
                  </tbody>
                </table>
              </div>
              <div>
                <p className="font-bold text-center">Visit Details</p>
                <table className="w-full text-xs border-collapse">
                  <thead><tr><th className={TH}>Description</th><th className={TH}>Count</th></tr></thead>
                  <tbody>
                    <SumRow label="One Visit drs Count" v={result.visitDetails.one} />
                    <SumRow label="Two Visit drs Count" v={result.visitDetails.two} />
                    <SumRow label="Three Visit drs Count" v={result.visitDetails.three} />
                    <SumRow label="More than Three Visit drs Count" v={result.visitDetails.moreThanThree} />
                  </tbody>
                </table>
              </div>
            </div>
            <Note>S CORE is always 0: the doctor map has only CORE / N CORE flags. Nil = listed doctors with no CORE mapping.</Note>
          </div>
        </ReportModal>
      )}
    </div>
  );
}
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
function SumRow({ label, v, cls = "" }: { label: string; v: number; cls?: string }) {
  return <tr className={cls}><td className={td + " text-left"}>{label}</td><td className={td}>{v}</td></tr>;
}

// ═══ Item 5 -- Single Doctor Analysis ════════════════════════════════════
export function SingleDoctorReport() {
  const [code, setCode] = useState("");
  const [doctors, setDoctors] = useState<ForceDoctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<SingleDoctorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setDoctorId(""); setDoctors([]);
    if (!code) return;
    let alive = true;
    apiClient.forceDoctors(code).then((r) => { if (alive) setDoctors(r.data); }).catch(() => { if (alive) setDoctors([]); });
    return () => { alive = false; };
  }, [code]);
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.singleDoctor({ employeeCode: code, doctorId, fromMonth: fromKey, toMonth: toKey })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); }
    finally { setLoading(false); }
  }
  const H = ({ children }: { children: ReactNode }) => <h4 className="text-base font-bold text-purple-800 mt-3">{children}</h4>;
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Single Doctor Analysis</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel="--Select--" />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Doctor Name</span>
            <select className={SELECT} style={{ minWidth: 220 }} value={doctorId} onChange={(e) => setDoctorId(e.target.value)} disabled={!code}>
              <option value="">--Select--</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <RangeFields range={range} setRange={setRange} />
          <button type="button" className={GO} disabled={!code || !doctorId || loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (() => {
        const p = result.profile;
        const months = result.months;
        const grid: [string, string][] = [["Doctor Name", p.doctorName], ["Address", p.address], ["Mobile", p.mobile], ["Email ID", p.email], ["Hospital Address", p.hospitalAddress], ["Category", p.category], ["Speciality", p.speciality], ["Class", p.className], ["Qualification", p.qualification], ["Campaign Name", p.campaignName], ["Dr Unique Code", p.drUniqueCode]];
        const monthTable = (render: (m: string) => ReactNode) => (
          <table className="w-full text-xs border-collapse"><thead><tr>{months.map((m) => <th key={m} className={TH}>{monthLong(m)}</th>)}</tr></thead><tbody><tr>{months.map((m) => <td key={m} className={td + " align-top"}>{render(m)}</td>)}</tr></tbody></table>
        );
        return (
          <ReportModal title="Single Dr Analysis" fileName={`Single_Dr_${fromKey}_${toKey}`} onClose={() => setResult(null)}>
            <h3 className="text-center text-lg font-bold text-purple-800">Single Dr Analysis From {monthLong(months[0])} to {monthLong(months[months.length - 1])}</h3>
            <p className="text-sm font-semibold">Field Force Name : {result.employee.name} - {result.employee.designation} - {result.employee.hq}</p>
            <table className="w-full text-sm border-collapse"><tbody>
              {chunk(grid, 2).map((pair, i) => (
                <tr key={i}>
                  {pair.map(([k, v]) => (
                    <Fragment key={k}>
                      <td className="border border-border-subtle p-1.5 font-semibold w-1/6">{k}</td>
                      <td className={"border border-border-subtle p-1.5 " + (k === "Doctor Name" ? "text-green-700 font-bold" : "")}>{v}</td>
                    </Fragment>
                  ))}
                  {pair.length === 1 && <td colSpan={2} className="border border-border-subtle" />}
                </tr>
              ))}
            </tbody></table>
            <H>Visit Details - Datewise</H>
            {monthTable((m) => result.perMonth[m]?.visits.length ? result.perMonth[m].visits.map((v, i) => <div key={i}>{dmy(v.date)} {v.time} {v.session}{v.workedWith ? ` (with ${v.workedWith})` : ""}</div>) : "-")}
            <H>Product Detailed and Sampled</H>
            {monthTable((m) => {
              const d = result.perMonth[m]; if (!d) return "-";
              return <>{d.detailed.map((x) => <div key={`d${x.name}`}>{x.name} - Detailed {x.count}</div>)}{d.sampled.map((x) => <div key={`s${x.name}`}>{x.name} - Sample {x.qty}</div>)}{!d.detailed.length && !d.sampled.length && "-"}</>;
            })}
            <H>Input Given</H>
            {monthTable((m) => result.perMonth[m]?.inputs.length ? result.perMonth[m].inputs.map((x) => <div key={x.name}>{x.name} - {x.qty}</div>) : "-")}
            <H>Listed drwise Remarks / Call Feedback</H>
            {monthTable((m) => result.perMonth[m]?.remarks.length ? result.perMonth[m].remarks.map((x, i) => <div key={i}>{x}</div>) : "-")}
            <H>Listed Drs Visit - Productwise</H>
            {monthTable((m) => result.perMonth[m]?.detailed.length ? result.perMonth[m].detailed.map((x) => <div key={x.name}>{x.name} : {x.count}</div>) : "-")}
            <H>Supportive Chemist</H>
            {monthTable(() => "")}
            <H>RCPA Details</H>
            {monthTable(() => "")}
            <H>CRM Details</H>
            {monthTable(() => "")}
            <H>Business Details</H>
            {monthTable((m) => blank(result.perMonth[m]?.business) || "-")}
            <Note>Supportive Chemist, RCPA and CRM sections are empty: no doctor-linked source for them exists in the system yet. Business is the POB recorded on this doctor&apos;s DCRs.</Note>
          </ReportModal>
        );
      })()}
    </div>
  );
}

// ═══ Item 6 -- Rep Vs Manager ════════════════════════════════════════════
export function RepVsManagerReport() {
  const [code, setCode] = useState("");
  const my = useMonthYear();
  const [result, setResult] = useState<RepVsManagerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.repVsManager({ employeeCode: code, month: my.key })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Rep Vs Manager</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Manager Name" clearLabel="--Select--" />
          <MonthYearSelect month={my.month} year={my.year} onChange={my.set} />
          <button type="button" className={GO} disabled={!code || loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Rep Vs Manager" fileName={`Rep_Vs_Manager_${result.month}`} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold text-purple-800">Rep Vs Manager for the Month of {monthLong(result.month)}</h3>
          <p className="text-sm font-semibold">Manager : {result.manager.name} - {result.manager.designation} - {result.manager.hq}</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {["S.No", "Rep Name", "Designation", "HQ"].map((h) => <th key={h} className={TH} rowSpan={2}>{h}</th>)}
                <th className={TH} colSpan={6}>Rep</th>
                <th className={TH} colSpan={2}>Worked With This Manager</th>
              </tr>
              <tr>
                {["FW Days", "Drs Met", "Coverage %", "Call Avg", "Chemists Met", "Joint Days"].map((h) => <th key={h} className={TH}>{h}</th>)}
                <th className={TH}>Joint Days</th><th className={TH}>Joint Calls</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-yellow-200 font-semibold">
                <td className={td}>-</td><td className={td + " text-left"}>{result.manager.name}</td><td className={td}>{result.manager.designation}</td><td className={td}>{result.manager.hq}</td>
                <td className={td}>{dash(result.manager.metrics.fwDays)}</td><td className={td}>{dash(result.manager.metrics.doctorsMet)}</td><td className={td}>{fmt(result.manager.metrics.coveragePct)}</td>
                <td className={td}>{fmt(result.manager.metrics.callAverage)}</td><td className={td}>{dash(result.manager.metrics.chemistsMet)}</td><td className={td}>{dash(result.manager.metrics.jointWorkDays)}</td>
                <td className={td}>-</td><td className={td}>-</td>
              </tr>
              {result.rows.map((r, i) => (
                <tr key={r.employeeCode}>
                  <td className={td}>{i + 1}</td><td className={td + " text-left"}>{r.name}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td>
                  <td className={td}>{dash(r.rep.fwDays)}</td><td className={td}>{dash(r.rep.doctorsMet)}</td><td className={td}>{fmt(r.rep.coveragePct)}</td>
                  <td className={td}>{fmt(r.rep.callAverage)}</td><td className={td}>{dash(r.rep.chemistsMet)}</td><td className={td}>{dash(r.rep.jointWorkDays)}</td>
                  <td className={td}>{dash(r.withThisManager.jointDays)}</td><td className={td}>{dash(r.withThisManager.jointCalls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Note>Layout inferred (no legacy screenshot available). All figures are real DCR / joint-work data for the month.</Note>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 7 -- Review Report ═════════════════════════════════════════════
type Panel = { title: string; color: string; rows: [string, string][]; redZero?: string[]; redRows?: string[] };
const PANELS: Panel[][] = [
  [
    { title: "WORKING INFO", color: "bg-green-600", rows: [["Fieldwork Days", "fwDays"], ["Non-Fieldwork Days", "nfwDays"], ["Leave", "leave"], ["Holiday / Sunday", "holidaySunday"]] },
    { title: "MASTER INFO", color: "bg-blue-600", rows: [["Doctors in List", "totalDoctorsInList"], ["Chemists in List", "totalChemistInList"], ["Unlisted Drs in List", "totalUnlistedDrsInList"], ["Stockists in List", "totalStockistInList"], ["Hospitals in List", "totalHospitalInList"]] },
    { title: "LISTED DR INFO", color: "bg-purple-600", rows: [["Listed Drs Met", "listedDrsMet"], ["Listed Drs Seen", "listedDrsSeen"], ["Coverage %", "lstDrCoveragePct"], ["Call Average", "lstDrCallAverage"], ["Missed Call", "lstDrMissedCall"]] }
  ],
  [
    { title: "CHEMIST INFO", color: "bg-teal-600", rows: [["Chemists Met", "chemistsMet"], ["Chemists Seen", "chemistsSeen"], ["Call Average", "chemCallAverage"], ["Missed Chemist", "chemMissedChemist"]] },
    { title: "UNLISTED DR INFO", color: "bg-orange-600", rows: [["Unlisteddr Met", "unlistedDrsMet"], ["Unlisteddr Seen", "unlistedDrsSeen"], ["Call Average", "unlstCallAverage"], ["Missed Call", "unlstMissedCall"]], redZero: ["unlistedDrsMet"] },
    { title: "JOINT WORK INFO", color: "bg-pink-600", rows: [["Joint Work Days", "jointWorkDays"], ["Joint Calls Met", "jointCallsMet"], ["Joint Calls Seen", "jointCallsSeen"], ["Joint Call Avg", "jointCallAvg"]] }
  ],
  [
    { title: "DR CATEGORY INFO", color: "bg-indigo-600", rows: [["CORE List", "coreList"], ["N CORE List", "nonCoreList"]] },
    { title: "SAMPLE INFO", color: "bg-cyan-600", rows: [["Sample Given Qty", "sampleGivenQty"], ["Drs Given", "sampleGivenDrs"], ["Products", "sampleGivenProducts"]] },
    { title: "INPUT INFO", color: "bg-lime-600", rows: [["Input Given Qty", "inputGivenQty"], ["Drs Given", "inputGivenDrs"], ["Products", "inputGivenProducts"]] }
  ],
  [
    { title: "PRODUCT INFO", color: "bg-rose-600", rows: [] },
    { title: "DR CATEGORY VISIT INFO", color: "bg-amber-600", rows: [] },
    { title: "DRS CATEGORY CALL ADHERENCE", color: "bg-emerald-600", rows: [["CORE Met 2x", "coreMet2x"], ["CORE Adherence %", "coreAdherCoverage"], ["CORE Missed", "coreMissed"], ["N CORE Met 2x", "nonCoreMet2x"], ["N CORE Adherence %", "nonCoreAdherCoverage"], ["N CORE Missed", "nonCoreMissed"]] }
  ],
  [
    { title: "DRS VISIT", color: "bg-sky-600", rows: [["1 Visit Drs", "visit1Drs"], ["2 Visit Drs", "visit2Drs"], ["3 Visit Drs", "visit3Drs"], ["More Than 3 Visit Drs", "visitMoreThan3Drs"]] },
    { title: "TARGET & SALE INFO", color: "bg-violet-600", rows: [["Target", "target"], ["Primary Sale", "primarySale"], ["Secondary Sale", "secondarySale"], ["Achievement %", "achievement"]] },
    { title: "OTHER INFO", color: "bg-fuchsia-600", rows: [["No of Detailing Drs", "noOfDetailingDrs"], ["No of Rx Drs", "noOfRxDrs"]] }
  ],
  [
    { title: "SECONDARY SALE INFO", color: "bg-red-600", rows: [] },
    { title: "TP INFO", color: "bg-green-700", rows: [["HQ Planned", "noOfHqPlanned"], ["HQ Worked", "actualHqWorked"], ["EX Planned", "noOfExPlanned"], ["EX Worked", "actualExWorked"], ["OS Planned", "noOfOsPlanned"], ["OS Worked", "actualOsWorked"]] },
    { title: "EXPENSE INFO", color: "bg-blue-700", rows: [["HQ Amount (Rs)", "hqAmountRs"], ["EX Amount (Rs)", "exAmountRs"], ["OS Amount (Rs)", "osAmountRs"], ["Miscellaneous", "miscellaneous"], ["Total Amount", "totalAmount"]], redRows: ["osAmountRs"] }
  ]
];

export function ReviewReport() {
  const [code, setCode] = useState("");
  const my = useMonthYear();
  const [result, setResult] = useState<ReviewReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.reviewReport({ employeeCode: code, month: my.key })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Review Report</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel="--Select--" />
          <MonthYearSelect month={my.month} year={my.year} onChange={my.set} />
          <button type="button" className={GO} disabled={!code || loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (() => {
        const e = result.employee;
        const val = (k: string) => { const v = result.metrics[k]; return v == null || v === "" ? "" : typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : String(v); };
        return (
          <ReportModal title="Review Report" fileName={`Review_Report_${result.month}`} onClose={() => setResult(null)}>
            <h3 className="text-center text-lg font-bold text-purple-800">Review Report for {e.isManager ? "Manager" : "Baselevel Employee"} for the Month of {monthLong(result.month)}</h3>
            <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm">
              {([["FieldForce Name", e.name], ["Employee Code", e.employeeCode], ["HQ", e.hq], ["State", e.state], ["Desig", e.designation], ["Division", e.division]] as [string, string][]).map(([k, v]) => (
                <div key={k}><span className="font-bold text-red-600">{k} : </span><span className="font-bold text-black">{v}</span></div>
              ))}
            </div>
            {PANELS.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-3">
                {row.map((p) => (
                  <div key={p.title} className="border border-border-subtle">
                    <div className={`${p.color} text-white text-center font-bold text-xs py-1`}>{p.title}</div>
                    <div className="bg-gray-100 p-2 text-xs space-y-1 min-h-[40px]">
                      {p.title === "PRODUCT INFO" && (
                        <>
                          <div className="text-red-600 font-bold">Top 5 Products</div>
                          {result.top5.length === 0 ? <div className="border border-gray-300 bg-white p-1 text-center">No Records Found</div> : result.top5.map((t) => <div key={t.name} className="flex justify-between"><span>{t.name}</span><span className="font-semibold">{t.count}</span></div>)}
                        </>
                      )}
                      {p.title === "SECONDARY SALE INFO" && (
                        <>
                          <div className="flex justify-between font-bold"><span>Qty</span><span>Value</span></div>
                          <div className="border border-gray-300 bg-white p-1 text-center">No Records Found</div>
                        </>
                      )}
                      {p.rows.map(([label, key]) => {
                        const v = val(key);
                        const red = (p.redZero?.includes(key) && (v === "0" || v === "")) || p.redRows?.includes(key);
                        return <div key={key} className={"flex justify-between " + (red ? "text-red-600 font-bold" : "")}><span>{label}</span><span className="font-semibold">{v}</span></div>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <Note>Blank values have no real source yet (Target/Primary sale unless uploaded, Secondary Sale, sample/Dr-service spend). Dr Category Visit Info has no source and is left empty.</Note>
          </ReportModal>
        );
      })()}
    </div>
  );
}

// ═══ Item 8 -- Assessment Report ═════════════════════════════════════════
const ASSESS_ROWS: [number, string, string][] = [
[1, "No.of Days in Month", "#ccffcc"],
  [2, "Sunday / Holiday", "#ccffcc"],
  [3, "Fieldwork days", "#ccffcc"],
  [4, "Leave", "#ccffcc"],
  [5, "Others", "#ccffcc"],
  [6, "HQ Working days", "#ffffcc"],
  [7, "EX Working days", "#ffffcc"],
  [8, "OS Working days", "#ffffcc"],
  [9, "No.of Delayed days", "#ffffcc"],
  [10, "Total No.of Drs", "#ffccff"],
  [11, "Dr Met", "#ffccff"],
  [12, "Calls Seen", "#ffccff"],
  [13, "Coverage (%)", "#ffccff"],
  [14, "Call Average", "#ffccff"],
  [15, "Missed", "#ffccff"],
  [16, "Total No.of Chemist", "#f0f8ff"],
  [17, "Chemist Met", "#f0f8ff"],
  [18, "Calls Seen", "#f0f8ff"],
  [19, "Coverage (%)", "#f0f8ff"],
  [20, "Call Average", "#f0f8ff"],
  [21, "Missed", "#f0f8ff"],
  [22, "Chemist POB Count", "#f0f8ff"],
  [23, "Chemist POB Value", "#f0f8ff"],
  [24, "Listed Dr wise Visit Details", "#669999"],
  [25, "1 Time Visit Drs", "#f0e68d"],
  [26, "2 Time Visit Drs", "#f0e68d"],
  [27, "3 Time Visit Drs", "#f0e68d"],
  [28, "More than 3 Time Visit Drs", "#f0e68d"],
  [29, "Listed Dr Category wise Visit Details", "#669999"],
  [30, "1. Total No.of Nil Drs", "#ccffcc"],
  [31, "2. Nil Drs Met", "#ccffcc"],
  [32, "3. Nil Drs Seen", "#ccffcc"],
  [33, "4. Nil Drs Missed", "#ccffcc"],
  [34, "5. Nil - 1 Visit Drs", "#ccffcc"],
  [35, "6. Nil - 2 Visit Drs", "#ccffcc"],
  [36, "7. Nil - 3 Visit Drs", "#ccffcc"],
  [37, "8. Nil More than 3 Visit Drs", "#ccffcc"],
  [38, "1. Total No.of CORE Drs", "#ccffcc"],
  [39, "2. CORE Drs Met", "#ccffcc"],
  [40, "3. CORE Drs Seen", "#ccffcc"],
  [41, "4. CORE Drs Missed", "#ccffcc"],
  [42, "5. CORE - 1 Visit Drs", "#ccffcc"],
  [43, "6. CORE - 2 Visit Drs", "#ccffcc"],
  [44, "7. CORE - 3 Visit Drs", "#ccffcc"],
  [45, "8. CORE More than 3 Visit Drs", "#ccffcc"],
  [46, "1. Total No.of N CORE Drs", "#ccffcc"],
  [47, "2. N CORE Drs Met", "#ccffcc"],
  [48, "3. N CORE Drs Seen", "#ccffcc"],
  [49, "4. N CORE Drs Missed", "#ccffcc"],
  [50, "5. N CORE - 1 Visit Drs", "#ccffcc"],
  [51, "6. N CORE - 2 Visit Drs", "#ccffcc"],
  [52, "7. N CORE - 3 Visit Drs", "#ccffcc"],
  [53, "8. N CORE More than 3 Visit Drs", "#ccffcc"],
  [54, "1. Total No.of S CORE Drs", "#ccffcc"],
  [55, "2. S CORE Drs Met", "#ccffcc"],
  [56, "3. S CORE Drs Seen", "#ccffcc"],
  [57, "4. S CORE Drs Missed", "#ccffcc"],
  [58, "5. S CORE - 1 Visit Drs", "#ccffcc"],
  [59, "6. S CORE - 2 Visit Drs", "#ccffcc"],
  [60, "7. S CORE - 3 Visit Drs", "#ccffcc"],
  [61, "8. S CORE More than 3 Visit Drs", "#ccffcc"],
  [62, "Worked With Details (Days / Calls)", "#669999"],
  [63, "BH", "#ffe4c4"],
  [64, "ZBM", "#ffe4c4"],
  [65, "ABM", "#ffe4c4"],
  [66, "RBM", "#ffe4c4"],
  [67, "Listed Dr Calls Frequency wise Visit Details", "#669999"],
  [68, "Nil Total Drs (Norms 2)", "#ffffcc"],
  [69, "Nil Vist 0", "#ffffcc"],
  [70, "Nil Vist1", "#ffffcc"],
  [71, "Nil Vist2", "#ffffcc"],
  [72, "Nil More than 2 Visit", "#ffffcc"],
  [73, "Nil Missed", "#ffffcc"],
  [74, "CORE Total Drs (Norms 2)", "#ffffcc"],
  [75, "CORE Vist 0", "#ffffcc"],
  [76, "CORE Vist1", "#ffffcc"],
  [77, "CORE Vist2", "#ffffcc"],
  [78, "CORE More than 2 Visit", "#ffffcc"],
  [79, "CORE Missed", "#ffffcc"],
  [80, "N CORE Total Drs (Norms 2)", "#ffffcc"],
  [81, "N CORE Vist 0", "#ffffcc"],
  [82, "N CORE Vist1", "#ffffcc"],
  [83, "N CORE Vist2", "#ffffcc"],
  [84, "N CORE More than 2 Visit", "#ffffcc"],
  [85, "N CORE Missed", "#ffffcc"],
  [86, "S CORE Total Drs (Norms 1)", "#ffffcc"],
  [87, "S CORE Vist 0", "#ffffcc"],
  [88, "S CORE Vist1", "#ffffcc"],
  [89, "S CORE More than 1 Visit", "#ffffcc"],
  [90, "S CORE Missed", "#ffffcc"],
  [91, "Top 5 Products Promoted", "#669999"],
  [92, "product 1", "#ffccff"],
  [93, "product 2", "#ffccff"],
  [94, "product 3", "#ffccff"],
  [95, "product 4", "#ffccff"],
  [96, "product 5", "#ffccff"],
  [97, "Top 5 Sample given Drs with Qty", "#669999"],
  [98, "product 1", "#ccffcc"],
  [99, "product 2", "#ccffcc"],
  [100, "product 3", "#ccffcc"],
  [101, "product 4", "#ccffcc"],
  [102, "product 5", "#ccffcc"],
  [103, "Total Calls As Per Norms", "#669999"],
  [104, "Visit Calls As Per Norms", "#669999"],
  [105, "Visit Frequency Coverage (%)", "#669999"],
];

export function AssessmentReport() {
  const [code, setCode] = useState("");
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.assessmentReport({ employeeCode: code, fromMonth: fromKey, toMonth: toKey })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Assessment Report</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel="--Select--" />
          <RangeFields range={range} setRange={setRange} />
          <button type="button" className={GO} disabled={!code || loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Field Assessment" fileName={`Field_Assessment_${fromKey}_${toKey}`} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold underline" style={{ color: "#800000" }}>
            Field Assessment of {monthShort(result.months[0])} To {monthShort(result.months[result.months.length - 1])}
          </h3>
          <p className="text-sm font-semibold">Filed Force Name : {result.employee.name} - {result.employee.designation} - {result.employee.hq}</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className={TH}>S.No</th><th className={TH}>Parameters</th>
                {result.months.map((m) => <th key={m} className={TH}>{longMonth(m).replace(" - ", "-")}</th>)}
              </tr>
            </thead>
            <tbody>
              {ASSESS_ROWS.map(([n, label, bg]) => (
                <tr key={n} style={{ backgroundColor: bg }}>
                  <td className={td}>{n}</td><td className={td + " text-left"}>{label}</td>
                  {result.months.map((m) => {
                    const v = result.cols[m]?.[String(n)] || "";
                    return <td key={m} className={td} style={v ? { color: "#0000ff", fontWeight: 700 } : undefined}>{v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <Note>Empty cell = zero or no real source (e.g. DCR lock date, sample/Dr-service spend, S CORE tier are not stored).</Note>
        </ReportModal>
      )}
    </div>
  );
}
