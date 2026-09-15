"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";

type ExpenseRow = {
  id: string;
  expenseDate: string;
  employee: string;
  expenseType: string;
  amount: number;
  billNumber: string;
  attachment: string;
  approvalStatus: "Approved" | "Pending" | "Rejected";
  remarks: string;
};

const initialExpenses: ExpenseRow[] = [];

function ExpenseForm({ row, onSave, onBack }: { row: any; onSave: (r: ExpenseRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ExpenseRow>({
    id: row.id ?? "",
    expenseDate: row.expenseDate ?? new Date().toISOString().split("T")[0],
    employee: row.employee ?? "",
    expenseType: row.expenseType ?? "Travel",
    amount: row.amount ?? 0,
    billNumber: row.billNumber ?? "",
    attachment: row.attachment ?? "",
    approvalStatus: row.approvalStatus ?? "Pending",
    remarks: row.remarks ?? ""
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Daily MR Work"
  title="Expense"
  description="Create and track field forces business trip expenses."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Expense</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by employee, bill no or remarks..."
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
              <th>Employee</th>
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
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "140px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Travel", "Food", "Lodging", "Miscellaneous"].map(t => (
                      <button key={t} type="button" onClick={() => { setTypeFilter(t); setTypeFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: typeFilter === t ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: typeFilter === t ? 600 : 400 }}>
                        {t}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setTypeFilter("All"); setTypeFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th>Amount</th>
              <th>Bill Number</th>
              <th>Attachment</th>
              <th style={{ minWidth: "140px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Approval Status</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {statusFilterOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "120px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Pending", "Approved", "Rejected"].map(st => (
                      <button key={st} type="button" onClick={() => { setStatusFilter(st); setStatusFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: statusFilter === st ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: statusFilter === st ? 600 : 400 }}>
                        {st}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setStatusFilter("All"); setStatusFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th>Remarks</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.expenseDate)}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.employee}</strong></td>
                <td>{row.expenseType}</td>
                <td style={{ fontWeight: 600 }}>₹{row.amount.toFixed(2)}</td>
                <td>{row.billNumber}</td>
                <td style={{ color: "var(--ink)", textDecoration: "underline", fontSize: "13px" }}>{row.attachment}</td>
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
                <td>{row.remarks}</td>
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
                <td colSpan={10} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No expense records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
