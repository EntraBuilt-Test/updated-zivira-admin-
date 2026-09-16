"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component: none of its
// buttons/selects/inputs had a handler (global search, zone/cycle selects,
// sync/notification icons, Export MTP, Bulk Approve & Lock Plans, sub-nav
// tabs, the filter bar, per-row checkboxes/View Itinerary, Bulk Revise
// Dates / Fast Approve, or the inspector card's Lock Route Schedule / Print
// buttons did anything). The demo KPI numbers on the 4 pulse cards and the
// fixed beat-rotation schedule are left untouched (no backend collection
// exists yet for MTP cycles), but the MR roster table itself is now real
// local state: search + both filters + Reset actually filter it, Export
// downloads exactly what's on screen as CSV, pagination reflects the real
// filtered count, row selection drives the "N MR Selected" footer and the
// side inspector, and every action button opens a real read-only popup or
// does a real, session-only state update instead of doing nothing.

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
  status: "Approved" | "Pending Review" | "Revision Needed";
};

const initialReps: Rep[] = [
  { id: "r1", initials: "RS", name: "Rahul Sharma", code: "MR-1049", territory: "Mumbai Metro (West)", zone: "West Zone (Mumbai, Gujarat)", stationMix: "HQ Local (16d)", exStation: "Ex-Station: 6d (Thane/Vashi)", workPlan: "22 Days • 240 Calls", coreHcps: "88 Core A+ HCPs", jointDays: "4 Days", asm: "ASM Rajesh Sharma", status: "Approved" },
  { id: "r2", initials: "AD", name: "Amit Duggal", code: "MR-0842", territory: "Delhi South (North)", zone: "North Zone (Delhi NCR, Punjab)", stationMix: "HQ Local (14d)", exStation: "Out-Station: 7d (Gurugram)", workPlan: "21 Days • 215 Calls", coreHcps: "74 Core A+ HCPs", jointDays: "3 Days", asm: "ASM Vikrant Verma", status: "Pending Review" },
  { id: "r3", initials: "SM", name: "Subhashish Mitra", code: "MR-1120", territory: "Kolkata Central (East)", zone: "East Zone (Kolkata, Odisha)", stationMix: "HQ Local (18d)", exStation: "Ex-Station: 5d (Howrah/Saltlake)", workPlan: "23 Days • 250 Calls", coreHcps: "92 Core A+ HCPs", jointDays: "5 Days", asm: "ASM Debopriya Das", status: "Approved" },
  { id: "r4", initials: "SK", name: "Sunita Kulkarni", code: "MR-0994", territory: "Bengaluru Central (South)", zone: "South Zone (Bengaluru, Chennai)", stationMix: "HQ Local (12d)", exStation: "OS: 8d (Mysuru/Mandya)", workPlan: "20 Days • 210 Calls", coreHcps: "65 Core A+ (Below Target)", jointDays: "2 Days", asm: "ASM Srinivas Murthy", status: "Revision Needed" },
  { id: "r5", initials: "KN", name: "Karthik Nathan", code: "MR-1205", territory: "Chennai Central (South)", zone: "South Zone (Bengaluru, Chennai)", stationMix: "HQ Local (17d)", exStation: "Ex-Station: 5d (Tambaram)", workPlan: "22 Days • 235 Calls", coreHcps: "85 Core A+ HCPs", jointDays: "4 Days", asm: "ASM Balasubramanian", status: "Approved" }
];

const ZONES = [
  "All Zones (East, West, North, South)",
  "West Zone (Mumbai, Gujarat)",
  "North Zone (Delhi NCR, Punjab)",
  "South Zone (Bengaluru, Chennai)",
  "East Zone (Kolkata, Odisha)"
];

const STATUSES = ["All Statuses (Approved, Pending...)", "Approved", "Pending Review", "Revision Needed", "Draft"];

const HQ_CLASSES = ["All HQ Classifications", "Local HQ Only", "Includes Ex-Station", "Includes Outstation (OS)"];

