"use client";

import { useEffect, useState } from "react";
import { Pencil, Ban, RotateCcw, X, AlertTriangle } from "lucide-react";
import { apiClient, type MasterField, type MasterRecord, type MasterSchema } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";
import { CustomDatePicker } from "@/components/custom-date-picker";

/**
 * Renders sanpharma.info's Approvals screen shape exactly: a pending-request
 * list where each row awaiting action shows a literal "Click Here to
 * Approve" link (per the live-crawl notes on Approvals > Listed Dr
 * Deactivation / TP), rather than a generic Add/Edit/Deactivate console.
 * Approving/rejecting just updates the record's approvalStatus field —
 * same generic master API every other screen already uses.
 */
export function ApprovalQueueTable({ masterKey }: { masterKey: string }) {
  const [schema, setSchema] = useState<MasterSchema | null>(null);
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
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
      const uniqueSources = Array.from(new Set(sourced.map((f) => f.sourceMaster as string)));
      const fetched = await Promise.all(
        uniqueSources.map((sm) => apiClient.masterRecords(sm).then((r) => [sm, r.data] as const).catch(() => [sm, []] as const))
      );
      const bySource: Record<string, MasterRecord[]> = Object.fromEntries(fetched);
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

  const statusField = schema?.fields.find((f) => f.key === "approvalStatus");
  const pending = rows.filter((r) => String(r.approvalStatus ?? "Pending") === "Pending");
  const visibleRows = showAll ? rows : pending;

  async function act(row: MasterRecord, status: "Approved" | "Rejected") {
    setWorkingId(String(row.id));
    try {
      await apiClient.updateMasterRecord(masterKey, String(row.id), { approvalStatus: status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update approval status");
    } finally {
      setWorkingId(null);
    }
  }

  function optionsFor(f: MasterField): string[] | null {
    if (f.options) return f.options;
    if (f.sourceMaster && f.sourceField) return dropdownOptions[`${f.sourceMaster}.${f.sourceField}`] ?? [];
    return null;
  }

  function openAddForm() {
    const blank: Record<string, unknown> = {};
    schema?.fields.forEach((f) => {
      blank[f.key] = f.key === "approvalStatus" ? "Pending" : "";
    });
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

  const displayFields = schema.fields.filter((f) => f.key !== "approvalStatus");
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
            <p>Remove this request?</p>
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
              const opts = optionsFor(f);
              return (
                <label key={f.key} style={{ display: "block", marginBottom: "12px" }}>
                  <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>{f.label}</span>
                  {opts ? (
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
              {saving ? "Saving..." : formRow.id ? "Save Changes" : "Add Request"}
            </button>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Approvals</p>
            <h2 className="text-2xl font-bold text-text-primary">{schema.title}</h2>
            <p className="text-sm text-text-muted mt-1">Pending requests awaiting HQ approval — click to approve or reject, exactly like sanpharma.info.</p>
          </div>
          <button className="bg-brand-primary text-white hover:bg-brand-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-colors" onClick={openAddForm} type="button">
            Add Request
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-surface-card p-4 rounded-xl border border-border-subtle shadow-sm">
          <article className="flex items-center gap-3 pr-4 border-r border-border-subtle">
            <span className="text-sm text-text-muted">Pending</span>
            <strong className="text-lg font-semibold text-text-primary">{pending.length}</strong>
          </article>
          <button
            className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${!showAll ? "bg-brand-primary border-brand-primary text-white" : "bg-surface-card border-border-subtle text-text-primary"}`}
            onClick={() => setShowAll(false)}
            type="button"
          >
            Pending Only
          </button>
          <button
            className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${showAll ? "bg-brand-primary border-brand-primary text-white" : "bg-surface-card border-border-subtle text-text-primary"}`}
            onClick={() => setShowAll(true)}
            type="button"
          >
            All ({rows.length})
          </button>
        </div>

        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col" style={{ maxHeight: "calc(100vh - 300px)", minHeight: "220px" }}>
          <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
                <tr>
                  {displayFields.map((f) => (
                    <th key={f.key} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Approval</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Edit</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Remove</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={displayFields.length + 3} className="px-4 py-10 text-center text-text-muted text-sm">
                      No Data found for Approval&apos;s
                    </td>
                  </tr>
                )}
                {visibleRows.map((row) => {
                  const status = String(row.approvalStatus ?? "Pending");
                  return (
                    <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                      {displayFields.map((f) => (
                        <td key={f.key} className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                          {String(row[f.key] ?? "")}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {status === "Pending" ? (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              disabled={workingId === row.id}
                              onClick={() => act(row, "Approved")}
                              className="text-brand-primary underline underline-offset-2 font-medium hover:text-brand-primary/80 disabled:opacity-50"
                            >
                              {workingId === row.id ? "Working…" : "Click Here to Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={workingId === row.id}
                              onClick={() => act(row, "Rejected")}
                              className="text-status-danger underline underline-offset-2 text-xs hover:opacity-80 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === "Approved" ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger"}`}>
                            {status}
                          </span>
                        )}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
