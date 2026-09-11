import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminActivityReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full space-y-6">
{/* Interactive Script for Navigation Sync & Table Micro-Interactions */}

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
<button className="px-3 py-1.5 text-label-md font-label-md rounded-md hover:bg-surface-card text-text-secondary transition-all" type="button">Today</button>
<button className="px-3 py-1.5 text-label-md font-label-md rounded-md hover:bg-surface-card text-text-secondary transition-all" type="button">This Week</button>
<button className="px-3 py-1.5 text-label-md font-label-md rounded-md bg-surface-card text-primary shadow-sm font-semibold transition-all" type="button">MTD (Sep)</button>
<button className="px-3 py-1.5 text-label-md font-label-md rounded-md hover:bg-surface-card text-text-secondary transition-all" type="button">Q3</button>
</div>
{/* Territory Zone Dropdown */}
<div className="relative">
<select className="h-[38px] pl-3 pr-8 rounded-lg bg-surface-card text-text-primary font-label-md text-label-md focus:outline-none appearance-none shadow-sm cursor-pointer">
<option>All Zones / Nationwide</option>
<option>North Zone (Del/NCR/PB)</option>
<option>West Zone (MH/GJ/GA)</option>
<option>South Zone (KA/TN/AP)</option>
<option>East Zone (WB/OD/NE)</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-text-muted pointer-events-none">expand_more</span>
</div>
{/* Division Select */}
<div className="relative">
<select className="h-[38px] pl-3 pr-8 rounded-lg bg-surface-card text-text-primary font-label-md text-label-md focus:outline-none appearance-none shadow-sm cursor-pointer">
<option>Cardio-Diabetic + General</option>
<option>Cardio Speciality (Vascuziv)</option>
<option>Endo &amp; Metabolic Care</option>
<option>Neuro-Psychiatry Wing</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-text-muted pointer-events-none">expand_more</span>
</div>
{/* Export Dropdown */}
<div className="relative">
<button className="h-[38px] px-3.5 rounded-lg bg-surface-card text-text-primary font-label-md text-label-md shadow-sm hover:bg-surface-subtle flex items-center gap-1.5 transition-all" type="button">
<span className="material-symbols-outlined text-[18px] text-text-secondary">file_download</span>
<span className="">Export</span>
<span className="material-symbols-outlined text-[16px] text-text-muted">arrow_drop_down</span>
</button>
<div className="hidden absolute right-0 mt-1.5 w-44 bg-surface-card rounded-lg shadow-xl z-30 py-1.5" id="export-dropdown-menu">
<button className="w-full px-3.5 py-2 text-left text-body-sm font-body-sm text-text-primary hover:bg-surface-subtle flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[16px] text-status-success">table_view</span>
<span className="">Excel Workbook (.xlsx)</span>
</button>
<button className="w-full px-3.5 py-2 text-left text-body-sm font-body-sm text-text-primary hover:bg-surface-subtle flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[16px] text-status-danger">picture_as_pdf</span>
<span className="">Audited PDF Dossier</span>
</button>
<button className="w-full px-3.5 py-2 text-left text-body-sm font-body-sm text-text-primary hover:bg-surface-subtle flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[16px] text-status-info">csv</span>
<span className="">Raw CSV Extract</span>
</button>
</div>
</div>
{/* Generate Custom Report CTA */}
<button className="h-[38px] px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover flex items-center gap-2 transition-transform active:scale-95" type="button">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span className="">+ Generate Custom Report</span>
</button>
</div>
</div>
{/* Executive Summary KPI Metric Cards (Interactive 4-Card Rhythm) */}
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
{/* Compliance Micro Track */}
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
{/* Breakdown Sparkline Simulation */}
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
<button className="report-tab-btn px-4 py-2 text-label-md font-label-md bg-surface-card text-primary shadow-sm rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap" type="button">
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
<span className="">Daily Field Call Log</span>
</button>
<button className="report-tab-btn px-4 py-2 text-label-md font-label-md text-text-secondary hover:text-text-primary rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap" type="button">
<span className="material-symbols-outlined text-[18px]">repeat</span>
<span className="">Doctor Detailing Frequency</span>
</button>
<button className="report-tab-btn px-4 py-2 text-label-md font-label-md text-text-secondary hover:text-text-primary rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap" type="button">
<span className="material-symbols-outlined text-[18px]">receipt_long</span>
<span className="">Chemist &amp; Stockist POB</span>
</button>
<button className="report-tab-btn px-4 py-2 text-label-md font-label-md text-text-secondary hover:text-text-primary rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap" type="button">
<span className="material-symbols-outlined text-[18px]">rule_folder</span>
<span className="">Missed Calls &amp; Deviations</span>
</button>
<button className="report-tab-btn px-4 py-2 text-label-md font-label-md text-text-secondary hover:text-text-primary rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap" type="button">
<span className="material-symbols-outlined text-[18px]">slideshow</span>
<span className="">VA Slide Analytics</span>
</button>
</div>
{/* Bulk Actions / Selection Indicator */}
<div className="flex items-center gap-2">
<span className="hidden px-2.5 py-1 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm font-semibold" id="selected-count-badge">
          0 Selected
        </span>
