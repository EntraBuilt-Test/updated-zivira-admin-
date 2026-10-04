"use client";

import { Fragment, useEffect, useState } from "react";
import { FieldForceSelect } from "@/components/field-force-select";
import { withExcel } from "@/components/with-excel";
import {
  apiClient,
  type Employee,
  type DcrNotApprovedRow,
  type DcrNotSubmittedRow,
  type DcrCountModewiseRow,
  type DcrRejectApproveRow,
  type DcrTimeStatusRow,
  type DcrCheckinCheckoutRow
} from "@/lib/api-client";

// Round 35 -- 7 more Activity Reports > DCR legacy-parity report screens
// (items 1-6; item 7's Customized Report builder lives in
// custom-report-workspace.tsx as its own top-level module). See
// company.routes.ts for the exact endpoint behavior and the honest
// schema-reality disclosures surfaced verbatim in these panels.

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - 3 + i);

function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => { apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([])); }, []);
  return employees;
}

function MonthYear({ month, year, onMonth, onYear }: { month: number; year: number; onMonth: (m: number) => void; onYear: (y: number) => void }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Month</span>
        <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={month} onChange={(e) => onMonth(parseInt(e.target.value, 10))}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Year</span>
        <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={year} onChange={(e) => onYear(parseInt(e.target.value, 10))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </>
  );
}

