"use client";

import { useMemo, useState } from "react";
import { fieldForceLabel, useFieldForceOptions } from "@/components/field-force-select";
import { LABEL, SELECT, MONTH_NAMES, THIS_YEAR } from "@/components/mis-analysis-panels";

// Round 51 -- legacy-style Field Force picker (small filter text box + dropdown), shared by the Visit Details family,
// plus the From/To Month+Year selects and the legacy row colours.
const DESIG_BG: Record<string, string> = { BH: "#6699ff", ZBM: "#ffff66", ABM: "#ffff66", RBM: "#ffcc99", NBM: "#ff9900", NBH: "#ff9900" };

export function FFPicker({ value, onChange, label = "Field Force Name", clearLabel = "---Select Clear---", colorize }: { value: string; onChange: (code: string) => void; label?: string; clearLabel?: string; colorize?: boolean }) {
  const [filter, setFilter] = useState("");
  const all = useFieldForceOptions();
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return [...all].filter((e) => e.employeeCode === value || !f || fieldForceLabel(e).toLowerCase().includes(f)).sort((a, b) => a.name.localeCompare(b.name));
  }, [all, filter, value]);
  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <div className="flex gap-2">
        <input className={SELECT} style={{ width: 90 }} placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter field force" />
        <select className={SELECT} style={{ minWidth: 260 }} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{clearLabel}</option>
          {shown.map((e) => <option key={e.employeeCode} value={e.employeeCode} style={colorize ? { background: DESIG_BG[e.designation.toUpperCase()] } : undefined}>{fieldForceLabel(e)}</option>)}
        </select>
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
