"use client";

import { Fragment, useEffect, useState } from "react";
import { FFPicker, MonthYear, NOW, mkRange, monthLong, monthShort, rowBg, type MY } from "@/components/ff-filter-select";
import { GO, LABEL, SELECT, MONTH_NAMES, ReportModal, ScreenTitle } from "@/components/mis-analysis-panels";
import { apiClient, type DelayedStatusResult, type InputDetailsResult, type LeaveActiveResult, type LeavePeriodicallyResult, type MailStatusResult, type SampleRxResult, type TpDeviationLegacyResult } from "@/lib/api-client";
import { CARD, TEAL, TH, TD, dash, ffLine, prev, Err, Notes, RangeForm } from "@/components/r51-panels";

// Round 53 -- MIS Reports: Input Details, Sample Rx Quantity, Delayed Status, Leave Status (Active / Periodically),
// Mail Status and TP - Deviation (legacy layouts). All render in the teal Print/Excel/Close modal.
const BLUE = "#add8e6";
const toDMY = (iso: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "");
const todayIso = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const red = { color: "red", fontWeight: 700 } as const;
const titleCls = "text-lg font-bold underline text-center";

// ═══ 1) Input Details ═════════════════════════════════════════════════
export function InputDetailsReport() {
  return (
    <RangeForm<InputDetailsResult> title="Input Details" button="View" defaultFrom={NOW}
      run={async ({ range }) => (await apiClient.inputDetails({ ...range })).data}>
      {(r, close) => {
        const bg = { background: TEAL, color: "#fff" };
        return (
          <ReportModal title="Input Details" fileName="Input_Details" onClose={close} textButtons>
            <h3 className={titleCls}>Input Details</h3>
            <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
            <Notes notes={r.notes} />
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead>
                  <tr>{["S.No", "FieldForce Name", "Designation", "HQ", "Region", "State"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}{r.months.map((m) => <th key={m} className={TH} style={bg}>{monthLong(m, "-")}</th>)}<th rowSpan={2} className={TH} style={bg}>Total</th></tr>
                  <tr>{r.months.map((m) => <th key={m} className={TH} style={bg}>No.of Input given</th>)}</tr>
                </thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td><td className={TD}>{x.region}</td><td className={TD}>{x.state}</td>
                      {r.months.map((m) => <td key={m} className={TD + " text-center"}>{dash(x.perMonth[m])}</td>)}
                      <td className={TD + " text-center"}>{dash(x.total)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: BLUE }}>
                    <td className={TD} /><td className={TD + " text-center"} style={red}>Total</td><td className={TD} /><td className={TD} /><td className={TD} /><td className={TD + " text-center"} style={red}>Total</td>
                    {r.months.map((m) => <td key={m} className={TD + " text-center"} style={red}>{dash(r.totals[m])}</td>)}
                    <td className={TD + " text-center"} style={red}>{dash(r.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ReportModal>
        );
      }}
    </RangeForm>
  );
}

// ═══ 2) Sample Rx Quantity ════════════════════════════════════════════
export function SampleRxQuantityReport() {
  const [code, setCode] = useState("");
  const [from, setFrom] = useState<MY>(prev());
  const [to, setTo] = useState<MY>(NOW);
  const [mode, setMode] = useState<"" | "product" | "brand">("");
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<SampleRxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setPicked(new Set()); setOptions([]);
    if (mode) apiClient.sampleRxProducts(mode).then((r) => setOptions(r.data)).catch((e) => setError(e instanceof Error ? e.message : "Unable to load list"));
  }, [mode]);
  const half = Math.ceil(options.length / 2);
  const cols = [options.slice(0, half), options.slice(half)];
  const toggle = (n: string) => setPicked((p) => { const x = new Set(p); if (x.has(n)) x.delete(n); else x.add(n); return x; });
  async function view() {
    if (!mode) return;
    setLoading(true); setError("");
    try { setResult((await apiClient.sampleRxQuantity({ sfCode: code, ...mkRange(from, to), mode, items: options.filter((o) => picked.has(o)).join("|") })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Sample Rx Quantity</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} label="Fieldforce Name" clearLabel="--- Select the Field force ---" filterAfterLoad />
          <MonthYear label="From" v={from} onChange={setFrom} />
          <MonthYear label="To" v={to} onChange={setTo} />
          <div className="flex flex-col gap-1"><span className={LABEL}>Select Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => setMode(e.target.value as "" | "product" | "brand")}><option value="">--Select--</option><option value="product">Product wise</option><option value="brand">Brand wise</option></select>
          </div>
        </div>
        {mode && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={options.length > 0 && picked.size === options.length} onChange={(e) => setPicked(e.target.checked ? new Set(options) : new Set())} /> Select All</label>
            <div className="grid grid-cols-2 gap-x-8 max-w-2xl">
              {cols.map((c, i) => <div key={i} className="space-y-1">{c.map((n) => <label key={n} className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={picked.has(n)} onChange={() => toggle(n)} />{n}</label>)}</div>)}
            </div>
            <button type="button" className={GO} disabled={!code || picked.size === 0 || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
          </div>
        )}
        <Err msg={error} />
      </div>
      {result && <SampleRxView r={result} onClose={() => setResult(null)} />}
    </div>
  );
}
function SampleRxView({ r, onClose }: { r: SampleRxResult; onClose: () => void }) {
  const bg = { background: TEAL, color: "#fff" };
  const title = `Sample Product Rx Quantity of ${monthShort(r.months[0], " ")} To ${monthShort(r.months[r.months.length - 1], " ")}`;
  const purple = (n: number) => (n ? <span style={{ color: "#330099", fontWeight: 700 }}>{n}</span> : "-");
  return (
    <ReportModal title={title} fileName="Sample_Rx_Quantity" onClose={onClose} textButtons>
      <h3 className={titleCls}>{title}</h3>
      <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
      <Notes notes={r.notes} />
      <div style={{ overflowX: "auto" }}>
        <table className="border-collapse">
          <thead>
            <tr>
              {["S.No", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={3} className={TH} style={bg}>{h}</th>)}
              <th colSpan={2} rowSpan={2} className={TH} style={bg}>Total No.Of Rxers<br />(No.of Rx Drs)</th>
              <th rowSpan={3} className={TH} style={bg}>Total No.Of Rxns<br />(Total Rx Qty)</th>
              {r.months.map((m) => <th key={m} colSpan={r.items.length} className={TH} style={bg}>{monthLong(m, "-")}</th>)}
            </tr>
            <tr>{r.months.map((m) => <th key={m} colSpan={r.items.length} className={TH} style={bg}>Rx Quantity given to No.of Drs</th>)}</tr>
            <tr><th className={TH} style={bg}>Multiple</th><th className={TH} style={bg}>Unique</th>{r.months.map((m) => r.items.map((it) => <th key={m + it} className={TH} style={bg}>{it}</th>))}</tr>
          </thead>
          <tbody>
            {r.rows.map((x) => (
              <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                <td className={TD + " text-center"}>{dash(x.multiple)}</td><td className={TD + " text-center"}>{dash(x.unique)}</td><td className={TD + " text-center"}>{dash(x.totalQty)}</td>
                {r.months.map((m) => r.items.map((it) => <td key={m + it} className={TD + " text-center"}>{dash(x.perMonth[m][it])}</td>))}
              </tr>
            ))}
            <tr style={{ background: BLUE }}>
              <td className={TD} /><td className={TD + " text-center"} style={red}>Total</td><td className={TD} /><td className={TD} />
              <td className={TD + " text-center"}>{purple(r.total.multiple)}</td><td className={TD + " text-center"}>{purple(r.total.unique)}</td><td className={TD + " text-center"}>{purple(r.total.totalQty)}</td>
              {r.months.map((m) => r.items.map((it) => <td key={m + it} className={TD + " text-center"}>{purple(r.total.perMonth[m][it])}</td>))}
            </tr>
          </tbody>
        </table>
      </div>
    </ReportModal>
  );
}

// ═══ 3) Delayed Status ════════════════════════════════════════════════
const DESIG_ROW: Record<string, string> = { BH: "#6699ff", ZBM: "#ffff99", RBM: "#ffcc99", ABM: "#ffff33", NBM: "#ff9900" };
const delayedBg = (designation: string, role: string) => DESIG_ROW[designation.trim().toUpperCase()] ?? (role === "MR" || role === "SR_MR" ? "#ffccff" : undefined);
export function DelayedStatusReport() {
  const [code, setCode] = useState("admin");
  const [my, setMy] = useState<MY>(NOW);
  const [result, setResult] = useState<DelayedStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.delayedStatus({ sfCode: code || "admin", fromMonth: String(my.m), fromYear: String(my.y) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  const bg = { background: "#336699", color: "#fff" };
  const cell = "border border-black px-1 py-0.5 text-[11px]";
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Delayed Status</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} label="Fieldforce Name" adminOption clearLabel="---Select Clear---" />
          <MonthYear label="" v={my} monthOnly onChange={setMy} /><MonthYear label="" v={my} yearOnly onChange={setMy} />
          <button type="button" className={GO} disabled={loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Delayed Status" fileName="Delayed_Status" onClose={() => setResult(null)} textButtons>
          <h3 className="text-sm font-bold underline" style={{ color: "red" }}>Delayed Status for the month of {MONTH_NAMES[Number(result.month.slice(5, 7)) - 1]} - {result.month.slice(0, 4)}</h3>
          <Notes notes={result.notes} />
          <div style={{ overflowX: "auto" }}>
            <table className="border-collapse">
              <thead><tr>{["S.No", "Employee_Code", "FieldForce Name", "HQ", "Designation", "Joining_Date", "Resigned_Date", "Last DCR Date", "Reporting_Manager1", "Reporting_Manager2", "Delayed Not Released Dates", "Delay Lock date(release date)"].map((h) => <th key={h} className={cell + " font-bold text-center"} style={bg}>{h}</th>)}</tr></thead>
              <tbody>
                {result.rows.map((x) => (
                  <tr key={x.employeeCode} style={{ background: delayedBg(x.designation, x.role) }}>
                    <td className={cell + " text-center"}>{x.sno}</td><td className={cell}>{x.employeeCode}</td><td className={cell}>{x.name}</td><td className={cell}>{x.hq}</td><td className={cell}>{x.designation}</td>
                    <td className={cell}>{x.joiningDate}</td><td className={cell}>{x.resignedDate}</td><td className={cell}>{x.lastDcrDate}</td><td className={cell}>{x.manager1}</td><td className={cell}>{x.manager2}</td>
                    <td className={cell}>{x.notReleased.join(", ")}</td><td className={cell}>{x.released.join(", ")}</td>
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

// ═══ 4) Leave Status - Active Fieldforce ══════════════════════════════
const LKINDS = ["CL", "PL", "SL", "LOP"] as const;
export function LeaveStatusActiveReport() {
  const [detailed, setDetailed] = useState(false);
  return (
    <RangeForm<LeaveActiveResult & { detailed: boolean }> title="Leave Status - Active Fieldforce" button="View" defaultFrom={NOW}
      extra={<label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" checked={detailed} onChange={(e) => setDetailed(e.target.checked)} /> Detailed</label>}
      run={async ({ range }) => ({ ...(await apiClient.leaveStatusActive(range)).data, detailed })}>
      {(r, close) => {
        const bg = { background: TEAL, color: "#fff" };
        const title = `Leave Status for the Month of ${monthShort(r.months[0], " ")} To ${monthShort(r.months[r.months.length - 1], " ")}`;
        const span = r.detailed ? 4 : 1;
        return (
          <ReportModal title="Leave Status" fileName="Leave_Status_Active" onClose={close} textButtons>
            <h3 className="text-base font-bold">{title}</h3>
            <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
            <Notes notes={r.notes} />
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead>
                  <tr>
                    {["S.No", "Employee id", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={r.detailed ? 3 : 2} className={TH} style={bg}>{h}</th>)}
                    {r.months.map((m) => <th key={m} colSpan={span} className={TH} style={bg}>{monthLong(m, "-")}</th>)}
                    {r.detailed ? [...LKINDS.map((k) => <th key={k} rowSpan={3} className={TH} style={bg}>{k} Total</th>), <th key="t" rowSpan={3} className={TH} style={bg}>Total</th>] : <th rowSpan={2} className={TH} style={bg}>Total</th>}
                  </tr>
                  <tr>{r.months.map((m) => <th key={m} colSpan={span} className={TH} style={bg}>Leave Count</th>)}</tr>
                  {r.detailed && <tr>{r.months.map((m) => LKINDS.map((k) => <th key={m + k} className={TH} style={bg}>{k}</th>))}</tr>}
                </thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.employeeCode}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                      {r.months.map((m) => r.detailed ? LKINDS.map((k) => <td key={m + k} className={TD + " text-center"}>{x.perMonth[m][k] || ""}</td>) : <td key={m} className={TD + " text-center"}>{x.perMonth[m].total || ""}</td>)}
                      {r.detailed && LKINDS.map((k) => <td key={k} className={TD + " text-center"}>{x.totals[k] || ""}</td>)}
                      <td className={TD + " text-center"}>{x.totals.total || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportModal>
        );
      }}
    </RangeForm>
  );
}

// ═══ 5) Leave Status - Periodically ═══════════════════════════════════
export function LeaveStatusPeriodicallyReport() {
  const [code, setCode] = useState("");
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(addDays(todayIso(), 30));
  const [detailed, setDetailed] = useState(false);
  const [result, setResult] = useState<LeavePeriodicallyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.leaveStatusPeriodically({ sfCode: code, from, to, detailed: detailed ? "1" : "0" })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Leave Status - Periodically</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} label="Fieldforce Name" />
          <div className="flex flex-col gap-1"><span className={LABEL}>From Date</span><input type="date" className={SELECT} value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="flex flex-col gap-1"><span className={LABEL}>To Date</span><input type="date" className={SELECT} value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" checked={detailed} onChange={(e) => setDetailed(e.target.checked)} /> Detailed</label>
          <button type="button" className={GO} disabled={!code || !from || !to || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && <LeavePeriodView r={result} onClose={() => setResult(null)} />}
    </div>
  );
}
function LeavePeriodView({ r, onClose }: { r: LeavePeriodicallyResult; onClose: () => void }) {
  const bg = { background: TEAL, color: "#fff" };
  const fmt = (iso: string) => `${MONTH_NAMES[Number(iso.slice(5, 7)) - 1].slice(0, 3)} ${Number(iso.slice(8, 10))} ${iso.slice(0, 4)}`;
  const period = `${toDMY(r.from)} To ${toDMY(r.to)}`;
  return (
    <ReportModal title="Leave Status" fileName="Leave_Status_Periodically" onClose={onClose} textButtons>
      <h3 className="text-base font-bold">Leave Status between <span style={{ color: "red" }}>{fmt(r.from)}</span> To <span style={{ color: "red" }}>{fmt(r.to)}</span></h3>
      <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
      <Notes notes={r.notes} />
      <div style={{ overflowX: "auto" }}>
        <table className="border-collapse">
          <thead>
            <tr>
              {["S.No", "Employee id", "Joining Date", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={r.detailed ? 3 : 2} className={TH} style={bg}>{h}</th>)}
              <th colSpan={r.detailed ? 4 : 2} className={TH} style={bg}>{period}</th>
              {r.detailed && <th rowSpan={3} className={TH} style={bg}>Total</th>}
            </tr>
            {r.detailed ? (
              <><tr><th colSpan={4} className={TH} style={bg}>Leave Count</th></tr><tr>{LKINDS.map((k) => <th key={k} className={TH} style={bg}>{k}</th>)}</tr></>
            ) : <tr><th className={TH} style={bg}>Leave Days</th><th className={TH} style={bg}>Leave Count</th></tr>}
          </thead>
          <tbody>
            {r.rows.map((x) => (
              <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.employeeCode}</td><td className={TD}>{r.detailed ? x.joiningDate.replace(/\//g, "-") : x.joiningDate}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                {r.detailed ? <Fragment>{LKINDS.map((k) => <td key={k} className={TD + " text-center"}>{x[k] || ""}</td>)}<td className={TD + " text-center"}>{x.total || ""}</td></Fragment>
                  : <Fragment><td className={TD}>{x.leaveDates.join(", ")}</td><td className={TD + " text-center"}>{x.total || ""}</td></Fragment>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportModal>
  );
}

// ═══ 6) Mail Status ═══════════════════════════════════════════════════
export function MailStatusReport() {
  const [from, setFrom] = useState(addDays(todayIso(), -30));
  const [to, setTo] = useState(todayIso());
  const [result, setResult] = useState<MailStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.mailStatus({ from, to })).data); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  const bg = { background: TEAL, color: "#fff" };
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Mail Status</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1"><span className={LABEL}>From Date</span><input type="date" className={SELECT} value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="flex flex-col gap-1"><span className={LABEL}>To Date</span><input type="date" className={SELECT} value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <button type="button" className={GO} disabled={!from || !to || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Mail Status" fileName="Mail_Status" onClose={() => setResult(null)} textButtons>
          <h3 className="text-base font-bold">Mail Status between {toDMY(result.from)} To {toDMY(result.to)}</h3>
          <Notes notes={result.notes} />
          <table className="border-collapse">
            <thead><tr>{["S.No", "Date & Time", "To", "Subject", "Mail Type", "Status", "Error"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
            <tbody>
              {result.rows.map((x) => (
                <tr key={x.sno}><td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{new Date(x.sentAt).toLocaleString()}</td><td className={TD}>{x.toName ? `${x.toName} <${x.to}>` : x.to}</td><td className={TD}>{x.subject}</td><td className={TD}>{x.mailType}</td>
                  <td className={TD} style={{ color: x.status === "failed" ? "red" : "green", fontWeight: 700 }}>{x.status}</td><td className={TD}>{x.error}</td></tr>
              ))}
              {result.rows.length === 0 && <tr><td className={TD} colSpan={7}>No mails were sent in this period.</td></tr>}
            </tbody>
          </table>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ 7) TP - Deviation For Baselevel (legacy layout) ══════════════════
export function TpDeviationBaselevelReport() {
  const [code, setCode] = useState("");
  const [my, setMy] = useState<MY>(prev());
  const [result, setResult] = useState<TpDeviationLegacyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.tpDeviationBaselevel({ sfCode: code, fromMonth: String(my.m), fromYear: String(my.y) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  const bg = { background: TEAL, color: "#fff" };
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>TP - Deviation For Baselevel</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} label="Fieldforce Name" baseOnly />
          <MonthYear label="" v={my} monthOnly onChange={setMy} /><MonthYear label="" v={my} yearOnly onChange={setMy} />
          <button type="button" className={GO} disabled={!code || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="TP - Deviation" fileName={`TP_Deviation_${result.month}`} onClose={() => setResult(null)} textButtons>
          <h3 className={titleCls}>TP - Deviation for the Month of {monthShort(result.month, " ")}</h3>
          <p className="text-sm font-bold">{ffLine(result.employee, "Filed Force Name")}</p>
          <Notes notes={result.notes} />
          <table className="border-collapse">
            <thead><tr>{["S.No", "Fieldforce Name", "Date", "Day", "As Per TP", "As Per DCR"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
            <tbody>
              {result.rows.map((x, i) => <tr key={i}><td className={TD} /><td className={TD} /><td className={TD}>{x.date}</td><td className={TD}>{x.day}</td><td className={TD}>{x.asPerTp}</td><td className={TD}>{x.asPerDcr}</td></tr>)}
              {result.rows.length === 0 && <tr><td className={TD} colSpan={6}>No deviations in this month.</td></tr>}
            </tbody>
          </table>
        </ReportModal>
      )}
    </div>
  );
}