<button className="h-9 px-3 rounded-lg bg-surface-subtle hover:bg-surface-dim text-text-secondary font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
<span className="">More Filters</span>
</button>
<button className="h-9 px-3 rounded-lg bg-surface-subtle hover:bg-surface-dim text-text-secondary font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">view_column</span>
<span className="">Columns</span>
</button>
</div>
</div>
{/* Quick Search & Pill Filters Strip */}
<div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
<div className="relative flex-1 w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted">search</span>
<input className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-subtle text-text-primary placeholder:text-text-muted font-body-sm text-body-sm focus:outline-none focus:bg-surface-card focus:shadow-sm transition-all" placeholder="Search by MR Name, Employee ID, Doctor, or Headquarter..." type="text"/>
</div>
<div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
{/* Status Pills */}
<span className="text-label-sm font-label-sm text-text-muted whitespace-nowrap">Status:</span>
<button className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-text-primary text-on-primary" type="button">All</button>
<button className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-subtle text-text-secondary hover:bg-surface-dim" type="button">Approved</button>
<button className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-subtle text-text-secondary hover:bg-surface-dim" type="button">Pending Review</button>
<button className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-status-danger-bg text-status-danger hover:bg-status-danger/10 flex items-center gap-1" type="button">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span> Flagged
        </button>
