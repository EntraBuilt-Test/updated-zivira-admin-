"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 39 item 9 -- shared field-force dropdown for admin report screens.
// Upgraded to use CustomSelect for a modern, unified look with checkmarks,
// rounded styling, and smooth scrolling while preserving the same API.

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

  const allOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (clearLabel) {
      list.push({ value: "", label: clearLabel });
    }
    if (extraOptions) {
      for (const opt of extraOptions) {
        list.push(opt);
      }
    }
    const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    for (const e of sorted) {
      list.push({ value: e.employeeCode, label: fieldForceLabel(e) });
    }
    return list;
  }, [rows, clearLabel, extraOptions]);

  const selectedEntry = useMemo(
    () => allOptions.find((o) => o.value === value),
    [allOptions, value]
  );

  const displayValue = selectedEntry?.label ?? (value ? value : (clearLabel || "Select"));
  const optionLabels = useMemo(() => allOptions.map((o) => o.label), [allOptions]);

  function handleSelect(chosenLabel: string) {
    const found = allOptions.find((o) => o.label === chosenLabel);
    if (found) {
      onChange(found.value);
    }
  }

  return (
    <div className="flex flex-col gap-1" style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      {!hideLabel && <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{label}</span>}
      <div style={{ minWidth: minWidth || undefined }}>
        <CustomSelect
          value={displayValue}
          options={optionLabels}
          onChange={handleSelect}
          placeholder={clearLabel}
        />
      </div>
    </div>
  );
}

export const FieldForceSelect = memo(FieldForceSelectImpl);
