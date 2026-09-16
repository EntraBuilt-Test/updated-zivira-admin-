"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode, Doctor } from "@zivira/types";
import { apiClient } from "@/lib/api-client";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component, then a later
// pass wired every button up against a local mock roster. This pass
// replaces the mock roster with the real doctor list for the selected
// month (apiClient.doctorCelebrations(month)), derived from each doctor's
// real dob / anniversaryDate. There is no backend collection at all for
// gift/greeting workflow tracking (status, gift chosen, channel toggles) —
// those stay as local, editable admin-side state seeded to honest neutral
// defaults ("Needs Approval" / "Not yet selected") instead of fabricated
// numbers, exactly like the pre-existing "Schedule Custom Greeting" flow
// already was (session-only, disclosed in the modal).

type CelebrationType = "Birthday" | "Clinic Anniversary";
type WorkflowStatus = "Needs Approval" | "Dispatched" | "Scheduled" | "Delivered" | "Dispatch In Prep";
type Tier = "Tier A+" | "Tier A";

type CelebrationRow = {
  id: string;
  doctorName: string;
  tier: Tier;
  specialtyClinic: string;
  celebrationType: CelebrationType;
  celebrationLabel: string;
  dateLabel: string;
  territory: string;
  repName: string;
  repInitials: string;
  workflowStatus: WorkflowStatus;
  gift: string;
  giftNote: string;
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function mapDoctorToCelebration(d: Doctor, month: number): CelebrationRow {
  const dob = d.dob ? new Date(d.dob) : null;
  const anniv = d.anniversaryDate ? new Date(d.anniversaryDate) : null;
  const isBirthday = !!dob && dob.getMonth() + 1 === month;
  const isAnniv = !!anniv && anniv.getMonth() + 1 === month;
  const celebrationType: CelebrationType = isBirthday || !isAnniv ? "Birthday" : "Clinic Anniversary";
  const relevantDate = celebrationType === "Birthday" ? dob : anniv;
  const day = relevantDate ? relevantDate.getDate() : null;
  const dateLabel = day ? `${day} ${MONTH_NAMES[month - 1]}` : "Date on file";
  let celebrationLabel: string = celebrationType;
  if (celebrationType === "Birthday" && dob) {
    const age = new Date().getFullYear() - dob.getFullYear();
    celebrationLabel = age > 0 ? `${age}th Birthday` : "Birthday";
  } else if (celebrationType === "Clinic Anniversary" && anniv) {
    const years = new Date().getFullYear() - anniv.getFullYear();
    celebrationLabel = years > 0 ? `${years}th Clinic Anniversary` : "Clinic Anniversary";
  }
  const repName = d.mappedEmployeeName || d.mappedEmployeeCode || "Unassigned";
  const repInitials = repName.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "--";
  return {
    id: d.id,
    doctorName: d.name,
    tier: d.category === "A" ? "Tier A+" : "Tier A",
    specialtyClinic: [d.specialty, d.clinicName || d.city].filter(Boolean).join(" • ") || "—",
    celebrationType,
    celebrationLabel,
    dateLabel,
    territory: d.territory || "Unassigned",
    repName,
    repInitials,
    workflowStatus: "Needs Approval",
    gift: "Not yet selected",
    giftNote: "Schedule a gift/gesture below"
  };
}

const TYPE_ALL: "all" = "all";

const TIER_OPTIONS: { label: string; value: "all" | Tier }[] = [
  { label: "Physician Tier: All", value: "all" },
  { label: "Tier A+ (Key Opinion Leaders)", value: "Tier A+" },
  { label: "Tier A (High Prescribing)", value: "Tier A" }
];
const VIEW_TABS = [
  { key: "upcoming", label: "This Month's Celebrations" },
  { key: "completed", label: "Completed & Dispatched" },
  { key: "templates", label: "Automated Digital Greeting Templates" },
  { key: "tracker", label: "Executive Gift & CME Sponsorship Tracker" }
] as const;

const PAGE_SIZE = 5;

const statusPillClass: Record<WorkflowStatus, string> = {
  "Needs Approval": "bg-status-warning-bg text-status-warning",
  "Dispatched": "bg-status-info-bg text-status-info",
  "Scheduled": "bg-surface-subtle text-text-secondary",
  "Delivered": "bg-status-success-bg text-status-success",
  "Dispatch In Prep": "bg-surface-subtle text-text-secondary"
};

export function AdminDoctorCelebrationsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [celebrations, setCelebrations] = useState<CelebrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [territory, setTerritory] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | CelebrationType>("all");
  const [tierFilter, setTierFilter] = useState<"all" | Tier>("all");
  const [activeView, setActiveView] = useState<(typeof VIEW_TABS)[number]["key"]>("upcoming");
  const [page, setPage] = useState(1);
  const [showSchedule, setShowSchedule] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [toggles, setToggles] = useState({ whatsapp: true, sms: true, repReminder: true, managerEscalation: true });
  const [newCelebration, setNewCelebration] = useState({ doctorName: "", celebrationLabel: "", dateLabel: "", territory: "", repName: "", gift: "" });

  async function loadCelebrations(m: number) {
    setLoading(true);
    setLoadError("");
    try {
      const response = await apiClient.doctorCelebrations(m);
      setCelebrations(response.data.map((d) => mapDoctorToCelebration(d, m)));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load doctor celebrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCelebrations(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const territoryOptions = useMemo(() => Array.from(new Set(celebrations.map((c) => c.territory))).sort(), [celebrations]);
  const typeCounts = useMemo(() => ({
    all: celebrations.length,
    Birthday: celebrations.filter((c) => c.celebrationType === "Birthday").length,
    "Clinic Anniversary": celebrations.filter((c) => c.celebrationType === "Clinic Anniversary").length
  }), [celebrations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return celebrations.filter((c) => {
      if (activeView === "completed" && c.workflowStatus !== "Delivered" && c.workflowStatus !== "Dispatched") return false;
      if (territory !== "all" && c.territory !== territory) return false;
      if (typeFilter !== "all" && c.celebrationType !== typeFilter) return false;
      if (tierFilter !== "all" && c.tier !== tierFilter) return false;
      if (!q) return true;
      return (
        c.doctorName.toLowerCase().includes(q) ||
        c.specialtyClinic.toLowerCase().includes(q) ||
        c.repName.toLowerCase().includes(q)
      );
    });
  }, [celebrations, search, territory, typeFilter, tierFilter, activeView]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const needsApprovalCount = celebrations.filter((c) => c.workflowStatus === "Needs Approval").length;

  function resetFilters() {
    setSearch("");
    setTerritory("all");
    setTypeFilter("all");
    setTierFilter("all");
    setActiveView("upcoming");
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "doctor-celebrations-roster.csv",
      filtered.map((c) => ({
        "Doctor": c.doctorName,
        "Tier": c.tier,
        "Specialty / Clinic": c.specialtyClinic,
        "Celebration": c.celebrationLabel,
        "Date": c.dateLabel,
        "Field Rep": c.repName,
        "Territory": c.territory,
        "Workflow Status": c.workflowStatus,
        "Gesture / Gift": c.gift
      }))
    );
  }

  function handleSchedule() {
    if (!newCelebration.doctorName.trim() || !newCelebration.celebrationLabel.trim()) return;
    setCelebrations((prev) => [
      ...prev,
      {
        id: `cel-${Date.now()}`,
        doctorName: newCelebration.doctorName.trim(),
        tier: "Tier A",
        specialtyClinic: "—",
        celebrationType: "Birthday",
        celebrationLabel: newCelebration.celebrationLabel.trim(),
        dateLabel: newCelebration.dateLabel.trim() || "Date TBD",
        territory: newCelebration.territory.trim() || "Unassigned Territory",
        repName: newCelebration.repName.trim() || "Unassigned",
        repInitials: (newCelebration.repName.trim().slice(0, 2) || "--").toUpperCase(),
        workflowStatus: "Needs Approval",
        gift: newCelebration.gift.trim() || "Not yet selected",
        giftNote: "Custom greeting scheduled by admin"
      }
    ]);
    setShowSchedule(false);
    setNewCelebration({ doctorName: "", celebrationLabel: "", dateLabel: "", territory: "", repName: "", gift: "" });
    setPage(totalPages + 1);
  }

  function approveCelebration(id: string) {
    setCelebrations((prev) => prev.map((c) => (c.id === id ? { ...c, workflowStatus: "Scheduled" } : c)));
  }

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
          Track physician birthdays and clinic anniversaries for the selected month, and coordinate field representative greeting/gift workflows.
        </p>
</div>
{/* Action Button */}
<div className="flex items-center gap-2.5 flex-shrink-0">
<button className="h-10 px-4 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-md text-label-md inline-flex items-center gap-2 border border-border-subtle shadow-xs transition-colors focus:outline-none" type="button" onClick={handleExport} disabled={filtered.length === 0}><span className="material-symbols-outlined text-[18px] text-text-secondary">download</span><span className="">Export Roster</span></button>
<button className="h-10 px-4 rounded-lg bg-[#b43403] hover:bg-[#9a3412] text-white font-label-md text-label-md inline-flex items-center gap-2 shadow-sm transition-all transform active:scale-95 focus:outline-none" type="button" onClick={() => setShowSchedule(true)}><span className="material-symbols-outlined text-[18px] text-white">card_giftcard</span><span className="font-semibold">Schedule Custom Greeting / Gift Dispatch</span></button>
</div>
</div>
{/* Filter Strip */}
<div className="mt-6 pt-5 bg-surface-canvas rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
<div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">calendar_month</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none" value={month} onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}>
{MONTH_NAMES.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">travel_explore</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none" value={territory} onChange={(e) => { setTerritory(e.target.value); setPage(1); }}>
<option value="all">All Territories / Pan-India HQ</option>
{territoryOptions.map((t) => <option key={t} value={t}>{t}</option>)}
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">celebration</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}>
<option value={TYPE_ALL}>Celebration Type: All ({typeCounts.all})</option>
<option value="Birthday">Birthdays ({typeCounts.Birthday})</option>
<option value="Clinic Anniversary">Clinic Anniversaries ({typeCounts["Clinic Anniversary"]})</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">stars</span>
<select className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none" value={tierFilter} onChange={(e) => { setTierFilter(e.target.value as typeof tierFilter); setPage(1); }}>
{TIER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
</select>
</div>
</div>
<div className="flex items-center gap-2">
<span className="font-body-sm text-body-sm text-text-muted">Showing {pageRows.length} of {filtered.length} Events</span>
<button className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-subtle flex items-center justify-center text-text-secondary transition-colors" title="Reset Filters" type="button" onClick={resetFilters}>
<span className="material-symbols-outlined text-[18px]">restart_alt</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>

{loadError && (
  <div className="p-3 rounded-lg border border-status-danger-bg bg-status-danger-bg text-red-600 text-xs flex items-center justify-between mb-6">
    <span>{loadError}</span>
    <button type="button" className="font-semibold underline" onClick={() => loadCelebrations(month)}>Retry</button>
  </div>
)}

{/* Key Metric Summary Cards (4 across) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-grid-gutter mb-6">
{/* Card 1 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">Celebrations This Month</span>
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">{loading ? "—" : typeCounts.all}</span>
<span className="font-label-md text-label-md text-text-secondary">Doctors</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">cake</span>
</div>
</div>
<div className="flex items-center justify-between text-[11px] font-body-sm text-text-muted">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block"></span>{typeCounts.Birthday} Birthdays</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-info inline-block"></span>{typeCounts["Clinic Anniversary"]} Anniv.</span>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">Greetings Dispatched</span>
</div>
<div className="w-10 h-10 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">mark_email_read</span>
</div>
</div>
<div className="text-xs text-text-muted italic">No data yet — greeting dispatch delivery is not tracked by any backend module.</div>
</div>
{/* Card 3 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">Personalized Cakes &amp; Hampers</span>
</div>
<div className="w-10 h-10 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">featured_seasonal_and_gifts</span>
</div>
</div>
<div className="text-xs text-text-muted italic">No data yet — gift spend is not tracked by any backend module.</div>
</div>
{/* Card 4 */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-3 mb-3">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted block mb-1">MR Acknowledgement Rate</span>
</div>
<div className="w-10 h-10 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">how_to_reg</span>
</div>
</div>
<div className="text-xs text-text-muted italic">No data yet — MR acknowledgement is not tracked by any backend module.</div>
</div>
</div>
{/* Interactive Navigation Tabs */}
<div className="flex items-center gap-2 border-b-0 mb-4 bg-surface-card rounded-xl p-1.5 shadow-sm max-w-fit overflow-x-auto">
{VIEW_TABS.map((tab) => {
  const active = activeView === tab.key;
  return (
    <button key={tab.key} className={active ? "button" : "button button-secondary"} type="button" onClick={() => { setActiveView(tab.key); setPage(1); }}>
      <span className="material-symbols-outlined text-[18px]">{tab.key === "upcoming" ? "event_upcoming" : tab.key === "completed" ? "done_all" : tab.key === "templates" ? "drafts" : "military_tech"}</span>
      <span className="">{tab.label}</span>
      {tab.key === "upcoming" && <span className="w-5 h-5 rounded-full bg-[#b43403] text-white text-[11px] font-bold flex items-center justify-center">{celebrations.length}</span>}
      {tab.key === "completed" && <span className="font-label-sm text-label-sm text-text-muted">({celebrations.filter((c) => c.workflowStatus === "Delivered" || c.workflowStatus === "Dispatched").length})</span>}
    </button>
  );
})}
</div>
{(activeView === "templates" || activeView === "tracker") && (
  <div className="text-xs text-text-muted italic mb-3 px-1">Note: this view shows the same real doctor roster as "This Month's Celebrations" — greeting templates and CME sponsorship tracking have no backend module of their own yet.</div>
)}
{/* Celebration Schedule & Action Grid */}
<div className="bg-surface-card rounded-xl shadow-sm mb-6 overflow-hidden">
<div className="px-card-padding-spacious py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-subtle/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">{MONTH_NAMES[month - 1]} Physician Milestones</h2>
<p className="font-body-sm text-body-sm text-text-muted">Real doctor roster for the selected month, with locally-tracked greeting/gift workflow status.</p>
</div>
</div>
<div className="flex items-center gap-2.5">
<div className="relative">
<input className="h-9 w-64 pl-8 pr-3 rounded-lg bg-surface-card text-text-primary placeholder:text-text-muted font-body-sm text-body-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Filter roster by doctor name, clinic, or rep..." type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
<span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">filter_list</span>
</div>
<button className="h-9 px-3 rounded-lg bg-surface-card hover:bg-surface-subtle text-text-secondary font-label-md text-label-md flex items-center gap-1.5 shadow-xs transition-colors" type="button" onClick={() => setDetail({ title: "Bulk Approve", body: `${needsApprovalCount} celebration${needsApprovalCount === 1 ? "" : "s"} currently need approval. Bulk-approving would move them all to Scheduled status.` })}>
<span className="material-symbols-outlined text-[17px]">batch_prediction</span>
<span className="">Bulk Approve ({needsApprovalCount})</span>
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
{loading && (
  <tr>
    <td colSpan={7} className="px-4 py-10 text-center text-text-muted font-body-sm text-body-sm">Loading doctor celebrations…</td>
  </tr>
)}
{!loading && pageRows.length === 0 && (
  <tr>
    <td colSpan={7} className="px-4 py-10 text-center text-text-muted font-body-sm text-body-sm">No celebrations match the current search/filters.</td>
  </tr>
)}
{!loading && pageRows.map((c) => {
  const typeIcon = c.celebrationType === "Birthday" ? "cake" : "domain_verification";
  return (
    <tr key={c.id} className="hover:bg-surface-subtle/50 transition-colors">
      <td className="pl-card-padding-spacious pr-3 py-3.5">
        <input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox"/>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-bold text-xs flex-shrink-0">{c.doctorName.replace(/^Dr\.?\s*/i, "").split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("")}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-text-primary truncate">{c.doctorName}</span>
              <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${c.tier === "Tier A+" ? "bg-brand-primary-subtle text-primary" : "bg-surface-container text-text-secondary font-semibold"}`}>{c.tier}</span>
            </div>
            <span className="font-body-sm text-body-sm text-text-secondary block">{c.specialtyClinic}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">{typeIcon}</span>
          </div>
          <div>
            <span className="font-label-md text-label-md text-text-primary block">{c.celebrationLabel}</span>
            <span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">event</span> {c.dateLabel}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center font-bold text-[11px]">{c.repInitials}</div>
          <div>
            <span className="font-label-md text-label-md text-text-primary block">{c.repName}</span>
            <span className="font-body-sm text-body-sm text-text-muted">{c.territory}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 w-fit ${statusPillClass[c.workflowStatus]}`}>
          {c.workflowStatus}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">military_tech</span>
          <div>
            <span className="font-label-md text-label-md text-text-primary block truncate max-w-[220px]">{c.gift}</span>
            <span className="font-body-sm text-body-sm text-text-muted">{c.giftNote}</span>
          </div>
        </div>
      </td>
      <td className="pr-card-padding-spacious pl-4 py-3.5 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button" onClick={() => setDetail({ title: `${c.doctorName} — Greeting Card`, body: `${c.celebrationLabel} on ${c.dateLabel}. Gift: ${c.gift} (${c.giftNote}). Current workflow status: ${c.workflowStatus}.` })}>
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            <span className="">Card</span>
          </button>
          {c.workflowStatus === "Needs Approval" && (
            <button className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-brand-primary-hover text-on-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button" onClick={() => approveCelebration(c.id)}>
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span className="">Approve</span>
            </button>
          )}
          {c.workflowStatus === "Dispatched" && (
            <button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-status-info font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button" onClick={() => setDetail({ title: `Track Dispatch — ${c.doctorName}`, body: `${c.gift} dispatched to ${c.territory}, assigned to ${c.repName}. Courier tracking reference is available via the logistics partner portal.` })}>
              <span className="material-symbols-outlined text-[15px]">share_location</span>
              <span className="">Track</span>
            </button>
          )}
          {(c.workflowStatus === "Scheduled" || c.workflowStatus === "Dispatch In Prep") && (
            <button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-primary font-label-md text-label-md flex items-center gap-1 transition-colors" type="button" onClick={() => setDetail({ title: `Notify MR — ${c.repName}`, body: `${c.repName} would be notified about ${c.doctorName}'s ${c.celebrationLabel.toLowerCase()} on ${c.dateLabel} in ${c.territory}.` })}>
              <span className="material-symbols-outlined text-[15px]">notifications</span>
              <span className="">Notify MR</span>
            </button>
          )}
          {c.workflowStatus === "Delivered" && (
            <button className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button" onClick={() => setDetail({ title: `Log Details — ${c.doctorName}`, body: `${c.celebrationLabel} delivered and logged. Gift: ${c.gift}. Field rep: ${c.repName} (${c.territory}).` })}>
              <span className="material-symbols-outlined text-[15px]">history</span>
              <span className="">Log Details</span>
            </button>
          )}
          <button className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="More" type="button" onClick={() => setDetail({ title: `${c.doctorName} — More`, body: `Celebration: ${c.celebrationLabel} (${c.dateLabel}). Status: ${c.workflowStatus}. Assigned rep: ${c.repName}.` })}>
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>
        </div>
      </td>
    </tr>
  );
})}
</tbody>
</table>
</div>
{/* Table Pagination & Footer Status */}
<div className="px-card-padding-spacious py-3.5 bg-surface-card flex flex-col sm:flex-row items-center justify-between gap-3 text-text-secondary font-body-sm text-body-sm">
<div className="flex items-center gap-2">
<span className="">{filtered.length === 0 ? "No matching celebrations" : `Displaying rows ${(safePage - 1) * PAGE_SIZE + 1} - ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} events`}</span>
<span className="w-1 h-1 rounded-full bg-text-muted"></span>
<span className="text-primary font-label-sm text-label-sm">{needsApprovalCount} events require manager clearance</span>
</div>
<div className="flex items-center gap-1.5">
<button className="w-8 h-8 rounded-lg bg-surface-subtle text-text-muted flex items-center justify-center disabled:cursor-not-allowed" disabled={safePage <= 1} type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} className={n === safePage ? "w-8 h-8 rounded-lg bg-[#b43403] text-white font-label-sm text-label-sm flex items-center justify-center font-semibold shadow-xs" : "w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-secondary font-label-sm text-label-sm flex items-center justify-center"} type="button" onClick={() => setPage(n)}>{n}</button>
))}
<button className="w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Right: Automated Greeting Channel Configuration */}
<div className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between mb-2">
<div>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2.5">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Greeting Channel Automation</h3>
</div>
<span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm font-bold">{Object.values(toggles).filter(Boolean).length} Active Flows</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-4">
      Centralized CRM triggers coordinating headquarters digital communications and field rep notifications. These toggles are admin preferences kept in this browser session — there is no automation-rules backend yet.
    </p>
{/* Automation Controls List */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={toggles.whatsapp} className="sr-only peer" type="checkbox" onChange={(e) => setToggles((s) => ({ ...s, whatsapp: e.target.checked }))}/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={toggles.sms} className="sr-only peer" type="checkbox" onChange={(e) => setToggles((s) => ({ ...s, sms: e.target.checked }))}/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={toggles.repReminder} className="sr-only peer" type="checkbox" onChange={(e) => setToggles((s) => ({ ...s, repReminder: e.target.checked }))}/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={toggles.managerEscalation} className="sr-only peer" type="checkbox" onChange={(e) => setToggles((s) => ({ ...s, managerEscalation: e.target.checked }))}/>
<div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-text-muted">Roster refreshed from backend on load</span>
<button className="h-8 px-3 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" onClick={() => setDetail({ title: "Edit Gateway Rules", body: "Gateway rules govern which channel (WhatsApp, SMS, or MR hand-off) is used first and when to fall back. There is no gateway-rules collection yet, so this is a read-only preview." })}>
<span className="material-symbols-outlined text-[16px]">tune</span>
<span className="">Edit Gateway Rules</span>
</button>
</div>
</div>

</div>

      {/* Schedule Custom Greeting / Gift Dispatch modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSchedule(false)}>
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-sm text-headline-sm text-text-primary text-lg">Schedule Custom Greeting / Gift Dispatch</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Doctor name *" value={newCelebration.doctorName} onChange={(e) => setNewCelebration((s) => ({ ...s, doctorName: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Celebration (e.g. 50th Birthday) *" value={newCelebration.celebrationLabel} onChange={(e) => setNewCelebration((s) => ({ ...s, celebrationLabel: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Date (e.g. 25 Sep 2026)" value={newCelebration.dateLabel} onChange={(e) => setNewCelebration((s) => ({ ...s, dateLabel: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Territory" value={newCelebration.territory} onChange={(e) => setNewCelebration((s) => ({ ...s, territory: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Assigned field rep" value={newCelebration.repName} onChange={(e) => setNewCelebration((s) => ({ ...s, repName: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Gift / gesture" value={newCelebration.gift} onChange={(e) => setNewCelebration((s) => ({ ...s, gift: e.target.value }))} />
            </div>
            <p className="text-[11px] text-text-muted">Saved to this table for the current session. There is no celebrations/greeting-workflow database collection yet, so this does not persist after a page reload.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowSchedule(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a3412] disabled:opacity-50" disabled={!newCelebration.doctorName.trim() || !newCelebration.celebrationLabel.trim()} onClick={handleSchedule}>Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail popup */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-sm text-headline-sm text-text-primary text-base">{detail.title}</h3>
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
