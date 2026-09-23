"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const WORK_TYPES = ["Field Work", "Holiday", "Weekly Off", "Transit", "Meeting"];
const PRESCRIPTION_INTEREST = ["HIGH", "MEDIUM", "LOW", "NONE"];

type DcrDraft = {
  workType: string;
  visitDate: string;
  hospitalClinic: string;
  notes: string;
  checkInTime: string;
  checkOutTime: string;
  followUpRequired: boolean;
  followUpDate: string;
  prescriptionInterest: string;
};

function toDraft(row: Record<string, unknown>): DcrDraft {
  const visitDate = row.visitDate ? new Date(String(row.visitDate)) : null;
  const followUpDate = row.followUpDate ? new Date(String(row.followUpDate)) : null;
  return {
    workType: String(row.workType ?? "Field Work"),
    visitDate: visitDate && !isNaN(visitDate.getTime()) ? visitDate.toISOString().slice(0, 10) : "",
    hospitalClinic: String(row.hospitalClinic ?? ""),
    notes: String(row.notes ?? ""),
    checkInTime: String(row.checkInTime ?? ""),
    checkOutTime: String(row.checkOutTime ?? ""),
    followUpRequired: !!row.followUpRequired,
    followUpDate: followUpDate && !isNaN(followUpDate.getTime()) ? followUpDate.toISOString().slice(0, 10) : "",
    prescriptionInterest: String(row.prescriptionInterest ?? "")
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: "6px",
  border: "1px solid var(--border)", fontSize: "13px", background: "var(--panel)", color: "var(--ink)"
};

// Matches sanpharma.info's "Update/Delete > DCR Edit" screen: a Field Force
// Name dropdown filter with a Go button, and a results table with an Edit
// button per row — no Add button. Clicking Edit opens the FULL row for
// editing (visit date, work type, hospital/clinic, notes, check-in/out
// time, follow-up, prescription interest), not just Work Type — the Edit
// button here matches the entire row, as the sanpharma screen's own Edit
// does. This reads and edits REAL DCR documents (the exact DcrModel
// collection the field-force MR's own DCR history and the manager's DCR
// review queue both read from — see company.routes.ts's GET /company/dcrs
// and PATCH /company/dcrs/:id), not a generic-masters mirror, so an edit
// here is genuinely reflected in every portal, and the backend notifies
// both the MR and their reporting manager with a summary of what changed.
export function DcrEditPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [draft, setDraft] = useState<DcrDraft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  async function go() {
    setError(null);
    setSearched(true);
    setLoading(true);
    setEditingRow(null);
    try {
      const emp = employees.find((e) => String(e.name ?? "") === selectedEmployeeCode);
      const res = await apiClient.companyDcrs({
        employeeCode: emp ? String(emp.employeeCode ?? "") : undefined
      });
      setRows(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load DCRs");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(row: Record<string, unknown>) {
    setEditingRow(row);
    setDraft(toDraft(row));
    setError(null);
  }

  function closeEdit() {
    setEditingRow(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (!editingRow || !draft) return;
    const id = String(editingRow.id ?? "");
    setSaving(true);
    setError(null);
    try {
      const updated = await apiClient.updateDcr(id, {
        workType: draft.workType,
        visitDate: draft.visitDate || undefined,
        hospitalClinic: draft.hospitalClinic || null,
        notes: draft.notes || null,
        checkInTime: draft.checkInTime || null,
        checkOutTime: draft.checkOutTime || null,
        followUpRequired: draft.followUpRequired,
        followUpDate: draft.followUpDate || null,
        prescriptionInterest: draft.prescriptionInterest || null
      });
      setRows((prev) => prev.map((r) => (String(r.id) === id ? { ...r, ...updated.data } : r)));
      closeEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update DCR");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">DCR Edit</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "240px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect
            value={selectedEmployeeCode}
            options={employeeOptions.map((e) => String(e.name ?? ""))}
            onChange={setSelectedEmployeeCode}
            placeholder="All"
          />
        </div>
        <button className="button" type="button" onClick={go} disabled={loading}>
          {loading ? "Searching..." : "Go"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Field Force Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">DCR Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Work Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rows.map((row) => {
                  const id = String(row.id ?? "");
                  const dcrDate = row.visitDate ? new Date(String(row.visitDate)).toLocaleDateString() : "";
                  return (
                    <tr key={id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.employeeCodeName ?? row.employeeCode ?? "")}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{dcrDate}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.status ?? "")}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{String(row.workType ?? "Field Work")}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button className="button" type="button" onClick={() => openEdit(row)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingRow && draft && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "20px" }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", width: "480px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Edit DCR</h2>
              <button onClick={closeEdit} type="button" aria-label="Close">✕</button>
            </div>

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Visit Date</span>
              <input type="date" value={draft.visitDate} onChange={(e) => setDraft({ ...draft, visitDate: e.target.value })} style={inputStyle} />
            </label>

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Work Type</span>
              <CustomSelect value={draft.workType} options={WORK_TYPES} onChange={(v) => setDraft({ ...draft, workType: v })} />
            </label>

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Hospital / Clinic</span>
              <input type="text" value={draft.hospitalClinic} onChange={(e) => setDraft({ ...draft, hospitalClinic: e.target.value })} style={inputStyle} />
            </label>

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Notes</span>
              <textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} style={{ ...inputStyle, minHeight: "70px" }} />
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <label style={{ display: "block", marginBottom: "12px", flex: 1 }}>
                <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Check-In Time</span>
                <input type="time" value={draft.checkInTime} onChange={(e) => setDraft({ ...draft, checkInTime: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ display: "block", marginBottom: "12px", flex: 1 }}>
                <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Check-Out Time</span>
                <input type="time" value={draft.checkOutTime} onChange={(e) => setDraft({ ...draft, checkOutTime: e.target.value })} style={inputStyle} />
              </label>
            </div>

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Prescription Interest</span>
              <CustomSelect
                value={draft.prescriptionInterest}
                options={PRESCRIPTION_INTEREST}
                onChange={(v) => setDraft({ ...draft, prescriptionInterest: v })}
                placeholder="Not set"
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none" style={{ marginBottom: "16px" }}>
              <input
                type="checkbox"
                checked={draft.followUpRequired}
                onChange={(e) => setDraft({ ...draft, followUpRequired: e.target.checked })}
              />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>Follow-Up Required</span>
            </label>

            {draft.followUpRequired && (
              <label style={{ display: "block", marginBottom: "16px" }}>
                <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Follow-Up Date</span>
                <input type="date" value={draft.followUpDate} onChange={(e) => setDraft({ ...draft, followUpDate: e.target.value })} style={inputStyle} />
              </label>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="button" style={{ flex: 1 }} onClick={saveEdit} type="button" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="button-secondary" style={{ flex: 1 }} onClick={closeEdit} type="button" disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
