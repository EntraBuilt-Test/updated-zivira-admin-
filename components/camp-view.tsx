"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
import { PageHeader } from "@/components/page-components";

type CampRow = {
  id: string;
  campCode: string;
  campName: string;
  campDate: string;
  hospital: string;
  doctor: string;
  organizer: string;
  noOfPatients: number;
  productsDisplayed: string;
  remarks: string;
  status: "Active" | "Inactive";
};

const initialCamps: CampRow[] = [];

function CampForm({ row, onSave, onBack }: { row: any; onSave: (r: CampRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<CampRow>({
    id: row.id ?? "",
    campCode: row.campCode ?? "",
    campName: row.campName ?? "",
    campDate: row.campDate ?? new Date().toISOString().split("T")[0],
    hospital: row.hospital ?? "",
    doctor: row.doctor ?? "",
    organizer: row.organizer ?? "",
    noOfPatients: row.noOfPatients ?? 0,
    productsDisplayed: row.productsDisplayed ?? "",
    remarks: row.remarks ?? "",
    status: row.status ?? "Active"
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Daily MR Work"
  title="Camp"
  description="Organize and review medical camps details."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Camp</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by camp name, code or organizer..."
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
              <th>Camp Code</th>
              <th>Camp Name</th>
              <th>Camp Date</th>
              <th>Hospital</th>
              <th>Doctor</th>
              <th>Organizer</th>
              <th>No. of Patients</th>
              <th>Products Displayed</th>
              <th>Remarks</th>
              <th style={{ minWidth: "130px", position: "relative" }}>
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
                    {["Active", "Inactive"].map(st => (
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
                <td>{row.campCode}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.campName}</strong></td>
                <td>{formatDate(row.campDate)}</td>
                <td>{row.hospital}</td>
                <td>{row.doctor}</td>
                <td>{row.organizer}</td>
                <td style={{ fontWeight: 600 }}>{row.noOfPatients}</td>
                <td>{row.productsDisplayed}</td>
                <td>{row.remarks}</td>
                <td>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.status === "Active" ? "#dcfce7" : "#fee2e2",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.status === "Active" ? "#15803d" : "#b91c1c"
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
                <td colSpan={12} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No medical camp records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
