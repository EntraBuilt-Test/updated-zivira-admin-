import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminDoctorCoverageDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      
{/* BEGIN: PageHeaderAndActions */}
<section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-purpose="page-title-actions">
<div>
<div className="inline-flex items-center gap-2 mb-1">
<span className="w-2 h-2 rounded-full bg-brand-corporate"></span>
<span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-corporate">Physician Network &amp; Call Frequency Compliance</span>
</div>
<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Coverage &amp; Territory Reach</h1>
<p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Monitor target physician call frequencies, core list adherence, coverage gaps across specialty tiers (Core A+, A, B), and field representative visit reach.
          </p>
</div>
<div className="flex items-center gap-2.5">
<button className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
<svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="">Export Coverage Audit (CSV/XLS)</span>
</button>
<button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-corporate hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="">+ Rebalance Doctor Allocation / Add HCP</span>
</button>
</div>
</section>
{/* END: PageHeaderAndActions */}
{/* BEGIN: ExecutiveKpiCards */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="executive-metrics-pulse">
{/* Metric Card 1 */}


<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Doctors</span>
<div className="mt-1 flex items-baseline gap-2">
<span className="text-2xl font-extrabold text-slate-900">14,820</span>
<span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+310 Qtr</span>
</div>
<p className="text-[11px] text-slate-500 mt-0.5">Pan-India listed across 48 territories</p>
</div>
<div className="w-9 h-9 rounded-lg bg-orange-50 text-brand-corporate flex items-center justify-center border border-orange-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
<span className="text-slate-500">Master Verified Status</span>
<span className="font-bold text-slate-800">98.2% Certified</span>
</div>
</div>
{/* Metric Card 2 */}
<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Reached (Coverage Rate)</span>
<div className="mt-1 flex items-baseline gap-2">
<span className="text-2xl font-extrabold text-brand-corporate">88.4%</span>
<span className="text-xs font-semibold text-slate-600">13,101 / 14,820</span>
</div>
<p className="text-[11px] text-slate-500 mt-0.5">Visited at least once this cycle</p>
</div>
<div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
{/* Tier Breakdown Bar */}
<div className="mt-3">
<div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
<div className="bg-brand-corporate h-full" style={{ "width": "45%" }} title="Tier A+: 96.2%"></div>
<div className="bg-amber-500 h-full" style={{ "width": "35%" }} title="Tier A: 89.1%"></div>
<div className="bg-slate-400 h-full" style={{ "width": "20%" }} title="Tier B: 78.4%"></div>
</div>
<div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1.5">
<span className="">A+: 96.2%</span>
<span className="">A: 89.1%</span>
<span className="">B: 78.4%</span>
</div>
</div>
</div>
{/* Metric Card 3 */}
<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Call Frequency</span>
<div className="mt-1 flex items-baseline gap-2">
<span className="text-2xl font-extrabold text-slate-900">2.4</span>
<span className="text-xs text-slate-500">calls / doctor / mo</span>
</div>
<p className="text-[11px] text-slate-500 mt-0.5">Target standard: 2.5 benchmark</p>
</div>
<div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
<span className="text-slate-500">Core A+ Frequency</span>
<span className="font-bold text-brand-corporate bg-orange-50 px-2 py-0.5 rounded border border-orange-200">3.8 / 4.0 Visits</span>
</div>
</div>
{/* Metric Card 4 */}
<div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
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
<p className="text-[11px] text-slate-500 mt-0.5">0 visits logged within current cycle</p>
</div>
<div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-[11px]">
<span className="font-bold text-rose-800">Requires Escalation</span>
<a className="font-bold text-brand-corporate hover:underline" href="#">Dispatch Gap Reminder →</a>
</div>
</div>
</section>
{/* END: ExecutiveKpiCards */}
{/* BEGIN: NavigationTabsAndFilterBar */}
<section className="space-y-3" data-purpose="table-controls-and-tabs">
{/* View Switcher Tabs */}
<div className="flex items-center gap-2 border-b border-slate-200">
<button className="px-4 py-2.5 text-xs font-bold text-brand-corporate border-b-2 border-brand-corporate flex items-center gap-2">
<span className="">Doctor Coverage Master List</span>
<span className="bg-orange-100 text-brand-corporate px-2 py-0.5 rounded-full text-[10px] font-extrabold">14,820</span>
</button>
<button className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
<span className="">Territory &amp; Zone Coverage Matrix</span>
<span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">48</span>
</button>
<button className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            Specialty-wise Adherence &amp; Call Frequency
          </button>
<button className="px-4 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-2">
<span className="">Unvisited / At-Risk Doctors</span>
<span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">1,719</span>
</button>
</div>
{/* Filter Controls Row */}
<div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
<div className="flex flex-wrap items-center gap-2 flex-1">
{/* Search Doctor Filter */}
<div className="relative min-w-[240px] flex-1">
<svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<input className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Filter by Doctor Name, Hospital, Clinic, MR..." type="text"/>
</div>
{/* Territory Dropdown */}
<select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-brand-500">
<option>All Territories (Pan-India)</option>
<option>Mumbai South Metro</option>
<option>Delhi NCR South</option>
<option>Bengaluru Central Hub</option>
<option>Kolkata East &amp; Salt Lake</option>
<option>Chennai Central Hub</option>
</select>
{/* Specialty Dropdown */}
<select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-brand-500">
<option>All Specialties (Cardio, Diabeto, Pedia...)</option>
<option>Cardiology</option>
<option>Endocrinology &amp; Diabetology</option>
<option>Pediatrics</option>
<option>Pulmonology</option>
<option>Neurology</option>
</select>
{/* Tier Dropdown */}
<select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-brand-500">
<option>All Tiers (Tier A+, A, B)</option>
<option>Tier A+ (Core Focus - 4 calls/mo)</option>
<option>Tier A (Priority - 2 calls/mo)</option>
<option>Tier B (Standard - 1 call/mo)</option>
</select>
{/* Visit Status Dropdown */}
<select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-brand-500">
<option>All Coverage Status</option>
<option>Target Met (100%)</option>
<option>On Track (&gt;75%)</option>
<option>Under-visited (&lt;50%)</option>
<option>Zero-Visit Gap (0%)</option>
</select>
</div>
<button className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-semibold text-xs border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Reset Filters
          </button>
</div>
</section>
{/* END: NavigationTabsAndFilterBar */}
{/* BEGIN: DoctorCoverageRosterTable */}
<section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" data-purpose="roster-table">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse text-xs">
<thead>
<tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
<th className="py-3 px-4 w-10 text-center">
<input className="rounded border-slate-300 text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
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
<tbody className="divide-y divide-slate-200 font-normal text-slate-700">
{/* Row 1: Target Met */}
<tr className="hover:bg-slate-50/80 transition-colors">
<td className="py-3.5 px-4 text-center">
<input className="rounded border-slate-300 text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                      AM
                    </div>
<div>
<div className="font-bold text-slate-900 leading-tight">Dr. Ananya Mukherjee</div>
<div className="text-[11px] text-slate-500">Cardiology • Fortis Hospital, Kolkata</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-100 text-brand-corporate border border-orange-200">
                    Tier A+ (4/mo)
                  </span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">SM</span>
<div>
<div className="font-semibold text-slate-800">Subhashish Mitra</div>
<div className="text-[10px] text-slate-400">Kolkata East &amp; Salt Lake</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="w-36">
<div className="flex justify-between text-[11px] font-semibold mb-1">
<span className="text-emerald-600">4 / 4 visits</span>
<span className="text-slate-400">100%</span>
</div>
<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "100%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="font-medium text-slate-800">08 Sep 2026</div>
<div className="text-[10px] text-slate-400">DCR #84920 (Verified)</div>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-wrap gap-1 max-w-[170px]">
<span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">CardioCare 20</span>
<span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">ZiviCal D3</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Target Met
                    </span>
<button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors" title="View Call Details">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 2: On Track */}
<tr className="hover:bg-slate-50/80 transition-colors">
<td className="py-3.5 px-4 text-center">
<input className="rounded border-slate-300 text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                      VM
                    </div>
<div>
<div className="font-bold text-slate-900 leading-tight">Dr. Vikram Malhotra</div>
<div className="text-[11px] text-slate-500">Endocrinology • Max Super Speciality, Delhi</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-100 text-brand-corporate border border-orange-200">
                    Tier A+ (4/mo)
                  </span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">AD</span>
<div>
<div className="font-semibold text-slate-800">Amit Duggal</div>
<div className="text-[10px] text-slate-400">Delhi NCR South</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="w-36">
<div className="flex justify-between text-[11px] font-semibold mb-1">
<span className="text-blue-600">3 / 4 visits</span>
<span className="text-slate-400">75%</span>
</div>
<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
<div className="bg-blue-500 h-full rounded-full" style={{ "width": "75%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="font-medium text-slate-800">11 Sep 2026</div>
<div className="text-[10px] text-slate-400">DCR #85102 (GPS Tagged)</div>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-wrap gap-1 max-w-[170px]">
<span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">Glucoflow M</span>
<span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">InsuliMax</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      On Track
                    </span>
<button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors" title="View Call Details">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 3: Under-visited */}
<tr className="hover:bg-slate-50/80 transition-colors">
<td className="py-3.5 px-4 text-center">
<input className="rounded border-slate-300 text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                      AR
                    </div>
<div>
<div className="font-bold text-slate-900 leading-tight">Dr. Arvind Rao</div>
<div className="text-[11px] text-slate-500">Pediatrics • Manipal Hospital, Bengaluru</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    Tier A (2/mo)
                  </span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">VK</span>
<div>
<div className="font-semibold text-slate-800">Vikas Kulkarni</div>
<div className="text-[10px] text-slate-400">Bengaluru Central Hub</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="w-36">
<div className="flex justify-between text-[11px] font-semibold mb-1">
<span className="text-amber-600">1 / 2 visits</span>
<span className="text-slate-400">50%</span>
</div>
<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
<div className="bg-amber-500 h-full rounded-full" style={{ "width": "50%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="font-medium text-slate-800">02 Sep 2026</div>
<div className="text-[10px] text-amber-600 font-semibold">12 days since visit</div>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-wrap gap-1 max-w-[170px]">
<span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">Pediabest Drops</span>
<span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">Fe-Syrup</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Under-visited
                    </span>
<button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors" title="View Call Details">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 4: Zero-Visit Gap (CRITICAL) */}
<tr className="hover:bg-rose-50/50 bg-rose-50/20 transition-colors">
<td className="py-3.5 px-4 text-center">
<input className="rounded border-slate-300 text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center font-bold text-rose-700 text-xs flex-shrink-0">
                      SK
                    </div>
<div>
<div className="font-bold text-slate-900 leading-tight">Dr. Sangeeta Kulkarni</div>
<div className="text-[11px] text-slate-500">Pulmonology • Breach Candy Hospital, Mumbai</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-100 text-brand-corporate border border-orange-200">
                    Tier A+ (4/mo)
                  </span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center justify-center">RS</span>
<div>
<div className="font-semibold text-slate-800">Rahul Sharma</div>
<div className="text-[10px] text-slate-400">Mumbai South Metro</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="w-36">
<div className="flex justify-between text-[11px] font-semibold mb-1">
<span className="text-rose-600 font-bold">0 / 4 visits</span>
<span className="text-rose-600 font-bold">0%</span>
</div>
<div className="w-full bg-rose-100 h-1.5 rounded-full overflow-hidden">
<div className="bg-rose-500 h-full rounded-full" style={{ "width": "0%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="font-bold text-rose-700">No visits in 32 days</div>
<div className="text-[10px] text-rose-500">Exceeded 14d SLA gap</div>
</td>
<td className="py-3.5 px-4">
<div className="text-[11px] text-slate-400 italic">No samples delivered</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                      Zero-Visit Gap
                    </span>
<button className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold transition-colors" title="Trigger Alert">
                      Escalate
                    </button>
</div>
</td>
</tr>
{/* Row 5: Tier B Target Met */}
<tr className="hover:bg-slate-50/80 transition-colors">
<td className="py-3.5 px-4 text-center">
<input className="rounded border-slate-300 text-brand-corporate focus:ring-brand-corporate" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                      RN
                    </div>
<div>
<div className="font-bold text-slate-900 leading-tight">Dr. Rajesh Nair</div>
<div className="text-[11px] text-slate-500">Neurology • Apollo Hospitals, Chennai</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                    Tier B (1/mo)
                  </span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">KN</span>
<div>
<div className="font-semibold text-slate-800">Karthik Nathan</div>
<div className="text-[10px] text-slate-400">Chennai Central Hub</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="w-36">
<div className="flex justify-between text-[11px] font-semibold mb-1">
<span className="text-emerald-600">1 / 1 visit</span>
<span className="text-slate-400">100%</span>
</div>
<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "100%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<div className="font-medium text-slate-800">07 Sep 2026</div>
<div className="text-[10px] text-slate-400">DCR #84811 (Verified)</div>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-wrap gap-1 max-w-[170px]">
<span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">NeuroZiv Plus</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Target Met
                    </span>
<button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors" title="View Call Details">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer / Pagination */}
<div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
<div className="text-slate-500">
            Showing <span className="font-bold text-slate-800">1 to 5</span> of <span className="font-bold text-slate-800">14,820</span> Doctors • <span className="text-rose-600 font-semibold">1,719 doctors require beat intervention</span>
</div>
<div className="flex items-center gap-1.5">
<button className="px-2 py-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded bg-slate-50 disabled:opacity-50" disabled={true}>
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
<button className="px-2.5 py-1 text-xs font-bold rounded bg-brand-corporate text-white">1</button>
<button className="px-2.5 py-1 text-xs font-semibold rounded text-slate-600 hover:bg-slate-100">2</button>
<button className="px-2.5 py-1 text-xs font-semibold rounded text-slate-600 hover:bg-slate-100">3</button>
<span className="text-slate-400 px-1">...</span>
<button className="px-2.5 py-1 text-xs font-semibold rounded text-slate-600 hover:bg-slate-100">2,964</button>
<button className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded bg-white hover:bg-slate-50">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</div>
</section>
{/* END: DoctorCoverageRosterTable */}
{/* BEGIN: BottomSplitAnalytics */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-purpose="coverage-analytics-breakdown">
{/* Left: Coverage by Specialty (7 Cols) */}
<div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
<div className="flex items-center justify-between pb-3 border-b border-slate-100">
<div>
<h3 className="font-bold text-slate-900 text-sm">Specialty Coverage &amp; Frequency Adherence</h3>
<p className="text-xs text-slate-400">Target frequency compliance across 5 core therapeutic divisions</p>
</div>
<span className="text-[11px] font-bold text-brand-corporate bg-orange-50 px-2 py-1 rounded border border-orange-200">Pan-India Target: 90%</span>
</div>
{/* Specialty Progress Bars */}
<div className="mt-4 space-y-3.5 text-xs">
{/* Specialty 1 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-slate-700">Cardiology (3,420 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-slate-400 font-medium">3,214 reached</span>
<span className="font-bold text-emerald-600">94.0%</span>
</div>
</div>
<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "94%" }}></div>
</div>
</div>
{/* Specialty 2 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-slate-700">Diabetology &amp; Endocrinology (2,890 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-slate-400 font-medium">2,630 reached</span>
<span className="font-bold text-emerald-600">91.0%</span>
</div>
</div>
<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "91%" }}></div>
</div>
</div>
{/* Specialty 3 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-slate-700">Pulmonology (2,150 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-slate-400 font-medium">1,892 reached</span>
<span className="font-bold text-brand-corporate">88.0%</span>
</div>
</div>
<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div className="bg-brand-corporate h-full rounded-full" style={{ "width": "88%" }}></div>
</div>
</div>
{/* Specialty 4 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-slate-700">General Medicine (3,980 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-slate-400 font-medium">3,422 reached</span>
<span className="font-bold text-amber-600">86.0%</span>
</div>
</div>
<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div className="bg-amber-500 h-full rounded-full" style={{ "width": "86%" }}></div>
</div>
</div>
{/* Specialty 5 */}
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-semibold text-slate-700">Pediatrics (2,380 Doctors)</span>
<div className="flex items-center gap-2">
<span className="text-[11px] text-slate-400 font-medium">1,951 reached</span>
<span className="font-bold text-amber-600">82.0%</span>
</div>
</div>
<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div className="bg-amber-500 h-full rounded-full" style={{ "width": "82%" }}></div>
</div>
</div>
</div>
</div>
{/* Right: Territory Bottlenecks & Auto-Reassignment (5 Cols) */}
<div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between pb-3 border-b border-slate-100">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-rose-500"></span>
<h3 className="font-bold text-slate-900 text-sm">Territory Coverage Bottlenecks</h3>
</div>
<span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Action Required
              </span>
</div>
<p className="text-xs text-slate-500 mt-2">
              Territories falling below the 75% coverage SLA due to vacant beats or representative transit constraints.
            </p>
<div className="mt-3.5 space-y-2.5">
{/* Bottleneck Item 1 */}
<div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-3 text-xs">
<div>
<div className="font-bold text-slate-900">North Delhi Zone 2</div>
<div className="text-[11px] text-rose-700 font-semibold mt-0.5">Coverage: 68% • 182 Unvisited HCPs</div>
<div className="text-[10px] text-slate-500 mt-0.5">Root cause: MR Vacancy (Beat 4 vacant for 18 days)</div>
</div>
<button className="px-2 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-[10px] font-bold shadow-xs whitespace-nowrap">
                  Reassign Beat
                </button>
</div>
{/* Bottleneck Item 2 */}
<div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 flex items-start justify-between gap-3 text-xs">
<div>
<div className="font-bold text-slate-900">Pune Outskirts &amp; PCMC</div>
<div className="text-[11px] text-amber-700 font-semibold mt-0.5">Coverage: 72% • 114 Unvisited HCPs</div>
<div className="text-[10px] text-slate-500 mt-0.5">Root cause: Long Route Distances &amp; Low Call Ratio</div>
</div>
<button className="px-2 py-1 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 rounded text-[10px] font-bold shadow-xs whitespace-nowrap">
                  Adjust Route
                </button>
</div>
</div>
</div>
<div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
<button className="text-xs font-bold text-brand-corporate hover:underline flex items-center gap-1">
<span className="">View All 6 Bottleneck Beats</span>
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
<button className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm">
              Notify Zonal Managers
            </button>
</div>
</div>
</section>
{/* END: BottomSplitAnalytics */}

    </div>
  );
}
