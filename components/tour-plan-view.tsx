"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";

type TourPlanRow = {
  id: string;
  tourDate: string;
  employee: string;
  hq: string;
  patch: string;
  plannedDoctors: string;
  plannedChemists: string;
  plannedHospitals: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
};

const initialTourPlans: TourPlanRow[] = [];

function TourPlanForm({ row, onSave, onBack }: { row: any; onSave: (r: TourPlanRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<TourPlanRow>({
    id: row.id ?? "",
    tourDate: row.tourDate ?? new Date().toISOString().split("T")[0],
    employee: row.employee ?? "",
    hq: row.hq ?? "Chennai Central HQ",
    patch: row.patch ?? "",
    plannedDoctors: row.plannedDoctors ?? "",
    plannedChemists: row.plannedChemists ?? "",
    plannedHospitals: row.plannedHospitals ?? "",
    purpose: row.purpose ?? "",
    status: row.status ?? "Pending"
  });

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Daily MR Work</p>
          <h2>{row.id ? "Edit Tour Plan" : "Add Tour Plan"}</h2>
          <p>Define future travel plans and doctor visit schedules.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      <div className="subdivision-form-card">
        <label className="field">
          <span>* Tour Date</span>
          <input type="date" value={form.tourDate} onChange={e => setForm({ ...form, tourDate: e.target.value })} />
        </label>
        <label className="field">
          <span>* Employee Name</span>
          <input value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} placeholder="Rahul Sharma" />
        </label>
        <label className="field">
          <span>HQ</span>
          <select className="input" value={form.hq} onChange={e => setForm({ ...form, hq: e.target.value })}>
            <option value="Chennai Central HQ">Chennai Central HQ</option>
            <option value="Coimbatore HQ">Coimbatore HQ</option>
            <option value="Madurai HQ">Madurai HQ</option>
          </select>
        </label>
        <label className="field">
          <span>Patch</span>
          <input value={form.patch} onChange={e => setForm({ ...form, patch: e.target.value })} placeholder="e.g. T-Nagar" />
        </label>
        <label className="field">
          <span>Planned Doctors</span>
          <input value={form.plannedDoctors} onChange={e => setForm({ ...form, plannedDoctors: e.target.value })} placeholder="Dr. John Doe, Dr. Sarah" />
        </label>
        <label className="field">
          <span>Planned Chemists</span>
          <input value={form.plannedChemists} onChange={e => setForm({ ...form, plannedChemists: e.target.value })} placeholder="Apollo Pharmacy" />
        </label>
        <label className="field">
          <span>Planned Hospitals</span>
          <input value={form.plannedHospitals} onChange={e => setForm({ ...form, plannedHospitals: e.target.value })} placeholder="Apollo Hospital" />
        </label>
        <label className="field">
          <span>Purpose</span>
          <input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Quarterly product presentation" />
        </label>
        <label className="field">
          <span>Status</span>
          <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
        <button className="button" style={{ marginTop: "12px" }} onClick={() => onSave(form)} type="button" disabled={!form.employee.trim()}>
          <Check size={16} /> Save Tour Plan
        </button>
      </div>
    </section>
  );
}

export function TourPlanView() {
  const [list, setList] = useState<TourPlanRow[]>(initialTourPlans);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<TourPlanRow | null>(null);

  const [hqFilter, setHqFilter] = useState<string>("All");
  const [hqFilterOpen, setHqFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  const filtered = list.filter(
    (item) =>
      (hqFilter === "All" || item.hq === hqFilter) &&
      (statusFilter === "All" || item.status === statusFilter) &&
      (item.employee.toLowerCase().includes(search.toLowerCase()) ||
        item.patch.toLowerCase().includes(search.toLowerCase()) ||
        item.hq.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(form: TourPlanRow) {
    if (view === "add") {
      const newRow = {
        ...form,
        id: `TP${String(list.length + 1).padStart(3, "0")}`
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

  if (view === "add") return <TourPlanForm row={{}} onSave={handleSave} onBack={() => setView("list")} />;
  if (view === "edit" && editTarget) return <TourPlanForm row={editTarget} onSave={handleSave} onBack={() => setView("list")} />;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Daily MR Work</p>
          <h2>Tour Plan</h2>
          <p>Create and manage future field force routes and physician coverage.</p>
        </div>
        <div className="subdivision-actions">
          
          <button className="button" onClick={() => setView("add")} type="button">Add Tour Plan</button>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <input className="input w-full max-w-md"
          placeholder="Search by employee, patch or HQ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Tour Date</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Employee</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" style={{ minWidth: "160px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>HQ</span>
                  <button
                    type="button"
                    onClick={() => setHqFilterOpen(!hqFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {hqFilterOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "160px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Chennai Central HQ", "Coimbatore HQ", "Madurai HQ"].map(hq => (
                      <button key={hq} type="button" onClick={() => { setHqFilter(hq); setHqFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: hqFilter === hq ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: hqFilter === hq ? 600 : 400 }}>
                        {hq}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setHqFilter("All"); setHqFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Patch</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Planned Doctors</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Planned Chemists</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Planned Hospitals</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Purpose</th>
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
                    {["Pending", "Approved", "Rejected"].map(st => (
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
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{formatDate(row.tourDate)}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color: "var(--ink)" }}>{row.employee}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.hq}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.patch}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.plannedDoctors}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.plannedChemists}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.plannedHospitals}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.purpose}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: row.status === "Approved" ? "#dcfce7" : row.status === "Rejected" ? "#fee2e2" : "#f3f4f6",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: row.status === "Approved" ? "#15803d" : row.status === "Rejected" ? "#b91c1c" : "#374151"
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
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={11} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No tour plan records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
