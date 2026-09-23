"use client";

import type { ReactNode } from "react";

// Shared building blocks for the Base Level Setup and Manager Setup panels
// (sanpharma.info's Basic Setup >> Base Level Setup / Manager Setup screens).
// Both screens share the same section layout — Plan Setup, DCR Setup, DCR
// Approval System, DCR Delayed System, DCR - Entry Setup, Doctor Setup,
// Chemists Setup, Stockists Setup, DCR Auto Post, DCR Based on TP, Tour
// Plan Setup, and Additional Setup (Entry Mode / Display Mode matrices) —
// differing only in which designations populate the Tour Plan Setup table
// (field-force designations for Base Level Setup vs. manager designations
// for Manager Setup). Keeping the shared pieces here avoids the two panels
// drifting out of sync.

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="text-base font-semibold mb-3 border-b pb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm w-64 shrink-0">{label}</label>
      {children}
    </div>
  );
}

export function YesNoRadio({
  value,
  onChange,
  name
}: {
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div className="flex gap-4">
      {["Yes", "No"].map((opt) => (
        <label key={opt} className="flex items-center gap-1 text-sm">
          <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function TextField({ value, onChange, placeholder, type }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      className="input"
      style={{ maxWidth: 220 }}
      type={type ?? "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function SelectField({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select className="input" style={{ maxWidth: 220 }} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder ?? "Select"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// The Additional Setup "DCR SETUP - Entry Mode" / "Display Mode" matrices:
// rows are the DCR fields (Input / Pob / Product / Remarks / Session /
// Time), columns are the five entity types. Each cell is a Yes/No
// checkbox — checked means that field is captured (Entry Mode) or shown
// (Display Mode) for that entity type.
export const DCR_MATRIX_ROWS = ["Input", "Pob", "Product", "Remarks", "Session", "Time"] as const;
export type DcrMatrixRow = (typeof DCR_MATRIX_ROWS)[number];

export const DCR_MATRIX_COLUMNS = ["Listed Doctor", "Chemist", "Stockist", "Unlisted Doctor", "Hospital"] as const;
export type DcrMatrixColumn = (typeof DCR_MATRIX_COLUMNS)[number];

export type DcrMatrix = Record<DcrMatrixRow, Record<DcrMatrixColumn, boolean>>;

export function emptyDcrMatrix(): DcrMatrix {
  const m = {} as DcrMatrix;
  for (const row of DCR_MATRIX_ROWS) {
    m[row] = {} as Record<DcrMatrixColumn, boolean>;
    for (const col of DCR_MATRIX_COLUMNS) m[row][col] = false;
  }
  return m;
}

export function DcrMatrixTable({
  title,
  matrix,
  onToggle
}: {
  title: string;
  matrix: DcrMatrix;
  onToggle: (row: DcrMatrixRow, col: DcrMatrixColumn) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="text-sm font-medium mb-2">{title}</div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-2">Field</th>
            {DCR_MATRIX_COLUMNS.map((col) => (
              <th key={col} className="text-center p-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DCR_MATRIX_ROWS.map((row) => (
            <tr key={row} className="border-b">
              <td className="p-2">{row}</td>
              {DCR_MATRIX_COLUMNS.map((col) => (
                <td key={col} className="text-center p-2">
                  <input type="checkbox" checked={matrix[row][col]} onChange={() => onToggle(row, col)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Tour Plan Setup: one row per designation with a TP Start Date and TP End
// Date (day-of-month values, matching sanpharma's own "the Nth of every
// month" style setup), plus a separate Approval Needed checkbox per
// designation shown alongside a global Tour Plan Based System radio choice.
export type TourPlanRow = { startDate: string; endDate: string; approvalNeeded: boolean };
export type TourPlanTable = Record<string, TourPlanRow>;

export function emptyTourPlanTable(designations: readonly string[]): TourPlanTable {
  const t: TourPlanTable = {};
  for (const d of designations) t[d] = { startDate: "", endDate: "", approvalNeeded: false };
  return t;
}

export function TourPlanSetupTable({
  designations,
  table,
  onChange
}: {
  designations: readonly string[];
  table: TourPlanTable;
  onChange: (designation: string, patch: Partial<TourPlanRow>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-2">Designation</th>
            <th className="text-left p-2">TP Start Date</th>
            <th className="text-left p-2">TP End Date</th>
            <th className="text-center p-2">Approval Needed</th>
          </tr>
        </thead>
        <tbody>
          {designations.map((d) => {
            const row = table[d] ?? { startDate: "", endDate: "", approvalNeeded: false };
            return (
              <tr key={d} className="border-b">
                <td className="p-2">{d}</td>
                <td className="p-2">
                  <input
                    className="input"
                    style={{ maxWidth: 120 }}
                    type="number"
                    min={1}
                    max={31}
                    value={row.startDate}
                    onChange={(e) => onChange(d, { startDate: e.target.value })}
                    placeholder="Day of month"
                  />
                </td>
                <td className="p-2">
                  <input
                    className="input"
                    style={{ maxWidth: 120 }}
                    type="number"
                    min={1}
                    max={31}
                    value={row.endDate}
                    onChange={(e) => onChange(d, { endDate: e.target.value })}
                    placeholder="Day of month"
                  />
                </td>
                <td className="text-center p-2">
                  <input
                    type="checkbox"
                    checked={row.approvalNeeded}
                    onChange={(e) => onChange(d, { approvalNeeded: e.target.checked })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
