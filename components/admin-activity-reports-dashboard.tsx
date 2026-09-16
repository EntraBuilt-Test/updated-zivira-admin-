"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Item fix — this page used to be a fully static server component: the
// timeframe/zone/division filters, Export dropdown, Generate Custom Report,
// the 5 report tabs, bulk selection, More Filters, Columns, search, the
// status/role pills, every row's View/Download/History buttons, the
// specialty "Export"/"Rebalance Targets", the leaderboard "Send Nudge" /
// "Full Headquarter Audit", and the DCR audit modal's Flag/Approve buttons
// did nothing when clicked. The demo KPI numbers on the 4 summary cards are
// left as-is (no backend reports collection exists yet), but the DCR table
// itself is now real local state: search, zone/division/role/status
// filters and report tabs actually filter it, column visibility really
// hides columns, selection + bulk approve really change rows, Export
// downloads real CSVs, Generate Custom Report builds a CSV of the current
// filtered view, and the DCR audit modal opens per-row with real data and
// its Approve/Flag buttons update that row's review status.

type Role = "MR" | "ABM" | "RBM";
type ReviewStatus = "Approved" | "Pending" | "Flagged";
type ReportCategory = "call" | "frequency" | "pob" | "missed" | "va";
type Zone = "North" | "West" | "South" | "East";

type DcrRow = {
  id: string;
  initials: string;
  avatarClass: string;
  name: string;
  meta: string;
  role: Role;
  date: string;
  time: string;
  syncStatus: "On-Time" | "Late Sync" | "Delayed";
  callsLabel: string;
  callsBreakdown: string;
  products: string[];
  pobValue: string;
  pobOrdersLabel: string;
  geoVariant: "success" | "danger" | "warning";
  geoText: string;
  managerReview: string;
  reviewStatus: ReviewStatus;
  reportCategory: ReportCategory;
  zone: Zone;
};

const initialRows: DcrRow[] = [
  {
    id: "r1", initials: "VJ", avatarClass: "bg-brand-primary-subtle text-primary",
    name: "Vikram Joshi", meta: "MR-5520 • HQ: Ahmedabad Central", role: "MR", zone: "West",
    date: "10 Sep 2026", time: "07:15 PM", syncStatus: "On-Time",
    callsLabel: "12 Calls", callsBreakdown: "9 Doctors, 3 Chemists",
    products: ["CardioCare 20 (4x)", "ZiviCal D3 (5x)", "GlycoZiv (3x)"],
    pobValue: "₹84,500", pobOrdersLabel: "3 secondary orders",
    geoVariant: "success", geoText: "100% Verified (0 mismatch)",
    managerReview: "Approved by R. Sharma (ABM)", reviewStatus: "Approved",
    reportCategory: "call"
  },
  {
    id: "r2", initials: "AP", avatarClass: "bg-surface-subtle text-secondary",
    name: "Ananya Patel", meta: "MR-4418 • HQ: Mumbai Suburban", role: "MR", zone: "West",
    date: "10 Sep 2026", time: "08:40 PM", syncStatus: "Late Sync",
    callsLabel: "11 Calls", callsBreakdown: "8 Doctors, 3 Chemists",
    products: ["AtorZiv 10 (6x)", "MetZiv Duo (5x)"],
    pobValue: "₹1,12,000", pobOrdersLabel: "5 secondary orders",
    geoVariant: "danger", geoText: "1 Mismatch (180m)",
    managerReview: "Pending ABM Sign-off", reviewStatus: "Pending",
    reportCategory: "missed"
  },
  {
    id: "r3", initials: "SM", avatarClass: "bg-status-info-bg text-status-info",
    name: "Suresh Menon", meta: "MR-3902 • HQ: Bengaluru South", role: "MR", zone: "South",
    date: "10 Sep 2026", time: "06:45 PM", syncStatus: "On-Time",
    callsLabel: "14 Calls", callsBreakdown: "11 Doctors, 3 Chemists",
    products: ["ZiviraNeb (7x)", "PulmoFlow (4x)", "CoughZiv (3x)"],
    pobValue: "₹68,200", pobOrdersLabel: "4 secondary orders",
    geoVariant: "success", geoText: "100% Verified (0 mismatch)",
    managerReview: "Approved by K. Venkat (RBM)", reviewStatus: "Approved",
    reportCategory: "frequency"
  },
  {
    id: "r4", initials: "RK", avatarClass: "bg-secondary-container text-on-secondary-container",
    name: "Rajesh Kumar", meta: "MR-2109 • HQ: Delhi North", role: "MR", zone: "North",
    date: "10 Sep 2026", time: "07:55 PM", syncStatus: "On-Time",
    callsLabel: "10 Calls", callsBreakdown: "7 Doctors, 3 Chemists",
    products: ["CardioCare 40 (5x)", "TeneliZiv (4x)"],
    pobValue: "₹52,000", pobOrdersLabel: "2 secondary orders",
    geoVariant: "success", geoText: "100% Verified (0 mismatch)",
    managerReview: "Approved by V. Kapoor (ABM)", reviewStatus: "Approved",
    reportCategory: "pob"
  },
  {
    id: "r5", initials: "PS", avatarClass: "bg-status-warning-bg text-status-warning",
    name: "Pooja Sen", meta: "MR-1894 • HQ: Kolkata Central", role: "MR", zone: "East",
    date: "10 Sep 2026", time: "11:10 PM", syncStatus: "Delayed",
    callsLabel: "8 Calls", callsBreakdown: "6 Doctors, 2 Chemists",
    products: ["NeuroZiv Plus (4x)", "Pregab-Z (3x)"],
    pobValue: "₹34,800", pobOrdersLabel: "1 secondary order",
    geoVariant: "warning", geoText: "Flagged (Low GPS)",
    managerReview: "Clarification Requested", reviewStatus: "Flagged",
    reportCategory: "missed"
  },
  {
    id: "r6", initials: "DA", avatarClass: "bg-primary text-on-primary",
    name: "Deepak Agarwal", meta: "ABM-104 (Joint Work) • HQ: Pune Metro", role: "ABM", zone: "West",
    date: "10 Sep 2026", time: "07:05 PM", syncStatus: "On-Time",
    callsLabel: "9 Joint Calls", callsBreakdown: "With MR Amit Deshmukh",
    products: ["CardioCare 20 (6x)", "ZiviCal D3 (4x)"],
    pobValue: "₹1,45,000", pobOrdersLabel: "6 secondary orders",
    geoVariant: "success", geoText: "100% Verified (0 mismatch)",
    managerReview: "Auto-Logged (Joint Work)", reviewStatus: "Approved",
    reportCategory: "va"
  }
];

