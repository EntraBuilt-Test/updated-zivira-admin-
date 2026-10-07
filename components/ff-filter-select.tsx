"use client";

import { useEffect, useMemo, useState } from "react";
import { fieldForceLabel, type FieldForceOption } from "@/components/field-force-select";
import { apiClient } from "@/lib/api-client";
import { LABEL, SELECT, MONTH_NAMES, THIS_YEAR } from "@/components/mis-analysis-panels";

// Round 51 -- legacy-style Field Force picker (small filter text box + dropdown), shared by the Visit Details family,
// plus the From/To Month+Year selects and the legacy row colours.
const DESIG_BG: Record<string, string> = { BH: "#6699ff", ZBM: "#ffff66", ABM: "#ffff66", RBM: "#ffcc99", NBM: "#ff9900", NBH: "#ff9900" };

// Same list as useFieldForceOptions, but exposes the loading state (legacy shows a red "Loading Please Wait..." with a spinner).
function useFieldForceList() {
  const [rows, setRows] = useState<FieldForceOption[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    apiClient.employees().then((r) => { if (alive) setRows(r.data as unknown as FieldForceOption[]); }).catch(() => { if (alive) setRows([]); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return { rows, loading };
}

export function FFPicker({ value, onChange, label = "Field Force Name", clearLabel = "---Select Clear---", colorize, noFilter }: { value: string; onChange: (code: string) => void; label?: string; clearLabel?: string; colorize?: boolean; noFilter?: boolean }) {
  const [filter, setFilter] = useState("");
  const { rows: all, loading } = useFieldForceList();
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return [...all].filter((e) => e.employeeCode === value || !f || fieldForceLabel(e).toLowerCase().includes(f)).sort((a, b) => a.name.localeCompare(b.name));
  }, [all, filter, value]);
  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <div className="flex gap-2">
        {!noFilter && <input className={SELECT} style={{ width: 90 }} placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter field force" />}
        <select className={SELECT} style={{ minWidth: 260 }} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{clearLabel}</option>
          {shown.map((e) => <option key={e.employeeCode} value={e.employeeCode} style={colorize ? { background: DESIG_BG[e.designation.toUpperCase()] } : undefined}>{fieldForceLabel(e)}</option>)}
        </select>
        {loading && <span role="status" className="flex items-center gap-1 text-sm font-bold" style={{ color: "red" }}><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />Loading Please Wait...</span>}
      </div>
    </div>
  );
}

export type MY = { m: number; y: number };
const YEARS = [THIS_YEAR - 3, THIS_YEAR - 2, THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];
export function MonthYear({ label, v, onChange, monthOnly, yearOnly }: { label: string; v: MY; onChange: (v: MY) => void; monthOnly?: boolean; yearOnly?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      {!yearOnly && (
        <div className="flex flex-col gap-1">
          <span className={LABEL}>{label} Month</span>
          <select className={SELECT} value={v.m} onChange={(e) => onChange({ ...v, m: parseInt(e.target.value, 10) })}>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m.slice(0, 3)}</option>)}</select>
        </div>
      )}
      {!monthOnly && (
        <div className="flex flex-col gap-1">
          <span className={LABEL}>{label} Year</span>
          <select className={SELECT} value={v.y} onChange={(e) => onChange({ ...v, y: parseInt(e.target.value, 10) })}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
      )}
    </div>
  );
}
export const NOW: MY = { m: new Date().getMonth() + 1, y: THIS_YEAR };
export const mkRange = (from: MY, to: MY) => ({ fromMonth: String(from.m), fromYear: String(from.y), toMonth: String(to.m), toYear: String(to.y) });
export const monthLong = (m: string, sep: string) => { const [y, mm] = m.split("-").map(Number); return `${MONTH_NAMES[mm - 1]}${sep}${y}`; };
export const monthShort = (m: string, sep: string) => { const [y, mm] = m.split("-").map(Number); return `${MONTH_NAMES[mm - 1].slice(0, 3)}${sep}${y}`; };
export const ROW_BG: Record<string, string> = { MR: "#ffccff", SR_MR: "#ffccff", ABM: "#ffff66", RBM: "#ffcc99", ZBM: "#ffff66" };
export const rowBg = (role: string) => ROW_BG[role] ?? "#ffcc99";
// Sample Details also colours SM green and MH orange (by designation).
export const rowBgByDesignation = (designation: string, role: string) => { const d = designation.trim().toUpperCase(); return d === "SM" ? "#66cc66" : d === "MH" ? "#ff9966" : rowBg(role); };
