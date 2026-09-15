"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, X, ChevronDown, Ban } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient, type ProductCatalogItem } from "@/lib/api-client";

type FormFields = {
  id: string;
  productCode: string;
  productName: string;
  brandName: string;
  strength: string;
  pack: string;
  sku: string;
  division: string;
  uom: string;
  status: "ACTIVE" | "INACTIVE";
};

const emptyFormRow: FormFields = {
  id: "",
  productCode: "",
  productName: "",
  brandName: "",
  strength: "",
  pack: "",
  sku: "",
  division: "Zivira",
  uom: "Tube",
  status: "ACTIVE"
};

function ProductForm({ row, onSave, onBack, saving, error }: { row: any; onSave: (f: FormFields) => void; onBack: () => void; saving: boolean; error: string | null }) {
  const [form, setForm] = useState<FormFields>({
    id: row.id ?? "",
    productCode: row.productCode ?? "",
    productName: row.productName ?? "",
    brandName: row.brandName ?? "",
    strength: row.strength ?? "",
    pack: row.pack ?? "",
    sku: row.sku ?? "",
    division: row.division ?? "Zivira",
    uom: row.uom ?? "Tube",
    status: row.status ?? "ACTIVE"
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Product Master"
  description="Create and manage the master product catalog."
  action={
    <>
<button className="button button-secondary" type="button">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <button className="button" onClick={() => setView("add")} type="button">
            Add Product
          </button>
    </>
  }
/>

      {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <div className="subdivision-stats" style={{ marginBottom: "20px" }}>
        <article>
          <span>Total Products</span>
          <strong>{rows.length}</strong>
        </article>
        <article>
          <span>Active Products</span>
          <strong>{rows.filter(r => r.status === "ACTIVE").length}</strong>
        </article>
      </div>

      <div className="subdivision-table-card" style={{ overflowX: "auto", paddingBottom: "120px" }}>
        <table className="subdivision-table">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Brand</th>
              <th>Strength</th>
              <th>Pack</th>
              <th>SKU</th>
              <th>Division</th>
              <th>UOM</th>
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
            {loading && (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && rows.map((row) => {
              return (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>
                    {row.productCode}
                  </td>
                  <td>
                    <strong style={{ color: "var(--ink)" }}>{row.productName}</strong>
                  </td>
                  <td>
                    {row.brandName || "—"}
                  </td>
                  <td>
                    {row.strength || "—"}
                  </td>
                  <td>
                    {row.pack || "—"}
                  </td>
                  <td>
                    {row.sku || "—"}
                  </td>
                  <td>
                    {row.division || "—"}
                  </td>
                  <td>
                    {row.uom || "—"}
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
                    <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} title="Edit" type="button">
                      <Pencil size={15} />
                    </button>
                  </td>
                  <td>
                    <button className="subdivision-danger-button" onClick={() => handleDeactivate(row.id)} title="Deactivate" type="button" disabled={row.status === "INACTIVE"}>
                      <Ban />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={12} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
