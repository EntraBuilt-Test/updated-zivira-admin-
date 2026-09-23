"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MODES = ["All Listed Drs", "Specialty Wise", "Subdivision - HQ Wise"];



// Matches sanpharma.info's own Unique_Doc_Slno.aspx exactly: a Mode
// dropdown (All Listed Drs / Specialty Wise / Subdivision-HQ Wise) with
// live "Allocated" / "Not Allocated" counters, an Allocate Slno button
// that generates and PERSISTS a real unique serial number for every
// active doctor according to the chosen mode, and a Reset button that
// clears every doctor's code back to unallocated — no table, no Add
// button, matching sanpharma's screen shape exactly. Backed by real
// DoctorModel writes (see doctor.model.ts's `uniqueSlNo` field and
// masters-actions.routes.ts's /drUniqueNoGeneration/action/* endpoints),
// so a regenerated code is immediately reflected on every doctor record
// everywhere in the app.
export function DrUniqueNoGenerationPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [mode, setMode] = useState(MODES[0]);
  const [summary, setSummary] = useState<{ total: number; allocated: number; notAllocated: number } | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSummary() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.drUniqueNoSummary();
      setSummary(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadList() {
    try {
      const res = await apiClient.drUniqueNoList();
      setRows(res.data);
    } catch {
      setRows([]);
    }
  }

  async function allocate() {
    if (!window.confirm(`Allocate a unique Sl No to every doctor using mode "${mode}"? This regenerates codes for all doctors.`)) return;
    setWorking(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiClient.drUniqueNoAllocate(mode);
      setSummary(res.data);
      setMessage(`Unique Sl No allocated to ${res.data.allocated} doctor(s) using "${mode}".`);
      if (showList) await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to allocate unique Sl No");
    } finally {
      setWorking(false);
    }
  }

  async function reset() {
    if (!window.confirm("Reset every doctor's unique Sl No back to unallocated? This cannot be undone.")) return;
    setWorking(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiClient.drUniqueNoReset();
      setSummary(res.data);
      setMessage("Every doctor's unique Sl No has been reset.");
      if (showList) await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset unique Sl No");
    } finally {
      setWorking(false);
    }
  }

  async function toggleList() {
    const next = !showList;
    setShowList(next);
    if (next) await loadList();
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">Drs UNI No - Generation</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4 w-full">
        <div className="flex flex-wrap items-end gap-4">
          <div style={{ minWidth: "260px" }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Mode</span>
            <CustomSelect value={mode} options={MODES} onChange={setMode} />
          </div>
          <button className="button" type="button" onClick={allocate} disabled={working || loading}>
            {working ? "Working..." : "Allocate Slno"}
          </button>
          <button className="button-secondary" type="button" onClick={reset} disabled={working || loading}>
            {working ? "Working..." : "Reset"}
          </button>
        </div>

        <div className="flex flex-wrap gap-6 pt-2 border-t border-border-subtle">
          <article className="flex items-center gap-3">
            <span className="text-sm text-text-muted">Total Doctors</span>
            <strong className="text-lg font-semibold text-text-primary">{summary ? summary.total : loading ? "…" : 0}</strong>
          </article>
          <article className="flex items-center gap-3">
            <span className="text-sm text-text-muted">No of SlNo Allocated Drs</span>
            <strong className="text-lg font-semibold text-text-primary">{summary ? summary.allocated : loading ? "…" : 0}</strong>
          </article>
          <article className="flex items-center gap-3">
            <span className="text-sm text-text-muted">Not Allocated SlNo</span>
            <strong className="text-lg font-semibold text-text-primary">{summary ? summary.notAllocated : loading ? "…" : 0}</strong>
          </article>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      {message && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</div>}

      <div>
        <button className="button-secondary" type="button" onClick={toggleList}>
          {showList ? "Hide Doctor List" : "View Doctor List"}
        </button>
      </div>

      {showList && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Doctor Code</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Doctor Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Specialty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Territory / HQ</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Unique Sl No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Allocated</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rows.map((row, idx) => (
                  <tr key={String(row.doctorCode ?? idx)} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.doctorCode ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.doctorName ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.specialty ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.territory ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{row.uniqueSlNo ? String(row.uniqueSlNo) : "—"}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(row.allocated ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
