import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminDoctorCelebrationsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      

<div className="flex flex-col w-full">

{/* Breadcrumb and Quick Status Strip */}
<div className="flex items-center justify-between gap-4 mb-4">
<div className="flex items-center gap-2 text-text-secondary font-body-sm text-body-sm">
<a className="hover:text-primary transition-colors flex items-center gap-1" href="#">
<span className="material-symbols-outlined text-[16px]">domain</span>
<span className="">Platform</span>
</a>
<span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
<span className="font-label-md text-label-md text-text-primary bg-surface-container px-2.5 py-0.5 rounded-full">Doctor Celebrations</span>
<span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
<span className="font-label-sm text-label-sm text-status-success uppercase bg-status-success-bg px-2 py-0.5 rounded-full flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
        Active CRM Sync (Sep 2026)
      </span>
</div>
<div className="hidden sm:flex items-center gap-3">
<div className="flex items-center gap-1.5 bg-surface-card px-3 py-1 rounded-full shadow-sm text-text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-status-success">verified</span>
<span className="">WhatsApp API Status: Connected</span>
</div>
<div className="flex items-center gap-1.5 bg-surface-card px-3 py-1 rounded-full shadow-sm text-text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-primary">local_shipping</span>
<span className="">Courier Dispatch Hub: Active</span>
</div>
</div>
</div>
{/* Page Header & Action Controls Bar */}
<div className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm mb-6 relative overflow-hidden">
<div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-gradient-to-bl from-brand-primary-subtle via-transparent to-transparent rounded-full pointer-events-none opacity-70"></div>
<div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
<div className="max-w-3xl space-y-1.5">
<div className="flex items-center gap-2.5">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">Healthcare Professional Care &amp; Retention</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
          Doctor Celebrations &amp; Relationship Engagement
        </h1>
<p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          Track upcoming physician birthdays, clinic anniversaries, CME milestones, and automated relationship management workflows for field representatives.
        </p>
</div>
{/* Action Button */}
<div className="flex items-center gap-2.5 flex-shrink-0"><button className="h-10 px-4 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-md text-label-md inline-flex items-center gap-2 border border-border-subtle shadow-xs transition-colors focus:outline-none" type="button"><span className="material-symbols-outlined text-[18px] text-text-secondary">download</span><span className="">Export Roster</span></button><button className="h-10 px-4 rounded-lg bg-[#b43403] hover:bg-[#9a3412] text-white font-label-md text-label-md inline-flex items-center gap-2 shadow-sm transition-all transform active:scale-95 focus:outline-none" type="button"><span className="material-symbols-outlined text-[18px] text-white">card_giftcard</span><span className="font-semibold">+ Schedule Custom Greeting / Gift Dispatch</span></button></div>
</div>
{/* Filter Strip */}
<div className="mt-6 pt-5 bg-surface-canvas rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
<div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">travel_explore</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none">
<option>All Territories / Pan-India HQ</option>
<option>Mumbai South Metro (Tier 1)</option>
<option>Bengaluru Central &amp; Whitefield</option>
<option>Delhi NCR - South Ext &amp; Gurugram</option>
<option>Kolkata Salt Lake Sector</option>
<option>Chennai Kodambakkam Hub</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">celebration</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none">
<option>Celebration Type: All (68)</option>
<option>Birthdays (42)</option>
<option>Clinic Anniversaries (18)</option>
<option>Clinic Foundation Days (8)</option>
<option>Medical Accolades &amp; Fellowships (5)</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">calendar_month</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none">
<option>Date Range: This Month (Sep 2026)</option>
<option>This Week (8 - 14 Sep 2026)</option>
<option>Next 7 Days</option>
<option>Next 14 Days (Critical Window)</option>
<option>Q3 Consolidated</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">stars</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none">
<option>Physician Tier: All</option>
<option>Tier A+ (Key Opinion Leaders)</option>
<option>Tier A (High Prescribing)</option>
<option>Tier B (Core Network)</option>
</select>
</div>
</div>
<div className="flex items-center gap-2">
<span className="font-body-sm text-body-sm text-text-muted">Showing 24 of 68 Events</span>
<button className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-subtle flex items-center justify-center text-text-secondary transition-colors" title="Reset Filters" type="button">
<span className="material-symbols-outlined text-[18px]">restart_alt</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>

