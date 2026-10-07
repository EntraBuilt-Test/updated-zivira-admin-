"use client";

import { useMemo, useState } from "react";
import { FieldForceSelect, fieldForceLabel, useFieldForceOptions } from "@/components/field-force-select";
import { GO, LABEL, SELECT, MONTH_NAMES, THIS_YEAR, ReportModal, ScreenTitle } from "@/components/mis-analysis-panels";
import { apiClient, type ModewiseResult, type ModewiseType } from "@/lib/api-client";

// Round 50 -- MIS Reports > Visit Details > Based on Mode Wise (legacy Visit_Details_Basedon_ModeWise.aspx).
// Campaign: one column per month (campaign-doctor calls). Category / Speciality / Class: per month, per group
// Ttl Drs | Drs Met | Coverage. Speciality and Class layouts are inferred from the Category screen.
const NOW_M = new Date().getMonth() + 1;
const YEARS = [THIS_YEAR - 3, THIS_YEAR - 2, THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];
const GREEN = "#006633";
const TH = "border border-black px-1 py-0.5 text-xs font-bold text-white text-center whitespace-nowrap";
const TD = "border border-black px-1 py-0.5 text-xs";
const TYPES: { key: ModewiseType; label: string }[] = [{ key: "category", label: "Category" }, { key: "speciality", label: "Speciality" }, { key: "class", label: "Class" }, { key: "campaign", label: "Campaign" }];
const ROW_BG: Record<string, string> = { MR: "#ffccff", SR_MR: "#ffccff", ABM: "#ffff66", RBM: "#ffcc99", ZBM: "#ffff66" };
const rowBg = (role: string) => ROW_BG[role] ?? "#ffcc99";
const mLong = (m: string, sep: string) => { const [y, mm] = m.split("-").map(Number); return `${MONTH_NAMES[mm - 1]}${sep}${y}`; };
type MY = { m: number; y: number };

function MY({ label, v, onChange }: { label: string; v: MY; onChange: (v: MY) => void }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <span className={LABEL}>{label} Month</span>
        <select className={SELECT} value={v.m} onChange={(e) => onChange({ ...v, m: parseInt(e.target.value, 10) })}>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
      </div>
      <div className="flex flex-col gap-1">
        <span className={LABEL}>{label} Year</span>
        <select className={SELECT} value={v.y} onChange={(e) => onChange({ ...v, y: parseInt(e.target.value, 10) })}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
      </div>
    </div>
  );
}

export function ModeWiseVisitReport() {
  const [filter, setFilter] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<ModewiseType | "">("");
  const [from, setFrom] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [to, setTo] = useState<MY>({ m: NOW_M, y: THIS_YEAR });
  const [result, setResult] = useState<ModewiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const all = useFieldForceOptions();
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return all.filter((e) => e.employeeCode === code || !f || fieldForceLabel(e).toLowerCase().includes(f));
  }, [all, filter, code]);
  const campaign = type === "campaign";
  async function go() {
    if (!type || !code) return;
    setLoading(true); setError("");
    try {
      setResult((await apiClient.modewise({ sfCode: code, type, fromMonth: String(from.m), fromYear: String(from.y), ...(campaign ? {} : { toMonth: String(to.m), toYear: String(to.y) }) })).data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-5xl">
        <ScreenTitle>Visit Details (Based On Mode Wise)</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Field Force Name</span>
            <div className="flex gap-2">
              <input className={SELECT} style={{ width: 90 }} placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter field force" />
              <FieldForceSelect value={code} onChange={setCode} employees={shown} hideLabel clearLabel="---Select Clear---" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Type</span>
            <select className={SELECT} value={type} onChange={(e) => { setType(e.target.value as ModewiseType | ""); setResult(null); }}>
              <option value="">---Select---</option>
              {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <MY label="From" v={from} onChange={setFrom} />
          {type && !campaign && <MY label="To" v={to} onChange={setTo} />}
          <button type="button" className={GO} disabled={!code || !type || loading} onClick={() => void go()}>{loading ? "Loading..." : campaign ? "Go" : "View"}</button>
        </div>
        {error && <p className="text-sm text-status-danger">{error}</p>}
      </div>
      {result && <ModeWiseView result={result} onClose={() => setResult(null)} />}
    </div>
  );
}

function ModeWiseView({ result, onClose }: { result: ModewiseResult; onClose: () => void }) {
  const { months } = result;
  const label = TYPES.find((t) => t.key === result.type)!.label;
  const heading = `Mode Wise Visit Details Of ${label} Wise Between - ${mLong(months[0], " ")} To ${mLong(months[months.length - 1], " ")}`;
  const e = result.employee;
  const bg = { background: GREEN };
  const fixed = ["S.No", "FieldForce Name", "Designation", "HQ"];
  const lead = (r: ModewiseResult["rows"][number]) => (
    <>
      <td className={TD + " text-center"}>{r.sno}</td><td className={TD}>{r.name}</td><td className={TD + " text-center"}>{r.designation}</td><td className={TD}>{r.hq}</td>
    </>
  );
  return (
    <ReportModal title={result.type === "campaign" ? "Visit Details Field Report" : heading} fileName={`ModeWise_${label}_Visit_Details`} onClose={onClose}>
      <h3 className="text-base font-bold underline">{heading}</h3>
      <p className="text-sm font-bold">Field Force Name : {e.name} - {e.designation} - {e.hq}</p>
      {result.notes.map((n, i) => <p key={i} className="text-xs italic text-text-muted">{n}</p>)}
      <div style={{ overflowX: "auto" }}>
        {result.type === "campaign" ? (
          <table className="border-collapse">
            <thead><tr>{[...fixed, ...months.map((m) => mLong(m, "-"))].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}<th className={TH} style={{ ...bg, width: 12 }} /></tr></thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.employeeCode} style={{ background: rowBg(r.role) }}>
                  {lead(r)}
                  {months.map((m) => <td key={m} className={TD + " text-center"}>{r.cells?.[m] ? r.cells[m] : ""}</td>)}
                  <td className={TD} />
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="border-collapse">
            <thead>
              <tr>
                {fixed.map((h) => <th key={h} rowSpan={3} className={TH} style={bg}>{h}</th>)}
                {months.map((m) => <th key={m} colSpan={(result.groups?.length ?? 0) * 3} className={TH} style={bg}>{mLong(m, "-")}</th>)}
              </tr>
              <tr>{months.map((m) => result.groups?.map((g) => <th key={m + g} colSpan={3} className={TH} style={bg}>{g}</th>))}</tr>
              <tr>{months.map((m) => result.groups?.map((g) => ["Ttl Drs", "Drs Met", "Coverage"].map((s) => <th key={m + g + s} className={TH} style={bg}>{s}</th>)))}</tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.employeeCode} style={{ background: rowBg(r.role) }}>
                  {lead(r)}
                  {months.map((m) => result.groups?.map((g) => {
                    const c = r.perMonth![m][g];
                    return [
                      <td key={m + g + "t"} className={TD + " text-center"}>{c.ttl}</td>,
                      <td key={m + g + "m"} className={TD + " text-center"}>{c.met}</td>,
                      c.coverage === null
                        ? <td key={m + g + "c"} className={TD + " text-center"}>-</td>
                        : c.coverage === 0
                          ? <td key={m + g + "c"} className={TD + " text-center"} style={{ color: "red", fontWeight: 700 }}>0</td>
                          : <td key={m + g + "c"} className={TD + " text-center"} style={{ color: "#ff00cc" }}>{c.coverage.toFixed(2)}</td>
                    ];
                  }))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ReportModal>
  );
}
