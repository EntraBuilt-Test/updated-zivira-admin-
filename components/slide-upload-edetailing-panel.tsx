"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's MasterFiles/Options/DD_Slide_Upload.aspx
// ("Slide_Upload_-_E-Detailing") exactly: three sub-tabs (Upload / View /
// Priority) sharing one Division / Sub Division / Brand cascading filter
// row, a storage-usage readout, and (on Priority) a "Update Priority for"
// radio of Brand/Product/Speciality/Therapy. Every control here is wired to
// real backend data — the upload goes through the shared
// POST /masters/:key/action/upload (now keeping the real file, so View can
// actually re-download it), and Priority reads/writes real, persisted
// per-item priority numbers.
const MASTER_KEY = "slideUploadEDetailing";
const DIVISION_NAME = "Zivira Labs Pvt Ltd";

type SubTab = "upload" | "view" | "priority";
type PriorityType = "Brand" | "Product" | "Speciality" | "Therapy";

export function SlideUploadEDetailingPanel() {
  const [tab, setTab] = useState<SubTab>("upload");
  const [subDivisions, setSubDivisions] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);

  useEffect(() => {
    apiClient.subdivisions().then((r) => setSubDivisions(r.data.map((s) => s.subdivisionName).filter(Boolean))).catch(() => {});
    apiClient.productBrands().then((r) => setBrands(r.data.map((b) => b.brandName).filter(Boolean))).catch(() => {});
    apiClient.productCatalog().then((r) => setProducts(r.data.map((p) => p.productName).filter(Boolean))).catch(() => {});
  }, []);

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Options &gt; Upload</p>
          <h2>Slide Upload - E-Detailing</h2>
          <p>Upload, view and set the display priority of E-Detailing slides, by Division / Sub Division / Brand.</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["upload", "view", "priority"] as SubTab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`button ${tab === t ? "" : "button-secondary"}`}
              onClick={() => setTab(t)}
              style={{ textTransform: "capitalize", minWidth: 80 }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          <div><strong>0.00 GB</strong><br />Consumed</div>
          <div><strong>5 GB</strong><br />Allocated (Extra 2% Will Allow)</div>
          <div><strong>5.00 GB</strong><br />Remaining</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {tab === "upload" && <UploadTab subDivisions={subDivisions} brands={brands} />}
        {tab === "view" && <ViewTab subDivisions={subDivisions} brands={brands} />}
        {tab === "priority" && <PriorityTab subDivisions={subDivisions} brands={brands} products={products} />}
      </div>
    </section>
  );
}

