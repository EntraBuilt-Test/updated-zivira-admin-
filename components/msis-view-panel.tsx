"use client";

import { Fragment, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 item 7 — MSIS View, both real modes: "Monthwise" (HQ Sales / Less
// Infiltration / Add Infiltration / Add Infiltration (sanpharma's own MSIS
// screen repeats this label — reproduced exactly, not a bug) / Total Sales,
// each with Qty+Val) and "Periodically" (HQ Sales / Total Sales only, summed
// year-to-date). Real Product name + rate (Product.rate, Round 8 item 7) and
// real MsisSaleModel sales rows — 0/qty and "-"/val until a real sale or
// rate is recorded.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

type Row = {
  productName: string;
  rate: number | string;
  hqSalesQty: number; hqSalesVal: number | string;
  lessInfiltrationQty: number; lessInfiltrationVal: number | string;
  addInfiltrationQty: number; addInfiltrationVal: number | string;
  addInfiltration2Qty: number; addInfiltration2Val: number | string;
  totalSalesQty: number; totalSalesVal: number | string;
};

export function MsisViewPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [fromMonth, setFromMonth] = useState(MONTHS[new Date().getMonth()]);
  const [fromYear, setFromYear] = useState(String(new Date().getFullYear()));
  const [mode, setMode] = useState<"Monthwise" | "Periodically">("Monthwise");
  const [rows, setRows] = useState<Row[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [String(y - 1), String(y), String(y + 1)];
  }, []);

  async function view() {
    setError(null);
    setLoading(true);
    try {
      const [empRes, res] = await Promise.all([
        employees.length ? Promise.resolve({ data: employees }) : apiClient.employees(),
        apiClient.msisView({
          fieldForceName: selectedName ? selectedName.split(" - ")[0] : "",
          fromMonth: String(MONTHS.indexOf(fromMonth) + 1),
          fromYear,
          mode
        })
      ]);
      setEmployees(empRes.data);
      setRows(res.data as unknown as Row[]);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load MSIS View");
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    const header = mode === "Monthwise"
      ? ["S.No", "Product Name", "Rate", "HQ Sales Qty", "HQ Sales Val", "Less Infiltration Qty", "Less Infiltration Val", "Add Infiltration Qty", "Add Infiltration Val", "Add Infiltration Qty", "Add Infiltration Val", "Total Sales Qty", "Total Sales Val"]
      : ["S.No", "Product Name", "Rate", "HQ Sales Qty", "HQ Sales Val", "Total Sales Qty", "Total Sales Val"];
    const body = rows.map((r, i) => mode === "Monthwise"
      ? [i + 1, r.productName, r.rate, r.hqSalesQty, r.hqSalesVal, r.lessInfiltrationQty, r.lessInfiltrationVal, r.addInfiltrationQty, r.addInfiltrationVal, r.addInfiltration2Qty, r.addInfiltration2Val, r.totalSalesQty, r.totalSalesVal]
      : [i + 1, r.productName, r.rate, r.hqSalesQty, r.hqSalesVal, r.totalSalesQty, r.totalSalesVal]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MSIS View");
    XLSX.writeFile(wb, `MSIS_View_${mode}.xlsx`);
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">MSIS - View</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "240px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect value={selectedName} options={employees.map(employeeLabel)} onChange={setSelectedName} placeholder="All" />
        </div>
        <div style={{ minWidth: "140px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">From Month</span>
          <CustomSelect value={fromMonth} options={MONTHS} onChange={setFromMonth} />
        </div>
        <div style={{ minWidth: "110px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">From Year</span>
          <CustomSelect value={fromYear} options={yearOptions} onChange={setFromYear} />
        </div>
        <div style={{ minWidth: "170px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Report Type</span>
          <CustomSelect value={mode} options={["Monthwise", "Periodically"]} onChange={(v) => setMode(v as "Monthwise" | "Periodically")} />
        </div>
        <button className="button" type="button" onClick={view} disabled={loading}>
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-bold">MSIS - View ({mode}) - {fromMonth} {fromYear}</h3>
            <div className="flex gap-2">
              <button className="button button-secondary" type="button" onClick={() => window.print()}>Print</button>
              <button className="button button-secondary" type="button" onClick={exportExcel} disabled={!rows.length}>Excel</button>
              <button className="button button-secondary" type="button" onClick={() => setSearched(false)}>Close</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
              <thead>
                {mode === "Monthwise" ? (
                  <>
                    <tr>
                      <th style={head} rowSpan={2}>S.No</th>
                      <th style={head} rowSpan={2}>Product Name</th>
                      <th style={head} rowSpan={2}>Rate</th>
                      <th style={head} colSpan={2}>HQ Sales</th>
                      <th style={head} colSpan={2}>Less Infiltration</th>
                      <th style={head} colSpan={2}>Add Infiltration</th>
                      <th style={head} colSpan={2}>Add Infiltration</th>
                      <th style={head} colSpan={2}>Total Sales</th>
                    </tr>
                    <tr>
                      {Array.from({ length: 5 }).map((_, gi) => (
                        <Fragment key={gi}>
                          <th style={head}>Qty</th>
                          <th style={head}>Val</th>
                        </Fragment>
                      ))}
                    </tr>
                  </>
                ) : (
                  <tr>
                    <th style={head} rowSpan={2}>S.No</th>
                    <th style={head} rowSpan={2}>Product Name</th>
                    <th style={head} rowSpan={2}>Rate</th>
                    <th style={head} colSpan={2}>HQ Sales</th>
                    <th style={head} colSpan={2}>Total Sales</th>
                  </tr>
                )}
                {mode === "Periodically" && (
                  <tr>
                    <th style={head}>Qty</th><th style={head}>Val</th>
                    <th style={head}>Qty</th><th style={head}>Val</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td style={cell} colSpan={mode === "Monthwise" ? 13 : 7}>No Records Found</td></tr>}
                {rows.map((r, i) => (
                  <tr key={r.productName}>
                    <td style={cell}>{i + 1}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.productName}</td>
                    <td style={cell}>{r.rate}</td>
                    <td style={cell}>{r.hqSalesQty}</td>
                    <td style={cell}>{r.hqSalesVal}</td>
                    {mode === "Monthwise" && (
                      <>
                        <td style={cell}>{r.lessInfiltrationQty}</td>
                        <td style={cell}>{r.lessInfiltrationVal}</td>
                        <td style={cell}>{r.addInfiltrationQty}</td>
                        <td style={cell}>{r.addInfiltrationVal}</td>
                        <td style={cell}>{r.addInfiltration2Qty}</td>
                        <td style={cell}>{r.addInfiltration2Val}</td>
                      </>
                    )}
                    <td style={cell}>{r.totalSalesQty}</td>
                    <td style={cell}>{r.totalSalesVal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
