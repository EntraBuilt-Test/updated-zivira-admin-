"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type SlideMeta, type SlideRow } from "@/lib/api-client";

// Round 58 -- Slide Upload - E-Detailing (legacy DD_Slide_Upload.aspx, Bootstrap look). Slides are stored by the backend
// (base64 in the slideUploadEDetailing master document, one copy per brand, 10 MB per file) and served to the field app.

type Tab = "upload" | "view" | "priority";
type PType = "Brand" | "Product" | "Speciality" | "Therapy";
const gb = (b: number) => (b / 1024 ** 3).toFixed(2);
const blue = "#007bff";

export function SlideUploadPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<SlideMeta | null>(null);
  const [tab, setTab] = useState<Tab>("upload");
  const [sub, setSub] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [go, setGo] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<SlideRow[]>([]);
  const [ptype, setPtype] = useState<PType>("Brand");
  const [prio, setPrio] = useState<{ item: string; priority: number }[]>([]);

  const loadMeta = useCallback(() => apiClient.slidesMeta().then(setMeta).catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load slide storage" })), []);
  useEffect(() => { void loadMeta(); }, [loadMeta]);

  const brandOptions = useMemo(() => {
    if (!meta) return [];
    const scoped = sub ? meta.brandRows.filter((b) => b.subDivision === sub).map((b) => b.name) : [];
    return [...new Set(scoped.length ? scoped : meta.brands)].sort((a, b) => a.localeCompare(b));
  }, [meta, sub]);

  const pct = meta ? Math.min(100, (meta.consumedBytes / meta.allocatedBytes) * 100) : 0;
  const switchTab = (t: Tab) => { setTab(t); setGo(false); setMsg(null); };

  const doGo = async () => {
    setMsg(null);
    if (!sub) { setMsg({ ok: false, text: "Select the Sub Division" }); return; }
    if (tab !== "priority" && !brands.length) { setMsg({ ok: false, text: "Select the Brand" }); return; }
    try {
      if (tab === "view") setRows(await apiClient.slidesList({ subDivision: sub, brands }));
      if (tab === "priority") setPrio((await apiClient.slidePriorityList(ptype, sub)).data);
      setGo(true);
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" }); }
  };

  const doUpload = async () => {
    if (!files.length) { setMsg({ ok: false, text: "Choose at least one slide file" }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await apiClient.slidesUpload(files, { subDivision: sub, brands: brands.join("|") });
      setMsg({ ok: true, text: `${r.saved.length} slide copy(ies) saved for ${brands.length} brand(s).` });
      setFiles([]); setFileKey((k) => k + 1); await loadMeta();
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed" }); }
    finally { setBusy(false); }
  };

  const remove = async (r: SlideRow) => {
    if (!window.confirm(`Delete ${r.fileName} (${r.brand})?`)) return;
    try { await apiClient.slidesDelete(r.id); setRows((x) => x.filter((y) => y.id !== r.id)); await loadMeta(); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Delete failed" }); }
  };

  const savePriority = async (item: string, priority: number) => {
    try { await apiClient.saveSlidePriority({ type: ptype, subDivision: sub, item, priority }); setMsg({ ok: true, text: `Priority saved for ${item}` }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not save the priority" }); }
  };

  const seg = (t: Tab, label: string) => (
    <button type="button" onClick={() => switchTab(t)} style={{ padding: "8px 16px", fontSize: 18, border: 0, background: tab === t ? "#0062cc" : "#f1f3f5", color: tab === t ? "#fff" : "#212529", cursor: "pointer" }}>{label}</button>
  );
  const sel: React.CSSProperties = { height: 46, minWidth: 200, border: 0, background: "#f1f3f5", padding: "0 12px", fontSize: 18, color: "#6c757d", borderRadius: 4 };

  return (
    <div style={{ background: "#fff", color: "#212529", minHeight: "70vh", padding: "20px 24px 40px", fontFamily: "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 24px" }}>
        <button type="button" onClick={() => setMsg({ ok: true, text: "Upload slides per Sub Division and Brand, view or delete uploaded slides, and set their priority. Each file can be up to 10 MB." })} style={{ color: blue, background: "none", border: 0, fontSize: 18, cursor: "pointer" }}>Help <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, background: blue, color: "#fff", fontSize: 13, textAlign: "center", lineHeight: "18px" }}>?</span></button>
        <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push("/admin/home"))} style={{ background: blue, color: "#fff", border: 0, borderRadius: 4, padding: "8px 12px", fontSize: 16, cursor: "pointer" }}>Back</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 30, flexWrap: "wrap" }}>
        <div style={{ display: "flex", borderRadius: 4, overflow: "hidden" }}>{seg("upload", "Upload")}{seg("view", "View")}{seg("priority", "Priority")}</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, fontSize: 12, fontWeight: "bold" }}>
          <div style={{ textAlign: "center", paddingTop: 4 }}>{meta ? gb(meta.consumedBytes) : "0.00"}GB<br />Consumed</div>
          <div style={{ width: 220 }}>
            <div style={{ height: 40, background: "#e9ecef", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: blue }} />
              <span style={{ position: "absolute", left: 2, top: 9, color: "#fff", fontSize: 17, fontWeight: "normal" }}>{pct.toFixed(2)}%</span>
            </div>
            <div style={{ textAlign: "center", marginTop: 22 }}>{meta ? gb(meta.remainingBytes) : "5.10"} GB Remaining</div>
          </div>
          <div style={{ textAlign: "center", width: 80, paddingTop: 4 }}>{meta ? Math.round(meta.allocatedBytes / 1024 ** 3) : 5}GB<br />Allocated<br />(Extra 2%<br />Will Allow)</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "40px 0 0 0", flexWrap: "wrap", fontSize: 19 }}>
        <span>Division :</span>
        <select disabled style={{ ...sel, width: 200 }}><option>{meta?.division || "Zivira Labs Pvt Ltd"}</option></select>
        <span style={{ marginLeft: 40 }}>Sub Division :</span>
        <select value={sub} onChange={(e) => { setSub(e.target.value); setBrands([]); setGo(false); }} style={{ ...sel, color: "#212529" }}>
          <option value="">---Select---</option>
          {(meta?.subDivisions ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {tab !== "priority" ? (
          <>
            <span style={{ marginLeft: 20 }}>Brand :</span>
            <div style={{ position: "relative" }}>
              <button type="button" disabled={!sub} onClick={() => setOpen((o) => !o)} style={{ ...sel, width: 200, textAlign: "left", cursor: sub ? "pointer" : "default", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{brands.length ? brands.join(", ") : "Nothing selected"} <span style={{ fontSize: 10 }}>&#9660;</span></button>
              {open && (
                <div style={{ position: "absolute", zIndex: 20, top: 48, left: 0, width: 260, maxHeight: 280, overflowY: "auto", background: "#fff", border: "1px solid #ced4da", borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,.2)", fontSize: 16 }}>
                  {brandOptions.map((b) => (
                    <label key={b} style={{ display: "flex", gap: 8, padding: "5px 12px", alignItems: "center" }}>
                      <input type="checkbox" checked={brands.includes(b)} onChange={(e) => { setBrands((x) => e.target.checked ? [...x, b] : x.filter((y) => y !== b)); setGo(false); }} />{b}
                    </label>
                  ))}
                  {!brandOptions.length && <div style={{ padding: 10, color: "#6c757d" }}>No brands</div>}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <span style={{ marginLeft: 20 }}>Type :</span>
            <select value={ptype} onChange={(e) => { setPtype(e.target.value as PType); setGo(false); }} style={{ ...sel, color: "#212529", minWidth: 160 }}>
              {(["Brand", "Product", "Speciality", "Therapy"] as PType[]).map((t) => <option key={t}>{t}</option>)}
            </select>
          </>
        )}
        <button type="button" onClick={doGo} style={{ background: blue, color: "#fff", border: 0, borderRadius: 4, padding: "12px 16px", fontSize: 19, cursor: "pointer", marginLeft: 30 }}>Go</button>
      </div>

      {msg && <div style={{ margin: "18px 0 0", color: msg.ok ? "#1e7e34" : "#dc3545", fontSize: 17 }}>{msg.text}</div>}

      {go && tab === "upload" && (
        <div style={{ margin: "34px 0 0", fontSize: 17 }}>
          <div style={{ marginBottom: 12 }}>Slide files for {sub} / {brands.join(", ")} (PDF, images or video; up to {meta ? Math.round(meta.maxFileBytes / 1024 ** 2) : 10} MB each)</div>
          <input key={fileKey} type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          <button type="button" disabled={busy || !files.length} onClick={doUpload} style={{ marginLeft: 20, background: blue, color: "#fff", border: 0, borderRadius: 4, padding: "8px 16px", fontSize: 17, opacity: busy || !files.length ? 0.6 : 1, cursor: "pointer" }}>{busy ? "Uploading..." : "Upload"}</button>
        </div>
      )}

      {go && tab === "view" && (
        <div style={{ margin: "34px 0 0", overflowX: "auto" }}>
          {rows.length === 0 ? <div style={{ fontSize: 17 }}>No Records Found!</div> : (
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 16 }}>
              <thead><tr style={{ background: "#f1f3f5", textAlign: "left" }}>{["File name", "Sub Division", "Brand", "Pages", "Size", "Uploaded on", ""].map((h) => <th key={h} style={{ padding: "8px 10px", border: "1px solid #dee2e6" }}>{h}</th>)}</tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{r.fileName}</td><td style={td}>{r.subDivision}</td><td style={td}>{r.brand}</td><td style={td}>{r.pages ?? ""}</td>
                  <td style={td}>{r.size != null ? `${(r.size / 1024 ** 2).toFixed(2)} MB` : ""}</td>
                  <td style={td}>{r.uploadedOn ? new Date(r.uploadedOn).toLocaleDateString("en-GB") : ""}</td>
                  <td style={td}>
                    <button type="button" style={{ color: blue, background: "none", border: 0, cursor: "pointer" }} onClick={() => apiClient.slidesDownload(r.id, r.fileName).catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Download failed" }))}>Download</button>{" "}
                    <button type="button" style={{ color: "#dc3545", background: "none", border: 0, cursor: "pointer" }} onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      )}

      {go && tab === "priority" && (
        <div style={{ margin: "34px 0 0" }}>
          {prio.length === 0 ? <div style={{ fontSize: 17 }}>No Records Found!</div> : (
            <table style={{ borderCollapse: "collapse", fontSize: 16 }}>
              <thead><tr style={{ background: "#f1f3f5", textAlign: "left" }}><th style={td}>{ptype}</th><th style={td}>Priority</th></tr></thead>
              <tbody>{prio.map((p, i) => (
                <tr key={p.item}><td style={td}>{p.item}</td>
                  <td style={td}><input type="number" min={0} value={p.priority} style={{ width: 80 }}
                    onChange={(e) => setPrio((x) => x.map((y, j) => j === i ? { ...y, priority: Number(e.target.value) } : y))}
                    onBlur={() => void savePriority(p.item, p.priority)} /></td></tr>))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
const td: React.CSSProperties = { padding: "7px 10px", border: "1px solid #dee2e6" };
