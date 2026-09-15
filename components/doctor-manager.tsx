"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, X, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";

type ClassRow = {
  id: string;
  category: "A" | "B" | "C";
  potential: "High" | "Medium" | "Low";
  frequency: "Weekly" | "Twice a Month" | "Fortnightly" | "Monthly" | "Once in Two Months" | "Quarterly";
  status: "Active" | "Inactive";
};

const initialClassifications: ClassRow[] = [];

function ClassForm({ row, onSave, onBack }: { row: any; onSave: (r: ClassRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ClassRow>({
    id: row.id ?? "",
    category: row.category ?? "A",
    potential: row.potential ?? "High",
    frequency: row.frequency ?? "Weekly",
    status: row.status ?? "Active"
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Doctor Classification"
  description="Create and manage doctor visit classifications based on sales potential."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Classification</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by category, potential or frequency..."
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
              <th>Doctor Category</th>
              <th>Potential</th>
              <th>Visit Frequency</th>
              <th style={{ minWidth: "130px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Status</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {statusFilterOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 10,
                      minWidth: "110px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "4px 0"
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => { setStatusFilter("Active"); setStatusFilterOpen(false); }}
                      style={{
                        padding: "6px 12px",
                        textAlign: "left",
                        background: statusFilter === "Active" ? "var(--line)" : "none",
                        border: "none",
                        color: "var(--ink)",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: statusFilter === "Active" ? 600 : 400
                      }}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatusFilter("Inactive"); setStatusFilterOpen(false); }}
                      style={{
                        padding: "6px 12px",
                        textAlign: "left",
                        background: statusFilter === "Inactive" ? "var(--line)" : "none",
                        border: "none",
                        color: "var(--ink)",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: statusFilter === "Inactive" ? 600 : 400
                      }}
                    >
                      Inactive
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatusFilter("All"); setStatusFilterOpen(false); }}
                      style={{
                        padding: "6px 12px",
                        textAlign: "left",
                        borderTop: "1px solid var(--border)",
                        background: "none",
                        color: "var(--muted)",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </th>
              <th>Edit</th>
              <th>Inactive</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>
                  <span style={{ 
                    padding: "4px 10px", 
                    borderRadius: "6px", 
                    background: row.category === "A" ? "#ef444415" : row.category === "B" ? "#f9731615" : "#3b82f615", 
                    color: row.category === "A" ? "#ef4444" : row.category === "B" ? "#f97316" : "#3b82f6", 
                    fontWeight: 700 
                  }}>
                    Category {row.category}
                  </span>
                </td>
                <td><strong>{row.potential}</strong></td>
                <td>{row.frequency}</td>
                <td>
                  <span style={{ 
                    padding: "2px 8px", 
                    borderRadius: "999px", 
                    fontSize: "11px", 
                    fontWeight: 600, 
                    background: row.status === "Active" ? "#10b98115" : "#ef444415", 
                    color: row.status === "Active" ? "#10b981" : "#ef4444",
                    border: row.status === "Active" ? "1px solid #10b98125" : "1px solid #ef444425"
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
                  <button className="subdivision-danger-button" onClick={() => handleDeactivate(row.id)} type="button" disabled={row.status === "Inactive"}>
                    <Ban size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No classifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