{/* Key Metric Summary Cards (4 across) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-grid-gutter mb-6">
{/* Card 1 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">Celebrations This Month</span>
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">68</span>
<span className="font-label-md text-label-md text-text-secondary">Doctors</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">cake</span>
</div>
</div>
<div className="space-y-2">
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden flex">
<div className="bg-primary h-full" style={{ "width": "61.7%" }} title="42 Birthdays"></div>
<div className="bg-status-info h-full" style={{ "width": "26.5%" }} title="18 Anniversaries"></div>
<div className="bg-tertiary h-full" style={{ "width": "11.8%" }} title="8 Clinic Foundation"></div>
</div>
<div className="flex items-center justify-between text-[11px] font-body-sm text-text-muted">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block"></span>42 Birthdays</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-info inline-block"></span>18 Anniv.</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span>8 Clinic Days</span>
</div>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">Greetings Dispatched</span>
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">54</span>
<span className="font-label-md text-label-md text-text-muted">/ 68</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">mark_email_read</span>
</div>
</div>
<div className="space-y-2">
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-success h-full rounded-full" style={{ "width": "79.4%" }}></div>
</div>
<div className="flex items-center justify-between font-body-sm text-body-sm">
<span className="font-label-md text-label-md text-status-success flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
            79.4% Fulfillment
          </span>
<span className="text-text-muted font-label-sm text-label-sm">SMS / WA &amp; MR Hand-off</span>
</div>
</div>
</div>
{/* Card 3 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">Personalized Cakes &amp; Hampers</span>
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">28</span>
<span className="font-label-md text-label-md text-text-secondary">Delivered</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">featured_seasonal_and_gifts</span>
</div>
</div>
<div className="space-y-2">
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-info h-full rounded-full" style={{ "width": "70.8%" }}></div>
</div>
<div className="flex items-center justify-between font-body-sm text-body-sm">
<span className="font-label-md text-label-md text-text-primary">₹42,500 <span className="text-text-muted font-normal">spent</span></span>
<span className="font-label-sm text-label-sm text-text-muted">Cap: ₹60,000 alloc.</span>
</div>
</div>
</div>
{/* Card 4 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">MR Acknowledgement Rate</span>
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">91.2%</span>
<span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +3.4%
            </span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">how_to_reg</span>
</div>
</div>
<div className="space-y-2">
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-warning h-full rounded-full" style={{ "width": "91.2%" }}></div>
</div>
<div className="flex items-center justify-between font-body-sm text-body-sm">
<span className="text-text-secondary">Logged personal visit</span>
<span className="font-label-md text-label-md text-text-primary">62/68 MRs</span>
</div>
</div>
</div>
</div>
{/* Interactive Navigation Tabs */}
<div className="flex items-center gap-2 border-b-0 mb-4 bg-surface-card rounded-xl p-1.5 shadow-sm max-w-fit">
<button className="px-4 py-2 rounded-lg bg-brand-primary-subtle text-primary font-label-md text-label-md flex items-center gap-2 shadow-xs transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">event_upcoming</span>
<span className="">Upcoming Celebrations (Next 14 Days)</span>
<span className="w-5 h-5 rounded-full bg-[#b43403] text-white text-[11px] font-bold flex items-center justify-center">24</span>
</button>
<button className="px-4 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary font-label-md text-label-md flex items-center gap-2 transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">done_all</span>
<span className="">Completed &amp; Dispatched This Month</span>
<span className="font-label-sm text-label-sm text-text-muted">(44)</span>
</button>
<button className="px-4 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary font-label-md text-label-md flex items-center gap-2 transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">drafts</span>
<span className="">Automated Digital Greeting Templates</span>
</button>
<button className="px-4 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary font-label-md text-label-md flex items-center gap-2 transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">military_tech</span>
<span className="">Executive Gift &amp; CME Sponsorship Tracker</span>
</button>
</div>
{/* Celebration Schedule & Action Grid */}
<div className="bg-surface-card rounded-xl shadow-sm mb-6 overflow-hidden">
<div className="px-card-padding-spacious py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-subtle/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">Upcoming Active Physician Milestones</h2>
<p className="font-body-sm text-body-sm text-text-muted">Real-time status tracking for greeting cards, automated communications, and representative deliveries.</p>
</div>
</div>
<div className="flex items-center gap-2.5">
<div className="relative">
<input className="h-9 w-64 pl-8 pr-3 rounded-lg bg-surface-card text-text-primary placeholder:text-text-muted font-body-sm text-body-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Filter roster by doctor name, clinic, or rep..." type="text"/>
<span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">filter_list</span>
</div>
<button className="h-9 px-3 rounded-lg bg-surface-card hover:bg-surface-subtle text-text-secondary font-label-md text-label-md flex items-center gap-1.5 shadow-xs transition-colors" type="button">
<span className="material-symbols-outlined text-[17px]">batch_prediction</span>
<span className="">Bulk Approve (3)</span>
</button>
</div>
</div>
{/* Table */}
<div className="overflow-x-auto">
<table className="w-full text-left font-table-cell text-table-cell">
<thead>
<tr className="bg-surface-canvas text-text-secondary font-label-sm text-label-sm uppercase tracking-wider h-10">
<th className="pl-card-padding-spacious pr-3 py-2 w-10">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</th>
<th className="px-4 py-2 font-semibold">Doctor Profile</th>
<th className="px-4 py-2 font-semibold">Celebration &amp; Date</th>
<th className="px-4 py-2 font-semibold">Assigned Field Rep &amp; Territory</th>
<th className="px-4 py-2 font-semibold">Greeting Workflow</th>
<th className="px-4 py-2 font-semibold">Assigned Gesture / Gift</th>
<th className="pr-card-padding-spacious pl-4 py-2 font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0">
{/* Row 1: Urgent (Needs Approval / In 2 Days) */}
<tr className="hover:bg-brand-primary-subtle/30 transition-colors">
<td className="pl-card-padding-spacious pr-3 py-3.5">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="Senior Indian physician portrait wearing white medical coat with stethoscope in a clean modern clinic setting, warm ambient lighting, authoritative healthcare professional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYjR09nS0O_vm4OElLqgo03aN8H7ynVb7j3xIjpDKwihSdMrkPhXYjWgpmQ3iHIXX31XzWzANsvAEUlILjryUso7XlZgPBQGxcC6PJWQmCwVbhP33sK0rw5hbtYWN3ivf3Ycj3gu9CsbEiTB8jxhHMbIZQDfHV1pkpKw97-mmqbHi8Z9bCzr0n56QYNXgxrtVBa3WyUgXE1VyyEmzci9cHqeF-hzehfjG7ru38Lufr5hW3wddNV2fQ"/>
</div>
<div className="min-w-0">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-text-primary truncate">Dr. Rajesh V. Merchant</span>
<span className="px-2 py-0.5 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm font-bold">Tier A+</span>
</div>
<span className="font-body-sm text-body-sm text-text-secondary block">Cardiology • Breach Candy Hospital &amp; Heart Clinic</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[18px]">cake</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">58th Birthday</span>
<span className="font-label-sm text-label-sm text-status-danger font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">schedule</span> In 2 Days (12 Sep)
                  </span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-bold text-[11px]">RS</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Rahul Sharma</span>
