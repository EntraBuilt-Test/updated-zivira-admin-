"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, X, Ban } from "lucide-react";
import { useState } from "react";

type AddressRow = {
  id: string;
  clinicName: string;
  address: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
};

const initialAddresses: AddressRow[] = [];

function AddressForm({ row, onSave, onBack }: { row: any; onSave: (r: AddressRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<AddressRow>({
    id: row.id ?? "",
    clinicName: row.clinicName ?? "",
    address: row.address ?? "",
    area: row.area ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country ?? "India",
    pinCode: row.pinCode ?? ""
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Address Master"
  description="Create and manage doctor clinic and hospital locations."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Address</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by clinic name or city..."
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
              <th>Clinic Name</th>
              <th>Address</th>
              <th>Area</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>PIN Code</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td><strong style={{ color: "var(--ink)" }}>{row.clinicName}</strong></td>
                <td>{row.address}</td>
                <td>{row.area}</td>
                <td>{row.city}</td>
                <td>{row.state}</td>
                <td>{row.country}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", background: "#f3f4f6", fontSize: "12px", fontWeight: 600, color: "#374151" }}>{row.pinCode}</span></td>
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
                <td colSpan={9} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No addresses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
