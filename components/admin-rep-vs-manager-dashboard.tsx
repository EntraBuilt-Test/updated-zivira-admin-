"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// This page used to be a fully static server component: every number was
// hand-typed JSX and none of its buttons/selects/inputs had a real
// onClick/onChange handler. The KPI cards at the top are left as-is (no
// backend collection exists yet for joint-field metrics), but the
// Supervisory Roster table is now real local state: search, both
// dropdown filters and Reset actually filter it, row checkboxes are real
// selection state, Active/Inspect/Flagged loads that ASM's real data
// into the right-hand dossier, Export Joint Field Work Audit downloads
// exactly what's on screen as CSV, and Schedule Mandatory Supervisory
// Rides / Download Report / Schedule Ride-Along open real (session-only)
// confirmations instead of doing nothing.

type Supervisor = {
  id: string;
  name: string;
  initials: string;
  code: string;
  hq: string;
  zone: "West Zone" | "North Zone" | "East Zone" | "South Zone";
  repsCovered: string;
  hqAreas: string;
  jointDaysActual: number;
  jointDaysTarget: number;
  jointDaysPct: string;
  jointDaysBadgeClass: string;
  jointCalls: string;
  callConv: string;
  callConvClass: string;
  coachingIndex: string;
  coachingIndexClass: string;
  auditStatus: string;
  auditStatusClass: string;
  actionLabel: string;
  actionClass: string;
  rowClass: string;
  avatarClass: string;
  flagged: boolean;
  reportsTo: string;
  title: string;
  mentorship: { name: string; days: string; calls: string; focus: string }[];
  rubric: { label: string; score: string; pct: string }[];
};

