"use client";

import { useState, type ReactNode } from "react";

// Shared building blocks for the Base Level Setup and Manager Setup panels
// (sanpharma.info's Basic Setup >> Base Level Setup / Manager Setup screens,
// AdminSetup.aspx / AdminSetupMGR.aspx). Both screens share the same section
// layout — Plan Setup, DCR Setup, DCR Approval System, DCR Delayed System,
// DCR Auto Post, DCR Based on TP, Doctor Setup, Chemists Setup, Stockists
// Setup, Tour Plan Setup, and Additional Setup (Entry Mode / Display Mode
// matrices) — differing only in a few fields/options and which designations
// populate the Tour Plan Setup table (field-force designations for Base
// Level Setup vs. manager designations for Manager Setup). Rebuilt to use
// real 1px-bordered boxes/tables (sanpharma's own visual style) instead of
// the app's generic drop-shadow "card" styling.

const BORDER = "#94a3b8";
const HEADER_BG = "#1e3a5f";

export function SectionBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, marginBottom: 14 }}>
      <div style={{ background: HEADER_BG, color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 10px" }}>
        {title}
      </div>
      <div style={{ padding: "8px 10px" }}>{children}</div>
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        borderBottom: `1px solid #e2e8f0`,
        padding: "6px 2px"
      }}
    >
      <label style={{ width: 340, flexShrink: 0, fontSize: 13 }}>{label}</label>
      <div style={{ flex: 1, minWidth: 160 }}>{children}</div>
    </div>
  );
}

