"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
.sl-wrap{--c-ink:${INK};--c-mute:${MUTED};--c-line:${LINE};--c-tint:${TINT};--c-card:#fff;--c-field:#fff;--c-seg:#f3f5f9;--c-bar:#e8edf5;--c-dis:#eef2f9;--c-dis-ink:#4b5563;--c-head:#3b4048;--c-col:#dedede;--c-body:#f5f5f5;--c-row:#e5e5e5;--c-hl:#fff;max-width:1180px;width:100%;margin:0 auto;padding:8px 0 40px;color:var(--c-ink);font-family:${FONT};font-size:15px;box-sizing:border-box}
.dark .sl-wrap,[data-theme="dark"] .sl-wrap{--c-ink:#e5e7eb;--c-mute:#9ca3af;--c-line:#374151;--c-tint:#1e2a4a;--c-card:#111827;--c-field:#0f172a;--c-seg:#1f2937;--c-bar:#1f2937;--c-dis:#1a2234;--c-dis-ink:#cbd5e1;--c-head:#0b1220;--c-col:#1f2937;--c-body:#111827;--c-row:#243044;--c-hl:#0f172a}
.sl-wrap *,.sl-wrap *::before,.sl-wrap *::after{box-sizing:border-box}
.sl-wrap .sl-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 0 18px;min-height:40px}
.sl-wrap .sl-help{display:inline-flex!important;align-items:center;gap:6px;width:auto!important;color:${BLUE};background:none;border:0;font-size:16px;cursor:pointer;padding:0}
.sl-wrap .sl-help i{display:inline-block;width:18px;height:18px;border-radius:9px;background:${BLUE};color:#fff;font:600 12px/18px ${FONT};text-align:center;font-style:normal}
.sl-wrap .sl-head{display:flex;justify-content:center;align-items:flex-start;gap:36px;flex-wrap:wrap;margin:0 0 26px}
.sl-wrap .sl-tabs{display:inline-flex;border-radius:8px;overflow:hidden;border:1px solid var(--c-line);height:40px}
.sl-wrap .sl-tab{width:auto!important;height:40px;padding:0 22px;font-size:16px;border:0;background:var(--c-seg);color:var(--c-ink);cursor:pointer}
.sl-wrap .sl-tab.on{background:${BLUE};color:#fff}
.sl-wrap .sl-meter{display:flex;align-items:flex-start;gap:14px;font-size:12px;font-weight:700;color:var(--c-ink)}
.sl-wrap .sl-meter>div{line-height:40px;white-space:nowrap}
.sl-wrap .sl-m-l{width:112px;text-align:right}
.sl-wrap .sl-m-m{width:220px;text-align:center}
.sl-wrap .sl-m-r{text-align:left}
.sl-wrap .sl-bar{width:220px;height:40px;background:var(--c-bar);border:1px solid var(--c-line);border-radius:6px;overflow:hidden;position:relative}
.sl-wrap .sl-bar-t{position:absolute;right:8px;top:0;line-height:38px;font-size:12px;font-weight:600}
.sl-wrap .sl-rem{line-height:20px;margin-top:6px;text-align:center}
.sl-wrap .sl-filters{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:16px 24px;margin:0 0 18px}
.sl-wrap .sl-pair{display:inline-grid;grid-template-columns:auto var(--w,200px);align-items:center;column-gap:10px;font-size:16px}
.sl-wrap .sl-pair>label.l{display:block!important;width:auto!important;margin:0;text-align:right;white-space:nowrap;font-weight:600;color:var(--c-ink)}
.sl-wrap .sl-pair>div{width:var(--w,200px);position:relative}
.sl-wrap .sl-sel,.sl-wrap select.sl-sel,.sl-wrap button.sl-sel{display:block;height:40px!important;width:var(--w,200px)!important;min-width:0!important;max-width:100%;margin:0;padding:0 12px;font:400 15px/38px ${FONT};color:var(--c-ink);background:var(--c-field);border:1px solid var(--c-line);border-radius:6px;text-align:left;box-shadow:none}
.sl-wrap select.sl-sel{padding-right:6px;text-overflow:ellipsis;-webkit-text-fill-color:currentColor;opacity:1}
.sl-wrap .sl-sel:disabled{background:var(--c-dis);color:var(--c-dis-ink)!important;-webkit-text-fill-color:var(--c-dis-ink)!important;opacity:1;border-color:var(--c-line);cursor:default}
.sl-wrap button.sl-sel{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px}
.sl-wrap button.sl-sel .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.sl-wrap button.sl-sel .t.ph{color:var(--c-mute)}
.sl-wrap button.sl-sel .ar{flex:none;font-size:10px;color:var(--c-mute)}
.sl-wrap .sl-btn{width:auto!important;height:40px;background:${BLUE};color:#fff;border:0;border-radius:6px;padding:0 24px;font-size:16px;cursor:pointer}
.sl-wrap .sl-btn:disabled{background:${BLUE_FADED};cursor:default}
.sl-wrap .sl-btn.or{background:${ORANGE}}.sl-wrap .sl-btn.or:disabled{background:${ORANGE_FADED}}
.sl-wrap .sl-pop{position:absolute;z-index:30;top:44px;left:0;width:100%;min-width:200px;max-height:260px;overflow-y:auto;background:var(--c-card);border:1px solid var(--c-line);border-radius:8px;box-shadow:0 8px 22px rgba(15,23,42,.22);font-size:15px}
.sl-wrap .sl-pop label{display:flex!important;width:auto!important;gap:8px;padding:7px 12px;align-items:center;cursor:pointer;text-align:left;margin:0;font-weight:400}
.sl-wrap .sl-pop label:hover{background:var(--c-tint)}
.sl-wrap .sl-pop input{width:auto!important;height:auto!important;margin:0}
.sl-wrap .sl-prow{display:flex;flex-wrap:wrap;justify-content:center;gap:16px 48px;align-items:center;margin:0 0 18px;font-size:16px}
.sl-wrap .sl-prow label{display:inline-flex!important;width:auto!important;align-items:center;gap:8px;cursor:pointer;margin:0}
.sl-wrap .sl-prow input[type=radio]{width:16px!important;height:16px!important;margin:0}
.sl-wrap .sl-up{margin-top:28px;width:100%;border:1px solid var(--c-line);border-radius:8px;overflow:hidden;font-size:13px}
.sl-wrap .sl-up-h{background:var(--c-head);color:#fff;text-align:center;padding:10px 0 8px}
.sl-wrap .sl-up-h b{font-size:20px;font-weight:500;display:block}
.sl-wrap .sl-up-c,.sl-wrap .sl-up-r,.sl-wrap .sl-up-f{display:grid;grid-template-columns:minmax(0,1fr) 90px 100px;column-gap:10px;align-items:center;padding:8px 12px}
.sl-wrap .sl-up-c,.sl-wrap .sl-up-f{background:var(--c-col);color:var(--c-ink)}
.sl-wrap .sl-up-b{background:var(--c-body);color:var(--c-ink);min-height:230px;max-height:300px;overflow-y:auto;position:relative}
.sl-wrap .sl-up-b.drag{background:var(--c-tint);outline:2px dashed ${BLUE};outline-offset:-6px}
.sl-wrap .sl-up-r{border-bottom:1px solid var(--c-row)}
.sl-wrap .sl-up-f .btns{display:flex;gap:8px;align-items:center}
.sl-wrap .sl-card{border:1px solid var(--c-line);border-radius:8px;background:var(--c-card);padding:18px;margin-top:8px}
.sl-wrap .sl-empty{text-align:center;font-size:16px;padding:26px 0;color:var(--c-ink)}
.sl-wrap .sl-tbl{border-collapse:collapse;width:100%;font-size:15px}
.sl-wrap .sl-tbl th,.sl-wrap .sl-tbl td{padding:8px 10px;border:1px solid var(--c-line);text-align:left}
.sl-wrap .sl-tbl th{background:var(--c-seg)}
.sl-wrap .sl-msg{margin-top:12px;font-size:15px;text-align:center}
.sl-wrap .sl-chip{display:inline-block;font-size:12px;background:var(--c-tint);color:${BLUE};border-radius:10px;padding:1px 8px;margin:1px 3px 1px 0}
.sl-wrap .sl-prio{list-style:none;margin:0 auto;padding:0;max-width:640px}
.sl-wrap .sl-prio li{display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--c-line);border-radius:8px;margin-bottom:6px;background:var(--c-field);cursor:grab}
.sl-wrap .sl-prio li.over{border-color:${BLUE};background:var(--c-tint)}
.sl-wrap .sl-prio .n{width:28px;color:var(--c-mute)}
.sl-wrap .sl-mini{width:auto!important;height:28px;border:1px solid var(--c-line);background:var(--c-field);color:var(--c-ink);border-radius:6px;padding:0 10px;cursor:pointer}
.sl-wrap .sl-mini:disabled{color:${BLUE_FADED};background:var(--c-tint);cursor:default}
@media (max-width:900px){.sl-wrap .sl-pair{grid-template-columns:auto var(--w,200px)}.sl-wrap .sl-pair>label.l{text-align:left}.sl-wrap .sl-pair.m{--w:min(320px,calc(100vw - 150px))}}
@media (max-width:640px){.sl-wrap .sl-pair{grid-template-columns:1fr;row-gap:4px}.sl-wrap .sl-pair>label.l{text-align:left}.sl-wrap .sl-pair{--w:min(320px,calc(100vw - 64px))}}
`;

function Multi({ label, options, value, onChange, disabled, w = 200 }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean; w?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="sl-pair" style={{ ["--w" as string]: `${w}px` }}>
      <label className="l">{label} :</label>
      <div ref={ref}>
        <button type="button" className="sl-sel" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} title={value.join(", ")}>
          <span className={`t${value.length ? "" : " ph"}`}>{value.length ? value.join(", ") : "Nothing selected"}</span><span className="ar">&#9660;</span>
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
    </div>
  );
}

export function SlideUploadPage() {
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
        <button type="button" className="sl-help" onClick={() => setHelp((h) => !h)}>Help <i>?</i></button>
        {!!meta?.legacySlides && <button type="button" className="sl-btn or" disabled={migrating} onClick={migrate} style={{ height: 36, fontSize: 14, padding: "0 14px" }}>{migrating ? "Migrating..." : `Migrate old slides (${meta.legacySlides})`}</button>}
      </div>
      {help && <div style={{ background: TINT, border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 }}>Upload slides per Sub Division and Brand (optionally tagged by Product, Speciality and Therapy), view or delete uploaded slides, and set their priority. Each file can be up to {meta ? Math.round(meta.maxFileBytes / 1024 ** 2) : 10} MB.</div>}

      <div className="sl-head">
        <div className="sl-tabs">{(["upload", "view", "priority"] as Tab[]).map((t) => <button key={t} type="button" className={`sl-tab${tab === t ? " on" : ""}`} onClick={() => switchTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
        <div className="sl-meter">
          <div className="sl-m-l">{meta ? gb(meta.consumedBytes) : "0.00"}GB Consumed</div>
          <div className="sl-m-m">
            <div className="sl-bar"><div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: BLUE, opacity: 0.35 }} /><span className="sl-bar-t">{pct.toFixed(2)}%</span></div>
            <div className="sl-rem">{meta ? gb(meta.remainingBytes) : "5.10"} GB Remaining</div>
          </div>
          <div className="sl-m-r">{meta ? Math.round(meta.allocatedBytes / 1024 ** 3) : 5}GB Allocated (Extra 2% Will Allow)</div>
        </div>
      </div>

      {tab === "priority" ? (
        <>
          <div className="sl-prow">
            <span style={{ fontWeight: 600 }}>Update Priority for :</span>
            {(["Brand", "Product", "Speciality", "Therapy"] as PType[]).map((t) => (
              <label key={t}><input type="radio" name="ptype" checked={ptype === t} onChange={() => { setPtype(t); setPitem(""); reset(); }} />{t}</label>
            ))}
          </div>
          <div className="sl-filters">
            <div className="sl-pair">
              <label className="l">Sub Division :</label>
              <select className="sl-sel" value={sub} onChange={(e) => { setSub(e.target.value); setPitem(""); reset(); }}>
                <option value="">---Select---</option>
                {(meta?.subDivisions ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {ptype !== "Brand" && (
              <div className="sl-pair">
                <label className="l">{ptype} :</label>
                <select className="sl-sel" value={pitem} onChange={(e) => { setPitem(e.target.value); reset(); }}>
                  <option value="">---Select---</option>
                  {itemOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <button type="button" className="sl-btn" onClick={doGo}>Go</button>
          </div>
        </>
      ) : (
        <>
          <div className="sl-filters">
            <div className="sl-pair">
              <label className="l">Division :</label>
              <select className="sl-sel" disabled><option>{meta?.division || "Zivira Labs Pvt Ltd"}</option></select>
            </div>
            <div className="sl-pair">
              <label className="l">Sub Division :</label>
              <select className="sl-sel" value={sub} onChange={(e) => { setSub(e.target.value); setBrands([]); setProducts([]); reset(); }}>
                <option value="">---Select---</option>
                {(meta?.subDivisions ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Multi label="Brand" w={200} options={brandOptions} value={brands} disabled={!sub} onChange={(v) => { setBrands(v); setProducts([]); reset(); }} />
            <button type="button" className="sl-btn" onClick={doGo}>Go</button>
          </div>
          {(go || tab === "view") && (
            <div className="sl-filters">
              <Multi label="Product" w={320} options={productOptions} value={products} onChange={setProducts} />
              <Multi label="Speciality" w={320} options={meta?.specialities ?? []} value={specs} onChange={setSpecs} />
              <Multi label="Therapy" w={320} options={meta?.therapies ?? []} value={therapies} onChange={setTherapies} />
            </div>
          )}
        </>
      )}

      {msg && <div className="sl-msg" style={{ color: msgColor }}>{msg.text}</div>}

      {go && tab === "upload" && (
        <div className="sl-up">
          <div className="sl-up-h"><b>Select files</b>Add files to the upload queue and click the start button.</div>
          <div className="sl-up-c"><span>Filename</span><span>Size</span><span>Status</span></div>
          <div className={`sl-up-b${drag ? " drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
            {!queue.length && <div style={{ textAlign: "center", paddingTop: 100 }}>Drag files here.</div>}
            {queue.map((q) => (
              <div key={q.id} className="sl-up-r">
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{q.file.name}</span>
                <span>{size(q.file.size)}</span>
                <span style={{ color: q.status === "Failed" ? "#b91c1c" : q.status === "Done" ? "#15803d" : INK }} title={q.error}>
                  {q.status === "Uploading" ? `${q.pct}%` : q.status === "Failed" ? q.error || "Failed" : q.status}
                  {q.status === "Queued" && !busy && <button type="button" className="sl-mini" style={{ marginLeft: 8 }} onClick={() => setQueue((x) => x.filter((y) => y.id !== q.id))}>x</button>}
                </span>
              </div>
            ))}
          </div>
          <div className="sl-up-f">
            <span className="btns">
              <input ref={fileInput} type="file" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <button type="button" className="sl-mini" disabled={busy} onClick={() => fileInput.current?.click()}>+ Add Files</button>
              <button type="button" className="sl-mini" disabled={busy || !pending} onClick={startUpload} style={busy || !pending ? undefined : { background: ORANGE, borderColor: ORANGE, color: "#fff" }}>Start Upload</button>
              {!!queue.length && !busy && <button type="button" className="sl-mini" onClick={() => setQueue([])}>Clear</button>}
            </span>
            <span>{size(totalBytes)}</span><span>{overall}%</span>
          </div>
        </div>
      )}

      {go && tab === "view" && (
        <div className="sl-card" style={{ overflowX: "auto" }}>
          {rows.length === 0 ? <div className="sl-empty">No Records Found!</div> : (
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
        <div className="sl-card">
          {prio.length === 0 ? <div className="sl-empty">No Records Found!</div> : (
            <>
              <div style={{ fontSize: 14, color: MUTED, marginBottom: 8, textAlign: "center" }}>Drag a row, or use the arrows, to set the order. Priority 1 is shown first.</div>
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
