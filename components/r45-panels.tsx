"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FieldForceSelect } from "@/components/field-force-select";
import { GO, LABEL, SELECT, MONTH_NAMES, THIS_YEAR, ReportModal, ScreenTitle, ym, link, tealHead } from "@/components/mis-analysis-panels";
import {
  apiClient,
  type DetailingOptions, type DetailingVisitResult, type DrsAnalysisResult, type QuizResultResult, type SlideAnalysisOptions,
  type SlideAnalysisResult, type SlideFilterKind, type StarRatingResult
} from "@/lib/api-client";

// Round 45 -- legacy-parity screens: Quiz Test Result, Summary > Day Wise Report
// Dump / Call Report Dump, Digital Detailing > Visit Wise / Brand Wise Star
// Rating, Product Slide Analysis, Drs Analyis. Shared FieldForceSelect and
// ReportModal throughout; Excel is the shared real-.xlsx exporter.

const CARD = "bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-5xl";
const NOW_M = new Date().getMonth() + 1;
const YEARS = [THIS_YEAR - 3, THIS_YEAR - 2, THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];
const SELECT_FF = "--- Select the Field force ---";
const TEAL = "border border-black px-1 py-0.5 text-xs font-bold text-center " + tealHead;
const CELL = "border border-black px-1 py-0.5 text-xs text-center";
const ADMIN_OPT = [{ value: "admin", label: "admin" }];
const monthName = (m: string) => MONTH_NAMES[Number(m.slice(5, 7)) - 1];
const dash = (n: number) => (n ? String(n) : "-");
const blank = (n: number) => (n ? String(n) : "");

function Err({ msg }: { msg: string }) { return msg ? <p className="text-sm text-status-danger">{msg}</p> : null; }
function Note({ children }: { children: ReactNode }) { return <p className="text-xs text-text-muted italic">{children}</p>; }
function BackButton() {
  const router = useRouter();
  return <button type="button" className="h-8 px-4 rounded-lg border border-border-subtle text-sm font-semibold" onClick={() => router.back()}>Back</button>;
}
function MonthYear({ label, month, year, onChange }: { label: string; month: number; year: number; onChange: (m: number, y: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <div className="flex gap-2">
        <select className={SELECT} value={month} onChange={(e) => onChange(parseInt(e.target.value, 10), year)}>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m.slice(0, 3)}</option>)}</select>
        <select className={SELECT} value={year} onChange={(e) => onChange(month, parseInt(e.target.value, 10))}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
      </div>
    </div>
  );
}
function useMY() { const [v, set] = useState({ m: NOW_M, y: THIS_YEAR }); return { v, set: (m: number, y: number) => set({ m, y }), key: ym(v.y, v.m) }; }

