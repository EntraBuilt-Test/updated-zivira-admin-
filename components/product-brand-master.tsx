"use client";

import { Check, Pencil, Plus, RefreshCw, RotateCcw, SlidersHorizontal, Trash2, X, ChevronDown, Ban } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient, type ProductBrand } from "@/lib/api-client";

// Mock database mappings to initialize the additional fields for existing brands
const initialBrandDetails: Record<string, { division: string; molecule: string; therapy: string }> = {
  "BEPREX": { division: "Astra", molecule: "BEPOTASTINE BESILATE", therapy: "ANTI-ALLERGIC" },
  "BRINZIA": { division: "Astra", molecule: "BRINZOLAMIDE AND BRIMONIDINE TARTRATE", therapy: "ANTI-GLAUCOMA" },
  "BRITIVIN": { division: "Astra", molecule: "BRIMONIDINE TARTRATE AND TIMOLOL MALEATE", therapy: "ANTI-GLAUCOMA" },
  "CIZIA": { division: "Astra", molecule: "CYCLOSPORINE IP", therapy: "TEAR SUBSTITUTE" },
  "DEXNOVA": { division: "Astra", molecule: "DEXAMETHASONE SODIUM PHOSPHATE IP", therapy: "CORTICOSTEROID" },
  "DORVISA T": { division: "Astra", molecule: "DORZOLAMIDE HYDROCHLORIDE IP AND TIMOLOL MALEATE IP", therapy: "ANTI-GLAUCOMA" },
  "DUCIDROP": { division: "Astra", molecule: "HYDROXYPROPYL METHYLCELLULOSE IP", therapy: "TEAR SUBSTITUTE" },
  "DECIRA GEL": { division: "Astra", molecule: "HYDROXYPROPYL METHYLCELLULOSE IP", therapy: "TEAR SUBSTITUTE" },
  "ENVISA": { division: "Astra", molecule: "LUTEIN, ASTAXANTHIN AND L-GLUTATHIONE", therapy: "ANTI-OXIDANT" },
  "FOMIRA": { division: "Astra", molecule: "POLYETHYLENE GLYCOL AND PROPYLENE GLYCOL IP", therapy: "TEAR SUBSTITUTE" },
  "LATOPROST": { division: "Astra", molecule: "LATANOPROST", therapy: "ANTI-GLAUCOMA" },
  "LOTIVIZ": { division: "Astra", molecule: "LOTEPREDNOL ETABONATE", therapy: "CORTICOSTEROID" },
  "MACUMER": { division: "Aura", molecule: "LUTEIN, ZEAXANTHIN AND MESOZEAXANTHIN", therapy: "ANTI-OXIDANT" },
  "NEPAWEL": { division: "Aura", molecule: "NEPAFENAC", therapy: "NSAID" },
  "PATVIRA": { division: "Astra", molecule: "OLOPATADINE HYDROCHLORIDE IP", therapy: "ANTI-ALLERGIC" },
  "PREDIRA": { division: "Astra", molecule: "PREDNISOLONE ACETATE IP", therapy: "CORTICOSTEROID" },
  "STRIOS": { division: "Astra", molecule: "PURIFIED WATER GAMMA STERILISED WIPES", therapy: "STERILE WIPES" },
  "TIMOBEST": { division: "Astra", molecule: "TIMOLOL MALEATE IP", therapy: "ANTI-GLAUCOMA" },
  "TIZTA": { division: "Astra", molecule: "SODIUM HYALURONATE BP", therapy: "TEAR SUBSTITUTE" },
  "TIZTA LIQUIGEL": { division: "Astra", molecule: "SODIUM HYALURONATE BP, TREHALOSE AND CARBOMER", therapy: "TEAR SUBSTITUTE" },
  "TOBRAWIN": { division: "Astra", molecule: "TOBRAMYCIN SULFATE USP", therapy: "ANTI-INFECTIVE" },
  "TOBRAWIN LP": { division: "Astra", molecule: "TOBRAMYCIN SULFATE USP AND LOTEPREDNOL ETABONATE", therapy: "ANTI-INFECTIVE+STEROID COMB" }
};

type FormRow = {
  id: string;
  brandName: string;
  molecule: string;
  therapy: string;
  division: string;
  status: "ACTIVE" | "INACTIVE";
};

const emptyFormRow: FormRow = {
  id: "",
  brandName: "",
  molecule: "",
  therapy: "",
  division: "Astra",
  status: "ACTIVE"
};

function BrandForm({ row, onSave, onBack, saving, error }: { row: any; onSave: (row: FormRow) => void; onBack: () => void; saving: boolean; error: string | null }) {
  const [form, setForm] = useState<FormRow>({
    id: row.id ?? "",
    brandName: row.brandName ?? "",
    molecule: row.molecule ?? "",
    therapy: row.therapy ?? "",
    division: row.division ?? "Astra",
    status: row.status ?? "ACTIVE"
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Brand Master"
  description="Create and manage product brands used across the platform."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Brand</button>
    </>
  }
/>

      {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <div className="subdivision-stats" style={{ marginBottom:"20px" }}>
        <article><span>Total Brands</span><strong>{rows.length}</strong></article>
        <article><span>Active Brands</span><strong>{rows.filter(r => r.status === "ACTIVE").length}</strong></article>
      </div>

      <div className="subdivision-table-card" style={{ overflowX: "auto", paddingBottom: "120px" }}>
        <table className="subdivision-table">
          <thead>
            <tr>
              <th>Brand Code</th>
              <th>Brand Name</th>
              <th>Molecule</th>
              <th>Therapy</th>
              <th>Division</th>
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
            {loading && <tr><td colSpan={8} style={{ textAlign:"center", color:"var(--muted)", padding:"32px" }}>Loading...</td></tr>}
            {!loading && rows.map((row, i) => {
              return (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>ZIV-BR-{String(i + 1).padStart(3, "0")}</td>
                  <td>
                    <strong style={{ color:"var(--ink)" }}>{row.brandName}</strong>
                  </td>
                  <td>
                    {row.molecule || "—"}
                  </td>
                  <td>
                    {row.therapy || "—"}
                  </td>
                  <td>
                    {row.division}
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
                    <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} title="Edit" type="button"><Pencil size={15} /></button>
                  </td>
                  <td>
                    <button className="subdivision-danger-button" onClick={() => handleDeactivate(row.id)} title="Deactivate" type="button" disabled={row.status === "INACTIVE"}><Ban /></button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && <tr><td colSpan={8} style={{ textAlign:"center", color:"var(--muted)", padding:"32px" }}>No product brands yet</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
