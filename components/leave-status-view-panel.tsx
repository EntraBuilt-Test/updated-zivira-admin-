"use client";

import { useEffect, useMemo, useState } from "react";
import { downloadAoaXlsx } from "@/lib/xlsx-export";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 item 9 — sanpharma.info's Activity Reports » Leave Status View /
// Leave Entitlement View: real Leave Eligibility (item 8's entitlement grid)
// minus real Leave Taken (LeaveApplicationModel APPROVED records) = real
// Balance. Headers exactly: S.No | Employee id | FieldForce Name |
// Designation | HQ | Joining Date | Eligibility (CL/PL/SL/LOP) | Leave Taken
// (CL/PL/SL/LOP) | Leave Balance (CL/PL/SL/LOP).
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

type Row = {
  employeeId: string;
  fieldForceName: string;
  designation: string;
  hq: string;
  joiningDate: string | null;
  eligibilityCl: number | string;
  eligibilityPl: number | string;
  eligibilitySl: number | string;
  eligibilityLop: number | string;
  takenCl: number;
  takenPl: number;
  takenSl: number;
  takenLop: number;
  balanceCl: number | string;
  balancePl: number | string;
  balanceSl: number | string;
  balanceLop: number | string;
};

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

function fmtDate(v: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export function LeaveStatusViewPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Round 10 item 3 — Field Force Name was only ever populated after the
  // panel's own View/Search action ran, so the dropdown showed nothing
  // until then (and never, if that action is gated behind another required
  // field). Prefetch on mount like every other populated dropdown does.
  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const [selectedName, setSelectedName] = useState("");
  const [fromMonth, setFromMonth] = useState(MONTHS[0]);
  const [fromYear, setFromYear] = useState(String(new Date().getFullYear()));
  const [toMonth, setToMonth] = useState(MONTHS[new Date().getMonth()]);
  const [toYear, setToYear] = useState(String(new Date().getFullYear()));
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
        apiClient.leaveEntitlementView({
          fieldForceName: selectedName ? selectedName.split(" - ")[0] : "",
          fromMonth: String(MONTHS.indexOf(fromMonth) + 1),
          fromYear,
          toMonth: String(MONTHS.indexOf(toMonth) + 1),
          toYear
        })
      ]);
      setEmployees(empRes.data);
      setRows(res.data as unknown as Row[]);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Leave Status View");
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    const header = [
      "S.No", "Employee id", "FieldForce Name", "Designation", "HQ", "Joining Date",
      "Eligibility CL", "Eligibility PL", "Eligibility SL", "Eligibility LOP",
      "Leave Taken CL", "Leave Taken PL", "Leave Taken SL", "Leave Taken LOP",
      "Leave Balance CL", "Leave Balance PL", "Leave Balance SL", "Leave Balance LOP"
    ];
    const body = rows.map((r, i) => [
      i + 1, r.employeeId, r.fieldForceName, r.designation, r.hq, fmtDate(r.joiningDate),
      r.eligibilityCl, r.eligibilityPl, r.eligibilitySl, r.eligibilityLop,
      r.takenCl, r.takenPl, r.takenSl, r.takenLop,
      r.balanceCl, r.balancePl, r.balanceSl, r.balanceLop
    ]);
    void downloadAoaXlsx({ sheetName: "Leave Status View", fileName: "Leave_Status_View.xlsx", header, body });
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">Leave Status View</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "240px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">FieldForce Name</span>
          <CustomSelect value={selectedName} options={employees.map(employeeLabel)} onChange={setSelectedName} placeholder="All" />
        </div>
        <div style={{ minWidth: "140px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">From Month</span>
          <CustomSelect value={fromMonth} options={MONTHS} onChange={setFromMonth} />
        </div>
        <div style={{ minWidth: "110px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">From Year</span>
          <CustomSelect value={fromYear} options={yearOptions} onChange={setFromYear} />
        </div>
        <div style={{ minWidth: "140px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">To Month</span>
          <CustomSelect value={toMonth} options={MONTHS} onChange={setToMonth} />
        </div>
        <div style={{ minWidth: "110px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">To Year</span>
          <CustomSelect value={toYear} options={yearOptions} onChange={setToYear} />
        </div>
        <button className="button" type="button" onClick={view} disabled={loading}>
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-bold">Leave Status View</h3>
            <div className="flex gap-2">
              <button className="button button-secondary" type="button" onClick={() => window.print()}>Print</button>
              <button className="button button-secondary" type="button" onClick={exportExcel} disabled={!rows.length}>Excel</button>
              <button className="button button-secondary" type="button" onClick={() => setSearched(false)}>Close</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
              <thead>
                <tr>
                  <th style={head} rowSpan={2}>S.No</th>
                  <th style={head} rowSpan={2}>Employee id</th>
                  <th style={head} rowSpan={2}>FieldForce Name</th>
                  <th style={head} rowSpan={2}>Designation</th>
                  <th style={head} rowSpan={2}>HQ</th>
                  <th style={head} rowSpan={2}>Joining Date</th>
                  <th style={head} colSpan={4}>Leave Eligibilty</th>
                  <th style={head} colSpan={4}>{fromMonth} {fromYear} - Leave Taken</th>
                  <th style={head} colSpan={4}>Leave Balance</th>
                </tr>
                <tr>
                  {["CL", "PL", "SL", "LOP"].map((l) => <th key={`e-${l}`} style={head}>{l}</th>)}
                  {["CL", "PL", "SL", "LOP"].map((l) => <th key={`t-${l}`} style={head}>{l}</th>)}
                  {["CL", "PL", "SL", "LOP"].map((l) => <th key={`b-${l}`} style={head}>{l}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td style={cell} colSpan={18}>No Records Found</td></tr>}
                {rows.map((r, i) => (
                  <tr key={r.employeeId}>
                    <td style={cell}>{i + 1}</td>
                    <td style={cell}>{r.employeeId}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                    <td style={cell}>{r.designation}</td>
                    <td style={cell}>{r.hq}</td>
                    <td style={cell}>{fmtDate(r.joiningDate)}</td>
                    <td style={cell}>{r.eligibilityCl}</td>
                    <td style={cell}>{r.eligibilityPl}</td>
                    <td style={cell}>{r.eligibilitySl}</td>
                    <td style={cell}>{r.eligibilityLop}</td>
                    <td style={cell}>{r.takenCl}</td>
                    <td style={cell}>{r.takenPl}</td>
                    <td style={cell}>{r.takenSl}</td>
                    <td style={cell}>{r.takenLop}</td>
                    <td style={cell}>{r.balanceCl}</td>
                    <td style={cell}>{r.balancePl}</td>
                    <td style={cell}>{r.balanceSl}</td>
                    <td style={cell}>{r.balanceLop}</td>
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