<span className="font-body-sm text-body-sm text-text-muted">Mumbai South Metro</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<span className="px-2.5 py-1 rounded-full bg-status-warning-bg text-status-warning font-label-sm text-label-sm flex items-center gap-1.5 w-fit">
<span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-ping"></span>
                Needs Approval
              </span>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">military_tech</span>
<div>
<span className="font-label-md text-label-md text-text-primary block truncate max-w-[220px]">Personalized Desk Plaque</span>
<span className="font-body-sm text-body-sm text-text-muted">+ Gourmet Artisanal Box</span>
</div>
</div>
</td>
<td className="pr-card-padding-spacious pl-4 py-3.5 text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">visibility</span>
<span className="">Card</span>
</button>
<button className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-brand-primary-hover text-on-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">verified</span>
<span className="">Approve</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Notify MR" type="button">
<span className="material-symbols-outlined text-[18px]">chat</span>
</button>
</div>
</td>
</tr>
{/* Row 2: Clinic Anniversary (Dispatched) */}
<tr className="hover:bg-surface-subtle/50 transition-colors">
<td className="pl-card-padding-spacious pr-3 py-3.5">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="Confident female Indian endocrinologist in smart medical attire sitting in consultation room with modern clinic diplomas on wall, natural soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZa-pQfl4mt58c5fijVWqarKXo2nXxjbJyEimIXfoZV33l5kzNvH91zPx5nYhtGGHyHdoZcNwFW6FdYUDyvby2jmJ9ISlu8o7aqSfWsJA8zhvk1AXntmklO4zpH3NslKk8CNV7DEsi1X9AFBAiqLRvxvXu7O5YXfOXUzsZ_Zlo05sT2rjen7UPNBZ_FYqeflE1kcscWTNBuMNckSfQ-5I4Cj9Ol9QZEAyJhqN5NhvCkWaGsGDcq0Pi"/>
</div>
<div className="min-w-0">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-text-primary truncate">Dr. Sunita K. Nambiar</span>
<span className="px-2 py-0.5 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm font-bold">Tier A+</span>
</div>
<span className="font-body-sm text-body-sm text-text-secondary block">Endocrinology • Apex Diabetes Centre, Bengaluru</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[18px]">domain_verification</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">15th Clinic Anniversary</span>
<span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">event</span> 14 Sep 2026
                  </span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-bold text-[11px]">VK</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Vikas Kulkarni</span>
