"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
import { PageHeader } from "@/components/page-components";

type SurveyRow = {
  id: string;
  surveyDate: string;
  employee: string;
  hq: string;
  patch: string;
  chemist: string;
  competitorCompany: string;
  competitorBrand: string;
  competitorProduct: string;
  competitorMrp: number;
  availability: "Available" | "Out of Stock" | "Short Supply";
  feedback: string;
  remarks: string;
};

const initialSurveys: SurveyRow[] = [];

function SurveyForm({ row, onSave, onBack }: { row: any; onSave: (r: SurveyRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<SurveyRow>({
    id: row.id ?? "",
    surveyDate: row.surveyDate ?? new Date().toISOString().split("T")[0],
    employee: row.employee ?? "",
    hq: row.hq ?? "Chennai Central HQ",
    patch: row.patch ?? "",
    chemist: row.chemist ?? "",
    competitorCompany: row.competitorCompany ?? "",
    competitorBrand: row.competitorBrand ?? "",
    competitorProduct: row.competitorProduct ?? "",
    competitorMrp: row.competitorMrp ?? 0,
    availability: row.availability ?? "Available",
    feedback: row.feedback ?? "",
    remarks: row.remarks ?? ""
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Daily MR Work"
  title="Market Survey"
  description="Collect and review drug availability and competitor price logs."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Survey</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by employee, chemist or brand..."
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
              <th>Survey Date</th>
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
              <th>Chemist</th>
              <th>Competitor Company</th>
              <th>Competitor Brand</th>
              <th>Competitor Product</th>
              <th>Competitor MRP</th>
              <th style={{ minWidth: "150px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Availability</span>
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilterOpen(!availabilityFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {availabilityFilterOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "140px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Available", "Out of Stock", "Short Supply"].map(av => (
                      <button key={av} type="button" onClick={() => { setAvailabilityFilter(av); setAvailabilityFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: availabilityFilter === av ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: availabilityFilter === av ? 600 : 400 }}>
                        {av}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setAvailabilityFilter("All"); setAvailabilityFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th>Feedback</th>
              <th>Remarks</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.surveyDate)}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.employee}</strong></td>
                <td>{row.hq}</td>
                <td>{row.patch}</td>
                <td>{row.chemist}</td>
                <td>{row.competitorCompany}</td>
                <td>{row.competitorBrand}</td>
                <td>{row.competitorProduct}</td>
                <td style={{ fontWeight: 600 }}>₹{row.competitorMrp.toFixed(2)}</td>
                <td>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.availability === "Available" ? "#dcfce7" : row.availability === "Out of Stock" ? "#fee2e2" : "#fef9c3",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.availability === "Available" ? "#15803d" : row.availability === "Out of Stock" ? "#b91c1c" : "#a16207"
                  }}>
                    {row.availability}
                  </span>
                </td>
                <td>{row.feedback}</td>
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
                <td colSpan={14} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No survey records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