// ── Item 1 -- DCR > Not Approved (company-wide) ─────────────────────────
function DcrNotApprovedReportInner() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [rows, setRows] = useState<DcrNotApprovedRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewed, setViewed] = useState(false);

  async function handleGo() {
    setLoading(true); setViewed(true);
    try { setRows((await apiClient.dcrNotApproved({ month: `${year}-${String(month).padStart(2, "0")}` })).data); }
    catch { setRows(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted self-center">From Range :</span>
        <MonthYear month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <button type="button" onClick={handleGo} disabled={loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "Go"}</button>
      </div>
      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4">
          <div className="text-center space-y-1 border-b border-border-subtle pb-4">
            <h2 className="font-headline-sm text-headline-sm text-text-primary underline">Not Approved DCR View for the month of {MONTH_NAMES[month - 1]} - {year}</h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
              <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">Field Force Name</th><th className="px-3 py-2">Region</th><th className="px-3 py-2">Approval Pending Dates</th><th className="px-3 py-2">Approval by</th></tr></thead>
              <tbody>
                {(rows || []).map((r, i) => (
                  <tr key={r.fieldForceName}><td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td><td className="px-3 py-2 border-t border-border-subtle">{r.fieldForceName}</td><td className="px-3 py-2 border-t border-border-subtle">{r.region}</td><td className="px-3 py-2 border-t border-border-subtle">{r.pendingDates}</td><td className="px-3 py-2 border-t border-border-subtle">{r.approvalBy}</td></tr>
                ))}
                {(!rows || rows.length === 0) && <tr><td colSpan={5} className="px-3 py-4 text-center text-text-muted">No pending approvals for this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Item 2 -- DCR > Not Submitted ───────────────────────────────────────
function DcrNotSubmittedReportInner() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [rows, setRows] = useState<DcrNotSubmittedRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewed, setViewed] = useState(false);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setViewed(true);
    try { setRows((await apiClient.dcrNotSubmitted({ employeeCode, month: `${year}-${String(month).padStart(2, "0")}` })).data); }
    catch { setRows(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Field Force Name</span>
          <div className="flex items-center gap-2">
            <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" defaultValue="Team"><option>Team</option></select>
            <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={employees} label="FieldForce Name" hideLabel />
          </div>
        </div>
        <MonthYear month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
      </div>
      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {rows && rows.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">Day</th><th className="px-3 py-2">Expected Territory</th></tr></thead>
                <tbody>{rows.map((r, i) => <tr key={r.day}><td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td><td className="px-3 py-2 border-t border-border-subtle">{r.day}</td><td className="px-3 py-2 border-t border-border-subtle">{r.expected}</td></tr>)}</tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">No record found</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item 3 -- DCR > Count-Modewise ──────────────────────────────────────
function DcrCountModewiseReportInner() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [mode, setMode] = useState<"" | "countwise" | "datewise">("");
  const [rows, setRows] = useState<DcrCountModewiseRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewed, setViewed] = useState(false);

  async function handleGo() {
    if (!employeeCode || !mode) return;
    setLoading(true); setViewed(true);
    try { setRows((await apiClient.dcrCountModewise({ employeeCode, month: `${year}-${String(month).padStart(2, "0")}`, mode })).data.rows); }
    catch { setRows(null); }
    finally { setLoading(false); }
  }

  const selected = employees.find((e) => e.employeeCode === employeeCode);

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <div className="flex flex-col gap-1">
          <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={employees} label="FieldForce Name" />
        </div>
        <MonthYear month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Mode</span>
          <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={mode} onChange={(e) => { setMode(e.target.value as "" | "countwise" | "datewise"); setViewed(false); }}>
            <option value="">---Select---</option>
            <option value="countwise">CountWise</option>
            <option value="datewise">DateWise</option>
          </select>
        </div>
        <button type="button" onClick={handleGo} disabled={!employeeCode || !mode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "Go"}</button>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary underline text-center">DCR - Status (Count - Modewise)</h2>
          {mode === "countwise" || !rows || rows.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No record found</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold">FieldForce: {selected?.name} &nbsp; Month: {MONTH_NAMES[month - 1]} &nbsp; Year: {year} &nbsp; Mode: DateWise</p>
              <p className="text-xs text-text-muted">Counts by submission channel. DCRs submitted before channel tagging began carry no channel and are shown under &quot;Others&quot;; new field-app DCRs are tagged Apps.</p>
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                  <thead className="bg-brand-primary-subtle">
                    <tr>
                      <th className="px-2 py-2" rowSpan={2}>S.No</th><th className="px-2 py-2" rowSpan={2}>Fieldforce Name</th><th className="px-2 py-2" rowSpan={2}>Head Quater</th><th className="px-2 py-2" rowSpan={2}>Emp Id</th><th className="px-2 py-2" rowSpan={2}>Designation</th>
                      <th className="px-2 py-1 text-center" colSpan={2}>Desktop</th><th className="px-2 py-1 text-center" colSpan={2}>Mobile</th><th className="px-2 py-1 text-center" colSpan={2}>Apps</th><th className="px-2 py-1 text-center" colSpan={2}>E-detailing</th><th className="px-2 py-1 text-center" colSpan={2}>Others</th><th className="px-2 py-1 text-center" colSpan={2}>IOS-Edet</th>
                    </tr>
                    <tr>{Array.from({ length: 6 }).map((_, i) => (
                      <Fragment key={i}>
                        <th className="px-2 py-1">Date</th><th className="px-2 py-1">Count</th>
                      </Fragment>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.employeeCode}>
                        <td className="px-2 py-1 border-t border-border-subtle">{i + 1}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.name}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.hq}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.employeeCode}</td>
                        <td className="px-2 py-1 border-t border-border-subtle">{r.designation}</td>
                        {[r.desktop, r.mobile, r.apps, r.edetailing, r.others, r.iosEdet].map((c, ci) => (
                          <Fragment key={ci}>
                            <td className="px-2 py-1 border-t border-border-subtle text-xs">{c.date || "-"}</td>
                            <td className="px-2 py-1 border-t border-border-subtle text-center">{c.count}</td>
                          </Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item 4 -- DCR > Reject/Approval View (company-wide) ────────────────
function DcrRejectApproveReportInner() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [rows, setRows] = useState<DcrRejectApproveRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewed, setViewed] = useState(false);

  async function handleGo() {
    setLoading(true); setViewed(true);
    try { setRows((await apiClient.dcrRejectApprove({ month: `${year}-${String(month).padStart(2, "0")}` })).data); }
    catch { setRows(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <MonthYear month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <button type="button" onClick={handleGo} disabled={loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "Go"}</button>
      </div>
      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <div className="text-center space-y-1 border-b border-border-subtle pb-4">
            <h2 className="font-headline-sm text-headline-sm text-text-primary underline">Reject/Approve View From {MONTH_NAMES[month - 1]}- {year}</h2>
          </div>
          <p className="text-xs text-status-warning">Round 36: a real Reason field and a real append-only audit log now back every NEW approve/reject action -- a rep whose date is rejected then later re-approved now shows both real events below, with the real reason the manager typed (when they typed one). Actions taken before this round have no reason on file (the field did not exist yet) and are shown as a single fallback event from the prior snapshot, exactly as before.</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
              <thead className="bg-brand-primary-subtle"><tr><th className="px-2 py-2">S.No</th><th className="px-2 py-2">Fieldforce Name</th><th className="px-2 py-2">HQ</th><th className="px-2 py-2">Designation</th><th className="px-2 py-2">Mode</th><th className="px-2 py-2">Reject/Approve DCR Date</th><th className="px-2 py-2">Work Type</th><th className="px-2 py-2">Reject/Approve Reason</th><th className="px-2 py-2">Reject/Approve Date</th></tr></thead>
              <tbody>
                {(rows || []).map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border-t border-border-subtle">{i + 1}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.fieldForceName}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.hq}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.designation}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.mode}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.actionDate ? new Date(r.actionDate).toLocaleDateString("en-IN") : "-"}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.workType || "-"}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.reason || "-"}</td>
                    <td className="px-2 py-1 border-t border-border-subtle">{r.actedAt ? new Date(r.actedAt).toLocaleDateString("en-IN") : "-"}</td>
                  </tr>
                ))}
                {(!rows || rows.length === 0) && <tr><td colSpan={9} className="px-3 py-4 text-center text-text-muted">No approve/reject actions this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Item 5 -- DCR > Time Status ─────────────────────────────────────────
const TIME_STATUS_METRICS: { key: keyof import("@/lib/api-client").DcrTimeStatusDay; label: string }[] = [
  { key: "workType", label: "Work Type" }, { key: "startTime", label: "Start time" }, { key: "closeTime", label: "Close time" },
  { key: "duration", label: "Duration" }, { key: "drCall", label: "Dr Call" }, { key: "chemistCall", label: "Chemst Call" }, { key: "filledDate", label: "Filled Date" }
];

function DcrTimeStatusReportInner() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [rows, setRows] = useState<DcrTimeStatusRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewed, setViewed] = useState(false);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true); setViewed(true);
    try { setRows((await apiClient.dcrTimeStatus({ employeeCode, month: `${year}-${String(month).padStart(2, "0")}` })).data); }
    catch { setRows(null); }
    finally { setLoading(false); }
  }

  const numDays = rows && rows.length > 0 ? rows[0].perDay.length : 0;

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <div className="flex flex-col gap-1">
          <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={employees} label="Filed Force Name" />
        </div>
        <MonthYear month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <div className="text-center space-y-1 border-b border-border-subtle pb-4">
            <h2 className="font-headline-sm text-headline-sm text-text-primary underline">Fieldforce Working Hours for - {MONTH_NAMES[month - 1]} {year}</h2>
            <p className="font-body-md text-body-md text-status-danger font-semibold">FieldForce Name : {employees.find((e) => e.employeeCode === employeeCode)?.name}</p>
          </div>
          {(!rows || rows.length === 0) ? (
            <p className="text-text-muted text-sm text-center py-8">No data for this field rep.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle">
                  <tr>
                    <th className="px-2 py-2 sticky left-0 bg-brand-primary-subtle">Employee id</th><th className="px-2 py-2">FieldForce Name</th><th className="px-2 py-2">Designation</th><th className="px-2 py-2">HQ</th><th className="px-2 py-2">Metric</th>
                    {Array.from({ length: numDays }, (_, i) => <th key={i} className="px-1 py-1 text-center">{i + 1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => TIME_STATUS_METRICS.map((m, mi) => (
                    <tr key={`${r.employeeCode}-${m.key}`}>
                      {mi === 0 && <td className="px-2 py-1 border-t border-border-subtle" rowSpan={7}>{r.employeeCode}</td>}
                      {mi === 0 && <td className="px-2 py-1 border-t border-border-subtle" rowSpan={7}>{r.name}</td>}
                      {mi === 0 && <td className="px-2 py-1 border-t border-border-subtle" rowSpan={7}>{r.designation}</td>}
                      {mi === 0 && <td className="px-2 py-1 border-t border-border-subtle" rowSpan={7}>{r.hq}</td>}
                      <td className="px-2 py-1 border-t border-border-subtle font-medium">{m.label}</td>
                      {r.perDay.map((d) => <td key={d.day} className="px-1 py-1 border-t border-border-subtle text-center text-xs">{String(d[m.key] ?? "-")}</td>)}
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item 6 -- DCR > Checkin-Checkout ────────────────────────────────────
const CHECK_MODES = ["Doctor", "Chemist", "Stockist", "Unlisted Doctor", "Hospital", "CIP"];

function DcrCheckinCheckoutReportInner() {
  const employees = useEmployees();
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(THIS_YEAR);
  const [checkMode, setCheckMode] = useState("");
  const [rows, setRows] = useState<DcrCheckinCheckoutRow[] | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewed, setViewed] = useState(false);

  async function handleView() {
    if (!employeeCode || !checkMode) return;
    setLoading(true); setViewed(true);
    try {
      const r = await apiClient.dcrCheckinCheckout({ employeeCode, month: `${year}-${String(month).padStart(2, "0")}`, mode: checkMode });
      setRows(r.data.rows);
      setUnsupported(Boolean(r.data.unsupported));
      setReason(r.data.reason || "");
    } catch { setRows(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <div className="flex flex-col gap-1">
          <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={employees} label="Field Force Name" />
        </div>
        <MonthYear month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">check Mode</span>
          <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={checkMode} onChange={(e) => { setCheckMode(e.target.value); setViewed(false); }}>
            <option value="">--Select--</option>
            {CHECK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button type="button" onClick={handleView} disabled={!employeeCode || !checkMode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
      </div>
      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-2">
          {rows && rows.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Check In</th><th className="px-3 py-2">Check Out</th></tr></thead>
                <tbody>{rows.map((r, i) => <tr key={i}><td className="px-3 py-2 border-t border-border-subtle">{r.date}</td><td className="px-3 py-2 border-t border-border-subtle">{r.name}</td><td className="px-3 py-2 border-t border-border-subtle">{r.checkIn}</td><td className="px-3 py-2 border-t border-border-subtle">{r.checkOut}</td></tr>)}</tbody>
              </table>
            </div>
          ) : (
            <>
              <p className="text-text-muted text-sm text-center py-8">No record found</p>
              {unsupported && <p className="text-xs text-status-warning">{reason}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const DcrNotApprovedReport = withExcel(DcrNotApprovedReportInner, "dcr-not-approved");
export const DcrNotSubmittedReport = withExcel(DcrNotSubmittedReportInner, "dcr-not-submitted");
export const DcrCountModewiseReport = withExcel(DcrCountModewiseReportInner, "dcr-count-modewise");
export const DcrRejectApproveReport = withExcel(DcrRejectApproveReportInner, "dcr-reject-approve");
export const DcrTimeStatusReport = withExcel(DcrTimeStatusReportInner, "dcr-time-status");
export const DcrCheckinCheckoutReport = withExcel(DcrCheckinCheckoutReportInner, "dcr-checkin-checkout");