// Column-major checkbox grid (legacy lists fill each column top to bottom).
function CheckGrid({ items, selected, onToggle, cols = 4 }: { items: string[]; selected: string[]; onToggle: (v: string) => void; cols?: number }) {
  const rows = Math.max(1, Math.ceil(items.length / cols));
  return (
    <div className="grid gap-x-8 gap-y-1" style={{ gridAutoFlow: "column", gridTemplateRows: `repeat(${rows}, auto)`, gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}>
      {items.map((it) => (
        <label key={it} className="flex items-start gap-1 text-sm"><input type="checkbox" className="mt-1" checked={selected.includes(it)} onChange={() => onToggle(it)} /><span>{it}</span></label>
      ))}
    </div>
  );
}
const toggleIn = (set: (f: (p: string[]) => string[]) => void) => (v: string) => set((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

// ═══ Item 1 -- Quiz Test Result ══════════════════════════════════════════
export function QuizTestResultReport() {
  const [scope, setScope] = useState<"Team" | "Individual">("Team");
  const [code, setCode] = useState("");
  const my = useMY();
  const [result, setResult] = useState<QuizResultResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    if (!code) { setError("Select a field force."); return; }
    setLoading(true); setError("");
    try { setResult((await apiClient.quizResult({ employeeCode: code, scope, month: my.key })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  const fixed = ["S.No", "Emp.Code", "DOJ", "FieldForce Name", "Designation Name", "HQ", "First Level Manager", "Second Level Manager"];
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Quiz Test Result</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Filed Force Name</span>
            <div className="flex gap-2">
              <select className={SELECT + " w-24"} value={scope} onChange={(e) => setScope(e.target.value as "Team" | "Individual")}><option>Team</option><option>Individual</option></select>
              <FieldForceSelect value={code} onChange={setCode} hideLabel clearLabel={SELECT_FF} />
            </div>
          </div>
          <MonthYear label="Month / Year" month={my.v.m} year={my.v.y} onChange={my.set} />
        </div>
        <div className="flex justify-center"><button type="button" className={GO} disabled={loading} onClick={view}>{loading ? "Loading..." : "View"}</button></div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Quiz Test Result" fileName={`Quiz_Result_${result.month}`} onClose={() => setResult(null)} textButtons hidePrint>
          <h3 className="text-lg font-bold underline text-purple-800">Quiz Result - {monthName(result.month)} {result.month.slice(0, 4)}</h3>
          <p className="text-sm font-bold">Field Force Name : {result.employee.name} - {result.employee.designation} - {result.employee.hq}</p>
          <div className="overflow-x-auto -mx-4">
            <table className="border-collapse">
              <thead>
                <tr>
                  {fixed.map((h) => <th key={h} rowSpan={2} className={TEAL}>{h}</th>)}
                  {result.days.map((d) => <th key={d.day} colSpan={3} className={TEAL}>{d.label}</th>)}
                </tr>
                <tr>{result.days.map((d) => <Fragment key={d.day}><th className={TEAL}>Total Question.</th><th className={TEAL}>Total of Correct answers</th><th className={TEAL}>Marks in (%)</th></Fragment>)}</tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.employeeCode}>
                    <td className={CELL}>{r.sno}</td><td className={CELL}>{r.employeeCode}</td><td className={CELL}>{r.doj}</td><td className={CELL + " !text-left"}>{r.name}</td><td className={CELL}>{r.designation}</td><td className={CELL}>{r.hq}</td><td className={CELL}>{r.firstManager}</td><td className={CELL}>{r.secondManager}</td>
                    {result.days.map((d) => { const c = r.perDay[String(d.day)]; return <Fragment key={d.day}><td className={CELL}>{c ? c.total : ""}</td><td className={CELL}>{c ? c.correct : ""}</td><td className={CELL}>{c ? c.pct : ""}</td></Fragment>; })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 2 -- Summary > Day Wise Reports ════════════════════════════════
export function DayWiseDumpReport() {
  const [code, setCode] = useState("");
  const my = useMY();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setBusy(true); setError("");
    try { await apiClient.downloadMisFile("/company/mis/daywise-dump", { employeeCode: code, month: my.key }, `DayWise_Report_Dump_${MONTH_NAMES[my.v.m - 1]}${my.v.y}.xlsx`); }
    catch (e) { setError(e instanceof Error ? e.message : "Download failed"); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex justify-end"><BackButton /></div>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel={SELECT_FF} extraOptions={ADMIN_OPT} />
          <div className="flex flex-col gap-1"><span className={LABEL}>From Month</span>
            <select className={SELECT} value={my.v.m} onChange={(e) => my.set(parseInt(e.target.value, 10), my.v.y)}>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m.slice(0, 3)}</option>)}</select></div>
          <div className="flex flex-col gap-1"><span className={LABEL}>From Year</span>
            <select className={SELECT} value={my.v.y} onChange={(e) => my.set(my.v.m, parseInt(e.target.value, 10))}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select></div>
        </div>
        <button type="button" className={link} disabled={!code || busy} onClick={download}>{busy ? "Preparing..." : "Download Excel"}</button>
        <Err msg={error} />
        <Note>The workbook has the 27 legacy columns (light-blue header) with one row per call, plus a row for every day with no call (Weekly Off / Holiday / Leave / Not Reported). Date is MM-dd-yyyy, as in the Call Report dump.</Note>
      </div>
    </div>
  );
}

// ═══ Item 3 -- Summary > Call Report Dump ════════════════════════════════
export function CallReportDumpReport() {
  const [code, setCode] = useState("");
  const my = useMY();
  const [dateWise, setDateWise] = useState(false);
  const [vacant, setVacant] = useState(false);
  const [days, setDays] = useState<number[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function download(format: "csv" | "xlsx") {
    setBusy(format); setError("");
    try {
      await apiClient.downloadMisFile("/company/mis/call-report-dump", { employeeCode: code, month: my.key, days: dateWise ? [...days].sort((a, b) => a - b).join(",") : "", vacant: String(vacant), format }, `Call_Report_Dump_${my.key}.${format}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Download failed"); }
    finally { setBusy(""); }
  }
  const toggleDay = (d: number) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const vacantBox = <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={vacant} onChange={(e) => setVacant(e.target.checked)} />Vacant</label>;
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex items-start justify-between"><ScreenTitle>Call Report Dump</ScreenTitle><BackButton /></div>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Fieldforce Name" clearLabel={SELECT_FF} extraOptions={ADMIN_OPT} />
          <div className="flex flex-col gap-1"><span className={LABEL}>Month</span>
            <select className={SELECT} value={my.v.m} onChange={(e) => my.set(parseInt(e.target.value, 10), my.v.y)}>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m.slice(0, 3)}</option>)}</select></div>
          <div className="flex flex-col gap-1"><span className={LABEL}>Year</span>
            <select className={SELECT} value={my.v.y} onChange={(e) => my.set(my.v.m, parseInt(e.target.value, 10))}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select></div>
          <label className="flex items-center gap-2 text-sm h-9"><input type="checkbox" checked={dateWise} onChange={(e) => setDateWise(e.target.checked)} />DateWise</label>
          {!dateWise && <div className="h-9 flex items-center">{vacantBox}</div>}
        </div>
        {dateWise && (
          <div className="space-y-2">
            <span className={LABEL}>Day</span>
            {[[1, 7], [8, 14], [15, 21], [22, 28], [29, 31]].map(([a, b]) => (
              <div key={a} className="flex gap-4">
                {Array.from({ length: b - a + 1 }, (_, i) => a + i).map((d) => <label key={d} className="flex items-center gap-1 text-sm w-10"><input type="checkbox" checked={days.includes(d)} onChange={() => toggleDay(d)} />{d}</label>)}
              </div>
            ))}
            {vacantBox}
          </div>
        )}
        <div className="flex gap-8">
          <button type="button" className={link} disabled={!code || !!busy} onClick={() => download("csv")}>{busy === "csv" ? "Preparing..." : "Download CSV"}</button>
          <button type="button" className={link} disabled={!code || !!busy} onClick={() => download("xlsx")}>{busy === "xlsx" ? "Preparing..." : "Download Excel"}</button>
        </div>
        <Err msg={error} />
        <Note>CSV: 34 legacy columns, CRLF lines, Date as MM-dd-yyyy, commas inside values replaced by &quot;;&quot;. With DateWise ticked only the chosen days are exported (none ticked = whole month). Vacant adds inactive vacant manager seats. Choose &quot;admin&quot; for the whole company.</Note>
      </div>
    </div>
  );
}

// ═══ Items 4 + 5 -- Digital Detailing: Visit Wise / Brand Wise Star Rating ═
function useDetailingOptions() {
  const [opts, setOpts] = useState<DetailingOptions | null>(null);
  useEffect(() => { apiClient.detailingOptions().then((r) => setOpts(r.data)).catch(() => setOpts(null)); }, []);
  return opts;
}
function ThreePart({ e }: { e: { name: string; designation: string; hq: string } }) {
  return (
    <div className="flex justify-between text-sm font-bold">
      <span>Field Force Name : {e.name} - {e.designation} - {e.hq}</span><span>HQ : {e.hq}</span><span>Designation : {e.designation}</span>
    </div>
  );
}

export function DetailingVisitWiseReport() {
  const [code, setCode] = useState("admin");
  const my = useMY();
  const [mode, setMode] = useState<"" | "Brand" | "Product">("");
  const [picked, setPicked] = useState<string[]>([]);
  const opts = useDetailingOptions();
  const [result, setResult] = useState<DetailingVisitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    if (!mode) { setError("Select a mode."); return; }
    if (!picked.length) { setError(`Select at least one ${mode.toLowerCase()}.`); return; }
    setLoading(true); setError("");
    try { setResult((await apiClient.detailingVisitWise({ employeeCode: code || "admin", month: my.key, mode, names: picked })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  const items = mode === "Brand" ? opts?.brands ?? [] : mode === "Product" ? opts?.products ?? [] : [];
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="FieldForce Name" clearLabel="admin (whole company)" extraOptions={ADMIN_OPT} />
          <MonthYear label="Month-Year" month={my.v.m} year={my.v.y} onChange={my.set} />
          <div className="flex flex-col gap-1"><span className={LABEL}>Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => { setMode(e.target.value as "" | "Brand" | "Product"); setPicked([]); }}><option value="">---Select---</option><option>Brand</option><option>Product</option></select></div>
        </div>
        {mode && <div className="space-y-2"><p className="text-sm font-bold">{mode}</p><CheckGrid items={items} selected={picked} onToggle={toggleIn(setPicked)} /></div>}
        <div className="flex justify-center"><button type="button" className={GO} disabled={loading} onClick={go}>{loading ? "Loading..." : "Go"}</button></div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Detailing Drs-Visit wise" fileName={`Detailing_Drs_Visit_wise_${result.month}`} onClose={() => setResult(null)} textButtons hidePrint>
          <div className="bg-sky-100 p-3 space-y-3">
            <h3 className="text-center text-base font-bold underline">Detailing Drs-Visit wise for the Month of {monthName(result.month)} - {result.month.slice(0, 4)}</h3>
            <ThreePart e={result.employee} />
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  {["Sno", "FieldForce Name", "Head Quater", "Designation", "Employee Code"].map((h) => <th key={h} rowSpan={2} className={TEAL}>{h}</th>)}
                  {result.names.map((n) => <th key={n} colSpan={4} className={TEAL}>{n}</th>)}
                </tr>
                <tr>{result.names.map((n) => <Fragment key={n}>{["No of Visit Drs", "1Visit", "2Visit", "More than 2Visit"].map((h) => <th key={h} className={TEAL}>{h}</th>)}</Fragment>)}</tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.employeeCode} className="bg-white">
                    <td className={CELL}>{r.sno}</td><td className={CELL + " !text-left"}>{r.label}</td><td className={CELL}>{r.hq}</td><td className={CELL}>{r.designation}</td><td className={CELL}>{r.employeeCode}</td>
                    {result.names.map((n) => { const g = r.groups[n]; return <Fragment key={n}><td className={CELL}>{blank(g.drs)}</td><td className={CELL}>{blank(g.one)}</td><td className={CELL}>{blank(g.two)}</td><td className={CELL}>{blank(g.more)}</td></Fragment>; })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportModal>
      )}
    </div>
  );
}

export function BrandStarRatingReport() {
  const [code, setCode] = useState("admin");
  const my = useMY();
  const [mode, setMode] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const opts = useDetailingOptions();
  const [result, setResult] = useState<StarRatingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    if (mode !== "Brand") { setError("Select a mode."); return; }
    if (!picked.length) { setError("Select at least one brand."); return; }
    setLoading(true); setError("");
    try { setResult((await apiClient.brandStarRating({ employeeCode: code || "admin", month: my.key, names: picked })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  const STARS = ["★", "★★", "★★★", "★★★★", "★★★★★", "NIL"];
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="FieldForce Name" clearLabel="admin (whole company)" extraOptions={ADMIN_OPT} />
          <MonthYear label="Month-Year" month={my.v.m} year={my.v.y} onChange={my.set} />
          <div className="flex flex-col gap-1"><span className={LABEL}>Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => { setMode(e.target.value); setPicked([]); }}><option value="">---Select---</option><option>Brand</option></select></div>
        </div>
        {mode === "Brand" && <div className="space-y-2"><p className="text-sm font-bold">Brand</p><CheckGrid items={opts?.brands ?? []} selected={picked} onToggle={toggleIn(setPicked)} /></div>}
        <div className="flex justify-center"><button type="button" className={GO} disabled={loading} onClick={go}>{loading ? "Loading..." : "Go"}</button></div>
        <Err msg={error} />
        <Note>Ratings come from the 1-5 stars reps give each brand detailed on a DCR call (field app). The latest rating in the month counts per doctor and brand; NIL = listed doctors with no rating that month. Months before the capture existed are all NIL.</Note>
      </div>
      {result && (
        <ReportModal title="Brand wise Star Rating" fileName={`Brand_wise_Star_Rating_${result.month}`} onClose={() => setResult(null)} textButtons hidePrint>
          <h3 className="text-center text-base font-bold underline">Brand wise Star Rating for the Month of {monthName(result.month)} - {result.month.slice(0, 4)}</h3>
          <ThreePart e={result.employee} />
          <table className="border-collapse w-full">
            <thead>
              <tr>
                {["Sno", "FieldForce Name", "Head Quater", "Designation", "Employee Code"].map((h) => <th key={h} rowSpan={2} className={TEAL}>{h}</th>)}
                {result.brands.map((b) => <th key={b} colSpan={6} className={TEAL}>{b}</th>)}
              </tr>
              <tr>{result.brands.map((b) => <Fragment key={b}>{STARS.map((s) => <th key={s} className={TEAL}>{s}</th>)}</Fragment>)}</tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.employeeCode} className="bg-white">
                  <td className={CELL}>{r.sno}</td><td className={CELL + " !text-left"}>{r.label}</td><td className={CELL}>{r.hq}</td><td className={CELL}>{r.designation}</td><td className={CELL}>{r.employeeCode}</td>
                  {result.brands.map((b) => { const g = r.groups[b]; return <Fragment key={b}>{g.stars.map((n, i) => <td key={i} className={CELL}>{blank(n)}</td>)}<td className={CELL}>{blank(g.nil)}</td></Fragment>; })}
                </tr>
              ))}
            </tbody>
          </table>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 6 -- Product Slide Analysis (Listed Doctor Slide Analysis) ═════
const FILTERS: SlideFilterKind[] = ["ALL", "Doctor Speciality", "Doctor Category", "Doctor Qualification", "Doctor Class", "Doctor Territory", "Product / Brand"];
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function SlideAnalysisReport() {
  const [code, setCode] = useState("admin");
  const [from, setFrom] = useState({ m: NOW_M, y: THIS_YEAR });
  const [to, setTo] = useState({ m: NOW_M, y: THIS_YEAR });
  const [basedOn, setBasedOn] = useState<"Product" | "Brand">("Product");
  const [kind, setKind] = useState<SlideFilterKind>("ALL");
  const [value, setValue] = useState("");
  const [opts, setOpts] = useState<SlideAnalysisOptions | null>(null);
  const [result, setResult] = useState<SlideAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { apiClient.slideAnalysisOptions().then((r) => setOpts(r.data)).catch(() => setOpts(null)); }, []);
  async function run() {
    setLoading(true); setError("");
    try { setResult((await apiClient.slideAnalysis({ employeeCode: code || "admin", fromMonth: ym(from.y, from.m), toMonth: ym(to.y, to.m), basedOn, filterKind: kind, filterValue: kind === "ALL" ? "" : value })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Listed Doctor Slide Analysis</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="FieldForce Name" clearLabel="admin (whole company)" extraOptions={ADMIN_OPT} />
          <MonthYear label="From:" month={from.m} year={from.y} onChange={(m, y) => setFrom({ m, y })} />
          <MonthYear label="To:" month={to.m} year={to.y} onChange={(m, y) => setTo({ m, y })} />
          <div className="flex flex-col gap-1"><span className={LABEL}>Based-On:</span>
            <div className="flex gap-4 h-9 items-center text-sm">
              {(["Product", "Brand"] as const).map((b) => <label key={b} className="flex items-center gap-1"><input type="radio" name="basedOn" checked={basedOn === b} onChange={() => setBasedOn(b)} />{b}</label>)}
            </div></div>
        </div>
        <div className="flex justify-center"><button type="button" className={GO} disabled={loading} onClick={run}>{loading ? "Loading..." : "Go"}</button></div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1"><span className={LABEL}>Filter</span>
            <select className={SELECT} value={kind} onChange={(e) => { setKind(e.target.value as SlideFilterKind); setValue(""); }}>{FILTERS.map((f) => <option key={f}>{f}</option>)}</select></div>
          {kind !== "ALL" && (
            <>
              <select className={SELECT} value={value} onChange={(e) => setValue(e.target.value)}>
                <option value="">---Select---</option>
                {(opts?.[kind] ?? []).map((v) => <option key={v}>{v}</option>)}
              </select>
              <button type="button" className="h-9 px-4 rounded-lg bg-primary text-on-primary text-sm" disabled={loading || !value} onClick={run}>Go</button>
            </>
          )}
        </div>
        <Err msg={error} />
      </div>
      {result && (result.rows.length === 0 ? (
        <p className="text-center font-bold text-red-600">No Record Found</p>
      ) : (
        <div className="overflow-x-auto bg-surface-card rounded-xl p-3">
          <table className="border-collapse">
            <thead>
              <tr>
                {["S.No", "Field Force", "Doctor", "Speciality", "Category", "Class", "Territory"].map((h) => <th key={h} rowSpan={2} className={TEAL}>{h}</th>)}
                {result.columns.map((c) => <th key={c} colSpan={2} className={TEAL}>{c}</th>)}
                <th colSpan={2} className={TEAL}>Total</th>
              </tr>
              <tr>{[...result.columns, "Total"].map((c) => <Fragment key={c}><th className={TEAL}>Views</th><th className={TEAL}>Duration</th></Fragment>)}</tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={`${r.employeeCode}${r.sno}`}>
                  <td className={CELL}>{r.sno}</td><td className={CELL + " !text-left"}>{r.employeeName}</td><td className={CELL + " !text-left"}>{r.doctor}</td><td className={CELL}>{r.speciality}</td><td className={CELL}>{r.category}</td><td className={CELL}>{r.cls}</td><td className={CELL}>{r.territory}</td>
                  {result.columns.map((c) => <Fragment key={c}><td className={CELL}>{r.cells[c]?.views ?? ""}</td><td className={CELL}>{r.cells[c] ? mmss(r.cells[c].seconds) : ""}</td></Fragment>)}
                  <td className={CELL + " font-bold"}>{r.totalViews}</td><td className={CELL + " font-bold"}>{mmss(r.totalSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Note>Views = slide presentations logged from the field app&apos;s Present slides screen; duration is mm:ss on screen.</Note>
        </div>
      ))}
    </div>
  );
}

// ═══ Item 7 -- Drs Analyis (legacy spelling kept) ═════════════════════════
export function DrsAnalysisReport() {
  const [code, setCode] = useState("");
  const [from, setFrom] = useState({ m: NOW_M, y: THIS_YEAR });
  const [to, setTo] = useState({ m: NOW_M, y: THIS_YEAR });
  const [result, setResult] = useState<DrsAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.drsAnalysis({ employeeCode: code, fromMonth: ym(from.y, from.m), toMonth: ym(to.y, to.m) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  const range = result ? `${monthName(result.months[0])} ${result.months[0].slice(0, 4)} To ${monthName(result.months.at(-1)!)} ${result.months.at(-1)!.slice(0, 4)}` : "";
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Drs Analyis</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel={SELECT_FF} />
          <MonthYear label="From Month & Year" month={from.m} year={from.y} onChange={(m, y) => setFrom({ m, y })} />
          <MonthYear label="To Month & Year" month={to.m} year={to.y} onChange={(m, y) => setTo({ m, y })} />
        </div>
        <div className="flex justify-center"><button type="button" className={GO} disabled={!code || loading} onClick={view}>{loading ? "Loading..." : "View"}</button></div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Drs Analyis" fileName="Drs_Analyis" onClose={() => setResult(null)} iconLabels>
          <h3 className="text-base font-bold">Visit Details for the month of - {range}</h3>
          <table className="border-collapse w-full">
            <thead>
              <tr>
                {["#", "Emp.Code", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={2} className={TEAL}>{h}</th>)}
                {result.months.map((m) => <th key={m} colSpan={4} className={TEAL}>{monthName(m)}-{m.slice(0, 4)}</th>)}
              </tr>
              <tr>{result.months.map((m) => <Fragment key={m}>{["Total listed doctors", "Total unique Listed Doctors Met", "Total unique doctors e-detailing done", "% e-detailing done"].map((h) => <th key={h} className={TEAL}>{h}</th>)}</Fragment>)}</tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.employeeCode}>
                  <td className={CELL}>{r.sno}</td><td className={CELL}>{r.employeeCode}</td><td className={CELL + " !text-left"}>{r.name}</td><td className={CELL}>{r.designation}</td><td className={CELL}>{r.hq}</td>
                  {result.months.map((m) => { const c = r.perMonth[m]; return <Fragment key={m}><td className={CELL}>{c.total}</td><td className={CELL}>{dash(c.met)}</td><td className={CELL}>{dash(c.edet)}</td><td className={CELL}>{c.pct}</td></Fragment>; })}
                </tr>
              ))}
            </tbody>
          </table>
        </ReportModal>
      )}
    </div>
  );
}
