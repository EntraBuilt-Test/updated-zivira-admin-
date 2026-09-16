"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";
import { apiClient, type ManagerJointWorkRow, type RepAnalysisRow } from "@/lib/api-client";

// This page used to be a fully static server component: every number was
// hand-typed JSX and none of its buttons/selects/inputs had a real
// onClick/onChange handler. A later pass made the Supervisory Roster table
// interactive (search/filter/select/export/dossier) but against a local
// mock array of fabricated ASMs, mentorship rosters and coaching rubrics —
// none of which exist in the backend. The backend DOES have a real
// endpoint for this (Topic 5/6 — Representative vs Manager Analysis /
// Joint Field Work Analysis): GET /company/analytics/rep-manager, wrapped
// by apiClient.repManagerAnalysis(). It returns two arrays:
//   - managers: ManagerJointWorkRow[]  → drives the roster table below
//     (this is the real "supervisor" grain: one row per reporting manager)
//   - data: RepAnalysisRow[]           → drives the rep-level drill-down
//     in the right-hand dossier (reps whose reportingManager === the
//     selected manager's managerCode)
// The mock data's "Zone", HQ areas, mentorship notes and 0-10 coaching
// rubric scores have NO backend equivalent and have been removed rather
// than faked; the dossier now shows the manager's real reps and their
// real visit/joint-call numbers instead of an invented scorecard.

type Supervisor = ManagerJointWorkRow & { id: string };

const PAGE_SIZE = 5;

