import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminActivitiesDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full space-y-6">
{/* TOP BREADCRUMB & EXECUTIVE ACTION BAR */}
<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1">
<div className="flex flex-col space-y-1"><div className="flex items-center gap-2"><span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span><span className="text-text-muted text-body-sm font-body-sm">/</span><span className="font-label-md text-label-md text-primary font-semibold">Activities</span></div><div className="flex items-center gap-3 flex-wrap"><h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Activities</h1><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md"><span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>Live In-Flight (Sync 10s)</span></div><p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2"><span className="">Real-time field force telemetry, physician call audit, sample custody verification, and geofence verification across nationwide operating hubs.</span></p></div>
{/* ACTION CONTROLS & COMMAND FILTERS */}
<div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">public</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none cursor-pointer">
<option>All Zones / West Hub</option>
<option>North Territory - Delhi HQ</option>
<option>West Zone - Mumbai &amp; Pune</option>
<option>South Sector - Bangalore</option>
<option>East Region - Kolkata Hub</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
<span className="font-label-md text-label-md text-text-primary">Today: 10 Sep 2026</span>
<span className="material-symbols-outlined text-text-muted text-[16px] cursor-pointer">expand_more</span>
</div>
<div className="relative group">
<button className="flex items-center gap-2 bg-surface-card hover:bg-surface-subtle text-text-primary px-3.5 py-2 rounded-lg font-label-md text-label-md shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-secondary text-[18px]">download</span>
<span className="">Export DCR</span>
<span className="material-symbols-outlined text-[16px] text-text-muted">keyboard_arrow_down</span>
</button>
</div>
<button className="flex items-center gap-2 bg-primary hover:bg-brand-primary-hover active:scale-[0.98] text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md shadow-md transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span className="">+ Log Field Activity</span>
</button>
</div>
</div>
{/* OPERATIONAL SUMMARY METRIC CARDS (4-COL GRID) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
{/* Card 1 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total Calls Logged</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">1,420</span>
<span className="font-body-sm text-body-sm text-text-muted">/ 1,600 Target</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
</div>
</div>
<div className="space-y-1.5">
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full transition-all duration-500" style={{ "width": "88.75%" }}></div>
</div>
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="text-status-success font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +4.2% vs yesterday
          </span>
<span className="text-text-secondary">88.7% Complete</span>
</div>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Doctor Detailing Visits</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">1,105</span>
<span className="font-body-sm text-body-sm text-text-secondary">Visits</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">stethoscope</span>
</div>
</div>
<div className="space-y-1.5">
<div className="flex items-center justify-between text-text-secondary font-body-sm text-body-sm">
<span className="">Avg. E-Detailing: <strong className="text-text-primary font-semibold">8.4 mins</strong></span>
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm">On Track</span>
</div>
<div className="flex items-center gap-1.5 text-text-muted font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[15px] text-tertiary">co_present</span>
<span className="">78% Visual Aid coverage achieved</span>
</div>
</div>
</div>
{/* Card 3 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Chemist &amp; Stockist Orders</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">315</span>
<span className="font-body-sm text-body-sm text-text-muted">Bookings (POB)</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">receipt_long</span>
</div>
</div>
<div className="space-y-1.5">
<div className="flex items-center justify-between">
<span className="font-headline-sm text-headline-sm text-text-primary">₹4.82 Lakhs</span>
<span className="text-status-success font-label-sm text-label-sm flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">trending_up</span> +12% MoM
          </span>
</div>
<p className="font-body-sm text-body-sm text-text-muted">89 Secondary billing confirmations today</p>
</div>
</div>
{/* Card 4 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-status-danger">Pending Approvals &amp; Alerts</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-status-danger">14</span>
<span className="font-body-sm text-body-sm text-text-muted">Flagged Logs</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">warning_amber</span>
</div>
</div>
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded-full bg-status-danger-bg text-status-danger font-label-sm text-label-sm">
          9 GPS Mismatches
        </span>
<span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning font-label-sm text-label-sm">
          5 Delayed Logs
        </span>
</div>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4">
  <AdminTabGrid node={node} path={path} />
</div>
{/* INTERACTIVE VIEW TABS & ADVANCED SEARCH CONSOLE */}
<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4">
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b-0">
{/* Operational Navigation Sub-tabs */}
<div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-canvas rounded-lg">
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md bg-surface-card text-primary shadow-sm" type="button">
          Live Call Logs (1,420)
        </button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5" type="button">
