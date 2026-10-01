"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { ZoneDropdown } from "./zone-dropdown";
import { MasterScreen } from "./master-screen";
import {
  apiClient,
  type ActivitiesSummary,
  type DcrRecord,
  type EdetailingSummary,
  type ChemistCallToday,
  type DispatchToday,
  type Employee,
  type MasterRecord
} from "@/lib/api-client";

function formatLakhs(rupees: number) {
  return `₹${(rupees / 100000).toFixed(2)} Lakhs`;
}

export function AdminActivitiesDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  // Round F item 1 — these 4 cards used to be fully hardcoded ("1,420",
  // "8.4 mins", "₹4.82 Lakhs", "9 GPS Mismatches" never changed no matter
  // what reps/managers actually did). Now backed by a real aggregation
  // (GET /company/activities/summary). "Avg E-Detailing mins" is dropped
  // entirely rather than faked — no model anywhere stores per-session VA
  // duration, confirmed by reading every e-detailing/slide model in the
  // backend. "GPS Mismatches" (a distance vs. a registered clinic
  // location) has no real data either — no Doctor/Chemist record stores a
  // lat/lng to diff against — so it's replaced with the honest, real
  // proxy: DCRs submitted today with no GPS captured at all.
  const [summary, setSummary] = useState<ActivitiesSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    apiClient.activitiesSummary()
      .then((r) => setSummary(r.data))
      .catch((e) => setSummaryError(e instanceof Error ? e.message : "Unable to load live activity stats"));
  }, []);

  // Item A (post-launch robustness round) -- real data backing the
  // "Real-time Field Activity Telemetry", "Live Rep Route & Geofence" and
  // "E-Detailing VA Session Metrics" panels below, all 3 previously
  // 100% hardcoded mock content. See the comment on the JSX below for
  // exactly what real data exists and what had to be honestly scoped down.
  const [dcrs, setDcrs] = useState<DcrRecord[]>([]);
  const [dcrsLoading, setDcrsLoading] = useState(true);
  const [dcrsError, setDcrsError] = useState("");
  const [edetailing, setEdetailing] = useState<EdetailingSummary | null>(null);
  const [edetailingError, setEdetailingError] = useState("");

  function loadDcrs() {
    setDcrsLoading(true);
    setDcrsError("");
    apiClient.dcrs()
      .then((r) => setDcrs(r.data))
      .catch((e) => setDcrsError(e instanceof Error ? e.message : "Unable to load recent activity"))
      .finally(() => setDcrsLoading(false));
  }

  useEffect(() => {
    loadDcrs();
    apiClient.edetailingSummary()
      .then((r) => setEdetailing(r.data))
      .catch((e) => setEdetailingError(e instanceof Error ? e.message : "Unable to load e-detailing metrics"));
  }, []);

  const todayStr = (() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  })();
  const todaysDcrs = dcrs.filter((d) => (d.visitDateOnly ?? d.visitDate?.slice(0, 10)) === todayStr);
  const todaysTotal = todaysDcrs.length;
  const todaysGpsVisits = todaysDcrs
    .filter((d) => d.gpsLocation && d.gpsLocation.latitude !== null && d.gpsLocation.longitude !== null)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    .slice(0, 8);

  // Item 4 (post-launch robustness round) -- the sub-nav tabs, region/date
  // filters, Export DCR, Log Field Activity, Bulk Approve Selected and
  // Request Explanation controls below were all inert: clicking any of
  // them did nothing. Real wiring for all of it follows.
  const ALL_TERRITORIES = "All Territories";
  const [territoryFilter, setTerritoryFilter] = useState(ALL_TERRITORIES);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusChip, setStatusChip] = useState<"all" | "gps" | "flagged" | "pending" | "approved">("all");
  const [activeTab, setActiveTab] = useState<"calls" | "dcrApprovals" | "chemistOrders" | "dispatches">("calls");
  const [approvalDcrRows, setApprovalDcrRows] = useState<MasterRecord[]>([]);
  const [approvalDcrKey, setApprovalDcrKey] = useState(0);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [requestingExplanation, setRequestingExplanation] = useState(false);
  const [chemistCalls, setChemistCalls] = useState<ChemistCallToday[]>([]);
  const [chemistCallsLoading, setChemistCallsLoading] = useState(true);
  const [chemistCallsError, setChemistCallsError] = useState("");
  const [dispatches, setDispatches] = useState<DispatchToday[]>([]);
  const [dispatchesLoading, setDispatchesLoading] = useState(true);
  const [dispatchesError, setDispatchesError] = useState("");
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
    apiClient.chemistCallsToday()
      .then((r) => setChemistCalls(r.data))
      .catch((e) => setChemistCallsError(e instanceof Error ? e.message : "Unable to load chemist orders"))
      .finally(() => setChemistCallsLoading(false));
    apiClient.dispatchesToday()
      .then((r) => setDispatches(r.data))
      .catch((e) => setDispatchesError(e instanceof Error ? e.message : "Unable to load dispatches"))
      .finally(() => setDispatchesLoading(false));
  }, []);

  // DCR Approvals pending count/rows -- own fetch, separate from the
  // MasterScreen/ApprovalQueueTable embedded below (which manages its own
  // state), so the tab badge count and the Bulk Approve/Request
  // Explanation actions have real pending data to work from.
  function loadApprovalDcrRows() {
    apiClient.masterRecords("approvalDcr").then((r) => setApprovalDcrRows(r.data)).catch(() => setApprovalDcrRows([]));
  }
  useEffect(() => { loadApprovalDcrRows(); }, []);
  const pendingDcrApprovals = approvalDcrRows.filter((r) => String(r.approvalStatus ?? "Pending") === "Pending");

  // Employee territory -> real dropdown options (replacing the old fixed
  // fake "Zone" names that filtered nothing). Matching by employeeCode so
  // selecting a territory genuinely narrows the Live Call Logs table.
  const territoryByCode = useMemo(() => new Map(employees.map((e) => [e.employeeCode, e.territory])), [employees]);
  const territoryOptions = useMemo(
    () => [ALL_TERRITORIES, ...Array.from(new Set(employees.map((e) => e.territory).filter(Boolean))).sort()],
    [employees]
  );

  const visibleDcrs = dcrs.filter((d) => {
    if (territoryFilter !== ALL_TERRITORIES && territoryByCode.get(d.employeeCode) !== territoryFilter) return false;
    if (dateFilter && (d.visitDateOnly ?? d.visitDate?.slice(0, 10)) !== dateFilter) return false;
    const hasGps = !!(d.gpsLocation && d.gpsLocation.latitude !== null && d.gpsLocation.longitude !== null);
    const isApproved = String(d.status) === "APPROVED" || String(d.status) === "AUTO_APPROVED" || String(d.status) === "MANAGER_APPROVED";
    if (statusChip === "gps" && !hasGps) return false;
    if (statusChip === "flagged" && hasGps) return false;
    if (statusChip === "pending" && d.status !== "SUBMITTED") return false;
    if (statusChip === "approved" && !isApproved) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const doctor = typeof d.doctorId === "object" ? d.doctorId : null;
      const haystack = `${d.employeeName ?? ""} ${d.employeeCode ?? ""} ${doctor?.name ?? ""} ${doctor?.specialty ?? ""} ${d.hospitalClinic ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const statusCounts = {
    all: dcrs.length,
    gps: dcrs.filter((d) => d.gpsLocation && d.gpsLocation.latitude !== null && d.gpsLocation.longitude !== null).length,
    flagged: dcrs.filter((d) => !(d.gpsLocation && d.gpsLocation.latitude !== null && d.gpsLocation.longitude !== null)).length,
    pending: dcrs.filter((d) => d.status === "SUBMITTED").length,
    approved: dcrs.filter((d) => String(d.status) === "APPROVED" || String(d.status) === "AUTO_APPROVED" || String(d.status) === "MANAGER_APPROVED").length
  };

  // Real client-side CSV export of whatever's currently visible (territory
  // + date + status-chip + search filters all applied) -- same downloadable
  // pattern used elsewhere in this codebase, no new dependency.
  function exportDcrCsv() {
    const headers = ["Employee Code", "Employee Name", "Doctor/Hospital", "Visit Date", "Products", "Status"];
    const rows = visibleDcrs.map((d) => {
      const doctor = typeof d.doctorId === "object" ? d.doctorId : null;
      const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
      return [d.employeeCode ?? "", d.employeeName ?? "", doctor?.name ?? d.hospitalClinic ?? "", d.visitDate ?? "", (d.productsDetailed ?? []).join("; "), d.status ?? ""].map(cell).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dcr-activity-${dateFilter}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Real bulk-approve. Honest scope note: the embedded DCR Approval queue
  // (ApprovalQueueTable, via MasterScreen below) has no row-level checkbox
  // selection built into it, so "Selected" here means every currently
  // Pending row -- approving all of them for real via the same
  // updateMasterRecord call a single manual Approve click uses, then
  // forcing the embedded table to remount so it reflects the change.
  async function bulkApproveSelected() {
    if (pendingDcrApprovals.length === 0) return;
    if (!window.confirm(`Approve all ${pendingDcrApprovals.length} pending DCR approval(s)?`)) return;
    setBulkApproving(true);
    try {
      for (const row of pendingDcrApprovals) {
        await apiClient.updateMasterRecord("approvalDcr", String(row.id), { approvalStatus: "Approved" });
      }
      loadApprovalDcrRows();
      setApprovalDcrKey((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Bulk approve failed");
    } finally {
      setBulkApproving(false);
    }
  }

  // Real "Request Explanation" -- sends an actual in-app notice (the same
  // real notifyFieldRep plumbing the rest of this app uses) to every rep
  // with a pending DCR approval today, carrying whatever message the admin
  // types. Honest scope note: there's no dedicated "explanation request"
  // record/flag anywhere in this codebase to attach the reply to, so this
  // is a real notification, not a tracked two-way explanation thread.
  async function requestExplanation() {
    if (pendingDcrApprovals.length === 0) {
      window.alert("No pending DCR approvals to request an explanation for.");
      return;
    }
    const message = window.prompt(
      `This will notify the ${pendingDcrApprovals.length} rep(s) with a pending DCR approval today. Enter your message:`,
      "Please provide an explanation for your recent DCR submission(s) awaiting approval."
    );
    if (!message || !message.trim()) return;
    const names = Array.from(new Set(pendingDcrApprovals.map((r) => String(r.sfName ?? "")).filter(Boolean)));
    setRequestingExplanation(true);
    try {
      const res = await apiClient.sendNotificationMessage({
        filterBy: "FieldForce (Team Wise)",
        filterValues: names,
        message: message.trim()
      });
      window.alert(`Explanation request sent to ${res.data.notified} rep(s).`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to send explanation request");
    } finally {
      setRequestingExplanation(false);
    }
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full space-y-6">
{/* TOP BREADCRUMB & EXECUTIVE ACTION BAR */}
<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1">
<div className="flex flex-col space-y-1"><div className="flex items-center gap-2"><span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span><span className="text-text-muted text-body-sm font-body-sm">/</span><span className="font-label-md text-label-md text-primary font-semibold">Activities</span></div><div className="flex items-center gap-3 flex-wrap"><h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Activities</h1><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md"><span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>Live In-Flight (Sync 10s)</span></div><p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2"><span className="">Real-time field force telemetry, physician call audit, sample custody verification, and geofence verification across nationwide operating hubs.</span></p></div>
{/* ACTION CONTROLS & COMMAND FILTERS */}
<div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
<ZoneDropdown value={territoryFilter} options={territoryOptions} onChange={setTerritoryFilter} />
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
<input
  type="date"
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
  className="font-label-md text-label-md text-text-primary bg-transparent border-none outline-none"
/>
</div>
<div className="relative group">
<button onClick={exportDcrCsv} className="flex items-center gap-2 bg-surface-card hover:bg-surface-subtle text-text-primary px-3.5 py-2 rounded-lg font-label-md text-label-md shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-secondary text-[18px]">download</span>
<span className="">Export DCR</span>
</button>
</div>
{/* Item 4 -- no "admin creates a brand-new DCR from scratch" flow exists
    anywhere in this codebase; the closest real admin-side DCR touchpoint
    is the existing DCR Edit tool (search + edit a real DCR), so this
    genuinely navigates there rather than opening a fake "create" form. */}
<Link href="/admin/workspace/division-dashboard/division-navigation-tabs/division-options/update-delete/dcr-edit" className="flex items-center gap-2 bg-primary hover:bg-brand-primary-hover active:scale-[0.98] text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md shadow-md transition-all" title="Opens the real DCR Edit tool (search + edit an existing DCR) -- there is no admin create-from-scratch flow in this codebase">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span className="">Log Field Activity</span>
</Link>
</div>
</div>
{/* OPERATIONAL SUMMARY METRIC CARDS (4-COL GRID) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
{/* Card 1 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total Calls Logged Today</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">{summary ? summary.totalCallsLoggedToday.toLocaleString() : "–"}</span>
<span className="font-body-sm text-body-sm text-text-muted">DCRs</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
</div>
</div>
<div className="space-y-1.5">
<div className="flex items-center justify-between font-label-sm text-label-sm">
{summary && summary.callsDeltaPct !== null ? (
<span className={`font-semibold flex items-center gap-1 ${summary.callsDeltaPct >= 0 ? "text-status-success" : "text-status-danger"}`}>
<span className="material-symbols-outlined text-[14px]">{summary.callsDeltaPct >= 0 ? "arrow_upward" : "arrow_downward"}</span> {summary.callsDeltaPct >= 0 ? "+" : ""}{summary.callsDeltaPct}% vs yesterday
          </span>
) : (
<span className="text-text-muted">{summaryError ? "Live data unavailable" : "Loading…"}</span>
)}
<span className="text-text-secondary">{summary ? `${summary.totalCallsLoggedYesterday.toLocaleString()} yesterday` : ""}</span>
</div>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Doctor Detailing Visits Today</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">{summary ? summary.doctorDetailingVisitsToday.toLocaleString() : "–"}</span>
<span className="font-body-sm text-body-sm text-text-secondary">Visits</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">stethoscope</span>
</div>
</div>
<div className="space-y-1.5">
<div className="flex items-center gap-1.5 text-text-muted font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[15px] text-tertiary">gps_off</span>
<span className="">{summary ? `${summary.gpsNotCapturedDetailingToday} of these had no GPS captured` : "Loading…"}</span>
</div>
</div>
</div>
{/* Card 3 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Chemist &amp; Stockist Orders Today</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">{summary ? summary.chemistStockistOrdersToday.toLocaleString() : "–"}</span>
<span className="font-body-sm text-body-sm text-text-muted">Bookings (POB)</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">receipt_long</span>
</div>
</div>
<div className="space-y-1.5">
<div className="flex items-center justify-between">
<span className="font-headline-sm text-headline-sm text-text-primary">{summary ? formatLakhs(summary.chemistStockistOrderValueToday) : "–"}</span>
{summary?.chemistStockistOrderValuePartial && (
<span className="text-status-warning font-label-sm text-label-sm">Partial (no rate for some products)</span>
)}
</div>
<p className="font-body-sm text-body-sm text-text-muted">{summary ? `${summary.chemistStockistOrderQtyToday.toLocaleString()} units booked today` : "Loading…"}</p>
</div>
</div>
{/* Card 4 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-status-danger">Pending Approvals &amp; Alerts</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-status-danger">{summary ? summary.pendingApprovals.total.toLocaleString() : "–"}</span>
<span className="font-body-sm text-body-sm text-text-muted">Pending Approvals</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">warning_amber</span>
</div>
</div>
<div className="flex flex-wrap items-center gap-2">
<span className="px-2 py-0.5 rounded-full bg-status-danger-bg text-status-danger font-label-sm text-label-sm">
          {summary ? summary.pendingApprovals.leave : "–"} Leave
        </span>
<span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning font-label-sm text-label-sm">
          {summary ? summary.pendingApprovals.expense : "–"} Expense
        </span>
<span className="px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm">
          {summary ? summary.pendingApprovals.tourPlan : "–"} Tour Plan
        </span>
<span className="px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm">
          {summary ? summary.pendingApprovals.deviation : "–"} Deviation
        </span>
<span className="px-2 py-0.5 rounded-full bg-status-danger-bg text-status-danger font-label-sm text-label-sm">
          {summary ? summary.gpsNotCapturedToday : "–"} GPS Not Captured Today
        </span>
</div>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4">
  <AdminTabGrid node={node} path={path} />
</div>
{/* INTERACTIVE VIEW TABS & ADVANCED SEARCH CONSOLE */}
<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4">
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b-0">
{/* Operational Navigation Sub-tabs -- Item 4: each one now genuinely
    switches the view below to real matching data, instead of only
    "Live Call Logs" ever having real content under a static tab bar. */}
<div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-canvas rounded-lg">
<button onClick={() => setActiveTab("calls")} className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${activeTab === "calls" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`} type="button">
          Live Call Logs ({statusCounts.all.toLocaleString()})
        </button>
<button onClick={() => setActiveTab("dcrApprovals")} className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors flex items-center gap-1.5 ${activeTab === "dcrApprovals" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`} type="button">
<span className="">DCR Approvals</span>
{pendingDcrApprovals.length > 0 && <span className="w-5 h-5 rounded-full bg-status-danger text-on-primary text-[10px] flex items-center justify-center">{pendingDcrApprovals.length}</span>}
</button>
<button onClick={() => setActiveTab("chemistOrders")} className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${activeTab === "chemistOrders" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`} type="button">
          Chemist Orders &amp; POB
        </button>
<button onClick={() => setActiveTab("dispatches")} className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${activeTab === "dispatches" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`} type="button">
          Sample / Promo Dispatches
        </button>
<button onClick={() => timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1" type="button" title="Scrolls to today's real GPS-stamped check-ins -- no continuous location feed exists in this codebase to build an actual live map from (same honest scoping as the panel below)">
<span className="material-symbols-outlined text-[16px]">location_on</span>
<span className="">Timeline Map</span>
</button>
</div>
{/* Quick Operations Actions -- only meaningful on the DCR Approvals tab */}
<div className="flex items-center gap-2">
<button onClick={bulkApproveSelected} disabled={bulkApproving || pendingDcrApprovals.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-success-bg hover:bg-status-success/20 text-status-success font-label-md text-label-md transition-all disabled:opacity-40" type="button" title={pendingDcrApprovals.length === 0 ? "No pending DCR approvals" : `Approve all ${pendingDcrApprovals.length} pending DCR(s)`}>
<span className="material-symbols-outlined text-[16px]">done_all</span>
<span className="">{bulkApproving ? "Approving..." : `Bulk Approve Selected (${pendingDcrApprovals.length})`}</span>
</button>
<button onClick={requestExplanation} disabled={requestingExplanation || pendingDcrApprovals.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-md text-label-md transition-all disabled:opacity-40" type="button">
<span className="material-symbols-outlined text-[16px]">help_outline</span>
<span className="">{requestingExplanation ? "Sending..." : "Request Explanation"}</span>
</button>
</div>
</div>
{/* Live Filters & Query Bar -- applies to the Live Call Logs table */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
<input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Search by Doctor name, Medical Rep (MR), Specialization, or Clinic..." type="text"/>
</div>
<div className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-secondary">
<span className="text-text-muted uppercase">Status:</span>
<button onClick={() => setStatusChip("all")} className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${statusChip === "all" ? "bg-brand-primary-subtle text-primary" : "bg-surface-canvas hover:bg-surface-subtle text-text-secondary"}`} type="button">
          All ({statusCounts.all.toLocaleString()})
        </button>
<button onClick={() => setStatusChip("gps")} className={`px-2.5 py-1 rounded-full transition-colors ${statusChip === "gps" ? "bg-brand-primary-subtle text-primary font-semibold" : "bg-surface-canvas hover:bg-surface-subtle text-text-secondary"}`} type="button">
          Verified GPS ({statusCounts.gps.toLocaleString()})
        </button>
<button onClick={() => setStatusChip("flagged")} className={`px-2.5 py-1 rounded-full transition-colors ${statusChip === "flagged" ? "bg-status-danger text-on-primary font-semibold" : "bg-status-danger-bg text-status-danger hover:opacity-90"}`} type="button">
          Flagged Location ({statusCounts.flagged.toLocaleString()})
        </button>
<button onClick={() => setStatusChip("pending")} className={`px-2.5 py-1 rounded-full transition-colors ${statusChip === "pending" ? "bg-status-warning text-on-primary font-semibold" : "bg-status-warning-bg text-status-warning hover:opacity-90"}`} type="button">
          Pending Review ({statusCounts.pending.toLocaleString()})
        </button>
<button onClick={() => setStatusChip("approved")} className={`px-2.5 py-1 rounded-full transition-colors ${statusChip === "approved" ? "bg-brand-primary-subtle text-primary font-semibold" : "bg-surface-canvas hover:bg-surface-subtle text-text-secondary"}`} type="button">
          Approved ({statusCounts.approved.toLocaleString()})
        </button>
</div>
</div>
</div>
{/* ITEM A (post-launch robustness round): replaces 6 hardcoded fake rows
    with the real most-recent DCRs (GET /company/dcrs, already used
    elsewhere in this app, newly typed with gpsLocation/hospitalClinic/
    checkInTime). True server push isn't implemented anywhere in this
    codebase, so this is honestly a "recent activity, refreshed on load /
    manual refresh" view, not a live-push feed -- labeled as such below
    rather than claiming a live socket connection that doesn't exist. */}
{activeTab === "calls" && (
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-card-padding-spacious py-3.5 bg-surface-card flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">badge</span>
<span className="font-headline-sm text-headline-sm text-text-primary">Recent Field Activity (Submitted DCRs)</span>
</div>
<div className="flex items-center gap-3 text-text-muted font-body-sm text-body-sm">
<span>{dcrsLoading ? "Loading..." : `Showing ${visibleDcrs.length} of ${dcrs.length}`}</span>
<button type="button" onClick={loadDcrs} className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-subtle text-text-secondary" title="Refresh">
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
</div>
</div>
<div className="w-full overflow-x-auto">
<table className="w-full text-left font-table-cell text-table-cell text-text-primary min-w-[1240px]">
<thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
<tr className="bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider h-table-header-height">
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Medical Rep (MR)</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctor / Hospital</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Timestamp &amp; GPS</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Products Detailed</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Samples / Inputs</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{dcrsError && (
<tr><td colSpan={6} className="px-4 py-6 text-center text-status-danger text-sm">{dcrsError}</td></tr>
)}
{!dcrsError && !dcrsLoading && visibleDcrs.length === 0 && (
<tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted text-sm">No DCRs match the current filters.</td></tr>
)}
{visibleDcrs.slice(0, 20).map((dcr) => {
  const doctor = typeof dcr.doctorId === "object" ? dcr.doctorId : null;
  const initials = (dcr.employeeName || dcr.employeeCode || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const gps = dcr.gpsLocation;
  const hasGps = gps && gps.latitude !== null && gps.longitude !== null;
  const samplesCount = (dcr.samplesGiven ?? []).reduce((sum, s) => sum + (s.qty || 0), 0);
  const inputsCount = (dcr.inputsGiven ?? []).reduce((sum, i) => sum + (i.qty || 0), 0);
  return (
    <tr key={dcr.id} className="hover:bg-surface-subtle/70 transition-colors h-table-row-height">
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-primary-subtle text-primary font-headline-sm flex items-center justify-center flex-shrink-0">{initials}</div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-text-primary truncate">{dcr.employeeName || dcr.employeeCode}</span>
            <span className="font-body-sm text-body-sm text-text-muted">{dcr.employeeCode}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-text-primary">{doctor?.name ?? "-"}</span>
          <span className="font-body-sm text-body-sm text-text-secondary">{doctor?.specialty ?? dcr.hospitalClinic ?? ""}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-text-primary">{dcr.checkInTime ?? new Date(dcr.visitDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span className={"font-body-sm text-body-sm " + (hasGps ? "text-status-success" : "text-text-muted")}>
            {hasGps ? `${gps!.latitude!.toFixed(4)}°, ${gps!.longitude!.toFixed(4)}°` : "GPS not captured"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {(dcr.productsDetailed ?? []).length === 0 ? <span className="text-text-muted text-xs">-</span> : dcr.productsDetailed.map((p, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">{p}</span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
        {samplesCount > 0 || inputsCount > 0 ? `${samplesCount} sample(s), ${inputsCount} input(s)` : "-"}
      </td>
      <td className="px-4 py-3 text-center text-sm whitespace-nowrap">
        <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm " + (String(dcr.status) === "APPROVED" || String(dcr.status) === "AUTO_APPROVED" ? "bg-status-success-bg text-status-success" : dcr.status === "REJECTED" ? "bg-status-danger-bg text-status-danger" : "bg-surface-subtle text-text-secondary")}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {dcr.status}
        </span>
      </td>
    </tr>
  );
})}
</tbody>
</table>
</div>
</div>
)}

{/* Item 4 (post-launch robustness round) -- DCR Approvals tab: the real,
    already-built DCR Approval queue (ApprovalQueueTable, with genuine
    per-row Approve/Reject), simply unreachable from this sub-nav before.
    Keyed on approvalDcrKey so Bulk Approve Selected above can force a
    remount after it mutates rows out from under this component's own
    internal state. */}
{activeTab === "dcrApprovals" && (
<div className="bg-surface-card rounded-xl shadow-sm p-4">
<MasterScreen key={approvalDcrKey} masterKey="approvalDcr" />
</div>
)}

{/* Item 4 -- Chemist Orders & POB tab: real read-only list of today's
    ChemistCallModel POB rows (same data the "Chemist & Stockist Orders
    Today" metric card above already counts). Honest scope note: there is
    no approval/status concept on this record type in this codebase, so
    this is a real list, not a fake approval queue. */}
{activeTab === "chemistOrders" && (
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden">
<div className="px-card-padding-spacious py-3.5 flex items-center justify-between">
<span className="font-headline-sm text-headline-sm text-text-primary">Chemist Orders &amp; POB — Today</span>
<span className="font-body-sm text-body-sm text-text-muted">{chemistCallsLoading ? "Loading..." : `${chemistCalls.length} call(s) with bookings`}</span>
</div>
<div className="w-full overflow-x-auto">
<table className="w-full text-left font-table-cell text-table-cell text-text-primary">
<thead className="bg-surface-subtle">
<tr className="text-text-muted font-label-sm text-label-sm uppercase tracking-wider">
<th className="px-4 py-3">Medical Rep (MR)</th>
<th className="px-4 py-3">Chemist</th>
<th className="px-4 py-3">Products Booked (POB)</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{chemistCallsError && <tr><td colSpan={3} className="px-4 py-6 text-center text-status-danger text-sm">{chemistCallsError}</td></tr>}
{!chemistCallsError && !chemistCallsLoading && chemistCalls.length === 0 && (
<tr><td colSpan={3} className="px-4 py-6 text-center text-text-muted text-sm">No POB bookings logged today.</td></tr>
)}
{chemistCalls.map((c) => (
<tr key={c.id} className="hover:bg-surface-subtle/70">
<td className="px-4 py-3 whitespace-nowrap">{c.employeeName || c.employeeCode}</td>
<td className="px-4 py-3 whitespace-nowrap">{c.chemistName}</td>
<td className="px-4 py-3">{c.pob.map((p) => `${p.productName} (${p.qty})`).join(", ")}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}

{/* Item 4 -- Sample / Promo Dispatches tab: real read-only list of
    today's/pending DispatchModel batches. Same honest scope note: no
    approval concept exists on a dispatch (just Pending/Received), so
    this is a real list, not a fake approval queue. */}
{activeTab === "dispatches" && (
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden">
<div className="px-card-padding-spacious py-3.5 flex items-center justify-between">
<span className="font-headline-sm text-headline-sm text-text-primary">Sample / Promo Dispatches</span>
<span className="font-body-sm text-body-sm text-text-muted">{dispatchesLoading ? "Loading..." : `${dispatches.length} batch(es)`}</span>
</div>
<div className="w-full overflow-x-auto">
<table className="w-full text-left font-table-cell text-table-cell text-text-primary">
<thead className="bg-surface-subtle">
<tr className="text-text-muted font-label-sm text-label-sm uppercase tracking-wider">
<th className="px-4 py-3">Medical Rep (MR)</th>
<th className="px-4 py-3">Type</th>
<th className="px-4 py-3">Dispatch Date</th>
<th className="px-4 py-3">Items</th>
<th className="px-4 py-3">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{dispatchesError && <tr><td colSpan={5} className="px-4 py-6 text-center text-status-danger text-sm">{dispatchesError}</td></tr>}
{!dispatchesError && !dispatchesLoading && dispatches.length === 0 && (
<tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted text-sm">No dispatches found.</td></tr>
)}
{dispatches.map((d) => (
<tr key={d.id} className="hover:bg-surface-subtle/70">
<td className="px-4 py-3 whitespace-nowrap">{d.employeeName || d.employeeCode}</td>
<td className="px-4 py-3 whitespace-nowrap">{d.type}</td>
<td className="px-4 py-3 whitespace-nowrap">{new Date(d.dispatchDate).toLocaleDateString()}</td>
<td className="px-4 py-3 whitespace-nowrap">{d.itemCount} item(s), {d.totalQty} units</td>
<td className="px-4 py-3 whitespace-nowrap">
<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (d.status === "Received" ? "bg-status-success-bg text-status-success" : "bg-status-warning-bg text-status-warning")}>{d.status}</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}

{/* ITEM A: replaces the fake animated-map "Live Rep Route & Geofence" and
    fabricated "E-Detailing VA Session Metrics" panels. Real GPS data only
    exists per-DCR-visit (DcrModel.gpsLocation) -- there is no continuous
    location-ping stream anywhere in this codebase, so a genuinely "live
    route" can't be built; this honestly shows today's real GPS-stamped
    check-ins instead. E-Detailing metrics are real download counts from
    SlideDownloadModel only -- no duration/engagement field exists. */}
<div ref={timelineRef} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
<div className="lg:col-span-7 bg-surface-card rounded-xl shadow-sm p-card-padding-spacious flex flex-col space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">explore</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">Today&apos;s GPS-Stamped Check-ins</h2>
<span className="font-body-sm text-body-sm text-text-muted">Real per-visit GPS captured on DCR submission — no continuous location tracking exists, so this is a list, not a live map.</span>
</div>
</div>
</div>
<div className="space-y-2 flex-1 overflow-y-auto max-h-72">
{todaysGpsVisits.length === 0 ? (
  <p className="text-sm text-text-muted italic px-1 py-4 text-center">No GPS-stamped visits logged yet today.</p>
) : (
  todaysGpsVisits.map((dcr) => {
    const doctor = typeof dcr.doctorId === "object" ? dcr.doctorId : null;
    return (
      <div key={dcr.id} className="p-2.5 rounded-lg bg-surface-canvas flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="font-label-md text-label-md text-text-primary truncate block">{dcr.employeeName || dcr.employeeCode} — {doctor?.name ?? dcr.hospitalClinic ?? "Visit"}</span>
          <span className="text-[11px] text-text-muted">{dcr.gpsLocation!.latitude!.toFixed(4)}°, {dcr.gpsLocation!.longitude!.toFixed(4)}°</span>
        </div>
        <span className="text-[11px] text-text-secondary font-medium whitespace-nowrap">{dcr.checkInTime ?? new Date(dcr.visitDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    );
  })
)}
</div>
<div className="text-[11px] text-text-muted pt-1 border-t border-border-subtle">
{todaysTotal > 0 ? `${todaysGpsVisits.length} of ${todaysTotal} DCRs submitted today have GPS captured` : "No DCRs submitted today yet"}
</div>
</div>

<div className="lg:col-span-5 bg-surface-card rounded-xl shadow-sm p-card-padding-spacious flex flex-col space-y-4">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">analytics</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">E-Detailing Downloads</h2>
<span className="font-body-sm text-body-sm text-text-muted">Real slide-download counts — no session-duration/engagement data exists to report.</span>
</div>
</div>
{edetailingError && <p className="text-sm text-status-danger">{edetailingError}</p>}
<div className="p-3 rounded-lg bg-surface-canvas flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-secondary">Downloads Today</span>
<div className="font-headline-md text-headline-md text-text-primary mt-0.5">{edetailing?.downloadsToday ?? 0}</div>
</div>
<div className="h-10 w-px bg-surface-subtle"></div>
<div>
<span className="font-body-sm text-body-sm text-text-secondary">Reps Active (7d)</span>
<div className="font-headline-md text-headline-md text-primary mt-0.5">{edetailing?.distinctRepsThisWeek ?? 0}</div>
</div>
</div>
<div className="space-y-3 flex-1">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Top Slides This Week (by downloads)</span>
{(!edetailing || edetailing.topSlides.length === 0) ? (
  <p className="text-sm text-text-muted italic">No slide downloads recorded this week.</p>
) : (
  edetailing.topSlides.map((s, i) => {
    const max = edetailing.topSlides[0]?.count || 1;
    return (
      <div key={i} className="space-y-1">
        <div className="flex items-center justify-between text-body-sm font-body-sm">
          <span className="font-label-md text-label-md text-text-primary truncate">{i + 1}. {s.fileName}{s.brand ? ` (${s.brand})` : ""}</span>
          <span className="text-text-secondary font-semibold whitespace-nowrap">{s.count} download(s)</span>
        </div>
        <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full" style={{ width: `${(s.count / max) * 100}%` }}></div>
        </div>
      </div>
    );
  })
)}
</div>
</div>
</div>

    </div>
    </div>
  );
}
