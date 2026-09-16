import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminRepVsManagerDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
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
<select className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer">
<option>All Territories (Pan-India HQ)</option>
<option>North Division (Delhi &amp; NCR)</option>
<option>West Zone (Mumbai HQ)</option>
<option>South Hub (Bengaluru HQ)</option>
<option>Eastern Coast (Kolkata)</option>
</select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<div className="relative">
<select className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer">
<option>Current Month (Sep 2026 Active)</option>
<option>August 2026 (Consolidated)</option>
<option>Q2 FY27 Overview</option>
<option>YTD Performance</option>
</select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<button className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs" title="Refresh Telemetry" type="button">
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
<button className="relative w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs" title="Notifications" type="button">
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
<button className="h-9 px-3.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center gap-2 shadow-xs transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-secondary">file_download</span>
<span>Export Joint Field Work Audit (CSV/PDF)</span>
</button>
<button className="h-9 px-4 rounded-lg bg-[#b43403] hover:bg-[#9a2c02] text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-orange-950/20 transition-all active:scale-[0.98]" type="button">
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
{/* Active Tab with Terracotta Underline/Badge */}
<button className="relative py-2.5 px-3 text-xs font-bold text-[#b43403] flex items-center gap-2 border-b-2 border-[#b43403]" type="button">
<span className="material-symbols-outlined text-[17px]">badge</span>
<span>Joint Field Work Matrix</span>
<span className="px-1.5 py-0.2 rounded-full bg-[#b43403] text-white text-[10px] font-semibold">38 ASMs</span>
</button>
<button className="py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-muted">calendar_today</span>
<span>Ride-Along Calendar &amp; Beat Sync</span>
</button>
<button className="py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-muted">fact_check</span>
<span>Coaching &amp; Detailing Scorecards</span>
<span className="px-1.5 py-0.2 rounded-full bg-surface-subtle text-text-secondary text-[10px] font-semibold">428</span>
</button>
<button className="py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-muted">fmd_bad</span>
<span>Discrepancy &amp; Deviation Log</span>
<span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">6 Flags</span>
</button>
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
<input className="w-full text-xs bg-transparent text-text-secondary placeholder-slate-400 focus:outline-none border-none p-0" placeholder="Search ASM, MR, Headquarters..." type="text"/>
</div>
<div className="flex items-center gap-2">
<select className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer">
<option>All Zones &amp; Divisions</option>
<option>West Zone (Mumbai HQ)</option>
<option>North Zone (Delhi HQ)</option>
<option>East Zone (Kolkata HQ)</option>
<option>South Zone (Bengaluru HQ)</option>
</select>
<select className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer">
<option>All Performance</option>
<option>Quota Achieved (≥12 Days)</option>
<option>On Track (10-11 Days)</option>
<option>Lagging (&lt;10 Days)</option>
</select>
<button className="h-8 w-8 rounded-lg bg-surface-subtle border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors" title="Reset Filters" type="button">
<span className="material-symbols-outlined text-[17px]">restart_alt</span>
</button>
</div>
</div>
{/* Table Card */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left text-xs text-text-secondary">
<thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
<tr className="hover:bg-surface-subtle/50 transition-colors group">
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">ASM / Supervisor &amp; Territory</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">HQ &amp; Assigned MRs</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Joint Days (Act/Tgt)</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Joint Calls</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Call Conv %</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Coaching Index</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Audit Status</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{/* Row 1: Active / Inspected (Rajesh Sharma) */}
<tr className="bg-orange-50/60 hover:bg-orange-50/80 transition-colors cursor-pointer hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3 px-3 text-center px-4 text-sm text-text-primary whitespace-nowrap">
<input defaultChecked={true} className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-xs">
                            RS
                          </div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1.5">
<span>Rajesh Sharma</span>
<span className="w-1.5 h-1.5 rounded-full bg-[#b43403]" title="Active Selection"></span>
</div>
<span className="text-[11px] text-text-muted">ASM-WEST-01 • Mumbai Metro</span>
</div>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex flex-col">
<span className="font-medium text-text-primary">12 Reps Covered</span>
<span className="text-[10px] text-text-muted">Thane, Dadar, Bandra</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">14 / 12</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">116%</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">142 Calls</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">78.4%</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1">
<span className="font-bold text-[#b43403]">8.9</span>
<span className="text-[10px] text-text-muted">/10</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold">
                          Compliant
                        </span>
</td>
<td className="py-3 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
<button className="px-2.5 py-1 rounded-md bg-[#b43403] text-white font-semibold text-xs hover:bg-[#9a2c02] transition-colors shadow-xs" type="button">
                          Active
                        </button>
</td>
</tr>
{/* Row 2: Vikrant Verma */}
<tr className="hover:bg-surface-subtle/80 transition-colors cursor-pointer hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3 px-3 text-center px-4 text-sm text-text-primary whitespace-nowrap">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0">
                            VV
                          </div>
<div>
<div className="font-semibold text-text-primary">Vikrant Verma</div>
<span className="text-[11px] text-text-muted">ASM-NORTH-02 • New Delhi</span>
</div>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex flex-col">
<span className="font-medium text-text-primary">10 Reps Covered</span>
<span className="text-[10px] text-text-muted">Rohini, Connaught, Noida</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">11 / 12</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-warning-bg text-status-warning text-[10px] font-bold">92%</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">118 Calls</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">71.2%</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1">
<span className="font-bold text-text-secondary">8.1</span>
<span className="text-[10px] text-text-muted">/10</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning border border-status-warning-bg text-[10px] font-bold">
                          Pending 1d
                        </span>
</td>
<td className="py-3 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
<button className="px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors" type="button">
                          Inspect
                        </button>
</td>
</tr>
{/* Row 3: Debopriya Das */}
<tr className="hover:bg-surface-subtle/80 transition-colors cursor-pointer hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3 px-3 text-center px-4 text-sm text-text-primary whitespace-nowrap">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0">
                            DD
                          </div>
<div>
<div className="font-semibold text-text-primary">Debopriya Das</div>
<span className="text-[11px] text-text-muted">ASM-EAST-01 • Kolkata Hub</span>
</div>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex flex-col">
<span className="font-medium text-text-primary">11 Reps Covered</span>
<span className="text-[10px] text-text-muted">Howrah, Salt Lake, Alipore</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">13 / 12</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">108%</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">135 Calls</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">74.0%</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1">
<span className="font-bold text-text-secondary">8.5</span>
<span className="text-[10px] text-text-muted">/10</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold">
                          Compliant
                        </span>
</td>
<td className="py-3 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
<button className="px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors" type="button">
                          Inspect
                        </button>
</td>
</tr>
{/* Row 4: Srinivas Murthy (Flagged Deficit) */}
<tr className="bg-rose-50/40 hover:bg-rose-50/70 transition-colors cursor-pointer hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3 px-3 text-center px-4 text-sm text-text-primary whitespace-nowrap">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-display font-bold text-xs shrink-0">
                            SM
                          </div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1">
<span>Srinivas Murthy</span>
<span className="material-symbols-outlined text-[14px] text-rose-600" title="Field Deficit Warning">warning</span>
</div>
<span className="text-[11px] text-text-muted">ASM-SOUTH-01 • Bengaluru</span>
</div>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex flex-col">
<span className="font-medium text-text-primary">9 Reps Covered</span>
<span className="text-[10px] text-text-muted">Indiranagar, Whitefield</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1.5">
<span className="font-bold text-rose-600">8 / 12</span>
<span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">67% Lag</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">82 Calls</td>
<td className="py-3 px-3 font-semibold text-rose-600 px-4 text-sm text-text-primary whitespace-nowrap">62.1%</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1">
<span className="font-bold text-rose-600">6.8</span>
<span className="text-[10px] text-text-muted">/10</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          Lagging
                        </span>
</td>
<td className="py-3 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
<button className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 font-semibold text-xs hover:bg-rose-200 transition-colors" type="button">
                          Flagged
                        </button>
</td>
</tr>
{/* Row 5: Balasubramanian */}
<tr className="hover:bg-surface-subtle/80 transition-colors cursor-pointer hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3 px-3 text-center px-4 text-sm text-text-primary whitespace-nowrap">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0">
                            BS
                          </div>
<div>
<div className="font-semibold text-text-primary">Balasubramanian</div>
<span className="text-[11px] text-text-muted">ASM-SOUTH-02 • Chennai Central</span>
</div>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex flex-col">
<span className="font-medium text-text-primary">10 Reps Covered</span>
<span className="text-[10px] text-text-muted">T. Nagar, Anna Nagar, Adyar</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">12 / 12</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">100%</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">126 Calls</td>
<td className="py-3 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">75.8%</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-1">
<span className="font-bold text-text-secondary">8.3</span>
<span className="text-[10px] text-text-muted">/10</span>
</div>
</td>
<td className="py-3 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold">
                          Compliant
                        </span>
</td>
<td className="py-3 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
<button className="px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors" type="button">
                          Inspect
                        </button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination Footer */}
