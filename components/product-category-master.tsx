"use client";
import { StatusFilterDropdown } from "@/components/status-filter-dropdown";
import { Check, Pencil, Plus, RefreshCw, RotateCcw, SlidersHorizontal, Trash2, X, Package, ChevronDown, Ban } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient, type ProductCategory } from "@/lib/api-client";

// ─── Add / Edit Form ─────────────────────────────────────────────────────────
// ─── Add / Edit Form ─────────────────────────────────────────────────────────
function CategoryForm({ row, onSave, onBack, saving, error }: { row: any; onSave: (shortName: string, categoryName: string, description: string, status: "ACTIVE" | "INACTIVE") => void; onBack: () => void; saving: boolean; error: string | null }) {
  const [form, setForm] = useState({ 
    shortName: "", 
    categoryName: row.categoryName ?? "",
    description: row.description ?? "",
    status: row.status ?? "ACTIVE"
  });
  const isEdit = !!row.id;

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>{isEdit ? "Edit Therapy Master" : "Add Therapy Master"}</h2>
          <p>Manage product therapies used across the platform.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      <div className="subdivision-form-card">
        {error && <p style={{ color: "#ef4444", fontSize: "13px" }}>{error}</p>}
        <label className="field">
          <span>* Therapy Name</span>
          <input value={form.categoryName} onChange={e => setForm(f => ({ ...f, categoryName: e.target.value }))} placeholder="e.g. Anti Infective" />
        </label>
        <label className="field">
          <span>Description</span>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
        </label>
        <label className="field">
          <span>Status</span>
          <select className="input" 
            value={form.status} 
            onChange={e => setForm(f => ({ ...f, status: e.target.value as "ACTIVE" | "INACTIVE" }))}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <button className="button" style={{ marginTop: "12px" }} onClick={() => onSave(form.shortName, form.categoryName, form.description, form.status)} type="button" disabled={saving || !form.categoryName.trim()}>
          <Check size={16} /> {saving ? "Saving..." : "Add Therapy"}
        </button>
      </div>
    </section>
  );
}

// ─── Bulk Edit View ───────────────────────────────────────────────────────────
function BulkEditView({ rows, onSave, onBack, saving }: { rows: ProductCategory[]; onSave: (rows: { id: string; shortName: string; categoryName: string }[]) => void; onBack: () => void; saving: boolean }) {
  const [draft, setDraft] = useState(rows.map(r => ({ id: r.id, shortName: "", categoryName: r.categoryName })));

  function update(id: string, field: "categoryName", val: string) {
    setDraft(d => d.map(r => r.id === id ? { ...r, [field]: val } : r));
  }

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Bulk Operations</p>
          <h2>Bulk Edit — Product Therapy</h2>
          <p>Edit all therapy names in one go.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">S.No</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Category Name</th></tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {draft.map((row, i) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color:"var(--muted)", fontWeight:500 }}>{i + 1}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><input className="subdivision-inline-input" value={row.categoryName} onChange={e => update(row.id, "categoryName", e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:"20px" }}>
        <button className="button" onClick={() => onSave(draft)} type="button" disabled={saving}><Check size={16} /> {saving ? "Saving..." : "Save"}</button>
      </div>
    </section>
  );
}

