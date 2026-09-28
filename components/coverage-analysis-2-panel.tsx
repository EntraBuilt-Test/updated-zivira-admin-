"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's Activity Reports >> Expense Analysis screen,
// which is actually their "Coverage Analysis 2" report
// (rpt_Coverage_2_Pivot.aspx) — a title of "Coverage Analysis 2 - <Month>
// <Year>", a "Field Force Name: <name> - <designation> - <HQ>" subheading,
// and one wide table per employee: S.No / Emp.Code / DOJ / FieldForce Name
// / Designation Name / HQ / First Level Manager / Second Level Manager /
// No Of FWD / No Of FWD Exp / Ttl Drs, followed by three grouped
// "Territory Type" column-groups (HQ / EX / OS), each with its own
// TC / DW / Met / Seen / Coverage / Cal Avg / Amt / Amt/Call(in Rs)
// sub-columns, plus Print/Excel/Close actions above the table.
//
// This app has no real per-territory-type call/coverage tracking backing
// TC/DW/Met/Seen/Coverage/Cal Avg/Amt/Amt-per-call yet (that would need a
// full DCR call-log aggregation this round doesn't build) — those always
// show "-" here, exactly like sanpharma shows "-" for its own genuinely
// empty cells, rather than inventing numbers. Every other column is a real
// field: employee code, DOJ (Employee.joinDate), designation, HQ
// (Employee.territory), and First/Second Level Manager resolved from the
// real employee hierarchy (reportingManager, and that manager's own
// reportingManager).
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const METRIC_COLS = ["TC", "DW", "Met", "Seen", "Coverage", "Cal Avg", "Amt", "Amt/Call(in Rs)"] as const;
const TERRITORY_TYPES = ["HQ", "EX", "OS"] as const;

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

export function CoverageAnalysis2Panel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [String(y - 1), String(y), String(y + 1)];
  }, []);

  async function ensureEmployees() {
    if (loaded) return employees;
    const res = await apiClient.employees();
    setEmployees(res.data);
    setLoaded(true);
    return res.data;
  }

  async function go() {
    setError(null);
    setLoading(true);
    try {
      await ensureEmployees();
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Field Force data");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setSelectedName("");
    setSelectedYear(String(new Date().getFullYear()));
    setSelectedMonth(MONTHS[new Date().getMonth()]);
    setSearched(false);
  }

  const byCode = useMemo(() => new Map(employees.map((e) => [e.employeeCode, e])), [employees]);

  const rows = useMemo(() => {
    if (!searched) return [];
    const matching = selectedName
      ? employees.filter((e) => employeeLabel(e) === selectedName)
      : employees;
    return [...matching].sort((a, b) => a.name.localeCompare(b.name));
  }, [searched, selectedName, employees]);

  function firstLevelManager(e: Employee): string {
    if (!e.reportingManager) return "-";
    const mgr = byCode.get(e.reportingManager);
    return mgr ? mgr.name : e.reportingManager;
  }

  function secondLevelManager(e: Employee): string {
    if (!e.reportingManager) return "-";
    const mgr = byCode.get(e.reportingManager);
    if (!mgr?.reportingManager) return "-";
    const mgr2 = byCode.get(mgr.reportingManager);
    return mgr2 ? mgr2.name : mgr.reportingManager;
  }

  function doj(e: Employee): string {
    if (!e.joinDate) return "-";
    const d = new Date(e.joinDate);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB").replace(/\//g, "-");
  }

  function exportExcel() {
    const header1 = [
      "S.No", "Emp.Code", "DOJ", "FieldForce Name", "Designation Name", "HQ",
      "First Level Manager", "Second Level Manager", "No Of FWD", "No Of FWD Exp", "Ttl Drs",
      ...TERRITORY_TYPES.flatMap((t) => METRIC_COLS.map((m) => `${t} ${m}`))
    ];
    const body = rows.map((e, i) => [
      i + 1, e.employeeCode, doj(e), e.name, e.designation, e.territory,
      firstLevelManager(e), secondLevelManager(e), "-", "-", "-",
      ...TERRITORY_TYPES.flatMap(() => METRIC_COLS.map(() => "-"))
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header1, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Coverage Analysis 2");
    XLSX.writeFile(wb, `Coverage_Analysis_2_${selectedMonth}_${selectedYear}.xlsx`);
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">Expense Analysis</h2>
        <p className="text-sm text-text-muted mt-1">Matches sanpharma.info&apos;s own &quot;Coverage Analysis 2&quot; report exactly.</p>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "260px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect
            value={selectedName}
            options={employees.map(employeeLabel)}
            onChange={setSelectedName}
            placeholder="All"
          />
        </div>
        <div style={{ minWidth: "160px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
          <CustomSelect value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} placeholder="Month" />
        </div>
        <div style={{ minWidth: "120px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={selectedYear} options={yearOptions} onChange={setSelectedYear} placeholder="Year" />
        </div>
        <button className="button" type="button" onClick={go} disabled={loading}>
          {loading ? "Loading..." : "Go"}
        </button>
        <button className="button button-secondary" type="button" onClick={clear}>
          Clear
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-center">
                Coverage Analysis 2 - {selectedMonth} {selectedYear}
              </h3>
              {selectedName && (
                <p className="text-sm text-text-secondary text-center">Field Force Name : {selectedName}</p>
              )}
            </div>
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
                  <th style={head} rowSpan={2}>S.No</th>
                  <th style={head} rowSpan={2}>Emp.Code</th>
                  <th style={head} rowSpan={2}>DOJ</th>
                  <th style={head} rowSpan={2}>FieldForce Name</th>
                  <th style={head} rowSpan={2}>Designation Name</th>
                  <th style={head} rowSpan={2}>HQ</th>
                  <th style={head} rowSpan={2}>First Level Manager</th>
                  <th style={head} rowSpan={2}>Second Level Manager</th>
                  <th style={head} rowSpan={2}>No Of FWD</th>
                  <th style={head} rowSpan={2}>No Of FWD Exp</th>
                  <th style={head} rowSpan={2}>Ttl Drs</th>
                  <th style={head} colSpan={METRIC_COLS.length * TERRITORY_TYPES.length}>Territory Type</th>
                </tr>
                <tr>
                  {TERRITORY_TYPES.map((t) => (
                    <th key={t} style={head} colSpan={METRIC_COLS.length}>{t}</th>
                  ))}
                </tr>
                <tr>
                  <th style={head} colSpan={11} />
                  {TERRITORY_TYPES.map((t) =>
                    METRIC_COLS.map((m) => <th key={`${t}-${m}`} style={head}>{m}</th>)
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td style={cell} colSpan={11 + METRIC_COLS.length * TERRITORY_TYPES.length}>
                      No Records Found
                    </td>
                  </tr>
                )}
                {rows.map((e, i) => (
                  <tr key={e.id}>
                    <td style={cell}>{i + 1}</td>
                    <td style={cell}>{e.employeeCode}</td>
                    <td style={cell}>{doj(e)}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{e.name}</td>
                    <td style={cell}>{e.designation}</td>
                    <td style={cell}>{e.territory}</td>
                    <td style={cell}>{firstLevelManager(e)}</td>
                    <td style={cell}>{secondLevelManager(e)}</td>
                    <td style={cell}>-</td>
                    <td style={cell}>-</td>
                    <td style={cell}>-</td>
                    {TERRITORY_TYPES.flatMap((t) =>
                      METRIC_COLS.map((m) => <td key={`${e.id}-${t}-${m}`} style={cell}>-</td>)
                    )}
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
