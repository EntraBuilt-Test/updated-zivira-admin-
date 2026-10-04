"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldForceSelect } from "@/components/field-force-select";
import { apiClient, type Employee, type TerritoryView, type TerritoryStatusRow } from "@/lib/api-client";
import { downloadXlsx, parseNumeric, type TableModel } from "@/lib/xlsx-export";
import { withExcel } from "@/components/with-excel";

// Coordinator round (Activity Reports visual rebuild) -- these two real
// panels used to live inline inside admin-activity-reports-dashboard.tsx
// (which had its own pill-tab navigation). That page has been rewritten to
// use the same shared AdminTabGrid tile-grid + /admin/workspace/[...path]
// drilldown architecture MIS Reports and Update/Delete already use, so
// these are now dispatched from AdminDrilldown by path instead. The real
// behavior (real employee/territory data, real endpoints, real Print/Excel
// export) is unchanged from last round -- only where they're mounted from
// changed.

const ALL_TEAMS = "All Teams";

function TerritoryViewReportInner() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [team, setTeam] = useState(ALL_TEAMS);
  const [employeeCode, setEmployeeCode] = useState("");
  const [result, setResult] = useState<TerritoryView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    apiClient.employees().then((r) => {
      setEmployees(r.data);
      if (r.data.length > 0) setEmployeeCode(r.data[0].employeeCode);
    }).catch(() => setEmployees([]));
  }, []);

  // Coordinator round (Item 1 fix) -- "Team" used to be a disabled
  // decorative dropdown with a single fixed "Team" option, and the
  // field-rep dropdown next to it always listed every employee regardless.
  // There is no separate real "team" grouping field in this codebase, so
  // "Team" is now a real filter over each employee's own real territory
  // (the closest real grouping concept that exists) -- picking one
  // genuinely narrows the field-rep dropdown to reps in that territory,
  // and resets the selection to the first match plus hides any stale
  // result until View is clicked again.
  const teamOptions = useMemo(
    () => [ALL_TEAMS, ...Array.from(new Set(employees.map((e) => e.territory).filter(Boolean))).sort()],
    [employees]
  );
  const visibleEmployees = useMemo(
    () => (team === ALL_TEAMS ? employees : employees.filter((e) => e.territory === team)),
    [employees, team]
  );

  function handleTeamChange(nextTeam: string) {
    setTeam(nextTeam);
    const pool = nextTeam === ALL_TEAMS ? employees : employees.filter((e) => e.territory === nextTeam);
    setEmployeeCode(pool[0]?.employeeCode ?? "");
    setViewed(false);
  }

  const selected = employees.find((e) => e.employeeCode === employeeCode);
  // Legacy's "Base Level" row shows the selected rep's own reporting
  // manager, auto-derived -- not an independent user choice. Reproduced
  // the same way here from the real employee record (recomputes live
  // whenever the selected rep changes) rather than a second free-standing
  // dropdown with nothing real to back it. Kept as a real, enabled select
  // (not grayed out) since it does reflect real, live-updating data.
  const baseLevelManager = useMemo(() => {
    if (!selected?.reportingManager) return null;
    return employees.find((e) => e.employeeCode === selected.reportingManager) || null;
  }, [selected, employees]);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true);
    setError("");
    setViewed(true);
    try {
      const r = await apiClient.territoryView(employeeCode);
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Territory View");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Filter By</span>
          <div className="flex items-center gap-2">
            <select
              className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
              value={team}
              onChange={(e) => handleTeamChange(e.target.value)}
            >
              {teamOptions.map((t) => (
                <option key={t} value={t}>{t === ALL_TEAMS ? "Team" : t}</option>
              ))}
            </select>
            <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={visibleEmployees} label="FieldForce Name" hideLabel />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Base Level</span>
          <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[200px]" value={baseLevelManager?.name ?? ""} onChange={() => {}}>
            <option value={baseLevelManager?.name ?? ""}>{baseLevelManager?.name ?? "No reporting manager on file"}</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleView}
          disabled={!employeeCode || loading}
          className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50"
        >
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {viewed && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5">
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && !loading && !result && <p className="text-text-muted text-sm">No data for this field rep.</p>}
          {!error && result && (
            <div className="space-y-6">
              <div className="text-center space-y-1 border-b border-border-subtle pb-4">
                <h2 className="font-headline-sm text-headline-sm text-text-primary underline">Listed Doctor wise - Territory View</h2>
              </div>
              <div className="flex items-center justify-between font-body-md text-body-md">
                <span className="text-status-danger font-semibold">Field Force Name: {result.fieldForceName} - {result.designation}</span>
                <span className="text-text-primary font-semibold">HQ: {result.hq}</span>
              </div>
              {result.territories.length === 0 && (
                <p className="text-text-muted text-sm">No doctors are currently mapped to this field rep.</p>
              )}
              {result.territories.map((group) => (
                <div key={group.territoryName} className="space-y-2">
                  <h3 className="font-label-md text-label-md text-status-danger font-bold">Territory Name: {group.territoryName}</h3>
                  <div className="overflow-x-auto rounded-lg border border-border-subtle">
                    <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                      <thead className="bg-brand-primary-subtle">
                        <tr>
                          <th className="px-3 py-2 w-14">S.No</th>
                          <th className="px-3 py-2">Listed DR Name</th>
                          <th className="px-3 py-2">Specialty</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Qual</th>
                          <th className="px-3 py-2">Class</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {group.rows.map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-1.5">{idx + 1}</td>
                            <td className="px-3 py-1.5">{row.name}</td>
                            <td className="px-3 py-1.5">{row.specialty}</td>
                            <td className="px-3 py-1.5">{row.category}</td>
                            <td className="px-3 py-1.5">{row.qual}</td>
                            <td className="px-3 py-1.5">{row.class}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TerritoryStatusReport() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeCode, setEmployeeCode] = useState("ALL");
  const [rows, setRows] = useState<TerritoryStatusRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewedFor, setViewedFor] = useState("");

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
  }, []);

  // Legacy behavior (confirmed from the reference screenshots): picking a
  // single Field Force Name in the dropdown ("admin - Admin -") still
  // returned every field rep's row, not a filtered single row. The real
  // endpoint always returns the full company-wide roster for that reason
  // -- this dropdown is kept for visual/UX parity with the legacy screen,
  // but does not narrow the result, matching the observed legacy screen.
  async function handleView() {
    setLoading(true);
    setError("");
    const label = employeeCode === "ALL" ? "All Field Reps" : (employees.find((e) => e.employeeCode === employeeCode)?.name ?? employeeCode);
    setViewedFor(label);
    try {
      const r = await apiClient.territoryStatus();
      setRows(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Territory Status");
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!rows) return;
    const hdr = ["S.No", "Field Force", "HQ", "Total Drs", "No of Plans", "Allocated Drs", "Not Allocated Drs"];
    const cell = (text: string, header = false) => ({ text, num: header ? undefined : parseNumeric(text), colSpan: 1, rowSpan: 1, bold: header, header });
    const model: TableModel = {
      tables: [{
        rows: [
          hdr.map((h) => cell(h, true)),
          ...rows.map((r, idx) => [String(idx + 1), r.fieldForce, r.hq, String(r.totalDrs), String(r.noOfPlans), String(r.allocatedDrs), String(r.notAllocatedDrs)].map((v) => cell(v)))
        ]
      }]
    };
    void downloadXlsx(model, "territory-status");
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <FieldForceSelect value={employeeCode} onChange={(code) => setEmployeeCode(code)} employees={employees} label="Field Force Name" extraOptions={[{ value: "ALL", label: "All Field Reps" }]} />
        </div>
        <button
          type="button"
          onClick={handleView}
          disabled={loading}
          className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50"
        >
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {viewedFor && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-text-primary underline">Territory Status for {viewedFor}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => window.print()} className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-sm text-label-sm transition-colors">Print</button>
              <button type="button" onClick={exportExcel} disabled={!rows || rows.length === 0} className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-sm text-label-sm transition-colors disabled:opacity-40">Excel</button>
              <button type="button" onClick={() => setViewedFor("")} className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-sm text-label-sm transition-colors">Close</button>
            </div>
          </div>
          {error && <p className="text-status-danger text-sm">{error}</p>}
          {!error && rows && (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle">
                  <tr>
                    <th className="px-3 py-2 w-14">S.No</th>
                    <th className="px-3 py-2">Field Force</th>
                    <th className="px-3 py-2">HQ</th>
                    <th className="px-3 py-2 text-center">Total Drs</th>
                    <th className="px-3 py-2 text-center">No of Plans</th>
                    <th className="px-3 py-2 text-center">Allocated Drs</th>
                    <th className="px-3 py-2 text-center">Not Allocated Drs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-1.5">{idx + 1}</td>
                      <td className="px-3 py-1.5">{r.fieldForce}</td>
                      <td className="px-3 py-1.5">{r.hq}</td>
                      <td className="px-3 py-1.5 text-center">{r.totalDrs}</td>
                      <td className="px-3 py-1.5 text-center">{r.noOfPlans}</td>
                      <td className="px-3 py-1.5 text-center">{r.allocatedDrs}</td>
                      <td className="px-3 py-1.5 text-center">{r.notAllocatedDrs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const TerritoryViewReport = withExcel(TerritoryViewReportInner, "territory-view");