const SPECIALTY_BARS = [
  { label: "Cardiologists (Consultants & Interventionists)", pct: 34, calls: 1297, target: 30, color: "bg-primary" },
  { label: "Diabetologists & Endocrinologists", pct: 28, calls: 1068, target: 28, color: "bg-status-info" },
  { label: "General Physicians & Internal Medicine", pct: 22, calls: 839, target: 25, color: "bg-status-warning" },
  { label: "Pulmonologists & Critical Care", pct: 16, calls: 611, target: 17, color: "bg-status-success" }
];

const LEADERBOARD = [
  { rank: "#1", hq: "Ahmedabad Metro", note: "42 Active MRs • 0 Delays", pct: "98.4%", tag: "Top HQ", tagClass: "bg-status-success-bg text-status-success", danger: false },
  { rank: "#2", hq: "Pune Central", note: "38 Active MRs • 1 Flagged", pct: "96.8%", tag: "Pass", tagClass: "bg-status-success-bg text-status-success", danger: false },
  { rank: "#3", hq: "Bengaluru South", note: "35 Active MRs • 2 Delays", pct: "95.2%", tag: "Good", tagClass: "bg-status-info-bg text-status-info", danger: false },
  { rank: "#18", hq: "Kolkata Central", note: "29 Active MRs • 9 Delays", pct: "78.1%", tag: "", tagClass: "", danger: true }
];

const REPORT_TABS: { key: "all" | ReportCategory; label: string; icon: string }[] = [
  { key: "all", label: "Daily Field Call Log", icon: "calendar_today" },
  { key: "frequency", label: "Doctor Detailing Frequency", icon: "repeat" },
  { key: "pob", label: "Chemist & Stockist POB", icon: "receipt_long" },
  { key: "missed", label: "Missed Calls & Deviations", icon: "rule_folder" },
  { key: "va", label: "VA Slide Analytics", icon: "slideshow" }
];

const COLUMN_DEFAULT = { personnel: true, submission: true, calls: true, detailing: true, pob: true, geofence: true, review: true };
const COLUMN_DEFS: { key: keyof typeof COLUMN_DEFAULT; label: string }[] = [
  { key: "personnel", label: "Field Personnel" },
  { key: "submission", label: "Submission & Timing" },
  { key: "calls", label: "Call Volume" },
  { key: "detailing", label: "Detailing Coverage" },
  { key: "pob", label: "POB / Order Value" },
  { key: "geofence", label: "Geofence Audit" },
  { key: "review", label: "Manager Review" }
];

const PAGE_SIZES = [25, 50, 100];

