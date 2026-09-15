"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, X, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-components";

type InputRow = {
  id: string;
  inputName: string;
  category: string;
  unit: string;
  status: "Active" | "Inactive";
};

const initialInputs: InputRow[] = [];

function InputForm({ row, onSave, onBack }: { row: any; onSave: (r: InputRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<InputRow>({
    id: row.id ?? "",
    inputName: row.inputName ?? "",
    category: row.category ?? "Active Pharmaceutical Ingredient (API)",
    unit: row.unit ?? "Kg",
    status: row.status ?? "Active"
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Input Master"
  description="Create and manage promotional inputs and gifts for the field force."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Input</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by input name or type..."
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
              <th>Input Code</th>
              <th>Input Name</th>
              <th style={{ minWidth: "180px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Category</span>
                  <button
                    type="button"
                    onClick={() => setCategoryFilterOpen(!categoryFilterOpen)}
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
                {categoryFilterOpen && (
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
                      minWidth: "220px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "4px 0",
                      maxHeight: "200px",
                      overflowY: "auto"
                    }}
                  >
                    {[
                      "Active Pharmaceutical Ingredient (API)",
                      "Excipient",
                      "Solvent",
                      "Packaging Material",
                      "Printing Material",
                      "Cleaning Material",
                      "Laboratory Reagent",
                      "Consumable"
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => { setCategoryFilter(cat); setCategoryFilterOpen(false); }}
                        style={{
                          padding: "6px 12px",
                          textAlign: "left",
                          background: categoryFilter === cat ? "var(--line)" : "none",
                          border: "none",
                          color: "var(--ink)",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: categoryFilter === cat ? 600 : 400
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setCategoryFilter("All"); setCategoryFilterOpen(false); }}
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
              <th style={{ minWidth: "120px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Unit</span>
                  <button
                    type="button"
                    onClick={() => setUnitFilterOpen(!unitFilterOpen)}
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
                {unitFilterOpen && (
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
                      minWidth: "120px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "4px 0",
                      maxHeight: "200px",
                      overflowY: "auto"
                    }}
                  >
                    {[
                      "Kg",
                      "Gram (g)",
                      "mg",
                      "Litre",
                      "mL",
                      "Nos",
                      "Box",
                      "Roll",
                      "Tube",
                      "Bottle",
                      "Sachet"
                    ].map((ut) => (
                      <button
                        key={ut}
                        type="button"
                        onClick={() => { setUnitFilter(ut); setUnitFilterOpen(false); }}
                        style={{
                          padding: "6px 12px",
                          textAlign: "left",
                          background: unitFilter === ut ? "var(--line)" : "none",
                          border: "none",
                          color: "var(--ink)",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: unitFilter === ut ? 600 : 400
                        }}
                      >
                        {ut}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setUnitFilter("All"); setUnitFilterOpen(false); }}
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
                <td style={{ fontWeight: 600 }}>{row.id}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.inputName}</strong></td>
                <td>{row.category}</td>
                <td>{row.unit}</td>
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
                    <Ban />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No inputs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
