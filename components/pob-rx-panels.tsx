"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FieldForceSelect } from "@/components/field-force-select";
import {
  GO, LABEL, SELECT, MONTH_NAMES, THIS_YEAR, ReportModal, ScreenTitle, MonthYearSelect, useRange, ym, th, td, tealHead, link
} from "@/components/mis-analysis-panels";
import {
  apiClient,
  type PobRxDayWiseResult,
  type PobRxEmployee,
  type PobRxFieldforceWiseResult,
  type PobRxProductWiseResult
} from "@/lib/api-client";

// Round 42 -- MIS Reports > POB/Rx legacy-parity screens (admin):
//   Rx/POB Details (Product Wise)    Dr_Chem_POB.aspx
//   Rx/POB Details (FieldForce Wise) Dr_Chem_Dump.aspx
//   Rx/POB Details (Day Wise)        Dr_Che_POB_daywise.aspx
//   Listed Dr/Chem Dump              Dr_Che_POB_Dump.aspx
// Doctors = Rx quantity captured on the DCR; Chemists = POB captured on the
// chemist call (qty, value, else qty x product rate). Blank cell = zero.

const TH = th + " " + tealHead;
const CARD = "bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-5xl";
const ADMIN_OPTION = [{ value: "admin", label: "admin" }];
const RED_BORDER = { border: "2px solid #dc2626" } as const;

function Note({ children }: { children: ReactNode }) { return <p className="text-xs text-text-muted italic">{children}</p>; }
function Err({ msg }: { msg: string }) { return msg ? <p className="text-sm text-status-danger">{msg}</p> : null; }
const long = (m: string) => { const [y, mo] = m.split("-").map(Number); return `${MONTH_NAMES[mo - 1]} ${y}`; };
const shortM = (m: string) => { const [y, mo] = m.split("-").map(Number); return `${MONTH_NAMES[mo - 1].slice(0, 3)} - ${y}`; };
const blank = (n: number) => (n ? n : "");
const money = (n: number) => (n ? n.toFixed(2) : "");

function ForceLine({ employee }: { employee: PobRxEmployee }) {
  return (
    <p className="text-sm font-bold">
      Field Force Name : {employee ? employee.name : "admin"}
      {employee?.doj ? <span className="text-red-600"> (DOJ: {employee.doj})</span> : null}
    </p>
  );
}

function RangeFields({ range, setRange }: { range: ReturnType<typeof useRange>["range"]; setRange: ReturnType<typeof useRange>["setRange"] }) {
  return (
    <>
      <div className="flex items-end gap-2">
        <span className={LABEL}>From</span>
        <MonthYearSelect month={range.fromMonth} year={range.fromYear} onChange={(m, y) => setRange({ ...range, fromMonth: m, fromYear: y })} />
      </div>
      <div className="flex items-end gap-2">
        <span className={LABEL}>To</span>
        <MonthYearSelect month={range.toMonth} year={range.toYear} onChange={(m, y) => setRange({ ...range, toMonth: m, toYear: y })} />
      </div>
    </>
  );
}

function ModeSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>Mode</span>
      <select className={SELECT} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o === "---Select---" ? "" : o}>{o}</option>)}
      </select>
    </div>
  );
}

