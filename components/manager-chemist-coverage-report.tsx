"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";

type ChemistCoverageReportRow = {
  id: string;
  chemist: string;
  type: "Core" | "Non Core";
  mr: string;
  plannedVisits: number;
  actualVisits: number;
  missedVisits: number;
  coveragePercentage: number;
  status: "Visited" | "Pending" | "Missed";
};

const initialReports: ChemistCoverageReportRow[] = [];

function ReportForm({ row, onSave, onBack }: { row: any; onSave: (r: ChemistCoverageReportRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ChemistCoverageReportRow>({
    id: row.id ?? "",
    chemist: row.chemist ?? "",
    type: row.type ?? "Core",
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
  title="Chemist Coverage Report"
  description="Review comprehensive retailer pharmacy coverage metrics, targets and visitation logs."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Log</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by chemist or MR..."
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
              <th>Chemist</th>
              <th style={{ minWidth: "150px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Type</span>
                  <button
                    type="button"
                    onClick={() => setTypeFilterOpen(!typeFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {typeFilterOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "130px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Core", "Non Core"].map(t => (
                      <button key={t} type="button" onClick={() => { setTypeFilter(t); setTypeFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: typeFilter === t ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: typeFilter === t ? 600 : 400 }}>
                        {t}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setTypeFilter("All"); setTypeFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
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
                <td><strong style={{ color: "var(--ink)" }}>{row.chemist}</strong></td>
                <td>{row.type}</td>
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
                <td colSpan={10} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No chemist coverage logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
