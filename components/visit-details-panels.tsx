"use client";

import { Fragment as Fragment2, useEffect, useState } from "react";
import { FieldForceSelect } from "@/components/field-force-select";
import { GO, LABEL, SELECT, MONTH_NAMES, THIS_YEAR, ReportModal, ScreenTitle, ym } from "@/components/mis-analysis-panels";
import { apiClient, type CatClsVisitResult, type DateWiseResult, type VisitCell, type VisitDetailOptions, type VisitMode } from "@/lib/api-client";

// Round 44 -- MIS Reports > Visit Details:
//   Cat/Cls/Splty/LstDr Wise  Visit_Details_Cat_Cls_Spclty_LstDr_Wise.aspx
//   DateWise                  VisitDetail_Datewise.aspx

const CARD = "bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-5xl";
const FF_LABEL = "--- Select the Field force ---";
const NOW_M = new Date().getMonth() + 1;
const YEAR_LIST = [THIS_YEAR - 3, THIS_YEAR - 2, THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];
const dash = (n: number) => (n ? String(n) : "-");

function Err({ msg }: { msg: string }) { return msg ? <p className="text-sm text-status-danger">{msg}</p> : null; }

function MonthYear({ label, month, year, onChange }: { label: string; month: number; year: number; onChange: (m: number, y: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <div className="flex gap-2">
        <select className={SELECT} value={month} onChange={(e) => onChange(parseInt(e.target.value, 10), year)}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m.slice(0, 3)}</option>)}
        </select>
        <select className={SELECT} value={year} onChange={(e) => onChange(month, parseInt(e.target.value, 10))}>
          {YEAR_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

const monthLong = (m: string, sep: string) => { const [y, mm] = m.split("-").map(Number); return `${MONTH_NAMES[mm - 1]}${sep}${y}`; };
const monthShort = (m: string) => { const [y, mm] = m.split("-").map(Number); return `${MONTH_NAMES[mm - 1].slice(0, 3)}-${String(y).slice(2)}`; };

// ═══ Screen 1 ═════════════════════════════════════════════════════════════
const MODES: VisitMode[] = ["Category", "Speciality", "Class", "Listed Doctor", "Campaign", "Doctor Type"];
const GREEN_TH = "border border-black px-1 py-0.5 text-xs font-bold text-center";
const CELL = "border border-black px-1 py-0.5 text-xs text-center";
const PINK = "#ffccff", YELLOW = "#ffff66", HEAD = "#dcedc8", GROUP_FILLS = ["#ffb3b3", "#d9d9d9"];

export function CatClsVisitDetailsReport() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<VisitMode | "">("");
  const [from, setFrom] = useState({ m: NOW_M, y: THIS_YEAR });
  const [to, setTo] = useState({ m: NOW_M, y: THIS_YEAR });
  const [vacants, setVacants] = useState(false);
  const [opts, setOpts] = useState<VisitDetailOptions | null>(null);
  const [ticked, setTicked] = useState<string[]>([]);
  const [result, setResult] = useState<CatClsVisitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { apiClient.visitDetailOptions().then((r) => setOpts(r.data)).catch(() => setOpts(null)); }, []);

  const choices: string[] = !opts ? [] : mode === "Category" ? opts.categories : mode === "Speciality" ? opts.specialities : mode === "Class" ? opts.classes : mode === "Campaign" ? opts.campaigns : mode === "Doctor Type" ? opts.doctorTypes : [];
  const needsTick = mode !== "" && mode !== "Listed Doctor" && !(mode === "Campaign" && choices.length === 0);
  const ready = !!code && !!mode && (!needsTick || ticked.length > 0);
  const toggle = (v: string) => setTicked((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));

  async function view() {
    if (!mode) return;
    setLoading(true); setError("");
    try {
      setResult((await apiClient.catClsVisit({ employeeCode: code, mode, fromMonth: ym(from.y, from.m), toMonth: ym(to.y, to.m), values: ticked, withVacants: vacants })).data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className={CARD}>
        <h2 className="text-xl font-bold text-purple-800 underline decoration-purple-800 text-center leading-snug">Category/Class/Speciality &amp;<br />Listed Doctor Wise Visit Details</h2>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel={FF_LABEL} />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Select Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => { setMode(e.target.value as VisitMode | ""); setTicked([]); }}>
              <option value="">---Select---</option>
              {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <MonthYear label="From Month & Year" month={from.m} year={from.y} onChange={(m, y) => setFrom({ m, y })} />
          <MonthYear label="To Month & Year" month={to.m} year={to.y} onChange={(m, y) => setTo({ m, y })} />
        </div>
        {mode !== "" && mode !== "Listed Doctor" && (
          <div className="space-y-2">
            <p className="text-sm font-bold">Select {mode} :</p>
            {choices.length === 0 ? (
              <p className="text-xs text-text-muted">{opts ? `No ${mode.toLowerCase()} values are configured.` : "Loading..."}</p>
            ) : (
              <div className={mode === "Speciality" ? "grid grid-cols-10 gap-x-3 gap-y-1" : "flex flex-wrap gap-x-5 gap-y-1"}>
                {choices.map((c) => (
                  <label key={c} className="flex items-center gap-1 text-sm whitespace-nowrap">
                    <input type="checkbox" checked={ticked.includes(c)} onChange={() => toggle(c)} />{c}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={vacants} onChange={(e) => setVacants(e.target.checked)} />With Vacants</label>
        <div className="flex justify-center"><button type="button" className={GO} disabled={!ready || loading} onClick={view}>{loading ? "Loading..." : "View"}</button></div>
        <Err msg={error} />
      </div>
      {result && <CatClsResult result={result} from={from} to={to} onClose={() => setResult(null)} />}
    </div>
  );
}

function CatClsResult({ result, from, to, onClose }: { result: CatClsVisitResult; from: { m: number; y: number }; to: { m: number; y: number }; onClose: () => void }) {
  const { mode, months, values, grouped } = result;
  const listed = mode === "Listed Doctor";
  const range = `${MONTH_NAMES[from.m - 1]}${listed ? "-" : " "}${from.y} To ${MONTH_NAMES[to.m - 1]}${listed ? "-" : " "}${to.y}`;
  const title = listed ? `Month Wise Visit Details between : ${range}` : `${mode} Wise Visit Details Between - ${range}`;
  const hs = { background: HEAD } as const;
  const SUB = ["List", "Met", "Seen", "Missed"] as const;
  const fixedRows = grouped ? 3 : 2;
  const cells = (c: VisitCell | undefined, fill: string | undefined, manager: boolean) => (
    [c?.list ?? 0, manager ? 0 : c?.met ?? 0, manager ? 0 : c?.seen ?? 0, manager ? 0 : c?.missed ?? 0].map((n, i) => <td key={i} className={CELL} style={fill ? { background: fill } : undefined}>{dash(n)}</td>)
  );
  return (
    <ReportModal title={title} fileName="Visit_Details" onClose={onClose}>
      <h3 className="text-base font-bold underline">{title}</h3>
      <p className="text-sm font-bold">Field Force Name : {result.employee.name} - {result.employee.designation} - {result.employee.hq}</p>
      <table className="border-collapse">
        <thead>
          <tr>
            {["S.No", "FieldForce Name", "Designation", "HQ", "EmployeeId", "SubDivision"].map((h) => <th key={h} rowSpan={fixedRows} className={GREEN_TH} style={hs}>{h}</th>)}
            {months.map((m) => <th key={m} colSpan={grouped ? 1 + 4 * values.length : 4} className={GREEN_TH} style={hs}>{listed ? monthShort(m) : monthLong(m, "-")}</th>)}
          </tr>
          {grouped ? (
            <>
              <tr>
                {months.map((m) => (
                  <Fragment2 key={m}>
                    <th rowSpan={2} className={GREEN_TH + " w-12"} style={hs}>Total Lstd Drs</th>
                    {values.map((v) => <th key={v} colSpan={4} className={GREEN_TH} style={hs}>{v}</th>)}
                  </Fragment2>
                ))}
              </tr>
              <tr>{months.map((m) => values.map((v) => SUB.map((s) => <th key={`${m}${v}${s}`} className={GREEN_TH} style={hs}>{s}</th>)))}</tr>
            </>
          ) : (
            <tr>{months.map((m) => SUB.map((s) => <th key={m + s} className={GREEN_TH} style={hs}>{s}</th>))}</tr>
          )}
        </thead>
        <tbody>
          {result.rows.map((r) => {
            const rowBg = r.isManager ? YELLOW : PINK;
            return (
              <tr key={r.employeeCode} style={{ background: rowBg }}>
                <td className={CELL}>{r.sno}</td><td className={CELL + " !text-left"}>{r.name}</td><td className={CELL}>{r.designation}</td><td className={CELL}>{r.hq}</td><td className={CELL}>{r.employeeCode}</td><td className={CELL}>{r.subDivision}</td>
                {months.map((m) => {
                  const pm = r.perMonth[m];
                  return grouped ? (
                    <Fragment2 key={m}>
                      <td className={CELL + " font-bold"} style={{ background: rowBg }}>{dash(pm?.total.list ?? 0)}</td>
                      {values.map((v, gi) => cells(pm?.groups[v], GROUP_FILLS[gi % 2], r.isManager))}
                    </Fragment2>
                  ) : <Fragment2 key={m}>{cells(pm?.total, undefined, r.isManager)}</Fragment2>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </ReportModal>
  );
}

// ═══ Screen 2 ═════════════════════════════════════════════════════════════
const TEAL = "#009aa8", TEAL_DARK = "#00808c", GREY = "#e8e6e3";
const DW_TH = "border border-gray-300 px-1 py-0.5 text-xs font-bold text-white text-center";
const DW_TD = "border border-gray-300 px-1 text-xs";

// Same rule as the backend weekRanges(): week 1 = day 1 through the first Sunday, then Monday..Sunday blocks.
function weekRanges(year: number, month: number) {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  let end = dow === 0 ? 1 : 1 + (7 - dow);
  const out: { week: number; label: string }[] = [];
  for (let from = 1, w = 1; from <= last; w++) {
    const to = Math.min(end, last);
    out.push({ week: w, label: `week ${w}[${from}-${to}]` });
    from = to + 1; end = to + 7;
  }
  return out;
}

export function VisitDetailDateWiseReport() {
  const [code, setCode] = useState("");
  const [month, setMonth] = useState(NOW_M);
  const [year, setYear] = useState(THIS_YEAR);
  const [matrix, setMatrix] = useState(false);
  const [week, setWeek] = useState(1);
  const [result, setResult] = useState<DateWiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const weeks = weekRanges(year, month);
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.visitDateWise({ employeeCode: code, month: ym(year, month), week: matrix ? week : undefined })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Visit Detail - DateWise</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Fieldforce Name" clearLabel={FF_LABEL} />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Month</span>
            <select className={SELECT} value={month} onChange={(e) => { setMonth(parseInt(e.target.value, 10)); setWeek(1); }}>
              {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m.slice(0, 3)}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Year</span>
            <select className={SELECT} value={year} onChange={(e) => { setYear(parseInt(e.target.value, 10)); setWeek(1); }}>
              {YEAR_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm h-9"><input type="checkbox" checked={matrix} onChange={(e) => setMatrix(e.target.checked)} />Visit Matrix</label>
          {matrix && (
            <select className={SELECT} value={week} onChange={(e) => setWeek(parseInt(e.target.value, 10))}>
              {weeks.map((w) => <option key={w.week} value={w.week}>{w.label}</option>)}
            </select>
          )}
          <button type="button" className={GO} disabled={!code || loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && <DateWiseResultView result={result} onClose={() => setResult(null)} />}
    </div>
  );
}

function DateWiseResultView({ result, onClose }: { result: DateWiseResult; onClose: () => void }) {
  const [y, m] = result.month.split("-").map(Number);
  const title = `Visit Detail - DateWise for the Month of ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
  const days = Array.from({ length: result.numDays }, (_, i) => i + 1);
  const th = (bg = TEAL) => ({ background: bg });
  return (
    <ReportModal title="Visit Detail - DateWise" fileName="Visit_Detail_DateWise" onClose={onClose} textButtons>
      <h3 className="text-base font-bold underline">{title}</h3>
      <p className="text-sm">Filed Force Name : <b>{result.employee.name}</b> - {result.employee.designation} - {result.employee.hq}</p>
      {!result.matrix ? (
        <table className="border-collapse w-full">
          <thead><tr>
            {["S.No", "Listed Doctor Name", "Territory", "Qualification", "Category", "Specialty", "Class"].map((h) => <th key={h} className={DW_TH} style={th()}>{h}</th>)}
            {days.map((d) => <th key={d} className={DW_TH + " w-6"} style={th()}>{d}</th>)}
            <th className={DW_TH + " !text-red-600"} style={th()}>Total</th>
          </tr></thead>
          <tbody>
            {result.rows.length === 0 && <tr><td className={DW_TD + " text-center"} colSpan={8 + days.length}>No visits recorded this month.</td></tr>}
            {result.rows.map((r) => (
              <tr key={r.sno}>
                <td className={DW_TD}>{r.sno}</td><td className={DW_TD}>{r.name}</td><td className={DW_TD}>{r.territory}</td><td className={DW_TD}>{r.qualification}</td><td className={DW_TD}>{r.category}</td><td className={DW_TD}>{r.specialty}</td><td className={DW_TD}>{r.cls}</td>
                {days.map((d) => <td key={d} className={DW_TD + " text-center font-bold text-black"}>{r.days[String(d)] ? "✔" : ""}</td>)}
                <td className={DW_TD + " text-center font-bold"}>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        result.days.map((d) => (
          <table key={d.day} className="border-collapse w-full mb-3">
            <thead>
              <tr><th colSpan={6} className={DW_TH + " !text-left px-2"} style={th()}>DAY {d.day}:{d.weekday}</th></tr>
              <tr>
                {["Listed Doctor Name", "Qualification", "Speciality"].map((h) => <th key={h} className={DW_TH} style={th()}>{h}</th>)}
                <th className={DW_TH} style={th(TEAL_DARK)}>Category</th>
                {["Class", "Product Name"].map((h) => <th key={h} className={DW_TH} style={th()}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {d.status && d.calls.length === 0 && (
                <tr style={{ background: GREY }}><td className={DW_TD + " font-bold"}>{d.status}</td><td className={DW_TD} /><td className={DW_TD} /><td className={DW_TD} /><td className={DW_TD} /><td className={DW_TD} /></tr>
              )}
              {d.calls.map((c, i) => (
                <tr key={i} style={{ background: GREY }}>
                  <td className={DW_TD}>{c.name}</td><td className={DW_TD}>{c.qualification}</td><td className={DW_TD}>{c.specialty}</td><td className={DW_TD}>{c.category}</td><td className={DW_TD}>{c.cls}</td><td className={DW_TD}>{c.products}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))
      )}
    </ReportModal>
  );
}
