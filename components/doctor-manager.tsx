"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, X, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";

type ClassRow = {
  id: string;
  category: "A" | "B" | "C";
  potential: "High" | "Medium" | "Low";
  frequency: "Weekly" | "Twice a Month" | "Fortnightly" | "Monthly" | "Once in Two Months" | "Quarterly";
  status: "Active" | "Inactive";
};

const initialClassifications: ClassRow[] = [];

function ClassForm({ row, onSave, onBack }: { row: any; onSave: (r: ClassRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<ClassRow>({
    id: row.id ?? "",
    category: row.category ?? "A",
    potential: row.potential ?? "High",
    frequency: row.frequency ?? "Weekly",
    status: row.status ?? "Active"
  });

  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>{isEdit ? "Edit Classification" : "Add Classification"}</h2>
          <p>Configure doctor category, business potential, and visit frequency rules.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      <div className="subdivision-form-card">
        <label className="field">
          <span>Doctor Category</span>
          <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })}>
            <option value="A">A (High-value doctor)</option>
            <option value="B">B (Moderate-value doctor)</option>
            <option value="C">C (Low-value doctor)</option>
          </select>
        </label>
        <label className="field">
          <span>Potential</span>
          <select className="input" value={form.potential} onChange={e => setForm({ ...form, potential: e.target.value as any })}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
        <label className="field">
          <span>Visit Frequency</span>
          <select className="input" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as any })}>
            <option value="Weekly">Weekly (4 visits/month)</option>
            <option value="Twice a Month">Twice a Month (2 visits/month)</option>
            <option value="Fortnightly">Fortnightly (Every 15 days)</option>
            <option value="Monthly">Monthly (1 visit/month)</option>
            <option value="Once in Two Months">Once in Two Months (Every 60 days)</option>
            <option value="Quarterly">Quarterly (Once every 3 months)</option>
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
        <button className="button" style={{ marginTop: "12px" }} onClick={() => onSave(form)} type="button">
          Add Classification
        </button>
      </div>
    </section>
  );
}

export function DoctorManager() {
  const [classifications, setClassifications] = useState<ClassRow[]>(initialClassifications);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<ClassRow | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  const filtered = classifications.filter(
    (c) =>
      (statusFilter === "All" ||
        (statusFilter === "Active" && c.status === "Active") ||
        (statusFilter === "Inactive" && c.status === "Inactive")) &&
      (c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.potential.toLowerCase().includes(search.toLowerCase()) ||
        c.frequency.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(form: ClassRow) {
    if (view === "add") {
      const newClass = {
        ...form,
        id: `CL${String(classifications.length + 1).padStart(3, "0")}`
      };
      setClassifications([...classifications, newClass]);
    } else {
      setClassifications(classifications.map(c => c.id === form.id ? { ...form } : c));
    }
    setView("list");
  }

  function handleDeactivate(id: string) {
    setClassifications(classifications.map(c => c.id === id ? { ...c, status: "Inactive" as const } : c));
  }

  if (view === "add") return <ClassForm row={{}} onSave={handleSave} onBack={() => setView("list")} />;
  if (view === "edit" && editTarget) return <ClassForm row={editTarget} onSave={handleSave} onBack={() => setView("list")} />;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>Doctor Classification</h2>
          <p>Create and manage doctor visit classifications based on sales potential.</p>
        </div>
        <div className="subdivision-actions">
          
          <button className="button" onClick={() => setView("add")} type="button">Add Classification</button>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <input className="input w-full max-w-md"
          placeholder="Search by category, potential or frequency..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctor Category</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Potential</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Visit Frequency</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" style={{ minWidth: "130px", position: "relative" }}>
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
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" colSpan={2}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((row) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <span style={{ 
                    padding: "4px 10px", 
                    borderRadius: "6px", 
                    background: row.category === "A" ? "#ef444415" : row.category === "B" ? "#f9731615" : "#3b82f615", 
                    color: row.category === "A" ? "#ef4444" : row.category === "B" ? "#f97316" : "#3b82f6", 
                    fontWeight: 700 
                  }}>
                    Category {row.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong>{row.potential}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.frequency}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
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
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} type="button">
                    <Pencil size={15} />
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <button className="p-1.5 rounded text-text-muted hover:!text-red-500 hover:!bg-red-50 hover:!shadow-md hover:!shadow-red-500 transition-all inline-flex items-center justify-center cursor-pointer pointer-events-auto" onClick={() => handleDeactivate(row.id)} type="button" disabled={row.status === "Inactive"}>
                    <Ban size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No classifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
