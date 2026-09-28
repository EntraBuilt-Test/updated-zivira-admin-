"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 9 item 4 — "Manager Missed Call - View": real Employee identity
// columns plus, for the selected month, a merged group (named after that
// month, e.g. "SEP - 2026") with LIST (real doctors mapped to the employee)
// / MET / SEEN (real distinct doctors visited that month, from DcrModel) /
// MISSED (LIST - SEEN). "-" only for an employee with no mapped doctors at
// all, matching the sanpharma reference for a brand-new employee.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

type Row = { empCode: string; fieldForceName: string; designation: string; hq: string; list: number | string; met: number | string; seen: number | string; missed: number | string };

export function ManagerMissedCallViewPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Round 10 item 3 — Field Force Name was only ever populated after the
  // panel's own View/Search action ran, so the dropdown showed nothing
  // until then (and never, if that action is gated behind another required
  // field). Prefetch on mount like every other populated dropdown does.
  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const [selectedName, setSelectedName] = useState("");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<Row[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [String(y - 1), String(y), String(y + 1)];
  }, []);

  async function view() {
    setError(null);
    setLoading(true);
    try {
      const [empRes, res] = await Promise.all([
        employees.length ? Promise.resolve({ data: employees }) : apiClient.employees(),
        apiClient.managerMissedCallView({
          fieldForceName: selectedName ? selectedName.split(" - ")[0] : "",
          month: String(MONTHS.indexOf(month) + 1),
          year
        })
      ]);
      setEmployees(empRes.data);
      setRows(res.data as unknown as Row[]);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Manager Missed Call - View");
    } finally {
      setLoading(false);
    }
  }

  const monthLabel = `${MONTH_ABBR[MONTHS.indexOf(month)]} - ${year}`;

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">Manager Missed Call - View</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: 240 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect value={selectedName} options={employees.map(employeeLabel)} onChange={setSelectedName} placeholder="All" />
        </div>
        <div style={{ minWidth: 140 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
          <CustomSelect value={month} options={MONTHS} onChange={setMonth} />
        </div>
        <div style={{ minWidth: 110 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={year} options={yearOptions} onChange={setYear} />
        </div>
        <button className="button" type="button" onClick={view} disabled={loading}>
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3">Manager Missed Call details - {monthLabel}</h3>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={head} rowSpan={2}>S.No</th>
                <th style={head} rowSpan={2}>FIELDFORCE NAME</th>
                <th style={head} rowSpan={2}>DESIGNATION NAME</th>
                <th style={head} rowSpan={2}>HQ</th>
                <th style={head} colSpan={4}>{monthLabel}</th>
              </tr>
              <tr>
                <th style={head}>LIST</th>
                <th style={head}>MET</th>
                <th style={head}>SEEN</th>
                <th style={head}>MISSED</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td style={cell} colSpan={8}>No Records Found</td></tr>}
              {rows.map((r, i) => (
                <tr key={r.empCode}>
                  <td style={cell}>{i + 1}</td>
                  <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.hq}</td>
                  <td style={cell}>{r.list}</td>
                  <td style={cell}>{r.met}</td>
                  <td style={cell}>{r.seen}</td>
                  <td style={cell}>{r.missed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