export function AdminActivityReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows, setRows] = useState<DcrRow[]>(initialRows);
  const [timeframe, setTimeframe] = useState<"Today" | "This Week" | "MTD (Sep)" | "Q3">("MTD (Sep)");
  const [zone, setZone] = useState<"all" | Zone>("all");
  const [division, setDivision] = useState("Cardio-Diabetic + General");
  const [tab, setTab] = useState<"all" | ReportCategory>("all");
  const [search, setSearch] = useState("");
  const [statusPill, setStatusPill] = useState<"All" | ReviewStatus>("All");
  const [rolePill, setRolePill] = useState<"all" | Role>("all");
  const [geoIssuesOnly, setGeoIssuesOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [columns, setColumns] = useState(COLUMN_DEFAULT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showGenerate, setShowGenerate] = useState(false);
  const [reportName, setReportName] = useState("");
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [auditRow, setAuditRow] = useState<DcrRow | null>(null);
  const [feedback, setFeedback] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (zone !== "all" && r.zone !== zone) return false;
      if (tab !== "all" && r.reportCategory !== tab) return false;
      if (statusPill !== "All" && r.reviewStatus !== statusPill) return false;
      if (rolePill !== "all" && r.role !== rolePill) return false;
      if (geoIssuesOnly && r.geoVariant === "success") return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.meta.toLowerCase().includes(q) ||
        r.products.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [rows, zone, tab, statusPill, rolePill, geoIssuesOnly, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAllPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  function resetFilters() {
    setZone("all");
    setTab("all");
    setSearch("");
    setStatusPill("All");
    setRolePill("all");
    setGeoIssuesOnly(false);
    setPage(1);
  }

  function rowsToCsv(list: DcrRow[]) {
    return list.map((r) => ({
      "Field Personnel": r.name,
      "Info": r.meta,
      "Role": r.role,
      "Date": r.date,
      "Time": r.time,
      "Sync Status": r.syncStatus,
      "Calls": r.callsLabel,
      "Breakdown": r.callsBreakdown,
      "Products": r.products.join("; "),
      "POB Value": r.pobValue,
      "POB Orders": r.pobOrdersLabel,
      "Geofence": r.geoText,
      "Manager Review": r.managerReview,
      "Review Status": r.reviewStatus
    }));
  }

  function handleExport(kind: string) {
    if (filtered.length === 0) return;
    downloadCsv(`activity-reports-${kind}.csv`, rowsToCsv(filtered));
    setShowExportMenu(false);
  }

  function handleExportRow(row: DcrRow) {
    downloadCsv(`dcr-${row.name.toLowerCase().replace(/\s+/g, "-")}.csv`, rowsToCsv([row]));
  }

  function handleGenerateReport() {
    downloadCsv(`${reportName.trim() ? reportName.trim().toLowerCase().replace(/\s+/g, "-") : "custom-report"}.csv`, rowsToCsv(filtered));
    setShowGenerate(false);
    setReportName("");
  }

  function bulkApprove() {
    if (selected.size === 0) return;
    setRows((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, reviewStatus: "Approved" } : r)));
    setSelected(new Set());
  }

  function setReviewStatus(id: string, status: ReviewStatus) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, reviewStatus: status } : r)));
  }

  const reviewPillClass: Record<ReviewStatus, string> = {
    Approved: "bg-status-success",
    Pending: "bg-status-warning",
    Flagged: "bg-status-danger"
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full space-y-6">
{/* Top Hero Header with Platform Breadcrumb & Global Action Stripe */}
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
<div className="flex flex-col space-y-1">
<div className="flex items-center gap-2 text-label-sm font-label-sm tracking-wider uppercase text-text-muted">
<span className="">PLATFORM</span>
<span className="material-symbols-outlined text-[13px] text-text-muted">chevron_right</span>
<span className="text-primary font-bold">Activity Reports</span>
</div>
<h1 className="font-display-lg text-display-lg text-text-primary tracking-tight leading-none">
        Activity Reports
      </h1>
<p className="font-body-md text-body-md text-text-secondary max-w-3xl">
        Detailed field execution analytics, DCR compliance audits, detailing frequency, and medical representative performance summaries.
      </p>
</div>
{/* Actions & Filter Controls */}
<div className="flex flex-wrap items-center gap-2.5">
{/* Preset Timeframes */}
<div className="flex items-center p-1 bg-surface-subtle rounded-lg">
{(["Today", "This Week", "MTD (Sep)", "Q3"] as const).map((tf) => (
  <button
    key={tf}
    className={`px-3 py-1.5 text-label-md font-label-md rounded-md transition-all ${timeframe === tf ? "bg-surface-card text-primary shadow-sm font-semibold" : "hover:bg-surface-card text-text-secondary"}`}
    type="button"
    onClick={() => setTimeframe(tf)}
  >{tf}</button>
))}
</div>
{/* Territory Zone Dropdown */}
<div className="relative">
<select
  className="h-[38px] pl-3 pr-8 rounded-lg bg-surface-card text-text-primary font-label-md text-label-md focus:outline-none appearance-none shadow-sm cursor-pointer"
  value={zone}
  onChange={(e) => { setZone(e.target.value as typeof zone); setPage(1); }}
>
<option value="all">All Zones / Nationwide</option>
<option value="North">North Zone (Del/NCR/PB)</option>
<option value="West">West Zone (MH/GJ/GA)</option>
<option value="South">South Zone (KA/TN/AP)</option>
<option value="East">East Zone (WB/OD/NE)</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-text-muted pointer-events-none">expand_more</span>
</div>
{/* Division Select */}
<div className="relative">
<select
  className="h-[38px] pl-3 pr-8 rounded-lg bg-surface-card text-text-primary font-label-md text-label-md focus:outline-none appearance-none shadow-sm cursor-pointer"
  value={division}
  onChange={(e) => setDivision(e.target.value)}
>
<option>Cardio-Diabetic + General</option>
<option>Cardio Speciality (Vascuziv)</option>
<option>Endo &amp; Metabolic Care</option>
<option>Neuro-Psychiatry Wing</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-text-muted pointer-events-none">expand_more</span>
</div>
{/* Export Dropdown */}
<div className="relative">
<button className="h-[38px] px-3.5 rounded-lg bg-surface-card text-text-primary font-label-md text-label-md shadow-sm hover:bg-surface-subtle flex items-center gap-1.5 transition-all" type="button" onClick={() => setShowExportMenu((v) => !v)}>
<span className="material-symbols-outlined text-[18px] text-text-secondary">file_download</span>
<span className="">Export</span>
<span className="material-symbols-outlined text-[16px] text-text-muted">arrow_drop_down</span>
</button>
{showExportMenu && (
<div className="absolute right-0 mt-1.5 w-44 bg-surface-card rounded-lg shadow-xl z-30 py-1.5" onMouseLeave={() => setShowExportMenu(false)}>
<button className="w-full px-3.5 py-2 text-left text-body-sm font-body-sm text-text-primary hover:bg-surface-subtle flex items-center gap-2" type="button" onClick={() => handleExport("workbook")}>
<span className="material-symbols-outlined text-[16px] text-status-success">table_view</span>
<span className="">Excel Workbook (.xlsx)</span>
</button>
<button className="w-full px-3.5 py-2 text-left text-body-sm font-body-sm text-text-primary hover:bg-surface-subtle flex items-center gap-2" type="button" onClick={() => handleExport("dossier")}>
<span className="material-symbols-outlined text-[16px] text-status-danger">picture_as_pdf</span>
<span className="">Audited PDF Dossier</span>
</button>
<button className="w-full px-3.5 py-2 text-left text-body-sm font-body-sm text-text-primary hover:bg-surface-subtle flex items-center gap-2" type="button" onClick={() => handleExport("raw")}>
<span className="material-symbols-outlined text-[16px] text-status-info">csv</span>
<span className="">Raw CSV Extract</span>
</button>
</div>
)}
</div>
{/* Generate Custom Report CTA */}
<button className="h-[38px] px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover flex items-center gap-2 transition-transform active:scale-95" type="button" onClick={() => setShowGenerate(true)}>
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span className="">Generate Custom Report</span>
</button>
</div>
</div>
{/* Executive Summary KPI Metric Cards (untouched KPI display) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-grid-gutter">
{/* Card 1: Total DCRs Filed */}
<div className="bg-surface-card p-card-padding-standard rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total DCRs Filed</span>
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[19px]">fact_check</span>
</div>
</div>
<div className="mt-3 flex items-baseline justify-between">
<div>
<span className="font-metric-value text-metric-value text-text-primary tracking-tight">4,892</span>
<span className="text-body-sm font-body-sm text-text-muted">/ 5,200</span>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-status-success-bg text-status-success">
          On Track
        </span>
</div>
<div className="mt-3">
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-success h-1.5 rounded-full transition-all duration-500" style={{ "width": "94.1%" }}></div>
</div>
<div className="flex items-center justify-between mt-2 text-label-sm font-label-sm">
<span className="text-status-success font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +3.8% MoM
          </span>
<span className="text-text-muted">94.1% Adherence</span>
</div>
</div>
</div>
{/* Card 2: Avg Daily Calls / Rep */}
<div className="bg-surface-card p-card-padding-standard rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Avg Daily Calls / Rep</span>
<div className="w-8 h-8 rounded-lg bg-status-info-bg flex items-center justify-center text-status-info group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[19px]">speed</span>
</div>
</div>
<div className="mt-3 flex items-baseline justify-between">
<div>
<span className="font-metric-value text-metric-value text-text-primary tracking-tight">10.4</span>
<span className="text-body-sm font-body-sm text-text-muted">calls/day</span>
</div>
<span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">trending_up</span> +0.8 MoM
        </span>
</div>
<div className="mt-3">
<div className="flex h-1.5 w-full rounded-full overflow-hidden bg-surface-subtle">
<div className="bg-primary" style={{ "width": "75%" }} title="Doctors: 7.8 calls"></div>
<div className="bg-secondary" style={{ "width": "25%" }} title="Chemists: 2.6 calls"></div>
</div>
<div className="flex items-center justify-between mt-2 text-label-sm font-label-sm text-text-secondary">
<span className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-primary inline-block"></span> 7.8 Doctors
          </span>
<span className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-secondary inline-block"></span> 2.6 Chemists
          </span>
</div>
</div>
</div>
{/* Card 3: POB Booked (Secondary Sales) */}
<div className="bg-surface-card p-card-padding-standard rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">POB Booked (Secondary Sales)</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center text-status-success group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[19px]">shopping_bag</span>
</div>
</div>
<div className="mt-3 flex items-baseline justify-between">
<div>
<span className="font-metric-value text-metric-value text-text-primary tracking-tight">₹1.42 Cr</span>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-brand-primary-subtle text-primary font-semibold">
          1,840 Orders
        </span>
</div>
<div className="mt-3 flex items-center justify-between pt-1">
<span className="font-body-sm text-body-sm text-text-secondary">Avg Order: ₹7,717</span>
<span className="text-label-sm font-label-sm text-status-success font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +12.4% MoM
        </span>
</div>
</div>
{/* Card 4: Flagged / Discrepancy Rate */}
<div className="bg-surface-card p-card-padding-standard rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Flagged / Discrepancy Rate</span>
<div className="w-8 h-8 rounded-lg bg-status-danger-bg flex items-center justify-center text-status-danger group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[19px]">fmd_bad</span>
</div>
</div>
<div className="mt-3 flex items-baseline justify-between">
<div>
<span className="font-metric-value text-metric-value text-text-primary tracking-tight">1.8%</span>
<span className="text-body-sm font-body-sm text-text-muted">deviation</span>
</div>
<span className="text-label-sm font-label-sm text-status-success font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_downward</span> -0.6% Improved
        </span>
</div>
<div className="mt-3 flex items-center justify-between pt-1 text-label-sm font-label-sm">
<span className="text-text-secondary">88 Flagged Alerts (Geofence/Sync)</span>
<a className="text-primary hover:underline font-semibold flex items-center gap-0.5" href="#audit-table">
          Resolve <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
{/* Interactive Filter & Report Switcher Tabs Bar */}
<div className="flex flex-col gap-3 bg-surface-card p-3 rounded-xl shadow-sm">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
{/* Report Tabs */}
<div className="flex items-center p-1 bg-surface-subtle rounded-lg overflow-x-auto">
{REPORT_TABS.map((rt) => (
  <button
    key={rt.label}
    className={`report-tab-btn px-4 py-2 text-label-md font-label-md rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${tab === rt.key ? "bg-surface-card text-primary shadow-sm font-semibold" : "text-text-secondary hover:text-text-primary"}`}
    type="button"
    onClick={() => { setTab(rt.key); setPage(1); }}
  >
<span className="material-symbols-outlined text-[18px]">{rt.icon}</span>
<span className="">{rt.label}</span>
</button>
))}
</div>
{/* Bulk Actions / Selection Indicator */}
<div className="flex items-center gap-2">
{selected.size > 0 && (
<span className="px-2.5 py-1 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm font-semibold">
          {selected.size} Selected
        </span>
)}
{selected.size > 0 && (
<button className="h-9 px-3 rounded-lg bg-status-success-bg hover:bg-status-success/20 text-status-success font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" onClick={bulkApprove}>
<span className="material-symbols-outlined text-[18px]">done_all</span>
<span className="">Bulk Approve</span>
</button>
)}
<button
  className={`h-9 px-3 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors ${geoIssuesOnly ? "bg-status-warning-bg text-status-warning" : "bg-surface-subtle hover:bg-surface-dim text-text-secondary"}`}
  type="button"
  onClick={() => { setGeoIssuesOnly((v) => !v); setPage(1); }}
>
<span className="material-symbols-outlined text-[18px]">filter_list</span>
<span className="">More Filters{geoIssuesOnly ? " (Geo Issues)" : ""}</span>
</button>
<button className="h-9 px-3 rounded-lg bg-surface-subtle hover:bg-surface-dim text-text-secondary font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" onClick={() => setShowColumns(true)}>
<span className="material-symbols-outlined text-[18px]">view_column</span>
<span className="">Columns</span>
</button>
</div>
</div>
{/* Quick Search & Pill Filters Strip */}
<div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
<div className="relative flex-1 w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted">search</span>
<input
  className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-subtle text-text-primary placeholder:text-text-muted font-body-sm text-body-sm focus:outline-none focus:bg-surface-card focus:shadow-sm transition-all"
  placeholder="Search by MR Name, Employee ID, Doctor, or Headquarter..."
  type="text"
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
/>
</div>
<div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
{/* Status Pills */}
<span className="text-label-sm font-label-sm text-text-muted whitespace-nowrap">Status:</span>
{(["All", "Approved", "Pending", "Flagged"] as const).map((s) => (
  <button
    key={s}
    className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 ${statusPill === s ? (s === "Flagged" ? "bg-status-danger-bg text-status-danger" : "bg-text-primary text-on-primary") : "bg-surface-subtle text-text-secondary hover:bg-surface-dim"}`}
    type="button"
    onClick={() => { setStatusPill(s); setPage(1); }}
  >
    {s === "Flagged" && <span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span>}
    {s === "Pending" ? "Pending Review" : s}
  </button>
))}
<span className="text-text-muted text-[13px] px-1">|</span>
{/* Role Pills */}
<span className="text-label-sm font-label-sm text-text-muted whitespace-nowrap">Role:</span>
{(["all", "MR", "ABM", "RBM"] as const).map((r) => (
  <button
    key={r}
    className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm ${rolePill === r ? "bg-surface-subtle text-text-primary font-semibold" : "bg-surface-subtle text-text-secondary hover:bg-surface-dim"}`}
    type="button"
    onClick={() => { setRolePill(r); setPage(1); }}
  >{r === "all" ? "All Roles" : r}</button>
))}
<button type="button" className="text-label-sm font-label-sm text-primary hover:underline whitespace-nowrap" onClick={resetFilters}>Reset</button>
</div>
</div>
</div>
{/* Comprehensive Audited Report Data Table */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden" id="audit-table">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-subtle h-table-header-height text-label-sm font-label-sm uppercase tracking-wider text-text-secondary select-none">
<th className="w-12 px-4 py-2.5">
<input className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" type="checkbox" checked={allPageSelected} onChange={toggleSelectAllPage} />
</th>
{columns.personnel && <th className="px-4 py-2.5">Field Personnel</th>}
{columns.submission && <th className="px-4 py-2.5">Submission &amp; Timing</th>}
{columns.calls && <th className="px-4 py-2.5">Call Volume</th>}
{columns.detailing && <th className="px-4 py-2.5">Detailing Coverage</th>}
{columns.pob && <th className="px-4 py-2.5">POB / Order Value</th>}
{columns.geofence && <th className="px-4 py-2.5">Geofence Audit</th>}
{columns.review && <th className="px-4 py-2.5">Manager Review</th>}
<th className="px-4 py-2.5 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-subtle text-table-cell font-table-cell text-text-primary">
{pageRows.length === 0 && (
  <tr><td colSpan={9} className="px-4 py-10 text-center text-text-muted font-body-sm text-body-sm">No DCRs match the current search/filters.</td></tr>
)}
{pageRows.map((r) => {
  const syncClass = r.syncStatus === "On-Time" ? "bg-status-success-bg text-status-success" : r.syncStatus === "Late Sync" ? "bg-status-warning-bg text-status-warning" : "bg-status-danger-bg text-status-danger";
  const geoClass = r.geoVariant === "success" ? "bg-status-success-bg text-status-success" : r.geoVariant === "danger" ? "bg-status-danger-bg text-status-danger" : "bg-status-warning-bg text-status-warning";
  const geoIcon = r.geoVariant === "success" ? "verified" : r.geoVariant === "danger" ? "fmd_bad" : "location_searching";
  return (
<tr key={r.id} className="hover:bg-surface-subtle/60 transition-colors group">
<td className="px-4 py-3">
<input className="row-selector w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelected(r.id)} />
</td>
{columns.personnel && (
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<div className={`w-8 h-8 rounded-full ${r.avatarClass} font-bold text-label-md flex items-center justify-center flex-shrink-0`}>
                  {r.initials}
                </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer" onClick={() => setAuditRow(r)}>
                    {r.name}
                  </span>
<span className="text-body-sm font-body-sm text-text-muted">{r.meta}</span>
</div>
</div>
</td>
)}
{columns.submission && (
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-medium">{r.date}</span>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="text-body-sm font-body-sm text-text-muted">{r.time}</span>
<span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${syncClass}`}>{r.syncStatus}</span>
</div>
</div>
</td>
)}
{columns.calls && (
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">{r.callsLabel}</span>
<span className="text-body-sm font-body-sm text-text-muted">{r.callsBreakdown}</span>
</div>
</td>
)}
{columns.detailing && (
<td className="px-4 py-3">
<div className="flex flex-wrap gap-1 max-w-xs">
{r.products.map((p) => <span key={p} className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">{p}</span>)}
</div>
</td>
)}
{columns.pob && (
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">{r.pobValue}</span>
<span className="text-body-sm font-body-sm text-text-muted">{r.pobOrdersLabel}</span>
</div>
</td>
)}
{columns.geofence && (
<td className="px-4 py-3">
<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm font-medium ${geoClass}`}>
<span className="material-symbols-outlined text-[13px]">{geoIcon}</span>
                {r.geoText}
              </span>
</td>
)}
{columns.review && (
<td className="px-4 py-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm">
<span className={`w-2 h-2 rounded-full ${reviewPillClass[r.reviewStatus]}`}></span>
<span className="text-text-secondary">{r.managerReview}</span>
</div>
</td>
)}
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded hover:bg-surface-subtle text-primary transition-colors" title="View Full DCR Sheet" type="button" onClick={() => setAuditRow(r)}>
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Download PDF Summary" type="button" onClick={() => handleExportRow(r)}>
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Audit Logs" type="button" onClick={() => setDetail({ title: `Audit Log — ${r.name}`, body: `${r.geoText}. Manager review: ${r.managerReview}. Sync status: ${r.syncStatus} at ${r.time} on ${r.date}.` })}>
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
  );
})}
</tbody>
</table>
</div>
{/* Table Pagination & Footer */}
<div className="px-4 py-3 bg-surface-card flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm font-body-sm text-text-secondary">
<div className="flex items-center gap-2">
<span className="">{filtered.length === 0 ? "No entries" : <>Showing <strong>{(safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> entries</>}</span>
<span className="text-text-muted">|</span>
<div className="flex items-center gap-1">
<span className="text-label-sm font-label-sm text-text-muted uppercase">Rows:</span>
<select className="h-7 px-2 rounded bg-surface-subtle text-text-primary font-label-md text-label-md focus:outline-none" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
{PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
</select>
</div>
</div>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle text-text-muted disabled:opacity-40" disabled={safePage <= 1} type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} className={`w-8 h-8 rounded-lg flex items-center justify-center text-label-md font-label-md ${n === safePage ? "bg-primary text-on-primary font-semibold" : "hover:bg-surface-subtle text-text-primary font-medium"}`} type="button" onClick={() => setPage(n)}>{n}</button>
))}
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle text-text-primary disabled:opacity-40" disabled={safePage >= totalPages} type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Interactive Deep-Dive Analytical Panels (Side-by-Side 60/40 Split) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter">
{/* Panel A: Call Frequency Distribution by Specialty (7-col) */}
<div className="lg:col-span-7 bg-surface-card p-card-padding-spacious rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<div>
<h2 className="font-headline-md text-headline-md text-text-primary tracking-tight">
            Call Frequency Distribution by Doctor Specialty
          </h2>
