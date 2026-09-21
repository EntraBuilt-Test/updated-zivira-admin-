"use client";
import { useEffect, useState } from "react";
import { Pencil, RotateCcw, SlidersHorizontal, Trash2, X, ChevronDown, Ban } from "lucide-react";
import { apiClient, type ProductGroup, type ProductCategory } from "@/lib/api-client";
type FormRow = {
  id: string;
  moleculeName: string;
  therapyName: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
};
const emptyFormRow: FormRow = {
  id: "",
  moleculeName: "",
  therapyName: "",
  description: "",
  status: "ACTIVE"
};
export function ProductGroupMaster() {
  const [molecules, setMolecules] = useState<ProductGroup[]>([]);
  const [therapies, setTherapies] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [formRow, setFormRow] = useState<FormRow>(emptyFormRow);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [molRes, catRes] = await Promise.all([
          apiClient.productGroups(),
          apiClient.productCategories()
        ]);
        setMolecules(molRes.data);
        setTherapies(catRes.data);
        if (catRes.data.length > 0) {
          emptyFormRow.therapyName = catRes.data[0].categoryName;
        }
      } catch (err) {
        setError("Failed to load molecule master data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const filtered = molecules.filter(
    (m) =>
      (statusFilter === "All" ||
        (statusFilter === "Active" && m.status === "ACTIVE") ||
        (statusFilter === "Inactive" && m.status === "INACTIVE")) &&
      (m.moleculeName.toLowerCase().includes(search.toLowerCase()) ||
        (m.therapyName ?? "").toLowerCase().includes(search.toLowerCase()))
  );
  function handleAdd() {
    setFormRow({
      ...emptyFormRow,
      therapyName: therapies[0]?.categoryName ?? ""
    });
    setView("add");
  }
  function handleEdit(row: ProductGroup) {
    setFormRow({
      id: row.id,
      moleculeName: row.moleculeName,
      therapyName: row.therapyName ?? (therapies[0]?.categoryName ?? ""),
      description: row.description ?? "",
      status: row.status
    });
    setView("edit");
  }
  function handleSave() {
    if (!formRow.moleculeName.trim()) return;
    if (view === "add") {
      const newMol: ProductGroup = {
        id: Math.random().toString(36).slice(2, 9),
        moleculeName: formRow.moleculeName,
        therapyName: formRow.therapyName,
        description: formRow.description,
        status: formRow.status
      };
      setMolecules([newMol, ...molecules]);
    } else {
      setMolecules(
        molecules.map((m) =>
          m.id === formRow.id
            ? {
                ...m,
                moleculeName: formRow.moleculeName,
                therapyName: formRow.therapyName,
                description: formRow.description,
                status: formRow.status
              }
            : m
        )
      );
    }
    setView("list");
  }
  function handleDeactivate(id: string) {
    setMolecules(
      molecules.map((m) => (m.id === id ? { ...m, status: "INACTIVE" as const } : m))
    );
  }
  if (view === "add" || view === "edit") {
    return (
      <section className="subdivision-console">
        <div className="subdivision-head">
          <div>
            <p className="subdivision-eyebrow">Master Setup</p>
            <h2>{view === "add" ? "Add Molecule Master" : "Edit Molecule Master"}</h2>
            <p>Configure molecules and associate them with therapies.</p>
          </div>
          <button className="button button-secondary" onClick={() => setView("list")} type="button">
            <RotateCcw size={16} /> Back
          </button>
        </div>
        <div className="subdivision-form-card">
          <label className="field">
            <span>* Molecule Name</span>
            <input
              value={formRow.moleculeName}
              onChange={(e) => setFormRow({ ...formRow, moleculeName: e.target.value })}
              placeholder="e.g. Paracetamol"
            />
          </label>
          <label className="field">
            <span>Therapy</span>
            <select className="input"
              value={formRow.therapyName}
              onChange={(e) => setFormRow({ ...formRow, therapyName: e.target.value })}
            >
              {therapies.map((t) => (
                <option key={t.id} value={t.categoryName}>
                  {t.categoryName}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Description</span>
            <input
              value={formRow.description}
              onChange={(e) => setFormRow({ ...formRow, description: e.target.value })}
              placeholder="Analgesic and antipyretic medicine."
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select className="input"
              value={formRow.status}
              onChange={(e) => setFormRow({ ...formRow, status: e.target.value as "ACTIVE" | "INACTIVE" })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
          <button className="button" style={{ marginTop: "12px" }} onClick={handleSave} type="button" disabled={!formRow.moleculeName.trim()}>
            Add Molecule
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>Molecule Master</h2>
          <p>Manage and map molecules to corresponding therapy classifications.</p>
        </div>
        <div className="subdivision-actions">
          <button className="button button-secondary" type="button">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <button className="button" onClick={handleAdd} type="button">
             Add Molecule
          </button>
        </div>
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
      <div style={{ marginBottom: "16px" }}>
        <input className="input w-full max-w-md"
          placeholder="Search by molecule name or therapy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="subdivision-stats" style={{ marginBottom: "20px" }}>
        <article>
          <span>Total Molecules</span>
          <strong>{molecules.length}</strong>
        </article>
        <article>
          <span>Filtered Matches</span>
          <strong>{filtered.length}</strong>
        </article>
      </div>
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Molecule Code</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Molecule Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Therapy</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Description</th>
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
            {loading && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filtered.map((row, i) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>MOL{String(i + 1).padStart(3, "0")}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <strong style={{ color: "var(--ink)" }}>{row.moleculeName}</strong>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color: "var(--ink)", fontSize: "13px" }}>
                  {row.therapyName ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color: "var(--muted)", fontSize: "13px" }}>
                  {row.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
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
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <button className="subdivision-icon-button" onClick={() => handleEdit(row)} title="Edit" type="button">
                    <Pencil size={15} />
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <button className="p-1.5 rounded text-text-muted hover:!text-red-500 hover:!bg-red-50 hover:!shadow-md hover:!shadow-red-500 transition-all inline-flex items-center justify-center cursor-pointer pointer-events-auto" onClick={() => handleDeactivate(row.id)} title="Deactivate" type="button" disabled={row.status === "INACTIVE"}>
                    <Ban size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No product molecules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
