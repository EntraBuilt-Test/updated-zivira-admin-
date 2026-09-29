"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 11 item 6 — sanpharma's real "DCR Activity Status" search form:
// Filed Force Name + Mode (Common Activity / Drs-Chm-Stk-UnlstDrs-Hos-CIP) +
// Month + Year + View, not just an Activity+FieldForce picker (Round 9's
// shape). "Common Activity" mode is a plain employee roster; the other mode
// keeps Round 9's real per-activity completion-date table (still honestly
// "-" — no completion-event tracking exists in this codebase yet), now
// reached through this Mode dropdown rather than being the only view.
const MODES = ["Common Activity", "Drs/Chm/stk/unlstDrs/Hos/CIP"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - 3 + i));

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

function fmtDate(v: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

type Row = {
  empCode: string; fieldForceName: string; designation: string; hq: string; doj: string | null;
  drsDate: string; chmDate: string; stkDate: string; unlstDrsDate: string; hosDate: string; cipDate: string;
};

export function ActivityStatusPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [activities, setActivities] = useState<{ id: string; shortName: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mode, setMode] = useState<(typeof MODES)[number]>(MODES[0]);
  const [selectedName, setSelectedName] = useState("");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<Row[]>([]);
  const [activityName, setActivityName] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.activityList().then((res) => setActivities(res.data as unknown as { id: string; shortName: string; name: string }[])).catch(() => {});
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  async function view() {
    setError(null);
    setLoading(true);
    try {
      // "Drs/Chm/stk..." mode groups its result under whichever real
      // Activity currently exists (most recently created), matching Round
      // 9's real per-activity completion table; there is no separate
      // Activity picker in sanpharma's own Activity - Status form.
      const activityId = mode === MODES[1] && activities.length ? activities[0].id : "";
      const res = await apiClient.activityStatusList({
        activityId,
        fieldForceName: selectedName ? selectedName.split(" - ")[0] : ""
      });
      setRows(res.data as unknown as Row[]);
      setActivityName((res as unknown as { activityName?: string }).activityName || "");
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Activity Status");
    } finally {
      setLoading(false);
    }
  }

  const commonMode = mode === MODES[0];

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">Activity - Status</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: 240 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Filed Force Name</span>
          <CustomSelect
            value={selectedName}
            options={employees.map(employeeLabel)}
            onChange={setSelectedName}
            placeholder="--- Select the Field force ---"
          />
        </div>
        <div style={{ minWidth: 260 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Mode</span>
          <CustomSelect value={mode} options={[...MODES]} onChange={(v) => setMode(v as (typeof MODES)[number])} />
        </div>
        <div style={{ minWidth: 100 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
          <CustomSelect value={month} options={MONTHS} onChange={setMonth} />
        </div>
        <div style={{ minWidth: 100 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={year} options={YEARS} onChange={setYear} />
        </div>
        <button className="button" type="button" onClick={view} disabled={loading}>
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3">DCR Activity Status - {month} {year}</h3>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              {commonMode ? (
                <tr>
                  <th style={head}>S.No</th>
                  <th style={head}>FieldForce Name</th>
                  <th style={head}>Designation Name</th>
                  <th style={head}>HQ</th>
                  <th style={head}>Emp.Code</th>
                  <th style={head}>DOJ</th>
                </tr>
              ) : (
                <>
                  <tr>
                    <th style={head} rowSpan={2}>S.No</th>
                    <th style={head} rowSpan={2}>FieldForce Name</th>
                    <th style={head} rowSpan={2}>Designation Name</th>
                    <th style={head} rowSpan={2}>HQ</th>
                    <th style={head} rowSpan={2}>Emp.Code</th>
                    <th style={head} rowSpan={2}>DOJ</th>
                    <th style={head} colSpan={6}>{activityName || "Activity Name"}</th>
                  </tr>
                  <tr>
                    <th style={head}>Drs Date</th>
                    <th style={head}>Chm Date</th>
                    <th style={head}>Stk Date</th>
                    <th style={head}>UnlstDrs Date</th>
                    <th style={head}>Hos Date</th>
                    <th style={head}>CIP Date</th>
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td style={cell} colSpan={commonMode ? 6 : 12}>No Records Found</td></tr>}
              {rows.map((r, i) => (
                <tr key={r.empCode}>
                  <td style={cell}>{i + 1}</td>
                  <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.hq}</td>
                  <td style={cell}>{r.empCode}</td>
                  <td style={cell}>{fmtDate(r.doj)}</td>
                  {!commonMode && (
                    <>
                      <td style={cell}>{r.drsDate}</td>
                      <td style={cell}>{r.chmDate}</td>
                      <td style={cell}>{r.stkDate}</td>
                      <td style={cell}>{r.unlstDrsDate}</td>
                      <td style={cell}>{r.hosDate}</td>
                      <td style={cell}>{r.cipDate}</td>
                    </>
                  )}
                </tr>
              ))}
              {rows.length > 0 && (
                <tr>
                  <td style={{ ...head, textAlign: "right" }} colSpan={commonMode ? 6 : 12}>Total : {rows.length}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
