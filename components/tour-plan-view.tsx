"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
import { PageHeader } from "@/components/page-components";

type TourPlanRow = {
  id: string;
  tourDate: string;
  employee: string;
  hq: string;
  patch: string;
  plannedDoctors: string;
  plannedChemists: string;
  plannedHospitals: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
};

const initialTourPlans: TourPlanRow[] = [];

function TourPlanForm({ row, onSave, onBack }: { row: any; onSave: (r: TourPlanRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<TourPlanRow>({
    id: row.id ?? "",
    tourDate: row.tourDate ?? new Date().toISOString().split("T")[0],
    employee: row.employee ?? "",
    hq: row.hq ?? "Chennai Central HQ",
    patch: row.patch ?? "",
    plannedDoctors: row.plannedDoctors ?? "",
    plannedChemists: row.plannedChemists ?? "",
    plannedHospitals: row.plannedHospitals ?? "",
    purpose: row.purpose ?? "",
    status: row.status ?? "Pending"
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Daily MR Work"
  title="Tour Plan"
  description="Create and manage future field force routes and physician coverage."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Tour Plan</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by employee, patch or HQ..."
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
              <th>Tour Date</th>
              <th>Employee</th>
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
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "160px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Chennai Central HQ", "Coimbatore HQ", "Madurai HQ"].map(hq => (
                      <button key={hq} type="button" onClick={() => { setHqFilter(hq); setHqFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: hqFilter === hq ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: hqFilter === hq ? 600 : 400 }}>
                        {hq}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setHqFilter("All"); setHqFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th>Patch</th>
              <th>Planned Doctors</th>
              <th>Planned Chemists</th>
              <th>Planned Hospitals</th>
              <th>Purpose</th>
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
                <td>{formatDate(row.tourDate)}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.employee}</strong></td>
                <td>{row.hq}</td>
                <td>{row.patch}</td>
                <td>{row.plannedDoctors}</td>
                <td>{row.plannedChemists}</td>
                <td>{row.plannedHospitals}</td>
                <td>{row.purpose}</td>
                <td>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.status === "Approved" ? "#dcfce7" : row.status === "Rejected" ? "#fee2e2" : "#f3f4f6",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.status === "Approved" ? "#15803d" : row.status === "Rejected" ? "#b91c1c" : "#374151"
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
                <td colSpan={11} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No tour plan records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
