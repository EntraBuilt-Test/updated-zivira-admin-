"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, X, ChevronDown, Ban } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient, type DoctorCategory } from "@/lib/api-client";
import { PageHeader } from "@/components/page-components";

type FormRow = {
  id: string;
  doctorName: string;
  qualification: string;
  specialty: string;
  registrationNumber: string;
  status: "ACTIVE" | "INACTIVE";
};

const emptyFormRow: FormRow = {
  id: "",
  doctorName: "",
  qualification: "",
  specialty: "",
  registrationNumber: "",
  status: "ACTIVE"
};

function DoctorForm({ row, onSave, onBack, saving, error, nextCode }: { row: any; onSave: (f: FormRow) => void; onBack: () => void; saving: boolean; error: string | null; nextCode?: string }) {
  const [form, setForm] = useState<FormRow>({
    id: row.id ?? "",
    doctorName: row.categoryName ?? "",
    qualification: row.qualification ?? "",
    specialty: row.specialty ?? "",
    registrationNumber: row.registrationNumber ?? "",
    status: row.status ?? "ACTIVE"
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Doctor Master"
  description="Create and manage general doctor profiles."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Doctor</button>
    </>
  }
/>

      {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <div className="subdivision-stats" style={{ marginBottom:"20px" }}>
        <article><span>Total Doctors</span><strong>{rows.length}</strong></article>
        <article><span>Active Doctors</span><strong>{rows.filter(r => r.status === "ACTIVE").length}</strong></article>
      </div>

      <div className="subdivision-table-card" style={{ overflowX: "auto", paddingBottom: "120px" }}>
        <table className="subdivision-table">
          <thead>
            <tr>
              <th>Doctor Code</th>
              <th>Doctor Name</th>
              <th>Qualification</th>
              <th>Specialty</th>
              <th>Registration Number</th>
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
              <th>Inline Edit</th>
              <th>Edit</th>
              <th>Inactive</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} style={{ textAlign:"center", color:"var(--muted)", padding:"32px" }}>Loading...</td></tr>}
            {!loading && rows.map((row, i) => {
              const editing = inlineEditId === row.id && draftRow;
              return (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>DOC{String(i + 1).padStart(4, "0")}</td>
                  <td>
                    {editing
                      ? <input className="subdivision-inline-input" value={draftRow.doctorName} onChange={e => setDraftRow({ ...draftRow, doctorName: e.target.value })} />
                      : <strong style={{ color:"var(--ink)" }}>{row.categoryName}</strong>
                    }
                  </td>
                  <td>
                    {editing
                      ? <input className="subdivision-inline-input" value={draftRow.qualification} onChange={e => setDraftRow({ ...draftRow, qualification: e.target.value })} />
                      : (row.qualification || "—")
                    }
                  </td>
                  <td>
                    {editing
                      ? <input className="subdivision-inline-input" value={draftRow.specialty} onChange={e => setDraftRow({ ...draftRow, specialty: e.target.value })} />
                      : (row.specialty || "—")
                    }
                  </td>
                  <td>
                    {editing
                      ? <input className="subdivision-inline-input" value={draftRow.registrationNumber} onChange={e => setDraftRow({ ...draftRow, registrationNumber: e.target.value })} />
                      : (row.registrationNumber || "—")
                    }
                  </td>
                  <td>
                    <span style={{ 
                      padding: "2px 8px", 
                      borderRadius: "999px", 
                      fontSize: "11px", 
                      fontWeight: 600, 
                      background: row.status === "ACTIVE" ? "#10b98115" : "#ef444415", 
                      color: row.status === "ACTIVE" ? "#10b981" : "#ef4444",
                      border: row.status === "ACTIVE" ? "1px solid #10b98125" : "1px solid #ef444425"
                    }}>
                      {row.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {editing ? (
                      <span className="subdivision-inline-actions">
                        <button aria-label="Update" onClick={saveInline} title="Update" type="button" disabled={saving}></button>
                        <button aria-label="Cancel" onClick={cancelInline} title="Cancel" type="button" disabled={saving}><X size={15} /></button>
                      </span>
                    ) : (
                      <button className="subdivision-icon-button" onClick={() => beginInline(row)} title="Inline Edit" type="button"><Pencil size={15} /></button>
                    )}
                  </td>
                  <td>
                    <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} title="Edit" type="button"><Pencil size={15} /></button>
                  </td>
                  <td>
                    <button className="subdivision-danger-button" onClick={() => handleDeactivate(row.id)} title="Deactivate" type="button" disabled={row.status === "INACTIVE"}><Ban /></button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && <tr><td colSpan={9} style={{ textAlign:"center", color:"var(--muted)", padding:"32px" }}>No doctors yet</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