<span className="font-body-sm text-body-sm text-text-muted">Bengaluru Central Hub</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<span className="px-2.5 py-1 rounded-full bg-status-info-bg text-status-info font-label-sm text-label-sm flex items-center gap-1.5 w-fit">
<span className="material-symbols-outlined text-[14px]">local_shipping</span>
                Dispatched via BlueDart
              </span>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-status-info text-[18px]">featured_seasonal_and_gifts</span>
<div>
<span className="font-label-md text-label-md text-text-primary block truncate max-w-[220px]">Custom Crystal Milestone Trophy</span>
<span className="font-body-sm text-body-sm text-text-muted">Engraved with clinic foundation date</span>
</div>
</div>
</td>
<td className="pr-card-padding-spacious pl-4 py-3.5 text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">visibility</span>
<span className="">Preview</span>
</button>
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-status-info font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">share_location</span>
<span className="">Track #9102</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Message MR" type="button">
<span className="material-symbols-outlined text-[18px]">chat</span>
</button>
</div>
</td>
</tr>
{/* Row 3: Scheduled automated wishes */}
<tr className="hover:bg-surface-subtle/50 transition-colors">
<td className="pl-card-padding-spacious pr-3 py-3.5">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="Distinguished senior male physician with spectacles and stethoscope in consultation chambers, warm interior lighting with medical references" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7dMrfp_ttzq8xYcasOudNMSaQC-k6SzoT68HbBMH2481OuEALjCXf8g1XGWOx6AwoIGiFG1JJHYq92ovhNfKQbL7-jGzTBc4CG_wQ6WQKNRIcbAwO90DINNd7IqVXNs5f8sIn5Hr-m9vidDJJObyj854-x6n1fRhz357gEkOn_r-U7n1KuRX0kT30wFOJH2miJyBiD2Nb6HfbXIxrxR0SEn1Dfdh65vJz9BbgKhi4BKR3ZNh2p7Rp"/>
</div>
<div className="min-w-0">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-text-primary truncate">Dr. Arvind Sen</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold">Tier A</span>
</div>
<span className="font-body-sm text-body-sm text-text-secondary block">Pulmonology • Fortis Escorts Hospital, Delhi</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[18px]">cake</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">62nd Birthday</span>
<span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">event</span> 16 Sep 2026
                  </span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-bold text-[11px]">AD</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Amit Duggal</span>