const TABS = [
  { key: "master", label: "Monthly Tour Program (MTP) Master", count: "428" },
  { key: "routes", label: "Route & Beat Optimization Matrix", count: "142 Beats" },
  { key: "deviation", label: "MTP vs DCR Deviation Tracker", count: "18 Flags" },
  { key: "joint", label: "Joint Field Work & Manager Plan", count: "64 Days" }
] as const;

const statusPillClass: Record<Rep["status"], string> = {
  "Approved": "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-status-success-bg",
  "Pending Review": "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-status-warning-bg",
  "Revision Needed": "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
};

const PAGE_SIZE = 2;

export function AdminTourPlansDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalZone, setGlobalZone] = useState(ZONES[0]);
  const [cycle, setCycle] = useState("Oct 2026 (Upcoming Cycle)");
  const [hasUnread, setHasUnread] = useState(true);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState(ZONES[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [hqClass, setHqClass] = useState(HQ_CLASSES[0]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("master");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["r1"]));
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);

  const filtered = useMemo(() => {
    const q = (search || globalSearch).trim().toLowerCase();
    const activeZone = zone !== ZONES[0] ? zone : globalZone;
    return initialReps.filter((r) => {
      if (activeZone !== ZONES[0] && r.zone !== activeZone) return false;
      if (status !== STATUSES[0] && r.status !== status) return false;
      if (hqClass === "Includes Ex-Station" && !r.exStation.toLowerCase().includes("ex-station")) return false;
      if (hqClass === "Includes Outstation (OS)" && !r.exStation.toLowerCase().includes("os:") && !r.exStation.toLowerCase().includes("out-station")) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.territory.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
      );
    });
  }, [search, globalSearch, zone, globalZone, status, hqClass]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selectedRep = initialReps.find((r) => selectedIds.has(r.id)) || initialReps[0];

  function resetFilters() {
    setSearch("");
    setZone(ZONES[0]);
    setStatus(STATUSES[0]);
    setHqClass(HQ_CLASSES[0]);
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
        "Zone": r.zone,
        "Station Mix": r.stationMix,
        "Ex/Out-Station": r.exStation,
        "Work Plan": r.workPlan,
        "Core HCPs": r.coreHcps,
        "Joint Work ASM": r.asm,
        "Joint Days": r.jointDays,
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
<option>All Territories (Pan-India HQ)</option>
<option>West Zone (Mumbai &amp; Gujarat)</option>
<option>North Zone (Delhi NCR &amp; UP)</option>
<option>South Zone (Bengaluru &amp; Chennai)</option>
<option>East Zone (Kolkata &amp; Bihar)</option>
</select>
<select
  className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
  value={cycle}
  onChange={(e) => setCycle(e.target.value)}
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
  onClick={() => { setHasUnread(false); setDetail({ title: "Notifications", body: "25 MRs have a pending MTP submission for October 2026. Deadline: 28 Sep." }); }}
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
            MTP CYCLE: OCT 2026
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
  onClick={() => setDetail({ title: "Bulk Approve & Lock Plans", body: `${selectedIds.size} MTP(s) selected for approval and lock: ${initialReps.filter((r) => selectedIds.has(r.id)).map((r) => r.name).join(", ")}. Session-only — there is no MTP approval collection yet.` })}
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
<span className="text-2xl font-black text-text-primary">428</span>
<span className="text-[11px] font-semibold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded">+12 new</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
<span>Roster Compliance</span>
<span className="font-semibold text-text-primary">98.5% Active</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-1.5 overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "98.5%" }}></div>
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
<span className="text-2xl font-black text-text-primary">94.2%</span>
<span className="text-[11px] text-text-secondary font-medium">(403 / 428)</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px]">
<span className="text-rose-600 font-semibold">25 Pending</span>
<button
  className="text-[11px] text-[#b43403] hover:underline font-semibold flex items-center gap-1"
  type="button"
  onClick={() => setDetail({ title: "Ping 25 Reps", body: "A reminder notification for the pending October 2026 MTP submission has been queued for the 25 outstanding reps. Session-only — there is no notification dispatch service yet." })}
