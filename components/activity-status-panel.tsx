"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 9 item 3 — "DCR Activity Status": real Employee identity columns
// (Emp.Code/DOJ/Designation/HQ) plus, for the selected real Activity, six
// per-entity-type completion-date sub-columns (Drs/Chm/Stk/UnlstDrs/Hos/CIP
// Date). No activity-completion tracking exists anywhere in this codebase
// yet, so every date cell is honestly "-" — exactly matching sanpharma's own
// reference for employees with no completions recorded.
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
  const [activityId, setActivityId] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [activityName, setActivityName] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.activityList().then((res) => setActivities(res.data as unknown as { id: string; shortName: string; name: string }[])).catch(() => {});
  }, []);

  const activityLabel = (a: { shortName: string; name: string }) => `${a.shortName} - ${a.name}`;

  async function view() {
    setError(null);
    setLoading(true);
    try {
      const [empRes, res] = await Promise.all([
        employees.length ? Promise.resolve({ data: employees }) : apiClient.employees(),
        apiClient.activityStatusList({
          activityId,
          fieldForceName: selectedName ? selectedName.split(" - ")[0] : ""
        })
      ]);
      setEmployees(empRes.data);
      setRows(res.data as unknown as Row[]);
      setActivityName((res as unknown as { activityName?: string }).activityName || "");
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Activity Status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">Activity - Status</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: 220 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Activity Name</span>
          <CustomSelect
            value={activities.find((a) => a.id === activityId) ? activityLabel(activities.find((a) => a.id === activityId)!) : ""}
            options={activities.map(activityLabel)}
            onChange={(label) => {
              const found = activities.find((a) => activityLabel(a) === label);
              if (found) setActivityId(found.id);
            }}
            placeholder="Select Activity"
          />
        </div>
        <div style={{ minWidth: 240 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect value={selectedName} options={employees.map(employeeLabel)} onChange={setSelectedName} placeholder="All" />
        </div>
        <button className="button" type="button" onClick={view} disabled={loading || !activityId}>
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3">DCR Activity Status</h3>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
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
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td style={cell} colSpan={12}>No Records Found</td></tr>}
              {rows.map((r, i) => (
                <tr key={r.empCode}>
                  <td style={cell}>{i + 1}</td>
                  <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.hq}</td>
                  <td style={cell}>{r.empCode}</td>
                  <td style={cell}>{fmtDate(r.doj)}</td>
                  <td style={cell}>{r.drsDate}</td>
                  <td style={cell}>{r.chmDate}</td>
                  <td style={cell}>{r.stkDate}</td>
                  <td style={cell}>{r.unlstDrsDate}</td>
                  <td style={cell}>{r.hosDate}</td>
                  <td style={cell}>{r.cipDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
