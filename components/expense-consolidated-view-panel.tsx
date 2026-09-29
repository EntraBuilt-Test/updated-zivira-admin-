"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/custom-select";
import { apiClient } from "@/lib/api-client";

// Round 11 item 1 — sanpharma's real "Expense Consolidated View for the
// Month of <Month> - <Year>" report: a genuine expense ledger (bank details,
// TWD/FW, HQ/EX/OS field-work counts, per-allowance columns, Applied/
// Addition & Detection/Confirmed amounts), not the Coverage Analysis 2
// report this screen wrongly reused in Round 8. Identity + TWD/FW/HQ/EX/OS
// are real (Employee + DCR/territoryType data); claim columns are real
// aggregates of the existing per-Tour-Plan ExpenseClaimModel, honestly
// blank for an employee with no submitted claims that month.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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

function v(x: number | null): string {
  return x === null || x === undefined ? "" : String(x);
}

export function ExpenseConsolidatedViewPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function view() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.expenseConsolidatedView({ month, year });
      setRows(res.data as unknown as Row[]);
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
        <div style={{ minWidth: 160 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
          <CustomSelect value={MONTHS[Number(month) - 1]} options={MONTHS} onChange={(v2) => setMonth(String(MONTHS.indexOf(v2) + 1))} />
        </div>
        <div style={{ minWidth: 120 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={year} options={["2024", "2025", "2026", "2027"]} onChange={setYear} />
        </div>
        <button className="button" type="button" onClick={view} disabled={loading}>
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {rows && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-3 text-center">
            Expense Consolidated View for the Month of {MONTHS[Number(month) - 1]} - {year}
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
