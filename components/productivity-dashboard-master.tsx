"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, Ban } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/back-button";

type ProductivityRow = {
  id: string;
  rank: number;
  employee: string;
  hq: string;
  doctorCalls: number;
  tourCompliance: number;
  productivityScore: number;
};

const initialData: ProductivityRow[] = [];

function ProductivityDashboardForm({ row, onSave, onBack }: { row: any; onSave: (r: ProductivityRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ProductivityRow>({
    id: row.id ?? "",
    rank: row.rank ?? 1,
    employee: row.employee ?? "",
    hq: row.hq ?? "",
    doctorCalls: row.doctorCalls ?? 0,
    tourCompliance: row.tourCompliance ?? 0,
    productivityScore: row.productivityScore ?? 0,
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Manager Activity Report"
  title="Productivity Dashboard"
  description="Configure general profiles, mappings, and status settings."
  action={
    <>
<BackButton />
          
          <button className="button" onClick={() => setView("add")} type="button">Add Data</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by employee or HQ..."
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
              <th>Rank</th>
              <th>Employee</th>
              <th>HQ</th>
              <th>Doctor Calls</th>
              <th>Tour Compliance</th>
              <th>Productivity Score</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.rank}</td>
                <td><strong style={{ color: "var(--ink)" }}>{row.employee}</strong></td>
                <td>{row.hq}</td>
                <td>{row.doctorCalls}</td>
                <td>{row.tourCompliance}%</td>
                <td>{row.productivityScore}</td>
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
                <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No productivity data configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