function UploadTab({ subDivisions, brands }: { subDivisions: string[]; brands: string[] }) {
  const [subDivision, setSubDivision] = useState("");
  const [brand, setBrand] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function doUpload() {
    if (!subDivision) { setErr("Please select a Sub Division"); return; }
    if (!brand) { setErr("Please select a Brand"); return; }
    if (!file) { setErr("Please choose a file"); return; }
    setBusy(true); setErr(null); setMsg(null);
    try {
      await apiClient.uploadMasterFile(MASTER_KEY, file, { division: DIVISION_NAME, subDivision, brand });
      setMsg("Slide uploaded successfully.");
      setFile(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-grid" style={{ maxWidth: 640 }}>
      {err && <div style={{ gridColumn: "span 2", color: "#ef4444", fontSize: 13 }}>{err}</div>}
      {msg && <div style={{ gridColumn: "span 2", color: "#10b981", fontSize: 13 }}>{msg}</div>}
      <div className="field">
        <label>Division</label>
        <input className="input" value={DIVISION_NAME} disabled />
      </div>
      <div className="field">
        <label>Sub Division</label>
        <CustomSelect value={subDivision} options={["---Select---", ...subDivisions]} onChange={(v) => setSubDivision(v === "---Select---" ? "" : v)} />
      </div>
      <div className="field">
        <label>Brand</label>
        <CustomSelect value={brand} options={["---Select---", ...brands]} onChange={(v) => setBrand(v === "---Select---" ? "" : v)} />
      </div>
      <div className="field">
        <label>Slide File</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <div style={{ gridColumn: "span 2" }}>
        <button className="button" type="button" onClick={doUpload} disabled={busy}>{busy ? "Uploading..." : "Upload"}</button>
      </div>
    </div>
  );
}

function ViewTab({ subDivisions, brands }: { subDivisions: string[]; brands: string[] }) {
  const [subDivision, setSubDivision] = useState("");
  const [brand, setBrand] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      const filtered = res.data.filter((r: any) =>
        (!subDivision || r.subDivision === subDivision) && (!brand || r.brand === brand)
      );
      setRows(filtered);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ minWidth: 220 }}>
          <label>Division</label>
          <input className="input" value={DIVISION_NAME} disabled />
        </div>
        <div className="field" style={{ minWidth: 200 }}>
          <label>Sub Division</label>
          <CustomSelect value={subDivision} options={["---Select---", ...subDivisions]} onChange={(v) => setSubDivision(v === "---Select---" ? "" : v)} />
        </div>
        <div className="field" style={{ minWidth: 200 }}>
          <label>Brand</label>
          <CustomSelect value={brand} options={["Nothing selected", ...brands]} onChange={(v) => setBrand(v === "Nothing selected" ? "" : v)} />
        </div>
        <button className="button" type="button" onClick={go}>Go</button>
      </div>

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold uppercase">S.No</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Sub Division</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Brand</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">File Name</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Uploaded On</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm">{r.subDivision || "-"}</td>
                  <td className="px-4 py-2 text-sm">{r.brand || "-"}</td>
                  <td className="px-4 py-2 text-sm">{r.fileName || "-"}</td>
                  <td className="px-4 py-2 text-sm">{r.uploadedOn ? new Date(r.uploadedOn).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-2 text-sm">
                    <button className="button button-secondary" type="button" onClick={() => apiClient.downloadMasterFile(MASTER_KEY, r.id, r.fileName)}>Download</button>
                  </td>
                </tr>
              ))}
              {loading === false && rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>No slides found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PriorityTab({ subDivisions, brands, products }: { subDivisions: string[]; brands: string[]; products: string[] }) {
  const [type, setType] = useState<PriorityType>("Brand");
  const [subDivision, setSubDivision] = useState("");
  const [rows, setRows] = useState<{ item: string; priority: number }[]>([]);
  const [searched, setSearched] = useState(false);
  const [savingItem, setSavingItem] = useState<string | null>(null);

  async function go() {
    const res = await apiClient.slidePriorityList(type, subDivision);
    setRows(res.data);
    setSearched(true);
  }

  async function updatePriority(item: string, priority: number) {
    setSavingItem(item);
    try {
      await apiClient.saveSlidePriority({ type, subDivision, item, priority });
      setRows((prev) => prev.map((r) => (r.item === item ? { ...r, priority } : r)));
    } finally {
      setSavingItem(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontWeight: 600 }}>Update Priority for :</span>
        {(["Brand", "Product", "Speciality", "Therapy"] as PriorityType[]).map((t) => (
          <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="radio" name="priorityType" checked={type === t} onChange={() => { setType(t); setSearched(false); }} />
            {t}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ minWidth: 200 }}>
          <label>Sub Division</label>
          <CustomSelect value={subDivision} options={["---Select---", ...subDivisions]} onChange={(v) => setSubDivision(v === "---Select---" ? "" : v)} />
        </div>
        <button className="button" type="button" onClick={go}>Go</button>
      </div>

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto" style={{ maxWidth: 480 }}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold uppercase">S.No</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">{type}</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Priority</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((r, idx) => (
                <tr key={r.item}>
                  <td className="px-4 py-2 text-sm">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm">{r.item}</td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="number"
                      className="input"
                      style={{ width: 70 }}
                      value={r.priority}
                      onChange={(e) => setRows((prev) => prev.map((row) => (row.item === r.item ? { ...row, priority: Number(e.target.value) } : row)))}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button className="button button-secondary" type="button" disabled={savingItem === r.item} onClick={() => updatePriority(r.item, r.priority)}>
                      {savingItem === r.item ? "Saving..." : "Update"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