export function YesNoRadio({
  value,
  onChange,
  name,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  name: string;
  options?: readonly string[];
}) {
  const opts = options ?? ["Yes", "No"];
  return (
    <div className="flex flex-wrap gap-4">
      {opts.map((opt) => (
        <label key={opt} className="flex items-center gap-1 text-sm">
          <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  type
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      style={{ border: `1px solid ${BORDER}`, borderRadius: 3, padding: "4px 6px", maxWidth: 220, width: "100%" }}
      type={type ?? "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select
      style={{ border: `1px solid ${BORDER}`, borderRadius: 3, padding: "4px 6px", maxWidth: 240, width: "100%" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder ?? "Select"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// A checkbox-list dropdown for picking one or more designations at once —
// matches sanpharma's "Designation" column in the Additional Setup >> DCR
// SETUP Entry Mode / Display Mode tables (click to open a checklist of
// ABM / ALL / BE / BH / BRM / MH / NBM / RBM / ... and check any number).
export function DesignationMultiSelect({
  value,
  onChange,
  options
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: readonly string[];
}) {
  const [open, setOpen] = useState(false);

  function toggleOption(opt: string) {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  }

  return (
    <div style={{ position: "relative", display: "inline-block", minWidth: 160 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          border: `1px solid ${BORDER}`,
          borderRadius: 3,
          padding: "4px 8px",
          background: "#fff",
          fontSize: 12,
          width: "100%",
          textAlign: "left"
        }}
      >
        {value.length ? value.join(", ") : "---Select---"}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 20,
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 3,
              padding: 8,
              maxHeight: 220,
              overflowY: "auto",
              minWidth: 160,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
          >
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-xs" style={{ padding: "2px 0" }}>
                <input type="checkbox" checked={value.includes(opt)} onChange={() => toggleOption(opt)} />
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// The Additional Setup "DCR SETUP - Entry Mode" / "Display Mode" tables:
// rows are the DCR fields (Input / Pob / Product / Remarks / Session /
// Time), the first five columns are per-entity-type Yes/No checkboxes
// (checked means that field is captured for that entity type), and a final
// "Designation" column holds a multi-select checklist of which designations
// this row's settings apply to.
export const DCR_MATRIX_ROWS = ["Input", "Pob", "Product", "Remarks", "Session", "Time"] as const;
export type DcrMatrixRow = (typeof DCR_MATRIX_ROWS)[number];

export const DCR_MATRIX_COLUMNS = ["Listed Doctor", "Chemist", "Stockist", "Unlisted Doctor", "Hospital"] as const;
export type DcrMatrixColumn = (typeof DCR_MATRIX_COLUMNS)[number];

export type DcrMatrix = Record<DcrMatrixRow, Record<DcrMatrixColumn, boolean>>;
export type DcrMatrixDesignations = Record<DcrMatrixRow, string[]>;

export function emptyDcrMatrix(): DcrMatrix {
  const m = {} as DcrMatrix;
  for (const row of DCR_MATRIX_ROWS) {
    m[row] = {} as Record<DcrMatrixColumn, boolean>;
    for (const col of DCR_MATRIX_COLUMNS) m[row][col] = false;
  }
  return m;
}

export function emptyDcrMatrixDesignations(): DcrMatrixDesignations {
  const d = {} as DcrMatrixDesignations;
  for (const row of DCR_MATRIX_ROWS) d[row] = [];
  return d;
}

export function DcrMatrixTable({
  title,
  matrix,
  onToggle,
  rowDesignations,
  onDesignationChange,
  designationOptions
}: {
  title: string;
  matrix: DcrMatrix;
  onToggle: (row: DcrMatrixRow, col: DcrMatrixColumn) => void;
  rowDesignations: DcrMatrixDesignations;
  onDesignationChange: (row: DcrMatrixRow, designations: string[]) => void;
  designationOptions: readonly string[];
}) {
  const cell: React.CSSProperties = { border: `1px solid ${BORDER}`, padding: "4px 6px" };
  const head: React.CSSProperties = { ...cell, background: "#e2e8f0", fontWeight: 600, textAlign: "center" };
  return (
    <div className="overflow-x-auto">
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{title}</div>
      <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
        <thead>
          <tr>
            <th style={head}>Field</th>
            {DCR_MATRIX_COLUMNS.map((col) => (
              <th key={col} style={head}>
                {col}
              </th>
            ))}
            <th style={head}>Designation</th>
          </tr>
        </thead>
        <tbody>
          {DCR_MATRIX_ROWS.map((row) => (
            <tr key={row}>
              <td style={cell}>{row}</td>
              {DCR_MATRIX_COLUMNS.map((col) => (
                <td key={col} style={{ ...cell, textAlign: "center" }}>
                  <input type="checkbox" checked={matrix[row][col]} onChange={() => onToggle(row, col)} />
                </td>
              ))}
              <td style={cell}>
                <DesignationMultiSelect
                  value={rowDesignations[row] ?? []}
                  onChange={(v) => onDesignationChange(row, v)}
                  options={designationOptions}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Tour Plan Setup: one row per designation with a TP Start Date and TP End
// Date (day-of-month values), plus a separate Approval Needed Yes/No
// checkbox per designation shown alongside a global Tour Plan Based System
// radio choice.
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
  const cell: React.CSSProperties = { border: `1px solid ${BORDER}`, padding: "4px 6px" };
  const head: React.CSSProperties = { ...cell, background: "#e2e8f0", fontWeight: 600, textAlign: "center" };
  return (
    <div className="overflow-x-auto">
      <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
        <thead>
          <tr>
            <th style={head}>S.No</th>
            <th style={head}>Designation</th>
            <th style={head}>Tp Start Date</th>
            <th style={head}>Tp End Date</th>
            <th style={head}>Approval Needed</th>
          </tr>
        </thead>
        <tbody>
          {designations.map((d, i) => {
            const row = table[d] ?? { startDate: "", endDate: "", approvalNeeded: false };
            return (
              <tr key={d}>
                <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                <td style={cell}>{d}</td>
                <td style={cell}>
                  <select
                    style={{ border: `1px solid ${BORDER}`, borderRadius: 3, padding: "2px 4px", width: "100%" }}
                    value={row.startDate}
                    onChange={(e) => onChange(d, { startDate: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="0">0</option>
                    {Array.from({ length: 20 }, (_, n) => 12 + n).map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={cell}>
                  <select
                    style={{ border: `1px solid ${BORDER}`, borderRadius: 3, padding: "2px 4px", width: "100%" }}
                    value={row.endDate}
                    onChange={(e) => onChange(d, { endDate: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="0">0</option>
                    {Array.from({ length: 20 }, (_, n) => 12 + n).map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ ...cell, textAlign: "center" }}>
                  <div className="flex justify-center gap-3">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name={`approval-${d}`}
                        checked={!row.approvalNeeded}
                        onChange={() => onChange(d, { approvalNeeded: false })}
                      />
                      No
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name={`approval-${d}`}
                        checked={row.approvalNeeded}
                        onChange={() => onChange(d, { approvalNeeded: true })}
                      />
                      Yes
                    </label>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
