"use client";

import { useEffect, useMemo, useState } from "react";
import { downloadAoaXlsx } from "@/lib/xlsx-export";
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
// Round 8 items 1 & 2: TC/DW/Met/Seen/Coverage/Cal Avg are now real,
// computed server-side (GET /company/masters/coverageAnalysis2/action/list)
// from real DcrModel visit rows grouped by the doctor's real territoryType
// (Doctor.territoryType — HQ/EX/OS). Amt/Amt-per-call still show "-" — no
// model attributes an expense line item to a specific territory-type bucket
// of calls, so that figure genuinely doesn't exist yet; showing "-" there
// (never a fabricated number) matches how sanpharma itself shows a dash for
// a cell it has no data for. Every other column is a real field: employee
// code, DOJ (Employee.joinDate), designation, HQ (Employee.territory), and
// First/Second Level Manager resolved from the real employee hierarchy
// (reportingManager, and that manager's own reportingManager).
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

type TerritoryMetrics = {
  tc: number | string;
  dw: number | string;
  met: number | string;
  seen: number | string;
  coverage: number | string;
  calAvg: number | string;
  amt: number | string;
  amtPerCall: number | string;
};

type ReportRow = {
  empCode: string;
  doj: string | null;
  fieldForceName: string;
  designation: string;
  hq: string;
  firstLevelManager: string;
  secondLevelManager: string;
  noOfFwd: number | string;
  noOfFwdExp: number | string;
  ttlDrs: number | string;
  territoryTypes: Record<string, TerritoryMetrics>;
};

const METRIC_KEY_BY_LABEL: Record<(typeof METRIC_COLS)[number], keyof TerritoryMetrics> = {
  TC: "tc",
  DW: "dw",
  Met: "met",
  Seen: "seen",
  Coverage: "coverage",
  "Cal Avg": "calAvg",
  Amt: "amt",
  "Amt/Call(in Rs)": "amtPerCall"
};

export function CoverageAnalysis2Panel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Round 10 item 3 — Field Force Name was only ever populated after the
  // panel's own View/Search action ran, so the dropdown showed nothing
  // until then (and never, if that action is gated behind another required
  // field). Prefetch on mount like every other populated dropdown does.
  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
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

  async function go() {
    setError(null);
    setLoading(true);
    try {
      const [empRes, reportRes] = await Promise.all([
        employees.length ? Promise.resolve({ data: employees }) : apiClient.employees(),
        apiClient.coverageAnalysis2({
          month: MONTHS.indexOf(selectedMonth) + 1,
          year: Number(selectedYear)
        })
      ]);
      setEmployees(empRes.data);
      setReportRows(reportRes.data as unknown as ReportRow[]);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Coverage Analysis 2 data");
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

  const rows = useMemo(() => {
    if (!searched) return [];
    const matching = selectedName
      ? reportRows.filter((r) => {
          const emp = employees.find((e) => e.employeeCode === r.empCode);
          return emp ? employeeLabel(emp) === selectedName : false;
        })
      : reportRows;
    return [...matching].sort((a, b) => a.fieldForceName.localeCompare(b.fieldForceName));
  }, [searched, selectedName, reportRows, employees]);

  function doj(r: ReportRow): string {
    if (!r.doj) return "-";
    const d = new Date(r.doj);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB").replace(/\//g, "-");
  }

  function metric(r: ReportRow, t: (typeof TERRITORY_TYPES)[number], m: (typeof METRIC_COLS)[number]): string {
    const v = r.territoryTypes?.[t]?.[METRIC_KEY_BY_LABEL[m]];
    if (v === undefined || v === null || v === "") return "-";
    return m === "Coverage" && typeof v === "number" ? `${v}%` : String(v);
  }

  function exportExcel() {
    const header1 = [
      "S.No", "Emp.Code", "DOJ", "FieldForce Name", "Designation Name", "HQ",
      "First Level Manager", "Second Level Manager", "No Of FWD", "No Of FWD Exp", "Ttl Drs",
      ...TERRITORY_TYPES.flatMap((t) => METRIC_COLS.map((m) => `${t} ${m}`))
    ];
    const body = rows.map((r, i) => [
      i + 1, r.empCode, doj(r), r.fieldForceName, r.designation, r.hq,
      r.firstLevelManager, r.secondLevelManager, r.noOfFwd, r.noOfFwdExp, r.ttlDrs,
      ...TERRITORY_TYPES.flatMap((t) => METRIC_COLS.map((m) => metric(r, t, m)))
    ]);
    void downloadAoaXlsx({
      sheetName: "Coverage Analysis 2", fileName: `Coverage_Analysis_2_${selectedMonth}_${selectedYear}.xlsx`, header: header1, body,
      groups: { fixed: 11, groups: TERRITORY_TYPES.map((t) => ({ label: t, cols: METRIC_COLS.map((m) => m) })) }
    });
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
                {rows.map((r, i) => (
                  <tr key={r.empCode}>
                    <td style={cell}>{i + 1}</td>
                    <td style={cell}>{r.empCode}</td>
                    <td style={cell}>{doj(r)}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.fieldForceName}</td>
                    <td style={cell}>{r.designation}</td>
                    <td style={cell}>{r.hq}</td>
                    <td style={cell}>{r.firstLevelManager}</td>
                    <td style={cell}>{r.secondLevelManager}</td>
                    <td style={cell}>{r.noOfFwd}</td>
                    <td style={cell}>{r.noOfFwdExp}</td>
                    <td style={cell}>{r.ttlDrs}</td>
                    {TERRITORY_TYPES.flatMap((t) =>
                      METRIC_COLS.map((m) => (
                        <td key={`${r.empCode}-${t}-${m}`} style={cell}>{metric(r, t, m)}</td>
                      ))
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