const initialSupervisors: Supervisor[] = [
  {
    id: "asm-west-01", name: "Rajesh Sharma", initials: "RS", code: "ASM-WEST-01", hq: "Mumbai Metro", zone: "West Zone",
    repsCovered: "12 Reps Covered", hqAreas: "Thane, Dadar, Bandra",
    jointDaysActual: 14, jointDaysTarget: 12, jointDaysPct: "116%", jointDaysBadgeClass: "bg-status-success-bg text-status-success",
    jointCalls: "142 Calls", callConv: "78.4%", callConvClass: "text-text-primary",
    coachingIndex: "8.9", coachingIndexClass: "text-[#b43403]",
    auditStatus: "Compliant", auditStatusClass: "bg-status-success-bg text-status-success border border-status-success-bg",
    actionLabel: "Active", actionClass: "bg-[#b43403] text-white hover:bg-[#9a2c02]",
    rowClass: "bg-orange-50/60 hover:bg-orange-50/80", avatarClass: "bg-[#b43403] text-white", flagged: false,
    reportsTo: "Vikram Singhania (ZSM - West)", title: "Area Sales Manager • Mumbai & Thane",
    mentorship: [
      { name: "Rahul Sharma (Sr MR - Dadar)", days: "3 Days", calls: "28 Joint Calls", focus: "CardioCare 20 Launch" },
      { name: "Amit Duggal (MR - Bandra)", days: "2 Days", calls: "22 Joint Calls", focus: "GlycoZiv XR Conversion" },
      { name: "Sneha Patel (MR - Thane)", days: "3 Days", calls: "31 Joint Calls", focus: "A+ KOL Conversion" }
    ],
    rubric: [
      { label: "Scientific Knowledge & Brand Positioning", score: "9.2 / 10", pct: "92%" },
      { label: "Objection Handling & Doctor Feedback", score: "8.6 / 10", pct: "86%" },
      { label: "Closing & Sample Handover Discipline", score: "8.8 / 10", pct: "88%" },
      { label: "RCPA Audit & Chemist Stockist Cross-Check", score: "8.2 / 10", pct: "82%" }
    ]
  },
  {
    id: "asm-north-02", name: "Vikrant Verma", initials: "VV", code: "ASM-NORTH-02", hq: "New Delhi", zone: "North Zone",
    repsCovered: "10 Reps Covered", hqAreas: "Rohini, Connaught, Noida",
    jointDaysActual: 11, jointDaysTarget: 12, jointDaysPct: "92%", jointDaysBadgeClass: "bg-status-warning-bg text-status-warning",
    jointCalls: "118 Calls", callConv: "71.2%", callConvClass: "text-text-primary",
    coachingIndex: "8.1", coachingIndexClass: "text-text-secondary",
    auditStatus: "Pending 1d", auditStatusClass: "bg-status-warning-bg text-status-warning border border-status-warning-bg",
    actionLabel: "Inspect", actionClass: "bg-surface-subtle text-text-secondary hover:bg-slate-200",
    rowClass: "hover:bg-surface-subtle/80", avatarClass: "bg-surface-subtle text-text-secondary", flagged: false,
    reportsTo: "Meenal Kapoor (ZSM - North)", title: "Area Sales Manager • New Delhi",
    mentorship: [
      { name: "Karan Malhotra (MR - Rohini)", days: "4 Days", calls: "36 Joint Calls", focus: "GlycoZiv XR Titration" },
      { name: "Priya Nair (MR - Noida)", days: "3 Days", calls: "30 Joint Calls", focus: "Resp-Clear Adoption" },
      { name: "Farhan Ali (MR - CP)", days: "4 Days", calls: "27 Joint Calls", focus: "CardioCare 20 Recall" }
    ],
    rubric: [
      { label: "Scientific Knowledge & Brand Positioning", score: "8.4 / 10", pct: "84%" },
      { label: "Objection Handling & Doctor Feedback", score: "7.9 / 10", pct: "79%" },
      { label: "Closing & Sample Handover Discipline", score: "8.0 / 10", pct: "80%" },
      { label: "RCPA Audit & Chemist Stockist Cross-Check", score: "7.6 / 10", pct: "76%" }
    ]
  },
  {
    id: "asm-east-01", name: "Debopriya Das", initials: "DD", code: "ASM-EAST-01", hq: "Kolkata Hub", zone: "East Zone",
    repsCovered: "11 Reps Covered", hqAreas: "Howrah, Salt Lake, Alipore",
    jointDaysActual: 13, jointDaysTarget: 12, jointDaysPct: "108%", jointDaysBadgeClass: "bg-status-success-bg text-status-success",
    jointCalls: "135 Calls", callConv: "74.0%", callConvClass: "text-text-primary",
    coachingIndex: "8.5", coachingIndexClass: "text-text-secondary",
    auditStatus: "Compliant", auditStatusClass: "bg-status-success-bg text-status-success border border-status-success-bg",
    actionLabel: "Inspect", actionClass: "bg-surface-subtle text-text-secondary hover:bg-slate-200",
    rowClass: "hover:bg-surface-subtle/80", avatarClass: "bg-surface-subtle text-text-secondary", flagged: false,
    reportsTo: "Anirban Sengupta (ZSM - East)", title: "Area Sales Manager • Kolkata Hub",
    mentorship: [
      { name: "Sourav Ganguly (MR - Howrah)", days: "3 Days", calls: "29 Joint Calls", focus: "ZiviCal D3 Uptake" },
      { name: "Ananya Basu (MR - Salt Lake)", days: "4 Days", calls: "33 Joint Calls", focus: "CardioCare 20 Recall" },
      { name: "Rohit Ghosh (MR - Alipore)", days: "3 Days", calls: "26 Joint Calls", focus: "GastroZiv DSR Trial" }
    ],
    rubric: [
      { label: "Scientific Knowledge & Brand Positioning", score: "8.8 / 10", pct: "88%" },
      { label: "Objection Handling & Doctor Feedback", score: "8.3 / 10", pct: "83%" },
      { label: "Closing & Sample Handover Discipline", score: "8.5 / 10", pct: "85%" },
      { label: "RCPA Audit & Chemist Stockist Cross-Check", score: "8.1 / 10", pct: "81%" }
    ]
  },
  {
    id: "asm-south-01", name: "Srinivas Murthy", initials: "SM", code: "ASM-SOUTH-01", hq: "Bengaluru", zone: "South Zone",
    repsCovered: "9 Reps Covered", hqAreas: "Indiranagar, Whitefield",
    jointDaysActual: 8, jointDaysTarget: 12, jointDaysPct: "67% Lag", jointDaysBadgeClass: "bg-rose-100 text-rose-700",
    jointCalls: "82 Calls", callConv: "62.1%", callConvClass: "text-rose-600",
    coachingIndex: "6.8", coachingIndexClass: "text-rose-600",
    auditStatus: "Lagging", auditStatusClass: "bg-rose-100 text-rose-700 border border-rose-200",
    actionLabel: "Flagged", actionClass: "bg-rose-100 text-rose-700 hover:bg-rose-200",
    rowClass: "bg-rose-50/40 hover:bg-rose-50/70", avatarClass: "bg-rose-100 text-rose-700", flagged: true,
    reportsTo: "Lakshmi Iyer (ZSM - South)", title: "Area Sales Manager • Bengaluru",
    mentorship: [
      { name: "Manoj Reddy (MR - Indiranagar)", days: "1 Day", calls: "9 Joint Calls", focus: "CardioCare 20 Refresher" },
      { name: "Divya Rao (MR - Whitefield)", days: "2 Days", calls: "16 Joint Calls", focus: "Resp-Clear Objections" }
    ],
    rubric: [
      { label: "Scientific Knowledge & Brand Positioning", score: "7.1 / 10", pct: "71%" },
      { label: "Objection Handling & Doctor Feedback", score: "6.4 / 10", pct: "64%" },
      { label: "Closing & Sample Handover Discipline", score: "6.9 / 10", pct: "69%" },
      { label: "RCPA Audit & Chemist Stockist Cross-Check", score: "6.2 / 10", pct: "62%" }
    ]
  },
  {
    id: "asm-south-02", name: "Balasubramanian", initials: "BS", code: "ASM-SOUTH-02", hq: "Chennai Central", zone: "South Zone",
    repsCovered: "10 Reps Covered", hqAreas: "T. Nagar, Anna Nagar, Adyar",
    jointDaysActual: 12, jointDaysTarget: 12, jointDaysPct: "100%", jointDaysBadgeClass: "bg-status-success-bg text-status-success",
    jointCalls: "126 Calls", callConv: "75.8%", callConvClass: "text-text-primary",
    coachingIndex: "8.3", coachingIndexClass: "text-text-secondary",
    auditStatus: "Compliant", auditStatusClass: "bg-status-success-bg text-status-success border border-status-success-bg",
    actionLabel: "Inspect", actionClass: "bg-surface-subtle text-text-secondary hover:bg-slate-200",
    rowClass: "hover:bg-surface-subtle/80", avatarClass: "bg-surface-subtle text-text-secondary", flagged: false,
    reportsTo: "Lakshmi Iyer (ZSM - South)", title: "Area Sales Manager • Chennai Central",
    mentorship: [
      { name: "Vignesh Kumar (MR - T. Nagar)", days: "4 Days", calls: "34 Joint Calls", focus: "GlycoZiv XR Conversion" },
      { name: "Meera Shankar (MR - Anna Nagar)", days: "4 Days", calls: "32 Joint Calls", focus: "ZiviCal D3 Uptake" },
      { name: "Arjun Pillai (MR - Adyar)", days: "4 Days", calls: "30 Joint Calls", focus: "CardioCare 20 Launch" }
    ],
    rubric: [
      { label: "Scientific Knowledge & Brand Positioning", score: "8.6 / 10", pct: "86%" },
      { label: "Objection Handling & Doctor Feedback", score: "8.2 / 10", pct: "82%" },
      { label: "Closing & Sample Handover Discipline", score: "8.4 / 10", pct: "84%" },
      { label: "RCPA Audit & Chemist Stockist Cross-Check", score: "7.9 / 10", pct: "79%" }
    ]
  }
];

