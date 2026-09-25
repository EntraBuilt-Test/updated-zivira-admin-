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

// The outer two-column bordered box sanpharma's Base Level / Manager Setup
// screens are built from: one continuous box with a vertical divider, the
// left column holding Plan/DCR/Approval/Delayed/Auto-Post/Based-on-TP
// setup and the right column holding DCR-Entry/Doctor/Chemists/Stockists
// setup. `left`/`right` are arrays of subsections rendered top to bottom.
export function TwoColumnBox({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        marginBottom: 14,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#eef4fb"
      }}
    >
      <div style={{ padding: "10px 14px", borderRight: `1px solid ${BORDER}` }}>{left}</div>
      <div style={{ padding: "10px 14px" }}>{right}</div>
    </div>
  );
}

// A subsection label inside a TwoColumnBox column -- matches sanpharma's
// "PLAN SETUP" / "DCR SETUP" style: bold text on a light highlight, with
// some space above to separate it from the previous subsection.
export function SubSectionLabel({ children, first }: { children: ReactNode; first?: boolean }) {
  return (
    <div
      style={{
        background: "#bfdbfe",
        color: "#1e3a5f",
        fontWeight: 700,
        fontSize: 12,
        padding: "4px 8px",
        marginTop: first ? 0 : 16,
        marginBottom: 8
      }}
    >
      {children}
    </div>
  );
}

// A compact label/field row for use inside a TwoColumnBox column (no
// bottom border, tighter than FieldRow, and a shorter label width so two
// columns of content stay legible side by side).
export function CompactFieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "5px 0" }}>
      <label style={{ width: 260, flexShrink: 0, fontSize: 12.5 }}>{label}</label>
      <div style={{ flex: 1, minWidth: 120 }}>{children}</div>
    </div>
  );
}

// "Needed" / "Not Needed" radio choice -- sanpharma's DCR Approval System /
// DCR Delayed System sections use this wording instead of Yes/No.
export function NeededRadio({ value, onChange, name }: { value: string; onChange: (v: string) => void; name: string }) {
  return <YesNoRadio value={value} onChange={onChange} name={name} options={["Needed", "Not Needed"]} />;
}

// Two independent-looking checkboxes (No / Yes) that behave like a single
// boolean choice -- matches sanpharma's per-designation "Approval Needed"
// controls in the Tour Plan box, which render as checkboxes rather than
// radio buttons but still only ever have one of the two checked.
export function YesNoCheckboxPair({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={!value} onChange={() => onChange(false)} />
        No
      </label>
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={value} onChange={() => onChange(true)} />
        Yes
      </label>
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
  const dateOptions = Array.from({ length: 20 }, (_, n) => 12 + n);
  return (
    <div className="overflow-x-auto">
      <div style={{ fontWeight: 700, fontSize: 12.5, color: "#b91c1c", marginBottom: 8, textDecoration: "underline" }}>
        TP has to be submitted in between days
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
        <thead>
          <tr>
            <th style={head}>S.No</th>
            <th style={head}>Designation</th>
            <th style={head}>Tp Start Date</th>
            <th style={head}>Tp End Date</th>
          </tr>
        </thead>
        <tbody>
          {designations.map((d, i) => {
            const row = table[d] ?? { startDate: "", endDate: "", approvalNeeded: false };
            return (
              <tr key={d}>
                <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                <td style={{ ...cell, fontWeight: 600, color: "#b91c1c" }}>{d}</td>
                <td style={cell}>
                  <select
                    style={{ border: `1px solid ${BORDER}`, borderRadius: 3, padding: "2px 4px", width: "100%" }}
                    value={row.startDate}
                    onChange={(e) => onChange(d, { startDate: e.target.value })}
                  >
                    <option value="">---Select---</option>
                    <option value="0">0</option>
                    {dateOptions.map((n) => (
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
                    <option value="">---Select---</option>
                    <option value="0">0</option>
                    {dateOptions.map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// The "Tour Plan" box that sits beside the TP-submission-days table:
// the Tour Plan Based System / Without Tour Plan Based System radio choice,
// followed by one "Approval Needed for <Designation>" row per designation
// (rendered as the same No/Yes checkbox pair sanpharma uses).
export function TourPlanApprovalList({
  designations,
  table,
  onChange
}: {
  designations: readonly string[];
  table: TourPlanTable;
  onChange: (designation: string, patch: Partial<TourPlanRow>) => void;
}) {
  return (
    <div className="space-y-2">
      {designations.map((d) => {
        const row = table[d] ?? { startDate: "", endDate: "", approvalNeeded: false };
        return (
          <div key={d} className="flex items-center gap-3 text-sm">
            <span>
              Approval Needed for <strong style={{ color: "#b91c1c" }}>{d}</strong>
            </span>
            <YesNoCheckboxPair value={row.approvalNeeded} onChange={(v) => onChange(d, { approvalNeeded: v })} />
          </div>
        );
      })}
    </div>
  );
}
