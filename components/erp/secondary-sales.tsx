"use client";
// Phase 2 ERP (ENT-ZVR-2026-P2) -- Secondary Sales.
// Upload a distributor's Stock & Sales statement, check what was read,
// save it, and see Zivira's "Secondary Sales Compilation" grid.
import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { parseStatement, type ParsedStatement, type StatementLine } from "@/lib/erp/statement-parser";
import { matchProduct } from "@/lib/erp/products";
import { readStatementFile } from "@/lib/erp/read-file";
import { erpRequest, type CompilationRow, type SalesProduct, type SalesStockist, type StatementSummary } from "@/lib/erp/erp-api";

type Tab = "upload" | "statements" | "compilation" | "products" | "stockists";
const TABS: { key: Tab; label: string }[] = [
  { key: "upload", label: "Upload statement" },
  { key: "statements", label: "Saved statements" },
  { key: "compilation", label: "Compilation" },
  { key: "products", label: "Products & PTS" },
  { key: "stockists", label: "Stockists" }
];

const btn = "px-3 py-1.5 rounded-md text-sm font-semibold border border-border-subtle bg-surface-card hover:bg-surface-subtle disabled:opacity-50";
const btnPrimary = "px-4 py-2 rounded-md text-sm font-semibold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50";
const input = "h-9 px-2 rounded-md border border-border-subtle bg-surface-card text-sm w-full";
const th = "px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-text-muted bg-surface-subtle whitespace-nowrap";
const td = "px-2 py-1.5 text-sm border-t border-border-subtle whitespace-nowrap";

function monthLabel(m: string) {
  const [y, mm] = m.split("-");
  const names = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${names[Number(mm) - 1] ?? mm}'${y.slice(2)}`;
}

