"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 items 3 & 5 — Sample/Input Dispatch "View": real Employee identity
// columns (Fieldforce Name/HQ/Designation, plus State for Input) with one
// real column per selected month, summed from the new DespatchLogModel
// (genuinely 0 until a real despatch is logged there — see
// despatch-log.model.ts / masters-actions.routes.ts).
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
  employeeCode: string;
  fieldForceName: string;
  hq: string;
  designation: string;
  state: string;
  monthly: Record<string, number>;
};

export function DispatchViewPanel({
  title,
  fetchFn,
  showState
}: {
  title: string;
  fetchFn: (params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string }) => Promise<{ data: unknown[]; months?: string[] }>;
  showState?: boolean;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [fromMonth, setFromMonth] = useState(MONTHS[new Date().getMonth()]);
  const [fromYear, setFromYear] = useState(String(new Date().getFullYear()));
  const [toMonth, setToMonth] = useState(MONTHS[new Date().getMonth()]);
  const [toYear, setToYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<Row[]>([]);
  const [months, setMonths] = useState<string[]>([]);
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
      setMonths(res.months || []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${title}`);
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    const header = ["S.No", "Fieldforce Name", "HQ", ...(showState ? ["State"] : []), "Designation", ...months];
    const body = rows.map((r, i) => [
      i + 1, r.fieldForceName, r.hq, ...(showState ? [r.state] : []), r.designation,
      ...months.map((m) => r.monthly?.[m] ?? 0)
    ]);
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
          <span className="block text-xs font-medium text-text-muted mb-1">Fieldforce Name</span>
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
                  <th style={head}>Fieldforce Name</th>
                  <th style={head}>HQ</th>
                  {showState && <th style={head}>State</th>}
                  <th style={head}>Designation</th>
                  {months.map((m) => <th key={m} style={head}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td style={cell} colSpan={4 + months.length + (showState ? 1 : 0)}>No Records Found</td></tr>}
                {rows.map((r, i) => (
                  <tr key={r.employeeCode}>
                    <td style={cell}>{i + 1}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                    <td style={cell}>{r.hq}</td>
                    {showState && <td style={cell}>{r.state}</td>}
                    <td style={cell}>{r.designation}</td>
                    {months.map((m) => <td key={m} style={cell}>{r.monthly?.[m] ?? 0}</td>)}
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