<span className="text-text-muted text-[13px] px-1">|</span>
{/* Role Pills */}
<span className="text-label-sm font-label-sm text-text-muted whitespace-nowrap">Role:</span>
<button className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-subtle text-text-primary font-semibold" type="button">MR</button>
<button className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-subtle text-text-secondary hover:bg-surface-dim" type="button">ABM</button>
<button className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-subtle text-text-secondary hover:bg-surface-dim" type="button">RBM</button>
</div>
</div>
</div>
{/* Comprehensive Audited Report Data Table (High-density, executive-grade) */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden" id="audit-table">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-subtle h-table-header-height text-label-sm font-label-sm uppercase tracking-wider text-text-secondary select-none">
<th className="w-12 px-4 py-2.5">
<input className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" onchange="toggleSelectAll(this)" type="checkbox"/>
</th>
<th className="px-4 py-2.5">Field Personnel</th>
<th className="px-4 py-2.5">Submission &amp; Timing</th>
<th className="px-4 py-2.5">Call Volume</th>
<th className="px-4 py-2.5">Detailing Coverage</th>
<th className="px-4 py-2.5">POB / Order Value</th>
<th className="px-4 py-2.5">Geofence Audit</th>
<th className="px-4 py-2.5">Manager Review</th>
<th className="px-4 py-2.5 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-subtle text-table-cell font-table-cell text-text-primary">
{/* Row 1 */}
<tr className="hover:bg-surface-subtle/60 transition-colors group">
<td className="px-4 py-3">
<input className="row-selector w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" onchange="toggleRowSelection(this)" type="checkbox"/>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-brand-primary-subtle text-primary font-bold text-label-md flex items-center justify-center flex-shrink-0">
                  VJ
                </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">
                    Vikram Joshi
                  </span>
<span className="text-body-sm font-body-sm text-text-muted">MR-5520 • HQ: Ahmedabad Central</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-medium">10 Sep 2026</span>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="text-body-sm font-body-sm text-text-muted">07:15 PM</span>
<span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-status-success-bg text-status-success">On-Time</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">12 Calls</span>
<span className="text-body-sm font-body-sm text-text-muted">9 Doctors, 3 Chemists</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-wrap gap-1 max-w-xs">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">CardioCare 20 (4x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">ZiviCal D3 (5x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">GlycoZiv (3x)</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">₹84,500</span>
<span className="text-body-sm font-body-sm text-text-muted">3 secondary orders</span>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm bg-status-success-bg text-status-success font-medium">
<span className="material-symbols-outlined text-[13px]">verified</span>
                100% Verified (0 mismatch)
              </span>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm">
<span className="w-2 h-2 rounded-full bg-status-success"></span>
<span className="text-text-secondary">Approved by <strong className="text-text-primary font-medium">R. Sharma (ABM)</strong></span>
</div>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded hover:bg-surface-subtle text-primary transition-colors" title="View Full DCR Sheet" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Download PDF Summary" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Audit Logs" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-subtle/60 transition-colors group">
<td className="px-4 py-3">
<input className="row-selector w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" onchange="toggleRowSelection(this)" type="checkbox"/>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-subtle text-secondary font-bold text-label-md flex items-center justify-center flex-shrink-0">
                  AP
                </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">
                    Ananya Patel
                  </span>
<span className="text-body-sm font-body-sm text-text-muted">MR-4418 • HQ: Mumbai Suburban</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-medium">10 Sep 2026</span>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="text-body-sm font-body-sm text-text-muted">08:40 PM</span>
<span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-status-warning-bg text-status-warning">Late Sync</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">11 Calls</span>
<span className="text-body-sm font-body-sm text-text-muted">8 Doctors, 3 Chemists</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-wrap gap-1 max-w-xs">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">AtorZiv 10 (6x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">MetZiv Duo (5x)</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">₹1,12,000</span>
<span className="text-body-sm font-body-sm text-text-muted">5 secondary orders</span>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm bg-status-danger-bg text-status-danger font-medium">
<span className="material-symbols-outlined text-[13px]">fmd_bad</span>
                1 Mismatch (180m)
              </span>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm">
<span className="w-2 h-2 rounded-full bg-status-warning"></span>
<span className="text-text-secondary">Pending ABM Sign-off</span>
</div>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded hover:bg-surface-subtle text-primary transition-colors" title="View Full DCR Sheet" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Download PDF Summary" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Audit Logs" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-subtle/60 transition-colors group">
<td className="px-4 py-3">
<input className="row-selector w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" onchange="toggleRowSelection(this)" type="checkbox"/>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-status-info-bg text-status-info font-bold text-label-md flex items-center justify-center flex-shrink-0">
                  SM
                </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">
                    Suresh Menon
                  </span>
<span className="text-body-sm font-body-sm text-text-muted">MR-3902 • HQ: Bengaluru South</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-medium">10 Sep 2026</span>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="text-body-sm font-body-sm text-text-muted">06:45 PM</span>
<span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-status-success-bg text-status-success">On-Time</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">14 Calls</span>
<span className="text-body-sm font-body-sm text-text-muted">11 Doctors, 3 Chemists</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-wrap gap-1 max-w-xs">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">ZiviraNeb (7x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">PulmoFlow (4x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">CoughZiv (3x)</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">₹68,200</span>
<span className="text-body-sm font-body-sm text-text-muted">4 secondary orders</span>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm bg-status-success-bg text-status-success font-medium">
<span className="material-symbols-outlined text-[13px]">verified</span>
                100% Verified (0 mismatch)
              </span>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm">
<span className="w-2 h-2 rounded-full bg-status-success"></span>
<span className="text-text-secondary">Approved by <strong className="text-text-primary font-medium">K. Venkat (RBM)</strong></span>
</div>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded hover:bg-surface-subtle text-primary transition-colors" title="View Full DCR Sheet" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Download PDF Summary" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Audit Logs" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-subtle/60 transition-colors group">
<td className="px-4 py-3">
<input className="row-selector w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" onchange="toggleRowSelection(this)" type="checkbox"/>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-label-md flex items-center justify-center flex-shrink-0">
                  RK
                </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">
                    Rajesh Kumar
                  </span>
<span className="text-body-sm font-body-sm text-text-muted">MR-2109 • HQ: Delhi North</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-medium">10 Sep 2026</span>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="text-body-sm font-body-sm text-text-muted">07:55 PM</span>
<span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-status-success-bg text-status-success">On-Time</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">10 Calls</span>
<span className="text-body-sm font-body-sm text-text-muted">7 Doctors, 3 Chemists</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-wrap gap-1 max-w-xs">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">CardioCare 40 (5x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">TeneliZiv (4x)</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">₹52,000</span>
<span className="text-body-sm font-body-sm text-text-muted">2 secondary orders</span>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm bg-status-success-bg text-status-success font-medium">
<span className="material-symbols-outlined text-[13px]">verified</span>
                100% Verified (0 mismatch)
              </span>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm">
<span className="w-2 h-2 rounded-full bg-status-success"></span>
<span className="text-text-secondary">Approved by <strong className="text-text-primary font-medium">V. Kapoor (ABM)</strong></span>
</div>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded hover:bg-surface-subtle text-primary transition-colors" title="View Full DCR Sheet" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Download PDF Summary" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Audit Logs" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
{/* Row 5 */}
<tr className="hover:bg-surface-subtle/60 transition-colors group">
<td className="px-4 py-3">
<input className="row-selector w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" onchange="toggleRowSelection(this)" type="checkbox"/>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-status-warning-bg text-status-warning font-bold text-label-md flex items-center justify-center flex-shrink-0">
                  PS
                </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">
                    Pooja Sen
                  </span>
<span className="text-body-sm font-body-sm text-text-muted">MR-1894 • HQ: Kolkata Central</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-medium">10 Sep 2026</span>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="text-body-sm font-body-sm text-text-muted">11:10 PM</span>
<span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-status-danger-bg text-status-danger">Delayed</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">8 Calls</span>
<span className="text-body-sm font-body-sm text-text-muted">6 Doctors, 2 Chemists</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-wrap gap-1 max-w-xs">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">NeuroZiv Plus (4x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">Pregab-Z (3x)</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">₹34,800</span>
<span className="text-body-sm font-body-sm text-text-muted">1 secondary order</span>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm bg-status-warning-bg text-status-warning font-medium">
<span className="material-symbols-outlined text-[13px]">location_searching</span>
                Flagged (Low GPS)
              </span>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm">
<span className="w-2 h-2 rounded-full bg-status-warning"></span>
<span className="text-text-secondary">Clarification Requested</span>
</div>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded hover:bg-surface-subtle text-primary transition-colors" title="View Full DCR Sheet" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Download PDF Summary" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Audit Logs" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
{/* Row 6 */}
<tr className="hover:bg-surface-subtle/60 transition-colors group">
<td className="px-4 py-3">
<input className="row-selector w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" onchange="toggleRowSelection(this)" type="checkbox"/>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-label-md flex items-center justify-center flex-shrink-0">
                  DA
                </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">
                    Deepak Agarwal
                  </span>
<span className="text-body-sm font-body-sm text-text-muted">ABM-104 (Joint Work) • HQ: Pune Metro</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-medium">10 Sep 2026</span>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="text-body-sm font-body-sm text-text-muted">07:05 PM</span>
<span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-status-success-bg text-status-success">On-Time</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">9 Joint Calls</span>
<span className="text-body-sm font-body-sm text-text-muted">With MR Amit Deshmukh</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-wrap gap-1 max-w-xs">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">CardioCare 20 (6x)</span>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary">ZiviCal D3 (4x)</span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">₹1,45,000</span>
<span className="text-body-sm font-body-sm text-text-muted">6 secondary orders</span>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm bg-status-success-bg text-status-success font-medium">
<span className="material-symbols-outlined text-[13px]">verified</span>
                100% Verified (0 mismatch)
              </span>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm">
<span className="w-2 h-2 rounded-full bg-status-success"></span>
<span className="text-text-secondary">Auto-Logged (Joint Work)</span>
</div>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded hover:bg-surface-subtle text-primary transition-colors" title="View Full DCR Sheet" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Download PDF Summary" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Audit Logs" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination & Footer */}
<div className="px-4 py-3 bg-surface-card flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm font-body-sm text-text-secondary">
<div className="flex items-center gap-2">
<span className="">Showing <strong>1 to 6</strong> of <strong>4,892</strong> entries</span>
<span className="text-text-muted">|</span>
<div className="flex items-center gap-1">
<span className="text-label-sm font-label-sm text-text-muted uppercase">Rows:</span>
<select className="h-7 px-2 rounded bg-surface-subtle text-text-primary font-label-md text-label-md focus:outline-none">
<option>25</option>
<option>50</option>
<option>100</option>
</select>
</div>
</div>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle text-text-muted disabled:opacity-40" disabled={true} type="button">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-on-primary font-semibold text-label-md" type="button">1</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle text-text-primary font-medium text-label-md" type="button">2</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle text-text-primary font-medium text-label-md" type="button">3</button>
<span className="px-1 text-text-muted">...</span>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle text-text-primary font-medium text-label-md" type="button">612</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle text-text-primary" type="button">
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
<button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-secondary transition-colors" title="Export Specialty Matrix" type="button">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
</div>
{/* Specialty Metrics Bars */}
<div className="space-y-4 my-4">
{/* Cardiologists */}
<div>
<div className="flex items-center justify-between text-body-sm font-body-sm mb-1.5">
<span className="font-semibold text-text-primary flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              Cardiologists (Consultants &amp; Interventionists)
            </span>
<span className="text-text-primary font-bold">34% <span className="font-normal text-text-muted">(1,297 calls / Target: 30%)</span></span>
</div>
<div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden flex">
<div className="bg-primary h-2.5 rounded-full" style={{ "width": "34%" }}></div>
</div>
</div>
{/* Diabetologists & Endocrinologists */}
<div>
<div className="flex items-center justify-between text-body-sm font-body-sm mb-1.5">
<span className="font-semibold text-text-primary flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-status-info inline-block"></span>
              Diabetologists &amp; Endocrinologists
            </span>
<span className="text-text-primary font-bold">28% <span className="font-normal text-text-muted">(1,068 calls / Target: 28%)</span></span>
</div>
<div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden flex">
<div className="bg-status-info h-2.5 rounded-full" style={{ "width": "28%" }}></div>
</div>
</div>
{/* Consulting General Physicians */}
<div>
<div className="flex items-center justify-between text-body-sm font-body-sm mb-1.5">
<span className="font-semibold text-text-primary flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-status-warning inline-block"></span>
              General Physicians &amp; Internal Medicine
            </span>
<span className="text-text-primary font-bold">22% <span className="font-normal text-text-muted">(839 calls / Target: 25%)</span></span>
</div>
<div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden flex">
<div className="bg-status-warning h-2.5 rounded-full" style={{ "width": "22%" }}></div>
</div>
</div>
{/* Pulmonologists & Chest Physicians */}
<div>
<div className="flex items-center justify-between text-body-sm font-body-sm mb-1.5">
<span className="font-semibold text-text-primary flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-status-success inline-block"></span>
              Pulmonologists &amp; Critical Care
            </span>
<span className="text-text-primary font-bold">16% <span className="font-normal text-text-muted">(611 calls / Target: 17%)</span></span>
</div>
<div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden flex">
<div className="bg-status-success h-2.5 rounded-full" style={{ "width": "16%" }}></div>
</div>
</div>
</div>
<div className="p-3 bg-brand-primary-subtle/50 rounded-lg flex items-center justify-between">
<div className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
<span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
<span className="">Cardiology detailing exceeds quarterly focus plan by <strong>+4.0%</strong>. GP visits currently lag slightly behind plan.</span>
</div>
<button className="text-primary font-label-md text-label-md hover:underline font-semibold whitespace-nowrap" type="button">
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
{/* Top HQ 1 */}
<div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-canvas hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="font-headline-sm text-headline-sm text-text-muted w-4">#1</span>
<div>
<div className="font-semibold text-text-primary text-body-md font-body-md">Ahmedabad Metro</div>
<div className="text-body-sm font-body-sm text-text-muted">42 Active MRs • 0 Delays</div>
</div>
</div>
<div className="flex items-center gap-3">
<span className="font-bold text-status-success text-body-md font-body-md">98.4%</span>
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-success-bg text-status-success font-medium">Top HQ</span>
</div>
</div>
{/* Top HQ 2 */}
<div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-canvas hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="font-headline-sm text-headline-sm text-text-muted w-4">#2</span>
<div>
<div className="font-semibold text-text-primary text-body-md font-body-md">Pune Central</div>
<div className="text-body-sm font-body-sm text-text-muted">38 Active MRs • 1 Flagged</div>
</div>
</div>
<div className="flex items-center gap-3">
<span className="font-bold text-status-success text-body-md font-body-md">96.8%</span>
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-success-bg text-status-success font-medium">Pass</span>
</div>
</div>
{/* Top HQ 3 */}
<div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-canvas hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="font-headline-sm text-headline-sm text-text-muted w-4">#3</span>
<div>
<div className="font-semibold text-text-primary text-body-md font-body-md">Bengaluru South</div>
<div className="text-body-sm font-body-sm text-text-muted">35 Active MRs • 2 Delays</div>
</div>
</div>
<div className="flex items-center gap-3">
<span className="font-bold text-text-primary text-body-md font-body-md">95.2%</span>
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-info-bg text-status-info font-medium">Good</span>
</div>
</div>
{/* Underperforming HQ */}
<div className="flex items-center justify-between p-2.5 rounded-lg bg-status-danger-bg/40 hover:bg-status-danger-bg/70 transition-colors">
<div className="flex items-center gap-3">
<span className="font-headline-sm text-headline-sm text-status-danger w-4">#18</span>
<div>
<div className="font-semibold text-text-primary text-body-md font-body-md">Kolkata Central</div>
<div className="text-body-sm font-body-sm text-text-secondary">29 Active MRs • 9 Delays</div>
</div>
</div>
<div className="flex items-center gap-2">
<span className="font-bold text-status-danger text-body-md font-body-md">78.1%</span>
<button className="px-2.5 py-1 rounded bg-status-danger text-on-primary text-label-sm font-label-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[13px]">notification_important</span>
<span className="">Send Nudge</span>
</button>
</div>
</div>
</div>
<div className="flex items-center justify-between pt-2">
<span className="text-body-sm font-body-sm text-text-muted">National DCR Benchmark: 92.0%</span>
<a className="text-primary hover:underline font-label-md text-label-md font-semibold flex items-center gap-1" href="#">
          Full Headquarter Audit <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</div>
{/* Interactive Slide-Over DCR Audit Modal */}
<div className="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm" id="dcr-audit-modal">
<div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
{/* Modal Header */}
<div className="p-card-padding-spacious bg-surface-subtle flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-brand-primary-subtle text-primary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[24px]">description</span>
</div>
<div>
<h3 className="font-headline-lg text-headline-lg text-text-primary tracking-tight" id="modal-mr-name">
              DCR Audit Sheet
            </h3>
<p className="text-body-sm font-body-sm text-text-secondary" id="modal-mr-meta">
              MR-5520 • HQ: Ahmedabad Central
            </p>
</div>
</div>
<button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-card hover:text-text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
{/* Modal Content Body */}
<div className="p-card-padding-spacious space-y-4 max-h-[70vh] overflow-y-auto">
{/* Call Timeline Simulation */}
<div className="bg-surface-canvas p-4 rounded-xl space-y-3">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Daily Route Inspection (Sep 10, 2026)</span>
<div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-strong">
{/* Item 1 */}
<div className="relative">
<span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-status-success flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary text-[10px]">check</span>
</span>
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-sm text-headline-sm text-text-primary">Dr. Arvind Mehta (Cardiologist)</h4>
<p className="text-body-sm font-body-sm text-text-secondary">Shanti Heart Institute • 10:30 AM</p>
<p className="text-label-sm font-label-sm text-primary mt-1">Promoted: CardioCare 20mg, ZiviCal D3 • Samples Given: 4 strips</p>
</div>
<span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-status-success-bg text-status-success font-semibold">Geo-Verified (6m)</span>
</div>
</div>
{/* Item 2 */}
<div className="relative">
<span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-status-success flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary text-[10px]">check</span>
</span>
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-sm text-headline-sm text-text-primary">Apollo Pharmacy (Chemist POB)</h4>
<p className="text-body-sm font-body-sm text-text-secondary">Navrangpura Cross Road • 01:15 PM</p>
<p className="text-label-sm font-label-sm text-text-primary font-bold mt-1">POB Booked: ₹34,200 (Invoice #APO-991)</p>
</div>
<span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-status-success-bg text-status-success font-semibold">Geo-Verified (12m)</span>
</div>
</div>
{/* Item 3 */}
<div className="relative">
<span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary text-[10px]">check</span>
</span>
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-sm text-headline-sm text-text-primary">Dr. Rekha Trivedi (Endocrinologist)</h4>
<p className="text-body-sm font-body-sm text-text-secondary">LifeLine Super Speciality • 04:45 PM</p>
<p className="text-label-sm font-label-sm text-primary mt-1">Promoted: GlycoZiv 500mg • Visual Aid slides: 8 shown (4m 20s)</p>
</div>
<span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-status-success-bg text-status-success font-semibold">Geo-Verified (2m)</span>
</div>
</div>
</div>
</div>
{/* Manager Feedback Field */}
<div className="space-y-1.5">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Manager Audit Feedback &amp; Observations</label>
<textarea className="w-full p-3 rounded-lg bg-surface-subtle text-text-primary text-body-sm font-body-sm focus:outline-none focus:bg-surface-card focus:shadow-sm" placeholder="Add administrative verification notes or compliance sign-off remarks..." rows="2"></textarea>
</div>
</div>
{/* Modal Footer */}
<div className="p-card-padding-spacious bg-surface-subtle flex items-center justify-between">
<button className="px-4 py-2 rounded-lg bg-status-danger-bg text-status-danger font-label-md text-label-md hover:bg-status-danger hover:text-on-primary transition-colors flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[18px]">flag</span>
<span className="">Flag Inconsistency</span>
</button>
<div className="flex items-center gap-2">
<button className="px-4 py-2 rounded-lg hover:bg-surface-card text-text-secondary font-label-md text-label-md transition-colors" type="button">
            Cancel
          </button>
<button className="px-4 py-2 rounded-lg bg-status-success text-on-primary font-label-md text-label-md shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[18px]">done_all</span>
<span className="">Approve DCR Audit</span>
</button>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
}
