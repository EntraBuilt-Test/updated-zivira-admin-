import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminSampleDistributionDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      
{/* Top Header Navigation Bar */}
<header className="sticky top-0 z-10 bg-surface-card/95 backdrop-blur-md border-b border-border-subtle px-6 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
{/* Breadcrumbs */}
<div className="flex items-center gap-2 text-xs text-text-secondary font-medium min-w-0 truncate"><span>Platform</span>
<span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
<span>Analytics Suite</span>
<span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
<span className="text-[#b43403] font-semibold truncate">Sample Distribution &amp; Drug Custody Audit</span></div>
{/* Global Header Controls */}
<div className="flex items-center gap-3 flex-shrink-0">
<div className="relative">
<select className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer"><option>All Territories (Pan-India HQ)</option><option>North Division (Delhi &amp; NCR)</option><option>West Zone (Mumbai HQ)</option><option>South Hub (Bengaluru HQ)</option><option>Eastern Coast (Kolkata)</option></select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<div className="relative">
<select className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer"><option>All Territories (Pan-India HQ)</option><option>North Division (Delhi &amp; NCR)</option><option>West Zone (Mumbai HQ)</option><option>South Hub (Bengaluru HQ)</option><option>Eastern Coast (Kolkata)</option></select>
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
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-5 shadow-sm"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
<div className="space-y-1.5">
<h1 className="text-xl lg:text-2xl font-display font-bold text-text-primary tracking-tight">
Physician Sample Distribution &amp; Custody Ledger
</h1>
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-xs font-semibold flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
UCPMP Compliant Batch Tracking
</span>
<span className="px-2.5 py-0.5 rounded-full bg-status-info-bg text-blue-600 border border-border-subtle text-xs font-medium">
Batch Discrepancies: 0 Critical
</span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-secondary text-xs font-medium">
Form 13-A Filing: Up to Date
</span>
</div>
</div>
<div className="flex flex-wrap items-center gap-2.5">
<button className="h-9 px-3.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center gap-2 shadow-xs transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-secondary">file_download</span>
<span>Export Form 13-A Ledger (CSV/PDF)</span>
</button>
<button className="h-9 px-4 rounded-lg bg-[#b43403] hover:bg-[#9a2c02] text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-orange-950/20 transition-all active:scale-[0.98]" type="button">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span>Allocate Sample Quota</span>
</button>
</div>
</div></div>
{/* 4-Column Executive Pulse KPI Metric Cards */}

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{/* Card 1: Total Samples Dispensed */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Samples Dispensed</span>
<div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">science</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">48,290 Pks</span>
<span className="text-xs font-semibold text-emerald-600 flex items-center">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +6.4% MoM
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "96.6%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span className="font-medium">Quota: 50,000 Pks</span>
<span className="text-[#b43403] font-semibold">96.6% Fulfillment</span>
</div>
</div>
{/* Card 2: Physician Acknowledgements */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Physician Acknowledgements (OTP/SIG)</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">verified</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">98.8%</span>
<span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">schedule</span> 580 Pending
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "98.8%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>47,710 of 48,290 Validated</span>
<span className="text-status-success font-semibold">98.8% Signed Off</span>
</div>
</div>
{/* Card 3: Expiry & Retrieval Buffer */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Expiry &amp; Retrieval Buffer</span>
<div className="w-8 h-8 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">hourglass_bottom</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">142 Pks</span>
<span className="text-xs font-semibold text-amber-600 flex items-center">
&lt;60 Days Window
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-amber-600 h-full rounded-full" style={{ "width": "28%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Quarantined &amp; Logged</span>
<span className="text-text-muted font-medium">0 Waste Breaches</span>
</div>
</div>
{/* Card 4: UCPMP Statutory Adherence */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">UCPMP Limit Adherence</span>
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">gavel</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">99.9%</span>
<span className="text-xs font-semibold text-emerald-600">
≤12 Pks/Dr/Yr
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-blue-600 h-full rounded-full" style={{ "width": "99.9%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Statutory Guardrail</span>
<span className="text-status-success font-semibold">Zero Violations</span>
</div>
</div></div>
{/* Sub-Navigation Pill Tabs */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 px-4 py-1.5 shadow-sm flex items-center justify-between overflow-x-auto"><div className="flex items-center gap-2 shrink-0">
<button className="relative py-2.5 px-3 text-xs font-bold text-[#b43403] flex items-center gap-2 border-b-2 border-[#b43403]" type="button">
<span className="material-symbols-outlined text-[17px]">medication</span>
<span>Active Sample Roster &amp; Inventory</span>
<span className="px-1.5 py-0.2 rounded-full bg-[#b43403] text-white text-[10px] font-semibold">16 SKUs</span>
</button>
<button className="py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-muted">receipt_long</span>
<span>Physician Dispensation Receipts &amp; OTP Audit</span>
<span className="px-1.5 py-0.2 rounded-full bg-surface-subtle text-text-secondary text-[10px] font-semibold">47.7k Validated</span>
</button>
<button className="py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-muted">backpack</span>
<span>MR Bag Stock &amp; Depot Reconciliation</span>
</button>
<button className="py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors" type="button">
<span className="material-symbols-outlined text-[17px] text-text-muted">assignment_return</span>
<span>Batch Recall &amp; Damaged Goods Ledger</span>
<span className="px-1.5 py-0.2 rounded-full bg-status-warning-bg text-status-warning border border-status-warning-bg text-[10px] font-bold">1 Pending</span>
</button>
</div>
<div className="hidden xl:flex items-center gap-1.5 text-xs text-text-muted pl-4">
<span className="material-symbols-outlined text-[15px]">sync</span>
<span>Depot Ledger Synced 8m ago</span>
</div></div>
{/* DUAL-PANE INTERACTIVE CONTENT */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
{/* LEFT COLUMN: Supervisory Roster Table (Col 8) */}
<div className="lg:col-span-8 flex flex-col space-y-4">
{/* Filters Strip */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3"><div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-text-muted focus-within:border-[#b43403] focus-within:ring-1 focus-within:ring-[#b43403]/20 transition-all">
<span className="material-symbols-outlined text-[17px]">search</span>
<input className="w-full text-xs bg-transparent text-text-secondary placeholder-slate-400 focus:outline-none border-none p-0" placeholder="Search SKU, Batch No, Molecule..." type="text"/>
</div>
<div className="flex items-center gap-2">
<select className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer">
<option>All Therapeutic Categories</option>
<option>Cardiology</option>
<option>Diabetology</option>
<option>Pulmonology</option>
<option>Orthopedics</option>
<option>Gastroenterology</option>
</select>
<select className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer">
<option>Stock Status: All</option>
<option>Sufficient Depot Stock</option>
<option>Near Expiry (&lt;60 Days)</option>
<option>Quota Exhausted</option>
</select>
<button className="h-8 w-8 rounded-lg bg-surface-subtle border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors" title="Reset Filters" type="button">
<span className="material-symbols-outlined text-[17px]">restart_alt</span>
</button>
</div></div>
{/* Table Card */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left text-xs text-text-secondary"><thead className="bg-surface-subtle/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-text-secondary">
<tr>
<th className="py-3 px-3 w-8 text-center">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</th>
<th className="py-3 px-3">SKU &amp; Molecule</th>
<th className="py-3 px-3">Therapeutic Class</th>
<th className="py-3 px-3">Batch No &amp; Expiry</th>
<th className="py-3 px-3">Depot Quota</th>
<th className="py-3 px-3">Dispensed to HCPs</th>
<th className="py-3 px-3">MR Bag Stock</th>
<th className="py-3 px-3">Custody Status</th>
<th className="py-3 px-3 text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{/* Row 1: CardioCare 20mg (Active selected) */}
<tr className="bg-orange-50/60 hover:bg-orange-50/80 transition-colors cursor-pointer">
<td className="py-3 px-3 text-center">
<input defaultChecked={true} className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-xs">
CC
</div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1.5">
<span>CardioCare 20mg</span>
<span className="w-1.5 h-1.5 rounded-full bg-[#b43403]" title="Active Selection"></span>
</div>
<span className="text-[11px] text-text-muted">Atorvastatin 20mg + Aspirin Tab</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-md bg-status-info-bg text-blue-600 font-medium text-[11px]">Cardiology</span>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">#CC-902</span>
<span className="text-[10px] text-text-muted">Exp: May 2028</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">14,500 Pks</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">13,820</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">95.3%</span>
</div>
</td>
<td className="py-3 px-3 font-medium text-text-secondary">680 Pks</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold">
Compliant
</span>
</td>
<td className="py-3 px-3 text-right">
<button className="px-2.5 py-1 rounded-md bg-[#b43403] text-white font-semibold text-xs hover:bg-[#9a2c02] transition-colors shadow-xs" type="button">
Active
</button>
</td>
</tr>
{/* Row 2: GlycoZiv XR 500 */}
<tr className="hover:bg-surface-subtle/80 transition-colors cursor-pointer">
<td className="py-3 px-3 text-center">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0">
GZ
</div>
<div>
<div className="font-semibold text-text-primary">GlycoZiv XR 500</div>
<span className="text-[11px] text-text-muted">Metformin 500mg + Dapagliflozin</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-md bg-status-success-bg text-status-success font-medium text-[11px]">Diabetology</span>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">#GZ-418</span>
<span className="text-[10px] text-text-muted">Exp: Aug 2027</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">12,000 Pks</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">11,640</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">97.0%</span>
</div>
</td>
<td className="py-3 px-3 font-medium text-text-secondary">360 Pks</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold">
Compliant
</span>
</td>
<td className="py-3 px-3 text-right">
<button className="px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors" type="button">
Inspect
</button>
</td>
</tr>
{/* Row 3: Resp-Clear Inhaler 200mcg */}
<tr className="hover:bg-surface-subtle/80 transition-colors cursor-pointer">
<td className="py-3 px-3 text-center">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0">
RC
</div>
<div>
<div className="font-semibold text-text-primary">Resp-Clear Inhaler 200</div>
<span className="text-[11px] text-text-muted">Budesonide + Formoterol Inhaler</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-medium text-[11px]">Pulmonology</span>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">#RC-104</span>
<span className="text-[10px] text-text-muted">Exp: Jan 2028</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">8,200 Pks</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">7,850</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">95.7%</span>
</div>
</td>
<td className="py-3 px-3 font-medium text-text-secondary">350 Pks</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold">
Compliant
</span>
</td>
<td className="py-3 px-3 text-right">
<button className="px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors" type="button">
Inspect
</button>
</td>
</tr>
{/* Row 4: ZiviCal D3 Forte */}
<tr className="hover:bg-surface-subtle/80 transition-colors cursor-pointer">
<td className="py-3 px-3 text-center">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0">
ZC
</div>
<div>
<div className="font-semibold text-text-primary">ZiviCal D3 Forte</div>
<span className="text-[11px] text-text-muted">Cholecalciferol 60,000 IU Softgels</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-md bg-status-warning-bg text-status-warning font-medium text-[11px]">Orthopedics</span>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">#ZC-332</span>
<span className="text-[10px] text-text-muted">Exp: Oct 2027</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">7,500 Pks</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">7,120</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">94.9%</span>
</div>
</td>
<td className="py-3 px-3 font-medium text-text-secondary">380 Pks</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold">
Compliant
</span>
</td>
<td className="py-3 px-3 text-right">
<button className="px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors" type="button">
Inspect
</button>
</td>
</tr>
{/* Row 5: GastroZiv DSR (Near Expiry Alert) */}
<tr className="bg-status-warning-bg/40 hover:bg-status-warning-bg/70 transition-colors cursor-pointer">
<td className="py-3 px-3 text-center">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-amber-100 text-status-warning flex items-center justify-center font-display font-bold text-xs shrink-0">
GD
</div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1">
<span>GastroZiv DSR</span>
<span className="material-symbols-outlined text-[14px] text-amber-600" title="Expiry Approaching">warning</span>
</div>
<span className="text-[11px] text-text-muted">Rabeprazole 20mg + Domperidone 30mg</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium text-[11px]">Gastroenterology</span>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">#GD-619</span>
<span className="text-[10px] text-status-warning font-semibold">Exp: Nov 2026 (&lt;60d)</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">6,090 Pks</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">5,860</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-warning-bg text-status-warning text-[10px] font-bold">96.2%</span>
</div>
</td>
<td className="py-3 px-3 font-medium text-status-warning font-bold">230 Pks</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning border border-status-warning-bg text-[10px] font-bold">
Near Expiry
</span>
</td>
<td className="py-3 px-3 text-right">
<button className="px-2.5 py-1 rounded-md bg-amber-100 text-status-warning font-semibold text-xs hover:bg-amber-200 transition-colors" type="button">
Recall / Audit
</button>
</td>
</tr>
</tbody></table>
</div>
{/* Pagination Footer */}
<div className="p-3 bg-surface-subtle/80 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
<span>Showing 5 of 16 Core SKU Batches</span>
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
<div className="lg:col-span-4 flex flex-col space-y-4"><div className="bg-surface-card rounded-xl border border-border-subtle/80 p-5 shadow-sm space-y-4 relative">
{/* Batch Dossier Header */}
<div className="flex items-center justify-between border-b border-slate-100 pb-3">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sample Batch Dossier</span>
<div className="font-display font-bold text-base text-text-primary">#SKU-CC-20MG</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-xs font-bold flex items-center gap-1 shadow-xs">
<span className="material-symbols-outlined text-[14px]">verified</span> UCPMP Certified
</span>
</div>
{/* SKU Card */}
<div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle/60 flex items-center gap-3">
<div className="w-12 h-12 rounded-xl bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-base shadow-sm shadow-orange-950/20 shrink-0">
CC
</div>
<div className="flex flex-col min-w-0">
<span className="font-display font-bold text-sm text-text-primary truncate">CardioCare 20mg</span>
<span className="text-xs text-text-secondary truncate">Batch #CC-902 • Exp: May 2028</span>
<span className="text-[11px] text-text-muted truncate">Atorvastatin 20mg + Aspirin 75mg Capsule</span>
</div>
</div>
{/* Batch Custody & Reconciliation Metric */}
<div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-50/70 to-slate-50 border border-orange-200/60 flex items-center justify-between">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Field Custody Match</span>
<div className="font-display font-bold text-xl text-text-primary">13,820 Pks</div>
<span className="text-xs text-text-secondary">Dispensed of 14,500 Quota (95.3%)</span>
</div>
<div className="w-14 h-14 relative flex items-center justify-center shrink-0">
<svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-orange-200/70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-[#b43403]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="95, 100" strokeWidth="3.5"></path>
</svg>
<span className="absolute font-display font-bold text-xs text-[#b43403]">95.3%</span>
</div>
</div>
{/* Depot to Field Custody Flow */}
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-display font-bold text-xs text-text-primary">Depot-to-Field Flow Audit</span>
<span className="text-[11px] text-status-success font-semibold">100% In-Transit Match</span>
</div>
<div className="space-y-2 text-xs">
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-text-secondary">warehouse</span>
<span className="font-medium text-text-secondary">Central Depot Dispense</span>
</div>
<span className="font-bold text-text-primary">14,500 Pks</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-text-secondary">local_shipping</span>
<span className="font-medium text-text-secondary">Received by 428 Field MRs</span>
</div>
<span className="font-bold text-text-primary">14,500 Pks</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
<span className="font-medium text-text-secondary">HCP OTP / Signed Receipts</span>
</div>
<span className="font-bold text-status-success">13,820 Pks (98.9%)</span>
</div>
</div>
</div>
{/* Top Prescriber Allocation Split */}
<div className="space-y-2.5 pt-1">
<span className="font-display font-bold text-xs text-text-primary">Top Prescriber Specialty Allocation</span>
<div className="space-y-2 text-xs">
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Interventional Cardiologists</span>
<span className="font-bold text-text-primary">8,420 Pks (61%)</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "61%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Consulting Physicians (MD Medicine)</span>
<span className="font-bold text-text-primary">4,200 Pks (30%)</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "30%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Diabetologists &amp; Endocrine Clinics</span>
<span className="font-bold text-text-primary">1,200 Pks (9%)</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "9%" }}></div>
</div>
</div>
</div>
</div>
{/* Statutory UCPMP Compliance Guardrail Notice */}
<div className="p-2.5 rounded-lg bg-status-success-bg border border-status-success-bg text-[11px] text-emerald-800 space-y-1">
<div className="font-bold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px]">gavel</span>
<span>Statutory UCPMP Guardrail</span>
</div>
<p className="text-status-success leading-snug">
Strict limit of ≤12 packs/doctor/year enforced via 2D Barcode Scan &amp; OTP verification. Zero sample sale warning stamped on foil pack.
</p>
</div>
{/* Action CTAs */}
<div className="flex flex-col space-y-2 pt-1">
<button className="w-full h-9 rounded-lg bg-[#b43403] text-white text-xs font-semibold hover:bg-[#9a2c02] transition-colors flex items-center justify-center gap-2 shadow-xs" type="button">
<span className="material-symbols-outlined text-[17px]">description</span>
<span>Download Statutory Form 13-A</span>
</button>
<button className="w-full h-9 rounded-lg border border-border-subtle bg-surface-subtle text-text-secondary text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2" type="button">
<span className="material-symbols-outlined text-[17px] text-text-secondary">inventory</span>
<span>Trigger Physical Stock Audit for MRs</span>
</button>
</div>
</div></div>
</div>
{/* 3. BOTTOM POLICY & SOP OPERATIONAL BANNER */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3.5">
<div className="w-10 h-10 rounded-full bg-orange-50 text-[#b43403] flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">policy</span>
</div>
<div className="flex flex-col">
<span className="text-xs font-bold text-text-primary">
Uniform Code for Pharmaceutical Marketing Practices (UCPMP) &amp; DCGI Mandate
</span>
<span className="text-xs text-text-secondary">
Sample distribution must not exceed prescribed pack limits per qualified physician per annum. All physical custody handovers require digital signature or verified OTP acknowledgement logged in the central ledger.
</span>
</div>
</div>
<button className="px-3.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-[#b43403] hover:bg-orange-100 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1" type="button">
<span>View Regulatory Norms</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button></div>
</div>

    </div>
  );
}