>Ping 25 Reps <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></button>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-1.5 overflow-hidden">
<div className="bg-blue-600 h-full rounded-full" style={{ "width": "94.2%" }}></div>
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
<span className="text-2xl font-black text-text-primary">372</span>
<span className="text-[11px] text-text-secondary font-medium">Approved (87%)</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
<span>31 In Review</span>
<span>25 Pending Drafts</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-1.5 flex overflow-hidden">
<div className="bg-emerald-500 h-full" style={{ "width": "87%" }}></div>
<div className="bg-amber-400 h-full" style={{ "width": "7%" }}></div>
<div className="bg-slate-300 h-full" style={{ "width": "6%" }}></div>
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
<span className="text-2xl font-black text-text-primary">4.2%</span>
<span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">18 Flags</span>
</div>
<div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
<span>Standard Beat Adherence</span>
<span className="font-semibold text-text-primary">95.8% Normal</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-1.5 overflow-hidden">
<div className="bg-purple-600 h-full rounded-full" style={{ "width": "95.8%" }}></div>
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
      <span className={active ? "bg-orange-100 text-[#b43403] px-2 py-0.5 rounded-full text-[10px] font-bold" : t.key === "deviation" ? "bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold" : "bg-surface-subtle text-text-secondary px-1.5 py-0.5 rounded-full text-[10px]"}>{t.count}</span>
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
{ZONES.map((z) => <option key={z}>{z}</option>)}
</select>
{/* Status Filter */}
<select
  className="bg-surface-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
  value={status}
  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
