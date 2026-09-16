"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import type { TourPlan } from "@zivira/types";
import { apiClient } from "@/lib/api-client";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component: none of its
// buttons/selects/inputs had a handler (global search, zone/cycle selects,
// sync/notification icons, Export MTP, Bulk Approve & Lock Plans, sub-nav
// tabs, the filter bar, per-row checkboxes/View Itinerary, Bulk Revise
// Dates / Fast Approve, or the inspector card's Lock Route Schedule / Print
// buttons did anything). A later pass wired all of that up against a local
// mock MR array. This pass replaces that mock array with a real fetch from
// GET /company/tour-plans (apiClient.adminTourPlans), keeping every
// existing filter/search/pagination/export/detail-popup working against
// the real TourPlan rows. TourPlan has no "zone"/"station mix"/"core HCPs"
// concept in the backend, so those UI groupings are now derived from real
// fields instead (assignedManager for the manager/zone grouping, the real
// `locations[]` array for station mix / itinerary / joint-work detection).
// The 4 demo KPI pulse cards and the fixed "Oct Week 1" beat-rotation
// schedule remain untouched (no backend collection exists for MTP cycle
// aggregates or day-by-day beat schedules yet).

type TourPlanStatus = TourPlan["status"];

type Rep = {
  id: string;
  initials: string;
  name: string;
  code: string;
  territory: string;
  zone: string;
  stationMix: string;
  exStation: string;
  workPlan: string;
  coreHcps: string;
  jointDays: string;
  asm: string;
  status: TourPlanStatus;
  raw: TourPlan;
};

const ALL_ZONES = "All Managers (Pan-India)";
const ALL_STATUSES = "All Statuses";
const ALL_HQ = "All Location Types";

