"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 item 4 (Sample Dispatch - Status) — real Employee identity plus
// real OB/Despatch Quantity/Issued Quantity/CB summed from DespatchLogModel
// (0 until real despatch rows exist — see despatch-log.model.ts).
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

type Row = { employeeCode: string; fieldForceName: string; hq: string; designation: string; ob: number; despatchQty: number; issuedQty: number; cb: number };

export function DispatchStatusPanel({ title, fetchFn }: { title: string; fetchFn: (params: Record<string, string>) => Promise<{ data: unknown[] }> }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Round 10 item 3 — Field Force Name was only ever populated after the
  // panel's own View/Search action ran, so the dropdown showed nothing
  // until then (and never, if that action is gated behind another required
  // field). Prefetch on mount like every other populated dropdown does.
  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const [selectedName, setSelectedName] = useState("");
  const [fromMonth, setFromMonth] = useState(MONTHS[new Date().getMonth()]);
  const [fromYear, setFromYear] = useState(String(new Date().getFullYear()));
  const [toMonth, setToMonth] = useState(MONTHS[new Date().getMonth()]);
  const [toYear, setToYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<Row[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [String(y - 1), String(y), String(y + 1)];
  }, []);

  async function go() {
    setError(null);
    setLoading(true);
    try {
      const [empRes, res] = await Promise.all([
        employees.length ? Promise.resolve({ data: employees }) : apiClient.employees(),
        fetchFn({
          fieldForceName: selectedName ? selectedName.split(" - ")[0] : "",
          fromMonth: String(MONTHS.indexOf(fromMonth) + 1),
          fromYear,
          toMonth: String(MONTHS.indexOf(toMonth) + 1),
          toYear
        })
      ]);
      setEmployees(empRes.data);
      setRows(res.data as Row[]);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${title}`);
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    const header = ["S.No", "FieldForce Name", "HQ", "Designation", "OB", "Despatch Quantity", "Issued Quantity", "CB"];
    const body = rows.map((r, i) => [i + 1, r.fieldForceName, r.hq, r.designation, r.ob, r.despatchQty, r.issuedQty, r.cb]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 30));
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "240px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">FieldForce Name</span>
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
        <div style={{ minWidth: "140px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">To Month</span>
          <CustomSelect value={toMonth} options={MONTHS} onChange={setToMonth} />
        </div>
        <div style={{ minWidth: "110px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">To Year</span>
          <CustomSelect value={toYear} options={yearOptions} onChange={setToYear} />
        </div>
        <button className="button" type="button" onClick={go} disabled={loading}>
          {loading ? "Loading..." : "Go"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-bold">{title}</h3>
            <div className="flex gap-2">
              <button className="button button-secondary" type="button" onClick={() => window.print()}>Print</button>
              <button className="button button-secondary" type="button" onClick={exportExcel} disabled={!rows.length}>Excel</button>
              <button className="button button-secondary" type="button" onClick={() => setSearched(false)}>Close</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
              <thead>
                <tr>
                  <th style={head}>S.No</th>
                  <th style={head}>FieldForce Name</th>
                  <th style={head}>HQ</th>
                  <th style={head}>Designation</th>
                  <th style={head}>OB</th>
                  <th style={head}>Despatch Quantity</th>
                  <th style={head}>Issued Quantity</th>
                  <th style={head}>CB</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td style={cell} colSpan={8}>No Records Found</td></tr>}
                {rows.map((r, i) => (
                  <tr key={r.employeeCode}>
                    <td style={cell}>{i + 1}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                    <td style={cell}>{r.hq}</td>
                    <td style={cell}>{r.designation}</td>
                    <td style={cell}>{r.ob}</td>
                    <td style={cell}>{r.despatchQty}</td>
                    <td style={cell}>{r.issuedQty}</td>
                    <td style={cell}>{r.cb}</td>
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
