"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
import { PageHeader } from "@/components/page-components";

type ExpenseReportRow = {
  id: string;
  expenseDate: string;
  employeeCode: string;
  employeeName: string;
  division: string;
  hq: string;
  expenseType: string;
  description: string;
  amount: number;
  receiptAttached: string;
  approvalStatus: "Approved" | "Pending" | "Rejected";
  approvedBy: string;
};

const initialReports: ExpenseReportRow[] = [];

function ReportForm({ row, onSave, onBack }: { row: any; onSave: (r: ExpenseReportRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ExpenseReportRow>({
    id: row.id ?? "",
    expenseDate: row.expenseDate ?? new Date().toISOString().split("T")[0],
    employeeCode: row.employeeCode ?? "",
    employeeName: row.employeeName ?? "",
    division: row.division ?? "Zivira",
    hq: row.hq ?? "Chennai Central HQ",
    expenseType: row.expenseType ?? "Travel",
    description: row.description ?? "",
    amount: row.amount ?? 0,
    receiptAttached: row.receiptAttached ?? "",
    approvalStatus: row.approvalStatus ?? "Pending",
    approvedBy: row.approvedBy ?? ""
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Manager Activity Report"
  title="Expense Report"
  description="Review comprehensive field force daily travel and lodging expense claims."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Claim</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by employee, code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "360px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            outline: "none"
          }}
        />
      </div>

      <div className="subdivision-table-card" style={{ overflowX: "auto", paddingBottom: "180px" }}>
        <table className="subdivision-table">
          <thead>
            <tr>
              <th>Expense Date</th>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th style={{ minWidth: "130px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Division</span>
                  <button
                    type="button"
                    onClick={() => setDivisionFilterOpen(!divisionFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {divisionFilterOpen && (
                  <div className="command-select-menu" style={{ right: 0, left: "auto" }}>
                    {["Zivira", "Astra", "Aura"].map(div => (
                      <button key={div} type="button" onClick={() => { setDivisionFilter(div); setDivisionFilterOpen(false); }} className={divisionFilter === div ? "command-select-option command-select-option-active" : "command-select-option"}>
                        {div}
                      </button>
                    ))}
                    <button className="command-select-option" type="button" onClick={() => { setDivisionFilter("All"); setDivisionFilterOpen(false); }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th style={{ minWidth: "160px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>HQ</span>
                  <button
                    type="button"
                    onClick={() => setHqFilterOpen(!hqFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {hqFilterOpen && (
                  <div className="command-select-menu" style={{ right: 0, left: "auto" }}>
                    {["Chennai Central HQ", "Coimbatore HQ", "Madurai HQ"].map(hq => (
                      <button key={hq} type="button" onClick={() => { setHqFilter(hq); setHqFilterOpen(false); }} className={hqFilter === hq ? "command-select-option command-select-option-active" : "command-select-option"}>
                        {hq}
                      </button>
                    ))}
                    <button className="command-select-option" type="button" onClick={() => { setHqFilter("All"); setHqFilterOpen(false); }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th style={{ minWidth: "150px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Expense Type</span>
                  <button
                    type="button"
                    onClick={() => setTypeFilterOpen(!typeFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {typeFilterOpen && (
                  <div className="command-select-menu" style={{ right: 0, left: "auto" }}>
                    {["Travel", "Food", "Lodging", "Miscellaneous"].map(t => (
                      <button key={t} type="button" onClick={() => { setTypeFilter(t); setTypeFilterOpen(false); }} className={typeFilter === t ? "command-select-option command-select-option-active" : "command-select-option"}>
                        {t}
                      </button>
                    ))}
                    <button className="command-select-option" type="button" onClick={() => { setTypeFilter("All"); setTypeFilterOpen(false); }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th>Description</th>
              <th>Amount</th>
              <th>Receipt Attached</th>
              <th style={{ minWidth: "140px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Approval Status</span>
                  <button
                    type="button"
                    onClick={() => setApprovalFilterOpen(!approvalFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {approvalFilterOpen && (
                  <div className="command-select-menu" style={{ right: 0, left: "auto" }}>
                    {["Pending", "Approved", "Rejected"].map(st => (
                      <button key={st} type="button" onClick={() => { setApprovalFilter(st); setApprovalFilterOpen(false); }} className={approvalFilter === st ? "command-select-option command-select-option-active" : "command-select-option"}>
                        {st}
                      </button>
                    ))}
                    <button className="command-select-option" type="button" onClick={() => { setApprovalFilter("All"); setApprovalFilterOpen(false); }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th>Approved By</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.expenseDate)}</td>
                <td>{row.employeeCode}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.employeeName}</strong></td>
                <td>{row.division}</td>
                <td>{row.hq}</td>
                <td>{row.expenseType}</td>
                <td>{row.description}</td>
                <td style={{ fontWeight: 600 }}>₹{row.amount.toFixed(2)}</td>
                <td style={{ color: "var(--ink)", textDecoration: "underline", fontSize: "13px" }}>{row.receiptAttached}</td>
                <td>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.approvalStatus === "Approved" ? "#dcfce7" : row.approvalStatus === "Rejected" ? "#fee2e2" : "#f3f4f6",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.approvalStatus === "Approved" ? "#15803d" : row.approvalStatus === "Rejected" ? "#b91c1c" : "#374151"
                  }}>
                    {row.approvalStatus}
                  </span>
                </td>
                <td>{row.approvedBy}</td>
                <td>
                  <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} type="button">
                    <Pencil size={15} />
                  </button>
                </td>
                <td>
                  <button className="subdivision-danger-button" onClick={() => handleDelete(row.id)} type="button">
                    <Ban />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No expense reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
