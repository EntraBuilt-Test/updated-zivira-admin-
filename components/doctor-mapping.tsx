"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-components";

type MappingRow = {
  id: string;
  doctorName: string;
  division: string;
  hq: string;
  patch: string;
  mr: string;
  am: string;
  status: "Active" | "Inactive";
};

const initialMappings: MappingRow[] = [];

function MappingForm({ row, onSave, onBack }: { row: any; onSave: (r: MappingRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<MappingRow>({
    id: row.id ?? "",
    doctorName: row.doctorName ?? "",
    division: row.division ?? "Zivira",
    hq: row.hq ?? "Chennai Central HQ",
    patch: row.patch ?? "T. Nagar",
    mr: row.mr ?? "Rahul Sharma",
    am: row.am ?? "Priya Nair",
    status: row.status ?? "Active"
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Doctor Mapping"
  description="Map doctors to divisions, headquarters, patches, and field force supervisors."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Mapping</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by doctor or territory..."
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
              <th>S.No</th>
              <th>Doctor Name</th>
              <th>Division</th>
              <th>HQ</th>
              <th>Patch</th>
              <th>Medical Representative</th>
              <th>Area Manager</th>
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
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={row.id}>
                <td style={{ color: "var(--muted)", fontWeight: 500 }}>{idx + 1}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.doctorName}</strong></td>
                <td>{row.division}</td>
                <td>{row.hq}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", background: "#f3f4f6", fontSize: "12px", fontWeight: 600, color: "#374151" }}>{row.patch}</span></td>
                <td>{row.mr}</td>
                <td>{row.am}</td>
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
                  <button className="subdivision-danger-button" onClick={() => handleDeactivate(row.id)} type="button">
                    <Ban />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No mappings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
