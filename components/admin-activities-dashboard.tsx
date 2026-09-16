"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Item fix — this page used to be a fully static server component: none of
// its buttons/selects (zone filter, Export DCR, Log Field Activity, the 5
// sub-tabs, Bulk Approve, Request Explanation, search, the 5 status chips,
// row checkboxes, per-row Inspect/Listen/Approve/Audit Flag/VA Feedback/More
// actions, rows-per-page, pagination, and Download VA Analytics) did
// anything when clicked. The demo KPI numbers on the 4 summary cards are
// left as-is (no backend activities collection exists yet), but the field
// activity table itself is now real local state: search, zone, sub-tabs and
// status chips actually filter it, checkboxes + Bulk Approve really change
// row status, Export DCR / Download VA Analytics download real CSVs of
// what's on screen, Log Field Activity appends a real (session-only) row,
// and pagination reflects the real filtered count.

type Zone = "North Territory - Delhi HQ" | "West Zone - Mumbai & Pune" | "South Sector - Bangalore" | "East Region - Kolkata Hub";
type ActivityStatus = "Approved" | "Under Review" | "GPS Alert Flagged" | "Draft / In-Transit";
type ActivityCategory = "call" | "chemist" | "dispatch";
type SecondaryAction = "listen" | "approve" | "auditFlag" | "vaFeedback" | "more";

type ActivityRow = {
  id: string;
  avatarInitials: string;
  avatarClass: string;
  repName: string;
  repMeta: string;
  contactName: string;
  contactMeta: string;
  activityTypeLabel: string;
  activityTypeIcon: string;
  activityTypeClass: string;
  timeLabel: string;
  geoText: string;
  geoVariant: "success" | "danger";
  products: string[];
  promo: string;
  status: ActivityStatus;
  zone: Zone;
  category: ActivityCategory;
  rowBgClass: string;
  hoverBgClass: string;
  secondaryAction: SecondaryAction;
};

