"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, Ban } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-components";

type ContactRow = {
  id: string;
  doctorName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  specialty: string;
};

const initialContacts: ContactRow[] = [];

function ContactForm({ row, onSave, onBack }: { row: any; onSave: (r: ContactRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ContactRow>({
    id: row.id ?? "",
    doctorName: row.doctorName ?? "",
    mobile: row.mobile ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    specialty: row.specialty ?? ""
  });

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Contact Details"
  description="Create and manage doctor phone numbers and email addresses."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Contact</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by doctor or email..."
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
              <th>WhatsApp</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td><strong style={{ color: "var(--ink)" }}>{row.doctorName}</strong></td>
                <td>{row.mobile}</td>
                <td>{row.whatsapp}</td>
                <td>{row.email}</td>
                <td>{row.specialty}</td>
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
                <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No contact details found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
