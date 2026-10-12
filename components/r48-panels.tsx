"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { FieldForceSelect, fieldForceLabel, useFieldForceOptions } from "@/components/field-force-select";
import { GO, LABEL, SELECT, MONTH_NAMES, THIS_YEAR, ReportModal, ScreenTitle, ym } from "@/components/mis-analysis-panels";
import { CustomSelect } from "@/components/custom-select";
import { apiClient, type DoctorwiseMode, type DoctorwiseResult, type CallFeedbackResult, type FixationResult, type FixationType } from "@/lib/api-client";

// Round 48 -- MIS Reports > Visit Details:
//   Doctorwise (Periodically)  "Listed Doctor Visit - Periodically" (9 modes)
//   Call Feedbackwise
//   Fixationwise (By Visit)

const CARD = "bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-5xl";
const NOW_M = new Date().getMonth() + 1;
const YEAR_LIST = [THIS_YEAR - 3, THIS_YEAR - 2, THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];
const TEAL = "#0099b0";
const TH = "border border-black px-1 py-0.5 text-xs font-bold text-white text-center whitespace-nowrap";
const TD = "border border-black px-1 py-0.5 text-xs";
type MY = { m: number; y: number };

function Err({ msg }: { msg: string }) { return msg ? <p className="text-sm text-status-danger">{msg}</p> : null; }
function MonthYear({ label, v, onChange }: { label: string; v: MY; onChange: (v: MY) => void }) {
  const shortMonths = MONTH_NAMES.map((m) => m.slice(0, 3));
  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <div className="flex gap-2">
        <div style={{ minWidth: 88 }}>
          <CustomSelect
            value={shortMonths[v.m - 1] ?? shortMonths[0]}
            onChange={(val) => onChange({ ...v, m: shortMonths.indexOf(val) + 1 })}
            options={shortMonths}
          />
        </div>
        <div style={{ minWidth: 92 }}>
          <CustomSelect
            value={String(v.y)}
            onChange={(val) => onChange({ ...v, y: parseInt(val, 10) })}
            options={YEAR_LIST.map(String)}
          />
        </div>
      </div>
    </div>
  );
}
const prevMonth = (): MY => (NOW_M === 1 ? { m: 12, y: THIS_YEAR - 1 } : { m: NOW_M - 1, y: THIS_YEAR });
const mLong = (m: string, sep: string) => { const [y, mm] = m.split("-").map(Number); return `${MONTH_NAMES[mm - 1]}${sep}${y}`; };
const mShortSp = (m: string) => { const [y, mm] = m.split("-").map(Number); return `${MONTH_NAMES[mm - 1].slice(0, 3)} - ${y}`; };
const range = (months: string[]) => `${mLong(months[0], " ")} To ${mLong(months[months.length - 1], " ")}`;
const ffLine = (e: { name: string; designation: string; hq: string }) => `Field Force Name : ${e.name} - ${e.designation} - ${e.hq}`;
const Days = ({ days, comma }: { days: number[]; comma?: boolean }) => (days.length ? <span style={{ color: "red" }}>{days.join(",")}{comma ? "," : ""}</span> : <>-</>);
const dash = (n: number) => (n ? String(n) : "");

// ═══ Doctorwise (Periodically) ═══════════════════════════════════════════
const MODES: { key: DoctorwiseMode; label: string }[] = [
  { key: "baselevel", label: "Visit - Based on Baselevel" },
  { key: "baselevel-managers", label: "Visit - Based on Baselevels/Managers" },
  { key: "deactivate", label: "Visit - Based on Deactivate Drs" },
  { key: "daywise-remarks", label: "Visit (Daywise Remarks)" },
  { key: "listed-remarks", label: "Visit (Listed Drwise Remarks)" },
  { key: "core-mapwise", label: "Visit (Core Doctor Mapwise)" },
  { key: "ii-level", label: "Visit Listeddrs (Based on II Level)" },
  { key: "core-periodically", label: "Visit (Core Doctor Periodically)" },
  { key: "campaignwise", label: "Visit (Campaignwise)" }
];
const BASE_MODES: DoctorwiseMode[] = ["baselevel", "baselevel-managers", "deactivate", "campaignwise"];
const SINGLE_MONTH: DoctorwiseMode[] = ["daywise-remarks", "listed-remarks"];
const NO_SCOPE: DoctorwiseMode[] = ["baselevel-managers", "core-periodically"];

