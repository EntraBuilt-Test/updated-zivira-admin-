"use client";

import { useEffect, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { ZoneDropdown } from "./zone-dropdown";
import { apiClient, type ActivitiesSummary, type DcrRecord, type EdetailingSummary } from "@/lib/api-client";

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

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full space-y-6">
{/* TOP BREADCRUMB & EXECUTIVE ACTION BAR */}
<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1">
<div className="flex flex-col space-y-1"><div className="flex items-center gap-2"><span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span><span className="text-text-muted text-body-sm font-body-sm">/</span><span className="font-label-md text-label-md text-primary font-semibold">Activities</span></div><div className="flex items-center gap-3 flex-wrap"><h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Activities</h1><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md"><span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>Live In-Flight (Sync 10s)</span></div><p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2"><span className="">Real-time field force telemetry, physician call audit, sample custody verification, and geofence verification across nationwide operating hubs.</span></p></div>
{/* ACTION CONTROLS & COMMAND FILTERS */}
<div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
<ZoneDropdown />
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
<span className="font-label-md text-label-md text-text-primary">Today: 10 Sep 2026</span>
<span className="material-symbols-outlined text-text-muted text-[16px] cursor-pointer">expand_more</span>
</div>
<div className="relative group">
<button className="flex items-center gap-2 bg-surface-card hover:bg-surface-subtle text-text-primary px-3.5 py-2 rounded-lg font-label-md text-label-md shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-secondary text-[18px]">download</span>
<span className="">Export DCR</span>
<span className="material-symbols-outlined text-[16px] text-text-muted">keyboard_arrow_down</span>
</button>
</div>
<button className="flex items-center gap-2 bg-primary hover:bg-brand-primary-hover active:scale-[0.98] text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md shadow-md transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span className="">Log Field Activity</span>
</button>
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
{/* Operational Navigation Sub-tabs */}
<div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-canvas rounded-lg">
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md bg-surface-card text-primary shadow-sm" type="button">
          Live Call Logs (1,420)
        </button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5" type="button">
<span className="">DCR Approvals</span>
<span className="w-5 h-5 rounded-full bg-status-danger text-on-primary text-[10px] flex items-center justify-center">28</span>
</button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors" type="button">
          Chemist Orders &amp; POB
        </button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors" type="button">
          Sample / Promo Dispatches
        </button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[16px]">location_on</span>
<span className="">Timeline Map</span>
</button>
</div>
{/* Quick Operations Actions */}
<div className="flex items-center gap-2">
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-success-bg hover:bg-status-success/20 text-status-success font-label-md text-label-md transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">done_all</span>
<span className="">Bulk Approve Selected</span>
</button>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-md text-label-md transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">help_outline</span>
<span className="">Request Explanation</span>
</button>
</div>
</div>
{/* Live Filters & Query Bar */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
<input className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Search by Doctor name, Medical Rep (MR), Specialization, or Clinic..." type="text"/>
</div>
<div className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-secondary">
<span className="text-text-muted uppercase">Status:</span>
<button className="px-2.5 py-1 rounded-full bg-brand-primary-subtle text-primary font-semibold" type="button">
          All (1,420)
        </button>
<button className="px-2.5 py-1 rounded-full bg-surface-canvas hover:bg-surface-subtle text-text-secondary" type="button">
          Verified GPS (1,280)
        </button>
<button className="px-2.5 py-1 rounded-full bg-status-danger-bg text-status-danger hover:opacity-90" type="button">
          Flagged Location (9)
        </button>
<button className="px-2.5 py-1 rounded-full bg-status-warning-bg text-status-warning hover:opacity-90" type="button">
          Pending Review (28)
        </button>
<button className="px-2.5 py-1 rounded-full bg-surface-canvas hover:bg-surface-subtle text-text-secondary" type="button">
          Approved (1,383)
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
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-card-padding-spacious py-3.5 bg-surface-card flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">badge</span>
<span className="font-headline-sm text-headline-sm text-text-primary">Recent Field Activity (Submitted DCRs)</span>
</div>
<div className="flex items-center gap-3 text-text-muted font-body-sm text-body-sm">
<span>{dcrsLoading ? "Loading..." : `Showing ${dcrs.length} most recent`}</span>
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
{!dcrsError && !dcrsLoading && dcrs.length === 0 && (
<tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted text-sm">No DCRs submitted yet.</td></tr>
)}
{dcrs.slice(0, 20).map((dcr) => {
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

{/* ITEM A: replaces the fake animated-map "Live Rep Route & Geofence" and
    fabricated "E-Detailing VA Session Metrics" panels. Real GPS data only
    exists per-DCR-visit (DcrModel.gpsLocation) -- there is no continuous
    location-ping stream anywhere in this codebase, so a genuinely "live
    route" can't be built; this honestly shows today's real GPS-stamped
    check-ins instead. E-Detailing metrics are real download counts from
    SlideDownloadModel only -- no duration/engagement field exists. */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
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