function initialsOf(name?: string, fallback?: string) {
  const source = (name ?? fallback ?? "").trim();
  if (!source) return "--";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminRepVsManagerDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [reps, setReps] = useState<RepAnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState<string>("");

  const [search, setSearch] = useState("");
  const [perfFilter, setPerfFilter] = useState<"all" | "achieved" | "ontrack" | "lagging">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dossierId, setDossierId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ asmId: "", date: "" });
  const [territory, setTerritory] = useState("All Territories (Pan-India HQ)");
  const [period, setPeriod] = useState("Current Month (Sep 2026 Active)");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.repManagerAnalysis(month || undefined);
        if (cancelled) return;
        const managerRows: Supervisor[] = (response.managers ?? []).map((m) => ({ ...m, id: m.managerCode }));
        setSupervisors(managerRows);
        setReps(response.data ?? []);
        setDossierId((prev) => prev ?? managerRows[0]?.id ?? null);
        setSelectedIds((prev) => (prev.size ? prev : new Set(managerRows[0] ? [managerRows[0].id] : [])));
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load Rep vs Manager analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return supervisors.filter((s) => {
      if (perfFilter === "achieved" && s.jointCallPercent < 25) return false;
      if (perfFilter === "ontrack" && !(s.jointCallPercent >= 15 && s.jointCallPercent < 25)) return false;
      if (perfFilter === "lagging" && s.jointCallPercent >= 15) return false;
      if (!q) return true;
      return (
        (s.managerName ?? "").toLowerCase().includes(q) ||
        s.managerCode.toLowerCase().includes(q)
      );
    });
  }, [supervisors, search, perfFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const dossier = supervisors.find((s) => s.id === dossierId) ?? supervisors[0] ?? null;
  const dossierReps = useMemo(
    () => (dossier ? reps.filter((r) => r.reportingManager === dossier.managerCode) : []),
    [reps, dossier]
  );

  function resetFilters() {
    setSearch("");
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
        "Manager": s.managerName ?? s.managerCode,
        "Code": s.managerCode,
        "Team Size": s.teamSize,
        "Total Team Visits": s.totalTeamVisits,
        "Total Joint Calls": s.totalJointCalls,
        "Avg Joint Calls/Rep": s.avgJointCallsPerRep,
        "Joint Call %": s.jointCallPercent,
        "Rank": s.rank
      }))
    );
  }

  function handleScheduleSubmit() {
    if (!scheduleForm.date.trim()) return;
    const asm = supervisors.find((s) => s.id === scheduleForm.asmId);
    setShowSchedule(false);
    setDetail({ title: "Ride Scheduled", body: `Mandatory supervisory ride for ${asm?.managerName ?? asm?.managerCode ?? "the selected manager"} scheduled on ${scheduleForm.date}. Session-only confirmation — there is no calendar backend wired up yet.` });
    setScheduleForm({ asmId: "", date: "" });
  }

  function handleDownloadDossier() {
    if (!dossier) return;
    downloadCsv(`joint-field-audit-${dossier.managerCode}.csv`, [{
      "Manager": dossier.managerName ?? dossier.managerCode, "Code": dossier.managerCode,
      "Team Size": dossier.teamSize, "Total Team Visits": dossier.totalTeamVisits,
      "Total Joint Calls": dossier.totalJointCalls, "Avg Joint Calls/Rep": dossier.avgJointCallsPerRep,
      "Joint Call %": dossier.jointCallPercent, "Rank": dossier.rank
    }]);
  }

  function handleScheduleRideAlong() {
    if (!dossier) return;
    setDetail({ title: "Ride-Along Requested", body: `A ride-along has been requested for ${dossier.managerName ?? dossier.managerCode}. Session-only confirmation — there is no calendar backend wired up yet.` });
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
<button className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs" title="Refresh Telemetry" type="button" onClick={() => setMonth((m) => m)}>
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
<button className="relative w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs" title="Notifications" type="button" onClick={() => setDetail({ title: "Notifications", body: `${supervisors.filter((s) => s.jointCallPercent < 15).length} manager(s) currently below the 15% joint-call benchmark.` })}>
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
                  {loading ? "Loading…" : error ? "Load Failed" : `${supervisors.length} Managers`}
                </span>
</div>
</div>
<div className="flex flex-wrap items-center gap-2.5">
<button className="h-9 px-3.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50" type="button" onClick={handleExport} disabled={filtered.length === 0}>
<span className="material-symbols-outlined text-[17px] text-text-secondary">file_download</span>
<span>Export Joint Field Work Audit (CSV)</span>
</button>
<button className="h-9 px-4 rounded-lg bg-[#b43403] hover:bg-[#9a2c02] text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-orange-950/20 transition-all active:scale-[0.98]" type="button" onClick={() => setShowSchedule(true)}>
<span className="material-symbols-outlined text-[18px]">co_present</span>
<span>Schedule Mandatory Supervisory Rides</span>
</button>
</div>
</div>
</div>

{error && (
  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">{error}</div>
)}

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
{/* Sub-Navigation Pill Tabs */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 px-4 py-1.5 shadow-sm flex items-center justify-between overflow-x-auto">
<div className="flex items-center gap-2 shrink-0">
{[
  { label: "Joint Field Work Matrix", icon: "badge", badge: `${supervisors.length} Managers`, badgeClass: "bg-[#b43403] text-white" },
  { label: "Ride-Along Calendar & Beat Sync", icon: "calendar_today" },
  { label: "Rep-Level Drill-Down", icon: "fact_check", badge: `${reps.length}`, badgeClass: "bg-surface-subtle text-text-secondary" }
].map((tab, i) => (
  <button
    key={tab.label}
    className={i === activeTab
      ? "relative py-2.5 px-3 text-xs font-bold text-[#b43403] flex items-center gap-2 border-b-2 border-[#b43403]"
      : "py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors"}
    type="button"
    onClick={() => {
      setActiveTab(i);
      if (i === 1) setDetail({ title: tab.label, body: "This view isn't built out yet — showing the Joint Field Work Matrix below in the meantime." });
    }}
  >
    <span className={i === activeTab ? "material-symbols-outlined text-[17px]" : "material-symbols-outlined text-[17px] text-text-muted"}>{tab.icon}</span>
    <span>{tab.label}</span>
    {tab.badge && <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${tab.badgeClass}`}>{tab.badge}</span>}
  </button>
))}
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
<input className="w-full text-xs bg-transparent text-text-secondary placeholder-slate-400 focus:outline-none border-none p-0" placeholder="Search Manager Name or Code..." type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
</div>
<div className="flex items-center gap-2">
<select className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer" value={perfFilter} onChange={(e) => { setPerfFilter(e.target.value as typeof perfFilter); setPage(1); }}>
<option value="all">All Performance</option>
<option value="achieved">Joint Call % ≥ 25%</option>
<option value="ontrack">On Track (15-25%)</option>
<option value="lagging">Lagging (&lt;15%)</option>
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
<th className="py-3 px-3">Manager &amp; Code</th>
<th className="py-3 px-3">Team Size</th>
<th className="py-3 px-3">Total Team Visits</th>
<th className="py-3 px-3">Total Joint Calls</th>
<th className="py-3 px-3">Avg Joint Calls/Rep</th>
<th className="py-3 px-3">Joint Call %</th>
<th className="py-3 px-3">Rank</th>
<th className="py-3 px-3 text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{loading && (
  <tr><td colSpan={9} className="py-10 px-3 text-center text-text-muted">Loading Rep vs Manager analytics…</td></tr>
)}
{!loading && pageRows.length === 0 && (
  <tr><td colSpan={9} className="py-10 px-3 text-center text-text-muted">No managers match the current search/filters.</td></tr>
)}
{!loading && pageRows.map((s) => {
  const flagged = s.jointCallPercent < 15;
  return (
<tr key={s.id} className={`${dossierId === s.id ? "bg-orange-50/60 hover:bg-orange-50/80" : "hover:bg-surface-subtle/80"} transition-colors cursor-pointer`} onClick={() => setDossierId(s.id)}>
<td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
<input checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className={`w-8 h-8 rounded-full ${flagged ? "bg-rose-100 text-rose-700" : "bg-[#b43403] text-white"} flex items-center justify-center font-display font-bold text-xs shrink-0`}>
                            {initialsOf(s.managerName, s.managerCode)}
                          </div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1.5">
<span>{s.managerName ?? s.managerCode}</span>
{dossierId === s.id && <span className="w-1.5 h-1.5 rounded-full bg-[#b43403]" title="Active Selection"></span>}
{flagged && <span className="material-symbols-outlined text-[14px] text-rose-600" title="Below joint-call benchmark">warning</span>}
</div>
<span className="text-[11px] text-text-muted">{s.managerCode}</span>
</div>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">{s.teamSize}</td>
<td className="py-3 px-3 font-semibold text-text-primary">{s.totalTeamVisits}</td>
<td className="py-3 px-3 font-semibold text-text-primary">{s.totalJointCalls}</td>
<td className="py-3 px-3 font-semibold text-text-primary">{s.avgJointCallsPerRep.toFixed(1)}</td>
<td className="py-3 px-3">
<span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${flagged ? "bg-rose-100 text-rose-700" : "bg-status-success-bg text-status-success"}`}>{s.jointCallPercent.toFixed(1)}%</span>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">#{s.rank}</td>
<td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
<button className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${dossierId === s.id ? "bg-[#b43403] text-white hover:bg-[#9a2c02]" : "bg-surface-subtle text-text-secondary hover:bg-slate-200"}`} type="button" onClick={() => setDossierId(s.id)}>
                          {dossierId === s.id ? "Active" : "Inspect"}
                        </button>
</td>
</tr>
  );
})}
</tbody>
</table>
</div>
{/* Pagination Footer */}
<div className="p-3 bg-surface-subtle/80 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
<span>{filtered.length === 0 ? "No matching managers" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Managers`}</span>
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
{/* RIGHT COLUMN: Selected Manager Dossier (Col 4) */}
<div className="lg:col-span-4 flex flex-col space-y-4">
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-5 shadow-sm space-y-4 relative">
{!dossier && (
  <p className="text-xs text-text-muted py-6 text-center">Select a manager from the table to see their drill-down.</p>
)}
{dossier && (
<>
{/* Inspector Header */}
<div className="flex items-center justify-between border-b border-slate-100 pb-3">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Manager Profile</span>
<div className="font-display font-bold text-base text-text-primary">#{dossier.managerCode}</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#b43403] border border-orange-200 text-xs font-bold flex items-center gap-1 shadow-xs">
<span className="material-symbols-outlined text-[14px]">military_tech</span> {dossier.jointCallPercent < 15 ? "Needs Support" : "Top Performer"}
                </span>
</div>
{/* Manager Bio Card */}
<div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle/60 flex items-center gap-3">
<div className="w-12 h-12 rounded-xl bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-base shadow-sm shadow-orange-950/20 shrink-0">
                  {initialsOf(dossier.managerName, dossier.managerCode)}
                </div>
<div className="flex flex-col min-w-0">
<span className="font-display font-bold text-sm text-text-primary truncate">{dossier.managerName ?? dossier.managerCode}</span>
<span className="text-xs text-text-secondary truncate">Team Size: {dossier.teamSize} • Rank #{dossier.rank}</span>
</div>
</div>
{/* Joint Call % Gauge */}
<div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-50/70 to-slate-50 border border-orange-200/60 flex items-center justify-between">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Joint Call Rate</span>
<div className="font-display font-bold text-xl text-text-primary">{dossier.totalJointCalls} Calls</div>
<span className="text-xs text-text-secondary">of {dossier.totalTeamVisits} Team Visits ({dossier.jointCallPercent.toFixed(1)}%)</span>
</div>
<div className="w-14 h-14 relative flex items-center justify-center shrink-0">
<svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-orange-200/70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-[#b43403]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${Math.min(100, dossier.jointCallPercent)}, 100`} strokeWidth="3.5"></path>
</svg>
<span className="absolute font-display font-bold text-xs text-[#b43403]">{dossier.jointCallPercent.toFixed(0)}%</span>
</div>
</div>
{/* Rep-Level Drill-Down (real data) */}
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-display font-bold text-xs text-text-primary">Reps Reporting to this Manager</span>
<span className="text-[11px] text-text-muted">{dossierReps.length} Reps</span>
</div>
<div className="space-y-2 max-h-64 overflow-y-auto">
{dossierReps.length === 0 && (
  <p className="text-[11px] text-text-muted py-2">No reps found reporting to this manager code for the selected period.</p>
)}
{dossierReps.map((r) => (
<div key={r.employeeCode} className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex flex-col space-y-1 hover:border-border-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-semibold text-xs text-text-primary">{r.employeeName ?? r.employeeCode}</span>
<span className="px-2 py-0.5 rounded bg-surface-card text-[#b43403] font-bold text-[11px] border border-orange-200 shadow-xs">{r.jointVisitPercent.toFixed(0)}% Joint</span>
</div>
<div className="flex items-center justify-between text-[11px] text-text-secondary">
<span>{r.totalVisits} Total Visits • {r.doctorsVisited} Doctors</span>
<span className="text-[#b43403] font-medium">{r.jointVisits} Joint Visits</span>
</div>
</div>
))}
</div>
</div>
{/* Coaching scorecard — no backend source; not fabricated */}
<div className="space-y-2 pt-1">
<span className="font-display font-bold text-xs text-text-primary">Coaching Scorecard</span>
<p className="text-[11px] text-text-muted">Not backend-wired — there is no coaching rubric/scoring endpoint yet, so this section (previously fabricated 0-10 scores) has been removed.</p>
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
</>
)}
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
                Managers should accompany reps regularly to maintain a healthy joint-call percentage across the team.
              </span>
</div>
</div>
<button className="px-3.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-[#b43403] hover:bg-orange-100 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1" type="button" onClick={() => setDetail({ title: "Joint Field Guidelines", body: "Managers are expected to make regular joint field calls with their reporting reps; the Joint Call % and Rank columns reflect real analytics computed from DCR visit records." })}>
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
              <option value="">Select a manager…</option>
              {supervisors.map((s) => (<option key={s.id} value={s.id}>{s.managerName ?? s.managerCode} ({s.managerCode})</option>))}
            </select>
            <input type="date" className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={scheduleForm.date} onChange={(e) => setScheduleForm((s) => ({ ...s, date: e.target.value }))} />
          </div>
          <p className="text-[11px] text-text-muted">Session-only confirmation — there is no calendar/scheduling backend yet, so this does not persist after a page reload.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowSchedule(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a2c02] disabled:opacity-50" disabled={!scheduleForm.date.trim() || !scheduleForm.asmId} onClick={handleScheduleSubmit}>Schedule Ride</button>
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