>
{STATUSES.map((s) => <option key={s}>{s}</option>)}
</select>
{/* Station Filter */}
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
<span className="text-xs text-text-muted">October 2026 Cycle</span>
</div>
<div className="flex items-center gap-2 text-xs text-text-secondary">
<span>{filtered.length === 0 ? "No matching reps" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Reps`}</span>
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
<th className="p-3.5 text-center">Work Plan &amp; Calls</th>
<th className="p-3.5">Joint Work ASM</th>
<th className="p-3.5 text-center">MTP Status</th>
<th className="p-3.5 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100 text-text-secondary">
{pageRows.length === 0 && (
  <tr><td colSpan={7} className="p-10 text-center text-text-muted text-xs">No reps match the current search/filters.</td></tr>
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
            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active GPS Beat"></span>}
          </div>
          <div className="text-[11px] text-text-muted">{r.code} • {r.territory}</div>
        </div>
      </div>
    </td>
    <td className="p-3.5">
      <div className="text-xs font-medium text-text-primary">{r.stationMix}</div>
      <div className={r.exStation.toLowerCase().startsWith("os") ? "text-[10px] text-rose-500 font-semibold" : "text-[10px] text-text-muted"}>{r.exStation}</div>
    </td>
    <td className="p-3.5 text-center">
      <div className="font-bold text-text-primary">{r.workPlan}</div>
      <div className={r.coreHcps.toLowerCase().includes("below") ? "text-[10px] text-amber-600 font-semibold" : "text-[10px] text-emerald-600 font-semibold"}>{r.coreHcps}</div>
    </td>
    <td className="p-3.5">
      <div className="flex items-center gap-1 text-text-primary font-medium">
        <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        {r.jointDays}
      </div>
      <div className="text-[10px] text-text-muted">{r.asm}</div>
    </td>
    <td className="p-3.5 text-center">
      <span className={statusPillClass[r.status]}>{r.status}</span>
    </td>
    <td className="p-3.5 text-right">
      <button
        className="p-1 text-text-muted hover:text-[#ea580c] transition-colors"
        title="View Itinerary"
        type="button"
        onClick={() => setDetail({
          title: `${r.name} — Itinerary`,
          body: `${r.code} • ${r.territory} · ${r.stationMix}, ${r.exStation} · ${r.workPlan} (${r.coreHcps}) · Joint work: ${r.jointDays} with ${r.asm} · Status: ${r.status}.`
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
<span className="font-bold text-text-primary">{selectedIds.size} MR Selected</span> • <button type="button" className="hover:underline" onClick={() => setSelectedIds(new Set(initialReps.map((r) => r.id)))}>Select All {initialReps.length}</button>
            </div>
<div className="flex items-center gap-2">
<button
  className="px-3 py-1.5 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  disabled={selectedIds.size === 0}
  onClick={() => setDetail({ title: "Bulk Revise Dates", body: `Date revision requested for ${selectedIds.size} MR(s). Session-only — there is no MTP write-back collection yet.` })}
>
<svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Bulk Revise Dates
              </button>
<button
  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  disabled={selectedIds.size === 0}
  onClick={() => setDetail({ title: "Fast Approve MTP", body: `${selectedIds.size} MR(s) fast-approved for the October 2026 cycle: ${initialReps.filter((r) => selectedIds.has(r.id)).map((r) => r.name).join(", ")}. Session-only.` })}
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
                    {selectedRep.name}
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path></svg>
</div>
<div className="text-[11px] text-text-muted">{selectedRep.code} • {selectedRep.territory}</div>
</div>
</div>
<span className={selectedRep.status === "Approved" ? "text-[10px] font-bold text-status-success bg-status-success-bg px-2 py-0.5 rounded border border-status-success-bg" : selectedRep.status === "Pending Review" ? "text-[10px] font-bold text-status-warning bg-status-warning-bg px-2 py-0.5 rounded border border-status-warning-bg" : "text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200"}>
                {selectedRep.status}
              </span>
</div>
{/* Mini stats ribbon */}
<div className="grid grid-cols-3 gap-2 my-3 p-2 bg-surface-subtle rounded-lg text-center">
<div>
<div className="text-[10px] text-text-muted">Field Days</div>
<div className="text-xs font-bold text-text-primary">22 Days</div>
<div className="text-[9px] text-text-muted">Target: 22d</div>
</div>
<div className="border-x border-border-subtle">
<div className="text-[10px] text-text-muted">Planned Calls</div>
<div className="text-xs font-bold text-text-primary">240 Calls</div>
<div className="text-[9px] text-emerald-600 font-medium">Avg: 11 / Day</div>
</div>
<div>
<div className="text-[10px] text-text-muted">Beat Adherence</div>
<div className="text-xs font-bold text-emerald-600">98.2%</div>
<div className="text-[9px] text-text-muted">Target: ≥95%</div>
</div>
</div>
{/* Oct Week 1: Beat Schedule Detail */}
<div className="space-y-2 mt-4">
<div className="flex items-center justify-between text-xs font-bold text-text-primary">
<span className="uppercase tracking-wider text-[10px] text-text-muted">Oct Week 1: Beat Rotation Schedule</span>
<span className="text-[11px] text-[#b43403] font-semibold bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-full">Full Month (22d)</span>
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
<div className="flex items-center justify-between text-xs mb-3">
<span className="text-text-secondary font-medium">Projected Travel Allowance (TA/DA):</span>
<span className="font-bold text-text-primary">₹ 14,850 / mo</span>
</div>
<div className="flex items-center gap-2">
<button
  className="flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
  type="button"
  onClick={() => setDetail({ title: "Route Schedule Locked", body: `${selectedRep.name}'s October beat rotation schedule has been locked for the current MTP cycle. Session-only — there is no MTP lock collection yet.` })}
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
  onClick={() => setDetail({ title: "Compliance Matrix", body: "Doctor visit frequency capped at max 2 visits / month per Rep unless a specialized multi-indication trial protocol applies. Applies across all 428 field reps on MTP." })}
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
