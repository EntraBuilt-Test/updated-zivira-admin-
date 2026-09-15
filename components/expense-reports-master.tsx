"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/back-button";
import { PageHeader } from "@/components/page-components";

type ReportRow = {
  id: string;
  monthly: string;
  team: string;
  budget: number;
};

const initialReports: ReportRow[] = [];

function ExpenseReportsForm({ row, onSave, onBack }: { row: any; onSave: (r: ReportRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ReportRow>({
    id: row.id ?? "",
    monthly: row.monthly ?? "",
    team: row.team ?? "",
    budget: row.budget ?? 0
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Manager Expense"
  title="Reports"
  description="Configure general profiles, mappings, and status settings."
  action={
    <>
<BackButton />
          
          <button className="button" onClick={() => setView("add")} type="button">Add Report</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by month or team..."
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
              <th>Monthly</th>
              <th>Team</th>
              <th>Budget</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td><strong style={{ color: "var(--ink)" }}>{row.monthly}</strong></td>
                <td>{row.team}</td>
                <td>₹{row.budget}</td>
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
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No reports configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
