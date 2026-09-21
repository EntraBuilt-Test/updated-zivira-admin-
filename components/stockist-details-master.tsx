"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, ChevronDown, Ban } from "lucide-react";
import { useEffect, useState } from "react";

type StockistRow = {
  id: string;
  code: string;
  name: string;
  gstNo: string;
  licenseNo: string;
  status: "Active" | "Inactive";
};

const initialStockists: StockistRow[] = [];
const initialSuperStockists: StockistRow[] = [];

function StockistForm({ row, onSave, onBack, isSuperStockist }: { row: any; onSave: (r: StockistRow) => void; onBack: () => void; isSuperStockist: boolean }) {
  const [form, setForm] = useState<StockistRow>({
    id: row.id ?? "",
    code: row.code ?? "",
    name: row.name ?? "",
    gstNo: row.gstNo ?? "",
    licenseNo: row.licenseNo ?? "",
    status: row.status ?? "Active"
  });

  const isEdit = !!row.id;
  const labelPrefix = isSuperStockist ? "Super Stockist" : "Stockist";

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>{isEdit ? `Edit ${labelPrefix}` : `Add ${labelPrefix}`}</h2>
          <p>Maintain general registration and tax profiles.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      <div className="subdivision-form-card">
        <label className="field">
          <span>{labelPrefix} Code</span>
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder={isSuperStockist ? "e.g. SSTK001" : "e.g. STK001"} />
        </label>
        <label className="field">
          <span>* {labelPrefix} Name</span>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bio-Pharma Distributors" />
        </label>
        <label className="field">
          <span>GST No</span>
          <input value={form.gstNo} onChange={e => setForm({ ...form, gstNo: e.target.value })} placeholder="e.g. 33AAAAA1111A1Z1" />
        </label>
        <label className="field">
          <span>License No</span>
          <input value={form.licenseNo} onChange={e => setForm({ ...form, licenseNo: e.target.value })} placeholder="e.g. DL-12345/2026" />
        </label>
        <label className="field">
          <span>Status</span>
          <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
        <button className="button" style={{ marginTop: "12px" }} onClick={() => onSave(form)} type="button" disabled={!form.name.trim()}>
          <Check size={16} /> Save {labelPrefix}
        </button>
      </div>
    </section>
  );
}

export function StockistDetailsMaster({ isSuperStockist = false }: { isSuperStockist?: boolean }) {
  const [list, setList] = useState<StockistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<StockistRow | null>(null);

  useEffect(() => {
    setLoading(true);
    if (isSuperStockist) {
      setList(initialSuperStockists);
    } else {
      setList(initialStockists);
    }
    setLoading(false);
  }, [isSuperStockist]);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  const filtered = list.filter(
    (item) =>
      (statusFilter === "All" || item.status === statusFilter) &&
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.gstNo.toLowerCase().includes(search.toLowerCase()) ||
        item.licenseNo.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(form: StockistRow) {
    const codePrefix = isSuperStockist ? "SSTK" : "STK";
    if (view === "add") {
      const newStockist = {
        ...form,
        id: form.id || `${codePrefix}${String(list.length + 1).padStart(3, "0")}`,
        code: form.code || `${codePrefix}${String(list.length + 1).padStart(3, "0")}`
      };
      setList([...list, newStockist]);
    } else {
      setList(list.map(item => item.id === form.id ? { ...form } : item));
    }
    setView("list");
  }

  function handleDeactivate(id: string) {
    setList(list.map(item => item.id === id ? { ...item, status: "Inactive" as const } : item));
  }

  const labelPrefix = isSuperStockist ? "Super Stockist" : "Stockist";

  if (view === "add") return <StockistForm row={{}} onSave={handleSave} onBack={() => setView("list")} isSuperStockist={isSuperStockist} />;
  if (view === "edit" && editTarget) return <StockistForm row={editTarget} onSave={handleSave} onBack={() => setView("list")} isSuperStockist={isSuperStockist} />;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>{isSuperStockist ? "Super Stockist Details" : "Stockist Details"}</h2>
          <p>Configure general profiles, mappings, and status settings.</p>
        </div>
        <div className="subdivision-actions">
          
          <button className="button" onClick={() => setView("add")} type="button">Add {labelPrefix}</button>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder={`Search by ${labelPrefix.toLowerCase()} name, code, GST or License...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">{labelPrefix} Code</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">{labelPrefix} Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">GST No</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">License No</th>
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
            {loading && <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>Loading...</td></tr>}
            {!loading && filtered.map((row) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{row.code}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong>{row.name}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.gstNo || "-"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{row.licenseNo || "-"}</td>
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
            {!loading && filtered.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No stockists found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
