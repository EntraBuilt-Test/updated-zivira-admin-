"use client";

import { useEffect, useMemo, useState } from "react";
import { CustomSelect } from "@/components/custom-select";
import { apiClient, type MasterRecord } from "@/lib/api-client";

// Round 11 item 1 — sanpharma's real "Expense Consolidated View for the
// Month of <Month> - <Year>" report: a genuine expense ledger (bank details,
// TWD/FW, HQ/EX/OS field-work counts, per-allowance columns, Applied/
// Addition & Detection/Confirmed amounts), not the Coverage Analysis 2
// report this screen wrongly reused in Round 8. Identity + TWD/FW/HQ/EX/OS
// are real (Employee + DCR/territoryType data); claim columns are real
// aggregates of the existing per-Tour-Plan ExpenseClaimModel, honestly
// blank for an employee with no submitted claims that month.
//
// Round 12 item 8 — sanpharma's real search form is FieldForce Name +
// From Month/Year + To Month/Year + an "At a Glance" checkbox + View,
// not a bare Month/Year picker. Without "At a Glance" it shows this same
// detailed ledger (filtered to the chosen employee, for the From month);
// with "At a Glance" checked it shows a different summary table instead —
// one row per employee with a merged Applied/Approved Amount pair per
// month in the selected range plus Applied/Approved Totals, and a Grand
// Total row — wired to the new atAGlance endpoint.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const YEARS = ["2024", "2025", "2026", "2027"];

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "center", fontSize: 11, whiteSpace: "nowrap" };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

type Row = {
  empCode: string; fieldForceName: string; designation: string; headQuarter: string; state: string; subDivision: string;
  bankName: string | null; bankAccountNo: string | null; ifscCode: string | null;
  twd: number; fw: number; hq: number; ex: number; os: number;
  da: number | null; fare: number | null; internet: number | null; mobileAllowances: number | null;
  vehicleAllowances: number | null; travel: number | null; communicationAllowance: number | null;
  stay: number | null; foodBill: number | null; conveyance: number | null; additionalExpenses: number | null;
  appliedAmount: number | null; additionDeduction: number | null; confirmedAmount: number | null;
};

type GlanceRow = {
  empCode: string;
  fieldForceName: string;
  designation: string;
  headQuarter: string;
  perMonth: { month: string; appliedAmount: number; approvedAmount: number }[];
  appliedTotal: number;
  approvedTotal: number;
};

function v(x: number | null): string {
  return x === null || x === undefined ? "" : String(x);
}

function monthLabel(monthStr: string): string {
  const [y, m] = monthStr.split("-");
  const idx = Number(m) - 1;
  return `${MONTHS[idx] ?? m}-${y}`;
}

export function ExpenseConsolidatedViewPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const now = new Date();
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [fromMonth, setFromMonth] = useState(String(now.getMonth() + 1));
  const [fromYear, setFromYear] = useState(String(now.getFullYear()));
  const [toMonth, setToMonth] = useState(String(now.getMonth() + 1));
  const [toYear, setToYear] = useState(String(now.getFullYear()));
  const [atAGlance, setAtAGlance] = useState(false);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [glanceRows, setGlanceRows] = useState<GlanceRow[] | null>(null);
  const [glanceMonths, setGlanceMonths] = useState<string[]>([]);
  const [glanceGrandTotal, setGlanceGrandTotal] = useState<{ appliedTotal: number; approvedTotal: number } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  const employeeCode = useMemo(() => {
    const emp = employees.find((e) => String(e.name ?? "") === fieldForceName);
    return emp ? String(emp.employeeCode ?? "") : undefined;
  }, [employees, fieldForceName]);

  async function view() {
    setError(null);
    setLoading(true);
    setRows(null);
    setGlanceRows(null);
    setGlanceGrandTotal(null);
    try {
      if (atAGlance) {
        const res = await apiClient.expenseConsolidatedViewAtAGlance({
          fromMonth,
          fromYear,
          toMonth,
          toYear,
          employeeCode
        });
        setGlanceRows(res.data as unknown as GlanceRow[]);
        setGlanceMonths((res as unknown as { months?: string[] }).months ?? []);
        setGlanceGrandTotal((res as unknown as { grandTotal?: { appliedTotal: number; approvedTotal: number } }).grandTotal ?? null);
      } else {
        const res = await apiClient.expenseConsolidatedView({ month: fromMonth, year: fromYear, employeeCode });
        setRows(res.data as unknown as Row[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Expense Consolidated View");
    } finally {
      setLoading(false);
    }
  }

  const totals = rows
    ? rows.reduce(
        (acc, r) => {
          acc.da += r.da || 0;
          acc.fare += r.fare || 0;
          acc.appliedAmount += r.appliedAmount || 0;
          return acc;
        },
        { da: 0, fare: 0, appliedAmount: 0 }
      )
    : null;

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Report</p>
        <h2 className="text-2xl font-bold text-text-primary">Expense Consolidated View</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: 220 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">FieldForce Name</span>
          <CustomSelect
            value={fieldForceName}
            options={employeeOptions.map((e) => String(e.name ?? ""))}
            onChange={setFieldForceName}
            placeholder="All"
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">From Month</span>
          <CustomSelect value={MONTHS[Number(fromMonth) - 1]} options={MONTHS} onChange={(v2) => setFromMonth(String(MONTHS.indexOf(v2) + 1))} />
        </div>
        <div style={{ minWidth: 110 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">From Year</span>
          <CustomSelect value={fromYear} options={YEARS} onChange={setFromYear} />
        </div>
        <div style={{ minWidth: 140 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">To Month</span>
          <CustomSelect value={MONTHS[Number(toMonth) - 1]} options={MONTHS} onChange={(v2) => setToMonth(String(MONTHS.indexOf(v2) + 1))} />
        </div>
        <div style={{ minWidth: 110 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">To Year</span>
          <CustomSelect value={toYear} options={YEARS} onChange={setToYear} />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-primary pb-2">
          <input type="checkbox" checked={atAGlance} onChange={(e) => setAtAGlance(e.target.checked)} />
          At a Glance
        </label>
        <button className="button" type="button" onClick={view} disabled={loading}>
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {glanceRows && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3 text-center">
            Expense Consolidated View From {monthLabel(glanceMonths[0] ?? `${fromYear}-${fromMonth.padStart(2, "0")}`)} to{" "}
            {monthLabel(glanceMonths[glanceMonths.length - 1] ?? `${toYear}-${toMonth.padStart(2, "0")}`)}
          </h3>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={head} rowSpan={2}>S.No</th>
                <th style={head} rowSpan={2}>FieldForce Name</th>
                <th style={head} rowSpan={2}>Designation Name</th>
                <th style={head} rowSpan={2}>HQ</th>
                {glanceMonths.map((mo) => (
                  <th style={head} colSpan={2} key={mo}>{monthLabel(mo)}</th>
                ))}
                <th style={head} rowSpan={2}>Applied Total</th>
                <th style={head} rowSpan={2}>Approved Total</th>
              </tr>
              <tr>
                {glanceMonths.flatMap((mo) => [
                  <th style={head} key={`${mo}-applied-hdr`}>Applied Amount</th>,
                  <th style={head} key={`${mo}-approved-hdr`}>Approved Amount</th>
                ])}
              </tr>
            </thead>
            <tbody>
              {glanceRows.length === 0 && (
                <tr><td style={cell} colSpan={4 + glanceMonths.length * 2 + 2}>No Records Found</td></tr>
              )}
              {glanceRows.map((r, i) => (
                <tr key={r.empCode}>
                  <td style={cell}>{i + 1}</td>
                  <td style={{ ...cell, fontWeight: 600, textAlign: "left" }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.headQuarter}</td>
                  {r.perMonth.flatMap((pm) => [
                    <td style={cell} key={`${pm.month}-a`}>{pm.appliedAmount}</td>,
                    <td style={cell} key={`${pm.month}-b`}>{pm.approvedAmount}</td>
                  ])}
                  <td style={{ ...cell, background: "#cffafe" }}>{r.appliedTotal}</td>
                  <td style={{ ...cell, background: "#bbf7d0" }}>{r.approvedTotal}</td>
                </tr>
              ))}
              {glanceRows.length > 0 && glanceGrandTotal && (
                <tr>
                  <td style={{ ...head, textAlign: "right" }} colSpan={4 + glanceMonths.length * 2}>Grand Total</td>
                  <td style={{ ...head, color: "#dc2626" }}>{glanceGrandTotal.appliedTotal}</td>
                  <td style={{ ...head, color: "#dc2626" }}>{glanceGrandTotal.approvedTotal}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {rows && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3 text-center">
            Expense Consolidated View for the Month of {MONTHS[Number(fromMonth) - 1]} - {fromYear}
          </h3>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                {[
                  "S.No", "Fieldforce Name", "Designation", "Head Quater", "State", "Sub Division", "Employee_Code",
                  "Bank Name", "Bank A/C No", "IFSC Code", "TWD", "FW", "HQ", "EX", "OS", "DA", "Fare", "INTERNET",
                  "MOBILE ALLOWANCES", "VEHICLE ALLOWANCES", "TRAVEL", "COMMUNICATION ALLOWANCE", "STAY", "FOOD BILL",
                  "CONVEYANCE", "Additional Expenses", "Applied Amount(By MR)", "Addition & Detection", "Confirmed Amount(By Admin)"
                ].map((h) => <th key={h} style={head}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td style={cell} colSpan={29}>No Records Found</td></tr>}
              {rows.map((r, i) => (
                <tr key={r.empCode}>
                  <td style={cell}>{i + 1}</td>
                  <td style={{ ...cell, fontWeight: 600, textAlign: "left" }}>{r.fieldForceName}</td>
                  <td style={cell}>{r.designation}</td>
                  <td style={cell}>{r.headQuarter}</td>
                  <td style={cell}>{r.state}</td>
                  <td style={cell}>{r.subDivision}</td>
                  <td style={cell}>{r.empCode}</td>
                  <td style={cell}>{r.bankName || ""}</td>
                  <td style={cell}>{r.bankAccountNo || ""}</td>
                  <td style={cell}>{r.ifscCode || ""}</td>
                  <td style={cell}>{r.twd}</td>
                  <td style={cell}>{r.fw}</td>
                  <td style={cell}>{r.hq}</td>
                  <td style={cell}>{r.ex}</td>
                  <td style={cell}>{r.os}</td>
                  <td style={cell}>{v(r.da)}</td>
                  <td style={cell}>{v(r.fare)}</td>
                  <td style={cell}>{v(r.internet)}</td>
                  <td style={cell}>{v(r.mobileAllowances)}</td>
                  <td style={cell}>{v(r.vehicleAllowances)}</td>
                  <td style={cell}>{v(r.travel)}</td>
                  <td style={cell}>{v(r.communicationAllowance)}</td>
                  <td style={cell}>{v(r.stay)}</td>
                  <td style={cell}>{v(r.foodBill)}</td>
                  <td style={cell}>{v(r.conveyance)}</td>
                  <td style={cell}>{v(r.additionalExpenses)}</td>
                  <td style={{ ...cell, background: "#cffafe" }}>{v(r.appliedAmount)}</td>
                  <td style={{ ...cell, background: "#fef08a" }}>{v(r.additionDeduction)}</td>
                  <td style={{ ...cell, background: "#bbf7d0" }}>{v(r.confirmedAmount)}</td>
                </tr>
              ))}
              {rows.length > 0 && totals && (
                <tr>
                  <td style={{ ...head, textAlign: "right" }} colSpan={15}>Total</td>
                  <td style={{ ...head, color: "#dc2626" }}>{totals.da || ""}</td>
                  <td style={{ ...head, color: "#dc2626" }}>{totals.fare || ""}</td>
                  <td style={cell} colSpan={9}></td>
                  <td style={{ ...head, color: "#dc2626" }}>{totals.appliedAmount || ""}</td>
                  <td style={cell} colSpan={2}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
