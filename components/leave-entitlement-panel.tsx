"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 item 8 — real editable Leave Entitlement grid, matching
// sanpharma.info's Master » Leave Entitlement - Entry exactly: S.No | Field
// Force Name | HQ | Designation | Employee Code | Date of Joining | Leave
// Balance (CL/PL/SL/LOP) | Leave Eligibility (CL/PL/SL/LOP, editable). Real
// per-employee data from EmployeeModel; Balance/Eligibility persisted into
// the existing leaveEntitlementEntry generic collection via the new
// /action/grid + /action/submit endpoints (see masters-actions.routes.ts).
const yearOptions = (() => {
  const y = new Date().getFullYear();
  return [String(y - 1), String(y), String(y + 1)];
})();

type GridRow = {
  recordId: string | null;
  employeeCode: string;
  fieldForceName: string;
  hq: string;
  designation: string;
  dateOfJoining: string | null;
  year: string;
  cl: number | null;
  pl: number | null;
  sl: number | null;
  lop: number | null;
  balanceCl: number | null;
  balancePl: number | null;
  balanceSl: number | null;
  balanceLop: number | null;
};

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

function fmtDate(v: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export function LeaveEntitlementPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<GridRow[]>([]);
  const [edits, setEdits] = useState<Record<string, { cl: string; pl: string; sl: string; lop: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await apiClient.leaveEntitlementGrid(year);
      const data = res.data as unknown as GridRow[];
      setRows(data);
      setEdits(
        Object.fromEntries(
          data.map((r) => [
            r.employeeCode,
            { cl: String(r.cl ?? 0), pl: String(r.pl ?? 0), sl: String(r.sl ?? 0), lop: String(r.lop ?? 0) }
          ])
        )
      );
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Leave Entitlement data");
    } finally {
      setLoading(false);
    }
  }

  function updateEdit(code: string, field: "cl" | "pl" | "sl" | "lop", value: string) {
    setEdits((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }));
  }

  async function finalSubmit() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = rows.map((r) => {
        const e = edits[r.employeeCode] || { cl: "0", pl: "0", sl: "0", lop: "0" };
        return {
          employeeCode: r.employeeCode,
          cl: Number(e.cl) || 0,
          pl: Number(e.pl) || 0,
          sl: Number(e.sl) || 0,
          lop: Number(e.lop) || 0
        };
      });
      const res = await apiClient.leaveEntitlementSubmit({ year, rows: payload });
      setMessage(`Saved entitlement for ${res.data.saved} employee(s).`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Leave Entitlement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Master</p>
        <h2 className="text-2xl font-bold text-text-primary">Leave Entitlement - Entry</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "140px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={year} options={yearOptions} onChange={setYear} placeholder="Year" />
        </div>
        <button className="button" type="button" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Load"}
        </button>
        {loaded && (
          <button className="button button-secondary" type="button" onClick={finalSubmit} disabled={saving}>
            {saving ? "Saving..." : "Final Submit"}
          </button>
        )}
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      {message && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</div>}

      {loaded && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={head} rowSpan={2}>S.No</th>
                <th style={head} rowSpan={2}>Field Force Name</th>
                <th style={head} rowSpan={2}>HQ</th>
                <th style={head} rowSpan={2}>Designation</th>
                <th style={head} rowSpan={2}>Employee Code</th>
                <th style={head} rowSpan={2}>Date of Joining</th>
                <th style={head} colSpan={4}>Leave Balance</th>
                <th style={head} colSpan={4}>Leave Eligibility</th>
              </tr>
              <tr>
                {["CL", "PL", "SL", "LOP"].map((l) => <th key={`bal-${l}`} style={head}>{l}</th>)}
                {["CL", "PL", "SL", "LOP"].map((l) => <th key={`elg-${l}`} style={head}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td style={cell} colSpan={14}>No Records Found</td></tr>
              )}
              {rows.map((r, i) => {
                const e = edits[r.employeeCode] || { cl: "0", pl: "0", sl: "0", lop: "0" };
                return (
                  <tr key={r.employeeCode}>
                    <td style={cell}>{i + 1}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                    <td style={cell}>{r.hq}</td>
                    <td style={cell}>{r.designation}</td>
                    <td style={cell}>{r.employeeCode}</td>
                    <td style={cell}>{fmtDate(r.dateOfJoining)}</td>
                    <td style={cell}>{r.balanceCl ?? "-"}</td>
                    <td style={cell}>{r.balancePl ?? "-"}</td>
                    <td style={cell}>{r.balanceSl ?? "-"}</td>
                    <td style={cell}>{r.balanceLop ?? "-"}</td>
                    {(["cl", "pl", "sl", "lop"] as const).map((f) => (
                      <td key={f} style={cell}>
                        <input
                          className="input"
                          style={{ width: 64, textAlign: "center", padding: "2px 4px" }}
                          type="number"
                          min={0}
                          value={e[f]}
                          onChange={(ev) => updateEdit(r.employeeCode, f, ev.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