<span className="font-body-sm text-body-sm text-text-muted">Delhi NCR South</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<span className="px-2.5 py-1 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm flex items-center gap-1.5 w-fit">
<span className="material-symbols-outlined text-[14px]">schedule_send</span>
                Scheduled (Auto-WA 08:00)
              </span>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">local_florist</span>
<div>
<span className="font-label-md text-label-md text-text-primary block truncate max-w-[220px]">Premium Floral Bouquet &amp; Letter</span>
<span className="font-body-sm text-body-sm text-text-muted">Hand-delivered by MR Amit Duggal</span>
</div>
</div>
</td>
<td className="pr-card-padding-spacious pl-4 py-3.5 text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">visibility</span>
<span className="">Card</span>
</button>
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-primary font-label-md text-label-md flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">notifications</span>
<span className="">Notify MR</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Settings" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
{/* Row 4: Medical Accolade (Delivered) */}
<tr className="hover:bg-surface-subtle/50 transition-colors">
<td className="pl-card-padding-spacious pr-3 py-3.5">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="Middle-aged female physician specialist smiling gracefully in clean executive clinical office with medical books and research awards in background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe4FJaFViveQgXkbCT_8eooSxhoaV4PeJYYfHh7uZupTLN3VpUcttnM7o2sU3PWBkmzQ2QNWuMOqaom93_cGjX7Y1mVWIF4IJCWfE23VJY79SkQTnYoce3T2_TdwSRql4pDDPIXr4Od0wW-GRs6Csbl7yLFAGaN5msSqnaOehQZBfNoYjU_nNrtQjvcjtfz1bi75Bhzj1poQqkW8bJX2dolIhIssPm5_yvRZtsBH3MM7y3_w2HBDRK"/>
</div>
<div className="min-w-0">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-text-primary truncate">Dr. Meenakshi Sundaram</span>
<span className="px-2 py-0.5 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm font-bold">Tier A+</span>
</div>
<span className="font-body-sm text-body-sm text-text-secondary block">Neurology • Apollo Specialty Hospitals, Chennai</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[18px]">workspace_premium</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Elected Fellow of INA</span>
<span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">event</span> 18 Sep 2026
                  </span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-bold text-[11px]">KN</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Karthik Nathan</span>
<span className="font-body-sm text-body-sm text-text-muted">Chennai Central Hub</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<span className="px-2.5 py-1 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm flex items-center gap-1.5 w-fit">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                Delivered &amp; Logged
              </span>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">verified</span>
<div>
<span className="font-label-md text-label-md text-text-primary block truncate max-w-[220px]">Executive Leather Portfolio</span>
<span className="font-body-sm text-body-sm text-text-muted">Congratulatory Commendation from HQ</span>
</div>
</div>
</td>
<td className="pr-card-padding-spacious pl-4 py-3.5 text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">history</span>
<span className="">Log Details</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="View Acknowledgement Photo" type="button">
<span className="material-symbols-outlined text-[18px]">image</span>
</button>
</div>
</td>
</tr>
{/* Row 5: Clinic Foundation Day (Scheduled) */}
<tr className="hover:bg-surface-subtle/50 transition-colors">
<td className="pl-card-padding-spacious pr-3 py-3.5">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="Energetic senior male pediatrician in modern pediatric clinic office with warm colorful healthcare equipment and awards on shelf" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw4Hlp0flClxxHU-SfOq4khWtTt0WbvyGu0B492Pz_LXhWs0rElspBzguSh4cF_VwnMKKlsGUgEG-5IXOFeYgnLC6gB6CBUo0dTPDdHItCCpW__TEx84ffWM5d1UBhZTlNkJX3_y0aq1HkgqXXGe4bm-O1B5cQWwSlOqF2HCLictrk0tVKqzysmsWXHlKCqFSlf3TbW5gfvPIU_mGb-CS7mlzcToysvOvaOh8a3WCkuuFUEm_Yq_FB"/>
</div>
<div className="min-w-0">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-text-primary truncate">Dr. Pradip Roy</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold">Tier A</span>
</div>
<span className="font-body-sm text-body-sm text-text-secondary block">Pediatrics • Shishu Seva Sadan, Kolkata</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[18px]">foundation</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">20th Foundation Day</span>
<span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">event</span> 21 Sep 2026
                  </span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-bold text-[11px]">SM</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Subhashish Mitra</span>