<div className="p-3 bg-surface-subtle/80 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
<span>Showing 5 of 38 Field Supervisors</span>
<div className="flex items-center gap-1">
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card text-text-muted hover:text-text-secondary flex items-center justify-center transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button className="w-7 h-7 rounded bg-[#b43403] text-white font-bold text-xs flex items-center justify-center shadow-xs" type="button">
                    1
                  </button>
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center justify-center" type="button">
                    2
                  </button>
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center justify-center" type="button">
                    3
                  </button>
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors" type="button">
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
<div className="font-display font-bold text-base text-text-primary">#ASM-WEST-01</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#b43403] border border-orange-200 text-xs font-bold flex items-center gap-1 shadow-xs">
<span className="material-symbols-outlined text-[14px]">military_tech</span> Top Mentor
                </span>
</div>
{/* Manager Bio Card */}
<div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle/60 flex items-center gap-3">
<div className="w-12 h-12 rounded-xl bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-base shadow-sm shadow-orange-950/20 shrink-0">
                  RS
                </div>
<div className="flex flex-col min-w-0">
<span className="font-display font-bold text-sm text-text-primary truncate">Rajesh Sharma</span>
<span className="text-xs text-text-secondary truncate">Area Sales Manager • Mumbai &amp; Thane</span>
<span className="text-[11px] text-text-muted truncate">Reports to: Vikram Singhania (ZSM - West)</span>
</div>
</div>
{/* Field Adherence Circular Gauge */}
<div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-50/70 to-slate-50 border border-orange-200/60 flex items-center justify-between">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Field Adherence</span>
<div className="font-display font-bold text-xl text-text-primary">14 Days</div>
<span className="text-xs text-text-secondary">Target: 12 Days (116%)</span>
</div>
<div className="w-14 h-14 relative flex items-center justify-center shrink-0">
<svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-orange-200/70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-[#b43403]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3.5"></path>
</svg>
<span className="absolute font-display font-bold text-xs text-[#b43403]">116%</span>
</div>
</div>
{/* Rep Mentorship Split for September */}
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-display font-bold text-xs text-text-primary">Rep Mentorship Split (Sep)</span>
<span className="text-[11px] text-text-muted">3 of 12 Reps shown</span>
</div>
<div className="space-y-2">
{/* Rep 1 */}
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex flex-col space-y-1 hover:border-border-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-semibold text-xs text-text-primary">Rahul Sharma (Sr MR - Dadar)</span>
<span className="px-2 py-0.5 rounded bg-surface-card text-[#b43403] font-bold text-[11px] border border-orange-200 shadow-xs">3 Days</span>
</div>
<div className="flex items-center justify-between text-[11px] text-text-secondary">
<span>28 Joint Calls</span>
<span className="text-[#b43403] font-medium">Focus: CardioCare 20 Launch</span>
</div>
</div>
{/* Rep 2 */}
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex flex-col space-y-1 hover:border-border-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-semibold text-xs text-text-primary">Amit Duggal (MR - Bandra)</span>
<span className="px-2 py-0.5 rounded bg-surface-card text-[#b43403] font-bold text-[11px] border border-orange-200 shadow-xs">2 Days</span>
</div>
<div className="flex items-center justify-between text-[11px] text-text-secondary">
<span>22 Joint Calls</span>
<span className="text-[#b43403] font-medium">Focus: GlycoZiv XR Conversion</span>
</div>
</div>
{/* Rep 3 */}
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex flex-col space-y-1 hover:border-border-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-semibold text-xs text-text-primary">Sneha Patel (MR - Thane)</span>
<span className="px-2 py-0.5 rounded bg-surface-card text-[#b43403] font-bold text-[11px] border border-orange-200 shadow-xs">3 Days</span>
</div>
<div className="flex items-center justify-between text-[11px] text-text-secondary">
<span>31 Joint Calls</span>
<span className="text-[#b43403] font-medium">Focus: A+ KOL Conversion</span>
</div>
</div>
</div>
</div>
{/* Coaching Scorecard Rubric Breakdown */}
<div className="space-y-2.5 pt-1">
<span className="font-display font-bold text-xs text-text-primary">Coaching Scorecard Rubric</span>
<div className="space-y-2 text-xs">
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Scientific Knowledge &amp; Brand Positioning</span>
<span className="font-bold text-text-primary">9.2 / 10</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "92%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Objection Handling &amp; Doctor Feedback</span>
<span className="font-bold text-text-primary">8.6 / 10</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "86%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Closing &amp; Sample Handover Discipline</span>
<span className="font-bold text-text-primary">8.8 / 10</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "88%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">RCPA Audit &amp; Chemist Stockist Cross-Check</span>
<span className="font-bold text-text-primary">8.2 / 10</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "82%" }}></div>
</div>
</div>
</div>
</div>
{/* Action CTAs */}
<div className="flex flex-col space-y-2 pt-2">
<button className="w-full h-9 rounded-lg bg-[#b43403] text-white text-xs font-semibold hover:bg-[#9a2c02] transition-colors flex items-center justify-center gap-2 shadow-xs" type="button">
<span className="material-symbols-outlined text-[17px]">download</span>
<span>Download Joint Field Audit Report</span>
</button>
<button className="w-full h-9 rounded-lg border border-border-subtle bg-surface-subtle text-text-secondary text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2" type="button">
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
<button className="px-3.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-[#b43403] hover:bg-orange-100 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1" type="button">
<span>View Joint Field Guidelines</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</div>
</div>

    </div>
  );
}
