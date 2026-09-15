"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/back-button";
import { PageHeader } from "@/components/page-components";

type ExpenseApprovalRow = {
  id: string;
  employee: string;
  claimId: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
};

const initialExpenseApprovals: ExpenseApprovalRow[] = [];

function ExpenseApprovalForm({ row, onSave, onBack }: { row: any; onSave: (r: ExpenseApprovalRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ExpenseApprovalRow>({
    id: row.id ?? "",
    employee: row.employee ?? "",
    claimId: row.claimId ?? "",
    amount: row.amount ?? 0,
    status: row.status ?? "Pending"
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Manager Expense"
  title="Expense Approval"
  description="Configure general profiles, mappings, and status settings."
  action={
    <>
<BackButton />
          
          <button className="button" onClick={() => setView("add")} type="button">Add Expense Claim</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by employee or claim ID..."
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

      <div className="subdivision-table-card" style={{ overflowX: "auto", paddingBottom: "120px" }}>
        <table className="subdivision-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Claim ID</th>
              <th>Amount</th>
              <th style={{ minWidth: "140px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Status</span>
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
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td><strong style={{ color: "var(--ink)" }}>{row.employee}</strong></td>
                <td>{row.claimId}</td>
                <td>₹{row.amount}</td>
                <td>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.status === "Approved" ? "#dcfce7" : row.status === "Pending" ? "#fef9c3" : "#fee2e2",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.status === "Approved" ? "#15803d" : row.status === "Pending" ? "#a16207" : "#b91c1c"
                  }}>
                    {row.status}
                  </span>
                </td>
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
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No expense claims configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
