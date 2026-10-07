"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { FFPicker, MonthYear, NOW, mkRange, monthLong, monthShort, rowBg, type MY } from "@/components/ff-filter-select";
import { GO, LABEL, SELECT, ReportModal, ScreenTitle } from "@/components/mis-analysis-panels";
import { apiClient, type AtGlanceResult, type ChemistUnlistedResult, type ListedDrProductResult, type ManagerCoverageResult, type ProductDrillResult, type ProductExposureResult, type R51Emp, type TerritoryResult, type VacantManagerResult } from "@/lib/api-client";

// Round 51 -- MIS Reports > Visit Details / Product Exposure screens (legacy ASPX parity).
// Green-header family (icon toolbar): At a Glance, Chemist/UnListed/Stockiest, Vacant-HQ manager visits.
// Teal #0099b0 family (Print/Excel/Close): Territory wise, Product Exposure (+ unlisted), ListedDr - Product Visit.
const CARD = "bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-5xl";
const TEAL = "#0099b0";
const TH = "border border-black px-1 py-0.5 text-xs font-bold text-center whitespace-nowrap";
const TD = "border border-black px-1 py-0.5 text-xs";
const prev = (): MY => (NOW.m === 1 ? { m: 12, y: NOW.y - 1 } : { m: NOW.m - 1, y: NOW.y });
const dash = (n: number | null | undefined) => (n ? String(n) : "-");
const f2 = (n: number | null) => (n === null ? "-" : n.toFixed(2));
const ffLine = (e: R51Emp, label = "Field Force Name") => `${label} : ${e.name} - ${e.designation} - ${e.hq}`;
const rangeLong = (months: string[]) => `${monthLong(months[0], " ")} To ${monthLong(months[months.length - 1], " ")}`;
const rangeShort = (months: string[], to = "To") => `${monthShort(months[0], " ")} ${to} ${monthShort(months[months.length - 1], " ")}`;
function Err({ msg }: { msg: string }) { return msg ? <p className="text-sm text-status-danger">{msg}</p> : null; }
function Notes({ notes }: { notes: string[] }) { return <>{notes.map((n, i) => <p key={i} className="text-xs italic text-text-muted">{n}</p>)}</>; }

// shared form state: filter+dropdown, From/To month+year, Go
function RangeForm<T>({ title, run, button = "Go", defaultFrom, colorize, extra, extraReady = true, toLabel = "To", hideTo, children }: {
  title: string; run: (p: { code: string; range: Record<string, string>; from: MY; to: MY }) => Promise<T>; button?: string; defaultFrom?: MY; colorize?: boolean;
  extra?: ReactNode; extraReady?: boolean; toLabel?: string; hideTo?: boolean; children: (result: T, close: () => void) => ReactNode;
}) {
  const [code, setCode] = useState("");
  const [from, setFrom] = useState<MY>(defaultFrom ?? prev());
  const [to, setTo] = useState<MY>(NOW);
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    setLoading(true); setError("");
    try { setResult(await run({ code, range: { sfCode: code, ...mkRange(from, hideTo ? from : to) }, from, to })); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); setResult(null); } finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>{title}</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} colorize={colorize} />
          {extra}
          <MonthYear label="From" v={from} onChange={setFrom} />
          {!hideTo && <MonthYear label={toLabel} v={to} onChange={setTo} />}
          <button type="button" className={GO} disabled={!code || !extraReady || loading} onClick={() => void go()}>{loading ? "Loading..." : button}</button>
        </div>
        <Err msg={error} />
      </div>
      {result && children(result, () => setResult(null))}
    </div>
  );
}