const initialRows: ActivityRow[] = [
  {
    id: "a1", avatarInitials: "RS", avatarClass: "bg-brand-primary-subtle text-primary",
    repName: "Rahul Sharma", repMeta: "MR-4089 · Mumbai South",
    contactName: "Dr. Ananya Iyer, MD", contactMeta: "Cardiologist · Lilavati Hospital",
    activityTypeLabel: "Doctor Detail", activityTypeIcon: "person_check", activityTypeClass: "bg-brand-primary-subtle text-primary",
    timeLabel: "10:14 AM", geoText: "18.5204° N, 73.8567° E (12m delta)", geoVariant: "success",
    products: ["ZiviCal D3 (5m)", "CardioCare 20 (3m)"], promo: "2x ZiviCal D3 Samples, 1x Desk Pen",
    status: "Approved", zone: "West Zone - Mumbai & Pune", category: "call",
    rowBgClass: "bg-surface-card", hoverBgClass: "hover:bg-surface-subtle/70", secondaryAction: "listen"
  },
  {
    id: "a2", avatarInitials: "PM", avatarClass: "bg-surface-container-high text-on-surface-variant",
    repName: "Priya Mehta", repMeta: "MR-3122 · Pune Camp",
    contactName: "Apollo Medicos #442", contactMeta: "Lead Chemist: Harish Patel",
    activityTypeLabel: "Chemist POB", activityTypeIcon: "local_pharmacy", activityTypeClass: "bg-surface-subtle text-secondary",
    timeLabel: "10:48 AM", geoText: "POB Booked: ₹42,500", geoVariant: "success",
    products: ["GlycoZiv 500 (100 Strips)"], promo: "Product Monograph & LBL Kit",
    status: "Approved", zone: "West Zone - Mumbai & Pune", category: "chemist",
    rowBgClass: "bg-surface-canvas/30", hoverBgClass: "hover:bg-surface-subtle/70", secondaryAction: "approve"
  },
  {
    id: "a3", avatarInitials: "RK", avatarClass: "bg-status-danger-bg text-status-danger",
    repName: "Rajesh Kumar", repMeta: "MR-1904 · Delhi NCR",
    contactName: "Dr. Sanjay Grover, MBBS", contactMeta: "General Physician · Max Care Clinic",
    activityTypeLabel: "Doctor Detail", activityTypeIcon: "person_check", activityTypeClass: "bg-brand-primary-subtle text-primary",
    timeLabel: "11:22 AM", geoText: "Mismatch: 620m away from clinic", geoVariant: "danger",
    products: ["Metfor-Z (2m)"], promo: "None logged",
    status: "GPS Alert Flagged", zone: "North Territory - Delhi HQ", category: "call",
    rowBgClass: "bg-status-danger-bg/10", hoverBgClass: "hover:bg-status-danger-bg/20", secondaryAction: "auditFlag"
  },
  {
    id: "a4", avatarInitials: "VJ", avatarClass: "bg-status-info-bg text-status-info",
    repName: "Vikram Joshi", repMeta: "MR-5520 · Ahmedabad Central",
    contactName: "Dr. Meera Desai, DM", contactMeta: "Endocrinologist · Sterling Hospital",
    activityTypeLabel: "Joint Work w/ ABM", activityTypeIcon: "groups", activityTypeClass: "bg-status-info-bg text-status-info",
    timeLabel: "11:50 AM", geoText: "23.0225° N, 72.5714° E (5m)", geoVariant: "success",
    products: ["GlycoZiv XR (7m)", "Thyro-Ziv 50 (4m)"], promo: "4x GlycoZiv Samples, 2x Patient Diaries",
    status: "Under Review", zone: "West Zone - Mumbai & Pune", category: "call",
    rowBgClass: "bg-surface-card", hoverBgClass: "hover:bg-surface-subtle/70", secondaryAction: "approve"
  },
  {
    id: "a5", avatarInitials: "SR", avatarClass: "bg-tertiary-fixed-dim text-on-tertiary-fixed",
    repName: "Sneha Roy", repMeta: "MR-2287 · Kolkata East",
    contactName: "Dr. Subhash Bose, MD", contactMeta: "Chest Physician · Woodlands Heart Centre",
    activityTypeLabel: "Doctor Detail", activityTypeIcon: "person_check", activityTypeClass: "bg-brand-primary-subtle text-primary",
    timeLabel: "12:15 PM", geoText: "22.5726° N, 88.3639° E (18m)", geoVariant: "success",
    products: ["Resp-Clear Inhaler (6m)"], promo: "1x Demo Inhaler Unit, 3x Patient Guides",
    status: "Approved", zone: "East Region - Kolkata Hub", category: "call",
    rowBgClass: "bg-surface-canvas/30", hoverBgClass: "hover:bg-surface-subtle/70", secondaryAction: "vaFeedback"
  },
  {
    id: "a6", avatarInitials: "AV", avatarClass: "bg-secondary-fixed text-on-secondary-fixed",
    repName: "Amit Verma", repMeta: "MR-6011 · Lucknow North",
    contactName: "Awadh Pharma Distributors", contactMeta: "Distributor: Manoj Tandon",
    activityTypeLabel: "Stockist Follow-up", activityTypeIcon: "store", activityTypeClass: "bg-surface-subtle text-secondary",
    timeLabel: "12:42 PM", geoText: "Payment Realization & Stock Audit", geoVariant: "success",
    products: ["Batch Reconciliation #ZIV-990"], promo: "Scheme Circular Q3 Handover",
    status: "Draft / In-Transit", zone: "North Territory - Delhi HQ", category: "dispatch",
    rowBgClass: "bg-surface-card", hoverBgClass: "hover:bg-surface-subtle/70", secondaryAction: "more"
  }
];

const VA_PRODUCTS = [
  { name: "1. ZiviCal D3 (Bone & Calcium)", slides: 412, engagement: 92, bar: "bg-primary" },
  { name: "2. CardioCare 20 (Hypertension)", slides: 310, engagement: 88, bar: "bg-secondary" },
  { name: "3. GlycoZiv XR (Anti-Diabetic)", slides: 245, engagement: 79, bar: "bg-tertiary" },
  { name: "4. Resp-Clear Dry Inhaler", slides: 180, engagement: 72, bar: "bg-outline" }
];

const STATUS_CHIPS: { key: "all" | "verified" | "flagged" | "pending" | "approved"; label: string }[] = [
  { key: "all", label: "All (1,420)" },
  { key: "verified", label: "Verified GPS (1,280)" },
  { key: "flagged", label: "Flagged Location (9)" },
  { key: "pending", label: "Pending Review (28)" },
  { key: "approved", label: "Approved (1,383)" }
];

const PAGE_SIZES = [25, 50, 100];

