"use client";

import { useEffect, useState } from "react";
import { FFPicker, MonthYear, NOW, mkRange, monthLong, rowBg, type MY } from "@/components/ff-filter-select";
import { GO, LABEL, SELECT, ReportModal, ScreenTitle } from "@/components/mis-analysis-panels";
import { CARD, TEAL, TH, TD, Err, Notes, ffLine, rangeShort } from "@/components/r51-panels";
import { apiClient, type SpecatDrillResult, type SpecatOptions, type SpecatResult } from "@/lib/api-client";

// Round 55 -- MIS Reports > Product Exposure > Speciality/Category Wise (legacy Product_Exp_specat.aspx).
const ROWS_PER_COL = 10;
const productLabel = (p: string) => (p === "ALL" ? "All Product" : p);
type Mode = "" | "speciality" | "category";

export function ProductExposureSpecatReport() {
  const [products, setProducts] = useState<string[]>([]);
  const [opts, setOpts] = useState<SpecatOptions>({ specialities: [], categories: [] });
  useEffect(() => {
    apiClient.productExposureOptions().then((r) => setProducts(r.data)).catch(() => setProducts([]));
    apiClient.productExposureSpecatOptions().then((r) => setOpts(r.data)).catch(() => undefined);
  }, []);
  const [code, setCode] = useState("");
  const [product, setProduct] = useState("");
  const [from, setFrom] = useState<MY>(NOW);
  const [to, setTo] = useState<MY>(NOW);
  const [mode, setMode] = useState<Mode>("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<SpecatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drill, setDrill] = useState<{ employeeCode: string; name: string; month: string; value: string } | null>(null);
  const list = mode === "speciality" ? opts.specialities : mode === "category" ? opts.categories : [];
  const toggle = (n: string) => setPicked((p) => { const s = new Set(p); if (s.has(n)) s.delete(n); else s.add(n); return s; });
  async function go() {
    setLoading(true); setError("");
    try {
      const values = list.filter((n) => picked.has(n)).join("|");
      setResult((await apiClient.productExposureSpecat({ ...mkRange(from, to), sfCode: code, product, mode, values })).data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  const bg = { background: TEAL, color: "#fff" };
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Product Exposure Analysis</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} label="Fieldforce Name" clearLabel="---Select Clear---" filterAfterLoad />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Product Name</span>
            <select className={SELECT} style={{ minWidth: 200 }} value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="">---Select the Product---</option>
              <option value="ALL" style={{ color: "red" }}>All Product</option>
              {products.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <MonthYear label="From" v={from} onChange={setFrom} />
          <MonthYear label="To" v={to} onChange={setTo} />
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Select Mode</span>
            <select className={SELECT} value={mode} onChange={(e) => { setMode(e.target.value as Mode); setPicked(new Set()); }}>
              <option value="">--Select--</option><option value="speciality">Speciality</option><option value="category">Category</option>
            </select>
          </div>
        </div>
        {mode && (
          <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: `repeat(${ROWS_PER_COL}, auto)`, gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "4px 32px", maxWidth: 640 }}>
            {list.map((n) => (
              <label key={n} className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={picked.has(n)} onChange={() => toggle(n)} />{n}</label>
            ))}
          </div>
        )}
        {mode && list.length === 0 && <p className="text-xs italic text-text-muted">No {mode === "speciality" ? "specialities" : "categories"} found in the master.</p>}
        <div><button type="button" className={GO} disabled={!code || !product || !mode || picked.size === 0 || loading} onClick={() => void go()}>{loading ? "Loading..." : "View"}</button></div>
        <Err msg={error} />
      </div>
      {result && (
        <ReportModal title="Product Exposure Analysis" fileName="Product_Exposure_Speciality_Category" onClose={() => setResult(null)} textButtons>
          <h3 className="text-base font-bold underline">Product Exposure Analysis for the Period of {rangeShort(result.months, "To")}</h3>
          <div className="flex justify-between gap-4">
            <p className="text-sm font-bold">{ffLine(result.employee, "Filed Force Name")}</p>
            <p className="text-sm font-bold" style={{ color: "red" }}>Product Name : {productLabel(result.product)}</p>
          </div>
          <Notes notes={result.notes} />
          <div style={{ overflowX: "auto" }}>
            <table className="border-collapse">
              <thead>
                <tr>{["S.No", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={3} className={TH} style={bg}>{h}</th>)}
                  {result.months.map((m) => <th key={m} colSpan={result.columns.length} className={TH} style={bg}>{monthLong(m, "-")}</th>)}</tr>
                <tr>{result.months.map((m) => <th key={m} colSpan={result.columns.length} className={TH} style={bg}>No. of Drs (As Per DCR)</th>)}</tr>
                <tr>{result.months.flatMap((m) => result.columns.map((c) => <th key={m + c} className={TH} style={bg}>{c}</th>))}</tr>
              </thead>
              <tbody>
                {result.rows.map((x) => (
                  <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                    <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                    {result.months.flatMap((m) => result.columns.map((c) => {
                      const n = x.perMonth[m]?.[c] ?? 0;
                      return <td key={m + c} className={TD + " text-center"} style={n ? { color: "blue" } : undefined}>{n ? <button type="button" className="underline" onClick={() => setDrill({ employeeCode: x.employeeCode, name: x.name, month: m, value: c })}>{n}</button> : "-"}</td>;
                    }))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportModal>
      )}
      {drill && result && <SpecatDrill d={drill} product={result.product} mode={result.mode} onClose={() => setDrill(null)} />}
    </div>
  );
}

function SpecatDrill({ d, product, mode, onClose }: { d: { employeeCode: string; name: string; month: string; value: string }; product: string; mode: string; onClose: () => void }) {
  const [res, setRes] = useState<SpecatDrillResult | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { apiClient.productExposureSpecatDrill({ employeeCode: d.employeeCode, product, month: d.month, mode, value: d.value }).then((r) => setRes(r.data)).catch((e) => setErr(e instanceof Error ? e.message : "Unable to load")); }, [d, product, mode]);
  const bg = { background: TEAL, color: "#fff" };
  return (
    <ReportModal title={`Doctors detailed - ${d.name}`} fileName="Product_Exposure_Speciality_Doctors" onClose={onClose} textButtons>
      <h3 className="text-base font-bold">{productLabel(product)} - {d.name} - {d.value} - {monthLong(d.month, "-")}</h3>
      <Err msg={err} />
      <table className="border-collapse">
        <thead><tr>{["S.No", "Doctor", "Speciality", "Category", "Visit Dates"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
        <tbody>{res?.rows.map((x, i) => <tr key={x.doctorCode + i}><td className={TD + " text-center"}>{i + 1}</td><td className={TD}>{x.doctorName}</td><td className={TD}>{x.speciality}</td><td className={TD}>{x.category}</td><td className={TD}>{x.dates.join(", ")}</td></tr>)}</tbody>
      </table>
    </ReportModal>
  );
}