<span className="">DCR Approvals</span>
<span className="w-5 h-5 rounded-full bg-status-danger text-on-primary text-[10px] flex items-center justify-center">28</span>
</button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors" type="button">
          Chemist Orders &amp; POB
        </button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors" type="button">
          Sample / Promo Dispatches
        </button>
<button className="px-3 py-1.5 rounded-md font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[16px]">location_on</span>
<span className="">Timeline Map</span>
</button>
</div>
{/* Quick Operations Actions */}
<div className="flex items-center gap-2">
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-success-bg hover:bg-status-success/20 text-status-success font-label-md text-label-md transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">done_all</span>
<span className="">Bulk Approve Selected</span>
</button>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-md text-label-md transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">help_outline</span>
<span className="">Request Explanation</span>
</button>
</div>
</div>
{/* Live Filters & Query Bar */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
<input className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Search by Doctor name, Medical Rep (MR), Specialization, or Clinic..." type="text"/>
</div>
<div className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-secondary">
<span className="text-text-muted uppercase">Status:</span>
<button className="px-2.5 py-1 rounded-full bg-brand-primary-subtle text-primary font-semibold" type="button">
          All (1,420)
        </button>
<button className="px-2.5 py-1 rounded-full bg-surface-canvas hover:bg-surface-subtle text-text-secondary" type="button">
          Verified GPS (1,280)
        </button>
<button className="px-2.5 py-1 rounded-full bg-status-danger-bg text-status-danger hover:opacity-90" type="button">
          Flagged Location (9)
        </button>
<button className="px-2.5 py-1 rounded-full bg-status-warning-bg text-status-warning hover:opacity-90" type="button">
          Pending Review (28)
        </button>
<button className="px-2.5 py-1 rounded-full bg-surface-canvas hover:bg-surface-subtle text-text-secondary" type="button">
          Approved (1,383)
        </button>
</div>
</div>
</div>
{/* MAIN DATA ROSTER: COMPREHENSIVE DCR & FIELD ACTIVITIES TABLE */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-card-padding-spacious py-3.5 bg-surface-card flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">badge</span>
<span className="font-headline-sm text-headline-sm text-text-primary">Real-time Field Activity Telemetry (Audited DCRs)</span>
</div>
<div className="flex items-center gap-3 text-text-muted font-body-sm text-body-sm">
<span className="">Showing 6 of 1,420 logs</span>
<div className="flex items-center gap-1">
<button className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-subtle text-text-secondary" type="button">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<span className="font-label-md text-label-md text-text-primary">Page 1/237</span>
<button className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-subtle text-text-secondary" type="button">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Responsive Scrollable Data Grid */}
<div className="w-full overflow-x-auto">
<table className="w-full text-left font-table-cell text-table-cell text-text-primary min-w-[1240px]">
<thead>
<tr className="bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider h-table-header-height">
<th className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</th>
<th className="px-3 py-2">Medical Rep (MR)</th>
<th className="px-3 py-2">Doctor / Contact Info</th>
<th className="px-3 py-2">Activity Type</th>
<th className="px-3 py-2">Timestamp &amp; Geofence</th>
<th className="px-3 py-2">Products Detailed</th>
<th className="px-3 py-2">Promo / Samples Handover</th>
<th className="px-3 py-2 text-center">Verification Status</th>
<th className="px-4 py-2 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0">
{/* ROW 1: Rahul Sharma (Mumbai - Doctor Detail) */}
<tr className="hover:bg-surface-subtle/70 transition-colors h-table-row-height bg-surface-card">
<td className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-brand-primary-subtle text-primary font-headline-sm flex items-center justify-center flex-shrink-0">
                  RS
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">Rahul Sharma</span>
<span className="font-body-sm text-body-sm text-text-muted">MR-4089 · Mumbai South</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Dr. Ananya Iyer, MD</span>
<span className="font-body-sm text-body-sm text-text-secondary">Cardiologist · Lilavati Hospital</span>
</div>
</td>
<td className="px-3 py-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">person_check</span> Doctor Detail
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-text-primary">
<span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
<span className="">10:14 AM</span>
</div>
<span className="font-body-sm text-body-sm text-status-success flex items-center gap-1">
                  18.5204° N, 73.8567° E (12m delta)
                </span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">ZiviCal D3 (5m)</span>
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">CardioCare 20 (3m)</span>
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              2x ZiviCal D3 Samples, 1x Desk Pen
            </td>
<td className="px-3 py-3 text-center">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm">
<span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> Approved
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="Inspect Call" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="Listen Audio/VA Log" type="button">
<span className="material-symbols-outlined text-[18px]">play_circle</span>
</button>
</div>
</td>
</tr>
{/* ROW 2: Priya Mehta (Pune - Chemist POB) */}
<tr className="hover:bg-surface-subtle/70 transition-colors h-table-row-height bg-surface-canvas/30">
<td className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant font-headline-sm flex items-center justify-center flex-shrink-0">
                  PM
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">Priya Mehta</span>
<span className="font-body-sm text-body-sm text-text-muted">MR-3122 · Pune Camp</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Apollo Medicos #442</span>
<span className="font-body-sm text-body-sm text-text-secondary">Lead Chemist: Harish Patel</span>
</div>
</td>
<td className="px-3 py-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">local_pharmacy</span> Chemist POB
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-text-primary">
<span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
<span className="">10:48 AM</span>
</div>
<span className="font-body-sm text-body-sm text-status-success">POB Booked: ₹42,500</span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">GlycoZiv 500 (100 Strips)</span>
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              Product Monograph &amp; LBL Kit
            </td>
<td className="px-3 py-3 text-center">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm">
<span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> Approved
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="Inspect Call" type="button">
<span className="material-symbols-outlined text-[18px]">receipt</span>
</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-status-success transition-colors" title="Approve" type="button">
<span className="material-symbols-outlined text-[18px]">check_circle</span>
</button>
</div>
</td>
</tr>
{/* ROW 3: Rajesh Kumar (Delhi - GPS Alert Flagged) */}
<tr className="hover:bg-status-danger-bg/20 transition-colors h-table-row-height bg-status-danger-bg/10">
<td className="w-10 px-4 text-center">
<input defaultChecked={true} className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-status-danger-bg text-status-danger font-headline-sm flex items-center justify-center flex-shrink-0">
                  RK
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">Rajesh Kumar</span>
<span className="font-body-sm text-body-sm text-text-muted">MR-1904 · Delhi NCR</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Dr. Sanjay Grover, MBBS</span>
<span className="font-body-sm text-body-sm text-text-secondary">General Physician · Max Care Clinic</span>
</div>
</td>
<td className="px-3 py-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">person_check</span> Doctor Detail
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-status-danger">
<span className="material-symbols-outlined text-[16px]">location_off</span>
<span className="">11:22 AM</span>
</div>
<span className="font-body-sm text-body-sm text-status-danger font-semibold">
                  Mismatch: 620m away from clinic
                </span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">Metfor-Z (2m)</span>
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              None logged
            </td>
<td className="px-3 py-3 text-center">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-danger-bg text-status-danger font-label-sm text-label-sm">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span> GPS Alert Flagged
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2 py-1 rounded bg-status-danger-bg hover:bg-status-danger hover:text-on-primary text-status-danger font-label-sm text-label-sm transition-colors" type="button">
                  Audit Flag
                </button>
</div>
</td>
</tr>
{/* ROW 4: Vikram Joshi (Ahmedabad - Joint Field Work with ABM) */}
<tr className="hover:bg-surface-subtle/70 transition-colors h-table-row-height bg-surface-card">
<td className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-status-info-bg text-status-info font-headline-sm flex items-center justify-center flex-shrink-0">
                  VJ
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">Vikram Joshi</span>
<span className="font-body-sm text-body-sm text-text-muted">MR-5520 · Ahmedabad Central</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Dr. Meera Desai, DM</span>
<span className="font-body-sm text-body-sm text-text-secondary">Endocrinologist · Sterling Hospital</span>
</div>
</td>
<td className="px-3 py-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-info-bg text-status-info font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">groups</span> Joint Work w/ ABM
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-text-primary">
<span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
<span className="">11:50 AM</span>
</div>
<span className="font-body-sm text-body-sm text-status-success">
                  23.0225° N, 72.5714° E (5m)
                </span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">GlycoZiv XR (7m)</span>
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">Thyro-Ziv 50 (4m)</span>
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              4x GlycoZiv Samples, 2x Patient Diaries
            </td>
<td className="px-3 py-3 text-center">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning font-label-sm text-label-sm">
<span className="w-1.5 h-1.5 rounded-full bg-status-warning"></span> Under Review
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="Inspect Call" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-status-success transition-colors" title="Approve" type="button">
<span className="material-symbols-outlined text-[18px]">check</span>
</button>
</div>
</td>
</tr>
{/* ROW 5: Sneha Roy (Kolkata - Doctor Detail) */}
<tr className="hover:bg-surface-subtle/70 transition-colors h-table-row-height bg-surface-canvas/30">
<td className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-headline-sm flex items-center justify-center flex-shrink-0">
                  SR
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">Sneha Roy</span>
<span className="font-body-sm text-body-sm text-text-muted">MR-2287 · Kolkata East</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Dr. Subhash Bose, MD</span>
<span className="font-body-sm text-body-sm text-text-secondary">Chest Physician · Woodlands Heart Centre</span>
</div>
</td>
<td className="px-3 py-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">person_check</span> Doctor Detail
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-text-primary">
<span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
<span className="">12:15 PM</span>
</div>
<span className="font-body-sm text-body-sm text-status-success">
                  22.5726° N, 88.3639° E (18m)
                </span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">Resp-Clear Inhaler (6m)</span>
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              1x Demo Inhaler Unit, 3x Patient Guides
            </td>
<td className="px-3 py-3 text-center">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm">
<span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> Approved
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="Inspect Call" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="VA Feedback" type="button">
<span className="material-symbols-outlined text-[18px]">rate_review</span>
</button>
</div>
</td>
</tr>
{/* ROW 6: Amit Verma (Lucknow - Stockist Follow-up) */}
<tr className="hover:bg-surface-subtle/70 transition-colors h-table-row-height bg-surface-card">
<td className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed font-headline-sm flex items-center justify-center flex-shrink-0">
                  AV
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">Amit Verma</span>
<span className="font-body-sm text-body-sm text-text-muted">MR-6011 · Lucknow North</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Awadh Pharma Distributors</span>
<span className="font-body-sm text-body-sm text-text-secondary">Distributor: Manoj Tandon</span>
</div>
</td>
<td className="px-3 py-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">store</span> Stockist Follow-up
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-text-primary">
<span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
<span className="">12:42 PM</span>
</div>
<span className="font-body-sm text-body-sm text-text-secondary">Payment Realization &amp; Stock Audit</span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">Batch Reconciliation #ZIV-990</span>
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              Scheme Circular Q3 Handover
            </td>
<td className="px-3 py-3 text-center">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm">
                Draft / In-Transit
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="Inspect Call" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination Footer */}
<div className="px-card-padding-spacious py-3 bg-surface-canvas/50 flex flex-col sm:flex-row items-center justify-between gap-3">
<div className="flex items-center gap-2 font-body-sm text-body-sm text-text-muted">
<span className="">Rows per page:</span>
<select className="bg-surface-card px-2 py-1 rounded text-text-primary font-label-md text-label-md focus:outline-none">
<option>25</option>
<option>50</option>
<option>100</option>
</select>
<span className="">Showing 1 to 6 of 1,420 entries</span>
</div>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded text-text-muted hover:bg-surface-card font-label-md text-label-md transition-colors" type="button">First</button>
<button className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:bg-surface-card" type="button">
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button className="w-7 h-7 rounded bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center" type="button">1</button>
<button className="w-7 h-7 rounded hover:bg-surface-card text-text-secondary font-label-md text-label-md flex items-center justify-center" type="button">2</button>
<button className="w-7 h-7 rounded hover:bg-surface-card text-text-secondary font-label-md text-label-md flex items-center justify-center" type="button">3</button>
<span className="px-1 text-text-muted">...</span>
<button className="w-7 h-7 rounded hover:bg-surface-card text-text-secondary font-label-md text-label-md flex items-center justify-center" type="button">237</button>
<button className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:bg-surface-card" type="button">
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
<button className="px-2.5 py-1 rounded text-text-secondary hover:bg-surface-card font-label-md text-label-md transition-colors" type="button">Last</button>
</div>
</div>
</div>
{/* AUXILIARY SPLIT PANELS (60/40 RATIO): LIVE GEO-FEED & E-DETAILING ANALYTICS */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
{/* PANEL A: LIVE GEO-VERIFICATION & DOCTOR COVERAGE FEED (7 COLUMNS) */}
<div className="lg:col-span-7 bg-surface-card rounded-xl shadow-sm p-card-padding-spacious flex flex-col justify-between space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">explore</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">Live Rep Route &amp; Geofence Verification</h2>
<span className="font-body-sm text-body-sm text-text-muted">Rahul Sharma (MR-4089) · Route Track: Bandra-Khar-Santacruz</span>
</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm">
          98.4% Route Compliance
        </span>
</div>
{/* Real Map Location Viewport */}
<div className="relative w-full h-56 rounded-lg overflow-hidden shadow-inner group">
<div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-location="Bandra Kurla Complex, Mumbai, India" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9e4szfnLnW_KgyvabFf8ha0QQPfMaf3ovjONv7S96_kNNANIxU87fegM53an6Yx4wxulG7jLw9pCsmHt2jIoMisyzCZr0Bjy1XVnvh9mxvQ1ba6kuADYRuMWj8g0GZMY7zy8XFpdlcXdQ0ImzMvJJaSxGi398ljmFbQ0svEpCgpUCm6foj0XFD2uNxus08ZL4H1DS8V6UfvstcntRf8rdxeYIzH9g3RlwucbhuNnOqcqgU4uiX6NM')" }}></div>
<div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
{/* Live Route HUD Overlay */}
<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-status-success text-[18px]">satellite_alt</span>
<span className="font-label-sm text-label-sm tracking-wide">GPS Signal: High Precision (HDOP 0.8)</span>
</div>
<span className="font-label-sm text-label-sm bg-inverse-surface/90 px-2 py-0.5 rounded text-white backdrop-blur-sm">
            Live Ping: 2m ago
          </span>
</div>
</div>
{/* Linear Route Milestone Progress */}
<div className="space-y-2 pt-1">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Today's Sequenced Route Progress</span>
<div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
<div className="p-2 rounded-lg bg-surface-canvas flex flex-col justify-between">
<div className="flex items-center justify-between text-status-success font-label-sm text-label-sm">
<span className="">09:30 AM</span>
<span className="material-symbols-outlined text-[14px]">check_circle</span>
</div>
<span className="font-label-md text-label-md text-text-primary truncate mt-1">Dr. S. Kulkarni</span>
<span className="text-[11px] text-text-muted">Completed (14m)</span>
</div>
<div className="p-2 rounded-lg bg-surface-canvas flex flex-col justify-between">
<div className="flex items-center justify-between text-status-success font-label-sm text-label-sm">
<span className="">10:14 AM</span>
<span className="material-symbols-outlined text-[14px]">check_circle</span>
</div>
<span className="font-label-md text-label-md text-text-primary truncate mt-1">Dr. Ananya Iyer</span>
<span className="text-[11px] text-text-muted">Completed (8m)</span>
</div>
<div className="p-2 rounded-lg bg-brand-primary-subtle flex flex-col justify-between">
<div className="flex items-center justify-between text-primary font-label-sm text-label-sm">
<span className="">11:45 AM</span>
<span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
</div>
<span className="font-label-md text-label-md text-text-primary truncate mt-1">Dr. P. Nambiar</span>
<span className="text-[11px] text-primary font-medium">In Clinic Visit Now</span>
</div>
<div className="p-2 rounded-lg bg-surface-canvas flex flex-col justify-between opacity-70">
<div className="flex items-center justify-between text-text-muted font-label-sm text-label-sm">
<span className="">02:15 PM</span>
<span className="material-symbols-outlined text-[14px]">schedule</span>
</div>
<span className="font-label-md text-label-md text-text-secondary truncate mt-1">Dr. F. Merchant</span>
<span className="text-[11px] text-text-muted">Next Scheduled</span>
</div>
</div>
</div>
</div>
{/* PANEL B: E-DETAILING INSIGHTS (VA SESSION METRICS - 5 COLUMNS) */}
<div className="lg:col-span-5 bg-surface-card rounded-xl shadow-sm p-card-padding-spacious flex flex-col justify-between space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">analytics</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">E-Detailing VA Session Metrics</h2>
<span className="font-body-sm text-body-sm text-text-muted">Digital Visual Aid Engagement Today</span>
</div>
</div>
<button className="text-text-muted hover:text-text-primary" type="button">
<span className="material-symbols-outlined text-[18px]">more_horiz</span>
</button>
</div>
{/* Micro Visual Aid Engagement Summary Bar */}
<div className="p-3 rounded-lg bg-surface-canvas flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-secondary">Average Screen Duration</span>
<div className="font-headline-md text-headline-md text-text-primary mt-0.5">8m 24s / call</div>
</div>
<div className="h-10 w-px bg-surface-subtle"></div>
<div>
<span className="font-body-sm text-body-sm text-text-secondary">VA Interactive Slips</span>
<div className="font-headline-md text-headline-md text-primary mt-0.5">1,248 total</div>
</div>
</div>
{/* Top Detailed Product Performance Bars */}
<div className="space-y-3.5 flex-1">
{/* Product 1 */}
<div className="space-y-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="font-label-md text-label-md text-text-primary">1. ZiviCal D3 (Bone &amp; Calcium)</span>
<span className="text-text-secondary font-semibold">412 slides · 92% Engagement</span>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ "width": "92%" }}></div>
</div>
</div>
{/* Product 2 */}
<div className="space-y-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="font-label-md text-label-md text-text-primary">2. CardioCare 20 (Hypertension)</span>
<span className="text-text-secondary font-semibold">310 slides · 88% Engagement</span>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full" style={{ "width": "88%" }}></div>
</div>
</div>
{/* Product 3 */}
<div className="space-y-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="font-label-md text-label-md text-text-primary">3. GlycoZiv XR (Anti-Diabetic)</span>
<span className="text-text-secondary font-semibold">245 slides · 79% Engagement</span>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-tertiary h-full rounded-full" style={{ "width": "79%" }}></div>
</div>
</div>
{/* Product 4 */}
<div className="space-y-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="font-label-md text-label-md text-text-primary">4. Resp-Clear Dry Inhaler</span>
<span className="text-text-secondary font-semibold">180 slides · 72% Engagement</span>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
<div className="bg-outline h-full rounded-full" style={{ "width": "72%" }}></div>
</div>
</div>
</div>
{/* Quick Action Feedback Link */}
<div className="pt-2 flex items-center justify-between text-text-secondary font-body-sm text-body-sm">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-status-success">check</span>
          Sync status: 99.1% updated
        </span>
<a className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1" href="#">
<span className="">Download VA Analytics</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
</div>
</div>
</div>
    </div>
  );
}
