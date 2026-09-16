"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
import { BackButton } from "@/components/back-button";

type LicenseRow = {
  id: string;
  drugLicense: string;
  expiryDate: string;
  status: "Active" | "Inactive";
};

const initialLicenses: LicenseRow[] = [];

function LicenseForm({ row, onSave, onBack }: { row: any; onSave: (r: LicenseRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<LicenseRow>({
    id: row.id ?? "",
    drugLicense: row.drugLicense ?? "",
    expiryDate: row.expiryDate ?? new Date().toISOString().split("T")[0],
    status: row.status ?? "Active"
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>{isEdit ? "Edit License" : "Add License"}</h2>
          <p>Maintain general registration and license validation profiles.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button">
          <RotateCcw size={16} /> Back
        </button>
      </div>
      <div className="subdivision-form-card">
        <label className="field">
          <span>* Drug License</span>
          <input value={form.drugLicense} onChange={e => setForm({ ...form, drugLicense: e.target.value })} placeholder="e.g. DL-12345/2026" />
        </label>
        <label className="field">
          <span>* Expiry Date</span>
          <input
            type="date"
            value={form.expiryDate}
            onChange={e => setForm({ ...form, expiryDate: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", outline: "none", fontSize: "14px", background: "var(--panel)" }}
          />
        </label>
        <label className="field">
          <span>Status</span>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", outline: "none", fontSize: "14px", background: "var(--panel)" }}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
        <button
          className="button"
          style={{ marginTop: "12px" }}
          onClick={() => onSave(form)}
          type="button"
          disabled={!form.drugLicense.trim()}
        >
          <Check size={16} /> Save License
        </button>
      </div>
    </section>
  );
}

export function LicenseDetailsMaster() {
  const [list, setList] = useState<LicenseRow[]>(initialLicenses);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<LicenseRow | null>(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  const filtered = list.filter(
    (item) =>
      (statusFilter === "All" || item.status === statusFilter) &&
      (item.drugLicense.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(form: LicenseRow) {
    if (view === "add") {
      const newRow = {
        ...form,
        id: `LIC${String(list.length + 1).padStart(3, "0")}`
      };
      setList([...list, newRow]);
    } else {
      setList(list.map((item) => (item.id === form.id ? { ...form } : item)));
    }
    setView("list");
  }

  function handleDelete(id: string) {
    setList(list.filter((item) => item.id !== id));
  }

  if (view === "add") return <LicenseForm row={{}} onSave={handleSave} onBack={() => setView("list")} />;
  if (view === "edit" && editTarget) return <LicenseForm row={editTarget} onSave={handleSave} onBack={() => setView("list")} />;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>License Details</h2>
          <p>Configure general profiles, mappings, and status settings.</p>
        </div>
        <div className="subdivision-actions">
          <BackButton />
          
          <button className="button" onClick={() => setView("add")} type="button">Add License</button>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by drug license..."
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

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Drug License</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Expiry Date</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" style={{ minWidth: "140px", position: "relative" }}>
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
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" colSpan={2}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((row) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color: "var(--ink)" }}>{row.drugLicense}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{formatDate(row.expiryDate)}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
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
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} type="button">
                    <Pencil size={15} />
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <button className="p-1.5 rounded text-text-muted hover:!text-red-500 hover:!bg-red-50 hover:!shadow-md hover:!shadow-red-500 transition-all inline-flex items-center justify-center cursor-pointer pointer-events-auto" onClick={() => handleDelete(row.id)} type="button">
                    <Ban size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No licenses configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
