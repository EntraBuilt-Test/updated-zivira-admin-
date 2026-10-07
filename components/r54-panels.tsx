"use client";

import { useEffect, useState } from "react";
import { FFPicker, MonthYear, NOW, mkRange, monthLong, monthShort, rowBg, type MY } from "@/components/ff-filter-select";
import { GO, ReportModal, ScreenTitle } from "@/components/mis-analysis-panels";
import { apiClient, type DoctorsAddDeactDrillResult, type DoctorsAddDeactResult, type TpDevAtGlanceResult, type TpDevDrillResult, type TpDevManagersResult } from "@/lib/api-client";
import { CARD, TEAL, TH, TD, ffLine, prev, Err, Notes, RangeForm } from "@/components/r51-panels";

// Round 54 -- MIS Reports: TP - Deviation For Managers, TP - Deviation At A Glance, Doctors - Addition/Deactivation Status.
const titleCls = "text-lg font-bold underline text-center";
const bg = { background: TEAL, color: "#fff" };
const link = "underline font-bold";

// ═══ 1) TP - Deviation For Managers ═══════════════════════════════════
export function TpDeviationManagersReport() {
  const [code, setCode] = useState("");
  const [my, setMy] = useState<MY>(NOW);
  const [result, setResult] = useState<TpDevManagersResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.tpDeviationManagers({ sfCode: code, fromMonth: String(my.m), fromYear: String(my.y) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>TP - Deviation For Managers</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} label="Fieldforce Name" clearLabel="--- Select the Field force ---" noFilter managersOnly />
          <MonthYear label="" v={my} monthOnly onChange={setMy} /><MonthYear label="" v={my} yearOnly onChange={setMy} />
          <button type="button" className={GO} disabled={!code || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="TP - Deviation" fileName={`TP_Deviation_Managers_${result.month}`} onClose={() => setResult(null)} textButtons>
          <h3 className={titleCls}>TP - Deviation for the Month of {monthShort(result.month, " ")}</h3>
          <p className="text-sm font-bold">{ffLine(result.employee, "Filed Force Name")}</p>
          <Notes notes={result.notes} />
          <table className="border-collapse">
            <thead><tr>{["S.No", "Fieldforce Name", "Date", "Day", "As Per TP", "As Per DCR"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
            <tbody>
              {result.rows.map((x) => <tr key={x.sno}><td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.fieldForce}</td><td className={TD}>{x.date}</td><td className={TD}>{x.day}</td><td className={TD}>{x.asPerTp}</td><td className={TD}>{x.asPerDcr}</td></tr>)}
              {result.rows.length === 0 && <tr><td className={TD} colSpan={6}>No deviations in this month.</td></tr>}
            </tbody>
          </table>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ 2) TP - Deviation At A Glance ════════════════════════════════════
export function TpDeviationAtGlanceReport() {
  const [drill, setDrill] = useState<{ code: string; month: string } | null>(null);
  return (
    <>
      <RangeForm<TpDevAtGlanceResult> title="TP - Deviation At A Glance" button="View" defaultFrom={NOW} run={async ({ range }) => (await apiClient.tpDeviationAtGlance(range)).data}>
        {(r, close) => (
          <ReportModal title="TP Deviation" fileName="TP_Deviation_At_A_Glance" onClose={close} textButtons>
            <h3 className="text-base font-bold">TP Deviation for the Period of {monthShort(r.months[0], " ")} To {monthShort(r.months[r.months.length - 1], " ")}</h3>
            <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
            <Notes notes={r.notes} />
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead><tr>{["S.No", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}{r.months.map((m) => <th key={m} className={TH} style={bg}>{monthLong(m, "-")}</th>)}</tr></thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                      {r.months.map((m) => <td key={m} className={TD + " text-center"}>{x.perMonth[m] ? <button type="button" className={link} style={{ color: "#0000ee" }} onClick={() => setDrill({ code: x.employeeCode, month: m })}>{x.perMonth[m]}</button> : ""}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportModal>
        )}
      </RangeForm>
      {drill && <TpDrill d={drill} onClose={() => setDrill(null)} />}
    </>
  );
}
function TpDrill({ d, onClose }: { d: { code: string; month: string }; onClose: () => void }) {
  const [res, setRes] = useState<TpDevDrillResult | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { apiClient.tpDeviationDrill({ sfCode: d.code, fromMonth: String(Number(d.month.slice(5, 7))), fromYear: d.month.slice(0, 4) }).then((r) => setRes(r.data)).catch((e) => setErr(e instanceof Error ? e.message : "Unable to load")); }, [d]);
  return (
    <ReportModal title="TP - Deviation" fileName="TP_Deviation_Days" onClose={onClose} textButtons>
      {res && <><h3 className={titleCls}>TP - Deviation for the Month of {monthShort(res.month, " ")}</h3><p className="text-sm font-bold">{ffLine(res.employee, "Filed Force Name")}</p></>}
      <Err msg={err} />
      <table className="border-collapse">
        <thead><tr>{["Date", "Day", "As Per TP", "As Per DCR"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
        <tbody>{res?.rows.map((x, i) => <tr key={i}><td className={TD}>{x.date}</td><td className={TD}>{x.day}</td><td className={TD}>{x.asPerTp}</td><td className={TD}>{x.asPerDcr}</td></tr>)}</tbody>
      </table>
    </ReportModal>
  );
}

// ═══ 3) Doctors - Addition/Deactivation Status ═════════════════════════
export function DoctorsAddDeactReport() {
  const [code, setCode] = useState("admin");
  const [from, setFrom] = useState<MY>(prev());
  const [to, setTo] = useState<MY>(NOW);
  const [result, setResult] = useState<DoctorsAddDeactResult | null>(null);
  const [drill, setDrill] = useState<{ code: string; name: string; month: string; kind: "added" | "deactivated" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { const r = mkRange(from, to); setResult((await apiClient.doctorsAddDeactivation({ sfCode: code || "admin", ...r })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  const cnt = (n: number, color: string, onClick: () => void) => (n ? <button type="button" className={link} style={{ color }} onClick={onClick}>{n}</button> : "-");
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Doctors - Addition/Deactivation Status</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4 text-base">
          <FFPicker value={code} onChange={setCode} label="Filed Force Name" noFilter adminOption clearLabel="---Select Clear---" />
          <MonthYear label="From" v={from} onChange={setFrom} /><MonthYear label="To" v={to} onChange={setTo} />
          <button type="button" className={GO} disabled={loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Doctors - Addition/Deactivation Status" fileName="Doctors_Addition_Deactivation_Status" onClose={() => setResult(null)} textButtons>
          <h3 className={titleCls}>Doctors - Addition/Deactivation Status for the month of {monthLong(result.months[0], " ")} To {monthLong(result.months[result.months.length - 1], " ")}</h3>
          <Notes notes={result.notes} />
          <div style={{ overflowX: "auto" }}>
            <table className="border-collapse">
              <thead>
                <tr>
                  {["S.No", "FieldForce Name", "HQ", "Designation Name", "Emp Code", "Division Name", "Level 3 Mgr", "Level 2 Mgr", "Level 1 Mgr"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}
                  {result.months.map((m) => <th key={m} colSpan={2} className={TH} style={bg}>{monthShort(m, " - ")}</th>)}
                </tr>
                <tr>{result.months.map((m) => ["Addition Count", "Deactivation Count"].map((h) => <th key={m + h} className={TH} style={bg}>{h}</th>))}</tr>
              </thead>
              <tbody>
                {result.rows.map((x) => (
                  <tr key={x.employeeCode}>
                    <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD}>{x.hq}</td><td className={TD}>{x.designation}</td><td className={TD}>{x.employeeCode}</td><td className={TD}>{x.division}</td>
                    <td className={TD}>{x.level3}</td><td className={TD}>{x.level2}</td><td className={TD}>{x.level1}</td>
                    {result.months.map((m) => [
                      <td key={m + "a"} className={TD + " text-center"}>{cnt(x.perMonth[m].added, "#0000ee", () => setDrill({ code: x.employeeCode, name: x.name, month: m, kind: "added" }))}</td>,
                      <td key={m + "d"} className={TD + " text-center"}>{cnt(x.perMonth[m].deactivated, "red", () => setDrill({ code: x.employeeCode, name: x.name, month: m, kind: "deactivated" }))}</td>
                    ])}
                  </tr>
                ))}
                <tr>
                  <td colSpan={9} className={TD + " text-center"} style={{ color: "red", fontWeight: 700 }}>Total</td>
                  {result.months.map((m) => [
                    <td key={m + "a"} className={TD + " text-center underline"} style={{ color: "red", fontWeight: 700 }}>{result.totals[m].added}</td>,
                    <td key={m + "d"} className={TD + " text-center underline"} style={{ color: "red", fontWeight: 700 }}>{result.totals[m].deactivated}</td>
                  ])}
                </tr>
              </tbody>
            </table>
          </div>
        </ReportModal>
      )}
      {drill && <DoctorDrill d={drill} onClose={() => setDrill(null)} />}
    </div>
  );
}
function DoctorDrill({ d, onClose }: { d: { code: string; name: string; month: string; kind: "added" | "deactivated" }; onClose: () => void }) {
  const [res, setRes] = useState<DoctorsAddDeactDrillResult | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { apiClient.doctorsAddDeactDrill({ sfCode: d.code, month: d.month, kind: d.kind }).then((r) => setRes(r.data)).catch((e) => setErr(e instanceof Error ? e.message : "Unable to load")); }, [d]);
  const added = d.kind === "added";
  return (
    <ReportModal title={added ? "Doctors Added" : "Doctors Deactivated"} fileName={`Doctors_${d.kind}`} onClose={onClose} textButtons>
      <h3 className="text-base font-bold">{added ? "Doctors added" : "Doctors deactivated"} - {d.name} - {monthLong(d.month, "-")}</h3>
      <Err msg={err} />
      <table className="border-collapse">
        <thead><tr>{["S.No", "Doctor Name", "Speciality", "Category", "Class", added ? "Date Added" : "Deactivation Date"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
        <tbody>{res?.rows.map((x, i) => <tr key={i}><td className={TD + " text-center"}>{i + 1}</td><td className={TD}>{x.doctorName}</td><td className={TD}>{x.specialty}</td><td className={TD}>{x.category}</td><td className={TD}>{x.cls}</td><td className={TD}>{x.date}</td></tr>)}</tbody>
      </table>
    </ReportModal>
  );
}