<span className="font-body-sm text-body-sm text-text-muted">Kolkata East &amp; Salt Lake</span>
</div>
</div>
</td>
<td className="px-4 py-3.5 whitespace-nowrap">
<span className="px-2.5 py-1 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm flex items-center gap-1.5 w-fit">
<span className="material-symbols-outlined text-[14px]">timer</span>
                Dispatch In Prep
              </span>
</td>
<td className="px-4 py-3.5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">cake</span>
<div>
<span className="font-label-md text-label-md text-text-primary block truncate max-w-[220px]">Celebration Cake &amp; Sweets Hamper</span>
<span className="font-body-sm text-body-sm text-text-muted">Local Patisserie Partner (Flurys)</span>
</div>
</div>
</td>
<td className="pr-card-padding-spacious pl-4 py-3.5 text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">visibility</span>
<span className="">Card</span>
</button>
<button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-primary font-label-md text-label-md flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">local_shipping</span>
<span className="">Order Cake</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Settings" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination & Footer Status */}
<div className="px-card-padding-spacious py-3.5 bg-surface-card flex flex-col sm:flex-row items-center justify-between gap-3 text-text-secondary font-body-sm text-body-sm">
<div className="flex items-center gap-2">
<span className="">Displaying rows 1 - 5 of 24 upcoming events</span>
<span className="w-1 h-1 rounded-full bg-text-muted"></span>
<span className="text-primary font-label-sm text-label-sm">3 events require manager clearance</span>
</div>
<div className="flex items-center gap-1.5">
<button className="w-8 h-8 rounded-lg bg-surface-subtle text-text-muted flex items-center justify-center cursor-not-allowed" disabled={true} type="button">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg bg-[#b43403] text-white font-label-sm text-label-sm flex items-center justify-center font-semibold shadow-xs" type="button">1</button>
<button className="w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-secondary font-label-sm text-label-sm flex items-center justify-center" type="button">2</button>
<button className="w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-secondary font-label-sm text-label-sm flex items-center justify-center" type="button">3</button>
<button className="w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-secondary flex items-center justify-center" type="button">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Bottom Visual Analytics Panels (60/40 Split) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter mb-2">
{/* Left: Monthly Celebration Distribution Calendar Preview (7 Cols) */}
<div className="lg:col-span-7 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2.5">
<span className="w-2.5 h-2.5 rounded-full bg-status-info"></span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Monthly Celebration Distribution Calendar (Sep 2026)</h3>
</div>
<span className="font-label-sm text-label-sm text-text-muted bg-surface-subtle px-2.5 py-1 rounded-md">Peak Cluster: Week 3</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-4">
          Heatmap overview of HCP milestones across 4 distinct weeks. Optimize representative physical visits and prevent dispatch bottlenecks.
        </p>
{/* Inline Visual Heatmap Grid */}
<div className="grid grid-cols-4 gap-3 mb-5">
{/* Week 1 */}
<div className="bg-surface-canvas rounded-lg p-3 relative">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm uppercase text-text-muted">Week 1 (1 - 7 Sep)</span>
<span className="font-label-sm text-label-sm font-bold text-text-primary">12 Docs</span>
</div>
<div className="space-y-1">
<div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
<div className="h-full bg-status-success rounded-full" style={{ "width": "100%" }}></div>
</div>
<span className="text-[11px] font-body-sm text-status-success flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[13px]">done_all</span> 100% Fulfilled
              </span>
</div>
</div>
{/* Week 2 (Current) */}
<div className="bg-brand-primary-subtle/50 rounded-lg p-3 relative ring-1 ring-primary/20">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm uppercase text-primary font-bold">Week 2 (8 - 14 Sep)</span>
<span className="font-label-sm text-label-sm font-bold text-primary">18 Docs</span>
</div>
<div className="space-y-1">
<div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" style={{ "width": "66%" }}></div>
</div>
<span className="text-[11px] font-body-sm text-primary flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[13px]">pending</span> 12 Done • 6 Pending
              </span>
</div>
</div>
{/* Week 3 (Peak) */}
<div className="bg-surface-canvas rounded-lg p-3 relative">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm uppercase text-text-muted">Week 3 (15 - 21 Sep)</span>
<span className="font-label-sm text-label-sm font-bold text-status-warning">26 Docs</span>
</div>
<div className="space-y-1">
<div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
<div className="h-full bg-status-warning rounded-full" style={{ "width": "30%" }}></div>
</div>
<span className="text-[11px] font-body-sm text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">schedule</span> Peak Workload Stage
              </span>
</div>
</div>
{/* Week 4 */}
<div className="bg-surface-canvas rounded-lg p-3 relative">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm uppercase text-text-muted">Week 4 (22 - 30 Sep)</span>
<span className="font-label-sm text-label-sm font-bold text-text-primary">12 Docs</span>
</div>
<div className="space-y-1">
<div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{ "width": "0%" }}></div>
</div>
<span className="text-[11px] font-body-sm text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">schedule_send</span> Queued in Pipeline
              </span>