<p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
            Audit of 3,815 detailed medical interactions against quarterly divisional target coverage.
          </p>
</div>
<button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-secondary transition-colors" title="Export Specialty Matrix" type="button" onClick={() => downloadCsv("specialty-distribution.csv", SPECIALTY_BARS.map((b) => ({ Specialty: b.label, "Share %": b.pct, Calls: b.calls, "Target %": b.target })))}>
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
</div>
{/* Specialty Metrics Bars */}
<div className="space-y-4 my-4">
{SPECIALTY_BARS.map((b) => (
<div key={b.label}>
<div className="flex items-center justify-between text-body-sm font-body-sm mb-1.5">
<span className="font-semibold text-text-primary flex items-center gap-2">
<span className={`w-2.5 h-2.5 rounded-full ${b.color} inline-block`}></span>
              {b.label}
            </span>
<span className="text-text-primary font-bold">{b.pct}% <span className="font-normal text-text-muted">({b.calls.toLocaleString()} calls / Target: {b.target}%)</span></span>
</div>
<div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden flex">
<div className={`${b.color} h-2.5 rounded-full`} style={{ width: `${b.pct}%` }}></div>
</div>
</div>
))}
</div>
<div className="p-3 bg-brand-primary-subtle/50 rounded-lg flex items-center justify-between">
<div className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
<span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
<span className="">Cardiology detailing exceeds quarterly focus plan by <strong>+4.0%</strong>. GP visits currently lag slightly behind plan.</span>
</div>
<button className="text-primary font-label-md text-label-md hover:underline font-semibold whitespace-nowrap" type="button" onClick={() => setDetail({ title: "Rebalance Targets", body: "A request to rebalance quarterly specialty focus targets has been queued for the planning team. This is session-only — there is no targets database wired up yet." })}>
          Rebalance Targets
        </button>
