import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminMisReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      

<div className="flex flex-col w-full">
{/* Dynamic Workspace Container */}
<div className="space-y-6">
{/* Top Utility Ribbon & Executive Header */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-surface-card p-card-padding-standard rounded-xl shadow-sm">
<div className="space-y-1">
<div className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">
<a className="hover:text-primary transition-colors" href="#">Platform</a>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">MIS Reports</span>
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm ml-2">
<span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
            Live HQ Sync • 1m ago
          </span>
</div>
<h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Management Information System (MIS)</h1>
<p className="font-body-sm text-body-sm text-text-secondary max-w-3xl">
          Consolidated executive telemetry: secondary sales variance, territory field productivity, tier-1 doctor frequency adherence, and brand-level margin realization.
        </p>
</div>
{/* Quick Actions Toolbar */}
<div className="flex flex-wrap items-center gap-2.5">
<button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-surface-variant text-text-secondary font-label-md text-label-md transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">schedule_send</span>
<span className="">Schedule Dispatch</span>
</button>
<div className="relative inline-block text-left" id="exportMenuWrapper">
<button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-surface-variant text-text-secondary font-label-md text-label-md transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">sim_card_download</span>
<span className="">Export MIS</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</button>
<div className="hidden absolute right-0 mt-1.5 w-48 rounded-lg bg-surface-card shadow-xl py-1 z-30" id="exportMenu">
<a className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:bg-surface-subtle font-body-sm text-body-sm" href="#">
<span className="material-symbols-outlined text-[16px] text-status-success">table_chart</span> Executive Excel (XLSX)
            </a>
<a className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:bg-surface-subtle font-body-sm text-body-sm" href="#">
<span className="material-symbols-outlined text-[16px] text-status-danger">picture_as_pdf</span> Executive Boardpack (PDF)
            </a>
<a className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:bg-surface-subtle font-body-sm text-body-sm" href="#">
<span className="material-symbols-outlined text-[16px] text-status-info">terminal</span> Direct SQL Query Dump
            </a>
</div>
</div>
<button className="button" type="button">
<span className="material-symbols-outlined text-[18px]">tune</span>
<span className="">Build Custom Query</span>
</button>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
{/* Period & Temporal Switcher Strip */}
<div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card px-4 py-2.5 rounded-xl shadow-sm">
<div className="flex items-center gap-1 overflow-x-auto py-0.5">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mr-2 hidden sm:inline">Timeline:</span>
<button className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">Today</button>
<button className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">This Week</button>
<button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm" type="button">MTD (Sep FY26)</button>
<button className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">Q3 FY26</button>
<button className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">YTD Consolidated</button>
<button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">calendar_today</span>
<span className="">Custom</span>
</button>
</div>
<div className="flex items-center gap-3">
<div className="text-text-secondary font-body-sm text-body-sm flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-text-muted">account_tree</span>
<span className="">Scope: <strong>All Divisions (Cardio, Diabetic, Derma)</strong></span>
</div>
<div className="h-4 w-px bg-surface-subtle"></div>
<span className="font-label-sm text-label-sm text-text-muted">Working Days Passed: <strong>21 / 25</strong></span>
</div>
</div>
{/* Executive KPI Metric Cards (4-Column Bento Row) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-grid-gutter">
{/* Card 1: Net Secondary Sales Achievement */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Secondary Sales (MTD)</span>
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">currency_rupee</span>
</div>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">₹4.86 Cr</span>
<span className="font-label-md text-label-md text-text-secondary">/ ₹5.10 Cr Target</span>
</div>
{/* Progress micro-bar */}
<div className="w-full bg-surface-subtle h-2 rounded-full mt-2.5 overflow-hidden">
<div className="bg-primary h-full rounded-full transition-all duration-500" style={{ "width": "95.3%" }}></div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="inline-flex items-center gap-1 font-semibold text-status-success">
<span className="material-symbols-outlined text-[16px]">trending_up</span> +14.2% MoM
          </span>
<span className="text-text-muted">Gap: <strong className="text-status-warning font-semibold">₹24.0 Lakh</strong></span>
</div>
</div>
{/* Card 2: Field Productivity Ratio */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Field Rep Productivity</span>
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">speed</span>
</div>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">11.2</span>
<span className="font-label-md text-label-md text-text-secondary">Calls/MR/Day</span>
</div>
<div className="flex items-center justify-between mt-1 text-text-secondary font-body-sm text-body-sm">
<span className="">Avg POB: <strong>₹38,400 / Day</strong></span>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-subtle">Norm: 10.0</span>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="text-text-muted">Active Force: <strong>420 / 438</strong></span>
<span className="inline-flex items-center gap-1 font-semibold text-status-success">
<span className="material-symbols-outlined text-[16px]">trending_up</span> +6.8% vs Q2
          </span>
</div>
</div>
{/* Card 3: Doctor Coverage & Frequency Adherence */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">HCP List Coverage</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">person_check</span>
</div>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">92.4%</span>
<span className="font-label-md text-label-md text-status-success font-semibold">Tier-1 Optimal</span>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full mt-2.5 overflow-hidden">
<div className="bg-status-success h-full rounded-full transition-all duration-500" style={{ "width": "92.4%" }}></div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="text-text-muted">A+ Tier Coverage: <strong>97.1%</strong></span>
<span className="text-text-muted">Repeat Adh: <strong className="text-text-primary">88.6%</strong></span>
</div>
</div>
{/* Card 4: Sample & Detailing Yield */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Sample Conversion ROI</span>
<div className="w-8 h-8 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">vaccines</span>
</div>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">3.42x</span>
<span className="font-label-md text-label-md text-text-secondary">Yield Ratio</span>
</div>
<div className="flex items-center justify-between mt-1 text-text-secondary font-body-sm text-body-sm">
<span className="">₹18.2L Out <span className="material-symbols-outlined text-[14px] align-middle text-text-muted">arrow_forward</span> ₹62.4L Rx</span>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="text-status-danger font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">warning</span> 14 Reps Zero-POB Flag
          </span>
<a className="text-primary hover:underline font-label-sm text-label-sm" href="#">Audit</a>
</div>
</div>
</div>
{/* Navigation Sub-Tabs for MIS Multi-Perspective Analysis */}
<div className="bg-surface-card rounded-xl p-1.5 shadow-sm flex flex-wrap items-center gap-1">
<button className="button" type="button">
<span className="material-symbols-outlined text-[18px]">hub</span>
<span className="">Division &amp; Territory Sales Variance</span>
</button>
<button className="flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">grid_view</span>
<span className="">HQ Productivity Matrix</span>
</button>
<button className="flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">pie_chart</span>
<span className="">Brand Basket Performance</span>
</button>
<button className="flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">query_stats</span>
<span className="">Doctor Detailing Yield &amp; ROI</span>
</button>
<button className="flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">mark_email_read</span>
<span className="">Scheduled Automated MIS Reports</span>
</button>
</div>
{/* Main Data Table Container with Filters & Controls */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
{/* Filter Bar & Search Sub-Header */}
<div className="p-card-padding-standard flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-subtle">
{/* Search bar */}
<div className="relative flex-1 max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[19px]">search</span>
<input className="w-full h-[38px] pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search zone, territory HQ, RSM/ABM, or product SKU..." type="text"/>
</div>
{/* Filter Clusters */}
<div className="flex flex-wrap items-center gap-2">
{/* Zone Filter Pills */}
<div className="inline-flex rounded-lg bg-surface-canvas p-0.5">
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md bg-surface-card text-text-primary shadow-sm">All Zones (18)</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">North</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">West Metro</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">South Zone</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">East Central</button>
</div>
{/* Performance Tier Filter */}
<select className="h-[34px] px-2.5 rounded-lg bg-surface-canvas text-text-secondary font-label-md text-label-md focus:outline-none cursor-pointer">
<option>All Tiers</option>
<option>Exceeding Target (&gt;100%)</option>
<option>On-Track (90-100%)</option>
<option>Critical Deficit (&lt;85%)</option>
</select>
{/* Utility icon buttons */}
<button className="w-[34px] h-[34px] rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-secondary flex items-center justify-center transition-colors" title="Column Settings">
<span className="material-symbols-outlined text-[18px]">view_column</span>
</button>
<button className="w-[34px] h-[34px] rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-secondary flex items-center justify-center transition-colors" title="Sort Order">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
</button>
</div>
</div>
{/* Master MIS Sales & Productivity Matrix Table */}
<div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
<tr className="bg-surface-subtle text-text-secondary font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-subtle/50 transition-colors group">
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Territory / HQ Node</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Division</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Target (₹)</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">MTD Achieved</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Progress %</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Variance</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Daily Calls</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Core Coverage</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">POB Booked</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Operational Flag</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{/* Row 1: Top Performer */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-success" title="Healthy Execution"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Ahmedabad Metro - HQ-041</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Rajesh Varma • 18 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-info-bg text-status-info font-medium">Cardio-Diabetic</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹52,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹56,42,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-success font-label-md text-label-md">108.5%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-success h-full" style={{ "width": "100%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-success text-sm text-text-primary whitespace-nowrap">
                +₹4,42,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-text-primary">12.4</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-success-bg text-status-success font-semibold">96.8%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹14.8 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-success-bg text-status-success border border-status-success-border font-semibold">
<span className="material-symbols-outlined text-[13px]">stars</span> Top Performer
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-success hover:bg-surface-subtle transition-colors" title="Send Commendation">
<span className="material-symbols-outlined text-[18px]">thumb_up</span>
</button>
</div>
</td>
</tr>
{/* Row 2: Balanced / On Track */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-info" title="Balanced Velocity"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Bengaluru Urban - HQ-012</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: S. Parthiban • 22 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-purple-50 text-purple-700 font-medium">Neuro-Ziv</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹68,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹65,28,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-text-primary font-label-md text-label-md">96.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-info h-full" style={{ "width": "96%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-warning text-sm text-text-primary whitespace-nowrap">
                -₹2,72,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-text-primary">11.1</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-info-bg text-status-info font-semibold">92.1%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹18.4 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-subtle text-text-secondary border border-border-subtle font-semibold">
<span className="material-symbols-outlined text-[13px]">check_circle</span> Balanced
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Send Feedback">
<span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
</button>
</div>
</td>
</tr>
{/* Row 3: Call Deficit Flag */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-warning" title="Field Effort Lagging"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Delhi North &amp; Rohini - HQ-004</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Tarun Mehra • 14 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-warning-bg text-status-warning font-medium">Resp-Care</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹44,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹39,16,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-warning font-label-md text-label-md">89.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-warning h-full" style={{ "width": "89%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-danger text-sm text-text-primary whitespace-nowrap">
                -₹4,84,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-status-danger">8.4</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-warning-bg text-status-warning font-semibold">81.4%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹9.2 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-warning-bg text-status-warning border border-status-warning-border font-semibold">
<span className="material-symbols-outlined text-[13px]">phone_missed</span> Call Deficit
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-warning hover:bg-surface-subtle transition-colors" title="Dispatch Notice">
<span className="material-symbols-outlined text-[18px]">notification_important</span>
</button>
</div>
</td>
</tr>
{/* Row 4: Critical Deficit */}
<tr className="hover:bg-surface-subtle/60 transition-colors group bg-status-danger-bg/20 hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-danger" title="Critical Run-rate Risk"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Kolkata Central &amp; Howrah - HQ-088</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Debashis Roy • 16 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-info-bg text-status-info font-medium">Cardio-Diabetic</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹58,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-status-danger text-sm text-text-primary whitespace-nowrap">₹44,08,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-danger font-label-md text-label-md">76.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-danger h-full" style={{ "width": "76%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-danger text-sm text-text-primary whitespace-nowrap">
                -₹13,92,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-status-danger">7.8</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-danger-bg text-status-danger font-semibold">73.5%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹8.1 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-danger-bg text-status-danger border border-status-danger-border font-semibold">
<span className="material-symbols-outlined text-[13px]">crisis_alert</span> Target At Risk
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Trigger RSM Review">
<span className="material-symbols-outlined text-[18px]">report_problem</span>
</button>
</div>
</td>
</tr>
{/* Row 5: High Value Performer */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-success" title="High Run-rate"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Mumbai Thane &amp; Navi - HQ-009</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Vikram Shinde • 24 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-teal-50 text-teal-700 font-medium">Derma-Care</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹62,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹64,48,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-success font-label-md text-label-md">104.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-success h-full" style={{ "width": "100%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-success text-sm text-text-primary whitespace-nowrap">
                +₹2,48,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-text-primary">11.8</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-success-bg text-status-success font-semibold">94.2%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹21.6 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-success-bg text-status-success border border-status-success-border font-semibold">
<span className="material-symbols-outlined text-[13px]">verified</span> Strong Pace
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Send Feedback">
<span className="material-symbols-outlined text-[18px]">thumb_up</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination & Table Summary Footer */}
<div className="px-card-padding-standard py-3 bg-surface-subtle/50 flex flex-wrap items-center justify-between gap-3 text-text-secondary font-body-sm text-body-sm">
<div className="flex items-center gap-2">
<span className="">Showing <strong>1 to 5</strong> of <strong>48 Territory HQs</strong></span>
<span className="text-text-muted">•</span>
<span className="text-text-muted">Total Secondary Sample Base: ₹2.84 Cr</span>
</div>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm disabled:opacity-40" disabled={true}>Previous</button>
<button className="px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold">1</button>
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm">2</button>
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm">3</button>
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm">Next</button>
</div>
</div>
</div>
{/* Secondary Analytical Panels: 2-Column Split */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter">
{/* Panel 1: Brand Basket Contribution vs Growth Matrix (7 cols) */}
<div className="lg:col-span-7 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-1">
<h2 className="font-headline-sm text-headline-sm text-text-primary">Brand Basket Revenue Contribution</h2>
<span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded bg-brand-primary-subtle text-primary font-semibold">MTD Analysis</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-5">
            Key pharma formulation secondary sales yield, primary prescription volume, and month-over-month trajectory.
          </p>
{/* Contribution Stacked Visual Bar */}
<div className="w-full h-4 rounded-lg flex overflow-hidden shadow-inner mb-4">
<div className="bg-primary hover:opacity-90 transition-opacity" style={{ "width": "34.6%" }} title="CardioCare 20 (34.6%)"></div>
<div className="bg-primary-container hover:opacity-90 transition-opacity" style={{ "width": "25.1%" }} title="ZiviCal D3 Forte (25.1%)"></div>
<div className="bg-tertiary hover:opacity-90 transition-opacity" style={{ "width": "20.2%" }} title="GlycoZiv XR (20.2%)"></div>
<div className="bg-status-info hover:opacity-90 transition-opacity" style={{ "width": "11.9%" }} title="Resp-Clear Dry (11.9%)"></div>
<div className="bg-secondary-fixed-dim hover:opacity-90 transition-opacity" style={{ "width": "8.2%" }} title="Others (8.2%)"></div>
</div>
{/* Product Detailed Breakdown Rows */}
<div className="space-y-3">
{/* Brand 1 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">CardioCare 20 (Atorvastatin 20mg)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 24,100 Rx • 34.6% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹1.68 Cr</div>
<div className="font-label-sm text-label-sm text-status-success font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +18.4% MoM
                </div>
</div>
</div>
{/* Brand 2 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-primary-container flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">ZiviCal D3 Forte (Nano Drops 60K)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 19,450 Rx • 25.1% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹1.22 Cr</div>
<div className="font-label-sm text-label-sm text-status-success font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +9.2% MoM
                </div>
</div>
</div>
{/* Brand 3 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-tertiary flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">GlycoZiv XR (Metformin 1000mg ER)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 16,300 Rx • 20.2% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹0.98 Cr</div>
<div className="font-label-sm text-label-sm text-status-success font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +5.1% MoM
                </div>
</div>
</div>
{/* Brand 4 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-status-info flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">Resp-Clear Dry (Montelukast Levo)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 9,800 Rx • 11.9% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹0.58 Cr</div>
<div className="font-label-sm text-label-sm text-status-warning font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">horizontal_rule</span> Flat (Season lag)
                </div>
</div>
</div>
{/* Others */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-secondary-fixed-dim flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">Institutional &amp; All Other SKUs</div>
<div className="font-body-sm text-body-sm text-text-muted">Multiple low-volume batches • 8.2% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹0.40 Cr</div>
<div className="font-label-sm text-label-sm text-text-muted font-semibold">Target Aligned</div>
</div>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-subtle flex items-center justify-between font-label-md text-label-md">
<span className="text-text-muted">Portfolio Gross Margin Yield: <strong className="text-text-primary">68.4%</strong></span>
<a className="text-primary hover:underline flex items-center gap-1 font-semibold" href="#">
<span className="">Download Brand Basket Dossier</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
{/* Panel 2: Executive Exception Alerts & Action Triggers (5 cols) */}
<div className="lg:col-span-5 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-1">
<h2 className="font-headline-sm text-headline-sm text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-status-danger text-[20px]">notification_important</span>
<span className="">Executive Exception Alerts</span>
</h2>
<span className="w-2.5 h-2.5 rounded-full bg-status-danger animate-ping"></span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-4">
            Automated threshold anomalies requiring headquarters operational decisions or RSM escalations.
          </p>
<div className="space-y-3.5">
{/* Alert Item 1 */}
<div className="p-3.5 rounded-xl bg-status-danger-bg/40 border border-status-danger-border flex flex-col gap-2.5">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 text-status-danger font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">trending_down</span>
<span className="">East Central Cluster Deficit</span>
</div>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-status-danger-bg text-status-danger font-semibold">CRITICAL</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary">
<strong>7 Territories</strong> lagging &gt;20% target in East Central with only <strong>4 working days remaining</strong> in cycle. Immediate intervention needed.
              </p>
<div className="flex items-center justify-between pt-1">
<span className="font-label-sm text-label-sm text-text-muted">RSM: S. Chatterjee</span>
<button className="px-2.5 py-1 rounded bg-status-danger text-on-error font-label-sm text-label-sm font-semibold hover:bg-error transition-colors shadow-sm" type="button">
                  Trigger Review Meeting
                </button>
</div>
</div>
{/* Alert Item 2 */}
<div className="p-3.5 rounded-xl bg-status-warning-bg/40 border border-status-warning-border flex flex-col gap-2.5">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 text-status-warning font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">inventory</span>
<span className="">C&amp;F Stock-Out Hazard</span>
</div>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-status-warning-bg text-status-warning font-semibold">LOGISTICS</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary">
<strong>CardioCare 20</strong> stock level dropped below 4 days buffer at <strong>3 C&amp;F distributors</strong> across Bengaluru &amp; Mysore hubs.
              </p>
<div className="flex items-center justify-between pt-1">
<span className="font-label-sm text-label-sm text-text-muted">Dispatch Depot: Hosur</span>
<button className="px-2.5 py-1 rounded bg-status-warning text-text-primary font-label-sm text-label-sm font-semibold hover:bg-amber-600 hover:text-on-primary transition-colors shadow-sm" type="button">
                  Notify Supply Chain
                </button>
</div>
</div>
{/* Alert Item 3 */}
<div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col gap-2.5">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 text-text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px] text-primary">policy</span>
<span className="">Field Adherence Deviation</span>
</div>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-card text-text-secondary font-semibold">COMPLIANCE</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary">
<strong>12 MRs</strong> logged fewer than 8 daily calls minimum across Delhi North for 3 consecutive days.
              </p>
<div className="flex items-center justify-between pt-1">
<span className="font-label-sm text-label-sm text-text-muted">ABM: Tarun Mehra</span>
<button className="px-2.5 py-1 rounded bg-surface-card text-text-primary border border-border-subtle font-label-sm text-label-sm font-semibold hover:bg-surface-subtle transition-colors shadow-sm" type="button">
                  Send ABM Escalation
                </button>
</div>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-subtle flex items-center justify-between font-label-md text-label-md">
<span className="text-text-muted">Pending Audits: <strong>3 Flags</strong></span>
<a className="text-primary hover:underline font-semibold" href="#">Configure Alert Thresholds →</a>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
}
