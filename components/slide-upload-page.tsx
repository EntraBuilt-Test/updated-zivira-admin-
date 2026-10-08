"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type SlideMeta, type SlideRow } from "@/lib/api-client";

// Slide Upload - E-Detailing (legacy DD_Slide_Upload.aspx): three tabs (Upload / View / Priority), storage meter, Sub Division + Brand + Go,
// Product / Speciality / Therapy pickers, the dark queue uploader with real drag-and-drop and per-file progress, and the reorderable Priority list.
// Every option comes from the real masters. Slides are stored by the backend (GridFS, one copy per brand row, 10 MB per file).

type Tab = "upload" | "view" | "priority";
type PType = "Brand" | "Product" | "Speciality" | "Therapy";
const BLUE = "#2563eb", BLUE_FADED = "#a9c1f5", ORANGE = "#ea580c", ORANGE_FADED = "#f7bfa3", INK = "#1f2937", MUTED = "#6b7280", LINE = "#d6dbe4", TINT = "#eef3ff";
const FONT = "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
const gb = (b: number) => (b / 1024 ** 3).toFixed(2);
const size = (b: number) => (b >= 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(2)} MB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} b`);

type QItem = { id: number; file: File; status: "Queued" | "Uploading" | "Done" | "Failed"; pct: number; error?: string };

const CSS = `
.sl-wrap{max-width:1180px;margin:0 auto;padding:8px 0 40px;color:${INK};font-family:${FONT}}
.sl-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.sl-head{display:flex;justify-content:center;align-items:flex-start;gap:36px;flex-wrap:wrap}
.sl-tabs{display:flex;border-radius:8px;overflow:hidden;border:1px solid ${LINE}}
.sl-tab{padding:9px 20px;font-size:16px;border:0;background:#f3f5f9;color:${INK};cursor:pointer}
.sl-tab.on{background:${BLUE};color:#fff}
.sl-meter{display:flex;align-items:flex-start;gap:12px;font-size:12px;font-weight:700}
.sl-bar{width:220px;height:34px;background:#e8edf5;border-radius:6px;overflow:hidden;position:relative}
.sl-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:26px;font-size:16px}
.sl-row label.l{min-width:104px;text-align:right}
.sl-sel{height:42px;min-width:200px;border:1px solid ${LINE};background:#f6f8fc;padding:0 12px;font-size:15px;color:${INK};border-radius:6px;text-align:left}
.sl-sel:disabled{background:${TINT};color:${BLUE_FADED};border-color:#dbe5fb}
.sl-btn{background:${BLUE};color:#fff;border:0;border-radius:6px;padding:10px 20px;font-size:16px;cursor:pointer}
.sl-btn:disabled{background:${BLUE_FADED};cursor:default}
.sl-btn.or{background:${ORANGE}} .sl-btn.or:disabled{background:${ORANGE_FADED}}
.sl-pop{position:absolute;z-index:20;top:44px;left:0;width:290px;max-height:280px;overflow-y:auto;background:#fff;border:1px solid ${LINE};border-radius:8px;box-shadow:0 6px 18px rgba(30,41,59,.18);font-size:15px}
.sl-pop label{display:flex;gap:8px;padding:6px 12px;align-items:center;cursor:pointer}
.sl-pop label:hover{background:${TINT}}
.sl-up{margin-top:28px;border:1px solid ${LINE};border-radius:8px;overflow:hidden;font-size:13px}
.sl-up-h{background:#3b4048;color:#fff;text-align:center;padding:10px 0 8px}
.sl-up-h b{font-size:20px;font-weight:500;display:block}
.sl-up-c{display:grid;grid-template-columns:1fr 110px 130px;background:#dedede;padding:8px 10px;color:#444}
.sl-up-b{background:#f5f5f5;min-height:230px;max-height:300px;overflow-y:auto;position:relative}
.sl-up-b.drag{background:${TINT};outline:2px dashed ${BLUE};outline-offset:-6px}
.sl-up-r{display:grid;grid-template-columns:1fr 110px 130px;padding:7px 10px;border-bottom:1px solid #e5e5e5;align-items:center}
.sl-up-f{background:#dedede;display:grid;grid-template-columns:1fr 110px 130px;padding:8px 10px;align-items:center}
.sl-tbl{border-collapse:collapse;width:100%;font-size:15px}
.sl-tbl th,.sl-tbl td{padding:8px 10px;border:1px solid ${LINE};text-align:left}
.sl-tbl th{background:#f3f5f9}
.sl-msg{margin-top:16px;font-size:15px}
.sl-chip{display:inline-block;font-size:12px;background:${TINT};color:${BLUE};border-radius:10px;padding:1px 8px;margin:1px 3px 1px 0}
.sl-prio{list-style:none;margin:0;padding:0;max-width:640px}
.sl-prio li{display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid ${LINE};border-radius:8px;margin-bottom:6px;background:#fff;cursor:grab}
.sl-prio li.over{border-color:${BLUE};background:${TINT}}
.sl-prio .n{width:28px;color:${MUTED}}
.sl-mini{border:1px solid ${LINE};background:#fff;border-radius:6px;padding:2px 9px;cursor:pointer}
.sl-mini:disabled{color:${BLUE_FADED};background:${TINT};cursor:default}
@media (max-width:760px){.sl-row label.l{text-align:left;min-width:0}.sl-bar{width:150px}}
`;

function Multi({ label, options, value, onChange, disabled }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <>
      <label className="l">{label} :</label>
      <div ref={ref} style={{ position: "relative" }}>
        <button type="button" className="sl-sel" disabled={disabled} onClick={() => setOpen((o) => !o)} style={{ width: 290, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", cursor: disabled ? "default" : "pointer" }}>
          {value.length ? value.join(", ") : "Nothing selected"} <span style={{ fontSize: 10 }}>&#9660;</span>
        </button>
        {open && (
          <div className="sl-pop">
            {options.map((o) => (
              <label key={o}><input type="checkbox" checked={value.includes(o)} onChange={(e) => onChange(e.target.checked ? [...value, o] : value.filter((y) => y !== o))} />{o}</label>
            ))}
            {!options.length && <div style={{ padding: 10, color: MUTED }}>No options in the master yet</div>}
          </div>
        )}
      </div>
    </>
  );
}

export function SlideUploadPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<SlideMeta | null>(null);
  const [tab, setTab] = useState<Tab>("upload");
  const [sub, setSub] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [specs, setSpecs] = useState<string[]>([]);
  const [therapies, setTherapies] = useState<string[]>([]);
  const [go, setGo] = useState(false);
  const [help, setHelp] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [queue, setQueue] = useState<QItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [rows, setRows] = useState<SlideRow[]>([]);
  const [ptype, setPtype] = useState<PType>("Brand");
  const [pitem, setPitem] = useState("");
  const [prio, setPrio] = useState<{ key: string; label: string; sub?: string }[]>([]);
  const [prioDirty, setPrioDirty] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [migrating, setMigrating] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const loadMeta = useCallback(() => apiClient.slidesMeta().then(setMeta).catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load slide storage" })), []);
  useEffect(() => { void loadMeta(); }, [loadMeta]);

  const brandOptions = useMemo(() => {
    if (!meta || !sub) return [];
    return [...new Set(meta.brandRows.filter((b) => b.subDivision === sub).map((b) => b.name))].sort((a, b) => a.localeCompare(b));
  }, [meta, sub]);
  const productOptions = useMemo(() => {
    const all = (meta?.productRows ?? []).filter((p) => !sub || p.subDivision === sub);
    const scoped = brands.length ? all.filter((p) => brands.includes(p.brand)) : all;
    return [...new Set(scoped.map((p) => p.name))].sort((a, b) => a.localeCompare(b));
  }, [meta, sub, brands]);
  const itemOptions = useMemo(() => {
    if (ptype === "Product") return [...new Set((meta?.productRows ?? []).filter((p) => !sub || p.subDivision === sub).map((p) => p.name))].sort((a, b) => a.localeCompare(b));
    if (ptype === "Speciality") return meta?.specialities ?? [];
    if (ptype === "Therapy") return meta?.therapies ?? [];
    return [];
  }, [meta, sub, ptype]);

  const pct = meta ? Math.min(100, (meta.consumedBytes / meta.allocatedBytes) * 100) : 0;
  const reset = () => { setGo(false); setMsg(null); setPrio([]); setPrioDirty(false); };
  const switchTab = (t: Tab) => { setTab(t); reset(); };

  const doGo = async () => {
    setMsg(null);
    if (!sub) { setMsg({ ok: false, text: "Select the Sub Division" }); return; }
    if (tab === "upload" && !brands.length) { setMsg({ ok: false, text: "Select the Brand" }); return; }
    try {
      if (tab === "view") setRows(await apiClient.slidesList({ subDivision: sub, brands, products, specialities: specs, therapies }));
      if (tab === "priority") await loadPriority();
      setGo(true);
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" }); }
  };

  const loadPriority = async () => {
    setPrioDirty(false);
    if (ptype === "Brand") {
      const r = (await apiClient.slidePriorityList("Brand", sub)).data;
      setPrio([...r].sort((a, b) => a.priority - b.priority).map((x) => ({ key: x.item, label: x.item })));
      return;
    }
    if (!pitem) throw new Error(`Select the ${ptype}`);
    const f = ptype === "Product" ? { products: [pitem] } : ptype === "Speciality" ? { specialities: [pitem] } : { therapies: [pitem] };
    const r = await apiClient.slidesList({ subDivision: sub, ...f });
    setPrio([...r].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9)).map((x) => ({ key: x.id, label: x.fileName, sub: x.brand })));
  };

  const addFiles = (list: FileList | File[] | null) => {
    const arr = Array.from(list ?? []);
    if (!arr.length) return;
    const max = meta?.maxFileBytes ?? 10 * 1024 ** 2;
    setQueue((q) => [...q, ...arr.map((file): QItem => file.size > max
      ? { id: nextId.current++, file, status: "Failed", pct: 0, error: `Over ${Math.round(max / 1024 ** 2)} MB` }
      : { id: nextId.current++, file, status: "Queued", pct: 0 })]);
  };

  const patchQ = (id: number, p: Partial<QItem>) => setQueue((q) => q.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const startUpload = async () => {
    const todo = queue.filter((q) => q.status === "Queued" || (q.status === "Failed" && !q.error?.startsWith("Over")));
    if (!todo.length) return;
    setBusy(true); setMsg(null);
    const fields = { subDivision: sub, brands: brands.join("|"), products: products.join("|"), specialities: specs.join("|"), therapies: therapies.join("|") };
    let ok = 0, bad = 0;
    for (const it of todo) {
      patchQ(it.id, { status: "Uploading", pct: 0, error: undefined });
      try { await apiClient.slidesUploadOne(it.file, fields, (p) => patchQ(it.id, { pct: p })); patchQ(it.id, { status: "Done", pct: 100 }); ok++; }
      catch (e) { patchQ(it.id, { status: "Failed", error: e instanceof Error ? e.message : "Failed" }); bad++; }
    }
    setBusy(false);
    setMsg({ ok: bad === 0, text: `${ok} file(s) uploaded for ${brands.length} brand(s)${bad ? `, ${bad} failed` : ""}.` });
    await loadMeta();
  };

  const remove = async (r: SlideRow) => {
    if (!window.confirm(`Delete ${r.fileName} (${r.brand})?`)) return;
    try { await apiClient.slidesDelete(r.id); setRows((x) => x.filter((y) => y.id !== r.id)); await loadMeta(); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Delete failed" }); }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= prio.length || from === to) return;
    setPrio((p) => { const n = [...p]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; });
    setPrioDirty(true);
  };

  const savePriority = async () => {
    try {
      if (ptype === "Brand") await apiClient.saveSlidePriorityOrder({ type: "Brand", subDivision: sub, items: prio.map((p) => p.key) });
      else await apiClient.slidesOrder(prio.map((p) => p.key));
      setPrioDirty(false); setMsg({ ok: true, text: "Priority saved." });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not save the priority" }); }
  };

  const migrate = async () => {
    setMigrating(true); setMsg(null);
    try { await apiClient.slidesMigrate(); setMsg({ ok: true, text: "Old slides moved to the new storage." }); await loadMeta(); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Migration failed" }); }
    finally { setMigrating(false); }
  };

  const totalBytes = queue.reduce((s, q) => s + q.file.size, 0);
  const overall = queue.length ? Math.round(queue.reduce((s, q) => s + (q.status === "Done" ? 100 : q.pct), 0) / queue.length) : 0;
  const pending = queue.some((q) => q.status === "Queued" || (q.status === "Failed" && !q.error?.startsWith("Over")));
  const msgColor = msg?.ok ? "#15803d" : "#b91c1c";

  return (
    <div className="sl-wrap">
      <style>{CSS}</style>
      <div className="sl-top">
        <button type="button" onClick={() => setHelp((h) => !h)} style={{ color: BLUE, background: "none", border: 0, fontSize: 16, cursor: "pointer" }}>Help <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, background: BLUE, color: "#fff", fontSize: 12, textAlign: "center", lineHeight: "18px" }}>?</span></button>
        <div style={{ display: "flex", gap: 10 }}>
          {!!meta?.legacySlides && <button type="button" className="sl-btn or" disabled={migrating} onClick={migrate} style={{ padding: "8px 14px", fontSize: 14 }}>{migrating ? "Migrating..." : `Migrate old slides (${meta.legacySlides})`}</button>}
          <button type="button" className="sl-btn" onClick={() => (window.history.length > 1 ? router.back() : router.push("/admin/home"))} style={{ padding: "8px 14px", fontSize: 15 }}>Back</button>
        </div>
      </div>
      {help && <div style={{ background: TINT, border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 }}>Upload slides per Sub Division and Brand (optionally tagged by Product, Speciality and Therapy), view or delete uploaded slides, and set their priority. Each file can be up to {meta ? Math.round(meta.maxFileBytes / 1024 ** 2) : 10} MB.</div>}

      <div className="sl-head">
        <div className="sl-tabs">{(["upload", "view", "priority"] as Tab[]).map((t) => <button key={t} type="button" className={`sl-tab${tab === t ? " on" : ""}`} onClick={() => switchTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
        <div className="sl-meter">
          <div style={{ textAlign: "center", paddingTop: 4 }}>{meta ? gb(meta.consumedBytes) : "0.00"}GB<br />Consumed</div>
          <div>
            <div className="sl-bar"><div style={{ width: `${pct}%`, height: "100%", background: BLUE }} /><span style={{ position: "absolute", left: 4, top: 7, color: pct > 8 ? "#fff" : MUTED, fontSize: 15, fontWeight: 400 }}>{pct.toFixed(2)}%</span></div>
            <div style={{ textAlign: "center", marginTop: 14 }}>{meta ? gb(meta.remainingBytes) : "5.10"} GB Remaining</div>
          </div>
          <div style={{ textAlign: "center", width: 90, paddingTop: 4 }}>{meta ? Math.round(meta.allocatedBytes / 1024 ** 3) : 5}GB<br />Allocated<br />(Extra 2%<br />Will Allow)</div>
        </div>
      </div>

      {tab === "priority" ? (
        <>
          <div className="sl-row" style={{ gap: 40, justifyContent: "center" }}>
            <span>Update Priority for :</span>
            {(["Brand", "Product", "Speciality", "Therapy"] as PType[]).map((t) => (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="radio" name="ptype" checked={ptype === t} onChange={() => { setPtype(t); setPitem(""); reset(); }} />{t}</label>
            ))}
          </div>
          <div className="sl-row" style={{ justifyContent: "center" }}>
            <label className="l">Sub Division :</label>
            <select className="sl-sel" value={sub} onChange={(e) => { setSub(e.target.value); setPitem(""); reset(); }}>
              <option value="">---Select---</option>
              {(meta?.subDivisions ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {ptype !== "Brand" && (
              <>
                <label className="l" style={{ minWidth: 80 }}>{ptype}</label>
                <select className="sl-sel" value={pitem} onChange={(e) => { setPitem(e.target.value); reset(); }}>
                  <option value="">---Select---</option>
                  {itemOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </>
            )}
            <button type="button" className="sl-btn" onClick={doGo}>Go</button>
          </div>
        </>
      ) : (
        <>
          <div className="sl-row" style={{ justifyContent: "center" }}>
            <label className="l">Division :</label>
            <select className="sl-sel" disabled><option>{meta?.division || "Zivira Labs Pvt Ltd"}</option></select>
            <label className="l">Sub Division :</label>
            <select className="sl-sel" value={sub} onChange={(e) => { setSub(e.target.value); setBrands([]); setProducts([]); reset(); }}>
              <option value="">---Select---</option>
              {(meta?.subDivisions ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Multi label="Brand" options={brandOptions} value={brands} disabled={!sub} onChange={(v) => { setBrands(v); setProducts([]); reset(); }} />
            <button type="button" className="sl-btn" onClick={doGo}>Go</button>
          </div>
          {(go || tab === "view") && (
            <div className="sl-row" style={{ justifyContent: "center" }}>
              <Multi label="Product" options={productOptions} value={products} onChange={setProducts} />
              <Multi label="Speciality" options={meta?.specialities ?? []} value={specs} onChange={setSpecs} />
              <Multi label="Therapy" options={meta?.therapies ?? []} value={therapies} onChange={setTherapies} />
            </div>
          )}
        </>
      )}

      {msg && <div className="sl-msg" style={{ color: msgColor, textAlign: "center" }}>{msg.text}</div>}

      {go && tab === "upload" && (
        <div className="sl-up">
          <div className="sl-up-h"><b>Select files</b>Add files to the upload queue and click the start button.</div>
          <div className="sl-up-c"><span>Filename</span><span>Size</span><span>Status</span></div>
          <div className={`sl-up-b${drag ? " drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
            {!queue.length && <div style={{ textAlign: "center", paddingTop: 100, color: "#444" }}>Drag files here.</div>}
            {queue.map((q) => (
              <div key={q.id} className="sl-up-r">
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.file.name}</span>
                <span>{size(q.file.size)}</span>
                <span style={{ color: q.status === "Failed" ? "#b91c1c" : q.status === "Done" ? "#15803d" : INK }} title={q.error}>
                  {q.status === "Uploading" ? `${q.pct}%` : q.status === "Failed" ? q.error || "Failed" : q.status}
                  {q.status === "Queued" && !busy && <button type="button" className="sl-mini" style={{ marginLeft: 8 }} onClick={() => setQueue((x) => x.filter((y) => y.id !== q.id))}>x</button>}
                </span>
              </div>
            ))}
          </div>
          <div className="sl-up-f">
            <span>
              <input ref={fileInput} type="file" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <button type="button" className="sl-mini" disabled={busy} onClick={() => fileInput.current?.click()}>+ Add Files</button>{" "}
              <button type="button" className="sl-mini" disabled={busy || !pending} onClick={startUpload}>Start Upload</button>
              {!!queue.length && !busy && <button type="button" className="sl-mini" style={{ marginLeft: 8 }} onClick={() => setQueue([])}>Clear</button>}
            </span>
            <span>{size(totalBytes)}</span><span>{overall}%</span>
          </div>
        </div>
      )}

      {go && tab === "view" && (
        <div style={{ margin: "30px 0 0", overflowX: "auto" }}>
          {rows.length === 0 ? <div style={{ fontSize: 16, textAlign: "center" }}>No Records Found!</div> : (
            <table className="sl-tbl">
              <thead><tr>{["File name", "Sub Division", "Brand", "Product / Speciality / Therapy", "Pages", "Size", "Uploaded on", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.fileName}</td><td>{r.subDivision}</td><td>{r.brand}</td>
                  <td>{[...(r.products ?? []), ...(r.specialities ?? []), ...(r.therapies ?? [])].map((x) => <span key={x} className="sl-chip">{x}</span>)}</td>
                  <td>{r.pages ?? ""}</td>
                  <td>{r.size != null ? size(r.size) : ""}</td>
                  <td>{r.uploadedOn ? new Date(r.uploadedOn).toLocaleDateString("en-GB") : ""}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button type="button" style={{ color: BLUE, background: "none", border: 0, cursor: "pointer" }} onClick={() => apiClient.slidesDownload(r.id, r.fileName).catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Download failed" }))}>Download</button>{" "}
                    <button type="button" style={{ color: ORANGE, background: "none", border: 0, cursor: "pointer" }} onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      )}

      {go && tab === "priority" && (
        <div style={{ margin: "30px auto 0", maxWidth: 640 }}>
          {prio.length === 0 ? <div style={{ fontSize: 16, textAlign: "center" }}>No Records Found!</div> : (
            <>
              <div style={{ fontSize: 14, color: MUTED, marginBottom: 8 }}>Drag a row, or use the arrows, to set the order. Priority 1 is shown first.</div>
              <ul className="sl-prio">
                {prio.map((p, i) => (
                  <li key={p.key} draggable className={overIdx === i && dragIdx !== i ? "over" : ""}
                    onDragStart={() => setDragIdx(i)} onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
                    onDrop={() => { if (dragIdx != null) move(dragIdx, i); setDragIdx(null); setOverIdx(null); }} onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}>
                    <span className="n">{i + 1}</span>
                    <span style={{ flex: 1 }}>{p.label}{p.sub ? <span style={{ color: MUTED }}> ({p.sub})</span> : null}</span>
                    <button type="button" className="sl-mini" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">&#9650;</button>
                    <button type="button" className="sl-mini" disabled={i === prio.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down">&#9660;</button>
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: "center", marginTop: 14 }}><button type="button" className="sl-btn or" disabled={!prioDirty} onClick={savePriority}>Save Priority</button></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
