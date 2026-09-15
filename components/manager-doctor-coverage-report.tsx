"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-components";

type DoctorCoverageReportRow = {
  id: string;
  doctor: string;
  category: "Super Core" | "Core" | "Non Core";
  specialty: string;
  mr: string;
  plannedVisits: number;
  actualVisits: number;
  missedVisits: number;
  coveragePercentage: number;
  status: "Visited" | "Pending" | "Missed";
};

const initialReports: DoctorCoverageReportRow[] = [];

function ReportForm({ row, onSave, onBack }: { row: any; onSave: (r: DoctorCoverageReportRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<DoctorCoverageReportRow>({
    id: row.id ?? "",
    doctor: row.doctor ?? "",
    category: row.category ?? "Core",
    specialty: row.specialty ?? "General Physician",
    mr: row.mr ?? "",
    plannedVisits: row.plannedVisits ?? 0,
    actualVisits: row.actualVisits ?? 0,
    missedVisits: row.missedVisits ?? 0,
    coveragePercentage: row.coveragePercentage ?? 0,
    status: row.status ?? "Pending"
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Manager Activity Report"
  title="Doctor Coverage Report"
  description="Review comprehensive physician coverage metrics, targets and visitation logs."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Log</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by doctor or MR..."
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
              <th>Doctor</th>
              <th style={{ minWidth: "150px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Category</span>
                  <button
                    type="button"
                    onClick={() => setCategoryFilterOpen(!categoryFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {categoryFilterOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "130px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Super Core", "Core", "Non Core"].map(cat => (
                      <button key={cat} type="button" onClick={() => { setCategoryFilter(cat); setCategoryFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: categoryFilter === cat ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: categoryFilter === cat ? 600 : 400 }}>
                        {cat}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setCategoryFilter("All"); setCategoryFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th style={{ minWidth: "160px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Specialty</span>
                  <button
                    type="button"
                    onClick={() => setSpecialtyFilterOpen(!specialtyFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {specialtyFilterOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "160px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["General Physician", "Cardiologist", "Dermatologist", "Pediatrician"].map(spec => (
                      <button key={spec} type="button" onClick={() => { setSpecialtyFilter(spec); setSpecialtyFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: specialtyFilter === spec ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: specialtyFilter === spec ? 600 : 400 }}>
                        {spec}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setSpecialtyFilter("All"); setSpecialtyFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th>MR</th>
              <th>Planned Visits</th>
              <th>Actual Visits</th>
              <th>Missed Visits</th>
              <th>Coverage %</th>
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
                    {["Pending", "Visited", "Missed"].map(st => (
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
                <td><strong style={{ color: "var(--ink)" }}>{row.doctor}</strong></td>
                <td>{row.category}</td>
                <td>{row.specialty}</td>
                <td>{row.mr}</td>
                <td style={{ fontWeight: 600 }}>{row.plannedVisits}</td>
                <td style={{ fontWeight: 600 }}>{row.actualVisits}</td>
                <td style={{ fontWeight: 600 }}>{row.missedVisits}</td>
                <td style={{ fontWeight: 600 }}>{row.coveragePercentage.toFixed(1)}%</td>
                <td>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.status === "Visited" ? "#dcfce7" : row.status === "Missed" ? "#fee2e2" : "#f3f4f6",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.status === "Visited" ? "#15803d" : row.status === "Missed" ? "#b91c1c" : "#374151"
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
                  No doctor coverage logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