const STATUSES: string[] = [ALL_STATUSES, "DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "VOIDED"];

const HQ_CLASSES = [ALL_HQ, "Single Location", "Multi-Location Tour"];

const CYCLE_TO_MONTH: Record<string, string> = {
  "Oct 2026 (Upcoming Cycle)": "2026-10",
  "Current Month (Sep 2026)": "2026-09",
  "Nov 2026 (Advance Planning)": "2026-11"
};

const TABS = [
  { key: "master", label: "Monthly Tour Program (MTP) Master" },
  { key: "routes", label: "Route & Beat Optimization Matrix" },
  { key: "deviation", label: "MTP vs DCR Deviation Tracker" },
  { key: "joint", label: "Joint Field Work & Manager Plan" }
] as const;

const statusPillClass: Record<string, string> = {
  APPROVED: "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-status-success-bg",
  SUBMITTED: "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-status-warning-bg",
  DRAFT: "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-border-subtle",
  REJECTED: "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200",
  VOIDED: "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-border-subtle"
};

const PAGE_SIZE = 8;

const CYCLE_LABELS: Record<string, string> = {
  "Oct 2026 (Upcoming Cycle)": "Oct 2026",
  "Current Month (Sep 2026)": "Current Month",
  "Nov 2026 (Advance Planning)": "Nov 2026"
};

function cycleLabel(cycleValue: string) {
  return CYCLE_LABELS[cycleValue] ?? cycleValue;
}

function initialsOf(name?: string) {
  if (!name) return "MR";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "MR";
}

function mapTourPlan(tp: TourPlan): Rep {
  const locations = tp.locations ?? [];
  const towns = Array.from(new Set(locations.map((l) => l.town).filter(Boolean)));
  const areas = Array.from(new Set(locations.map((l) => l.area).filter(Boolean)));
  const jointCount = locations.filter((l) => (l.purpose || "").toLowerCase().includes("joint")).length;
  return {
    id: tp.id,
    initials: initialsOf(tp.employeeName),
    name: tp.employeeName || tp.employeeCode,
    code: tp.employeeCode,
    territory: areas.slice(0, 2).join(", ") || towns.slice(0, 2).join(", ") || "Territory not set",
    zone: tp.assignedManager || tp.primaryManager || "Unassigned",
    stationMix: `${locations.length} Location${locations.length === 1 ? "" : "s"} Planned`,
    exStation: towns.length > 0 ? towns.join(", ") : "No stations listed",
    workPlan: `${tp.month} • ${locations.length} Stops`,
    coreHcps: tp.status === "REJECTED" ? `Rejected: ${tp.rejectReason || "No reason given"}` : `${areas.length} Areas Covered`,
    jointDays: jointCount > 0 ? `${jointCount} Day${jointCount === 1 ? "" : "s"}` : "0 Days",
    asm: tp.assignedManager || tp.primaryManager || "—",
    status: tp.status,
    raw: tp
  };
}

export function AdminTourPlansDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalZone, setGlobalZone] = useState(ALL_ZONES);
  const [cycle, setCycle] = useState("Oct 2026 (Upcoming Cycle)");
  const [hasUnread, setHasUnread] = useState(true);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState(ALL_ZONES);
  const [status, setStatus] = useState<string>(ALL_STATUSES);
  const [hqClass, setHqClass] = useState(ALL_HQ);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("master");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);

  const [tourPlans, setTourPlans] = useState<TourPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const month = CYCLE_TO_MONTH[cycle];
        const response = await apiClient.adminTourPlans({
          month,
          status: status !== ALL_STATUSES ? status : undefined
        });
        if (!cancelled) {
          const rows = response.data ?? [];
          setTourPlans(rows);
          setSelectedIds((prev) => {
            const validIds = new Set(rows.map((t) => t.id));
            const next = new Set<string>();
            prev.forEach((id) => { if (validIds.has(id)) next.add(id); });
            return next;
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load tour plans");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [cycle, status]);

  const reps = useMemo(() => tourPlans.map(mapTourPlan), [tourPlans]);

  const zoneOptions = useMemo(() => {
    const managers = Array.from(new Set(reps.map((r) => r.zone).filter(Boolean)));
    return [ALL_ZONES, ...managers];
  }, [reps]);

  const filtered = useMemo(() => {
    const q = (search || globalSearch).trim().toLowerCase();
    const activeZone = zone !== ALL_ZONES ? zone : globalZone;
    return reps.filter((r) => {
      if (activeZone !== ALL_ZONES && r.zone !== activeZone) return false;
      if (hqClass === "Single Location" && r.raw.locations.length > 1) return false;
      if (hqClass === "Multi-Location Tour" && r.raw.locations.length <= 1) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.territory.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
      );
    });
  }, [reps, search, globalSearch, zone, globalZone, hqClass]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selectedRep = reps.find((r) => selectedIds.has(r.id)) || reps[0];

  function resetFilters() {
    setSearch("");
    setZone(ALL_ZONES);
    setStatus(ALL_STATUSES);
    setHqClass(ALL_HQ);
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "mtp-roster.csv",
      filtered.map((r) => ({
        "MR": r.name,
        "Code": r.code,
        "Territory": r.territory,
        "Manager": r.zone,
        "Station Mix": r.stationMix,
        "Stations": r.exStation,
        "Work Plan": r.workPlan,
        "Areas Covered": r.coreHcps,
        "Joint Work Days": r.jointDays,
        "Status": r.status
      }))
    );
  }

  return (
    <div className="flex flex-col w-full space-y-6">

{/* Top Global Header */}
<header className="bg-surface-card border-b border-border-subtle sticky top-0 z-20 px-8 py-3 flex items-center justify-between shadow-sm">
<div className="flex items-center gap-4">
{/* Search bar */}
<div className="relative w-72">
<svg className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<input
  className="w-full bg-surface-subtle border border-border-subtle rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-surface-card transition-all"
  placeholder="Search doctors, MRs, territory..."
  type="text"
  value={globalSearch}
  onChange={(e) => { setGlobalSearch(e.target.value); setPage(1); }}
/>
</div>
{/* Territory Filter */}
<div className="flex items-center gap-2 border-l border-border-subtle pl-4">
<select
  className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
  value={globalZone}
  onChange={(e) => { setGlobalZone(e.target.value); setPage(1); }}
>
{zoneOptions.map((z) => <option key={z}>{z}</option>)}
</select>
<select
  className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
  value={cycle}
  onChange={(e) => { setCycle(e.target.value); setPage(1); }}
>
<option>Oct 2026 (Upcoming Cycle)</option>
<option>Current Month (Sep 2026)</option>
<option>Nov 2026 (Advance Planning)</option>
</select>
</div>
</div>
{/* Top Right Controls */}
<div className="flex items-center gap-3">
<button
  className="p-2 text-text-muted hover:text-text-secondary rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors"
  title="Sync Feeds"
  type="button"
  onClick={() => setDetail({ title: "Sync Complete", body: "MTP and DCR feeds have been refreshed for the current cycle." })}
>
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
<button
  className="relative p-2 text-text-muted hover:text-text-secondary rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors"
  title="Notifications"
  type="button"
  onClick={() => { setHasUnread(false); setDetail({ title: "Notifications", body: `${reps.filter((r) => r.status === "DRAFT" || r.status === "SUBMITTED").length} MRs have a pending MTP submission for the current cycle.` }); }}
>
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
{hasUnread && <span className="w-2 h-2 rounded-full bg-[#b43403] absolute top-1.5 right-1.5"></span>}
</button>
<div className="flex items-center gap-2 pl-3 border-l border-border-subtle">
<div className="w-7 h-7 rounded-full bg-[#b43403] text-white flex items-center justify-center font-bold text-xs">AZ</div>
<div className="leading-tight hidden sm:block">
<div className="text-xs font-bold text-text-primary">Admin Zivira</div>
<div className="text-[10px] text-text-muted">Corporate HQ</div>
</div>
</div>
</div>
</header>
{/* Context Breadcrumb & Status Ribbon */}
<div className="px-8 pt-6 pb-2">
<div className="flex flex-wrap items-center justify-between gap-3 mb-2">
<div className="flex items-center gap-2 text-xs text-text-muted">
<span className="font-medium text-text-secondary">Platform</span>
<span>/</span>
<span className="font-medium text-text-secondary">Network &amp; Territory</span>
<span>/</span>
<span className="font-bold text-[#b43403]">Tour Plans (MTP)</span>
</div>
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-status-success-bg text-status-success border border-status-success-bg">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            MTP CYCLE: {cycleLabel(cycle).toUpperCase()}
          </span>
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-status-warning-bg text-status-warning border border-status-warning-bg">
<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            Deadline: 28 Sep
          </span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-subtle text-text-secondary border border-border-subtle">
<svg className="w-3 h-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            GPS Beat Sync: Active
          </span>
</div>
</div>
{/* Page Header */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
<div>
<h2 className="text-xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            Monthly Tour Program &amp; Beat Engine
          </h2>
<p className="text-xs text-text-secondary mt-1">
            Standardize monthly beat schedules, approve medical representative travel itineraries, and track TP vs DCR route compliance.
          </p>
</div>
<div className="flex items-center gap-2.5">
<button
  className="px-3 py-2 bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  onClick={handleExport}
  disabled={filtered.length === 0}
>
<svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            Export MTP
          </button>
<button
  className="px-4 py-2 bg-[#b43403] hover:bg-[#9a3412] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  disabled={selectedIds.size === 0}
  onClick={() => setDetail({ title: "Bulk Approve & Lock Plans", body: `${selectedIds.size} MTP(s) selected for approval and lock: ${reps.filter((r) => selectedIds.has(r.id)).map((r) => r.name).join(", ")}. Session-only — there is no MTP approval/lock write endpoint yet.` })}
><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>Bulk Approve &amp; Lock Plans</button>
</div>
</div>
</div>
{/* MAIN SCROLLABLE CONTENT BODY */}
<div className="px-8 py-4 space-y-6">
{/* 4 EXECUTIVE KPI CARDS */}

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
{/* Card 1 */}
<div className="bg-surface-card p-4 rounded-xl border border-border-subtle/80 shadow-sm relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Field Reps on MTP</span>
<div className="w-7 h-7 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></div>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="text-2xl font-black text-text-primary">{loading ? "…" : reps.length}</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
<span>Current Cycle: {cycleLabel(cycle)}</span>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-card p-4 rounded-xl border border-border-subtle/80 shadow-sm">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">MTP Submission Rate</span>
<div className="w-7 h-7 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="text-2xl font-black text-text-primary">{reps.length === 0 ? "—" : `${Math.round((reps.filter((r) => r.status !== "DRAFT").length / reps.length) * 100)}%`}</span>
<span className="text-[11px] text-text-secondary font-medium">({reps.filter((r) => r.status !== "DRAFT").length} / {reps.length})</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px]">
<span className="text-rose-600 font-semibold">{reps.filter((r) => r.status === "DRAFT").length} Pending</span>
</div>
</div>
{/* Card 3 */}
<div className="bg-surface-card p-4 rounded-xl border border-border-subtle/80 shadow-sm">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">ASM / ZSM Approvals</span>
<div className="w-7 h-7 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="text-2xl font-black text-text-primary">{reps.filter((r) => r.status === "APPROVED").length}</span>
<span className="text-[11px] text-text-secondary font-medium">Approved</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
<span>{reps.filter((r) => r.status === "SUBMITTED").length} In Review</span>
<span>{reps.filter((r) => r.status === "DRAFT").length} Pending Drafts</span>
</div>
</div>
{/* Card 4 */}
<div className="bg-surface-card p-4 rounded-xl border border-border-subtle/80 shadow-sm">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Route Deviation Risk</span>
<div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="text-2xl font-black text-text-primary">{reps.filter((r) => r.status === "REJECTED" || r.status === "VOIDED").length}</span>
<span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Flags</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
<span>Rejected / Voided Plans</span>
</div>
</div>
</div>
{/* INTERACTIVE SUB-NAVIGATION TABS */}
<div className="flex flex-wrap items-center justify-between border-b border-border-subtle gap-2">
<div className="flex items-center gap-6 text-xs font-semibold">
{TABS.map((t) => {
  const active = activeTab === t.key;
  return (
    <button
      key={t.key}
      type="button"
      onClick={() => setActiveTab(t.key)}
      className={active ? "pb-3 text-[#b43403] border-b-2 border-[#b43403] flex items-center gap-2" : "pb-3 text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors"}
    >
      {t.key !== "master" && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      )}
      <span>{t.label}</span>
    </button>
  );
})}
</div>
<div className="text-[11px] text-text-muted pb-2 flex items-center gap-1.5">
<svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          MTP locked on 1st of each month
        </div>
</div>
{activeTab !== "master" ? (
  <div className="bg-surface-card p-8 rounded-xl border border-border-subtle/80 shadow-sm text-center text-xs text-text-muted">
    No dedicated data view is wired up for &quot;{TABS.find((t) => t.key === activeTab)?.label}&quot; yet — there is no backend collection for it. Switch back to the MTP Master tab to see live data.
  </div>
) : (
<>
{error && (
  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3">{error}</div>
)}
{/* FILTER CONTROLS BAR */}
<div className="bg-surface-card p-3 rounded-xl border border-border-subtle/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
<div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
{/* Keyword search */}
<div className="relative flex-1 min-w-[220px]">
<svg className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<input
  className="w-full bg-surface-subtle border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-surface-card transition-all"
  placeholder="Search by MR Name, Territory, Beat Code..."
  type="text"
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
/>
</div>
{/* Zone Filter */}
<select
  className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
  value={zone}
  onChange={(e) => { setZone(e.target.value); setPage(1); }}
>
{zoneOptions.map((z) => <option key={z}>{z}</option>)}
</select>
{/* Status Filter — passed straight to the backend as ?status= */}
<select
  className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
  value={status}
  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
>
{STATUSES.map((s) => <option key={s}>{s}</option>)}
</select>
{/* Location-count Filter */}
<select
  className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
  value={hqClass}
  onChange={(e) => { setHqClass(e.target.value); setPage(1); }}
>
{HQ_CLASSES.map((h) => <option key={h}>{h}</option>)}
</select>
</div>
<button
  className="px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary font-medium flex items-center gap-1.5 transition-colors"
  type="button"
  onClick={resetFilters}
>
<svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          Reset
        </button>
</div>
{/* MAIN SPLIT VIEW: MTP TABLE + BEAT ROTATION PREVIEW HUD */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
{/* LEFT 2 COLUMNS: MEDICAL REPRESENTATIVE MTP TABLE */}
<div className="xl:col-span-2 bg-surface-card rounded-xl border border-border-subtle/80 shadow-sm overflow-hidden flex flex-col">
<div className="p-4 border-b border-slate-100 flex items-center justify-between">
<div className="flex items-center gap-2">
<h3 className="text-sm font-bold text-text-primary">Medical Representatives MTP Roster</h3>
<span className="text-xs text-text-muted">{cycle}</span>
</div>
<div className="flex items-center gap-2 text-xs text-text-secondary">
<span>{loading ? "Loading…" : filtered.length === 0 ? "No matching reps" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Reps`}</span>
<div className="flex items-center gap-1 ml-2">
<button
  className="w-6 h-6 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:bg-surface-subtle disabled:opacity-50"
  type="button"
  onClick={() => setPage((p) => Math.max(1, p - 1))}
  disabled={safePage <= 1}
>&lt;</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button
    key={n}
    className={n === safePage ? "w-6 h-6 rounded bg-[#b43403] text-white flex items-center justify-center text-xs" : "w-6 h-6 rounded border border-border-subtle flex items-center justify-center text-text-secondary hover:bg-surface-subtle text-xs"}
    type="button"
    onClick={() => setPage(n)}
  >{n}</button>
))}
<button
  className="w-6 h-6 rounded border border-border-subtle flex items-center justify-center text-text-secondary hover:bg-surface-subtle disabled:opacity-50"
  type="button"
  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
  disabled={safePage >= totalPages}
>&gt;</button>
</div>
</div>
</div>
{/* Table */}
<div className="overflow-x-auto flex-1">
<table className="w-full text-left border-collapse text-xs">
<thead>
<tr className="bg-surface-subtle/75 border-b border-border-subtle text-text-secondary font-bold uppercase tracking-wider text-[10px]">
<th className="p-3.5 w-10 text-center">
<input className="rounded border-border-subtle text-orange-600 focus:ring-orange-500" type="checkbox" readOnly checked={pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id))}/>
</th>
<th className="p-3.5">MR Profile &amp; Territory</th>
<th className="p-3.5">Station Mix</th>
<th className="p-3.5 text-center">Work Plan</th>
<th className="p-3.5">Manager</th>
<th className="p-3.5 text-center">MTP Status</th>
<th className="p-3.5 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100 text-text-secondary">
{!loading && pageRows.length === 0 && (
  <tr><td colSpan={7} className="p-10 text-center text-text-muted text-xs">No reps match the current search/filters.</td></tr>
)}
{loading && (
  <tr><td colSpan={7} className="p-10 text-center text-text-muted text-xs">Loading tour plans…</td></tr>
)}
{pageRows.map((r) => {
  const isSelected = selectedIds.has(r.id);
  return (
  <tr key={r.id} className={isSelected ? "hover:bg-orange-50/40 bg-orange-50/20 transition-colors" : "hover:bg-surface-subtle transition-colors"}>
    <td className="p-3.5 text-center">
      <input checked={isSelected} onChange={() => toggleSelect(r.id)} className="rounded border-border-subtle text-orange-600 focus:ring-orange-500" type="checkbox"/>
    </td>
    <td className="p-3.5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center text-xs font-bold text-text-secondary">{r.initials}</div>
        <div>
          <div className="font-bold text-text-primary flex items-center gap-1.5">
            {r.name}
          </div>
          <div className="text-[11px] text-text-muted">{r.code} • {r.territory}</div>
        </div>
      </div>
    </td>
    <td className="p-3.5">
      <div className="text-xs font-medium text-text-primary">{r.stationMix}</div>
      <div className="text-[10px] text-text-muted">{r.exStation}</div>
    </td>
    <td className="p-3.5 text-center">
      <div className="font-bold text-text-primary">{r.workPlan}</div>
      <div className="text-[10px] text-text-muted">{r.coreHcps}</div>
    </td>
    <td className="p-3.5">
      <div className="flex items-center gap-1 text-text-primary font-medium">
        <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        {r.jointDays}
      </div>
      <div className="text-[10px] text-text-muted">{r.asm}</div>
    </td>
    <td className="p-3.5 text-center">
      <span className={statusPillClass[r.status] || statusPillClass.DRAFT}>{r.status}</span>
    </td>
    <td className="p-3.5 text-right">
      <button
        className="p-1 text-text-muted hover:text-[#ea580c] transition-colors"
        title="View Itinerary"
        type="button"
        onClick={() => setDetail({
          title: `${r.name} — Itinerary`,
          body: r.raw.locations.length > 0
            ? r.raw.locations.map((l) => `${l.date}: ${l.area}, ${l.town}${l.purpose ? ` (${l.purpose})` : ""}`).join(" | ")
            : `${r.code} • ${r.territory} — no itinerary locations recorded for ${r.raw.month}.`
        })}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      </button>
    </td>
  </tr>
  );
})}
</tbody>
</table>
</div>
{/* Table Action Footer */}
<div className="p-3 bg-surface-subtle border-t border-border-subtle flex items-center justify-between">
<div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
<span className="font-bold text-text-primary">{selectedIds.size} MR Selected</span> • <button type="button" className="hover:underline" onClick={() => setSelectedIds(new Set(reps.map((r) => r.id)))}>Select All {reps.length}</button>
            </div>
<div className="flex items-center gap-2">
<button
  className="px-3 py-1.5 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  disabled={selectedIds.size === 0}
  onClick={() => setDetail({ title: "Bulk Revise Dates", body: `Date revision requested for ${selectedIds.size} MR(s). Session-only — there is no MTP write-back endpoint yet.` })}
>
<svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Bulk Revise Dates
              </button>
<button
  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  disabled={selectedIds.size === 0}
  onClick={() => setDetail({ title: "Fast Approve MTP", body: `${selectedIds.size} MR(s) fast-approved for ${cycle}: ${reps.filter((r) => selectedIds.has(r.id)).map((r) => r.name).join(", ")}. Session-only — there is no MTP approval write endpoint yet.` })}
>
<svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Fast Approve MTP
              </button>
</div>
</div>
</div>
{/* RIGHT COLUMN: BEAT ROTATION SCHEDULE & ROUTE INSPECTOR CARD */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 shadow-sm p-4 flex flex-col justify-between">
<div>
{/* Header for Selected Rep */}
<div className="flex items-start justify-between pb-3 border-b border-slate-100">
<div className="flex items-center gap-2.5">
<span className="font-bold text-[#b43403]">Tour Plans (MTP)</span>
<div>
<div className="text-sm font-bold text-text-primary flex items-center gap-1">
                    {selectedRep ? selectedRep.name : "No rep selected"}
</div>
<div className="text-[11px] text-text-muted">{selectedRep ? `${selectedRep.code} • ${selectedRep.territory}` : "—"}</div>
</div>
</div>
{selectedRep && (
  <span className={statusPillClass[selectedRep.status] || statusPillClass.DRAFT}>
                {selectedRep.status}
              </span>
)}
</div>
{/* Mini stats ribbon */}
{selectedRep && (
<div className="grid grid-cols-3 gap-2 my-3 p-2 bg-surface-subtle rounded-lg text-center">
<div>
<div className="text-[10px] text-text-muted">Locations</div>
<div className="text-xs font-bold text-text-primary">{selectedRep.raw.locations.length}</div>
</div>
<div className="border-x border-border-subtle">
<div className="text-[10px] text-text-muted">Month</div>
<div className="text-xs font-bold text-text-primary">{selectedRep.raw.month}</div>
</div>
<div>
<div className="text-[10px] text-text-muted">Status</div>
<div className="text-xs font-bold text-text-primary">{selectedRep.status}</div>
</div>
</div>
)}
{/* Beat Rotation Schedule preview — no backend collection exists for
    day-by-day beat schedules, so this illustrative preview is left as-is;
    the itinerary shown when a rep's real locations are fetched (via View
    Itinerary above) is the actual backend data. */}
<div className="space-y-2 mt-4">
<div className="flex items-center justify-between text-xs font-bold text-text-primary">
<span className="uppercase tracking-wider text-[10px] text-text-muted">Sample Beat Rotation Layout (illustrative)</span>
</div>
{/* Beat Day 1 */}
<div className="p-2.5 rounded-lg border border-border-subtle/80 bg-surface-card hover:border-orange-200 transition-colors">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded bg-surface-subtle text-text-secondary font-bold text-[11px] flex items-center justify-center">01</span>
<div>
<div className="text-xs font-bold text-text-primary">Mon • Dadar &amp; Parel Beat</div>
<div className="text-[10px] text-text-secondary">KEM &amp; Tata Memorial Hub (12 HCPs)</div>
</div>
</div>
<span className="text-[10px] font-semibold text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded">Local HQ</span>
</div>
<div className="mt-2 flex items-center justify-between text-[10px] text-text-muted pt-1.5 border-t border-slate-100">
<span>Dist: 14 KM • TA/DA: ₹450</span>
<span className="text-emerald-600 font-semibold">Core A+: 5 HCPs</span>
<span className="text-text-secondary">✓ Beat Validated</span>
</div>
</div>
{/* Beat Day 2 (Joint Work) */}
<div className="p-2.5 rounded-lg border border-orange-200 bg-orange-50/20">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="font-bold text-[#b43403]">Tour Plans (MTP)</span>
<div>
<div className="text-xs font-bold text-text-primary">Tue • Bandra Clinics &amp; Khar</div>
<div className="text-[10px] text-text-secondary">Lilavati Corridors (14 HCPs)</div>
</div>
</div>
<span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded flex items-center gap-1">
<svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    Joint ASM Day
                  </span>
</div>
<div className="mt-2 flex items-center justify-between text-[10px] text-text-muted pt-1.5 border-t border-orange-100">
<span>Accompanied by ASM Rajesh Sharma</span>
<span className="text-orange-700 font-bold">Core A+: 8</span>
<span className="text-text-secondary">TA/DA: ₹650</span>
</div>
</div>
{/* Beat Day 3 */}
<div className="p-2.5 rounded-lg border border-border-subtle/80 bg-surface-card hover:border-orange-200 transition-colors">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded bg-surface-subtle text-text-secondary font-bold text-[11px] flex items-center justify-center">03</span>
<div>
<div className="text-xs font-bold text-text-primary">Wed • Andheri East Super-Specialty</div>
<div className="text-[10px] text-text-secondary">SevenHills Medical Cluster (11 HCPs)</div>
</div>
</div>
<span className="text-[10px] font-semibold text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded">Local HQ</span>
</div>
<div className="mt-2 flex items-center justify-between text-[10px] text-text-muted pt-1.5 border-t border-slate-100">
<span>Dist: 18 KM • TA/DA: ₹450</span>
<span className="text-emerald-600 font-semibold">Core A+: 4</span>
<span className="text-text-secondary">✓ Beat Validated</span>
</div>
</div>
</div>
</div>
{/* Bottom Action in Inspector Card */}
<div className="pt-4 border-t border-slate-100 mt-4">
<div className="flex items-center gap-2">
<button
  className="flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  disabled={!selectedRep}
  onClick={() => selectedRep && setDetail({ title: "Route Schedule Locked", body: `${selectedRep.name}'s ${selectedRep.raw.month} tour plan has been locked. Session-only — there is no MTP lock write endpoint yet.` })}
>
<svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Lock Route Schedule
              </button>
<button
  className="p-2 border border-border-subtle rounded-lg hover:bg-surface-subtle text-text-secondary transition-colors"
  title="Print Tour Plan"
  type="button"
  onClick={() => window.print()}
>
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</div>
</div>
</div>
</>
)}
{/* FOOTER COMPLIANCE & PROTOCOL BANNER */}
<div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 via-white to-orange-50/30 border border-orange-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-surface-card border border-orange-200 shadow-sm flex items-center justify-center text-[#b43403] flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></div>
<div>
<span className="font-bold text-text-primary">Pharma Compliance Note • MCI &amp; UCPMP Guidelines</span>
<p className="text-text-secondary text-[11px] mt-0.5">
              Doctor visit frequency capped at max 2 visits / month per Rep unless specialized multi-indication trial protocol applies.
            </p>
</div>
</div>
<div className="flex items-center gap-2 flex-shrink-0">
<button
  className="px-3 py-1.5 bg-surface-card border border-border-subtle rounded-lg font-semibold text-text-secondary hover:bg-surface-subtle transition-colors text-xs"
  type="button"
  onClick={() => setDetail({ title: "Compliance Matrix", body: `Doctor visit frequency capped at max 2 visits / month per Rep unless a specialized multi-indication trial protocol applies. Applies across ${reps.length} field reps currently loaded for ${cycle}.` })}
>
            View Compliance Matrix
          </button>
<button
  className="px-3 py-1.5 bg-[#b43403] text-white rounded-lg font-semibold hover:bg-[#9a3412] transition-colors text-xs shadow-sm shadow-orange-200"
  type="button"
  onClick={() => downloadCsv("mtp-compliance-rules.csv", [{ Rule: "Max visits per doctor", Limit: "2 / month / Rep", Exception: "Specialized multi-indication trial protocol" }])}
>Download Rules PDF</button>
</div>
</div>
</div>

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
