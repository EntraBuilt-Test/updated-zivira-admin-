"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component: none of its
// buttons/selects/inputs (Export, Add HCP, search, the 4 dropdown filters,
// Reset, the 4 view-switcher tabs, per-row View Call Details/Escalate,
// Dispatch Gap Reminder, Reassign Beat/Adjust Route, View All/Notify Zonal
// Managers, and pagination) did anything when clicked. The demo KPI numbers
// at the top are left as-is (no backend collection exists yet for doctor
// coverage), but the roster table is now real local state: search, all four
// dropdowns, the view tabs and Reset actually filter it, Export downloads
// exactly what's on screen as CSV, Add HCP adds a real row to the table
// (kept for this session only), and the pagination reflects the real
// filtered count.

type CoverageStatus = "Target Met" | "On Track" | "Under-visited" | "Zero-Visit Gap";
type Tier = "Tier A+" | "Tier A" | "Tier B";

type DoctorRow = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  hospital: string;
  tier: Tier;
  tierFrequencyLabel: string;
  repName: string;
  repInitials: string;
  territory: string;
  plannedVisits: number;
  actualVisits: number;
  lastVisit: string;
  visitNote: string;
  products: string[];
  status: CoverageStatus;
};

const initialDoctors: DoctorRow[] = [
  {
    id: "doc1", name: "Dr. Ananya Mukherjee", initials: "AM", specialty: "Cardiology",
    hospital: "Fortis Hospital, Kolkata", tier: "Tier A+", tierFrequencyLabel: "Tier A+ (4/mo)",
    repName: "Subhashish Mitra", repInitials: "SM", territory: "Kolkata East & Salt Lake",
    plannedVisits: 4, actualVisits: 4, lastVisit: "08 Sep 2026", visitNote: "DCR #84920 (Verified)",
    products: ["CardioCare 20", "ZiviCal D3"], status: "Target Met"
  },
  {
    id: "doc2", name: "Dr. Vikram Malhotra", initials: "VM", specialty: "Endocrinology & Diabetology",
    hospital: "Max Super Speciality, Delhi", tier: "Tier A+", tierFrequencyLabel: "Tier A+ (4/mo)",
    repName: "Amit Duggal", repInitials: "AD", territory: "Delhi NCR South",
    plannedVisits: 4, actualVisits: 3, lastVisit: "11 Sep 2026", visitNote: "DCR #85102 (GPS Tagged)",
    products: ["Glucoflow M", "InsuliMax"], status: "On Track"
  },
  {
    id: "doc3", name: "Dr. Arvind Rao", initials: "AR", specialty: "Pediatrics",
    hospital: "Manipal Hospital, Bengaluru", tier: "Tier A", tierFrequencyLabel: "Tier A (2/mo)",
    repName: "Vikas Kulkarni", repInitials: "VK", territory: "Bengaluru Central Hub",
    plannedVisits: 2, actualVisits: 1, lastVisit: "02 Sep 2026", visitNote: "12 days since visit",
    products: ["Pediabest Drops", "Fe-Syrup"], status: "Under-visited"
  },
  {
    id: "doc4", name: "Dr. Sangeeta Kulkarni", initials: "SK", specialty: "Pulmonology",
    hospital: "Breach Candy Hospital, Mumbai", tier: "Tier A+", tierFrequencyLabel: "Tier A+ (4/mo)",
    repName: "Rahul Sharma", repInitials: "RS", territory: "Mumbai South Metro",
    plannedVisits: 4, actualVisits: 0, lastVisit: "No visits in 32 days", visitNote: "Exceeded 14d SLA gap",
    products: [], status: "Zero-Visit Gap"
  },
  {
    id: "doc5", name: "Dr. Rajesh Nair", initials: "RN", specialty: "Neurology",
    hospital: "Apollo Hospitals, Chennai", tier: "Tier B", tierFrequencyLabel: "Tier B (1/mo)",
    repName: "Karthik Nathan", repInitials: "KN", territory: "Chennai Central Hub",
    plannedVisits: 1, actualVisits: 1, lastVisit: "07 Sep 2026", visitNote: "DCR #84811 (Verified)",
    products: ["NeuroZiv Plus"], status: "Target Met"
  }
];