// ─── Serial Number Generation View ───────────────────────────────────────────
function SerialNoGenView({ rows, onSave, onBack, saving }: { rows: ProductCategory[]; onSave: (order: { id: string; sortOrder: number }[]) => void; onBack: () => void; saving: boolean }) {
  const [newNos, setNewNos] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState(false);

  function generate() {
    const auto: Record<string, string> = {};
    rows.forEach((r, i) => { auto[r.id] = String(i + 1); });
    setNewNos(auto);
    setGenerated(true);
  }

  function clear() { setNewNos({}); setGenerated(false); }

  function save() {
    const order = rows.map(r => ({ id: r.id, sortOrder: parseInt(newNos[r.id] ?? "0", 10) || 0 }));
    onSave(order);
  }

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>Product Category — Serial No Generation</h2>
          <p>Assign new serial numbers to reorder the category list.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Category Name</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Existing S.No</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">New S.No</th></tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((row, i) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight:600, color:"var(--ink)" }}>{row.categoryName}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color:"var(--muted)" }}>{i + 1}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <input
                    className="subdivision-inline-input"
                    style={{ width:"64px" }}
                    value={newNos[row.id] ?? ""}
                    onChange={e => setNewNos(n => ({ ...n, [row.id]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:"20px", display:"flex", gap:"10px" }}>
        {!generated
          ? <button className="button" onClick={generate} type="button"><RefreshCw size={16} /> Generate - Sl No</button>
          : <button className="button" onClick={save} type="button" disabled={saving}><Check size={16} /> {saving ? "Saving..." : "Add Therapy"}</button>
        }
        <button className="button button-secondary" onClick={clear} type="button"><X size={16} /> Clear</button>
      </div>
    </section>
  );
}

// ─── Reactivation View ────────────────────────────────────────────────────────
function ReactivationView({ inactive, onReactivate, onBack }: { inactive: ProductCategory[]; onReactivate: (id: string) => void; onBack: () => void }) {
  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Master Setup</p>
          <h2>Product Category Reactivation</h2>
          <p>Restore previously deactivated product categories.</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button"><RotateCcw size={16} /> Back</button>
      </div>
      {inactive.length === 0 ? (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
          <Package size={32} style={{ margin:"0 auto 12px", opacity:0.4 }} />
          <p style={{ margin:0, fontWeight:600 }}>No Records Found</p>
          <p style={{ margin:"4px 0 0", fontSize:"13px" }}>All product categories are currently active.</p>
        </div>
      ) : (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">S.No</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Category Name</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Reactivate</th></tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {inactive.map((row, i) => (
                <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color:"var(--muted)" }}>{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color:"var(--muted)" }}>{row.categoryName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                    <button className="button" onClick={() => onReactivate(row.id)} type="button" style={{ padding:"5px 14px", fontSize:"12px" }}>
                      <RefreshCw size={13} /> Reactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Deactivate Confirm Dialog ────────────────────────────────────────────────
function DeactivateDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"var(--panel)", borderRadius:"16px", padding:"32px 28px", maxWidth:"400px", width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
        <div>
          <span style={{ background:"#fef2f2", borderRadius:"50%", width:"44px", height:"44px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ban size={15} />
          </span>
          <div>
            <h3 style={{ margin:0, fontSize:"17px", fontWeight:700, color:"var(--ink)" }}>Deactivate Therapy?</h3>
            <p style={{ margin:"4px 0 0", fontSize:"13px", color:"var(--muted)" }}>This can be reversed via Reactivation.</p>
          </div>
        </div>
        <p style={{ fontSize:"14px", color:"var(--ink)", margin:"0 0 24px", lineHeight:1.6 }}>
          Are you sure you want to deactivate <strong>{name}</strong>?
        </p>
        <div>
          <button className="button button-secondary" onClick={onCancel} type="button">Cancel</button>
          <button onClick={onConfirm} type="button">
            <Ban size={15} /> Yes, Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type View = "list" | "add" | "edit" | "bulkEdit" | "serialNo" | "reactivation";

export function ProductCategoryMaster() {
  const [all, setAll] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>("list");
  const [editTarget, setEditTarget] = useState<ProductCategory | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ProductCategory | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [draftRow, setDraftRow] = useState<{ shortName: string; categoryName: string; description: string; status: "ACTIVE" | "INACTIVE" } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.productCategories();
      setAll(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const [statusFilter, setStatusFilter] = useState("All");

  const rows = all.filter(r => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Active") return r.status === "ACTIVE";
    if (statusFilter === "Inactive") return r.status === "INACTIVE";
    return true;
  });
  const inactive = all.filter(r => r.status === "INACTIVE");

  function beginInline(row: any) { 
    setInlineEditId(row.id); 
    setDraftRow({ 
      shortName: row.shortName ?? "", 
      categoryName: row.categoryName, 
      description: row.description ?? "", 
      status: row.status 
    }); 
  }
  function cancelInline() { setInlineEditId(null); setDraftRow(null); }

  async function saveInline() {
    if (!inlineEditId || !draftRow) return;
    setSaving(true);
    try {
      await apiClient.updateProductCategory(inlineEditId, draftRow as any);
      await load();
      cancelInline();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveForm(shortName: string, categoryName: string, description: string, status: "ACTIVE" | "INACTIVE") {
    setSaving(true);
    setError(null);
    try {
      if (editTarget) {
        await apiClient.updateProductCategory(editTarget.id, { shortName, categoryName, description, status } as any);
      } else {
        await apiClient.createProductCategory({ shortName: shortName || null, categoryName, description, status } as any);
      }
      await load();
      setView("list");
      setEditTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkSave(draft: { id: string; shortName: string; categoryName: string }[]) {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(draft.map(d => apiClient.updateProductCategory(d.id, { shortName: d.shortName, categoryName: d.categoryName })));
      await load();
      setView("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleSerialNoSave(order: { id: string; sortOrder: number }[]) {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(order.map(o => apiClient.updateProductCategory(o.id, { sortOrder: o.sortOrder })));
      await load();
      setView("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save serial numbers");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setSaving(true);
    try {
      await apiClient.deactivateProductCategory(deactivateTarget.id);
      await load();
      setDeactivateTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate category");
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivate(id: string) {
    setSaving(true);
    try {
      await apiClient.reactivateProductCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate category");
    } finally {
      setSaving(false);
    }
  }

  if (view === "add") return <CategoryForm row={{}} onSave={handleSaveForm} onBack={() => setView("list")} saving={saving} error={error} />;
  if (view === "edit" && editTarget) return <CategoryForm row={editTarget} onSave={handleSaveForm} onBack={() => { setView("list"); setEditTarget(null); }} saving={saving} error={error} />;
  if (view === "bulkEdit") return <BulkEditView rows={rows} onSave={handleBulkSave} onBack={() => setView("list")} saving={saving} />;
  if (view === "serialNo") return <SerialNoGenView rows={rows} onSave={handleSerialNoSave} onBack={() => setView("list")} saving={saving} />;
  if (view === "reactivation") return <ReactivationView inactive={inactive} onReactivate={handleReactivate} onBack={() => setView("list")} />;

  return (
    <>
      {deactivateTarget && <DeactivateDialog name={deactivateTarget.categoryName} onConfirm={handleDeactivate} onCancel={() => setDeactivateTarget(null)} />}

      <section className="subdivision-console">
        <div className="subdivision-head">
          <div>
            <p className="subdivision-eyebrow">Master Setup</p>
            <h2>Therapy Master</h2>
            <p>Create and manage product therapies used across the platform.</p>
          </div>
          <div className="subdivision-actions">
            <button className="button button-secondary" onClick={() => setView("reactivation")} type="button"><RefreshCw size={16} /> Reactivation</button>
            <button className="button button-secondary" onClick={() => setView("serialNo")} type="button"><SlidersHorizontal size={16} /> S.No Gen</button>
            <button className="button button-secondary" onClick={() => setView("bulkEdit")} type="button"><Pencil size={16} /> Bulk Edit</button>
            <button className="button" onClick={() => setView("add")} type="button">Add</button>
          </div>
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <div className="subdivision-stats" style={{ marginBottom:"20px" }}>
          <article><span>Total Therapies</span><strong>{rows.length}</strong></article>
          <article><span>Inactive</span><strong>{inactive.length}</strong></article>
        </div>

        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Therapy Code</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Therapy Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Description</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" style={{ minWidth: "140px" }}>
                  <StatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" colSpan={2}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={6} style={{ textAlign:"center", color:"var(--muted)", padding:"32px" }}>Loading...</td></tr>}
              {!loading && rows.map((row, i) => {
                const editing = inlineEditId === row.id && draftRow;
                const displayCategory = row.categoryName;
                return (
                  <tr className="hover:bg-surface-subtle/50 transition-colors group" key={row.id}>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>TH{String(i + 1).padStart(3, "0")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      {editing
                        ? <input className="subdivision-inline-input" value={draftRow.categoryName} onChange={e => setDraftRow({ ...draftRow, categoryName: e.target.value })} />
                        : <strong style={{ color:"var(--ink)" }}>{displayCategory}</strong>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      {editing
                        ? <input className="subdivision-inline-input" value={draftRow.description} onChange={e => setDraftRow({ ...draftRow, description: e.target.value })} />
                        : (row.description || "—")
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      {editing ? (
                        <select className="input" 
                          value={draftRow.status} 
                          onChange={e => setDraftRow({ ...draftRow, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                          className="subdivision-inline-input"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      ) : (
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
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      {editing ? (
                        <span className="subdivision-inline-actions">
                          <button aria-label="Update" onClick={saveInline} title="Update" type="button" disabled={saving}><Check size={15} /></button>
                          <button aria-label="Cancel" onClick={cancelInline} title="Cancel" type="button" disabled={saving}><X size={15} /></button>
                        </span>
                      ) : (
                        <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} title="Edit" type="button"><Pencil size={15} /></button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      <button className="p-1.5 rounded text-text-muted hover:!text-red-500 hover:!bg-red-50 hover:!shadow-md hover:!shadow-red-500 transition-all inline-flex items-center justify-center cursor-pointer pointer-events-auto" onClick={() => setDeactivateTarget(row)} title="Deactivate" type="button"><Ban size={15} /></button>
                    </td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={6} style={{ textAlign:"center", color:"var(--muted)", padding:"32px" }}>No product therapies yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
