"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, X, Ban } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-components";

type DealerMappingRow = {
  id: string;
  doctorName: string;
  mobile: string;
  specialty: string;
  stockistField: string;
  chemistField: string;
  distributorField: string;
};

const initialDealerMappings: DealerMappingRow[] = [];

function DealerMappingForm({ row, onSave, onBack }: { row: any; onSave: (r: DealerMappingRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<DealerMappingRow>({
    id: row.id ?? "",
    doctorName: row.doctorName ?? "",
    mobile: row.mobile ?? "",
    specialty: row.specialty ?? "",
    stockistField: row.stockistField ?? "",
    chemistField: row.chemistField ?? "",
    distributorField: row.distributorField ?? ""
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Dealer Mapping"
  description="Map doctors to local stockists and retail chemists/dealers."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Mapping</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by doctor, stockist or chemist..."
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

      <div className="subdivision-table-card" style={{ overflowX: "auto" }}>
        <table className="subdivision-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Mobile Number</th>
              <th>Speciality</th>
              <th>Stocklist</th>
              <th>Chemist</th>
              <th>Distributor</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                 <td><strong style={{ color: "var(--ink)" }}>{row.doctorName}</strong></td>
                 <td>{row.mobile}</td>
                 <td>{row.specialty}</td>
                 <td>{row.stockistField}</td>
                 <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", background: "#f3f4f6", fontSize: "12px", fontWeight: 600, color: "#374151" }}>{row.chemistField}</span></td>
                 <td>{row.distributorField}</td>
                <td>
                  <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} type="button">
                    <Pencil size={15} />
                  </button>
                </td>
                <td>
                  <button className="subdivision-danger-button" onClick={() => handleDeactivate(row.id)} type="button">
                    <Ban />
                  </button>
                </td>
              </tr>
            ))}
             {filtered.length === 0 && (
               <tr>
                 <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                   No mappings found
                 </td>
               </tr>
             )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