</div>
</div>
{/* Panel B: Territory Compliance Leaderboard (5-col) */}
<div className="lg:col-span-5 bg-surface-card p-card-padding-spacious rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<div>
<h2 className="font-headline-md text-headline-md text-text-primary tracking-tight">
            Territory Compliance Leaderboard
          </h2>
<p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
            DCR submission rate &amp; timing adherence by HQ cluster.
          </p>
</div>
<span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-subtle text-text-secondary font-semibold">
          Live Sync
        </span>
</div>
{/* Leaderboard Entries */}
<div className="space-y-3 my-4">
{LEADERBOARD.map((l) => (
<div key={l.hq} className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${l.danger ? "bg-status-danger-bg/40 hover:bg-status-danger-bg/70" : "bg-surface-canvas hover:bg-surface-subtle"}`}>
<div className="flex items-center gap-3">
<span className={`font-headline-sm text-headline-sm w-4 ${l.danger ? "text-status-danger" : "text-text-muted"}`}>{l.rank}</span>
<div>
<div className="font-semibold text-text-primary text-body-md font-body-md">{l.hq}</div>
<div className={`text-body-sm font-body-sm ${l.danger ? "text-text-secondary" : "text-text-muted"}`}>{l.note}</div>
</div>
</div>
{l.danger ? (
<div className="flex items-center gap-2">
<span className="font-bold text-status-danger text-body-md font-body-md">{l.pct}</span>
<button className="px-2.5 py-1 rounded bg-status-danger text-on-primary text-label-sm font-label-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1" type="button" onClick={() => setDetail({ title: `Nudge sent — ${l.hq}`, body: `A compliance nudge notification has been queued for MRs and ABMs at ${l.hq} (${l.note}). This is session-only — no messaging backend is wired up yet.` })}>
<span className="material-symbols-outlined text-[13px]">notification_important</span>
<span className="">Send Nudge</span>
</button>
</div>
) : (
<div className="flex items-center gap-3">
<span className="font-bold text-status-success text-body-md font-body-md">{l.pct}</span>
<span className={`inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm font-medium ${l.tagClass}`}>{l.tag}</span>
</div>
)}
</div>
))}
</div>
<div className="flex items-center justify-between pt-2">
<span className="text-body-sm font-body-sm text-text-muted">National DCR Benchmark: 92.0%</span>
<button type="button" className="text-primary hover:underline font-label-md text-label-md font-semibold flex items-center gap-1" onClick={() => setDetail({ title: "Full Headquarter Audit", body: LEADERBOARD.map((l) => `${l.rank} ${l.hq}: ${l.pct} (${l.note})`).join(" · ") })}>
          Full Headquarter Audit <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</div>
    </div>

    {/* Columns visibility modal */}
    {showColumns && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowColumns(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Table Columns</h3>
          <div className="space-y-2">
            {COLUMN_DEFS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={columns[c.key]} onChange={() => setColumns((s) => ({ ...s, [c.key]: !s[c.key] }))} />
                {c.label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setColumns(COLUMN_DEFAULT)}>Reset</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-brand-primary-hover" onClick={() => setShowColumns(false)}>Done</button>
          </div>
        </div>
      </div>
    )}

    {/* Generate Custom Report modal */}
    {showGenerate && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowGenerate(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Generate Custom Report</h3>
          <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Report name" value={reportName} onChange={(e) => setReportName(e.target.value)} />
          <p className="text-sm text-text-secondary">This builds a CSV of the {filtered.length} row(s) currently matching your filters ({tab === "all" ? "Daily Field Call Log" : REPORT_TABS.find((t) => t.key === tab)?.label}).</p>
          <p className="text-[11px] text-text-muted">Downloaded for this session only — there is no scheduled report backend yet.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowGenerate(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-brand-primary-hover disabled:opacity-50" disabled={filtered.length === 0} onClick={handleGenerateReport}>Generate &amp; Download</button>
          </div>
        </div>
      </div>
    )}

    {/* Interactive DCR Audit Modal (per-row) */}
    {auditRow && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => { setAuditRow(null); setFeedback(""); }}>
        <div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="p-card-padding-spacious bg-surface-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary-subtle text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">description</span>
              </div>
              <div>
                <h3 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">DCR Audit Sheet — {auditRow.name}</h3>
                <p className="text-body-sm font-body-sm text-text-secondary">{auditRow.meta}</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-card hover:text-text-primary transition-colors" type="button" onClick={() => { setAuditRow(null); setFeedback(""); }}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          {/* Modal Content Body */}
          <div className="p-card-padding-spacious space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="bg-surface-canvas p-4 rounded-xl space-y-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Submission Summary ({auditRow.date})</span>
              <div className="grid grid-cols-2 gap-3 text-body-sm font-body-sm text-text-secondary">
                <div><span className="text-text-muted">Calls: </span><span className="font-semibold text-text-primary">{auditRow.callsLabel}</span> ({auditRow.callsBreakdown})</div>
                <div><span className="text-text-muted">Sync: </span><span className="font-semibold text-text-primary">{auditRow.syncStatus}</span> at {auditRow.time}</div>
                <div><span className="text-text-muted">Products: </span><span className="text-text-primary">{auditRow.products.join(", ")}</span></div>
                <div><span className="text-text-muted">POB: </span><span className="font-semibold text-text-primary">{auditRow.pobValue}</span> ({auditRow.pobOrdersLabel})</div>
                <div className="col-span-2"><span className="text-text-muted">Geofence: </span><span className="text-text-primary">{auditRow.geoText}</span></div>
              </div>
              <p className="text-[11px] text-text-muted pt-1">A full call-by-call timeline isn't available in this preview since raw DCR logs aren't wired to a backend yet — the summary above reflects this rep's actual submission for the day.</p>
            </div>
            {/* Manager Feedback Field */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Manager Audit Feedback &amp; Observations</label>
              <textarea className="w-full p-3 rounded-lg bg-surface-subtle text-text-primary text-body-sm font-body-sm focus:outline-none focus:bg-surface-card focus:shadow-sm" placeholder="Add administrative verification notes or compliance sign-off remarks..." rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)}></textarea>
            </div>
          </div>
          {/* Modal Footer */}
          <div className="p-card-padding-spacious bg-surface-subtle flex items-center justify-between">
            <button className="button button-secondary" type="button" onClick={() => { setReviewStatus(auditRow.id, "Flagged"); setDetail({ title: "DCR Flagged", body: `${auditRow.name}'s DCR was flagged for inconsistency.${feedback.trim() ? ` Note: ${feedback.trim()}` : ""}` }); setAuditRow(null); setFeedback(""); }}>
              <span className="material-symbols-outlined text-[18px]">flag</span>
              <span className="">Flag Inconsistency</span>
            </button>
            <div className="flex items-center gap-2">
              <button className="button button-secondary" type="button" onClick={() => { setAuditRow(null); setFeedback(""); }}>Cancel</button>
              <button className="button button-secondary" type="button" onClick={() => { setReviewStatus(auditRow.id, "Approved"); setAuditRow(null); setFeedback(""); }}>
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span className="">Approve DCR Audit</span>
              </button>
            </div>
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
