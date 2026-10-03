"use client";

import { useEffect, useMemo, useState } from "react";
import type { ZiviraTreeNode } from "@zivira/types";
import { apiClient, type Employee, type TerritoryView, type TerritoryStatusRow } from "@/lib/api-client";
import { AdminDcrView } from "./admin-dcr-view";
import { MasterScreen } from "./master-screen";

// Coordinator round -- "Activity Reports rebuild": this whole component used
// to be a 1000+ line fully-fabricated mock dashboard (hardcoded KPI cards
// like "4,892 / 5,200 DCRs Filed" that never changed no matter what real
// data existed). It has been rebuilt from scratch to mirror the real
// legacy sanpharma.info "Activity Reports" top-nav exactly: Territory »,
// Survey », TP », DCR », Customized Report, each with the legacy's own
// sub-tabs. Only Territory > View and Territory > Status are fully wired
// to real data this round (the coordinator's explicit task 2/3). Every
// other sub-tab is an honest, clearly-labeled placeholder, or -- where a
// sub-tab's name matches a screen that already exists and does real work
// elsewhere in this app -- wired directly to that real screen instead of
// building a duplicate. See the per-tab comments below for exactly which
// is which.

type MainTabKey = "territory" | "survey" | "tp" | "dcr" | "customized";

const MAIN_TABS: { key: MainTabKey; label: string }[] = [
  { key: "territory", label: "Territory" },
  { key: "survey", label: "Survey" },
  { key: "tp", label: "TP" },
  { key: "dcr", label: "DCR" },
  { key: "customized", label: "Customized Report" }
];

// Sub-tab ids are internal and need not be unique in their *display*
// label -- the legacy TP menu genuinely shows "View" twice (see the "tp"
// block below), which is preserved on purpose rather than "fixed".
const SUB_TABS: Record<MainTabKey, { id: string; label: string }[]> = {
  territory: [
    { id: "view", label: "View" },
    { id: "status", label: "Status" }
  ],
  survey: [
    { id: "question-creation", label: "Question Creation" },
    { id: "updation", label: "Updation" },
    { id: "view", label: "View" }
  ],
  tp: [
    { id: "consolidated-view", label: "Consolidated View" },
    { id: "view-1", label: "View" },
    { id: "view-2", label: "View" },
    { id: "datewise", label: "Datewise" }
  ],
  dcr: [
    { id: "view", label: "View" },
    { id: "status", label: "Status" },
    { id: "not-approved", label: "Not Approved" },
    { id: "not-submitted", label: "Not Submitted" },
    { id: "count-modewise", label: "Count-Modewise" },
    { id: "approve-reject", label: "Approve/Reject" },
    { id: "time-status", label: "Time Status" },
    { id: "checkin-checkout", label: "Checkin-Checkout" }
  ],
  customized: []
};

function Placeholder({ note }: { note: string }) {
  return (
    <div className="bg-surface-card rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-[32px] text-text-muted mb-2 block">construction</span>
      <p className="font-body-md text-body-md text-text-secondary max-w-xl mx-auto">
        Report not yet built for this round.
      </p>
      <p className="font-body-sm text-body-sm text-text-muted max-w-xl mx-auto mt-1.5">{note}</p>
    </div>
  );
}