const TERRITORIES = ["All Territories (Pan-India)", "Mumbai South Metro", "Delhi NCR South", "Bengaluru Central Hub", "Kolkata East & Salt Lake", "Chennai Central Hub"];
const SPECIALTIES = ["All Specialties (Cardio, Diabeto, Pedia...)", "Cardiology", "Endocrinology & Diabetology", "Pediatrics", "Pulmonology", "Neurology"];
const TIERS: { label: string; value: "all" | Tier }[] = [
  { label: "All Tiers (Tier A+, A, B)", value: "all" },
  { label: "Tier A+ (Core Focus - 4 calls/mo)", value: "Tier A+" },
  { label: "Tier A (Priority - 2 calls/mo)", value: "Tier A" },
  { label: "Tier B (Standard - 1 call/mo)", value: "Tier B" }
];
const STATUSES: { label: string; value: "all" | CoverageStatus }[] = [
  { label: "All Coverage Status", value: "all" },
  { label: "Target Met (100%)", value: "Target Met" },
  { label: "On Track (>75%)", value: "On Track" },
  { label: "Under-visited (<50%)", value: "Under-visited" },
  { label: "Zero-Visit Gap (0%)", value: "Zero-Visit Gap" }
];
const VIEW_TABS = [
  { key: "master", label: "Doctor Coverage Master List" },
  { key: "territory", label: "Territory & Zone Coverage Matrix" },
  { key: "specialty", label: "Specialty-wise Adherence & Call Frequency" },
  { key: "unvisited", label: "Unvisited / At-Risk Doctors" }
] as const;

const PAGE_SIZE = 5;

const statusPillClass: Record<CoverageStatus, string> = {
  "Target Met": "bg-emerald-100 text-emerald-800 border border-status-success-bg",
  "On Track": "bg-blue-100 text-blue-800 border border-status-info-bg",
  "Under-visited": "bg-amber-100 text-amber-800 border border-status-warning-bg",
  "Zero-Visit Gap": "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
};

