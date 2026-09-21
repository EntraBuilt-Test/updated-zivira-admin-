"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";

type DcrSummaryRow = {
  id: string;
  date: string;
  employeeCode: string;
  medicalRepresentative: string;
  division: string;
  hq: string;
  patch: string;
  plannedCalls: number;
  callsCompleted: number;
  doctorsVisited: number;
  chemistsVisited: number;
  hospitalsVisited: number;
  productsPromoted: string;
  samplesDistributed: string;
  giftsDistributed: string;
  workingHours: string;
};

const initialSummaries: DcrSummaryRow[] = [];

function SummaryForm({ row, onSave, onBack }: { row: any; onSave: (r: DcrSummaryRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<DcrSummaryRow>({
    id: row.id ?? "",
    date: row.date ?? new Date().toISOString().split("T")[0],
    employeeCode: row.employeeCode ?? "",
    medicalRepresentative: row.medicalRepresentative ?? "",
    division: row.division ?? "Zivira",
    hq: row.hq ?? "Chennai Central HQ",
    patch: row.patch ?? "",
    plannedCalls: row.plannedCalls ?? 0,
    callsCompleted: row.callsCompleted ?? 0,
    doctorsVisited: row.doctorsVisited ?? 0,
    chemistsVisited: row.chemistsVisited ?? 0,
    hospitalsVisited: row.hospitalsVisited ?? 0,
    productsPromoted: row.productsPromoted ?? "",
    samplesDistributed: row.samplesDistributed ?? "",
    giftsDistributed: row.giftsDistributed ?? "",
    workingHours: row.workingHours ?? "8.0 Hours"
  });

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Manager Activity Report</p>
          <h2>{row.id ? "Edit DCR Summary" : "Add DCR Summary"}</h2>
          <p>Create or update a summary of MR daily call activities.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      <div className="subdivision-form-card">
        <label className="field">
          <span>* Date</span>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </label>
        <label className="field">
          <span>* Employee Code</span>
          <input value={form.employeeCode} onChange={e => setForm({ ...form, employeeCode: e.target.value })} placeholder="EMP-MR-0001" />
        </label>
        <label className="field">
          <span>* Medical Representative</span>
          <input value={form.medicalRepresentative} onChange={e => setForm({ ...form, medicalRepresentative: e.target.value })} placeholder="Rahul Sharma" />
        </label>
        <label className="field">
          <span>Division</span>
          <select className="input" value={form.division} onChange={e => setForm({ ...form, division: e.target.value })}>
            <option value="Zivira">Zivira</option>
            <option value="Astra">Astra</option>
            <option value="Aura">Aura</option>
          </select>
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
          <span>Planned Calls</span>
          <input type="number" value={form.plannedCalls || ""} onChange={e => setForm({ ...form, plannedCalls: parseInt(e.target.value) || 0 })} placeholder="12" />
        </label>
        <label className="field">
          <span>Calls Completed</span>
          <input type="number" value={form.callsCompleted || ""} onChange={e => setForm({ ...form, callsCompleted: parseInt(e.target.value) || 0 })} placeholder="10" />
        </label>
        <label className="field">
          <span>Doctors Visited</span>
          <input type="number" value={form.doctorsVisited || ""} onChange={e => setForm({ ...form, doctorsVisited: parseInt(e.target.value) || 0 })} placeholder="8" />
        </label>
        <label className="field">
          <span>Chemists Visited</span>
          <input type="number" value={form.chemistsVisited || ""} onChange={e => setForm({ ...form, chemistsVisited: parseInt(e.target.value) || 0 })} placeholder="2" />
        </label>
        <label className="field">
          <span>Hospitals Visited</span>
          <input type="number" value={form.hospitalsVisited || ""} onChange={e => setForm({ ...form, hospitalsVisited: parseInt(e.target.value) || 0 })} placeholder="1" />
        </label>
        <label className="field">
          <span>Products Promoted</span>
          <input value={form.productsPromoted} onChange={e => setForm({ ...form, productsPromoted: e.target.value })} placeholder="e.g. API Brands, Consumables" />
        </label>
        <label className="field">
          <span>Samples Distributed</span>
          <input value={form.samplesDistributed} onChange={e => setForm({ ...form, samplesDistributed: e.target.value })} placeholder="e.g. 5 boxes" />
        </label>
        <label className="field">
          <span>Gifts Distributed</span>
          <input value={form.giftsDistributed} onChange={e => setForm({ ...form, giftsDistributed: e.target.value })} placeholder="e.g. 3 diaries" />
        </label>
        <label className="field">
          <span>Working Hours</span>
          <input value={form.workingHours} onChange={e => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. 8.0 Hours" />
        </label>
        <button className="button" style={{ marginTop: "12px" }} onClick={() => onSave(form)} type="button" disabled={!form.employeeCode.trim() || !form.medicalRepresentative.trim()}>
          <Check size={16} /> Save Summary
        </button>
      </div>
    </section>
  );
}

export function ManagerDcrSummary() {
  const [list, setList] = useState<DcrSummaryRow[]>(initialSummaries);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<DcrSummaryRow | null>(null);

  const [divisionFilter, setDivisionFilter] = useState<string>("All");
  const [divisionFilterOpen, setDivisionFilterOpen] = useState(false);
  const [hqFilter, setHqFilter] = useState<string>("All");
  const [hqFilterOpen, setHqFilterOpen] = useState(false);

  const filtered = list.filter(
    (item) =>
      (divisionFilter === "All" || item.division === divisionFilter) &&
      (hqFilter === "All" || item.hq === hqFilter) &&
      (item.medicalRepresentative.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
        item.patch.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(form: DcrSummaryRow) {
    if (view === "add") {
      const newRow = {
        ...form,
        id: `SUMM${String(list.length + 1).padStart(3, "0")}`
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

  if (view === "add") return <SummaryForm row={{}} onSave={handleSave} onBack={() => setView("list")} />;
  if (view === "edit" && editTarget) return <SummaryForm row={editTarget} onSave={handleSave} onBack={() => setView("list")} />;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Manager Activity Report</p>
          <h2>Daily Call Report Summary</h2>
          <p>Review comprehensive Daily Call Report (DCR) statistics and metrics.</p>
        </div>
        <div className="subdivision-actions">
          
          <button className="button" onClick={() => setView("add")} type="button">Add Summary</button>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <input className="input w-full max-w-md"
          placeholder="Search by MR, code or patch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Date</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Employee Code</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Medical Representative</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" style={{ minWidth: "130px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Division</span>
                  <button
                    type="button"
                    onClick={() => setDivisionFilterOpen(!divisionFilterOpen)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {divisionFilterOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "120px", display: "flex", flexDirection: "column", padding: "4px 0" }}>
                    {["Zivira", "Astra", "Aura"].map(div => (
                      <button key={div} type="button" onClick={() => { setDivisionFilter(div); setDivisionFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", background: divisionFilter === div ? "var(--line)" : "none", border: "none", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: divisionFilter === div ? 600 : 400 }}>
                        {div}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setDivisionFilter("All"); setDivisionFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>
                  </div>
                )}
              </th>
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
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Planned Calls</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Calls Completed</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctors Visited</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Chemists Visited</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Hospitals Visited</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Products Promoted</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Samples Distributed</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Gifts Distributed</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Working Hours</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" colSpan={2}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((row) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{formatDate(row.date)}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.employeeCode}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color: "var(--ink)" }}>{row.medicalRepresentative}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.division}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.hq}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.patch}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{row.plannedCalls}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{row.callsCompleted}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{row.doctorsVisited}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{row.chemistsVisited}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{row.hospitalsVisited}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.productsPromoted}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.samplesDistributed}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.giftsDistributed}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.workingHours}</td>
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
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={17} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No DCR summaries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