function TerritoryViewReport() {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  const selected = employees.find((e) => e.employeeCode === employeeCode);
  // Legacy's "Base Level" row shows the selected rep's own reporting
  // manager, auto-derived -- not an independent user choice. Reproduced
  // the same way here from the real employee record rather than a second
  // free-standing dropdown with nothing real to back it.
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
            <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" disabled value="Team">
              <option value="Team">Team</option>
            </select>
            <select
              className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[280px]"
              value={employeeCode}
              onChange={(e) => { setEmployeeCode(e.target.value); setViewed(false); }}
            >
              {employees.map((emp) => (
                <option key={emp.employeeCode} value={emp.employeeCode}>
                  {emp.name} - {emp.designation} - {emp.territory}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Base Level</span>
          <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[200px]" disabled value={baseLevelManager?.name ?? ""}>
            <option value={baseLevelManager?.name ?? ""}>{baseLevelManager?.name ?? "—"}</option>
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

function TerritoryStatusReport() {
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
    const header = ["S.No", "Field Force", "HQ", "Total Drs", "No of Plans", "Allocated Drs", "Not Allocated Drs"];
    const lines = [header.join(",")];
    rows.forEach((r, idx) => {
      lines.push([idx + 1, `"${r.fieldForce}"`, `"${r.hq}"`, r.totalDrs, r.noOfPlans, r.allocatedDrs, r.notAllocatedDrs].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "territory-status.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Field Force Name</span>
          <select
            className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[260px]"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
          >
            <option value="ALL">All Field Reps</option>
            {employees.map((emp) => (
              <option key={emp.employeeCode} value={emp.employeeCode}>
                {emp.name} - {emp.designation} - {emp.territory}
              </option>
            ))}
          </select>
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

export function AdminActivityReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  void node;
  void path;
  const [mainTab, setMainTab] = useState<MainTabKey>("territory");
  const [subTab, setSubTab] = useState("view");

  function selectMainTab(key: MainTabKey) {
    setMainTab(key);
    setSubTab(SUB_TABS[key][0]?.id ?? "");
  }

  return (
    <div className="flex flex-col w-full space-y-5">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2 text-label-sm font-label-sm tracking-wider uppercase text-text-muted">
          <span className="">PLATFORM</span>
          <span className="material-symbols-outlined text-[13px] text-text-muted">chevron_right</span>
          <span className="text-primary font-bold">Activity Reports</span>
        </div>
        <h1 className="font-display-lg text-display-lg text-text-primary tracking-tight leading-none">Activity Reports</h1>
        <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
          Mirrors the legacy sanpharma.info Activity Reports menu structure: Territory, Survey, TP, DCR and Customized Report.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg w-fit flex-wrap">
        {MAIN_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectMainTab(t.key)}
            className={`px-4 py-2 rounded-md font-label-md text-label-md transition-colors ${mainTab === t.key ? "bg-surface-card text-primary shadow-sm font-semibold" : "text-text-secondary hover:text-text-primary"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {SUB_TABS[mainTab].length > 0 && (
        <div className="flex items-center gap-1 border-b border-border-subtle flex-wrap">
          {SUB_TABS[mainTab].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSubTab(st.id)}
              className={`px-3.5 py-2 font-label-md text-label-md border-b-2 transition-colors ${subTab === st.id ? "border-primary text-primary font-semibold" : "border-transparent text-text-secondary hover:text-text-primary"}`}
            >
              {st.label}
            </button>
          ))}
        </div>
      )}

      <div>
        {mainTab === "territory" && subTab === "view" && <TerritoryViewReport />}
        {mainTab === "territory" && subTab === "status" && <TerritoryStatusReport />}

        {mainTab === "survey" && (
          <Placeholder note="This is the legacy survey QUESTION-BANK authoring/view screen (not the existing Market Survey Entry/Report masters elsewhere in this app, which record actual survey responses rather than author the question set) -- no real question-bank data model exists yet in this codebase." />
        )}

        {mainTab === "tp" && subTab === "consolidated-view" && (
          <Placeholder note="A real consolidated Tour Plan view across all reps is not yet built; the existing Tour Plans dashboard elsewhere in admin is itself a mock, not a real data source to reuse." />
        )}
        {mainTab === "tp" && (subTab === "view-1" || subTab === "view-2") && (
          // The legacy menu genuinely shows "View" twice under TP. Without
          // the legacy report code itself to inspect, the most plausible
          // real-world distinction is one view being per-employee (like
          // Territory > View) and the other being per-manager/approval-chain
          // -- but this is a guess, not confirmed, so both are left as
          // placeholders rather than building two near-identical real
          // screens on a guessed distinction.
          <Placeholder note="Legacy shows two separate 'View' screens under TP (likely one employee-wise, one manager/approval-chain-wise) -- not yet built; the distinction could not be confirmed without the original report source." />
        )}
        {mainTab === "tp" && subTab === "datewise" && (
          <Placeholder note="A real date-wise Tour Plan report is not yet built this round." />
        )}

        {mainTab === "dcr" && subTab === "view" && <AdminDcrView />}
        {mainTab === "dcr" && subTab === "approve-reject" && (
          <div className="bg-surface-card rounded-xl shadow-sm p-5">
            <MasterScreen masterKey="approvalDcr" />
          </div>
        )}
        {mainTab === "dcr" && !["view", "approve-reject"].includes(subTab) && (
          <Placeholder note="Not yet built this round -- no existing real screen in this app currently covers this exact DCR breakdown." />
        )}

        {mainTab === "customized" && (
          <Placeholder note="Ad-hoc custom report building is not yet built this round." />
        )}
      </div>
    </div>
  );
}