// ═══ Item 1 -- Product Wise ═══════════════════════════════════════════════
function ProductWiseTable({ result }: { result: PobRxProductWiseResult }) {
  const c = result.mode === "Chemists" ? "Chemistwise" : "Doctorwise";
  return (
    <>
      <h3 className="text-center text-lg font-bold underline">Listed {c} {result.mode === "Chemists" ? "POB" : "Rx"} Details From {long(result.months[0])} to {long(result.months[result.months.length - 1])}</h3>
      <ForceLine employee={result.employee} />
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className={TH} rowSpan={2}>Sno</th>
            <th className={TH} rowSpan={2}>Product Name</th>
            <th className={TH} rowSpan={2}>Pack</th>
            {result.months.map((m) => <th key={m} className={TH} colSpan={3}>{shortM(m)}</th>)}
            <th className={TH} rowSpan={2}>Total</th>
          </tr>
          <tr>{result.months.map((m) => <Fragment key={m}><th className={TH}>Qty</th><th className={TH}>Rate</th><th className={TH}>Value</th></Fragment>)}</tr>
        </thead>
        <tbody>
          {result.products.map((p) => (
            <tr key={p.name}>
              <td className={td}>{p.sno}</td>
              <td className={td + " !text-left"}>{p.name}</td>
              <td className={td}>{p.pack}</td>
              {result.months.map((m) => {
                const x = p.perMonth[m];
                return <Fragment key={m}><td className={td}>{blank(x.qty)}</td><td className={td}>{x.qty ? (x.rate ?? "") : ""}</td><td className={td}>{money(x.value)}</td></Fragment>;
              })}
              <td className={td} style={RED_BORDER}>{money(p.total.value)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className={td} style={RED_BORDER} colSpan={3}>Total</td>
            {result.months.map((m) => <Fragment key={m}><td className={td} style={RED_BORDER}>{blank(result.totals.perMonth[m].qty)}</td><td className={td} style={RED_BORDER} /><td className={td} style={RED_BORDER}>{money(result.totals.perMonth[m].value)}</td></Fragment>)}
            <td className={td} style={RED_BORDER}>{money(result.totals.total.value)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export function PobRxProductWiseReport() {
  const [code, setCode] = useState("admin");
  const [mode, setMode] = useState("Doctors");
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<PobRxProductWiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.pobrxProductWise({ employeeCode: code || "admin", fromMonth: fromKey, toMonth: toKey, mode })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Rx/POB Details (Product Wise)</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Field Force Name" extraOptions={ADMIN_OPTION} clearLabel="---Select Clear---" />
          <RangeFields range={range} setRange={setRange} />
          <ModeSelect value={mode} onChange={setMode} options={["Doctors", "Chemists"]} />
        </div>
        <div className="flex justify-center"><button type="button" className={GO} disabled={loading} onClick={view}>{loading ? "Loading..." : "View"}</button></div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Rx/POB Details (Product Wise)" fileName={`Rx_POB_ProductWise_${fromKey}_${toKey}`} onClose={() => setResult(null)}>
          <ProductWiseTable result={result} />
          <Note>Doctors: Rx quantity from the DCR, value = quantity x product rate. Chemists: POB from chemist calls (entered value, else quantity x product rate). Calls with only a lump-sum POB amount have no product and are not listed here.</Note>
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Item 2 -- FieldForce Wise ════════════════════════════════════════════
export function PobRxFieldforceWiseReport() {
  const router = useRouter();
  const [code, setCode] = useState("admin");
  const [mode, setMode] = useState("Doctors");
  const { range, setRange, fromKey, toKey } = useRange();
  const [result, setResult] = useState<PobRxFieldforceWiseResult | null>(null);
  const [drill, setDrill] = useState<PobRxProductWiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError("");
    try { setResult((await apiClient.pobrxFieldforceWise({ employeeCode: code || "admin", fromMonth: fromKey, toMonth: toKey, mode })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }
  async function openDrill(employeeCode: string) {
    try { setDrill((await apiClient.pobrxProductWise({ employeeCode, fromMonth: fromKey, toMonth: toKey, mode })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load drill-down"); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex items-start justify-between">
          <ScreenTitle>Rx/POB Details (FieldForce Wise)</ScreenTitle>
          <button type="button" className="h-8 px-4 rounded-lg border border-border-subtle text-sm font-semibold" onClick={() => router.back()}>Back</button>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Field Force Name" extraOptions={ADMIN_OPTION} clearLabel="---Select Clear---" />
          <RangeFields range={range} setRange={setRange} />
          <ModeSelect value={mode} onChange={setMode} options={["Doctors", "Chemists"]} />
        </div>
        <div className="flex justify-center"><button type="button" className={GO} disabled={loading} onClick={view}>{loading ? "Loading..." : "View"}</button></div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Rx/POB Details (FieldForce Wise)" fileName={`Rx_POB_FieldForceWise_${fromKey}_${toKey}`} onClose={() => setResult(null)}>
          <h3 className="text-center text-lg font-bold underline">Listed {result.mode === "Chemists" ? "Chemistwise POB" : "Doctorwise Rx"} Details From {long(result.months[0])} to {long(result.months[result.months.length - 1])}</h3>
          <ForceLine employee={result.employee} />
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className={TH} rowSpan={2}>Sno</th><th className={TH} rowSpan={2}>Fieldforce Name</th><th className={TH} rowSpan={2}>HQ</th><th className={TH} rowSpan={2}>Designation</th><th className={TH} rowSpan={2}>Emp Id</th>
                {result.months.map((m) => <th key={m} className={TH} colSpan={2}>{shortM(m)}</th>)}
                <th className={TH} colSpan={2}>Total</th>
              </tr>
              <tr>{[...result.months, "T"].map((m) => <Fragment key={m}><th className={TH}>Qty</th><th className={TH}>Value</th></Fragment>)}</tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={r.employeeCode} style={{ background: r.isManager ? "#ffdab9" : "#ffffff" }}>
                  <td className={td}>{i + 1}</td><td className={td + " !text-left"}>{r.name}</td><td className={td}>{r.hq}</td><td className={td}>{r.designation}</td><td className={td}>{r.employeeCode}</td>
                  {result.months.map((m) => (
                    <Fragment key={m}>
                      <td className={td}>{blank(r.perMonth[m].qty)}</td>
                      <td className={td}>{r.perMonth[m].value > 0 ? <button type="button" className={link} onClick={() => void openDrill(r.employeeCode)}>{money(r.perMonth[m].value)}</button> : ""}</td>
                    </Fragment>
                  ))}
                  <td className={td}>{blank(r.total.qty)}</td><td className={td}>{money(r.total.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Note>Manager rows are shaded. A value links to that field force&apos;s Product Wise report for the same period.</Note>
        </ReportModal>
      )}
      {drill && (
        <ReportModal title="Rx/POB Details (Product Wise)" fileName={`Rx_POB_ProductWise_${fromKey}_${toKey}`} onClose={() => setDrill(null)}>
          <ProductWiseTable result={drill} />
        </ReportModal>
      )}
    </div>
  );
}

// ═══ Product picker shared by Day Wise and Dump ═══════════════════════════
function useProductNames() {
  const [products, setProducts] = useState<string[]>([]);
  useEffect(() => { apiClient.pobProducts().then((r) => setProducts(r.data)).catch(() => setProducts([])); }, []);
  return products;
}

// ═══ Item 3 -- Day Wise ═══════════════════════════════════════════════════
export function PobRxDayWiseReport() {
  const [code, setCode] = useState("admin");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [withoutVacant, setWithoutVacant] = useState(true);
  const [mode, setMode] = useState("");
  const names = useProductNames();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<PobRxDayWiseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const monthKey = ym(year, month);

  const letters = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of names) { const l = n.charAt(0).toUpperCase(); m.set(l, (m.get(l) || 0) + 1); }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [names]);
  const perCol = Math.ceil(names.length / 4) || 1;
  const columns = [0, 1, 2, 3].map((i) => names.slice(i * perCol, (i + 1) * perCol));
  const allSelected = names.length > 0 && names.every((n) => selected.has(n));
  const toggle = (n: string) => setSelected((prev) => { const s = new Set(prev); if (s.has(n)) s.delete(n); else s.add(n); return s; });
  function toggleLetter(l: string) {
    const group = names.filter((n) => n.charAt(0).toUpperCase() === l);
    setSelected((prev) => { const s = new Set(prev); const all = group.every((n) => s.has(n)); group.forEach((n) => (all ? s.delete(n) : s.add(n))); return s; });
  }

  async function view() {
    if (!mode) { setError("Select a mode."); return; }
    if (mode === "Productwise" && selected.size === 0) { setError("Select at least one product."); return; }
    if (selected.size > 200) { setError("Select a maximum of 200 products."); return; }
    setLoading(true); setError("");
    try { setResult((await apiClient.pobrxDayWise({ employeeCode: code || "admin", month: monthKey, withoutVacant, mode, products: Array.from(selected) })).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Rx/POB Details (Day Wise)</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Field Force Name" extraOptions={ADMIN_OPTION} clearLabel="---Select Clear---" />
          <MonthYearSelect month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <label className="flex items-center gap-2 h-9 text-sm font-semibold"><input type="checkbox" checked={withoutVacant} onChange={(e) => setWithoutVacant(e.target.checked)} /> Without Vacant</label>
          <ModeSelect value={mode} onChange={setMode} options={["---Select---", "Productwise", "Datewise"]} />
        </div>
        {mode === "Productwise" && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-x-3 text-sm">
              {letters.map(([l, n]) => <button key={l} type="button" className={link} onClick={() => toggleLetter(l)}>{l}({n})</button>)}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-red-600 font-semibold">Product (Select Max of 200 Products)</span>
              <label className="flex items-center gap-1 font-semibold"><input type="checkbox" checked={allSelected} onChange={(e) => setSelected(e.target.checked ? new Set(names.slice(0, 200)) : new Set())} /> Select/Deselect All</label>
            </div>
            <div className="grid grid-cols-4 gap-x-8 border border-border-subtle rounded-lg p-3">
              {columns.map((col, ci) => (
                <div key={ci} className="space-y-1">
                  {col.map((n) => <label key={n} className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={selected.has(n)} onChange={() => toggle(n)} /> {n}</label>)}
                </div>
              ))}
              {names.length === 0 && <p className="text-xs text-text-muted col-span-4">No products found in the product master.</p>}
            </div>
          </div>
        )}
        <div className="flex justify-center"><button type="button" className={GO} disabled={loading} onClick={view}>{loading ? "Loading..." : "View"}</button></div>
        <Err msg={error} />
      </div>
      {result && <DayWiseResult result={result} onClose={() => setResult(null)} />}
    </div>
  );
}

function DayWiseResult({ result, onClose }: { result: PobRxDayWiseResult; onClose: () => void }) {
  const productwise = result.mode === "Productwise";
  const days = Array.from({ length: result.days }, (_, i) => i + 1);
  const sub = productwise ? ["Dr Qty", "Che Qty", "Qty", "Value"] : ["Drs", "Che", "Qty", "Value"];
  const sticky = "sticky top-0 z-10";
  const fixed = productwise ? 6 : 5;
  return (
    <ReportModal title="Rx/POB Details (Day Wise)" fileName={`Rx_POB_DayWise_${result.month}`} onClose={onClose}>
      <h3 className="text-center text-lg font-bold underline">Listed Dr/Che wise {productwise ? "Product " : ""}Rx Details For {long(result.month)}</h3>
      <ForceLine employee={result.employee} />
      <div className="overflow-auto max-h-[70vh]">
        <table className="text-xs border-collapse">
          <thead>
            <tr><th className={TH + " " + sticky} colSpan={fixed + (days.length + 1) * 4}>&nbsp;</th></tr>
            <tr>
              <th className={TH + " " + sticky} rowSpan={2}>Sno</th><th className={TH + " " + sticky} rowSpan={2}>Fieldforce Name</th><th className={TH + " " + sticky} rowSpan={2}>HQ</th><th className={TH + " " + sticky} rowSpan={2}>Designation</th><th className={TH + " " + sticky} rowSpan={2}>Emp Id</th>
              {productwise && <th className={TH + " " + sticky} rowSpan={2}>Product</th>}
              {days.map((d) => <th key={d} className={TH + " " + sticky} colSpan={4}>{d}</th>)}
              <th className={TH + " " + sticky} colSpan={4}>Total</th>
            </tr>
            <tr>{[...days, 0].map((d) => <Fragment key={d}>{sub.map((s) => <th key={s} className={TH + " " + sticky}>{s}</th>)}</Fragment>)}</tr>
          </thead>
          <tbody>
            {result.rows.map((r, i) => (
              <tr key={`${r.employeeCode}-${r.product ?? ""}`} style={{ background: r.isManager ? "#ffdab9" : "#ffffff" }}>
                <td className={td}>{i + 1}</td><td className={td + " !text-left whitespace-nowrap"}>{r.name}</td><td className={td}>{r.hq}</td><td className={td}>{r.designation}</td><td className={td}>{r.employeeCode}</td>
                {productwise && <td className={td + " whitespace-nowrap"}>{r.product}</td>}
                {[...r.perDay, r.total].map((c, di) => (
                  <Fragment key={di}><td className={td}>{blank(c.drs)}</td><td className={td}>{blank(c.che)}</td><td className={td}>{blank(c.qty)}</td><td className={td}>{money(c.value)}</td></Fragment>
                ))}
              </tr>
            ))}
            {result.rows.length === 0 && <tr><td className={td} colSpan={fixed + (days.length + 1) * 4}>No Rx / POB recorded for this selection.</td></tr>}
          </tbody>
        </table>
      </div>
      <Note>
        {productwise
          ? "Product wise layout is inferred (no legacy result screenshot): one row per field force and selected product with activity; Dr Qty = doctor Rx quantity, Che Qty = chemist POB quantity, Qty = both, Value = Rx value + POB value."
          : "Drs = doctor calls that day that carried Rx; Che = chemist calls that carried POB; Qty = Rx quantity + chemist POB quantity; Value = Rx value (qty x product rate) + chemist POB value. Blank = none."}
      </Note>
    </ReportModal>
  );
}

// ═══ Item 4 -- Listed Dr/Chem Dump ═════════════════════════════════════════
function ProductMultiSelect({ names, selected, setSelected }: { names: string[]; selected: Set<string>; setSelected: (s: Set<string>) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const shown = names.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  const all = names.length > 0 && names.every((n) => selected.has(n));
  return (
    <div className="flex flex-col gap-1 relative" ref={ref}>
      <span className={LABEL}>Select Products</span>
      <button type="button" className={SELECT + " text-left min-w-[240px]"} onClick={() => setOpen((o) => !o)}>
        {selected.size === 0 ? "--- All products ---" : selected.size === names.length ? "All selected" : `${selected.size} selected`}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-72 bg-surface-card border border-border-subtle rounded-lg shadow-lg p-2 space-y-1 max-h-72 overflow-auto">
          <input className={SELECT + " w-full"} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={all} onChange={(e) => setSelected(e.target.checked ? new Set(names) : new Set())} /> [Select all]</label>
          {shown.map((n) => (
            <label key={n} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.has(n)} onChange={() => { const s = new Set(selected); if (s.has(n)) s.delete(n); else s.add(n); setSelected(s); }} /> {n}</label>
          ))}
        </div>
      )}
    </div>
  );
}

export function PobRxDumpReport() {
  const router = useRouter();
  const [code, setCode] = useState("admin");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [mode, setMode] = useState("");
  const names = useProductNames();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checkVacant, setCheckVacant] = useState(false);
  const [option, setOption] = useState("Dr Wise");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    if (!mode) { setError("Select a mode."); return; }
    setBusy(true); setError("");
    try { await apiClient.downloadPobrxDump({ employeeCode: code || "admin", month: ym(year, month), mode, products: Array.from(selected), checkVacant, option }); }
    catch (e) { setError(e instanceof Error ? e.message : "Download failed"); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex items-start justify-end">
          <button type="button" className="h-8 px-4 rounded-lg border border-border-subtle text-sm font-semibold" onClick={() => router.back()}>Back</button>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <FieldForceSelect value={code} onChange={setCode} label="Field Force Name" extraOptions={ADMIN_OPTION} clearLabel="---Select Clear---" />
          <div className="flex items-end gap-2">
            <span className={LABEL}>From</span>
            <MonthYearSelect month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          </div>
          <ModeSelect value={mode} onChange={setMode} options={["---Select---", "Doctors", "Chemists"]} />
          <ProductMultiSelect names={names} selected={selected} setSelected={setSelected} />
          <label className="flex items-center gap-2 h-9 text-sm font-semibold"><input type="checkbox" checked={checkVacant} onChange={(e) => setCheckVacant(e.target.checked)} /> Check Vacant</label>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className={LABEL}>Select Option</span>
          {["Dr Wise", "Brand Wise"].map((o) => <label key={o} className="flex items-center gap-1"><input type="radio" checked={option === o} onChange={() => setOption(o)} /> {o}</label>)}
        </div>
        <button type="button" className={link} disabled={busy} onClick={() => void download()}>{busy ? "Preparing..." : "Download Excel"}</button>
        <Err msg={error} />
        <Note>Chemists: one row per chemist (Dr Wise) or per chemist and product (Brand Wise) with day-wise POB qty / value. Doctors: Rx value per doctor, or per doctor and product. Only entities with Rx / POB in the month are listed; Check Vacant also lists field forces with none.</Note>
      </div>
    </div>
  );
}