const PAGE_SIZE = 5;

export function AdminRepVsManagerDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<"all" | Supervisor["zone"]>("all");
  const [perfFilter, setPerfFilter] = useState<"all" | "achieved" | "ontrack" | "lagging">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["asm-west-01"]));
  const [dossierId, setDossierId] = useState("asm-west-01");
  const [activeTab, setActiveTab] = useState(0);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ asmId: "asm-west-01", date: "" });
  const [territory, setTerritory] = useState("All Territories (Pan-India HQ)");
  const [period, setPeriod] = useState("Current Month (Sep 2026 Active)");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return supervisors.filter((s) => {
      if (zoneFilter !== "all" && s.zone !== zoneFilter) return false;
      if (perfFilter === "achieved" && s.jointDaysActual < s.jointDaysTarget) return false;
      if (perfFilter === "ontrack" && !(s.jointDaysActual >= 10 && s.jointDaysActual <= 11)) return false;
      if (perfFilter === "lagging" && s.jointDaysActual >= 10) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.hq.toLowerCase().includes(q) ||
        s.mentorship.some((m) => m.name.toLowerCase().includes(q))
      );
    });
  }, [supervisors, search, zoneFilter, perfFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const dossier = supervisors.find((s) => s.id === dossierId) ?? supervisors[0];

  function resetFilters() {
    setSearch("");
    setZoneFilter("all");
    setPerfFilter("all");
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "joint-field-work-audit.csv",
      filtered.map((s) => ({
        "ASM": s.name,
        "Code": s.code,
        "HQ": s.hq,
        "Zone": s.zone,
        "Reps Covered": s.repsCovered,
        "Joint Days (Act/Tgt)": `${s.jointDaysActual} / ${s.jointDaysTarget}`,
        "Joint Calls": s.jointCalls,
        "Call Conv %": s.callConv,
        "Coaching Index": s.coachingIndex,
        "Audit Status": s.auditStatus
      }))
    );
  }

  function handleScheduleSubmit() {
    if (!scheduleForm.date.trim()) return;
    const asm = supervisors.find((s) => s.id === scheduleForm.asmId);
    setShowSchedule(false);
    setDetail({ title: "Ride Scheduled", body: `Mandatory supervisory ride for ${asm?.name ?? "the selected ASM"} scheduled on ${scheduleForm.date}. Session-only confirmation — there is no calendar backend wired up yet.` });
    setScheduleForm({ asmId: "asm-west-01", date: "" });
  }

  function handleDownloadDossier() {
    downloadCsv(`joint-field-audit-${dossier.code}.csv`, [{
      "ASM": dossier.name, "Code": dossier.code, "HQ": dossier.hq,
      "Joint Days (Act/Tgt)": `${dossier.jointDaysActual} / ${dossier.jointDaysTarget}`,
      "Joint Calls": dossier.jointCalls, "Call Conv %": dossier.callConv, "Coaching Index": dossier.coachingIndex,
      "Audit Status": dossier.auditStatus, "Reports To": dossier.reportsTo
    }]);
  }

  function handleScheduleRideAlong() {
    setDetail({ title: "Ride-Along Requested", body: `A ride-along with the ZSM has been requested for ${dossier.name} (${dossier.reportsTo}). Session-only confirmation — there is no calendar backend wired up yet.` });
  }

  return (
    <div className="flex flex-col w-full space-y-6">

{/* Top Header Navigation Bar */}
<header className="sticky top-0 z-10 bg-surface-card/95 backdrop-blur-md border-b border-border-subtle px-6 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
{/* Breadcrumbs */}
<div className="flex items-center gap-2 text-xs text-text-secondary font-medium min-w-0 truncate">
<span>Platform</span>
<span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
<span>Analytics Suite</span>
<span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
<span className="text-[#b43403] font-semibold truncate">Rep vs Manager (Joint Field Dynamics)</span>
</div>
{/* Global Header Controls */}
<div className="flex items-center gap-3 flex-shrink-0">
<div className="relative">
<select className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={territory} onChange={(e) => setTerritory(e.target.value)}>
<option>All Territories (Pan-India HQ)</option>
<option>North Division (Delhi &amp; NCR)</option>
<option>West Zone (Mumbai HQ)</option>
<option>South Hub (Bengaluru HQ)</option>
<option>Eastern Coast (Kolkata)</option>
</select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<div className="relative">
<select className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={period} onChange={(e) => setPeriod(e.target.value)}>
<option>Current Month (Sep 2026 Active)</option>
<option>August 2026 (Consolidated)</option>
<option>Q2 FY27 Overview</option>
<option>YTD Performance</option>
</select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<button className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs" title="Refresh Telemetry" type="button" onClick={() => setDetail({ title: "Telemetry Refreshed", body: "GPS beat validation and joint call telemetry sync has been queued for this session. There is no live ERP sync backend yet." })}>
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
<button className="relative w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs" title="Notifications" type="button" onClick={() => setDetail({ title: "Notifications", body: "6 discrepancy/deviation flags open. 4 ASMs pending field-day quota this month, including Srinivas Murthy (8/12 days)." })}>
<span className="material-symbols-outlined text-[18px]">notifications</span>
<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b43403] ring-2 ring-white"></span>
</button>
<div className="h-5 w-px bg-slate-200"></div>
<div className="flex items-center gap-2 pl-1">
<div className="w-8 h-8 rounded-full bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-xs shadow-xs">
              AZ
            </div>
