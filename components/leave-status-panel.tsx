"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's MasterFiles/MR/Leave_Status.aspx exactly: a
// FieldForce Name (Team/Individual + name) filter, From/To Month+Year, a
// View button, and a results table with the EXACT sanpharma headers,
// including its own spelling of "Designaion". Reads the real
// LeaveApplicationModel via GET /masters/leaveStatusReport/action/list.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const now = new Date();
const YEARS = Array.from({ length: 6 }, (_, i) => String(now.getFullYear() - 4 + i));

export function LeaveStatusPanel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mode, setMode] = useState<"Team" | "Individual">("Team");
  const [fieldForceName, setFieldForceName] = useState("");
  const [fromMonth, setFromMonth] = useState(MONTHS[now.getMonth()]);
  const [fromYear, setFromYear] = useState(String(now.getFullYear()));
  const [toMonth, setToMonth] = useState(MONTHS[now.getMonth()]);
  const [toYear, setToYear] = useState(String(now.getFullYear()));
  const [rows, setRows] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewRow, setViewRow] = useState<any | null>(null);

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  async function view() {
    setLoading(true);
    try {
      const res = await apiClient.leaveStatusList({
        fieldForceName: mode === "Individual" ? fieldForceName : "",
        fromMonth: String(MONTHS.indexOf(fromMonth) + 1),
        fromYear,
        toMonth: String(MONTHS.indexOf(toMonth) + 1),
        toYear
      });
      setRows(res.data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Options</p>
          <h2>Leave Status</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
        <div className="field" style={{ minWidth: 140 }}>
          <label>FieldForce Name</label>
          <CustomSelect value={mode} options={["Team", "Individual"]} onChange={(v) => setMode(v as "Team" | "Individual")} />
        </div>
        {mode === "Individual" && (
          <div className="field" style={{ minWidth: 240 }}>
            <label>&nbsp;</label>
            <CustomSelect
              value={fieldForceName}
              options={["---Select---", ...employees.map((e: any) => `${e.name} - ${e.role} - ${e.territory || ""}`.split(" - ")[0])]}
              onChange={(v) => setFieldForceName(v === "---Select---" ? "" : v)}
            />
          </div>
        )}
        <div className="field"><label>From Month</label><CustomSelect value={fromMonth} options={MONTHS} onChange={setFromMonth} /></div>
        <div className="field"><label>From Year</label><CustomSelect value={fromYear} options={YEARS} onChange={setFromYear} /></div>
        <div className="field"><label>To Month</label><CustomSelect value={toMonth} options={MONTHS} onChange={setToMonth} /></div>
        <div className="field"><label>To Year</label><CustomSelect value={toYear} options={YEARS} onChange={setToYear} /></div>
        <button className="button" type="button" onClick={view} disabled={loading}>{loading ? "Loading..." : "View"}</button>
      </div>

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle">
              <tr>
                {["S.No", "FieldForce Name", "Designaion", "HQ", "Emp.Code", "Applied Date", "From Date", "To Date", "Leave Information", "Type", "Status", "Approved BY", "Reason", "Click Here to View"].map((h) => (
                  <th key={h} className="px-4 py-2 text-xs font-semibold uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm">{r.fieldForceName}</td>
                  <td className="px-4 py-2 text-sm">{r.designation}</td>
                  <td className="px-4 py-2 text-sm">{r.hq}</td>
                  <td className="px-4 py-2 text-sm">{r.empCode}</td>
                  <td className="px-4 py-2 text-sm">{r.appliedDate ? new Date(r.appliedDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-2 text-sm">{r.fromDate ? new Date(r.fromDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-2 text-sm">{r.toDate ? new Date(r.toDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-2 text-sm">{r.leaveInformation}</td>
                  <td className="px-4 py-2 text-sm">{r.type}</td>
                  <td className="px-4 py-2 text-sm">{r.status}</td>
                  <td className="px-4 py-2 text-sm">{r.approvedBy}</td>
                  <td className="px-4 py-2 text-sm">{r.reason}</td>
                  <td className="px-4 py-2 text-sm">
                    <button className="button button-secondary" type="button" onClick={() => setViewRow(r)}>Click Here to View</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={14} className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>No leave records found for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="card" style={{ maxWidth: 420, width: "100%" }}>
            <h3 style={{ marginBottom: 12 }}>Leave Application Detail</h3>
            <p><strong>{viewRow.fieldForceName}</strong> ({viewRow.empCode})</p>
            <p>{viewRow.type} · {viewRow.fromDate ? new Date(viewRow.fromDate).toLocaleDateString() : "-"} to {viewRow.toDate ? new Date(viewRow.toDate).toLocaleDateString() : "-"}</p>
            <p>Status: {viewRow.status} · Approved By: {viewRow.approvedBy}</p>
            <p>Reason: {viewRow.reason}</p>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button className="button button-secondary" type="button" onClick={() => setViewRow(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