export function AdminActivitiesDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows, setRows] = useState<ActivityRow[]>(initialRows);
  const [zoneFilter, setZoneFilter] = useState<"all" | Zone>("all");
  const [tab, setTab] = useState<"all" | "call" | "chemist" | "dispatch">("all");
  const [statusChip, setStatusChip] = useState<"all" | "verified" | "flagged" | "pending" | "approved">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["a3"]));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showLog, setShowLog] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [newActivity, setNewActivity] = useState({ repName: "", contactName: "", activityTypeLabel: "Doctor Detail", products: "", promo: "" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (zoneFilter !== "all" && r.zone !== zoneFilter) return false;
      if (tab !== "all" && r.category !== tab) return false;
      if (statusChip === "verified" && r.geoVariant !== "success") return false;
      if (statusChip === "flagged" && r.status !== "GPS Alert Flagged") return false;
      if (statusChip === "pending" && r.status !== "Under Review") return false;
      if (statusChip === "approved" && r.status !== "Approved") return false;
      if (!q) return true;
      return (
        r.repName.toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.contactMeta.toLowerCase().includes(q) ||
        r.activityTypeLabel.toLowerCase().includes(q)
      );
    });
  }, [rows, zoneFilter, tab, statusChip, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function approveRow(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  }

  function bulkApprove() {
    if (selected.size === 0) return;
    setRows((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, status: "Approved" } : r)));
    setSelected(new Set());
  }

  function requestExplanation() {
    if (selected.size === 0) {
      setDetail({ title: "Request Explanation", body: "Select one or more rows using the checkboxes first, then Request Explanation to flag them to the rep for a written note." });
      return;
    }
    const names = rows.filter((r) => selected.has(r.id)).map((r) => r.repName).join(", ");
    setDetail({ title: "Request Explanation", body: `An explanation request has been queued for: ${names}. This is recorded for this session only — there is no field-ops messaging backend wired up yet.` });
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "field-activities-dcr.csv",
      filtered.map((r) => ({
        "Medical Rep": r.repName,
        "Rep Info": r.repMeta,
        "Doctor/Contact": r.contactName,
        "Contact Info": r.contactMeta,
        "Activity Type": r.activityTypeLabel,
        "Time": r.timeLabel,
        "Geofence": r.geoText,
        "Products": r.products.join("; "),
        "Promo/Samples": r.promo,
        "Status": r.status,
        "Zone": r.zone
      }))
    );
  }

  function handleDownloadVaAnalytics() {
    downloadCsv(
      "va-session-analytics.csv",
      VA_PRODUCTS.map((p) => ({ Product: p.name, "Slides Shown": p.slides, "Engagement %": p.engagement }))
    );
  }

  function handleLogActivity() {
    if (!newActivity.repName.trim() || !newActivity.contactName.trim()) return;
    const initials = newActivity.repName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "NA";
    setRows((prev) => [
      ...prev,
      {
        id: `a${prev.length + 1}-${Date.now()}`,
        avatarInitials: initials, avatarClass: "bg-surface-container-high text-on-surface-variant",
        repName: newActivity.repName.trim(), repMeta: "New Log",
        contactName: newActivity.contactName.trim(), contactMeta: "—",
        activityTypeLabel: newActivity.activityTypeLabel, activityTypeIcon: "person_check", activityTypeClass: "bg-brand-primary-subtle text-primary",
        timeLabel: "Just now", geoText: "Awaiting geofence sync", geoVariant: "success",
        products: newActivity.products.trim() ? newActivity.products.split(",").map((s) => s.trim()) : [],
        promo: newActivity.promo.trim() || "None logged",
        status: "Draft / In-Transit", zone: "West Zone - Mumbai & Pune", category: "call",
        rowBgClass: "bg-surface-card", hoverBgClass: "hover:bg-surface-subtle/70", secondaryAction: "more"
      }
    ]);
    setShowLog(false);
    setNewActivity({ repName: "", contactName: "", activityTypeLabel: "Doctor Detail", products: "", promo: "" });
    setPage(totalPages + 1);
  }

  function resetFilters() {
    setZoneFilter("all");
    setTab("all");
    setStatusChip("all");
    setSearch("");
    setPage(1);
  }

  const statusPillClass: Record<ActivityStatus, string> = {
    "Approved": "bg-status-success-bg text-status-success",
    "Under Review": "bg-status-warning-bg text-status-warning",
    "GPS Alert Flagged": "bg-status-danger-bg text-status-danger",
    "Draft / In-Transit": "bg-surface-subtle text-text-secondary"
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full space-y-6">
{/* TOP BREADCRUMB & EXECUTIVE ACTION BAR */}
<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1">
<div className="flex flex-col space-y-1"><div className="flex items-center gap-2"><span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span><span className="text-text-muted text-body-sm font-body-sm">/</span><span className="font-label-md text-label-md text-primary font-semibold">Activities</span></div><div className="flex items-center gap-3 flex-wrap"><h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Activities</h1><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md"><span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>Live In-Flight (Sync 10s)</span></div><p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2"><span className="">Real-time field force telemetry, physician call audit, sample custody verification, and geofence verification across nationwide operating hubs.</span></p></div>
{/* ACTION CONTROLS & COMMAND FILTERS */}
<div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">public</span>
<select
  className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none cursor-pointer"
  value={zoneFilter}
  onChange={(e) => { setZoneFilter(e.target.value as typeof zoneFilter); setPage(1); }}
>
<option value="all">All Zones / West Hub</option>
<option value="North Territory - Delhi HQ">North Territory - Delhi HQ</option>
<option value="West Zone - Mumbai & Pune">West Zone - Mumbai &amp; Pune</option>
<option value="South Sector - Bangalore">South Sector - Bangalore</option>
<option value="East Region - Kolkata Hub">East Region - Kolkata Hub</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
<span className="font-label-md text-label-md text-text-primary">Today: 10 Sep 2026</span>
<span className="material-symbols-outlined text-text-muted text-[16px] cursor-pointer">expand_more</span>
</div>
<div className="relative group">
<button className="flex items-center gap-2 bg-surface-card hover:bg-surface-subtle text-text-primary px-3.5 py-2 rounded-lg font-label-md text-label-md shadow-sm transition-all" type="button" onClick={handleExport} disabled={filtered.length === 0}>
<span className="material-symbols-outlined text-secondary text-[18px]">download</span>
<span className="">Export DCR</span>
<span className="material-symbols-outlined text-[16px] text-text-muted">keyboard_arrow_down</span>
</button>
</div>
<button className="flex items-center gap-2 bg-primary hover:bg-brand-primary-hover active:scale-[0.98] text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md shadow-md transition-all" type="button" onClick={() => setShowLog(true)}>
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span className="">Log Field Activity</span>
</button>
</div>
</div>
{/* OPERATIONAL SUMMARY METRIC CARDS (4-COL GRID) — untouched KPI display */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
{/* Card 1 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total Calls Logged</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">1,420</span>
<span className="font-body-sm text-body-sm text-text-muted">/ 1,600 Target</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
</div>
</div>
<div className="space-y-1.5">
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full transition-all duration-500" style={{ "width": "88.75%" }}></div>
</div>
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="text-status-success font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +4.2% vs yesterday
          </span>
<span className="text-text-secondary">88.7% Complete</span>
</div>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Doctor Detailing Visits</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">1,105</span>
<span className="font-body-sm text-body-sm text-text-secondary">Visits</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">stethoscope</span>
</div>
</div>
<div className="space-y-1.5">
<div className="flex items-center justify-between text-text-secondary font-body-sm text-body-sm">
<span className="">Avg. E-Detailing: <strong className="text-text-primary font-semibold">8.4 mins</strong></span>
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm">On Track</span>
</div>
<div className="flex items-center gap-1.5 text-text-muted font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[15px] text-tertiary">co_present</span>
<span className="">78% Visual Aid coverage achieved</span>
</div>
</div>
</div>
{/* Card 3 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Chemist &amp; Stockist Orders</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">315</span>
<span className="font-body-sm text-body-sm text-text-muted">Bookings (POB)</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">receipt_long</span>
</div>
</div>
<div className="space-y-1.5">
<div className="flex items-center justify-between">
<span className="font-headline-sm text-headline-sm text-text-primary">₹4.82 Lakhs</span>
<span className="text-status-success font-label-sm text-label-sm flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">trending_up</span> +12% MoM
          </span>
</div>
<p className="font-body-sm text-body-sm text-text-muted">89 Secondary billing confirmations today</p>
</div>
</div>
{/* Card 4 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-status-danger">Pending Approvals &amp; Alerts</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-status-danger">14</span>
<span className="font-body-sm text-body-sm text-text-muted">Flagged Logs</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">warning_amber</span>
</div>
</div>
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded-full bg-status-danger-bg text-status-danger font-label-sm text-label-sm">
          9 GPS Mismatches
        </span>
<span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning font-label-sm text-label-sm">
          5 Delayed Logs
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
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${tab === "all" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setTab("all"); setPage(1); }}
>
          Live Call Logs (1,420)
        </button>
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors flex items-center gap-1.5 ${statusChip === "pending" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setStatusChip("pending"); setPage(1); }}
>
<span className="">DCR Approvals</span>
<span className="w-5 h-5 rounded-full bg-status-danger text-on-primary text-[10px] flex items-center justify-center">28</span>
</button>
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${tab === "chemist" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setTab("chemist"); setPage(1); }}
>
          Chemist Orders &amp; POB
        </button>
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${tab === "dispatch" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setTab("dispatch"); setPage(1); }}
>
          Sample / Promo Dispatches
        </button>
<button
  className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
  type="button"
  onClick={() => setDetail({ title: "Timeline Map", body: "A live geo-timeline map view is not part of this preview build. The Live Rep Route panel below shows the same location/geofence data for the currently selected rep." })}
>
<span className="material-symbols-outlined text-[16px]">location_on</span>
<span className="">Timeline Map</span>
</button>
</div>
{/* Quick Operations Actions */}
<div className="flex items-center gap-2">
<button
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-success-bg hover:bg-status-success/20 text-status-success font-label-md text-label-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  onClick={bulkApprove}
  disabled={selected.size === 0}
>
<span className="material-symbols-outlined text-[16px]">done_all</span>
<span className="">Bulk Approve Selected{selected.size > 0 ? ` (${selected.size})` : ""}</span>
</button>
<button
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-md text-label-md transition-all"
  type="button"
  onClick={requestExplanation}
>
<span className="material-symbols-outlined text-[16px]">help_outline</span>
<span className="">Request Explanation</span>
</button>
</div>
</div>
{/* Live Filters & Query Bar */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
<input
  className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
  placeholder="Search by Doctor name, Medical Rep (MR), Specialization, or Clinic..."
  type="text"
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
/>
</div>
<div className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-secondary">
<span className="text-text-muted uppercase">Status:</span>
{STATUS_CHIPS.map((chip) => {
  const active = statusChip === chip.key;
  const baseClass = chip.key === "flagged" ? "bg-status-danger-bg text-status-danger hover:opacity-90" : chip.key === "pending" ? "bg-status-warning-bg text-status-warning hover:opacity-90" : "bg-surface-canvas hover:bg-surface-subtle text-text-secondary";
  return (
    <button
      key={chip.key}
      className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${active && chip.key === "all" ? "bg-brand-primary-subtle text-primary" : active ? "ring-2 ring-primary/40 " + baseClass : baseClass.replace(" font-semibold", "")}`}
      type="button"
      onClick={() => { setStatusChip(chip.key); setPage(1); }}
    >
      {chip.label}
    </button>
  );
})}
<button type="button" className="px-2.5 py-1 rounded-full text-text-muted hover:text-text-primary underline" onClick={resetFilters}>Reset</button>
</div>
</div>
</div>
{/* MAIN DATA ROSTER: COMPREHENSIVE DCR & FIELD ACTIVITIES TABLE */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-card-padding-spacious py-3.5 bg-surface-card flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">badge</span>
<span className="font-headline-sm text-headline-sm text-text-primary">Real-time Field Activity Telemetry (Audited DCRs)</span>
</div>
<div className="flex items-center gap-3 text-text-muted font-body-sm text-body-sm">
<span className="">{filtered.length === 0 ? "No entries" : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} logs`}</span>
<div className="flex items-center gap-1">
<button className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-subtle text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<span className="font-label-md text-label-md text-text-primary">Page {safePage}/{totalPages}</span>
<button className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-subtle text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Responsive Scrollable Data Grid */}
<div className="w-full overflow-x-auto">
<table className="w-full text-left font-table-cell text-table-cell text-text-primary min-w-[1240px]">
<thead>
<tr className="bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider h-table-header-height">
<th className="w-10 px-4 text-center"></th>
<th className="px-3 py-2">Medical Rep (MR)</th>
<th className="px-3 py-2">Doctor / Contact Info</th>
<th className="px-3 py-2">Activity Type</th>
<th className="px-3 py-2">Timestamp &amp; Geofence</th>
<th className="px-3 py-2">Products Detailed</th>
<th className="px-3 py-2">Promo / Samples Handover</th>
<th className="px-3 py-2 text-center">Verification Status</th>
<th className="px-4 py-2 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0">
{pageRows.length === 0 && (
  <tr><td colSpan={9} className="px-4 py-10 text-center text-text-muted font-body-sm text-body-sm">No activities match the current search/filters.</td></tr>
)}
{pageRows.map((r) => (
<tr key={r.id} className={`${r.hoverBgClass} transition-colors h-table-row-height ${r.rowBgClass}`}>
<td className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelected(r.id)} />
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className={`w-9 h-9 rounded-full ${r.avatarClass} font-headline-sm flex items-center justify-center flex-shrink-0`}>
                  {r.avatarInitials}
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">{r.repName}</span>
<span className="font-body-sm text-body-sm text-text-muted">{r.repMeta}</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">{r.contactName}</span>
<span className="font-body-sm text-body-sm text-text-secondary">{r.contactMeta}</span>
</div>
</td>
<td className="px-3 py-3">
<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${r.activityTypeClass} font-label-sm text-label-sm`}>
<span className="material-symbols-outlined text-[13px]">{r.activityTypeIcon}</span> {r.activityTypeLabel}
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className={`flex items-center gap-1.5 font-label-md text-label-md ${r.geoVariant === "success" ? "text-text-primary" : "text-status-danger"}`}>
<span className={`material-symbols-outlined ${r.geoVariant === "success" ? "text-status-success" : ""} text-[16px]`}>{r.geoVariant === "success" ? "verified" : "location_off"}</span>
<span className="">{r.timeLabel}</span>
</div>
<span className={`font-body-sm text-body-sm ${r.geoVariant === "success" ? "text-status-success" : "text-status-danger font-semibold"}`}>
                  {r.geoText}
                </span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
{r.products.length === 0 ? <span className="text-text-muted text-[11px]">None</span> : r.products.map((p) => (
  <span key={p} className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">{p}</span>
))}
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              {r.promo}
            </td>
<td className="px-3 py-3 text-center">
<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${statusPillClass[r.status]} font-label-sm text-label-sm`}>
{r.status !== "Draft / In-Transit" && <span className={`w-1.5 h-1.5 rounded-full ${r.status === "Approved" ? "bg-status-success" : r.status === "Under Review" ? "bg-status-warning" : "bg-status-danger"}`}></span>} {r.status}
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
{r.secondaryAction === "auditFlag" ? (
  <button
    className="px-2 py-1 rounded bg-status-danger-bg hover:bg-status-danger hover:text-on-primary text-status-danger font-label-sm text-label-sm transition-colors"
    type="button"
    onClick={() => setDetail({ title: `Audit Flag — ${r.repName}`, body: `${r.contactName} visit flagged: ${r.geoText}. Logged at ${r.timeLabel}. Review the geofence mismatch before approving this DCR.` })}
  >
                  Audit Flag
                </button>
) : (
  <>
    <button
      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors"
      title="Inspect Call"
      type="button"
      onClick={() => setDetail({ title: `${r.contactName} — Inspect Call`, body: `Rep: ${r.repName} (${r.repMeta}). Activity: ${r.activityTypeLabel} at ${r.timeLabel}. Geofence: ${r.geoText}. Products: ${r.products.join(", ") || "None"}. Promo/Samples: ${r.promo}. Status: ${r.status}.` })}
    >
      <span className="material-symbols-outlined text-[18px]">visibility</span>
    </button>
    {r.secondaryAction === "listen" && (
      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="Listen Audio/VA Log" type="button" onClick={() => setDetail({ title: "Listen Audio/VA Log", body: `Audio/VA session playback is not wired to a media backend yet. Session metadata: ${r.timeLabel}, ${r.activityTypeLabel} with ${r.contactName}.` })}>
        <span className="material-symbols-outlined text-[18px]">play_circle</span>
      </button>
    )}
    {r.secondaryAction === "approve" && (
      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-status-success transition-colors" title="Approve" type="button" onClick={() => approveRow(r.id)}>
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
      </button>
    )}
    {r.secondaryAction === "vaFeedback" && (
      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="VA Feedback" type="button" onClick={() => setDetail({ title: "VA Feedback", body: `E-detailing feedback for ${r.contactName}: engagement recorded, no written feedback submitted yet by ${r.repName}.` })}>
        <span className="material-symbols-outlined text-[18px]">rate_review</span>
      </button>
    )}
    {r.secondaryAction === "more" && (
      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="More" type="button" onClick={() => setDetail({ title: `${r.repName} — More Options`, body: `${r.contactName}: ${r.promo}. Status: ${r.status}. Zone: ${r.zone}.` })}>
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
    )}
  </>
)}
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
{/* Table Pagination Footer */}
<div className="px-card-padding-spacious py-3 bg-surface-canvas/50 flex flex-col sm:flex-row items-center justify-between gap-3">
<div className="flex items-center gap-2 font-body-sm text-body-sm text-text-muted">
<span className="">Rows per page:</span>
<select
  className="bg-surface-card px-2 py-1 rounded text-text-primary font-label-md text-label-md focus:outline-none"
  value={pageSize}
  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
>
{PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
</select>
<span className="">{filtered.length === 0 ? "No entries" : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} entries`}</span>
</div>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded text-text-muted hover:bg-surface-card font-label-md text-label-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage(1)} disabled={safePage <= 1}>First</button>
<button className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:bg-surface-card disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} className={`w-7 h-7 rounded font-label-md text-label-md flex items-center justify-center ${n === safePage ? "bg-primary text-on-primary" : "hover:bg-surface-card text-text-secondary"}`} type="button" onClick={() => setPage(n)}>{n}</button>
))}
<button className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:bg-surface-card disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
<button className="px-2.5 py-1 rounded text-text-secondary hover:bg-surface-card font-label-md text-label-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage(totalPages)} disabled={safePage >= totalPages}>Last</button>
</div>
</div>
</div>
{/* AUXILIARY SPLIT PANELS (60/40 RATIO): LIVE GEO-FEED & E-DETAILING ANALYTICS */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
{/* PANEL A: LIVE GEO-VERIFICATION & DOCTOR COVERAGE FEED (7 COLUMNS) — display panel, untouched */}
<div className="lg:col-span-7 bg-surface-card rounded-xl shadow-sm p-card-padding-spacious flex flex-col justify-between space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">explore</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">Live Rep Route &amp; Geofence Verification</h2>
<span className="font-body-sm text-body-sm text-text-muted">Rahul Sharma (MR-4089) · Route Track: Bandra-Khar-Santacruz</span>
</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm">
          98.4% Route Compliance
        </span>
</div>
{/* Real Map Location Viewport */}
<div className="relative w-full h-56 rounded-lg overflow-hidden shadow-inner group">
<div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-location="Bandra Kurla Complex, Mumbai, India" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9e4szfnLnW_KgyvabFf8ha0QQPfMaf3ovjONv7S96_kNNANIxU87fegM53an6Yx4wxulG7jLw9pCsmHt2jIoMisyzCZr0Bjy1XVnvh9mxvQ1ba6kuADYRuMWj8g0GZMY7zy8XFpdlcXdQ0ImzMvJJaSxGi398ljmFbQ0svEpCgpUCm6foj0XFD2uNxus08ZL4H1DS8V6UfvstcntRf8rdxeYIzH9g3RlwucbhuNnOqcqgU4uiX6NM')" }}></div>
<div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
{/* Live Route HUD Overlay */}
<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-status-success text-[18px]">satellite_alt</span>
<span className="font-label-sm text-label-sm tracking-wide">GPS Signal: High Precision (HDOP 0.8)</span>
</div>
<span className="font-label-sm text-label-sm bg-inverse-surface/90 px-2 py-0.5 rounded text-white backdrop-blur-sm">
            Live Ping: 2m ago
          </span>
</div>
</div>
{/* Linear Route Milestone Progress */}
<div className="space-y-2 pt-1">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Today's Sequenced Route Progress</span>
<div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
<div className="p-2 rounded-lg bg-surface-canvas flex flex-col justify-between">
<div className="flex items-center justify-between text-status-success font-label-sm text-label-sm">
<span className="">09:30 AM</span>
<span className="material-symbols-outlined text-[14px]">check_circle</span>
</div>
<span className="font-label-md text-label-md text-text-primary truncate mt-1">Dr. S. Kulkarni</span>
<span className="text-[11px] text-text-muted">Completed (14m)</span>
</div>
<div className="p-2 rounded-lg bg-surface-canvas flex flex-col justify-between">
<div className="flex items-center justify-between text-status-success font-label-sm text-label-sm">
<span className="">10:14 AM</span>
<span className="material-symbols-outlined text-[14px]">check_circle</span>
</div>
<span className="font-label-md text-label-md text-text-primary truncate mt-1">Dr. Ananya Iyer</span>
<span className="text-[11px] text-text-muted">Completed (8m)</span>
</div>
<div className="p-2 rounded-lg bg-brand-primary-subtle flex flex-col justify-between">
<div className="flex items-center justify-between text-primary font-label-sm text-label-sm">
<span className="">11:45 AM</span>
<span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
</div>
<span className="font-label-md text-label-md text-text-primary truncate mt-1">Dr. P. Nambiar</span>
<span className="text-[11px] text-primary font-medium">In Clinic Visit Now</span>
</div>
<div className="p-2 rounded-lg bg-surface-canvas flex flex-col justify-between opacity-70">
<div className="flex items-center justify-between text-text-muted font-label-sm text-label-sm">
<span className="">02:15 PM</span>
<span className="material-symbols-outlined text-[14px]">schedule</span>
</div>
<span className="font-label-md text-label-md text-text-secondary truncate mt-1">Dr. F. Merchant</span>
<span className="text-[11px] text-text-muted">Next Scheduled</span>
</div>
</div>
</div>
</div>
{/* PANEL B: E-DETAILING INSIGHTS (VA SESSION METRICS - 5 COLUMNS) */}
<div className="lg:col-span-5 bg-surface-card rounded-xl shadow-sm p-card-padding-spacious flex flex-col justify-between space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">analytics</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">E-Detailing VA Session Metrics</h2>
<span className="font-body-sm text-body-sm text-text-muted">Digital Visual Aid Engagement Today</span>
</div>
</div>
<button className="text-text-muted hover:text-text-primary" type="button" onClick={() => setDetail({ title: "E-Detailing VA Session Metrics", body: "Average screen duration 8m 24s/call across 1,248 interactive VA slides today. Use Download VA Analytics for the full per-product breakdown." })}>
<span className="material-symbols-outlined text-[18px]">more_horiz</span>
</button>
</div>
{/* Micro Visual Aid Engagement Summary Bar */}
<div className="p-3 rounded-lg bg-surface-canvas flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-secondary">Average Screen Duration</span>
<div className="font-headline-md text-headline-md text-text-primary mt-0.5">8m 24s / call</div>
</div>
<div className="h-10 w-px bg-surface-subtle"></div>
<div>
<span className="font-body-sm text-body-sm text-text-secondary">VA Interactive Slips</span>
<div className="font-headline-md text-headline-md text-primary mt-0.5">1,248 total</div>
</div>
</div>
{/* Top Detailed Product Performance Bars */}
<div className="space-y-3.5 flex-1">
{VA_PRODUCTS.map((p) => (
<div className="space-y-1" key={p.name}>
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="font-label-md text-label-md text-text-primary">{p.name}</span>
<span className="text-text-secondary font-semibold">{p.slides} slides · {p.engagement}% Engagement</span>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className={`${p.bar} h-full rounded-full`} style={{ width: `${p.engagement}%` }}></div>
</div>
</div>
))}
</div>
{/* Quick Action Feedback Link */}
<div className="pt-2 flex items-center justify-between text-text-secondary font-body-sm text-body-sm">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-status-success">check</span>
          Sync status: 99.1% updated
        </span>
<button type="button" className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1" onClick={handleDownloadVaAnalytics}>
<span className="">Download VA Analytics</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>
    </div>

    {/* Log Field Activity modal */}
    {showLog && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowLog(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Log Field Activity</h3>
          <div className="space-y-3">
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Medical Rep name *" value={newActivity.repName} onChange={(e) => setNewActivity((s) => ({ ...s, repName: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Doctor / Contact name *" value={newActivity.contactName} onChange={(e) => setNewActivity((s) => ({ ...s, contactName: e.target.value }))} />
            <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={newActivity.activityTypeLabel} onChange={(e) => setNewActivity((s) => ({ ...s, activityTypeLabel: e.target.value }))}>
              <option>Doctor Detail</option>
              <option>Chemist POB</option>
              <option>Joint Work w/ ABM</option>
              <option>Stockist Follow-up</option>
            </select>
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Products detailed (comma separated)" value={newActivity.products} onChange={(e) => setNewActivity((s) => ({ ...s, products: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Promo / Samples handover" value={newActivity.promo} onChange={(e) => setNewActivity((s) => ({ ...s, promo: e.target.value }))} />
          </div>
          <p className="text-[11px] text-text-muted">Added to this table for the current session only. There is no field activities database collection yet, so this does not persist after a page reload.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowLog(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-brand-primary-hover disabled:opacity-50" disabled={!newActivity.repName.trim() || !newActivity.contactName.trim()} onClick={handleLogActivity}>Log Activity</button>
          </div>
        </div>
      </div>
    )}

    {/* Read-only detail popup */}
    {detail && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-base">{detail.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{detail.body}</p>
          <div className="flex justify-end pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
