"use client";

import { useState, type ReactNode } from "react";
import { FieldForceSelect } from "@/components/field-force-select";
import { GO, LABEL, SELECT, ReportModal, ScreenTitle, th, td, tealHead } from "@/components/mis-analysis-panels";
import { apiClient, type HeatKind, type HeatResult } from "@/lib/api-client";

// Round 42 -- MIS Reports > Heat Analysis: Not At All Visit Drs, Not At All
// Promoted Products, Not At All Visit HQs. "More than N Month(s)" = nothing
// recorded in the last N calendar months up to the current month.

const TH = th + " " + tealHead;
const CARD = "bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-3xl";

const LEGEND: { label: string; color: string; max: number }[] = [
  { label: "0", color: "#00b050", max: 0 },
  { label: "0 - 50", color: "#92d050", max: 50 },
  { label: "50 - 150", color: "#c5d94a", max: 150 },
  { label: "150 - 200", color: "#ffc000", max: 200 },
  { label: "200 - 500", color: "#ff9900", max: 500 },
  { label: "500 - 1000", color: "#ff6600", max: 1000 },
  { label: "1000 - 2000", color: "#ff3300", max: 2000 },
  { label: "> 2000", color: "#d00000", max: Infinity }
];
const bandColor = (n: number) => (LEGEND.find((l) => n <= l.max) ?? LEGEND[LEGEND.length - 1]).color;

const CONFIG: Record<HeatKind, { title: string; resultTitle: string; footnote?: string }> = {
  drs: { title: "Not At All Visit Drs", resultTitle: "Not at all Visited Drs" },
  products: { title: "Not At All Promoted Products", resultTitle: "Not at all Promoted Products" },
  hqs: {
    title: "Not At All Visit HQs",
    resultTitle: "Not at all Visited HQs",
    footnote: "Layout inferred: the legacy result screen was not available. Cnt = this force's territories (its own HQ, its listed doctors' territories and its chemists' patches) with no doctor call, chemist call or visit log in the period."
  }
};
const MODES = [6, 5, 4, 3, 2, 1];

function Err({ msg }: { msg: string }) { return msg ? <p className="text-sm text-status-danger">{msg}</p> : null; }
function Note({ children }: { children: ReactNode }) { return <p className="text-xs text-text-muted italic">{children}</p>; }

function HeatReport({ kind }: { kind: HeatKind }) {
  const cfg = CONFIG[kind];
  const [code, setCode] = useState("");
  const [months, setMonths] = useState("");
  const [result, setResult] = useState<HeatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    if (!code) { setError("Select a field force."); return; }
    if (!months) { setError("Select a mode."); return; }
    setLoading(true); setError("");
    try { setResult((await apiClient.heatReport(kind, { employeeCode: code, months: Number(months) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>{cfg.title}</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Filed Force Name" clearLabel="---Select Clear---" />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Mode</span>
            <select className={SELECT} value={months} onChange={(e) => setMonths(e.target.value)}>
              <option value="">--Select--</option>
              {MODES.map((n) => <option key={n} value={n}>More than {n} Month</option>)}
            </select>
          </div>
          <button type="button" className={GO} disabled={loading} onClick={view}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title={cfg.title} fileName={cfg.title.replace(/\s+/g, "_")} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold underline">{cfg.resultTitle} for MR &amp; Manager From More than {result.months} Month{result.months > 1 ? "s" : ""}</h3>
          <p className="text-sm font-bold">Field Force Name : {result.employee.name} - {result.employee.designation} - {result.employee.hq}</p>
          {kind === "drs" && (
            <div className="space-y-1">
              <p className="text-sm font-bold">Listeddr Range &amp; Colour</p>
              <table className="border-collapse text-xs"><tbody>
                <tr>{LEGEND.map((l) => <td key={l.label} className="border border-border-subtle w-14 h-5" style={{ background: l.color }} />)}</tr>
                <tr>{LEGEND.map((l) => <td key={l.label} className="border border-border-subtle px-2 text-center">{l.label}</td>)}</tr>
              </tbody></table>
            </div>
          )}
          <table className="w-full text-sm border-collapse">
            <thead><tr><th className={TH}>S.No</th><th className={TH}>FieldForce Name</th><th className={TH}>Designation Name</th><th className={TH}>HQ</th><th className={TH}>Emp Id.</th><th className={TH}>Cnt.</th></tr></thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.employeeCode} style={{ background: r.isSelected ? "#ffff66" : "#ffccff" }}>
                  <td className={td}>{r.sno}</td><td className={td + " !text-left"}>{r.name}</td><td className={td}>{r.designation}</td><td className={td}>{r.hq}</td><td className={td}>{r.employeeCode}</td>
                  <td className={td + " font-bold"} style={kind === "drs" ? { background: bandColor(r.cnt) } : undefined}>{r.cnt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {cfg.footnote && <Note>{cfg.footnote}</Note>}
        </ReportModal>
      )}
    </div>
  );
}

export function NotAtAllVisitDrsReport() { return <HeatReport kind="drs" />; }
export function NotAtAllPromotedProductsReport() { return <HeatReport kind="products" />; }
export function NotAtAllVisitHqsReport() { return <HeatReport kind="hqs" />; }