export function SecondarySales() {
  const [tab, setTab] = useState<Tab>("upload");
  const [products, setProducts] = useState<SalesProduct[]>([]);
  const [stockists, setStockists] = useState<SalesStockist[]>([]);
  const [error, setError] = useState("");

  const loadMasters = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        erpRequest<{ data: SalesProduct[] }>("/products"),
        erpRequest<{ data: SalesStockist[] }>("/stockists")
      ]);
      setProducts(p.data);
      setStockists(s.data);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load products"); }
  }, []);
  useEffect(() => { void loadMasters(); }, [loadMasters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${tab === t.key ? "bg-primary text-on-primary border-primary" : "border-border-subtle bg-surface-card"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {error && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {tab === "upload" && <UploadPanel products={products} stockists={stockists} onSaved={() => { void loadMasters(); setTab("statements"); }} />}
      {tab === "statements" && <StatementsPanel />}
      {tab === "compilation" && <CompilationPanel />}
      {tab === "products" && <ProductsPanel products={products} reload={loadMasters} />}
      {tab === "stockists" && <StockistsPanel stockists={stockists} reload={loadMasters} />}
    </div>
  );
}

// ── Upload ───────────────────────────────────────────────────────────────
type DraftLine = StatementLine & { product: string; include: boolean };

function UploadPanel({ products, stockists, onSaved }: { products: SalesProduct[]; stockists: SalesStockist[]; onSaved: () => void }) {
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [parsed, setParsed] = useState<ParsedStatement | null>(null);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [head, setHead] = useState({ name: "", gstin: "", state: "", hq: "", place: "", division: "", month: "" });
  const [msg, setMsg] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr(""); setMsg(""); setBusy(true); setFileName(file.name);
    try {
      const text = await readStatementFile(file);
      const p = parseStatement(text);
      setParsed(p);
      const known = stockists.find((s) => s.name === p.stockistName.toUpperCase());
      setHead({
        name: p.stockistName.toUpperCase(), gstin: p.gstin || known?.gstin || "",
        state: known?.state ?? "", hq: known?.hq ?? "", place: known?.place || p.place.toUpperCase(),
        division: known?.division ?? "", month: p.month
      });
      setLines(p.lines.map((l) => {
        const product = matchProduct(l.rawName, l.pack, products);
        return { ...l, product, include: true };
      }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not read this file");
      setParsed(null); setLines([]);
    } finally { setBusy(false); }
  }

  const unmatched = lines.filter((l) => l.include && !l.product).length;
  const included = lines.filter((l) => l.include);

  async function save() {
    setErr(""); setMsg(""); setBusy(true);
    try {
      if (!head.name.trim()) throw new Error("Enter the stockist name.");
      if (!/^\d{4}-\d{2}$/.test(head.month)) throw new Error("Pick the statement month.");
      if (unmatched) throw new Error(`Pick a product for ${unmatched} line(s) or untick them.`);
      await erpRequest("/statements", {
        method: "POST",
        body: JSON.stringify({
          stockist: { name: head.name, gstin: head.gstin, state: head.state, hq: head.hq, place: head.place, division: head.division },
          month: head.month, periodFrom: parsed?.periodFrom ?? "", periodTo: parsed?.periodTo ?? "",
          sourceFile: fileName, format: parsed?.format ?? "",
          lines: included.map((l) => ({ product: l.product, rawName: l.rawName, pack: l.pack, opening: l.opening, primary: l.primary, primaryFree: l.primaryFree, purchaseReturn: l.purchaseReturn, secondary: l.secondary, secondaryFree: l.secondaryFree, salesReturn: l.salesReturn, closing: l.closing, secondaryValue: l.secondaryValue }))
        })
      });
      setMsg(`Saved ${included.length} product lines for ${head.name} (${monthLabel(head.month)}).`);
      setParsed(null); setLines([]); setFileName("");
      onSaved();
    } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-border-subtle bg-surface-card">
        <p className="text-sm text-text-secondary mb-3">
          Upload one distributor statement (PDF, Excel or CSV). The system reads it, shows each product below for checking, then saves it into the monthly compilation. Uploading the same stockist and month again replaces the earlier one.
        </p>
        <input type="file" accept=".pdf,.xlsx,.xls,.csv,.txt" disabled={busy} onChange={(e) => void onFile(e.target.files?.[0])} />
        {busy && <span className="ml-3 text-sm text-text-muted">Reading…</span>}
      </div>
      {err && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{err}</div>}
      {msg && <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">{msg}</div>}

      {parsed && (
        <>
          {parsed.warnings.map((w) => <div key={w} className="p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">{w}</div>)}
          <div className="p-4 rounded-xl border border-border-subtle bg-surface-card grid grid-cols-1 md:grid-cols-4 gap-3">
            {([["name", "Stockist / customer"], ["gstin", "GSTIN"], ["state", "State"], ["hq", "HQ"], ["place", "Place"], ["division", "Division"]] as const).map(([k, label]) => (
              <label key={k} className="text-xs font-semibold text-text-muted">{label}
                <input className={input} value={head[k]} onChange={(e) => setHead({ ...head, [k]: e.target.value.toUpperCase() })} />
              </label>
            ))}
            <label className="text-xs font-semibold text-text-muted">Month
              <input type="month" className={input} value={head.month} onChange={(e) => setHead({ ...head, month: e.target.value })} />
            </label>
            <div className="text-xs text-text-muted self-end">Layout read as: <strong>{parsed.format ?? "basic"}</strong> · {lines.length} lines</div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-card overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className={th}>Use</th><th className={th}>On statement</th><th className={th}>Product</th>
                <th className={th}>Opening</th><th className={th}>Primary</th><th className={th}>Free</th><th className={th}>P.Return</th>
                <th className={th}>Secondary</th><th className={th}>S.Return</th><th className={th}>Closing</th>
              </tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={`${l.rawName}-${i}`} className={l.include && !l.product ? "bg-amber-50" : ""}>
                    <td className={td}><input type="checkbox" checked={l.include} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, include: e.target.checked } : x))} /></td>
                    <td className={td}>{l.rawName} <span className="text-text-muted">{l.pack}</span></td>
                    <td className={td}>
                      <select className={input} value={l.product} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, product: e.target.value } : x))}>
                        <option value="">— pick —</option>
                        {products.filter((p) => p.active !== false).map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className={td}>{l.opening}</td><td className={td}>{l.primary}</td><td className={td}>{l.primaryFree}</td>
                    <td className={td}>{l.purchaseReturn}</td><td className={td}>{l.secondary}</td><td className={td}>{l.salesReturn}</td><td className={td}>{l.closing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className={btnPrimary} disabled={busy || !included.length} onClick={() => void save()}>Save statement</button>
            {unmatched > 0 && <span className="text-sm text-amber-700">{unmatched} line(s) need a product.</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ── Saved statements ─────────────────────────────────────────────────────
function StatementsPanel() {
  const [rows, setRows] = useState<StatementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { setRows((await erpRequest<{ data: StatementSummary[] }>("/statements")).data); setErr(""); }
    catch (e) { setErr(e instanceof Error ? e.message : "Load failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function remove(r: StatementSummary) {
    if (!window.confirm(`Delete the ${monthLabel(r.month)} statement of ${r.stockistName}? This cannot be undone.`)) return;
    try { await erpRequest(`/statements/${r.id}`, { method: "DELETE" }); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Delete failed"); }
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card overflow-x-auto">
      {err && <div className="p-3 text-red-700 text-sm">{err}</div>}
      <table className="w-full">
        <thead><tr><th className={th}>Month</th><th className={th}>Stockist</th><th className={th}>Products</th><th className={th}>Primary qty</th><th className={th}>Secondary qty</th><th className={th}>File</th><th className={th}></th></tr></thead>
        <tbody>
          {loading ? <tr><td className={td} colSpan={7}>Loading…</td></tr> :
            rows.length === 0 ? <tr><td className={td} colSpan={7}>No statements saved yet.</td></tr> :
            rows.map((r) => (
              <tr key={r.id}>
                <td className={td}>{monthLabel(r.month)}</td><td className={td}>{r.stockistName}</td><td className={td}>{r.lineCount}</td>
                <td className={td}>{r.primary}</td><td className={td}>{r.secondary}</td><td className={td}>{r.sourceFile}</td>
                <td className={td}><button type="button" className={btn} onClick={() => void remove(r)}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Compilation grid ─────────────────────────────────────────────────────
const CELL_COLS: { key: keyof CompilationRow["months"][string]; label: string }[] = [
  { key: "primary", label: "PRIMARY" }, { key: "primaryFree", label: "PRIMARY FREE" }, { key: "ret", label: "RET" },
  { key: "nPrimary", label: "N.PRIMARY" }, { key: "secondary", label: "SECONDARY" }, { key: "nSecondary", label: "N.SECONDARY" },
  { key: "nSecondaryVal", label: "N.SECONDARY VAL" }, { key: "closing", label: "CLOSING" }
];

function CompilationPanel() {
  const now = new Date();
  const [fy, setFy] = useState(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1);
  const [data, setData] = useState<{ rows: CompilationRow[]; months: string[]; missingPts: string[] }>({ rows: [], months: [], missingPts: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);

  useEffect(() => {
    setLoading(true);
    erpRequest<{ data: CompilationRow[]; months: string[]; missingPts: string[] }>(`/compilation?fy=${fy}`)
      .then((r) => { setData({ rows: r.data, months: r.months, missingPts: r.missingPts }); setErr(""); })
      .catch((e) => setErr(e instanceof Error ? e.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [fy]);

  const months = useMemo(() => {
    if (!onlyActive) return data.months;
    const used = new Set<string>();
    for (const r of data.rows) for (const m of Object.keys(r.months)) used.add(m);
    return data.months.filter((m) => used.has(m));
  }, [data, onlyActive]);

  function exportExcel() {
    const header = ["STATE", "HQ", "PLACE", "CUSTOMER NAME", "DIVISION", "PRODUCT NAME", "BATCH NO", "PTS",
      ...months.flatMap((m) => CELL_COLS.map((c) => `${monthLabel(m)} ${c.label}`))];
    const body = data.rows.map((r) => [r.state, r.hq, r.place, r.customer, r.division, r.product, r.batch, r.pts ?? "",
      ...months.flatMap((m) => CELL_COLS.map((c) => r.months[m]?.[c.key] ?? 0))]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Secondary Sales");
    XLSX.writeFile(wb, `Secondary_Sales_Compilation_FY${fy}-${String(fy + 1).slice(2)}.xlsx`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold">Financial year
          <select className="ml-2 h-9 px-2 rounded-md border border-border-subtle bg-surface-card" value={fy} onChange={(e) => setFy(Number(e.target.value))}>
            {[0, 1, 2].map((d) => { const y = now.getFullYear() - d; return <option key={y} value={y}>{`APR ${y} – MAR ${y + 1}`}</option>; })}
          </select>
        </label>
        <label className="text-sm"><input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> Only months with data</label>
        <button type="button" className={btn} onClick={exportExcel} disabled={!data.rows.length}>Export Excel</button>
      </div>
      {data.missingPts.length > 0 && (
        <div className="p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          PTS missing for {data.missingPts.length} products ({data.missingPts.slice(0, 6).join(", ")}{data.missingPts.length > 6 ? "…" : ""}). Their value uses the statement value where printed. Add PTS in Products &amp; PTS.
        </div>
      )}
      {err && <div className="p-3 text-red-700 text-sm">{err}</div>}
      <div className="rounded-xl border border-border-subtle bg-surface-card overflow-auto max-h-[70vh]">
        <table className="text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              {["STATE", "HQ", "PLACE", "CUSTOMER", "DIVISION", "PRODUCT", "PTS"].map((h) => <th key={h} className={th} rowSpan={2}>{h}</th>)}
              {months.map((m) => <th key={m} className={`${th} text-center border-l border-border-subtle`} colSpan={CELL_COLS.length}>{monthLabel(m)}</th>)}
            </tr>
            <tr>{months.flatMap((m) => CELL_COLS.map((c) => <th key={`${m}-${c.key}`} className={th}>{c.label}</th>))}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td className={td} colSpan={7}>Loading…</td></tr> :
              data.rows.length === 0 ? <tr><td className={td} colSpan={7}>No statements for this year yet.</td></tr> :
              data.rows.map((r) => (
                <tr key={`${r.customer}|${r.product}`}>
                  <td className={td}>{r.state}</td><td className={td}>{r.hq}</td><td className={td}>{r.place}</td><td className={td}>{r.customer}</td>
                  <td className={td}>{r.division}</td><td className={td}>{r.product}</td><td className={td}>{r.pts ?? "—"}</td>
                  {months.flatMap((m) => CELL_COLS.map((c) => {
                    const v = r.months[m]?.[c.key];
                    return <td key={`${m}-${c.key}`} className={`${td} text-right`}>{v == null ? (r.months[m] ? "—" : "") : v}</td>;
                  }))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Products & PTS ───────────────────────────────────────────────────────
function ProductsPanel({ products, reload }: { products: SalesProduct[]; reload: () => Promise<void> }) {
  const [edits, setEdits] = useState<Record<string, { pts: string; pack: string; division: string }>>({});
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function saveRow(p: SalesProduct) {
    const e = edits[p.id]; if (!e) return;
    setErr(""); setMsg("");
    try {
      const pts = e.pts.trim() === "" ? null : Number(e.pts);
      if (pts != null && (!Number.isFinite(pts) || pts < 0)) throw new Error("PTS must be a number.");
      await erpRequest(`/products/${p.id}`, { method: "PUT", body: JSON.stringify({ pts, pack: e.pack, division: e.division }) });
      setEdits((x) => { const c = { ...x }; delete c[p.id]; return c; });
      setMsg(`Saved ${p.name}.`); await reload();
    } catch (er) { setErr(er instanceof Error ? er.message : "Save failed"); }
  }
  async function add() {
    setErr(""); setMsg("");
    try {
      if (!newName.trim()) return;
      await erpRequest("/products", { method: "POST", body: JSON.stringify({ name: newName.trim() }) });
      setNewName(""); setMsg("Product added."); await reload();
    } catch (er) { setErr(er instanceof Error ? er.message : "Add failed"); }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input className={`${input} max-w-xs`} placeholder="New product name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button type="button" className={btn} onClick={() => void add()}>Add product</button>
        {msg && <span className="text-sm text-emerald-700">{msg}</span>}
        {err && <span className="text-sm text-red-700">{err}</span>}
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface-card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className={th}>Product</th><th className={th}>Pack</th><th className={th}>Division</th><th className={th}>PTS (₹)</th><th className={th}></th></tr></thead>
          <tbody>
            {products.map((p) => {
              const e = edits[p.id] ?? { pts: p.pts == null ? "" : String(p.pts), pack: p.pack, division: p.division };
              const set = (k: "pts" | "pack" | "division", v: string) => setEdits({ ...edits, [p.id]: { ...e, [k]: v } });
              return (
                <tr key={p.id} className={p.pts == null ? "bg-amber-50/60" : ""}>
                  <td className={td}>{p.name}</td>
                  <td className={td}><input className={input} value={e.pack} onChange={(ev) => set("pack", ev.target.value)} /></td>
                  <td className={td}><input className={input} value={e.division} onChange={(ev) => set("division", ev.target.value.toUpperCase())} /></td>
                  <td className={td}><input className={input} inputMode="decimal" value={e.pts} placeholder="enter PTS" onChange={(ev) => set("pts", ev.target.value)} /></td>
                  <td className={td}><button type="button" className={btn} disabled={!edits[p.id]} onClick={() => void saveRow(p)}>Save</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Stockists ────────────────────────────────────────────────────────────
function StockistsPanel({ stockists, reload }: { stockists: SalesStockist[]; reload: () => Promise<void> }) {
  const [edits, setEdits] = useState<Record<string, Partial<SalesStockist>>>({});
  const [err, setErr] = useState("");
  async function saveRow(s: SalesStockist) {
    const e = edits[s.id]; if (!e) return;
    try {
      await erpRequest(`/stockists/${s.id}`, { method: "PUT", body: JSON.stringify(e) });
      setEdits((x) => { const c = { ...x }; delete c[s.id]; return c; }); setErr(""); await reload();
    } catch (er) { setErr(er instanceof Error ? er.message : "Save failed"); }
  }
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card overflow-x-auto">
      {err && <div className="p-3 text-red-700 text-sm">{err}</div>}
      <table className="w-full">
        <thead><tr><th className={th}>Stockist</th><th className={th}>GSTIN</th><th className={th}>State</th><th className={th}>HQ</th><th className={th}>Place</th><th className={th}>Division</th><th className={th}></th></tr></thead>
        <tbody>
          {stockists.length === 0 ? <tr><td className={td} colSpan={7}>Stockists appear here after their first statement is saved.</td></tr> :
            stockists.map((s) => {
              const e = { ...s, ...edits[s.id] };
              const set = (k: "gstin" | "state" | "hq" | "place" | "division", v: string) => setEdits({ ...edits, [s.id]: { ...edits[s.id], [k]: v.toUpperCase() } });
              return (
                <tr key={s.id}>
                  <td className={td}>{s.name}</td>
                  {(["gstin", "state", "hq", "place", "division"] as const).map((k) => (
                    <td key={k} className={td}><input className={input} value={e[k] ?? ""} onChange={(ev) => set(k, ev.target.value)} /></td>
                  ))}
                  <td className={td}><button type="button" className={btn} disabled={!edits[s.id]} onClick={() => void saveRow(s)}>Save</button></td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