// ═══ 2) At a Glance ═══════════════════════════════════════════════════
const GLANCE_COLS: [string, (m: AtGlanceResult["rows"][number]["perMonth"][string]) => string][] = [
  ["No Of FWD", (c) => dash(c.fwd)], ["Ttl Drs", (c) => dash(c.ttl)], ["Drs Met", (c) => dash(c.met)], ["Met Once", (c) => dash(c.once)], ["Met Twice & Above", (c) => dash(c.twice)],
  ["Drs Seen", (c) => dash(c.seen)], ["Missed", (c) => dash(c.missed)], ["Unlist Met", (c) => dash(c.unl)], ["Rpt Calls", (c) => dash(c.rpt)],
  ["Coverage (%)", (c) => f2(c.coverage)], ["Call Avg", (c) => f2(c.callAvg)], ["Missed (%)", (c) => f2(c.missedPct)], ["Repeated (%)", (c) => f2(c.repeatedPct)]
];
export function AtAGlanceReport() {
  return (
    <RangeForm<AtGlanceResult> title="Visit Details (At A Glance)" run={async ({ range }) => (await apiClient.atGlance(range)).data}>
      {(r, close) => {
        const title = `Visit Details At a Glance Between - ${rangeLong(r.months)}`;
        const bg = { background: "#99ff99" };
        return (
          <ReportModal title={title} fileName="Visit_Details_At_a_Glance" onClose={close}>
            <h3 className="text-base font-bold underline">{title}</h3>
            <p className="text-sm font-bold">{ffLine(r.employee)}</p>
            <Notes notes={r.notes} />
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead>
                  <tr>
                    {["S.No", "FieldForce Name", "Designation", "HQ", "Employee_Id", "SubDivision", "Last_DCR_Date"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}
                    {r.months.map((m) => <th key={m} colSpan={GLANCE_COLS.length} className={TH} style={bg}>{monthLong(m, "-")}</th>)}
                  </tr>
                  <tr>{r.months.map((m) => GLANCE_COLS.map(([h]) => <th key={m + h} className={TH} style={bg}>{h}</th>))}</tr>
                </thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                      <td className={TD}>{x.employeeCode}</td><td className={TD}>{x.subDivision}</td><td className={TD + " text-center"}>{x.lastDcrDate}</td>
                      {r.months.map((m) => GLANCE_COLS.map(([h, fn]) => <td key={m + h} className={TD + " text-center"}>{fn(x.perMonth[m])}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportModal>
        );
      }}
    </RangeForm>
  );
}

// ═══ 3) Manager - Visit (For Vacant HQ's) ═════════════════════════════
export function VacantManagerVisitReport() {
  return (
    <RangeForm<VacantManagerResult> title="Manager - Visit (For Vacant HQ's)" button="View" run={async ({ range }) => (await apiClient.vacantManagerVisits(range)).data}>
      {(r, close) => {
        const bg = { background: TEAL, color: "#fff" };
        return (
          <ReportModal title="Vacant HQ's Doctors Visited By MANAGER" fileName="Vacant_HQ_Manager_Visit" onClose={close}>
            <h3 className="text-base font-bold">Vacant HQ&apos;s Doctors Visited By MANAGER For the Month Between - <span style={{ color: "red" }}>{rangeShort(r.months, "and")}</span></h3>
            <p className="text-sm font-bold">Field Force Name : <span style={{ color: "green" }}>{r.employee.name} - {r.employee.designation} - {r.employee.hq}</span></p>
            <Notes notes={r.notes} />
            {r.rows.length === 0 && <p className="text-sm">No vacant HQs found under this manager.</p>}
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead>
                  <tr>
                    {["S.No", "Field Force Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}
                    {r.months.map((m) => <th key={m} colSpan={r.columns.length} className={TH} style={bg}>{monthShort(m, " - ")} (No.of Doctors Visited)</th>)}
                  </tr>
                  <tr>{r.months.map((m) => r.columns.map((c) => <th key={m + c} className={TH} style={bg}>{c}</th>))}</tr>
                </thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                      {r.months.map((m) => r.columns.map((c) => <td key={m + c} className={TD + " text-center"} style={{ color: "red" }}>{x.perMonth[m][c] || ""}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportModal>
        );
      }}
    </RangeForm>
  );
}

// ═══ 4) Chemist & UnListed Doctors ════════════════════════════════════
const CH_GROUPS: { key: "chemist" | "unlisted" | "stockist"; label: string; bg: string }[] = [
  { key: "chemist", label: "Chemist", bg: "#ccffcc" }, { key: "unlisted", label: "UnList Drs", bg: "#ffffcc" }, { key: "stockist", label: "Stockiest", bg: "#66cc66" }
];
export function ChemistUnlistedReport() {
  return (
    <RangeForm<ChemistUnlistedResult> title="Visit Details For Chemist & UnListed Doctors" defaultFrom={NOW} run={async ({ range }) => (await apiClient.chemistUnlisted(range)).data}>
      {(r, close) => {
        const title = `Chemist - UnListed Doctors - Stockiest Visit Between - ${rangeLong(r.months)}`;
        const bg = { background: "#99ff99" };
        return (
          <ReportModal title={title} fileName="Chemist_UnListed_Stockiest_Visit" onClose={close}>
            <h3 className="text-base font-bold underline">{title}</h3>
            <p className="text-sm font-bold">{ffLine(r.employee)}</p>
            <Notes notes={r.notes} />
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead>
                  <tr>
                    {["S.No", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={3} className={TH} style={bg}>{h}</th>)}
                    {r.months.map((m) => <th key={m} colSpan={6} className={TH} style={bg}>{monthLong(m, "-")}</th>)}
                  </tr>
                  <tr>{r.months.map((m) => CH_GROUPS.map((g) => <th key={m + g.key} colSpan={2} className={TH} style={{ background: g.bg }}>{g.label}</th>))}</tr>
                  <tr>{r.months.map((m) => CH_GROUPS.map((g) => ["Met", "Seen"].map((s) => <th key={m + g.key + s} className={TH} style={{ background: g.bg }}>{s}</th>)))}</tr>
                </thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                      {r.months.map((m) => CH_GROUPS.map((g) => <Fragment key={m + g.key}><td className={TD + " text-center"}>{dash(x.perMonth[m][g.key].met)}</td><td className={TD + " text-center"}>{dash(x.perMonth[m][g.key].seen)}</td></Fragment>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportModal>
        );
      }}
    </RangeForm>
  );
}

// ═══ 5) Territory wise - Listed Doctor Visit (+ Manager Wise Coverage) ═
export function TerritoryWiseReport() {
  const [code, setCode] = useState("");
  const [from, setFrom] = useState<MY>(NOW);
  const [to, setTo] = useState<MY>(NOW);
  const [self, setSelf] = useState(false);
  const [terr, setTerr] = useState<TerritoryResult | null>(null);
  const [cov, setCov] = useState<ManagerCoverageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function view() {
    setLoading(true); setError(""); setTerr(null); setCov(null);
    try {
      const range = { sfCode: code, ...mkRange(from, self ? to : from) };
      if (self) setCov((await apiClient.managerCoverage(range)).data); else setTerr((await apiClient.territoryWise(range)).data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load report"); } finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className={CARD}>
        <ScreenTitle>Territory wise - Listed Doctor Visit</ScreenTitle>
        <div className="flex flex-wrap items-end gap-4">
          <FFPicker value={code} onChange={setCode} label="Fieldforce Name" />
          {self ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2"><MonthYear label="From" v={from} monthOnly onChange={setFrom} /><MonthYear label="To" v={to} monthOnly onChange={setTo} /></div>
              <div className="flex gap-2"><MonthYear label="From" v={from} yearOnly onChange={setFrom} /><MonthYear label="To" v={to} yearOnly onChange={setTo} /></div>
            </div>
          ) : (
            <><MonthYear label="" v={from} monthOnly onChange={setFrom} /><MonthYear label="" v={from} yearOnly onChange={setFrom} /></>
          )}
          <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" checked={self} onChange={(e) => setSelf(e.target.checked)} /> Self Manager</label>
          <button type="button" className={GO} disabled={!code || loading} onClick={() => void view()}>{loading ? "Loading..." : "View"}</button>
        </div>
        <Err msg={error} />
      </div>
      {terr && <TerritoryView r={terr} onClose={() => setTerr(null)} />}
      {cov && <CoverageView r={cov} onClose={() => setCov(null)} />}
    </div>
  );
}
function TerritoryView({ r, onClose }: { r: TerritoryResult; onClose: () => void }) {
  const bg = { background: TEAL, color: "#fff" };
  const label = monthShort(r.month, " ");
  return (
    <ReportModal title="Territory wise - Listed Doctor Visit Details" fileName="Territorywise_Listed_Doctor_Visit" onClose={onClose} textButtons>
      <h3 className="text-base font-bold">Territory wise - Listed Doctor Visit Details for the Month of <span style={{ color: "red" }}>{label}</span></h3>
      <p className="text-sm font-bold" style={{ color: "#ff00cc" }}>{ffLine(r.employee, "Filed Force Name")}</p>
      <Notes notes={r.notes} />
      <div style={{ overflowX: "auto" }}>
        <table className="border-collapse">
          <thead><tr>{["S.No", "Fieldforce Name", "Designation", "HQ", "Territory Name", "Type", "No.of Drs Available", "No of Dr Visited", "Date of Visit", "Missed Dr"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
          <tbody>
            {r.rows.map((x) => {
              const ts = x.territories.length ? x.territories : [null];
              return ts.map((t, i) => (
                <tr key={x.employeeCode + i} style={{ background: "#ffccff" }}>
                  {i === 0 && <><td rowSpan={ts.length} className={TD + " text-center"}>{x.sno}</td><td rowSpan={ts.length} className={TD}>{x.name}</td><td rowSpan={ts.length} className={TD + " text-center"}>{x.designation}</td><td rowSpan={ts.length} className={TD}>{x.hq}</td></>}
                  <td className={TD}>{t?.territory ?? "-"}</td><td className={TD + " text-center"}>{t?.type ?? "-"}</td><td className={TD + " text-center"}>{dash(t?.available)}</td>
                  <td className={TD + " text-center"}>{dash(t?.visited)}</td><td className={TD}>{t?.days.length ? t.days.join(",") : "-"}</td><td className={TD + " text-center"}>{dash(t?.missed)}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </ReportModal>
  );
}
function CoverageView({ r, onClose }: { r: ManagerCoverageResult; onClose: () => void }) {
  const bg = { background: TEAL, color: "#fff" };
  return (
    <ReportModal title="Manager Wise - Coverage Analysis" fileName="Manager_Wise_Coverage_Analysis" onClose={onClose} textButtons>
      <h3 className="text-base font-bold">Manager Territory Coverage for the Period of <span style={{ color: "red" }}>{monthShort(r.fromMonth, " ")} To {monthShort(r.toMonth, " ")}</span></h3>
      <p className="text-sm font-bold" style={{ color: "#ff00cc" }}>{ffLine(r.employee, "Filed Force Name")}</p>
      <Notes notes={r.notes} />
      <div style={{ overflowX: "auto" }}>
        <table className="border-collapse">
          <thead><tr>{["S.No", "MR Name", "HQ", "Designation", "Territory Name", "Type", "No.of Drs Available"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
          <tbody>
            {r.rows.map((x) => {
              const n = x.territories.length + 1;
              return (
                <Fragment key={x.employeeCode}>
                  {x.territories.map((t, i) => (
                    <tr key={t.territory + i}>
                      {i === 0 && <><td rowSpan={n} className={TD + " text-center"}>{x.sno}</td><td rowSpan={n} className={TD}>{x.name}</td><td rowSpan={n} className={TD}>{x.hq}</td><td rowSpan={n} className={TD + " text-center"}>{x.designation}</td></>}
                      <td className={TD}>{t.territory}</td><td className={TD + " text-center"}>{t.type}</td><td className={TD + " text-center"}>{t.available}</td>
                    </tr>
                  ))}
                  <tr>
                    {x.territories.length === 0 && <><td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD}>{x.hq}</td><td className={TD + " text-center"}>{x.designation}</td></>}
                    <td className={TD + " font-bold"} style={{ color: "red" }} colSpan={2}>Summary</td><td className={TD + " text-center font-bold"} style={{ color: "red" }}>{x.total}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportModal>
  );
}

// ═══ 6) Product Exposure Analysis (+ 8) Unlisted variant) ═════════════
function ProductPick({ value, onChange, products }: { value: string; onChange: (v: string) => void; products: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={LABEL}>Product Name</span>
      <select className={SELECT} style={{ minWidth: 200 }} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">---Select the Product---</option>
        <option value="ALL" style={{ color: "red" }}>All Product</option>
        {products.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
}
function useProducts() { const [p, setP] = useState<string[]>([]); useEffect(() => { apiClient.productExposureOptions().then((r) => setP(r.data)).catch(() => setP([])); }, []); return p; }
const productLabel = (p: string) => (p === "ALL" ? "All Product" : p);

export function ProductExposureReport() {
  const products = useProducts();
  const [product, setProduct] = useState("");
  const [drill, setDrill] = useState<{ title: string; codes: string[]; month: string } | null>(null);
  return (
    <>
      <RangeForm<ProductExposureResult> title="Product Exposure Analysis" button="View" colorize defaultFrom={{ m: 4, y: NOW.y - 1 }} extra={<ProductPick value={product} onChange={setProduct} products={products} />} extraReady={!!product}
        run={async ({ range }) => (await apiClient.productExposureAnalysis({ ...range, product })).data}>
        {(r, close) => {
          const bg = { background: TEAL, color: "#fff" };
          const cell = (n: number, codes: string[], m: string, name: string) => (n ? <button type="button" className="underline" onClick={() => setDrill({ title: name, codes, month: m })}>{n}</button> : "-");
          return (
            <ReportModal title="Product Exposure Analysis" fileName="Product_Exposure_Analysis" onClose={close} textButtons>
              <h3 className="text-base font-bold">Product Exposure Analysis for the Period of {rangeShort(r.months)}</h3>
              <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
              <p className="text-sm font-bold">Product Name : <span style={{ color: "red" }}>{productLabel(r.product)}</span></p>
              <Notes notes={r.notes} />
              <div style={{ overflowX: "auto" }}>
                <table className="border-collapse">
                  <thead>
                    <tr>{["S.No", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}{r.months.map((m) => <th key={m} className={TH} style={bg}>{monthLong(m, "-")}</th>)}</tr>
                    <tr>{r.months.map((m) => <th key={m} className={TH} style={bg}>No. of Drs (As Per DCR)</th>)}</tr>
                  </thead>
                  <tbody>
                    {r.rows.map((x) => (
                      <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                        <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                        {r.months.map((m) => <td key={m} className={TD + " text-center"}>{cell(x.perMonth[m], [x.employeeCode], m, x.name)}</td>)}
                      </tr>
                    ))}
                    <tr style={{ background: "#ccffff" }}>
                      <td className={TD + " font-bold"} style={{ color: "red" }} colSpan={4}>Grand Total</td>
                      {r.months.map((m) => <td key={m} className={TD + " text-center"}>{cell(r.grand[m], r.codes, m, "Grand Total")}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            </ReportModal>
          );
        }}
      </RangeForm>
      {drill && <DrillModal product={product} d={drill} onClose={() => setDrill(null)} />}
    </>
  );
}
function DrillModal({ product, d, onClose }: { product: string; d: { title: string; codes: string[]; month: string }; onClose: () => void }) {
  const [res, setRes] = useState<ProductDrillResult | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { apiClient.productExposureDrill({ codes: d.codes.join(","), product, month: d.month }).then((r) => setRes(r.data)).catch((e) => setErr(e instanceof Error ? e.message : "Unable to load")); }, [d, product]);
  const bg = { background: TEAL, color: "#fff" };
  return (
    <ReportModal title={`Doctors detailed - ${d.title}`} fileName="Product_Exposure_Doctors" onClose={onClose} textButtons>
      <h3 className="text-base font-bold">{productLabel(product)} - {d.title} - {monthLong(d.month, "-")}</h3>
      <Err msg={err} />
      <table className="border-collapse">
        <thead><tr>{["S.No", "Doctor", "Code", "Speciality", "Territory", "Visit Dates"].map((h) => <th key={h} className={TH} style={bg}>{h}</th>)}</tr></thead>
        <tbody>{res?.rows.map((x, i) => <tr key={x.doctorCode + i}><td className={TD + " text-center"}>{i + 1}</td><td className={TD}>{x.doctorName}</td><td className={TD}>{x.doctorCode}</td><td className={TD}>{x.speciality}</td><td className={TD}>{x.territory}</td><td className={TD}>{x.dates.join(", ")}</td></tr>)}</tbody>
      </table>
    </ReportModal>
  );
}

export function ProductExposureUnlistedReport() {
  const products = useProducts();
  const [product, setProduct] = useState("");
  return (
    <RangeForm<ProductExposureResult> title="Product Exposure Analysis - Unlisted Doctor" button="View" extra={<ProductPick value={product} onChange={setProduct} products={products} />} extraReady={!!product}
      run={async ({ range }) => (await apiClient.productExposureUnlisted({ ...range, product })).data}>
      {(r, close) => {
        const bg = { background: TEAL, color: "#fff" };
        return (
          <ReportModal title="Product Exposure Analysis - Unlisted Doctor" fileName="Product_Exposure_Unlisted" onClose={close} textButtons>
            <h3 className="text-base font-bold">Product Exposure Analysis - Unlisted Doctor for the Period of {rangeShort(r.months)}</h3>
            <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
            <p className="text-sm font-bold">Product Name : <span style={{ color: "red" }}>{productLabel(r.product)}</span></p>
            {r.dataAvailable === false && <p className="text-sm font-bold text-status-danger">Data gap: unlisted-doctor visits do not capture a product, so no real counts exist.</p>}
            <Notes notes={r.notes} />
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead>
                  <tr>{["S.No", "FieldForce Name", "Designation", "HQ"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}{r.months.map((m) => <th key={m} className={TH} style={bg}>{monthLong(m, "-")}</th>)}</tr>
                  <tr>{r.months.map((m) => <th key={m} className={TH} style={bg}>No. of Drs (As Per DCR)</th>)}</tr>
                </thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                      {r.months.map((m) => <td key={m} className={TD + " text-center"}>{dash(x.perMonth[m])}</td>)}
                    </tr>
                  ))}
                  <tr><td className={TD} colSpan={4 + r.months.length}>&nbsp;</td></tr>
                </tbody>
              </table>
            </div>
          </ReportModal>
        );
      }}
    </RangeForm>
  );
}

// ═══ 7) ListedDr - Product Visit ══════════════════════════════════════
export function ListedDrProductVisitReport() {
  return (
    <RangeForm<ListedDrProductResult> title="ListedDr - Product Visit" button="View" defaultFrom={NOW} run={async ({ range }) => (await apiClient.listedDrProductVisit(range)).data}>
      {(r, close) => {
        const bg = { background: TEAL, color: "#fff" };
        return (
          <ReportModal title="ListedDr - Product Visit" fileName="ListedDr_Product_Visit" onClose={close} textButtons>
            <h3 className="text-base font-bold">ListedDr - Product Visit for the Period of {rangeShort(r.months)}</h3>
            <p className="text-sm font-bold">{ffLine(r.employee, "Filed Force Name")}</p>
            <Notes notes={r.notes} />
            <div style={{ overflowX: "auto" }}>
              <table className="border-collapse">
                <thead>
                  <tr>{["S.No", "FieldForce Name", "Designation", "HQ", "No of Product Tagged-Drs"].map((h) => <th key={h} rowSpan={2} className={TH} style={bg}>{h}</th>)}{r.months.map((m) => <th key={m} className={TH} style={bg}>{monthLong(m, "-")}</th>)}</tr>
                  <tr>{r.months.map((m) => <th key={m} className={TH} style={bg}>Product Visit</th>)}</tr>
                </thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.employeeCode} style={{ background: rowBg(x.role) }}>
                      <td className={TD + " text-center"}>{x.sno}</td><td className={TD}>{x.name}</td><td className={TD + " text-center"}>{x.designation}</td><td className={TD}>{x.hq}</td>
                      <td className={TD + " text-center"}>{dash(x.taggedDrs)}</td>
                      {r.months.map((m) => <td key={m} className={TD + " text-center"}>{dash(x.perMonth[m])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportModal>
        );
      }}
    </RangeForm>
  );
}
