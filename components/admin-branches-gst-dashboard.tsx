import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminBranchesDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      


{/* BREADCRUMBS & PAGE HEADER */}
<div className="space-y-2">
<div className="flex items-center gap-2 text-xs text-text-secondary">
<span className="">Platform</span>
<span className="">/</span>
<span className="">Network &amp; Territory</span>
<span className="">/</span>
<span className="text-[#b43403] font-medium">Branches &amp; GST</span>
</div>
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
<div className="space-y-1">
<div className="flex items-center gap-2.5">
<span className="px-2.5 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#b43403] text-[11px] font-bold uppercase tracking-wider">SUPPLY CHAIN, LOGISTICS &amp; STATUTORY TAX COMPLIANCE</span>
</div>
<h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">Branches &amp; GST</h1>
<p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
              Manage state operating jurisdictions, GSTIN registration status, C&amp;F warehouses, consignment stockists, cold-chain compliance, and interstate e-way bill reconciliation.
            </p>
</div>
{/* Quick Action Buttons */}
<div className="flex items-center gap-2.5 shrink-0">
<button className="h-9 px-3.5 bg-surface-card hover:bg-surface-subtle border border-border-subtle text-text-secondary text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition-colors">
<span className="material-symbols-outlined text-[18px] text-text-secondary">file_download</span>
<span className="">Export Tax Ledger &amp; GST 3B (CSV/XLS)</span>
</button>
<button className="h-9 px-4 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm shadow-orange-500/20 transition-all active:scale-95"><span className="material-symbols-outlined text-[18px]">add_business</span><span className="">+ Register New Branch / Depot</span></button>
</div>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>

{/* EXECUTIVE KPI PULSE METRICS (4 cards across top) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
{/* Metric 1: Active Operating Branches */}
<div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between mb-2">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active Operating Branches</span>
<div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">domain</span></div>
</div>
<div>
<div className="flex items-baseline gap-2 mb-1">
<span className="text-2xl font-display font-extrabold text-text-primary">28</span>
<span className="text-xs font-semibold text-text-secondary">Depots</span>
</div>
<div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
<div className="bg-[#b43403] h-1.5 rounded-full" style={{ "width": "88%" }}></div>
</div>
<div className="flex items-center justify-between text-xs">
<span className="text-text-secondary">19 States &amp; UTs Covered</span>
<span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success text-[10px] font-semibold">100% Licensed</span>
</div>
</div>
</div>
{/* Metric 2: GST Compliance Rating */}
<div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between mb-2">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">GST Compliance Rating</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">verified</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2 mb-1">
<span className="text-2xl font-display font-extrabold text-emerald-600">99.8%</span>
<span className="text-xs font-semibold text-text-secondary">Audited</span>
</div>
<div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
<div className="bg-emerald-500 h-1.5 rounded-full" style={{ "width": "99.8%" }}></div>
</div>
<div className="flex items-center justify-between text-xs">
<span className="text-text-secondary">28/28 GSTINs Active &amp; Reconciled</span>
<span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success text-[10px] font-semibold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> NIC Portal Live
              </span>
</div>
</div>
</div>
{/* Metric 3: Total Primary Dispatch (MTD) */}
<div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between mb-2">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Primary Dispatch (MTD)</span>
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">receipt_long</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2 mb-1">
<span className="text-2xl font-display font-extrabold text-text-primary">₹14.82</span>
<span className="text-xs font-semibold text-text-secondary">Cr</span>
</div>
<div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
<div className="bg-blue-600 h-1.5 rounded-full" style={{ "width": "78%" }}></div>
</div>
<div className="flex items-center justify-between text-xs">
<span className="text-emerald-600 font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +14.6% vs Target
              </span>