export function AdminDoctorCoverageDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [doctors, setDoctors] = useState<DoctorRow[]>(initialDoctors);
  const [search, setSearch] = useState("");
  const [territory, setTerritory] = useState(TERRITORIES[0]!);
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]!);
  const [tierFilter, setTierFilter] = useState<"all" | Tier>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CoverageStatus>("all");
  const [activeView, setActiveView] = useState<(typeof VIEW_TABS)[number]["key"]>("master");
  const [page, setPage] = useState(1);
  const [showAddHcp, setShowAddHcp] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [newDoctor, setNewDoctor] = useState({ name: "", specialty: "", hospital: "", territory: "", repName: "" });

  const effectiveStatusFilter: "all" | CoverageStatus = activeView === "unvisited" ? "Zero-Visit Gap" : statusFilter;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((d) => {
      if (territory !== TERRITORIES[0] && d.territory !== territory) return false;
      if (specialty !== SPECIALTIES[0] && d.specialty !== specialty) return false;
      if (tierFilter !== "all" && d.tier !== tierFilter) return false;
      if (effectiveStatusFilter !== "all" && d.status !== effectiveStatusFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        d.repName.toLowerCase().includes(q)
      );
    });
  }, [doctors, search, territory, specialty, tierFilter, effectiveStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const zeroVisitCount = doctors.filter((d) => d.status === "Zero-Visit Gap").length;

  function resetFilters() {
    setSearch("");
    setTerritory(TERRITORIES[0]!);
    setSpecialty(SPECIALTIES[0]!);
    setTierFilter("all");
    setStatusFilter("all");
    setActiveView("master");
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "doctor-coverage-roster.csv",
      filtered.map((d) => ({
        "Doctor": d.name,
        "Specialty": d.specialty,
        "Hospital": d.hospital,
        "Tier": d.tierFrequencyLabel,
        "Field Rep": d.repName,
        "Territory": d.territory,
        "Planned Visits": d.plannedVisits,
        "Actual Visits": d.actualVisits,
        "Last Visit": d.lastVisit,
        "Status": d.status
      }))
    );
  }

  function handleAddHcp() {
    if (!newDoctor.name.trim()) return;
    const initials = newDoctor.name.replace(/^Dr\.?\s*/i, "").split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "DR";
    setDoctors((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        name: newDoctor.name.trim(),
        initials,
        specialty: newDoctor.specialty.trim() || "General Medicine",
        hospital: newDoctor.hospital.trim() || "—",
        tier: "Tier B",
        tierFrequencyLabel: "Tier B (1/mo)",
        repName: newDoctor.repName.trim() || "Unassigned",
        repInitials: (newDoctor.repName.trim().slice(0, 2) || "--").toUpperCase(),
        territory: newDoctor.territory.trim() || "Unassigned Territory",
        plannedVisits: 1,
        actualVisits: 0,
        lastVisit: "Not yet visited",
        visitNote: "Newly added HCP",
        products: [],
        status: "Under-visited"
      }
    ]);
    setShowAddHcp(false);
    setNewDoctor({ name: "", specialty: "", hospital: "", territory: "", repName: "" });
    setPage(totalPages + 1);
  }

  return (
    <div className="flex flex-col w-full space-y-6">

{/* BEGIN: PageHeaderAndActions */}
<section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-purpose="page-title-actions">
<div>
<div className="inline-flex items-center gap-2 mb-1">
<span className="w-2 h-2 rounded-full bg-brand-corporate"></span>
<span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-corporate">Physician Network &amp; Call Frequency Compliance</span>
</div>
<h1 className="text-2xl font-bold text-text-primary tracking-tight">Doctor Coverage &amp; Territory Reach</h1>
<p className="text-xs text-text-secondary mt-1 max-w-3xl">
            Monitor target physician call frequencies, core list adherence, coverage gaps across specialty tiers (Core A+, A, B), and field representative visit reach.
          </p>
</div>
<div className="flex items-center gap-2.5">
<button type="button" onClick={handleExport} disabled={filtered.length === 0} className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface-card border border-border-subtle rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-subtle shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
<svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="">Export Coverage Audit (CSV/XLS)</span>
</button>
<button type="button" onClick={() => setShowAddHcp(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-corporate hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="">Rebalance Doctor Allocation / Add HCP</span>
</button>
</div>
</section>
{/* END: PageHeaderAndActions */}

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4">
  <AdminTabGrid node={node} path={path} />
</div>

{/* BEGIN: ExecutiveKpiCards */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="executive-metrics-pulse">
{/* Metric Card 1 */}


<div className="bg-surface-card rounded-xl border border-border-subtle p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Registered Doctors</span>
<div className="mt-1 flex items-baseline gap-2">
<span className="text-2xl font-extrabold text-text-primary">14,820</span>
<span className="text-[11px] font-semibold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded border border-status-success-bg">+310 Qtr</span>
</div>
<p className="text-[11px] text-text-secondary mt-0.5">Pan-India listed across 48 territories</p>
</div>
<div className="w-9 h-9 rounded-lg bg-orange-50 text-brand-corporate flex items-center justify-center border border-orange-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
<span className="text-text-secondary">Master Verified Status</span>
<span className="font-bold text-text-primary">98.2% Certified</span>
</div>
</div>
{/* Metric Card 2 */}
<div className="bg-surface-card rounded-xl border border-border-subtle p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Monthly Reached (Coverage Rate)</span>
<div className="mt-1 flex items-baseline gap-2">
<span className="text-2xl font-extrabold text-brand-corporate">88.4%</span>
<span className="text-xs font-semibold text-text-secondary">13,101 / 14,820</span>
</div>
<p className="text-[11px] text-text-secondary mt-0.5">Visited at least once this cycle</p>
</div>
<div className="w-9 h-9 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center border border-emerald-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
{/* Tier Breakdown Bar */}
<div className="mt-3">
<div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden flex">
<div className="bg-brand-corporate h-full" style={{ "width": "45%" }} title="Tier A+: 96.2%"></div>
<div className="bg-amber-500 h-full" style={{ "width": "35%" }} title="Tier A: 89.1%"></div>
<div className="bg-slate-400 h-full" style={{ "width": "20%" }} title="Tier B: 78.4%"></div>
</div>
<div className="flex justify-between text-[10px] text-text-secondary font-medium mt-1.5">
<span className="">A+: 96.2%</span>
<span className="">A: 89.1%</span>
<span className="">B: 78.4%</span>
</div>
</div>
</div>
{/* Metric Card 3 */}
<div className="bg-surface-card rounded-xl border border-border-subtle p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Average Call Frequency</span>
<div className="mt-1 flex items-baseline gap-2">
<span className="text-2xl font-extrabold text-text-primary">2.4</span>
<span className="text-xs text-text-secondary">calls / doctor / mo</span>
</div>
<p className="text-[11px] text-text-secondary mt-0.5">Target standard: 2.5 benchmark</p>
</div>
<div className="w-9 h-9 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center border border-blue-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
<span className="text-text-secondary">Core A+ Frequency</span>
<span className="font-bold text-brand-corporate bg-orange-50 px-2 py-0.5 rounded border border-orange-200">3.8 / 4.0 Visits</span>
</div>
</div>
{/* Metric Card 4 */}
<div className="bg-surface-card rounded-xl border border-rose-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<div className="flex items-center gap-1.5">
<span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Zero-Visit Uncovered Doctors</span>
<span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
</div>
<div className="mt-1 flex items-baseline gap-2">
<span className="text-2xl font-extrabold text-rose-700">1,719</span>
<span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">11.6% GAP</span>
</div>
<p className="text-[11px] text-text-secondary mt-0.5">0 visits logged within current cycle</p>
</div>
<div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-[11px]">
<span className="font-bold text-rose-800">Requires Escalation</span>
<button type="button" className="font-bold text-brand-corporate hover:underline" onClick={() => setDetail({ title: "Dispatch Gap Reminder", body: `${zeroVisitCount} doctors currently have a zero-visit coverage gap this cycle. A reminder notification would be dispatched to their assigned field representatives and zonal managers.` })}>Dispatch Gap Reminder →</button>
</div>
</div>
</section>
{/* END: ExecutiveKpiCards */}
{/* BEGIN: NavigationTabsAndFilterBar */}
<section className="space-y-3" data-purpose="table-controls-and-tabs">
{/* View Switcher Tabs */}
<div className="flex items-center gap-2 border-b border-border-subtle overflow-x-auto">
{VIEW_TABS.map((tab) => {
  const active = activeView === tab.key;
  const count = tab.key === "master" ? doctors.length : tab.key === "unvisited" ? zeroVisitCount : undefined;
  return (
    <button
      key={tab.key}
      type="button"
      onClick={() => { setActiveView(tab.key); setPage(1); }}
      className={`px-4 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${active ? (tab.key === "unvisited" ? "text-rose-600 border-b-2 border-rose-600" : "text-brand-corporate border-b-2 border-brand-corporate") : (tab.key === "unvisited" ? "text-rose-600 hover:text-rose-700" : "text-text-secondary hover:text-text-primary")}`}
    >
      <span className="">{tab.label}</span>
      {count !== undefined && (
        <span className={`${tab.key === "unvisited" ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-brand-corporate"} px-2 py-0.5 rounded-full text-[10px] font-extrabold`}>{count}</span>
      )}
    </button>
  );
})}
</div>
{/* Filter Controls Row */}
<div className="bg-surface-card p-3 rounded-xl border border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
<div className="flex flex-wrap items-center gap-2 flex-1">
{/* Search Doctor Filter */}
<div className="relative min-w-[240px] flex-1">
<svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<input className="w-full pl-8 pr-3 py-1.5 bg-surface-subtle border border-border-subtle rounded-lg text-xs placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Filter by Doctor Name, Hospital, Clinic, MR..." type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
</div>
{/* Territory Dropdown */}
<select className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:ring-1 focus:ring-brand-500" value={territory} onChange={(e) => { setTerritory(e.target.value); setPage(1); }}>
{TERRITORIES.map((t) => <option key={t} value={t}>{t}</option>)}
</select>
{/* Specialty Dropdown */}
<select className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:ring-1 focus:ring-brand-500" value={specialty} onChange={(e) => { setSpecialty(e.target.value); setPage(1); }}>
{SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
</select>
{/* Tier Dropdown */}
<select className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:ring-1 focus:ring-brand-500" value={tierFilter} onChange={(e) => { setTierFilter(e.target.value as typeof tierFilter); setPage(1); }}>
{TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
</select>
{/* Visit Status Dropdown */}
<select className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:ring-1 focus:ring-brand-500" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }} disabled={activeView === "unvisited"}>
{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
</select>
</div>
<button type="button" onClick={resetFilters} className="px-3 py-1.5 text-text-secondary hover:text-text-primary font-semibold text-xs border border-border-subtle rounded-lg hover:bg-surface-subtle transition-colors">
            Reset Filters
          </button>
</div>
</section>
{/* END: NavigationTabsAndFilterBar */}
{/* BEGIN: DoctorCoverageRosterTable */}
<section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm" data-purpose="roster-table">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse text-xs">
<thead>
<tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
<th className="py-3 px-4 w-10 text-center">
<input className="rounded border-border-subtle text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
</th>
<th className="py-3 px-4">Doctor Profile &amp; Specialty</th>
<th className="py-3 px-4">Tier &amp; Classification</th>
<th className="py-3 px-4">Assigned Field Rep &amp; Zone</th>
<th className="py-3 px-4">Planned vs Actual Visits</th>
<th className="py-3 px-4">Last Visit &amp; DCR ID</th>
<th className="py-3 px-4">Detailed Products</th>
<th className="py-3 px-4 text-right">Coverage Status &amp; Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-200 font-normal text-text-secondary">
{pageRows.length === 0 && (
  <tr>
    <td colSpan={8} className="py-10 px-4 text-center text-text-muted text-xs">No doctors match the current search/filters.</td>
  </tr>
)}
{pageRows.map((d) => {
  const pct = d.plannedVisits > 0 ? Math.round((d.actualVisits / d.plannedVisits) * 100) : 0;
  const isZero = d.status === "Zero-Visit Gap";
  const barColor = d.status === "Target Met" ? "bg-emerald-500" : d.status === "On Track" ? "bg-blue-500" : d.status === "Under-visited" ? "bg-amber-500" : "bg-rose-500";
  const pctColor = d.status === "Target Met" ? "text-emerald-600" : d.status === "On Track" ? "text-blue-600" : d.status === "Under-visited" ? "text-amber-600" : "text-rose-600 font-bold";
  return (
    <tr key={d.id} className={isZero ? "hover:bg-rose-50/50 bg-rose-50/20 transition-colors" : "hover:bg-surface-subtle/80 transition-colors"}>
      <td className="py-3.5 px-4 text-center">
        <input className="rounded border-border-subtle text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${isZero ? "bg-rose-100 border-rose-200 text-rose-700" : "bg-slate-200 border-border-subtle text-text-secondary"}`}>{d.initials}</div>
          <div>
            <div className="font-bold text-text-primary leading-tight">{d.name}</div>
            <div className="text-[11px] text-text-secondary">{d.specialty} • {d.hospital}</div>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border ${d.tier === "Tier A+" ? "bg-orange-100 text-brand-corporate border-orange-200" : d.tier === "Tier A" ? "bg-blue-100 text-blue-800 border-status-info-bg" : "bg-surface-subtle text-text-secondary border-border-subtle"}`}>
          {d.tierFrequencyLabel}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${isZero ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"}`}>{d.repInitials}</span>
          <div>
            <div className="font-semibold text-text-primary">{d.repName}</div>
            <div className="text-[10px] text-text-muted">{d.territory}</div>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="w-36">
          <div className="flex justify-between text-[11px] font-semibold mb-1">
            <span className={pctColor}>{d.actualVisits} / {d.plannedVisits} visits</span>
            <span className={isZero ? "text-rose-600 font-bold" : "text-text-muted"}>{pct}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isZero ? "bg-rose-100" : "bg-surface-subtle"}`}>
            <div className={`h-full rounded-full ${barColor}`} style={{ "width": `${pct}%` }}></div>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className={isZero ? "font-bold text-rose-700" : "font-medium text-text-primary"}>{d.lastVisit}</div>
        <div className={`text-[10px] ${isZero ? "text-rose-500" : "text-text-muted"}`}>{d.visitNote}</div>
      </td>
      <td className="py-3.5 px-4">
        {d.products.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[170px]">
            {d.products.map((p) => <span key={p} className="px-1.5 py-0.5 bg-surface-subtle text-text-secondary rounded text-[10px]">{p}</span>)}
          </div>
        ) : (
          <div className="text-[11px] text-text-muted italic">No samples delivered</div>
        )}
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusPillClass[d.status]}`}>
            {d.status}
          </span>
          {isZero ? (
            <button
              type="button"
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold transition-colors"
              title="Trigger Alert"
              onClick={() => setDetail({ title: `Escalate — ${d.name}`, body: `${d.name} has had zero visits in the current cycle at ${d.hospital}. Escalating notifies ${d.repName} and the zonal manager for ${d.territory}.` })}
            >
              Escalate
            </button>
          ) : (
            <button
              type="button"
              className="p-1 hover:bg-slate-200 rounded text-text-muted hover:text-text-secondary transition-colors"
              title="View Call Details"
              onClick={() => setDetail({ title: `${d.name} — Call Details`, body: `${d.specialty} at ${d.hospital}. ${d.actualVisits} of ${d.plannedVisits} planned visits completed (${pct}%). Rep: ${d.repName} (${d.territory}). Last visit: ${d.lastVisit} — ${d.visitNote}.` })}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
})}
</tbody>
</table>
</div>
{/* Table Footer / Pagination */}
<div className="px-4 py-3 bg-surface-card border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
<div className="text-text-secondary">
            {filtered.length === 0 ? "No matching doctors" : (
              <>Showing <span className="font-bold text-text-primary">{(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-text-primary">{filtered.length}</span> Doctors • <span className="text-rose-600 font-semibold">{zeroVisitCount} doctors require beat intervention</span></>
            )}
</div>
<div className="flex items-center gap-1.5">
<button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="px-2 py-1 text-text-muted hover:text-text-secondary border border-border-subtle rounded bg-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} type="button" onClick={() => setPage(n)} className={`px-2.5 py-1 text-xs font-bold rounded ${n === safePage ? "bg-brand-corporate text-white" : "text-text-secondary hover:bg-surface-subtle font-semibold"}`}>{n}</button>
))}
<button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="px-2 py-1 text-text-secondary hover:text-text-primary border border-border-subtle rounded bg-surface-card hover:bg-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</div>
</section>
{/* END: DoctorCoverageRosterTable */}
{/* BEGIN: BottomSplitAnalytics */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-purpose="coverage-analytics-breakdown">
{/* Left: Coverage by Specialty (7 Cols) */}
<div className="lg:col-span-7 bg-surface-card rounded-xl border border-border-subtle p-5 shadow-sm">
<div className="flex items-center justify-between pb-3 border-b border-slate-100">
<div>
<h3 className="font-bold text-text-primary text-sm">Specialty Coverage &amp; Frequency Adherence</h3>
<p className="text-xs text-text-muted">Target frequency compliance across 5 core therapeutic divisions</p>
</div>
<span className="text-[11px] font-bold text-brand-corporate bg-orange-50 px-2 py-1 rounded border border-orange-200">Pan-India Target: 90%</span>
</div>
{/* Specialty Progress Bars */}
<div className="mt-4 space-y-3.5 text-xs">
{/* Specialty 1 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-text-secondary">Cardiology (3,420 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-text-muted font-medium">3,214 reached</span>
<span className="font-bold text-emerald-600">94.0%</span>
</div>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "94%" }}></div>
</div>
</div>
{/* Specialty 2 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-text-secondary">Diabetology &amp; Endocrinology (2,890 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-text-muted font-medium">2,630 reached</span>
<span className="font-bold text-emerald-600">91.0%</span>
</div>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "91%" }}></div>
</div>
</div>
{/* Specialty 3 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-text-secondary">Pulmonology (2,150 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-text-muted font-medium">1,892 reached</span>
<span className="font-bold text-brand-corporate">88.0%</span>
</div>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-brand-corporate h-full rounded-full" style={{ "width": "88%" }}></div>
</div>
</div>
{/* Specialty 4 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-text-secondary">General Medicine (3,980 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-text-muted font-medium">3,422 reached</span>
<span className="font-bold text-amber-600">86.0%</span>
</div>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-amber-500 h-full rounded-full" style={{ "width": "86%" }}></div>
</div>
</div>
{/* Specialty 5 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-text-secondary">Pediatrics (2,380 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-text-muted font-medium">1,951 reached</span>
<span className="font-bold text-amber-600">82.0%</span>
</div>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-amber-500 h-full rounded-full" style={{ "width": "82%" }}></div>
</div>
</div>
</div>
</div>
{/* Right: Territory Bottlenecks & Auto-Reassignment (5 Cols) */}
<div className="lg:col-span-5 bg-surface-card rounded-xl border border-border-subtle p-5 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between pb-3 border-b border-slate-100">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-rose-500"></span>
<h3 className="font-bold text-text-primary text-sm">Territory Coverage Bottlenecks</h3>
</div>
<span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Action Required
              </span>
</div>
<p className="text-xs text-text-secondary mt-2">
              Territories falling below the 75% coverage SLA due to vacant beats or representative transit constraints.
            </p>
<div className="mt-3.5 space-y-2.5">
{/* Bottleneck Item 1 */}
<div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-3 text-xs">
<div>
<div className="font-bold text-text-primary">North Delhi Zone 2</div>
<div className="text-[11px] text-rose-700 font-semibold mt-0.5">Coverage: 68% • 182 Unvisited HCPs</div>
<div className="text-[10px] text-text-secondary mt-0.5">Root cause: MR Vacancy (Beat 4 vacant for 18 days)</div>
</div>
<button type="button" className="px-2 py-1 bg-surface-card border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-[10px] font-bold shadow-xs whitespace-nowrap" onClick={() => setDetail({ title: "Reassign Beat — North Delhi Zone 2", body: "Coverage at 68% with 182 unvisited HCPs. Root cause: Beat 4 has been vacant for 18 days. Reassigning routes this beat to the nearest available field rep." })}>
                  Reassign Beat
                </button>
</div>
{/* Bottleneck Item 2 */}
<div className="p-2.5 rounded-lg border border-status-warning-bg bg-status-warning-bg/40 flex items-start justify-between gap-3 text-xs">
<div>
<div className="font-bold text-text-primary">Pune Outskirts &amp; PCMC</div>
<div className="text-[11px] text-status-warning font-semibold mt-0.5">Coverage: 72% • 114 Unvisited HCPs</div>
<div className="text-[10px] text-text-secondary mt-0.5">Root cause: Long Route Distances &amp; Low Call Ratio</div>
</div>
<button type="button" className="px-2 py-1 bg-surface-card border border-amber-300 text-status-warning hover:bg-status-warning-bg rounded text-[10px] font-bold shadow-xs whitespace-nowrap" onClick={() => setDetail({ title: "Adjust Route — Pune Outskirts & PCMC", body: "Coverage at 72% with 114 unvisited HCPs, driven by long route distances and a low call ratio. Adjusting the route would rebalance daily stops across nearby beats." })}>
                  Adjust Route
                </button>
</div>
</div>
</div>
<div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
<button type="button" className="text-xs font-bold text-brand-corporate hover:underline flex items-center gap-1" onClick={() => setDetail({ title: "All Bottleneck Beats", body: "6 territories are currently below the 75% coverage SLA: North Delhi Zone 2 (68%), Pune Outskirts & PCMC (72%), and 4 additional beats pending MR reassignment or route optimization." })}>
<span className="">View All 6 Bottleneck Beats</span>
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
<button type="button" className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm" onClick={() => setDetail({ title: "Notify Zonal Managers", body: "A notification about the current coverage bottlenecks (North Delhi Zone 2, Pune Outskirts & PCMC, and 4 other beats) would be sent to the relevant zonal managers." })}>
              Notify Zonal Managers
            </button>
</div>
</div>
</section>
{/* END: BottomSplitAnalytics */}

      {/* Add HCP modal */}
      {showAddHcp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddHcp(false)}>
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-text-primary text-lg">Rebalance Doctor Allocation / Add HCP</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Doctor name *" value={newDoctor.name} onChange={(e) => setNewDoctor((s) => ({ ...s, name: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Specialty" value={newDoctor.specialty} onChange={(e) => setNewDoctor((s) => ({ ...s, specialty: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Hospital / clinic" value={newDoctor.hospital} onChange={(e) => setNewDoctor((s) => ({ ...s, hospital: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Territory" value={newDoctor.territory} onChange={(e) => setNewDoctor((s) => ({ ...s, territory: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Assigned field rep" value={newDoctor.repName} onChange={(e) => setNewDoctor((s) => ({ ...s, repName: e.target.value }))} />
            </div>
            <p className="text-[11px] text-text-muted">Saved to this table for the current session. There is no doctor coverage database collection yet, so this does not persist after a page reload.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowAddHcp(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-corporate text-white hover:bg-brand-800 disabled:opacity-50" disabled={!newDoctor.name.trim()} onClick={handleAddHcp}>Add HCP</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail popup */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-text-primary text-base">{detail.title}</h3>
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