</div>
</div>
</div>
{/* SVG Mini Bar Chart: Daily Density */}
<div className="bg-surface-canvas rounded-lg p-4">
<div className="flex items-center justify-between mb-2">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Daily Distribution Curve (Sep 1 - 30)</span>
<div className="flex items-center gap-3 text-[11px] font-body-sm text-text-secondary">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary inline-block"></span> Birthdays</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-status-info inline-block"></span> Anniversaries</span>
</div>
</div>
<svg className="w-full h-20 text-primary" fill="none" preserveaspectratio="none" viewBox="0 0 600 80">
{/* Grid lines */}
<line stroke="#E2E8F0" strokeDasharray="3 3" x1="0" x2="600" y1="20" y2="20"></line>
<line stroke="#E2E8F0" strokeDasharray="3 3" x1="0" x2="600" y1="50" y2="50"></line>
{/* Week 1 Bars */}
<rect fill="#a33900" height="30" opacity="0.8" rx="2" width="14" x="20" y="45"></rect>
<rect fill="#2563EB" height="20" opacity="0.8" rx="2" width="14" x="40" y="55"></rect>
<rect fill="#a33900" height="40" opacity="0.8" rx="2" width="14" x="60" y="35"></rect>
<rect fill="#2563EB" height="15" opacity="0.8" rx="2" width="14" x="80" y="60"></rect>
<rect fill="#a33900" height="35" opacity="0.8" rx="2" width="14" x="100" y="40"></rect>
{/* Week 2 Bars (Current) */}
<rect fill="#a33900" height="45" rx="2" width="14" x="150" y="30"></rect>
<rect fill="#2563EB" height="55" rx="2" width="14" x="170" y="20"></rect>
<rect fill="#a33900" height="60" rx="2" width="14" x="190" y="15"></rect>
<rect fill="#a33900" height="40" rx="2" width="14" x="210" y="35"></rect>
<rect fill="#2563EB" height="30" rx="2" width="14" x="230" y="45"></rect>
{/* Week 3 Bars (Peak) */}
<rect fill="#a33900" height="65" rx="2" width="14" x="290" y="10"></rect>
<rect fill="#2563EB" height="60" rx="2" width="14" x="310" y="15"></rect>
<rect fill="#a33900" height="70" rx="2" width="14" x="330" y="5"></rect>
<rect fill="#a33900" height="55" rx="2" width="14" x="350" y="20"></rect>
<rect fill="#2563EB" height="50" rx="2" width="14" x="370" y="25"></rect>
<rect fill="#a33900" height="57" rx="2" width="14" x="390" y="18"></rect>
{/* Week 4 Bars */}
<rect fill="#a33900" height="25" opacity="0.6" rx="2" width="14" x="450" y="50"></rect>
<rect fill="#2563EB" height="35" opacity="0.6" rx="2" width="14" x="470" y="40"></rect>
<rect fill="#a33900" height="20" opacity="0.6" rx="2" width="14" x="490" y="55"></rect>
<rect fill="#a33900" height="15" opacity="0.6" rx="2" width="14" x="510" y="60"></rect>
<rect fill="#2563EB" height="10" opacity="0.6" rx="2" width="14" x="530" y="65"></rect>
</svg>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between text-text-secondary font-body-sm text-body-sm">
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[17px] text-primary">local_shipping</span>
          Gifts pre-batched to courier hub 4 days ahead of event
        </span>