<span className="text-text-muted text-[11px]">4,280 Consignments</span>
</div>
</div>
</div>
{/* Metric 4: Cold-Chain Verified C&F */}
<div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between mb-2">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Cold-Chain Verified C&amp;F</span>
<div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">warehouse</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2 mb-1">
<span className="text-2xl font-display font-extrabold text-text-primary">42</span>
<span className="text-xs font-semibold text-text-secondary">Hubs</span>
</div>
<div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
<div className="bg-indigo-600 h-1.5 rounded-full" style={{ "width": "100%" }}></div>
</div>
<div className="flex items-center justify-between text-xs">
<span className="text-text-secondary">100% Temperature Telemetry Validated</span>
<span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">2°C - 8°C Monitored</span>
</div>
</div>
</div>
</div>
{/* INTERACTIVE FILTER & SEARCH BAR */}
<div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 shadow-2xs space-y-3">
{/* Top filter row */}
<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
<div className="relative flex-1 max-w-md">
<span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
<input className="w-full h-9 pl-9 pr-3 bg-surface-subtle border border-border-subtle rounded-lg text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-surface-card" id="branchFilterInput" placeholder="Search Depots, GSTIN, HSN codes, or C&amp;F Managers..." type="text"/>
</div>
<div className="flex flex-wrap items-center gap-2">
<div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-lg">
<span className="material-symbols-outlined text-[16px] text-text-muted">category</span>
<select className="bg-transparent text-xs text-text-secondary font-medium focus:outline-none cursor-pointer">
<option>All Hubs &amp; Depots</option>
<option>Super-Depot</option>
<option>C&amp;F Agent Hub</option>
<option>Consignment Stockist</option>
</select>
</div>
<div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-lg">
<span className="material-symbols-outlined text-[16px] text-text-muted">task_alt</span>
<select className="bg-transparent text-xs text-text-secondary font-medium focus:outline-none cursor-pointer">
<option>All Statuses</option>
<option>GSTR-1 Filed</option>
<option>GSTR-3B Reconciled</option>
<option>Audit Pending</option>
</select>
</div>
<button className="h-9 px-3 bg-surface-subtle hover:bg-surface-subtle border border-border-subtle text-text-secondary rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors" title="Reset Filters">
<span className="material-symbols-outlined text-[16px]">restart_alt</span>
<span className="">Reset</span>
</button>
</div>
</div>
{/* State Pills Strip */}
<div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mr-1 shrink-0">Jurisdictions:</span>
<button className="state-pill-btn px-3 py-1 rounded-md text-xs font-medium bg-[#b43403] text-white border border-[#b43403] transition-colors shrink-0" data-state="all">All Jurisdictions (28)</button>
<button className="state-pill-btn px-3 py-1 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle text-text-secondary border border-border-subtle transition-colors shrink-0" data-state="27">Maharashtra (27)</button>
<button className="state-pill-btn px-3 py-1 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle text-text-secondary border border-border-subtle transition-colors shrink-0" data-state="29">Karnataka (29)</button>
<button className="state-pill-btn px-3 py-1 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle text-text-secondary border border-border-subtle transition-colors shrink-0" data-state="07">Delhi NCR (07)</button>
<button className="state-pill-btn px-3 py-1 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle text-text-secondary border border-border-subtle transition-colors shrink-0" data-state="24">Gujarat (24)</button>
<button className="state-pill-btn px-3 py-1 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle text-text-secondary border border-border-subtle transition-colors shrink-0" data-state="33">Tamil Nadu (33)</button>
<button className="state-pill-btn px-3 py-1 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle text-text-secondary border border-border-subtle transition-colors shrink-0" data-state="19">West Bengal (19)</button>
</div>
</div>
{/* MAIN CONTENT SPLIT LAYOUT (Left 68% / Right 32%) */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
{/* LEFT COLUMN: Master Directory Table & Visual Showcase (8 Cols / approx 68%) */}
<div className="xl:col-span-8 space-y-6">
{/* DATA TABLE CARD */}
<div className="bg-surface-card border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
<div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[#b43403] text-[20px]">account_tree</span>
<div>
<h2 className="font-display font-bold text-sm text-text-primary">State Jurisdictions &amp; Depot Master Registry</h2>
<p className="text-[11px] text-text-muted">NIC validated GSTIN tax nodes, warehouse specs, and leadership</p>
</div>
</div>
<span className="text-xs font-medium text-text-muted">Showing 1 to 5 of 28 Depots</span>
</div>
{/* Table content */}
<div className="overflow-x-auto">
<table className="w-full text-left text-xs">
<thead>
<tr className="bg-surface-subtle/80 border-b border-border-subtle text-text-secondary font-bold uppercase text-[11px] tracking-wider">
<th className="px-4 py-3">Depot &amp; Location</th>
<th className="px-4 py-3">GSTIN &amp; Code</th>
<th className="px-4 py-3">Infra &amp; Cold Chain</th>
<th className="px-4 py-3">MTD Primary Sales</th>
<th className="px-4 py-3">Branch Leadership</th>
<th className="px-4 py-3 text-right">Status &amp; Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100" id="depotTableBody"><tr className="hover:bg-surface-subtle/60 transition-colors group"><td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/60 text-[#b43403] flex items-center justify-center font-display font-bold text-xs shrink-0">MH</div><div><div className="font-display font-bold text-text-primary leading-tight">Mumbai Central Depot</div><div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[13px] text-text-muted">pin_drop</span><span className="">Bhiwandi Hub, MH</span></div></div></div></td><td className="px-4 py-3.5"><div className="font-mono font-semibold text-text-primary text-[11px]">27AABCZ1234F1Z5</div><div className="text-[10px] text-text-muted font-medium">State: 27-MH</div></td><td className="px-4 py-3.5"><div className="font-medium text-text-primary">45,000 sq ft</div><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold mt-0.5"><span className="material-symbols-outlined text-[11px]">ac_unit</span> Cold-Chain Active</span></td><td className="px-4 py-3.5"><div className="font-display font-bold text-text-primary">₹3.42 Cr</div><div className="text-[10px] font-semibold text-emerald-600 flex items-center"><span className="material-symbols-outlined text-[12px]">arrow_upward</span> 98.4% Achv</div></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-subtle text-text-secondary font-bold text-[10px] flex items-center justify-center">RK</div><div><div className="font-medium text-text-primary leading-tight">Rajesh Kulkarni</div><div className="text-[10px] text-text-muted">VP - West Logistics</div></div></div></td><td className="px-4 py-3.5 text-right"><div className="flex flex-col items-end gap-1"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> GSTR-1 Synced</span><div className="flex items-center gap-1.5 mt-0.5"><button className="text-[11px] font-semibold text-[#b43403] hover:underline" title="Tax Ledger">Tax Ledger</button><span className="text-slate-300">•</span><button className="text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:underline" title="E-Way Bills">E-Way Bills</button></div></div></td></tr><tr className="hover:bg-surface-subtle/60 transition-colors group"><td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/60 text-[#b43403] flex items-center justify-center font-display font-bold text-xs shrink-0">KA</div><div><div className="font-display font-bold text-text-primary leading-tight">Bengaluru Distribution Hub</div><div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[13px] text-text-muted">pin_drop</span><span className="">Peenya Industrial, KA</span></div></div></div></td><td className="px-4 py-3.5"><div className="font-mono font-semibold text-text-primary text-[11px]">29AABCZ1234F1Z3</div><div className="text-[10px] text-text-muted font-medium">State: 29-KA</div></td><td className="px-4 py-3.5"><div className="font-medium text-text-primary">32,000 sq ft</div><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold mt-0.5"><span className="material-symbols-outlined text-[11px]">ac_unit</span> Pharma Cold</span></td><td className="px-4 py-3.5"><div className="font-display font-bold text-text-primary">₹2.85 Cr</div><div className="text-[10px] font-semibold text-emerald-600 flex items-center"><span className="material-symbols-outlined text-[12px]">arrow_upward</span> 104.2% Achv</div></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-subtle text-text-secondary font-bold text-[10px] flex items-center justify-center">SB</div><div><div className="font-medium text-text-primary leading-tight">Suresh Babu</div><div className="text-[10px] text-text-muted">AVP - South Operations</div></div></div></td><td className="px-4 py-3.5 text-right"><div className="flex flex-col items-end gap-1"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> GSTR-1 Synced</span><div className="flex items-center gap-1.5 mt-0.5"><button className="text-[11px] font-semibold text-[#b43403] hover:underline">Tax Ledger</button><span className="text-slate-300">•</span><button className="text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:underline">E-Way Bills</button></div></div></td></tr><tr className="hover:bg-surface-subtle/60 transition-colors group"><td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/60 text-[#b43403] flex items-center justify-center font-display font-bold text-xs shrink-0">DL</div><div><div className="font-display font-bold text-text-primary leading-tight">Delhi North Super-Depot</div><div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[13px] text-text-muted">pin_drop</span><span className="">Okhla Phase II, DL</span></div></div></div></td><td className="px-4 py-3.5"><div className="font-mono font-semibold text-text-primary text-[11px]">07AABCZ1234F1Z9</div><div className="text-[10px] text-text-muted font-medium">State: 07-DL</div></td><td className="px-4 py-3.5"><div className="font-medium text-text-primary">38,000 sq ft</div><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary text-[10px] font-semibold mt-0.5"><span className="material-symbols-outlined text-[11px]">inventory_2</span> Ambient &amp; Cool</span></td><td className="px-4 py-3.5"><div className="font-display font-bold text-text-primary">₹3.10 Cr</div><div className="text-[10px] font-semibold text-amber-600 flex items-center"><span className="material-symbols-outlined text-[12px]">trending_flat</span> 92.1% Achv</div></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-subtle text-text-secondary font-bold text-[10px] flex items-center justify-center">AS</div><div><div className="font-medium text-text-primary leading-tight">Amitav Sen</div><div className="text-[10px] text-text-muted">Zonal Director - North</div></div></div></td><td className="px-4 py-3.5 text-right"><div className="flex flex-col items-end gap-1"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-info-bg text-status-info text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Audit Ready</span><div className="flex items-center gap-1.5 mt-0.5"><button className="text-[11px] font-semibold text-[#b43403] hover:underline">Tax Ledger</button><span className="text-slate-300">•</span><button className="text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:underline">E-Way Bills</button></div></div></td></tr><tr className="hover:bg-surface-subtle/60 transition-colors group"><td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/60 text-[#b43403] flex items-center justify-center font-display font-bold text-xs shrink-0">GJ</div><div><div className="font-display font-bold text-text-primary leading-tight">Ahmedabad Logistics Hub</div><div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[13px] text-text-muted">pin_drop</span><span className="">Sanand GIDC, GJ</span></div></div></div></td><td className="px-4 py-3.5"><div className="font-mono font-semibold text-text-primary text-[11px]">24AABCZ1234F1Z2</div><div className="text-[10px] text-text-muted font-medium">State: 24-GJ</div></td><td className="px-4 py-3.5"><div className="font-medium text-text-primary">28,000 sq ft</div><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold mt-0.5"><span className="material-symbols-outlined text-[11px]">ac_unit</span> Dual-Temp Certified</span></td><td className="px-4 py-3.5"><div className="font-display font-bold text-text-primary">₹2.15 Cr</div><div className="text-[10px] font-semibold text-emerald-600 flex items-center"><span className="material-symbols-outlined text-[12px]">arrow_upward</span> 101.8% Achv</div></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-subtle text-text-secondary font-bold text-[10px] flex items-center justify-center">BP</div><div><div className="font-medium text-text-primary leading-tight">Bhavesh Patel</div><div className="text-[10px] text-text-muted">Regional Logistics Head</div></div></div></td><td className="px-4 py-3.5 text-right"><div className="flex flex-col items-end gap-1"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> GSTR-1 Synced</span><div className="flex items-center gap-1.5 mt-0.5"><button className="text-[11px] font-semibold text-[#b43403] hover:underline">Tax Ledger</button><span className="text-slate-300">•</span><button className="text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:underline">E-Way Bills</button></div></div></td></tr><tr className="hover:bg-surface-subtle/60 transition-colors group"><td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/60 text-[#b43403] flex items-center justify-center font-display font-bold text-xs shrink-0">WB</div><div><div className="font-display font-bold text-text-primary leading-tight">Kolkata Metro C&amp;F Depot</div><div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[13px] text-text-muted">pin_drop</span><span className="">Dankuni Complex, WB</span></div></div></div></td><td className="px-4 py-3.5"><div className="font-mono font-semibold text-text-primary text-[11px]">19AABCZ1234F1Z7</div><div className="text-[10px] text-text-muted font-medium">State: 19-WB</div></td><td className="px-4 py-3.5"><div className="font-medium text-text-primary">25,000 sq ft</div><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold mt-0.5"><span className="material-symbols-outlined text-[11px]">ac_unit</span> Cold Chain Verified</span></td><td className="px-4 py-3.5"><div className="font-display font-bold text-text-primary">₹1.88 Cr</div><div className="text-[10px] font-semibold text-amber-600 flex items-center"><span className="material-symbols-outlined text-[12px]">trending_flat</span> 96.5% Achv</div></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface-subtle text-text-secondary font-bold text-[10px] flex items-center justify-center">SR</div><div><div className="font-medium text-text-primary leading-tight">Subir Roy</div><div className="text-[10px] text-text-muted">East Logistics Manager</div></div></div></td><td className="px-4 py-3.5 text-right"><div className="flex flex-col items-end gap-1"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> GSTR-3B Pending</span><div className="flex items-center gap-1.5 mt-0.5"><button className="text-[11px] font-semibold text-[#b43403] hover:underline">Tax Ledger</button><span className="text-slate-300">•</span><button className="text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:underline">E-Way Bills</button></div></div></td></tr></tbody>
</table>
</div>
{/* Table Pagination Strip */}
<div className="px-5 py-3 bg-surface-subtle/80 border-t border-border-subtle flex items-center justify-between text-xs">
<span className="text-text-secondary">Showing 1 to 5 of 28 Depots</span>
<div className="flex items-center gap-1">
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-muted flex items-center justify-center disabled:opacity-50" disabled={true}>
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button className="w-7 h-7 rounded border border-[#b43403] bg-[#b43403] text-white font-medium text-xs flex items-center justify-center">1</button>
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center justify-center">2</button>
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center justify-center">3</button>
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center justify-center">4</button>
<button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* FACILITY PREVIEW & TELEMETRY SHOWCASE (Below Table) */}
</div>
{/* RIGHT COLUMN: Compliance Widgets, Transit Tracking, Calendar (4 Cols / approx 32%) */}
<div className="xl:col-span-4 space-y-6">
{/* WIDGET 1: E-Way Bill & Transit Status */}
<div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs space-y-4">
<div className="flex items-center justify-between pb-2 border-b border-slate-100">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">local_shipping</span></div>
<div>
<h3 className="font-display font-bold text-sm text-text-primary">E-Way Bill &amp; Transit Status</h3>
<p className="text-[11px] text-text-muted">Interstate Consignment Tracking</p>
</div>
</div>
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold tracking-wider uppercase">Live NIC Feed</span>
</div>
{/* Donut Visual Ring & Breakdown */}
<div className="p-3 bg-surface-subtle rounded-xl flex items-center gap-4">
<div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
<svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
{/* Background Circle */}
<path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8"></path>
{/* In Transit (Primary Orange) 71.7% */}
<path className="text-[#b43403]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="72, 100" strokeLinecap="round" strokeWidth="3.8"></path>
{/* Delivered (Emerald) 24% */}
<path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="24, 100" strokeDashoffset="-72" strokeLinecap="round" strokeWidth="3.8"></path>
</svg>
<div className="absolute flex flex-col items-center">
<span className="font-display font-extrabold text-base text-text-primary leading-none">184</span>
<span className="text-[9px] uppercase tracking-wider text-text-muted font-bold mt-0.5">Total</span>
</div>
</div>
<div className="flex-1 space-y-1.5 text-xs">
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-[#b43403]"></span>In Transit / Dispatched</span>
<span className="font-bold text-text-primary">132</span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Delivered &amp; Cleared</span>
<span className="font-bold text-text-primary">44</span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Pending Portal Ack</span>
<span className="font-bold text-text-primary">8</span>
</div>
</div>
</div>
{/* Quick Stats Sub-grid */}
<div className="grid grid-cols-2 gap-2 pt-1">
<div className="p-2.5 rounded-lg bg-surface-subtle border border-slate-100">
<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pending GSTR-1</span>
<div className="font-display font-extrabold text-text-primary text-sm mt-0.5">₹0.00</div>
<span className="text-[10px] text-emerald-600 font-semibold">100% Invoices Synced</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle border border-slate-100">
<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Interstate IGST</span>
<div className="font-display font-extrabold text-text-primary text-sm mt-0.5">₹2.66 Cr</div>
<span className="text-[10px] text-blue-600 font-semibold">Reconciled MTD</span>
</div>
</div>
</div>
{/* WIDGET 2: Statutory Tax Calendar & Deadlines */}
<div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs space-y-4">
<div className="flex items-center justify-between pb-2 border-b border-slate-100">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">calendar_month</span>
</div>
<div>
<h3 className="font-display font-bold text-sm text-text-primary">Statutory Tax Calendar</h3>
<p className="text-[11px] text-text-muted">GST Filing &amp; Deadlines (Q2 2026)</p>
</div>
</div>
<button className="text-[#b43403] hover:underline text-xs font-semibold">View All</button>
</div>
<div className="space-y-2.5 text-xs">
{/* Item 1: OCT 11 */}
<div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-slate-100 hover:bg-surface-subtle/70 transition-colors">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-status-success-bg border border-status-success-bg/60 text-status-success flex flex-col items-center justify-center shrink-0">
<span className="text-[9px] uppercase font-extrabold leading-none">OCT</span>
<span className="font-display font-bold text-sm leading-none mt-0.5">11</span>
</div>
<div>
<div className="font-semibold text-text-primary leading-tight">GSTR-1 Outward Supplies</div>
<div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
<span className="material-symbols-outlined text-[13px]">task_alt</span> Filed &amp; Accepted (ARN #99281)
                    </div>
</div>
</div>
<span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
</div>
{/* Item 2: OCT 20 */}
<div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-slate-100 hover:bg-surface-subtle/70 transition-colors">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-[#b43403] text-white flex flex-col items-center justify-center shrink-0 shadow-2xs"><span className="text-[9px] uppercase font-extrabold leading-none">OCT</span><span className="font-display font-bold text-sm leading-none mt-0.5">20</span></div>
<div>
<div className="font-semibold text-text-primary leading-tight">GSTR-3B Consolidated Return</div>
<div className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
<span className="material-symbols-outlined text-[13px]">hourglass_top</span> Due in 10 days • 28 Depots
                    </div>
</div>
</div>
<button className="px-2.5 py-1 rounded bg-surface-card hover:bg-surface-subtle text-text-secondary border border-border-subtle text-xs font-semibold shadow-2xs transition-colors">
                  Prepare
                </button>
</div>
{/* Item 3: OCT 31 */}
<div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-slate-100 hover:bg-surface-subtle/70 transition-colors">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-slate-200 text-text-secondary flex flex-col items-center justify-center shrink-0">
<span className="text-[9px] uppercase font-extrabold leading-none">OCT</span>
<span className="font-display font-bold text-sm leading-none mt-0.5">31</span>
</div>
<div>
<div className="font-semibold text-text-primary leading-tight">Quarterly ITC-04 Job Work Return</div>
<div className="text-[11px] text-text-secondary mt-0.5">C&amp;F Repackaging Hubs</div>
</div>
</div>
<button className="px-2.5 py-1 rounded bg-surface-card hover:bg-surface-subtle text-text-secondary border border-border-subtle text-xs font-semibold shadow-2xs transition-colors">
                  Details
                </button>
</div>
</div>
</div>
{/* WIDGET 3: Instant GSTIN Validator */}
<div className="bg-gradient-to-br from-orange-50/70 via-white to-white border border-orange-200/80 rounded-xl p-4 shadow-2xs space-y-3">
<div className="flex items-center gap-2 text-[#b43403]"><span className="material-symbols-outlined text-[20px]">badge</span><h3 className="font-display font-bold text-sm text-text-primary">Instant GSTIN Validator</h3></div>
<p className="text-xs text-text-secondary leading-relaxed">
              Input any consignor, depot, or consignee GSTIN to perform an instantaneous validation handshake with the national tax portal.
            </p>
<div className="flex items-center gap-2">
<input className="flex-1 h-9 px-3 bg-surface-card border border-border-subtle rounded-lg text-xs uppercase font-mono tracking-wider text-text-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500" id="gstinValidateInput" placeholder="E.g. 27AABCZ1234F1Z5" type="text"/>
<button className="h-9 px-4 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all active:scale-95 shrink-0" id="gstinValidateBtn"><span className="material-symbols-outlined text-[16px]">verified</span><span className="">Validate GSTIN</span></button>
</div>
<div className="hidden p-2 rounded-lg bg-status-success-bg border border-status-success-bg text-status-success text-xs flex items-center justify-between" id="gstinResult">
<span className="flex items-center gap-1.5 font-medium">
<span className="material-symbols-outlined text-[16px]">verified</span> NIC Handshake Verified Active
              </span>
<span className="text-[10px] font-bold uppercase">100% Match</span>
</div>
</div>
</div>
</div>

    </div>
  );
}