export function DoctorwisePeriodicallyReport() {
  const [mode, setMode] = useState<DoctorwiseMode | "">("");
  const [scope, setScope] = useState<"Team" | "Individual">("Team");
  const [code, setCode] = useState("");
  const [base, setBase] = useState("");
  const [bases, setBases] = useState<{ employeeCode: string; name: string; designation: string; hq: string }[]>([]);
  const [from, setFrom] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [to, setTo] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [result, setResult] = useState<DoctorwiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const needsBase = !!mode && BASE_MODES.includes(mode);

  useEffect(() => {
    setBase(""); setBases([]);
    if (!code || !needsBase) return;
    let alive = true;
    apiClient.doctorwiseBaseLevels(code).then((r) => { if (alive) setBases(r.data); }).catch(() => { if (alive) setBases([]); });
    return () => { alive = false; };
  }, [code, needsBase]);

  function pickMode(v: DoctorwiseMode | "") {
    setMode(v); setResult(null);
    if (v === "baselevel" || v === "baselevel-managers" || v === "campaignwise") { setFrom(prevMonth()); setTo({ m: NOW_M, y: THIS_YEAR }); }
    else if (v === "ii-level") { setFrom(NOW_M >= 4 ? { m: 4, y: THIS_YEAR } : { m: 4, y: THIS_YEAR - 1 }); setTo({ m: NOW_M, y: THIS_YEAR }); }
    else { setFrom({ m: NOW_M, y: THIS_YEAR }); setTo({ m: NOW_M, y: THIS_YEAR }); }
  }
  const single = !!mode && SINGLE_MONTH.includes(mode);
  const baseRequired = mode === "baselevel" || mode === "baselevel-managers" || mode === "campaignwise";
  const ready = !!mode && !!code && (!baseRequired || !!base);

  async function view() {
    if (!mode) return;
    setLoading(true); setError("");
    try {
      const toYm = single ? ym(from.y, from.m) : ym(to.y, to.m);
      setResult((await apiClient.doctorwisePeriodically({ mode, employeeCode: code, scope: NO_SCOPE.includes(mode) ? "Team" : scope, baseLevel: base, fromMonth: ym(from.y, from.m), toMonth: toYm })).data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Listed Doctor Visit - Periodically</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Mode</span>
            <div style={{ minWidth: 280 }}>
              <CustomSelect
                value={MODES.find((m) => m.key === mode)?.label ?? "---Select---"}
                onChange={(val) => {
                  const found = MODES.find((m) => m.label === val);
                  pickMode(found ? found.key : "");
                }}
                options={["---Select---", ...MODES.map((m) => m.label)]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>FieldForce Name</span>
            <div className="flex gap-2">
              {!(mode && NO_SCOPE.includes(mode)) && (
                <div style={{ minWidth: 120 }}>
                  <CustomSelect
                    value={scope}
                    onChange={(val) => setScope(val as "Team" | "Individual")}
                    options={["Team", "Individual"]}
                  />
                </div>
              )}
              <FieldForceSelect value={code} onChange={setCode} hideLabel clearLabel="---Select Clear---" />
            </div>
          </div>
          {needsBase && (
            <div className="flex flex-col gap-1">
              <span className={LABEL}>Base Level</span>
              <div style={{ minWidth: 240 }}>
                <CustomSelect
                  value={bases.find((b) => b.employeeCode === base) ? `${bases.find((b) => b.employeeCode === base)!.name} - ${bases.find((b) => b.employeeCode === base)!.designation} - ${bases.find((b) => b.employeeCode === base)!.hq}` : "---Select---"}
                  onChange={(val) => {
                    const found = bases.find((b) => `${b.name} - ${b.designation} - ${b.hq}` === val);
                    setBase(found ? found.employeeCode : "");
                  }}
                  options={["---Select---", ...bases.map((b) => `${b.name} - ${b.designation} - ${b.hq}`)]}
                />
              </div>
            </div>
          )}
          <MonthYear label={single ? "Month & Year" : "From Month & Year"} v={from} onChange={setFrom} />
          {!single && <MonthYear label="To Month & Year" v={to} onChange={setTo} />}
          <button type="button" className={GO} disabled={!ready || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && <DoctorwiseResultView result={result} onClose={() => setResult(null)} />}
    </div>
  );
}

const SORTS = ["Name", "Category", "Specialty", "Class", "Territory"] as const;
const sortVal = (r: any, k: string) => String(k === "Name" ? r.name : k === "Category" ? r.category : k === "Specialty" ? r.specialty : k === "Class" ? r.cls : r.territory);

function DoctorwiseResultView({ result, onClose }: { result: DoctorwiseResult; onClose: () => void }) {
  const { months, kind } = result;
  const label = MODES.find((m) => m.key === kind)?.label || "";
  const [pick, setPick] = useState("");
  const [order, setOrder] = useState("");
  const single = SINGLE_MONTH.includes(kind);
  const title = single ? `${label} - ${mLong(months[0], " ")}` : `${label} for the month of ${range(months)}`;
  const sortable = !["daywise-remarks", "core-periodically"].includes(kind);
  const rows: any[] = useMemo(() => {
    const r = ("rows" in result ? [...(result as any).rows] : []) as any[];
    if (order) r.sort((a, b) => sortVal(a, order).localeCompare(sortVal(b, order)) || a.name.localeCompare(b.name));
    return r.map((x, i) => ({ ...x, sno: i + 1 }));
  }, [result, order]);
  const buckets: string[] = (result as any).buckets || [];
  const bg = { background: TEAL };

  const docCols: [string, (r: any) => string][] =
    kind === "baselevel" || kind === "baselevel-managers" ? [["Unique DR Code", (r) => r.doctorCode], ["ListedDr_Name", (r) => r.name], ["UNI NO", (r) => r.uniNo], ["Category", (r) => r.category], ["Specialty", (r) => r.specialty], ["Class", (r) => r.cls], ["Qualification", (r) => r.qualification], ["Territory", (r) => r.territory]]
    : kind === "campaignwise" ? [["Unique DR Code", (r) => r.doctorCode], ["ListedDr_Name", (r) => r.name], ["Campaign", (r) => r.campaign], ["UNI NO", (r) => r.uniNo], ["Category", (r) => r.category], ["Specialty", (r) => r.specialty], ["Class", (r) => r.cls], ["Qualification", (r) => r.qualification], ["Territory", (r) => r.territory]]
    : kind === "deactivate" ? [["Listed Doctor Name", (r) => r.name], ["UNI NO", (r) => r.uniNo], ["Category", (r) => r.category], ["Specialty", (r) => r.specialty], ["Class", (r) => r.cls], ["Qualification", (r) => r.qualification], ["Territory", (r) => r.territory], ["Deactivate Date", (r) => r.deactivateDate]]
    : kind === "listed-remarks" ? [["Listed Doctor Name", (r) => r.name], ["UNI No", (r) => r.uniNo], ["Category", (r) => r.category], ["Specialty", (r) => r.specialty], ["Class", (r) => r.cls], ["Qualification", (r) => r.qualification], ["Territory", (r) => r.territory]]
    : kind === "core-mapwise" ? [["Listed Doctor Name", (r) => r.name], ["Mapped To", (r) => r.mappedTo], ["UNI NO", (r) => r.uniNo], ["Category", (r) => r.category], ["Specialty", (r) => r.specialty], ["Class", (r) => r.cls], ["Qualification", (r) => r.qualification], ["Territory", (r) => r.territory]]
    : kind === "ii-level" ? [["Sf Name", (r) => r.sfName], ["Listed Doctor Name", (r) => r.name], ["UNI NO", (r) => r.uniNo], ["Category", (r) => r.category], ["Specialty", (r) => r.specialty], ["Qualification", (r) => r.qualification], ["Class", (r) => r.cls], ["Territory", (r) => r.territory]]
    : [];
  const fixed = ["S.No", ...docCols.map((c) => c[0])];
  const Head = ({ extra }: { extra?: number }) => null as any;
  void Head;

  return (
    <ReportModal title={title} fileName="Listed_Doctor_Visit_Periodically" onClose={onClose} textButtons>
      <h3 className="text-base font-bold">{title}</h3>
      {kind !== "daywise-remarks" || true ? <p className="text-sm font-bold">{ffLine(result.employee)}</p> : null}
      {(result as any).baseLevel && <p className="text-sm font-bold">Base Level : {(result as any).baseLevel.name} - {(result as any).baseLevel.designation} - {(result as any).baseLevel.hq}</p>}
      {result.notes.map((n, i) => <p key={i} className="text-xs italic text-text-muted">{n}</p>)}
      {sortable && (
        <div className="flex items-center gap-2 text-sm" data-noexport>
          <span className="font-bold">Order BY</span>
          <select className={SELECT} value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">---Select---</option>
            {SORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" className="px-3 py-1 rounded border border-border-subtle text-sm" onClick={() => setOrder(pick)}>Go</button>
        </div>
      )}

      {kind === "daywise-remarks" && (
        <table className="border-collapse">
          <thead><tr><th className={TH} style={bg}>Day</th>{buckets.map((b) => <th key={b} className={TH} style={bg}>{b}</th>)}</tr></thead>
          <tbody>
            {(result as any).days.map((d: any) => (
              <tr key={d.day}>
                <td className={TD + " text-center font-bold"}>{d.day}</td>
                {buckets.map((b) => <td key={b} className={TD} style={{ maxWidth: 260, whiteSpace: "normal", wordBreak: "break-word" }}>{d.cells[b].map((t: string, i: number) => <div key={i}>{t}</div>)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {kind === "core-periodically" && (
        <table className="border-collapse">
          <thead>
            <tr>{["S.No", "Field Force Name", "Desig", "HQ"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}{months.map((m) => <th key={m} colSpan={4} className={TH} style={bg}>{mShortSp(m)}</th>)}</tr>
            <tr>{months.map((m) => ["Tot Drs", "Visited Calls", "Missed Calls", "Per (%)"].map((h) => <th key={m + h} className={TH} style={bg}>{h}</th>))}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.employeeCode} style={{ background: "#ffff66" }}>
                <td className={TD + " text-center"}>{r.sno}</td><td className={TD}>{r.name}</td><td className={TD + " text-center"}>{r.designation}</td><td className={TD}>{r.hq}</td>
                {months.map((m) => { const c = r.perMonth[m]; return (
                  <Fragment key={m}>
                    <td className={TD + " text-center"}>{c.tot || "-"}</td><td className={TD + " text-center"}>{c.visited || "-"}</td><td className={TD + " text-center"}>{c.missed || "-"}</td><td className={TD + " text-center"}>{c.per || "-"}</td>
                  </Fragment>
                ); })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {docCols.length > 0 && kind !== "core-periodically" && kind !== "daywise-remarks" && (
        <table className="border-collapse">
          <thead>
            <tr>
              {fixed.map((h) => <th key={h} rowSpan={kind === "baselevel-managers" || kind === "ii-level" ? (kind === "ii-level" ? 3 : 3) : 2} className={TH} style={bg}>{h}</th>)}
              {months.map((m) => (
                <th key={m} colSpan={kind === "baselevel-managers" ? buckets.length * 2 : kind === "listed-remarks" ? buckets.length : 2} className={TH} style={bg}>{kind === "ii-level" ? mLong(m, "-") : mShortSp(m)}</th>
              ))}
            </tr>
            {kind === "baselevel-managers" && <tr>{months.map((m) => buckets.map((b) => <th key={m + b} colSpan={2} className={TH} style={bg}>{b}</th>))}</tr>}
            {kind === "ii-level" && <tr>{months.map((m) => <th key={m} colSpan={2} className={TH} style={bg}>BE/Sr BE</th>)}</tr>}
            <tr>
              {months.map((m) => kind === "listed-remarks" ? buckets.map((b) => <th key={m + b} className={TH} style={bg}>{b}</th>)
                : kind === "baselevel-managers" ? buckets.map((b) => <Fragment key={m + b}><th className={TH} style={bg}>Count</th><th className={TH} style={bg}>Date</th></Fragment>)
                : <Fragment key={m}><th className={TH} style={bg}>Count</th><th className={TH} style={bg}>Date</th></Fragment>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td className={TD + " text-center"} colSpan={fixed.length + 2}>No records.</td></tr>}
            {rows.map((r) => (
              <tr key={r.sno + r.doctorId + (r.sfName || "")}>
                <td className={TD + " text-center"}>{r.sno}</td>
                {docCols.map(([h, get]) => <td key={h} className={TD}>{get(r)}</td>)}
                {months.map((m) => {
                  if (kind === "listed-remarks") return buckets.map((b) => { const c = r.cells[b]; return <td key={m + b} className={TD} style={{ maxWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }}>{c.remark || (c.visited ? <span style={{ color: "red" }}>[]</span> : "")}</td>; });
                  if (kind === "baselevel-managers") return buckets.map((b) => { const c = r.perMonth[m][b]; return <Fragment key={m + b}><td className={TD + " text-center"}>{c.count || "-"}</td><td className={TD + " text-center"}><Days days={c.days} comma /></td></Fragment>; });
                  const c = r.perMonth[m];
                  return <Fragment key={m}><td className={TD + " text-center"}>{c.count || "-"}</td><td className={TD + " text-center"}><Days days={c.days} /></td></Fragment>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ReportModal>
  );
}

// ═══ Call Feedbackwise ═══════════════════════════════════════════════════
export function CallFeedbackwiseReport() {
  const all = useFieldForceOptions();
  const [text, setText] = useState("");
  const [code, setCode] = useState("");
  const [from, setFrom] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [to, setTo] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [mode, setMode] = useState("");
  const [result, setResult] = useState<CallFeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const shown = useMemo(() => { const t = text.trim().toLowerCase(); return t ? all.filter((e) => fieldForceLabel(e).toLowerCase().includes(t)) : all; }, [all, text]);
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.callFeedbackwise({ employeeCode: code, fromMonth: ym(from.y, from.m), toMonth: ym(to.y, to.m) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>ListedDr - Call Feedbackwise</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Filed Force Name</span>
            <div className="flex gap-2">
              <input className={SELECT + " w-40"} placeholder="Type to filter" value={text} onChange={(e) => setText(e.target.value)} />
              <FieldForceSelect value={code} onChange={setCode} hideLabel employees={shown} clearLabel="---Select Clear---" />
            </div>
          </div>
          <MonthYear label="From Month & Year" v={from} onChange={setFrom} />
          <MonthYear label="To Month & Year" v={to} onChange={setTo} />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Mode</span>
            <div style={{ minWidth: 180 }}>
              <CustomSelect
                value={mode === "feedback" ? "Call feedbackwise" : "---Select---"}
                onChange={(val) => setMode(val === "Call feedbackwise" ? "feedback" : "")}
                options={["---Select---", "Call feedbackwise"]}
              />
            </div>
          </div>
          <button type="button" className={GO} disabled={!code || !mode || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && <CallFeedbackView result={result} onClose={() => setResult(null)} />}
    </div>
  );
}

function CallFeedbackView({ result, onClose }: { result: CallFeedbackResult; onClose: () => void }) {
  const { months } = result;
  const title = `ListedDr - Call Feedbackwise for the month of ${range(months)}`;
  const bg = { background: TEAL };
  return (
    <ReportModal title={title} fileName="ListedDr_Call_Feedbackwise" onClose={onClose} textButtons>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-sm font-bold">{ffLine(result.employee)}</p>
      {result.notes.map((n, i) => <p key={i} className="text-xs italic text-text-muted">{n}</p>)}
      <table className="border-collapse">
        <thead>
          <tr>{["S.No", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}{months.map((m) => <th key={m} colSpan={3} className={TH} style={bg}>{mLong(m, "-")}</th>)}</tr>
          <tr>{months.map((m) => ["TDrs", "Met", "teste"].map((h) => <th key={m + h} className={TH} style={bg}>{h}</th>))}</tr>
        </thead>
        <tbody>
          {result.rows.map((r) => (
            <tr key={r.employeeCode} style={{ background: "#ff9900" }}>
              <td className={TD + " text-center"}>{r.sno}</td><td className={TD}>{r.name}</td><td className={TD + " text-center"}>{r.designation}</td><td className={TD}>{r.hq}</td>
              {months.map((m) => { const c = r.perMonth[m]; return <Fragment key={m}><td className={TD + " text-center"}>{dash(c.tdrs)}</td><td className={TD + " text-center"}>{dash(c.met)}</td><td className={TD + " text-center"}>{dash(c.feedback)}</td></Fragment>; })}
            </tr>
          ))}
        </tbody>
      </table>
    </ReportModal>
  );
}

// ═══ Fixationwise (By Visit) ═════════════════════════════════════════════
const FX_TYPES: FixationType[] = ["Category", "Speciality", "Class", "Campaign"];
const FX_SUB = ["TDrs", "0 V", "1 V", "2 V", "M 2 V", "Miss"] as const;

export function FixationwiseByVisitReport() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<FixationType | "">("");
  const [from, setFrom] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [to, setTo] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [result, setResult] = useState<FixationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    if (!type) return;
    setLoading(true); setError("");
    try { setResult((await apiClient.fixationwise({ employeeCode: code, type, fromMonth: ym(from.y, from.m), toMonth: ym(to.y, to.m) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Fixationwise Visit Details</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Field Force Name" clearLabel="--- Select the Field force ---" />
          <MonthYear label="From Month & Year" v={from} onChange={setFrom} />
          <MonthYear label="To Month & Year" v={to} onChange={setTo} />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Type</span>
            <div style={{ minWidth: 160 }}>
              <CustomSelect
                value={type || "---Select---"}
                onChange={(val) => setType(val === "---Select---" ? "" : (val as FixationType))}
                options={["---Select---", ...FX_TYPES]}
              />
            </div>
          </div>
          <button type="button" className={GO} disabled={!code || !type || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && <FixationView result={result} onClose={() => setResult(null)} />}
    </div>
  );
}

function FixationView({ result, onClose }: { result: FixationResult; onClose: () => void }) {
  const { months, values } = result;
  const title = `Visit Details ${result.type} Wise Between - ${range(months)}`;
  const bg = { background: "#003300" };
  const vals = (c: { tdrs: number; v0: number; v1: number; v2: number; vm2: number; miss: number }) => [
    [c.tdrs, undefined], [c.v0, "red"], [c.v1, undefined], [c.v2, undefined], [c.vm2, undefined], [c.miss, "magenta"]
  ] as [number, string | undefined][];
  return (
    <ReportModal title={title} fileName="Fixationwise_Visit_Details" onClose={onClose}>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-sm font-bold">{ffLine(result.employee)}</p>
      {result.notes.map((n, i) => <p key={i} className="text-xs italic text-text-muted">{n}</p>)}
      <div style={{ overflowX: "auto" }}>
        <table className="border-collapse">
          <thead>
            <tr>
              {["S.No", "FieldForce Name", "Designation", "HQ", "Employee_Id", "SubDivision"].map((h) => <th key={h} rowSpan={3} className={TH} style={bg}>{h}</th>)}
              {months.map((m) => <th key={m} colSpan={values.length * 6} className={TH} style={bg}>{mLong(m, "-")}</th>)}
              <th rowSpan={3} className={TH} style={bg}>NL Drs</th>
            </tr>
            <tr>{months.map((m) => values.map((v) => <th key={m + v.value} colSpan={6} className={TH} style={bg}>{v.value}{v.norm !== null ? `(${v.norm})` : ""}</th>))}</tr>
            <tr>{months.map((m) => values.map((v) => FX_SUB.map((s) => <th key={m + v.value + s} className={TH} style={bg}>{s}</th>)))}</tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.employeeCode} style={{ background: r.isManager ? "#ffff66" : "#ffccff" }}>
                <td className={TD + " text-center"}>{r.sno}</td><td className={TD}>{r.name}</td><td className={TD + " text-center"}>{r.designation}</td><td className={TD}>{r.hq}</td><td className={TD}>{r.employeeCode}</td><td className={TD}>{r.subDivision}</td>
                {months.map((m) => values.map((v) => vals(r.perMonth[m][v.value]).map(([n, color], i) => (
                  <td key={m + v.value + i} className={TD + " text-center"} style={color ? { color } : undefined}>{n}</td>
                ))))}
                <td className={TD + " text-center"}>{r.nlDrs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportModal>
  );
}
