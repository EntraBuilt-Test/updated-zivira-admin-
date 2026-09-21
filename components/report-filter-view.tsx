"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Ban, X, AlertTriangle } from "lucide-react";
import { apiClient, type MasterField, type MasterRecord, type MasterSchema } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";
import { CustomDatePicker } from "@/components/custom-date-picker";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 2027 - 2016 + 1 }, (_, i) => String(2016 + i));

/**
 * Renders sanpharma.info's report-screen shape exactly: Field Force Name /
 * Month / Year dropdown filters above a results table (per the live-crawl
 * notes — every Activity Report / MIS Report screen shares this same
 * FieldForce + Month/Year filter pattern), instead of burying the filter
 * fields inside an Add-record modal.
 */
export function ReportFilterView({ masterKey }: { masterKey: string }) {
  const [schema, setSchema] = useState<MasterSchema | null>(null);
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<Record<string, string[]>>({});
  const [sourceRecords, setSourceRecords] = useState<Record<string, MasterRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personFilter, setPersonFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [fromMonthFilter, setFromMonthFilter] = useState("");
  const [fromYearFilter, setFromYearFilter] = useState("");
  const [toMonthFilter, setToMonthFilter] = useState("");
  const [toYearFilter, setToYearFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [applied, setApplied] = useState(false);
  const [formRow, setFormRow] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MasterRecord | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [schemaRes, rowsRes] = await Promise.all([
        apiClient.masterSchema(masterKey),
        apiClient.masterRecords(masterKey)
      ]);
      setSchema(schemaRes.data);
      setRows(rowsRes.data);

      const sourced = schemaRes.data.fields.filter((f) => f.sourceMaster && f.sourceField);
      // Same as ApprovalQueueTable — a `computed` field (Emp Code / HQ /
      // Designation derived from the chosen Field Force Name) needs its
      // sourceMaster's records fetched too, or there is nothing to look
      // the display value up in and the column renders blank.
      const computedSources = schemaRes.data.fields.filter((f) => f.computed).map((f) => f.computed!.sourceMaster);
      const uniqueSources = Array.from(new Set([...sourced.map((f) => f.sourceMaster as string), ...computedSources]));
      const fetched = await Promise.all(
        uniqueSources.map((sm) => apiClient.masterRecords(sm).then((r) => [sm, r.data] as const).catch(() => [sm, []] as const))
      );
      const bySource: Record<string, MasterRecord[]> = Object.fromEntries(fetched);
      setSourceRecords(bySource);
      const opts: Record<string, string[]> = {};
      for (const f of sourced) {
        const records = bySource[f.sourceMaster as string] ?? [];
        opts[`${f.sourceMaster}.${f.sourceField}`] = Array.from(
          new Set(records.map((r) => r[f.sourceField as string]).filter((v): v is string => typeof v === "string" && v.trim() !== ""))
        ).sort();
      }
      setDropdownOptions(opts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey]);

  // Looks up a computed field's display value (e.g. Emp Code/HQ/Designation
  // from the employee record matching this row's Field Force / SF Name) —
  // identical lookup to ApprovalQueueTable's, needed here too since
  // Expense Approval (Active/Vacant-Resigned) render through this
  // reportFilter view, not the approvalQueue one.
  function computedValueFor(f: MasterField, row: Record<string, unknown>): string {
    if (!f.computed) return "";
    const currentKey = row[f.computed.fromField];
    if (!currentKey) return "";
    const records = sourceRecords[f.computed.sourceMaster] ?? [];
    const match = records.find((r) => r[f.computed!.lookupField] === currentKey);
    return match ? String(match[f.computed.displayField] ?? "") : "";
  }

  const personField = schema?.fields.find((f) => f.sourceMaster && f.sourceField);
  const hasMonth = !!schema?.fields.find((f) => f.key === "month");
  const hasYear = !!schema?.fields.find((f) => f.key === "year");
  // Several sanpharma.info report screens (Sample/Input Dispatch, Expense
  // Consolidated View, Leave Status) filter by a From/To month-year range
  // instead of a single Month+Year pair — detected the same way.
  const fromMonthField = schema?.fields.find((f) => f.key === "fromMonth");
  const fromYearField = schema?.fields.find((f) => f.key === "fromYear");
  const toMonthField = schema?.fields.find((f) => f.key === "toMonth");
  const toYearField = schema?.fields.find((f) => f.key === "toYear");
  const modeField = schema?.fields.find((f) => f.key === "mode");
  const personOptions = personField ? dropdownOptions[`${personField.sourceMaster}.${personField.sourceField}`] ?? [] : [];

  const visibleRows = useMemo(() => {
    if (!applied) return rows;
    return rows.filter((r) => {
      if (personField && personFilter && String(r[personField.key] ?? "") !== personFilter) return false;
      if (hasMonth && monthFilter && String(r.month ?? "") !== monthFilter) return false;
      if (hasYear && yearFilter && String(r.year ?? "") !== yearFilter) return false;
      if (fromMonthField && fromMonthFilter && String(r.fromMonth ?? "") !== fromMonthFilter) return false;
      if (fromYearField && fromYearFilter && String(r.fromYear ?? "") !== fromYearFilter) return false;
      if (toMonthField && toMonthFilter && String(r.toMonth ?? "") !== toMonthFilter) return false;
      if (toYearField && toYearFilter && String(r.toYear ?? "") !== toYearFilter) return false;
      if (modeField && modeFilter && String(r.mode ?? "") !== modeFilter) return false;
      return true;
   });
  }, [
    rows, applied, personFilter, monthFilter, yearFilter, personField, hasMonth, hasYear,
    fromMonthField, fromMonthFilter, fromYearField, fromYearFilter, toMonthField, toMonthFilter, toYearField, toYearFilter, modeField, modeFilter
  ]);

  function optionsFor(f: MasterField): string[] | null {
    if (f.options) return f.options;
    if (f.sourceMaster && f.sourceField) return dropdownOptions[`${f.sourceMaster}.${f.sourceField}`] ?? [];
    return null;
  }

  function openAddForm() {
    const blank: Record<string, unknown> = {};
    schema?.fields.forEach((f) => { blank[f.key] = ""; });
    setFormRow(blank);
  }

  async function saveForm() {
    if (!formRow || !schema) return;
    setSaving(true);
    setError(null);
    try {
      if (formRow.id) {
        await apiClient.updateMasterRecord(masterKey, String(formRow.id), formRow);
      } else {
        await apiClient.createMasterRecord(masterKey, formRow);
      }
      setFormRow(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save record");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeactivate() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiClient.deactivateMasterRecord(masterKey, deleteTarget.id);
      await load();
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove record");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-text-muted">Loading…</div>;
  }
  if (!schema) {
    return <div className="p-6 text-sm text-status-danger">Could not load this screen.</div>;
  }

  const commonStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: "6px",
    border: "1px solid var(--border)", fontSize: "13px", background: "var(--panel)", color: "var(--ink)"
  };

  return (
    <>
      {error && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", minWidth: "320px", maxWidth: "440px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#ef4444" }}>Something went wrong</h3>
              </div>
              <button onClick={() => setError(null)} type="button" aria-label="Close"><X size={20} /></button>
            </div>
            <p style={{ margin: 0, fontSize: "13px" }}>{error}</p>
            <button className="button button-secondary" style={{ marginTop: "16px", width: "100%" }} onClick={() => setError(null)} type="button">Close</button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", minWidth: "320px" }}>
            <p>Remove this record?</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="button" onClick={confirmDeactivate} type="button" disabled={saving}>{saving ? "Working..." : "Yes, remove"}</button>
              <button className="button button-secondary" onClick={() => setDeleteTarget(null)} type="button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {formRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "20px" }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", width: "420px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{formRow.id ? "Edit" : "New"} {schema.title}</h2>
              <button onClick={() => setFormRow(null)} type="button" aria-label="Close"><X size={20} /></button>
            </div>
            {schema.fields.map((f) => {
              const isMonthField = f.key === "month" || f.key === "fromMonth" || f.key === "toMonth";
              const isYearField = f.key === "year" || f.key === "fromYear" || f.key === "toYear";
              const opts = isMonthField ? MONTHS : isYearField ? YEARS : optionsFor(f);
              return (
                <label key={f.key} style={{ display: "block", marginBottom: "12px" }}>
                  <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>{f.label}</span>
                  {f.computed ? (
                    <input type="text" value={computedValueFor(f, formRow)} readOnly style={{ ...commonStyle, opacity: 0.7 }} />
                  ) : opts ? (
                    <CustomSelect
                      value={(formRow[f.key] as string | undefined) ?? ""}
                      options={opts}
                      onChange={(val) => setFormRow({ ...formRow, [f.key]: val })}
                      placeholder={`Select ${f.label}`}
                    />
                  ) : f.type === "date" ? (
                    <CustomDatePicker value={(formRow[f.key] as string) || ""} onChange={(val) => setFormRow({ ...formRow, [f.key]: val })} />
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={(formRow[f.key] as string | number | undefined) ?? ""}
                      onChange={(e) => setFormRow({ ...formRow, [f.key]: e.target.value })}
                      style={commonStyle}
                    />
                  )}
                </label>
              );
            })}
            <button className="button" style={{ marginTop: "8px", width: "100%" }} onClick={saveForm} type="button" disabled={saving}>
              {saving ? "Saving..." : formRow.id ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
            <h2 className="text-2xl font-bold text-text-primary">{schema.title}</h2>
            <p className="text-sm text-text-muted mt-1">Filter by {personField ? personField.label + ", " : ""}Month and Year — exactly like sanpharma.info.</p>
          </div>
          <button className="bg-brand-primary text-white hover:bg-brand-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-colors" onClick={openAddForm} type="button">
            Add Entry
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4 bg-surface-card p-4 rounded-xl border border-border-subtle shadow-sm">
          {personField && (
            <div style={{ minWidth: "220px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">{personField.label}</span>
              <CustomSelect value={personFilter} options={personOptions} onChange={setPersonFilter} placeholder={`All ${personField.label}`} />
            </div>
          )}
          {hasMonth && (
            <div style={{ minWidth: "160px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
              <CustomSelect value={monthFilter} options={MONTHS} onChange={setMonthFilter} placeholder="All Months" />
            </div>
          )}
          {hasYear && (
            <div style={{ minWidth: "120px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
              <CustomSelect value={yearFilter} options={YEARS} onChange={setYearFilter} placeholder="All Years" />
            </div>
          )}
          {fromMonthField && (
            <div style={{ minWidth: "150px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">{fromMonthField.label}</span>
              <CustomSelect value={fromMonthFilter} options={MONTHS} onChange={setFromMonthFilter} placeholder="From Month" />
            </div>
          )}
          {fromYearField && (
            <div style={{ minWidth: "120px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">{fromYearField.label}</span>
              <CustomSelect value={fromYearFilter} options={YEARS} onChange={setFromYearFilter} placeholder="From Year" />
            </div>
          )}
          {toMonthField && (
            <div style={{ minWidth: "150px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">{toMonthField.label}</span>
              <CustomSelect value={toMonthFilter} options={MONTHS} onChange={setToMonthFilter} placeholder="To Month" />
            </div>
          )}
          {toYearField && (
            <div style={{ minWidth: "120px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">{toYearField.label}</span>
              <CustomSelect value={toYearFilter} options={YEARS} onChange={setToYearFilter} placeholder="To Year" />
            </div>
          )}
          {modeField && (
            <div style={{ minWidth: "180px" }}>
              <span className="block text-xs font-medium text-text-muted mb-1">{modeField.label}</span>
              <CustomSelect value={modeFilter} options={modeField.options ?? []} onChange={setModeFilter} placeholder={`All ${modeField.label}`} />
            </div>
          )}
          <button className="bg-brand-primary text-white hover:bg-brand-primary/90 px-5 py-2 rounded-lg font-medium text-sm transition-colors" onClick={() => setApplied(true)} type="button">
            View
          </button>
          {applied && (
            <button
              className="bg-surface-card border border-border-subtle text-text-primary hover:bg-surface-subtle px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              onClick={() => {
                setApplied(false);
                setPersonFilter(""); setMonthFilter(""); setYearFilter("");
                setFromMonthFilter(""); setFromYearFilter(""); setToMonthFilter(""); setToYearFilter(""); setModeFilter("");
              }}
              type="button"
            >
              Clear
            </button>
          )}
          <article className="flex items-center gap-3 pl-4 ml-auto border-l border-border-subtle">
            <span className="text-sm text-text-muted">Total Records</span>
            <strong className="text-lg font-semibold text-text-primary">{visibleRows.length}</strong>
          </article>
        </div>

        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col" style={{ maxHeight: "calc(100vh - 320px)", minHeight: "220px" }}>
          <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
                <tr>
                  {schema.fields.map((f) => (
                    <th key={f.key} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Edit</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Remove</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={schema.fields.length + 2} className="px-4 py-10 text-center text-text-muted text-sm">
                      No records found for the selected filters.
                    </td>
                  </tr>
                )}
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                    {schema.fields.map((f) => (
                      <td key={f.key} className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                        {f.computed ? computedValueFor(f, row) : String(row[f.key] ?? "")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button className="subdivision-icon-button" type="button" title="Edit" onClick={() => setFormRow({ ...row })}>
                        <Pencil size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button className="subdivision-icon-button" type="button" title="Remove" onClick={() => setDeleteTarget(row)}>
                        <Ban size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
