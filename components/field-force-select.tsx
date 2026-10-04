"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";

// Round 39 item 9 -- the single shared field-force dropdown for every admin
// report screen. A real native <select> (instant open, no layout shift, no
// type-ahead text box) listing the real employee list as
// "NAME - DESIGNATION - HQ", with the legacy "---Select Clear---" default.
// Backed by apiClient.employees() (30s shared cache, so many pickers on one
// screen cost one request), or by an explicit `employees` list when the
// caller already holds a hierarchy-scoped one (e.g. managers only).

export type FieldForceOption = { employeeCode: string; name: string; designation: string; territory: string };

export function useFieldForceOptions(): FieldForceOption[] {
  const [rows, setRows] = useState<FieldForceOption[]>([]);
  useEffect(() => {
    let alive = true;
    apiClient
      .employees()
      .then((r) => { if (alive) setRows(r.data as unknown as FieldForceOption[]); })
      .catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, []);
  return rows;
}

export function fieldForceLabel(e: FieldForceOption) {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

type Props = {
  value: string;
  onChange: (employeeCode: string) => void;
  /** Legacy label spelling differs per screen ("Filed Force Name", "FieldForce Name", ...). */
  label?: string;
  /** Pre-scoped list (e.g. managers only / a manager's team). Omit to load all employees. */
  employees?: FieldForceOption[];
  /** Extra leading options (e.g. { value: "ALL", label: "All Field Reps" }). */
  extraOptions?: { value: string; label: string }[];
  clearLabel?: string;
  minWidth?: number;
  hideLabel?: boolean;
  disabled?: boolean;
};

function FieldForceSelectImpl({ value, onChange, label = "Filed Force Name", employees, extraOptions, clearLabel = "---Select Clear---", minWidth = 260, hideLabel, disabled }: Props) {
  const fetched = useFieldForceOptions();
  const rows = employees ?? fetched;
  const options = useMemo(
    () =>
      [...rows]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((e) => (
          <option key={e.employeeCode} value={e.employeeCode}>{fieldForceLabel(e)}</option>
        )),
    [rows]
  );
  return (
    <div className="flex flex-col gap-1">
      {!hideLabel && <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{label}</span>}
      <select
        className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
        style={{ minWidth }}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{clearLabel}</option>
        {extraOptions?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        {options}
      </select>
    </div>
  );
}

export const FieldForceSelect = memo(FieldForceSelectImpl);
