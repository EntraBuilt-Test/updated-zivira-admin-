"use client";

import { useEffect, useMemo, useState } from "react";
import { fieldForceLabel, type FieldForceOption } from "@/components/field-force-select";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";
import { LABEL, SELECT, MONTH_NAMES, THIS_YEAR } from "@/components/mis-analysis-panels";

// Round 51 -- legacy-style Field Force picker (small filter text box + dropdown), shared by the Visit Details family,
// plus the From/To Month+Year selects and the legacy row colours.
const MANAGER_DESIG = new Set(["ABM", "RBM", "ZBM", "BH", "NBH", "NBM", "SM", "MH", "BRM", "SR ABM"]);
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

export function FFPicker({ value, onChange, label = "Field Force Name", clearLabel = "---Select Clear---", colorize, noFilter, adminOption, baseOnly, managersOnly, filterAfterLoad }: { value: string; onChange: (code: string) => void; label?: string; clearLabel?: string; colorize?: boolean; noFilter?: boolean; adminOption?: boolean; baseOnly?: boolean; managersOnly?: boolean; filterAfterLoad?: boolean }) {
  const [filter, setFilter] = useState("");
  const { rows: all, loading } = useFieldForceList();
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return [...all].filter((e) => (!baseOnly || !MANAGER_DESIG.has(e.designation.trim().toUpperCase())) && (!managersOnly || MANAGER_DESIG.has(e.designation.trim().toUpperCase())) && (e.employeeCode === value || !f || fieldForceLabel(e).toLowerCase().includes(f))).sort((a, b) => a.name.localeCompare(b.name));
  }, [all, filter, value, baseOnly, managersOnly]);

  const defaultClear = filterAfterLoad && loading ? "--- Select the Field force ---" : clearLabel;
  const options = useMemo(() => {
    const opts = [defaultClear];
    if (adminOption) opts.push("admin");
    for (const e of shown) {
      opts.push(fieldForceLabel(e));
    }
    return opts;
  }, [defaultClear, adminOption, shown]);

  const selectedDisplay = useMemo(() => {
    if (!value) return defaultClear;
    if (value === "admin") return "admin";
    const found = all.find((e) => e.employeeCode === value);
    return found ? fieldForceLabel(found) : defaultClear;
  }, [value, defaultClear, all]);

  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <div className="flex gap-2 items-center">
        {!noFilter && !(filterAfterLoad && loading) && <input className={SELECT} style={{ width: 90 }} placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter field force" />}
        <div style={{ minWidth: 260 }}>
          <CustomSelect
            value={selectedDisplay}
            options={options}
            onChange={(selected) => {
              if (selected === defaultClear) onChange("");
              else if (selected === "admin") onChange("admin");
              else {
                const found = all.find((e) => fieldForceLabel(e) === selected);
                onChange(found ? found.employeeCode : "");
              }
            }}
          />
        </div>
        {loading && <span role="status" className="flex items-center gap-1 text-sm font-bold" style={{ color: "red" }}><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />Loading Please Wait...</span>}
      </div>
    </div>
  );
}

export type MY = { m: number; y: number };
const YEARS = [THIS_YEAR - 3, THIS_YEAR - 2, THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];
export function MonthYear({ label, v, onChange, monthOnly, yearOnly }: { label: string; v: MY; onChange: (v: MY) => void; monthOnly?: boolean; yearOnly?: boolean }) {
  const monthLabels = useMemo(() => MONTH_NAMES.map((m) => m.slice(0, 3)), []);
  const currentMonth = MONTH_NAMES[v.m - 1]?.slice(0, 3) || "";
  const yearOptions = useMemo(() => YEARS.map(String), []);

  return (
    <div className="flex items-end gap-2">
      {!yearOnly && (
        <div className="flex flex-col gap-1">
          <span className={LABEL}>{label ? `${label} Month` : "Month"}</span>
          <div style={{ minWidth: 88 }}>
            <CustomSelect
              value={currentMonth}
              options={monthLabels}
              onChange={(selected) => {
                const idx = monthLabels.indexOf(selected);
                if (idx !== -1) onChange({ ...v, m: idx + 1 });
              }}
            />
          </div>
        </div>
      )}
      {!monthOnly && (
        <div className="flex flex-col gap-1">
          <span className={LABEL}>{label ? `${label} Year` : "Year"}</span>
          <div style={{ minWidth: 96 }}>
            <CustomSelect
              value={String(v.y)}
              options={yearOptions}
              onChange={(selected) => {
                const y = parseInt(selected, 10);
                if (!isNaN(y)) onChange({ ...v, y });
              }}
            />
          </div>
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