<button className="text-primary hover:text-brand-primary-hover font-label-md text-label-md flex items-center gap-1" type="button">
<span className="">View Full Calendar Schedule</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</div>
</div>
{/* Right: Automated Greeting Channel Configuration (5 Cols) */}
<div className="lg:col-span-5 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2.5">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Greeting Channel Automation</h3>
</div>
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm font-bold">4 Active Flows</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-4">
          Centralized CRM triggers coordinating headquarters digital communications and field rep notifications.
        </p>
{/* Automation Controls List */}
<div className="space-y-3">
{/* Toggle 1: WhatsApp */}
<div className="bg-surface-canvas rounded-lg p-3 flex items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center flex-shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[18px]">chat</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Automated WhatsApp Wishes from HQ</span>
<span className="font-body-sm text-body-sm text-text-muted leading-tight block">Official branded greeting e-card sent at 08:00 AM IST on doctor celebration day.</span>
</div>
</div>
{/* Toggle Pill Active */}
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input defaultChecked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-primary"></div>
</label>
</div>
{/* Toggle 2: SMS Greeting */}
<div className="bg-surface-canvas rounded-lg p-3 flex items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[18px]">sms</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">SMS Greeting with Doctor Name</span>
<span className="font-body-sm text-body-sm text-text-muted leading-tight block">Telecom DLT compliant SMS fallback if WhatsApp is undelivered within 30 min.</span>
</div>
</div>
{/* Toggle Pill Active */}
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input defaultChecked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-primary"></div>
</label>
</div>
{/* Toggle 3: Field Rep Notification 24h prior */}
<div className="bg-surface-canvas rounded-lg p-3 flex items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[18px]">notifications_active</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Field Rep Task Reminder (24h Prior)</span>
<span className="font-body-sm text-body-sm text-text-muted leading-tight block">Pushes high-priority alert into MR mobile app to pick up gift / schedule visit.</span>
</div>
</div>
{/* Toggle Pill Active */}
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input defaultChecked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-primary"></div>
</label>
</div>
{/* Toggle 4: Manager CC Escalation */}
<div className="bg-surface-canvas rounded-lg p-3 flex items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[18px]">supervisor_account</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-primary block">Area Sales Manager (ASM) Notification</span>
<span className="font-body-sm text-body-sm text-text-muted leading-tight block">Notifies Area Manager if Tier A+ doctor gift delivery is not acknowledged by 2:00 PM.</span>
</div>
</div>
{/* Toggle Pill Active */}
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input defaultChecked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-primary"></div>
</label>
</div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-text-muted">Last sync with CRM: 4 mins ago</span>
<button className="h-8 px-3 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">tune</span>
<span className="">Edit Gateway Rules</span>
</button>
</div>
</div>
</div>

</div>
    </div>
  );
}