<div className="hidden sm:flex flex-col text-left">
<span className="text-xs font-semibold text-text-primary leading-tight">Admin Zivira</span>
<span className="text-[10px] text-text-muted">Corporate HQ</span>
</div>
</div>
</div>
</header>
{/* Scrollable Inner Page Content */}
<div className="p-6 space-y-5">
{/* Page Header & Action Bar */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-5 shadow-sm">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
<div className="space-y-1.5">
<h1 className="text-xl lg:text-2xl font-display font-bold text-text-primary tracking-tight">
                Rep vs Manager &amp; Joint Field Work Audit
              </h1>
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#b43403] border border-orange-200 text-xs font-bold tracking-wide uppercase">
                  • Joint Work Audit: Sep 2026
                </span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-secondary text-xs font-medium">
                  Manager Quota: 12 Days/Mo
                </span>
<span className="px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-xs font-medium flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  GPS Beat Validation: 98.2%
                </span>
</div>
</div>
<div className="flex flex-wrap items-center gap-2.5">
<button className="h-9 px-3.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50" type="button" onClick={handleExport} disabled={filtered.length === 0}>
<span className="material-symbols-outlined text-[17px] text-text-secondary">file_download</span>
<span>Export Joint Field Work Audit (CSV/PDF)</span>
</button>
<button className="h-9 px-4 rounded-lg bg-[#b43403] hover:bg-[#9a2c02] text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-orange-950/20 transition-all active:scale-[0.98]" type="button" onClick={() => setShowSchedule(true)}>
<span className="material-symbols-outlined text-[18px]">co_present</span>
<span>Schedule Mandatory Supervisory Rides</span>
</button>
</div>
</div>
</div>
{/* 4-Column Executive Pulse KPI Metric Cards */}

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
{/* Card 1: Joint Call Ratio */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Joint Call Ratio</span>
<div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">groups</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">28.4%</span>
<span className="text-xs font-semibold text-emerald-600 flex items-center">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +2.1% MoM
                </span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "71%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span className="font-medium">Target: ≥25.0%</span>
<span className="text-text-muted">1,098 of 3,864 Calls</span>
</div>
</div>
{/* Card 2: Field Days Adherence */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Field Days Adherence</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">verified</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">91.8%</span>
<span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">schedule</span> 4 Pending
                </span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "91.8%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Quota: 12 Days/ASM</span>
<span className="text-status-success font-semibold">34 of 38 ASMs Met</span>
</div>
</div>
{/* Card 3: Coaching Velocity */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Coaching Velocity</span>
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">rate_review</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">482</span>
<span className="text-xs font-semibold text-emerald-600 flex items-center">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +15% vs Aug
                </span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-blue-600 h-full rounded-full" style={{ "width": "84%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Avg Score: 8.4 / 10</span>
<span className="text-text-muted">Digital Rubrics</span>
</div>
</div>
{/* Card 4: Rx Lift Multiplier */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Rx Lift Multiplier</span>
<div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">trending_up</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">1.42x</span>
<span className="text-xs font-semibold text-emerald-600">
                  +42% Volume
                </span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "68%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Joint vs Solo Calls</span>
<span className="text-text-muted font-medium">Chemist RCPA</span>
</div>
</div>
</div>
{/* Sub-Navigation Pill Tabs */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 px-4 py-1.5 shadow-sm flex items-center justify-between overflow-x-auto">
<div className="flex items-center gap-2 shrink-0">
{[
  { label: "Joint Field Work Matrix", icon: "badge", badge: "38 ASMs", badgeClass: "bg-[#b43403] text-white" },
  { label: "Ride-Along Calendar & Beat Sync", icon: "calendar_today" },
  { label: "Coaching & Detailing Scorecards", icon: "fact_check", badge: "428", badgeClass: "bg-surface-subtle text-text-secondary" },
  { label: "Discrepancy & Deviation Log", icon: "fmd_bad", badge: "6 Flags", badgeClass: "bg-rose-50 text-rose-600 border border-rose-200" }
].map((tab, i) => (
  <button
    key={tab.label}
    className={i === activeTab
      ? "relative py-2.5 px-3 text-xs font-bold text-[#b43403] flex items-center gap-2 border-b-2 border-[#b43403]"
      : "py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors"}
    type="button"
    onClick={() => {
      setActiveTab(i);
      if (i !== 0) setDetail({ title: tab.label, body: "This view isn't built out yet — showing the Joint Field Work Matrix below in the meantime." });
    }}
  >
    <span className={i === activeTab ? "material-symbols-outlined text-[17px]" : "material-symbols-outlined text-[17px] text-text-muted"}>{tab.icon}</span>
    <span>{tab.label}</span>
    {tab.badge && <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${tab.badgeClass}`}>{tab.badge}</span>}
  </button>
))}
</div>
<div className="hidden xl:flex items-center gap-1.5 text-xs text-text-muted pl-4">
<span className="material-symbols-outlined text-[15px]">sync</span>
<span>Synced with ERP 12m ago</span>
</div>
</div>
{/* DUAL-PANE INTERACTIVE CONTENT */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
{/* LEFT COLUMN: Supervisory Roster Table (Col 8) */}
<div className="lg:col-span-8 flex flex-col space-y-4">
{/* Filters Strip */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
<div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-text-muted focus-within:border-[#b43403] focus-within:ring-1 focus-within:ring-[#b43403]/20 transition-all">
<span className="material-symbols-outlined text-[17px]">search</span>
<input className="w-full text-xs bg-transparent text-text-secondary placeholder-slate-400 focus:outline-none border-none p-0" placeholder="Search ASM, MR, Headquarters..." type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
</div>
<div className="flex items-center gap-2">
<select className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer" value={zoneFilter} onChange={(e) => { setZoneFilter(e.target.value as typeof zoneFilter); setPage(1); }}>
<option value="all">All Zones &amp; Divisions</option>
<option value="West Zone">West Zone (Mumbai HQ)</option>
<option value="North Zone">North Zone (Delhi HQ)</option>
<option value="East Zone">East Zone (Kolkata HQ)</option>
<option value="South Zone">South Zone (Bengaluru HQ)</option>
</select>
<select className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer" value={perfFilter} onChange={(e) => { setPerfFilter(e.target.value as typeof perfFilter); setPage(1); }}>
<option value="all">All Performance</option>
<option value="achieved">Quota Achieved (≥12 Days)</option>
<option value="ontrack">On Track (10-11 Days)</option>
<option value="lagging">Lagging (&lt;10 Days)</option>
</select>
<button className="h-8 w-8 rounded-lg bg-surface-subtle border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors" title="Reset Filters" type="button" onClick={resetFilters}>
<span className="material-symbols-outlined text-[17px]">restart_alt</span>
</button>
</div>
</div>
{/* Table Card */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left text-xs text-text-secondary">
<thead className="bg-surface-subtle/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-text-secondary">
<tr>
<th className="py-3 px-3 w-8 text-center">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox" checked={pageRows.length > 0 && pageRows.every((s) => selectedIds.has(s.id))} onChange={() => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    const allSelected = pageRows.every((s) => next.has(s.id));
    pageRows.forEach((s) => (allSelected ? next.delete(s.id) : next.add(s.id)));
    return next;
  });
}}/>
</th>
<th className="py-3 px-3">ASM / Supervisor &amp; Territory</th>
<th className="py-3 px-3">HQ &amp; Assigned MRs</th>
<th className="py-3 px-3">Joint Days (Act/Tgt)</th>
<th className="py-3 px-3">Joint Calls</th>
<th className="py-3 px-3">Call Conv %</th>
<th className="py-3 px-3">Coaching Index</th>
<th className="py-3 px-3">Audit Status</th>
<th className="py-3 px-3 text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{pageRows.length === 0 && (
  <tr><td colSpan={9} className="py-10 px-3 text-center text-text-muted">No supervisors match the current search/filters.</td></tr>
)}
{pageRows.map((s) => (
<tr key={s.id} className={`${dossierId === s.id ? s.rowClass : "hover:bg-surface-subtle/80"} transition-colors cursor-pointer`} onClick={() => setDossierId(s.id)}>
<td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
<input checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className={`w-8 h-8 rounded-full ${s.avatarClass} flex items-center justify-center font-display font-bold text-xs shrink-0 ${dossierId === s.id ? "shadow-xs" : ""}`}>
                            {s.initials}
                          </div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1.5">
<span>{s.name}</span>
{dossierId === s.id && <span className="w-1.5 h-1.5 rounded-full bg-[#b43403]" title="Active Selection"></span>}
{s.flagged && <span className="material-symbols-outlined text-[14px] text-rose-600" title="Field Deficit Warning">warning</span>}
</div>
<span className="text-[11px] text-text-muted">{s.code} • {s.hq}</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-medium text-text-primary">{s.repsCovered}</span>
<span className="text-[10px] text-text-muted">{s.hqAreas}</span>
</div>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1.5">
<span className={`font-bold ${s.flagged ? "text-rose-600" : "text-text-primary"}`}>{s.jointDaysActual} / {s.jointDaysTarget}</span>
<span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${s.jointDaysBadgeClass}`}>{s.jointDaysPct}</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">{s.jointCalls}</td>
<td className={`py-3 px-3 font-semibold ${s.callConvClass}`}>{s.callConv}</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1">
<span className={`font-bold ${s.coachingIndexClass}`}>{s.coachingIndex}</span>
<span className="text-[10px] text-text-muted">/10</span>
</div>
</td>
<td className="py-3 px-3">
<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.auditStatusClass}`}>
                          {s.auditStatus}
                        </span>
</td>
<td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
<button className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${s.actionClass}`} type="button" onClick={() => setDossierId(s.id)}>
                          {s.actionLabel}
                        </button>
</td>
</tr>
))}
</tbody>
</table>
</div>
{/* Pagination Footer */}
<div className="p-3 bg-surface-subtle/80 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
<span>{filtered.length === 0 ? "No matching supervisors" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Field Supervisors`}</span>
<div className="flex items-center gap-1">
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card text-text-muted hover:text-text-secondary flex items-center justify-center transition-colors disabled:opacity-40" type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} className={n === safePage ? "w-7 h-7 rounded bg-[#b43403] text-white font-bold text-xs flex items-center justify-center shadow-xs" : "w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center justify-center"} type="button" onClick={() => setPage(n)}>
                    {n}
                  </button>
))}
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors disabled:opacity-40" type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
{/* RIGHT COLUMN: Selected Supervisor Dossier (Col 4) */}
<div className="lg:col-span-4 flex flex-col space-y-4">
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-5 shadow-sm space-y-4 relative">
{/* Inspector Header */}
<div className="flex items-center justify-between border-b border-slate-100 pb-3">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Supervisor Profile</span>
<div className="font-display font-bold text-base text-text-primary">#{dossier.code}</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#b43403] border border-orange-200 text-xs font-bold flex items-center gap-1 shadow-xs">
<span className="material-symbols-outlined text-[14px]">military_tech</span> {dossier.flagged ? "Needs Support" : "Top Mentor"}
                </span>
</div>
{/* Manager Bio Card */}
<div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle/60 flex items-center gap-3">
<div className={`w-12 h-12 rounded-xl ${dossier.avatarClass} flex items-center justify-center font-display font-bold text-base shadow-sm shadow-orange-950/20 shrink-0`}>
                  {dossier.initials}
                </div>
<div className="flex flex-col min-w-0">
<span className="font-display font-bold text-sm text-text-primary truncate">{dossier.name}</span>
<span className="text-xs text-text-secondary truncate">{dossier.title}</span>
<span className="text-[11px] text-text-muted truncate">Reports to: {dossier.reportsTo}</span>
</div>
</div>
{/* Field Adherence Circular Gauge */}
<div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-50/70 to-slate-50 border border-orange-200/60 flex items-center justify-between">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Field Adherence</span>
<div className="font-display font-bold text-xl text-text-primary">{dossier.jointDaysActual} Days</div>
<span className="text-xs text-text-secondary">Target: {dossier.jointDaysTarget} Days ({dossier.jointDaysPct})</span>
</div>
<div className="w-14 h-14 relative flex items-center justify-center shrink-0">
<svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-orange-200/70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-[#b43403]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${Math.min(100, (dossier.jointDaysActual / dossier.jointDaysTarget) * 100)}, 100`} strokeWidth="3.5"></path>
</svg>
<span className="absolute font-display font-bold text-xs text-[#b43403]">{dossier.jointDaysPct}</span>
</div>
</div>
{/* Rep Mentorship Split for September */}
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-display font-bold text-xs text-text-primary">Rep Mentorship Split (Sep)</span>
<span className="text-[11px] text-text-muted">{dossier.mentorship.length} of {dossier.repsCovered.split(" ")[0]} Reps shown</span>
</div>
<div className="space-y-2">
{dossier.mentorship.map((m) => (
<div key={m.name} className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex flex-col space-y-1 hover:border-border-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-semibold text-xs text-text-primary">{m.name}</span>
<span className="px-2 py-0.5 rounded bg-surface-card text-[#b43403] font-bold text-[11px] border border-orange-200 shadow-xs">{m.days}</span>
</div>
<div className="flex items-center justify-between text-[11px] text-text-secondary">
<span>{m.calls}</span>
<span className="text-[#b43403] font-medium">Focus: {m.focus}</span>
</div>
</div>
))}
</div>
</div>
{/* Coaching Scorecard Rubric Breakdown */}
<div className="space-y-2.5 pt-1">
<span className="font-display font-bold text-xs text-text-primary">Coaching Scorecard Rubric</span>
<div className="space-y-2 text-xs">
{dossier.rubric.map((r) => (
<div key={r.label}>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">{r.label}</span>
<span className="font-bold text-text-primary">{r.score}</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ width: r.pct }}></div>
</div>
</div>
))}
</div>
</div>
{/* Action CTAs */}
<div className="flex flex-col space-y-2 pt-2">
<button className="w-full h-9 rounded-lg bg-[#b43403] text-white text-xs font-semibold hover:bg-[#9a2c02] transition-colors flex items-center justify-center gap-2 shadow-xs" type="button" onClick={handleDownloadDossier}>
<span className="material-symbols-outlined text-[17px]">download</span>
<span>Download Joint Field Audit Report</span>
</button>
<button className="w-full h-9 rounded-lg border border-border-subtle bg-surface-subtle text-text-secondary text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2" type="button" onClick={handleScheduleRideAlong}>
<span className="material-symbols-outlined text-[17px] text-text-secondary">event_repeat</span>
<span>Schedule Ride-Along with ZSM</span>
</button>
</div>
</div>
</div>
</div>
{/* 3. BOTTOM POLICY & SOP OPERATIONAL BANNER */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-3.5">
<div className="w-10 h-10 rounded-full bg-orange-50 text-[#b43403] flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">policy</span>
</div>
<div className="flex flex-col">
<span className="text-xs font-bold text-text-primary">
                Standard Operating Procedure • Supervisory Joint Field Norms
              </span>
<span className="text-xs text-text-secondary">
                ASMs must spend minimum 12 working days/month in direct field accompaniment across at least 80% of assigned representatives.
              </span>
</div>
</div>
<button className="px-3.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-[#b43403] hover:bg-orange-100 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1" type="button" onClick={() => setDetail({ title: "Joint Field Guidelines", body: "ASMs must accompany at least 80% of assigned representatives, spend a minimum of 12 working days/month in direct field accompaniment, and complete a coaching scorecard after each joint call." })}>
<span>View Joint Field Guidelines</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</div>
</div>

    {showSchedule && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSchedule(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Schedule Mandatory Supervisory Ride</h3>
          <div className="space-y-3">
            <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={scheduleForm.asmId} onChange={(e) => setScheduleForm((s) => ({ ...s, asmId: e.target.value }))}>
              {supervisors.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.code})</option>))}
            </select>
            <input type="date" className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={scheduleForm.date} onChange={(e) => setScheduleForm((s) => ({ ...s, date: e.target.value }))} />
          </div>
          <p className="text-[11px] text-text-muted">Session-only confirmation — there is no calendar/scheduling backend yet, so this does not persist after a page reload.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowSchedule(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a2c02] disabled:opacity-50" disabled={!scheduleForm.date.trim()} onClick={handleScheduleSubmit}>Schedule Ride</button>
          </div>
        </div>
      </div>
    )}

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
