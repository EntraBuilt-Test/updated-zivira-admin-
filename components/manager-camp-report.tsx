"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
import { PageHeader } from "@/components/page-components";

type CampReportRow = {
  id: string;
  campDate: string;
  campName: string;
  hospital: string;
  doctor: string;
  mr: string;
  patients: number;
  productsPromoted: string;
  samples: string;
  status: "Completed" | "Pending" | "Cancelled";
};

const initialReports: CampReportRow[] = [];

function ReportForm({ row, onSave, onBack }: { row: any; onSave: (r: CampReportRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<CampReportRow>({
    id: row.id ?? "",
    campDate: row.campDate ?? new Date().toISOString().split("T")[0],
    campName: row.campName ?? "",
    hospital: row.hospital ?? "",
    doctor: row.doctor ?? "",
    mr: row.mr ?? "",
    patients: row.patients ?? 0,
    productsPromoted: row.productsPromoted ?? "",
    samples: row.samples ?? "",
    status: row.status ?? "Pending"
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Manager Activity Report"
  title="Camp Report"
  description="Review comprehensive field force daily medical camp reports."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Report</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by camp, hospital, doctor or MR..."
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
              <th>Camp Date</th>
              <th>Camp Name</th>
              <th>Hospital</th>
              <th>Doctor</th>
              <th>MR</th>
              <th>Patients</th>
              <th>Products Promoted</th>
              <th>Samples</th>
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
                    {["Pending", "Completed", "Cancelled"].map(st => (
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
                <td>{formatDate(row.campDate)}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.campName}</strong></td>
                <td>{row.hospital}</td>
                <td>{row.doctor}</td>
                <td>{row.mr}</td>
                <td style={{ fontWeight: 600 }}>{row.patients}</td>
                <td>{row.productsPromoted}</td>
                <td>{row.samples}</td>
                <td>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.status === "Completed" ? "#dcfce7" : row.status === "Cancelled" ? "#fee2e2" : "#f3f4f6",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.status === "Completed" ? "#15803d" : row.status === "Cancelled" ? "#b91c1c" : "#374151"
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
                  No camp reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
