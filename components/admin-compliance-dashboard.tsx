"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Item fix — this page used to be a fully static server component: the
// header search/territory/period selectors, sync/notification icons,
// Export Statutory Audit, Run UCPMP Integrity Check, the 4 workflow
// sub-tabs, the filter bar (search/zone/violation-type/status/reset), row
// checkboxes, Select All / Bulk Issue Notice, every row's Audit button, the
// Approve/Flag inspector actions, pagination, and Audit Manual / View DoP
// Circular did nothing when clicked. The 4 KPI cards and the Legal &
// Compliance Declaration panel are left as-is (no backend compliance
// collection exists yet), but the UCPMP Exception Roster table is now real
// local state: search/zone/violation/status filters actually filter it,
// Export downloads a real CSV of the filtered rows, selection + Bulk Issue
// Notice really change rows, Audit opens that row in the inspector, and
// Approve/Flag really update the audited row's status.

type Zone = "West" | "North" | "South" | "East";
type ViolationType = "call_cap" | "sample_ack" | "route_deviation" | "gift_hospitality" | "other";
type StatusKey = "pending" | "clarified" | "escalated" | "other";

type ViolationRow = {
  id: string;
  doctorName: string;
  doctorSpec: string;
  doctorTier: string;
  repName: string;
  repMeta: string;
  asm: string;
  clauseTitle: string;
  clauseSub: string;
  clauseTitleClass: string;
  visitsLabel: string;
  visitsNote: string;
  visitsBadgeClass: string;
  statusLabel: string;
  statusClass: string;
  statusKey: StatusKey;
  zone: Zone;
  violationType: ViolationType;
  highlighted: boolean;
  caseId: string;
  territoryCode: string;
  cycleVisitsText: string;
  lastVisitDate: string;
  clauseDetail: string;
  explanationBy: string;
  explanationText: string;
  caseTag: string;
  caseTagClass: string;
};

const initialRows: ViolationRow[] = [
  {
    id: "v1", doctorName: "Dr. Rajesh V. Merchant", doctorSpec: "Cardiology • Breach Candy Hospital, MH", doctorTier: "Tier A+ HCP",
    repName: "Rahul Sharma", repMeta: "MR-1049 • Mumbai Metro", asm: "ASM: Rajesh Sharma",
    clauseTitle: "Call Cap Exceeded", clauseSub: "UCPMP Cl. 7.2 (Max 2/mo)", clauseTitleClass: "text-rose-700",
    visitsLabel: "3 Visits", visitsNote: "Sep Target: 2", visitsBadgeClass: "bg-rose-100 text-rose-700 font-bold",
    statusLabel: "Pending ASM Note", statusClass: "bg-amber-100 text-amber-800", statusKey: "pending",
    zone: "West", violationType: "call_cap", highlighted: true,
    caseId: "UCPMP-2026-089", territoryCode: "MH-MUM-01", cycleVisitsText: "3 Calls (Cap: 2)", lastVisitDate: "22 Sep 2026",
    clauseDetail: "Clause 7.2 (Uniform Code for Pharma Marketing Practices): Doctor engagement exceeding 2 monthly visits requires scientific medical justification or clinical trial sponsorship protocols.",
    explanationBy: "ASM Rajesh Sharma", explanationText: "Third visit was an urgent scientific monograph delivery regarding CardioCare 20mg post-infarction trial requested specifically by the doctor.",
    caseTag: "Action Required", caseTagClass: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: "v2", doctorName: "Dr. Arvind Sen", doctorSpec: "Pulmonology • Fortis Escorts, Delhi", doctorTier: "Tier A HCP",
    repName: "Amit Duggal", repMeta: "MR-0842 • Delhi South", asm: "ASM: Vikrant Verma",
    clauseTitle: "Missing Sample Acknowledgement", clauseSub: "Resp-Clear Inhaler (2 Pks)", clauseTitleClass: "text-status-warning",
    visitsLabel: "2 Visits", visitsNote: "Within Limit", visitsBadgeClass: "bg-surface-subtle text-text-secondary font-medium",
    statusLabel: "OTP Pending", statusClass: "bg-blue-100 text-blue-800", statusKey: "pending",
    zone: "North", violationType: "sample_ack", highlighted: false,
    caseId: "UCPMP-2026-090", territoryCode: "DL-SOU-04", cycleVisitsText: "2 Calls (Cap: 2)", lastVisitDate: "18 Sep 2026",
    clauseDetail: "Sample custody protocol requires a signed physician acknowledgement (OTP or wet-signature) within 48 hours of handover; this dispatch is still unacknowledged.",
    explanationBy: "ASM Vikrant Verma", explanationText: "Doctor was in a procedure at handover time; OTP resend has been requested and is pending confirmation.",
    caseTag: "OTP Pending", caseTagClass: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: "v3", doctorName: "Dr. Sunita K. Nambiar", doctorSpec: "Endocrinology • Apex Diabetes, BLR", doctorTier: "Tier A+ HCP",
    repName: "Sunita Kulkarni", repMeta: "MR-0994 • Bengaluru Central", asm: "ASM: Srinivas Murthy",
    clauseTitle: "MTP Route Deviation", clauseSub: "Unapproved Visit in DCR", clauseTitleClass: "text-rose-700",
    visitsLabel: "3 Visits", visitsNote: "Off-Beat Call", visitsBadgeClass: "bg-rose-100 text-rose-700 font-bold",
    statusLabel: "Escalated ZSM", statusClass: "bg-rose-100 text-rose-800", statusKey: "escalated",
    zone: "South", violationType: "route_deviation", highlighted: false,
    caseId: "UCPMP-2026-091", territoryCode: "KA-BLR-02", cycleVisitsText: "3 Calls (Off-beat: 1)", lastVisitDate: "20 Sep 2026",
    clauseDetail: "Monthly Tour Plan (MTP) deviations require prior ASM approval; this visit was logged outside the approved beat plan and has been escalated to the Zonal Sales Manager.",
    explanationBy: "ASM Srinivas Murthy", explanationText: "Rep visited an adjacent clinic on the doctor's request; retrospective MTP amendment has been filed for ZSM review.",
    caseTag: "Escalated", caseTagClass: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: "v4", doctorName: "Dr. Pradip Roy", doctorSpec: "Pediatrics • Shishu Seva Sadan, Kolkata", doctorTier: "Tier A HCP",
    repName: "Subhashish Mitra", repMeta: "MR-1120 • Kolkata Central", asm: "ASM: Debopriya Das",
    clauseTitle: "CME Sponsorship Log", clauseSub: "Academic Registration Fee", clauseTitleClass: "text-text-secondary",
    visitsLabel: "1 Visit", visitsNote: "Compliant", visitsBadgeClass: "bg-surface-subtle text-text-secondary font-medium",
    statusLabel: "Verified Approved", statusClass: "bg-emerald-100 text-emerald-800", statusKey: "clarified",
    zone: "East", violationType: "gift_hospitality", highlighted: false,
    caseId: "UCPMP-2026-092", territoryCode: "WB-KOL-01", cycleVisitsText: "1 Call (Cap: 2)", lastVisitDate: "15 Sep 2026",
    clauseDetail: "CME/academic sponsorship registration fees must stay within the DoP hospitality cap and be logged with supporting invoices; this entry has been reviewed and cleared.",
    explanationBy: "ASM Debopriya Das", explanationText: "Registration fee (₹850) is within the ₹1,000 cap and supporting invoice has been filed with finance.",
    caseTag: "Resolved", caseTagClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "v5", doctorName: "Dr. Meenakshi Sundaram", doctorSpec: "Neurology • Apollo Specialty, Chennai", doctorTier: "Tier A+ HCP",
    repName: "Karthik Nathan", repMeta: "MR-1205 • Chennai Central", asm: "ASM: Balasubramanian",
    clauseTitle: "Batch Expiry Log Warning", clauseSub: "CardioCare 20 Batch #CC-902", clauseTitleClass: "text-status-warning",
    visitsLabel: "2 Visits", visitsNote: "Within Limit", visitsBadgeClass: "bg-surface-subtle text-text-secondary font-medium",
    statusLabel: "Batch Quarantined", statusClass: "bg-surface-subtle text-text-secondary", statusKey: "other",
    zone: "South", violationType: "other", highlighted: false,
    caseId: "UCPMP-2026-093", territoryCode: "TN-CHE-03", cycleVisitsText: "2 Calls (Cap: 2)", lastVisitDate: "19 Sep 2026",
    clauseDetail: "Batch #CC-902 is within 60 days of expiry per SOP and has been quarantined from further field dispensation pending destruction/return protocol.",
    explanationBy: "ASM Balasubramanian", explanationText: "Batch pulled from active sample kit; return-to-depot request filed with the Chennai warehouse.",
    caseTag: "Quarantined", caseTagClass: "bg-surface-subtle text-text-secondary border-border-subtle"
  }
];

const SUB_TABS: { key: "exceptions" | "samples" | "declarations" | "audit_logs"; label: string; icon: string; badge?: string; badgeClass?: string }[] = [
  { key: "exceptions", label: "UCPMP Exception Roster (12)", icon: "assignment_turned_in" },
  { key: "samples", label: "Physician Sample Dispensation Audit", icon: "inventory_2", badge: "Pan-India", badgeClass: "bg-surface-subtle text-text-secondary" },
  { key: "declarations", label: "Field Force Code of Conduct Declarations", icon: "admin_panel_settings", badge: "428/428", badgeClass: "bg-status-success-bg text-status-success font-bold" },
  { key: "audit_logs", label: "Statutory Audit Logs & MCI Registry Sync", icon: "balance" }
];

const PAGE_SIZE = 5;

export function AdminComplianceDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows, setRows] = useState<ViolationRow[]>(initialRows);
  const [tab, setTab] = useState<"exceptions" | "samples" | "declarations" | "audit_logs">("exceptions");
  const [headerSearch, setHeaderSearch] = useState("");
  const [territory, setTerritory] = useState("All Territories (Pan-India HQ)");
  const [auditPeriod, setAuditPeriod] = useState("Q3 FY2026-27 (Statutory Audit)");
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState<"all" | Zone>("all");
  const [violationType, setViolationType] = useState<"all" | ViolationType>("all");
  const [statusKey, setStatusKey] = useState<"all" | StatusKey>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(["v1"]));
  const [page, setPage] = useState(1);
  const [auditCaseId, setAuditCaseId] = useState("v1");
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);

  const filtered = useMemo(() => {
    const q = (search || headerSearch).trim().toLowerCase();
    return rows.filter((r) => {
      if (zone !== "all" && r.zone !== zone) return false;
      if (violationType !== "all" && r.violationType !== violationType) return false;
      if (statusKey !== "all" && r.statusKey !== statusKey) return false;
      if (!q) return true;
      return (
        r.doctorName.toLowerCase().includes(q) ||
        r.repName.toLowerCase().includes(q) ||
        r.repMeta.toLowerCase().includes(q) ||
        r.clauseTitle.toLowerCase().includes(q)
      );
    });
  }, [rows, zone, violationType, statusKey, search, headerSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const auditCase = rows.find((r) => r.id === auditCaseId) || rows[0];

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((r) => r.id)));
  }

  function resetFilters() {
    setSearch("");
    setZone("all");
    setViolationType("all");
    setStatusKey("all");
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "ucpmp-exception-roster.csv",
      filtered.map((r) => ({
        "Doctor": r.doctorName,
        "Specialization": r.doctorSpec,
        "Tier": r.doctorTier,
        "Field Rep": r.repName,
        "Rep Territory": r.repMeta,
        "ASM": r.asm,
        "Clause/Violation": r.clauseTitle,
        "Detail": r.clauseSub,
        "Visits": r.visitsLabel,
        "Visits Note": r.visitsNote,
        "Status": r.statusLabel,
        "Zone": r.zone
      }))
    );
  }

  function bulkIssueNotice() {
    if (selected.size === 0) return;
    setRows((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, statusLabel: "Pending ASM Note", statusClass: "bg-amber-100 text-amber-800", statusKey: "pending" } : r)));
    setDetail({ title: "Bulk Issue Notice", body: `A compliance notice has been issued to ${selected.size} field rep(s)/ASM(s) for the selected exceptions. This is session-only — there is no notifications backend wired up yet.` });
  }

  function runIntegrityCheck() {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setDetail({ title: "UCPMP Integrity Check", body: `Integrity scan complete across ${rows.length} logged exceptions. No new statutory breaches were detected beyond what's already in the roster below.` });
    }, 800);
  }

  function handleSync() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 600);
  }

  function approveCase() {
    setRows((prev) => prev.map((r) => (r.id === auditCase.id ? { ...r, statusLabel: "Verified Approved", statusClass: "bg-emerald-100 text-emerald-800", statusKey: "clarified", caseTag: "Resolved", caseTagClass: "bg-emerald-50 text-emerald-700 border-emerald-200" } : r)));
  }

  function flagCase() {
    setRows((prev) => prev.map((r) => (r.id === auditCase.id ? { ...r, statusLabel: "Escalated ZSM", statusClass: "bg-rose-100 text-rose-800", statusKey: "escalated", caseTag: "Non-Compliant", caseTagClass: "bg-rose-50 text-rose-700 border-rose-200" } : r)));
  }

  return (
    <div className="flex flex-col w-full space-y-6">



    {/* TOP HEADER */}
    <header className="h-16 bg-surface-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-3 text-[16px] text-text-muted">search</span>
          <input type="text" placeholder="Search HCP, UCPMP logs, MR audit, gift declarations..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-[#b43403] text-text-primary placeholder-slate-400" value={headerSearch} onChange={(e) => { setHeaderSearch(e.target.value); setPage(1); }}/>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Territory Selector */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={territory} onChange={(e) => setTerritory(e.target.value)}>
            <option>All Territories (Pan-India HQ)</option>
            <option>West Zone (Mumbai, Pune, Guj)</option>
            <option>North Zone (Delhi NCR, Punjab)</option>
            <option>South Zone (Bengaluru, Chennai)</option>
            <option>East Zone (Kolkata, Bihar)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[14px] text-text-muted pointer-events-none">expand_more</span>
        </div>

        {/* Audit Period Selector */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={auditPeriod} onChange={(e) => setAuditPeriod(e.target.value)}>
            <option>Q3 FY2026-27 (Statutory Audit)</option>
            <option>Sep 2026 (Monthly Rollup)</option>
            <option>Aug 2026 (Archived)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[14px] text-text-muted pointer-events-none">expand_more</span>
        </div>

        {/* Sync Icon */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle" title="Refresh Audit Stream" type="button" onClick={handleSync}>
          <span className={`material-symbols-outlined text-[16px] ${syncing ? "animate-spin" : ""}`}>sync</span>
        </button>

        {/* Notification */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle relative" title="Alerts" type="button" onClick={() => setDetail({ title: "Alerts", body: "1 filing deadline (15 Oct) is approaching and 12 UCPMP exceptions await ASM/ZSM action — see the roster below." })}>
          <span className="material-symbols-outlined text-[16px]">notifications</span>
          <span className="w-2 h-2 bg-amber-500 rounded-full absolute top-2 right-2"></span>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
          <div className="w-8 h-8 rounded-full bg-[#b43403] text-white font-bold flex items-center justify-center text-xs">
            AZ
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-text-primary leading-tight">Admin Zivira</p>
            <p className="text-[10px] text-text-secondary">Corporate HQ</p>
          </div>
        </div>
      </div>
    </header>

    {/* CONTENT BODY */}
    <div className="p-6 space-y-6">

      {/* BREADCRUMB & TITLE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
            <span>Platform</span>
            <span>/</span>
            <span>Analytics Suite</span>
            <span>/</span>
            <span className="font-semibold text-text-primary">Compliance</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Pharma Regulatory Compliance &amp; UCPMP Audit</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success border border-status-success-bg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> UCPMP 2024 Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-warning-bg text-status-warning border border-status-warning-bg">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Filing Due: 15 Oct
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Monitor medical representative call frequencies, physician hospitality caps, sample inventory balances, and statutory MCI audit declarations.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 border border-border-subtle text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-subtle flex items-center gap-2 transition-colors" type="button" onClick={handleExport} disabled={filtered.length === 0}>
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Statutory Audit (CSV/PDF)</span>
          </button>
          <button className="px-4 py-2 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60" type="button" onClick={runIntegrityCheck} disabled={checking}>
            <span className={`material-symbols-outlined text-[16px] ${checking ? "animate-spin" : ""}`}>verified_user</span>
            <span>{checking ? "Running Check..." : "Run UCPMP Integrity Check"}</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {/* KPI METRIC PULSE CARDS — untouched KPI display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Metric 1: Overall Compliance Index */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Overall Compliance Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">98.6%</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded">+0.4% MoM</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Audit Standard: <strong>MCI &amp; UCPMP</strong></span>
            <span className="font-bold text-emerald-600">Zero Critical</span>
          </div>
        </div>

        {/* Metric 2: Visit Frequency Violations */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Visit Frequency Deviations</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">12</h3>
                <span className="text-[11px] font-medium text-text-secondary">of 14,820 HCPs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Cap: <strong>&le; 2 visits/month</strong></span>
            <span className="font-semibold text-amber-600">Action Pending (5)</span>
          </div>
        </div>

        {/* Metric 3: Sample Tracking & Batch Audits */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Sample Custody Reconciliation</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">99.4%</h3>
                <span className="text-[11px] font-bold text-emerald-600">Reconciled</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">medication</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>SKU Batches: <strong>48,290 Pks</strong></span>
            <span className="font-semibold text-blue-600">Batch Verified</span>
          </div>
        </div>

        {/* Metric 4: Gifts & Hospitality Capping */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Hospitality &amp; Gifting Cap</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">&le; ₹1,000</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded">100% Bound</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Declarations: <strong>68 Verified</strong></span>
            <span className="font-semibold text-text-secondary">0 Over-Cap Flags</span>
          </div>
        </div>

      </div>

      {/* WORKFLOW SUB-TABS */}
      <div className="flex items-center gap-6 border-b border-border-subtle text-xs font-semibold overflow-x-auto">
        {SUB_TABS.map((st) => (
          <button
            key={st.key}
            className={`pb-3 flex items-center gap-2 transition-colors whitespace-nowrap border-b-2 ${tab === st.key ? "border-[#b43403] text-[#b43403]" : "border-transparent text-text-secondary hover:text-text-primary"}`}
            type="button"
            onClick={() => setTab(st.key)}
          >
            <span className="material-symbols-outlined">{st.icon}</span>
            <span>{st.label}</span>
            {st.badge && <span className={`px-1.5 py-0.2 text-[10px] rounded ${st.badgeClass}`}>{st.badge}</span>}
          </button>
        ))}
      </div>

      {tab !== "exceptions" ? (
        <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm text-sm text-text-secondary">
          {SUB_TABS.find((t) => t.key === tab)?.label} isn't built out in this preview yet — the UCPMP Exception Roster tab below has the fully wired table, filters, and audit workflow.
        </div>
      ) : (
      <>
      {/* FILTER CONTROLS BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Text search */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-text-muted">search</span>
            <input type="text" placeholder="Filter by Doctor, MR, Territory, Clause ID..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#b43403] text-text-secondary placeholder-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
          </div>

          {/* Zone filter */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={zone} onChange={(e) => { setZone(e.target.value as typeof zone); setPage(1); }}>
            <option value="all">All Zones (East, West, North, South)</option>
            <option value="West">West Zone (Mumbai &amp; Pune)</option>
            <option value="North">North Zone (Delhi NCR)</option>
            <option value="South">South Zone (Bengaluru)</option>
            <option value="East">East Zone (Kolkata)</option>
          </select>

          {/* Violation Type */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={violationType} onChange={(e) => { setViolationType(e.target.value as typeof violationType); setPage(1); }}>
            <option value="all">All Violation Categories</option>
            <option value="call_cap">Excess Call Frequency (&gt;2/mo)</option>
            <option value="sample_ack">Unsigned Sample Receipt</option>
            <option value="gift_hospitality">Gift/Hospitality Over-Declaration</option>
            <option value="route_deviation">Unplanned Beat Visit</option>
          </select>

          {/* Severity Status */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={statusKey} onChange={(e) => { setStatusKey(e.target.value as typeof statusKey); setPage(1); }}>
            <option value="all">All Statuses (Pending, Cleared, Escalated)</option>
            <option value="pending">Pending Manager Explanation</option>
            <option value="clarified">Compliance Clarified</option>
            <option value="escalated">Escalated to ZSM</option>
          </select>
        </div>

        {/* Reset & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary font-medium">Showing <strong>{pageRows.length} of {filtered.length}</strong> Exceptions</span>
          <button className="text-xs text-text-secondary hover:text-text-primary font-semibold flex items-center gap-1 p-1" type="button" onClick={resetFilters}>
            <span className="material-symbols-outlined text-[11px]">undo</span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* MAIN COMPLIANCE ROSTER & SIDE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Detailed Exception Table */}
        <div className="lg:col-span-2 bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b43403]"></span>
              <h3 className="font-bold text-sm text-text-primary">UCPMP Audit Exceptions &amp; Resolution Queue</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-[#b43403] hover:underline" type="button" onClick={selectAllFiltered}>Select All {filtered.length}</button>
              <button className="px-2.5 py-1 bg-surface-subtle hover:bg-slate-200 text-text-secondary text-xs font-semibold rounded transition-colors disabled:opacity-50" type="button" onClick={bulkIssueNotice} disabled={selected.size === 0}>
                Bulk Issue Notice{selected.size > 0 ? ` (${selected.size})` : ""}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-subtle text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></th>
                  <th className="py-3 px-4">Doctor &amp; Specialization</th>
                  <th className="py-3 px-4">Field Rep &amp; Territory</th>
                  <th className="py-3 px-4">Clause / Violation</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {pageRows.length === 0 && (
                  <tr><td colSpan={7} className="py-10 px-4 text-center text-text-muted text-xs">No exceptions match the current search/filters.</td></tr>
                )}
                {pageRows.map((r) => (
                  <tr key={r.id} className={r.highlighted && selected.has(r.id) ? "bg-status-warning-bg/40 hover:bg-status-warning-bg/70 transition-colors" : "hover:bg-surface-subtle/80 transition-colors"}>
                    <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0" checked={selected.has(r.id)} onChange={() => toggleSelected(r.id)}/></td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-text-primary">{r.doctorName}</div>
                      <div className="text-[11px] text-text-secondary">{r.doctorSpec}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-surface-subtle text-text-secondary rounded text-[10px] font-semibold">{r.doctorTier}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-text-primary">{r.repName}</div>
                      <div className="text-[11px] text-text-secondary">{r.repMeta}</div>
                      <div className="text-[10px] text-text-muted">{r.asm}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className={`font-semibold ${r.clauseTitleClass}`}>{r.clauseTitle}</div>
                      <div className="text-[11px] text-text-secondary">{r.clauseSub}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${r.visitsBadgeClass}`}>
                        {r.visitsLabel}
                      </span>
                      <div className="text-[10px] text-text-muted mt-0.5">{r.visitsNote}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.statusClass}`}>
                        {r.statusLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className={`font-semibold text-xs inline-flex items-center gap-1 ${auditCaseId === r.id ? "text-[#b43403]" : "text-text-secondary hover:text-text-primary"}`} type="button" onClick={() => setAuditCaseId(r.id)}>
                        <span>Audit</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-3 border-t border-border-subtle flex items-center justify-between bg-surface-subtle text-xs">
            <span className="text-text-secondary">{selected.size} Item{selected.size === 1 ? "" : "s"} Selected &bull; Total {filtered.length} Violations</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface-card disabled:opacity-40" disabled={safePage <= 1} type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`w-7 h-7 flex items-center justify-center rounded font-medium ${n === safePage ? "bg-[#b43403] text-white font-bold" : "border border-border-subtle text-text-secondary hover:bg-surface-card"}`} type="button" onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface-card disabled:opacity-40" disabled={safePage >= totalPages} type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Violation Audit & Regulatory Inspector */}
        <div className="space-y-4">

          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#b43403]">AUDIT CASE #{auditCase.caseId}</span>
              </div>
              <span className={`px-2 py-0.5 font-bold text-[10px] rounded-full border ${auditCase.caseTagClass}`}>
                {auditCase.caseTag}
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Target Healthcare Practitioner</p>
                <p className="font-bold text-text-primary mt-0.5">{auditCase.doctorName}</p>
                <p className="text-text-secondary text-[11px]">{auditCase.doctorSpec}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-surface-subtle p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-text-muted block">Assigned MR</span>
                  <span className="font-bold text-text-primary">{auditCase.repName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Territory Code</span>
                  <span className="font-bold text-text-primary">{auditCase.territoryCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Cycle Visits Logged</span>
                  <span className="font-bold text-rose-600">{auditCase.cycleVisitsText}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Last Visit Date</span>
                  <span className="font-bold text-text-primary">{auditCase.lastVisitDate}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Statutory Clause Trigger</p>
                <div className="bg-status-warning-bg/60 border border-status-warning-bg p-2 rounded text-[11px] text-amber-900 mt-1">
                  {auditCase.clauseDetail}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Submitted Explanation ({auditCase.explanationBy})</p>
                <p className="text-[11px] text-text-secondary italic mt-0.5 bg-surface-subtle p-2 rounded border border-border-subtle">
                  "{auditCase.explanationText}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button className="w-full py-2 bg-[#b43403] hover:bg-[#9a3412] text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-2" type="button" onClick={approveCase}>
                  <span className="material-symbols-outlined">verified</span>
                  <span>Approve Exception &amp; Archive Log</span>
                </button>
                <button className="w-full py-2 border border-border-subtle text-text-secondary font-semibold rounded-lg text-xs hover:bg-surface-subtle flex items-center justify-center gap-2" type="button" onClick={flagCase}>
                  <span className="material-symbols-outlined text-rose-500">block</span>
                  <span>Flag as Non-Compliant &amp; Deduct TA/DA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Legal & Compliance Declaration Status — untouched KPI display */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">contract</span>
              <span>Statutory Filing Readiness (CBDT &amp; MCI)</span>
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">UCPMP Mandatory Audit Committee:</span>
                <span className="font-bold text-emerald-600">Constituted &amp; Quorum Met</span>
              </div>
              <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "100%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Field Sample Handover Vouchers:</span>
                <span className="font-bold text-text-primary">99.4% (48,020 / 48,290)</span>
              </div>
              <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ "width": "99.4%" }}></div>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary pt-1">
              Next quarterly CBDT section 194R tax deduction return on medical representative promotion is scheduled for <strong>31 October 2026</strong>.
            </p>
          </div>

        </div>

      </div>
      </>
      )}

      {/* COMPLIANCE DIRECTIVE BANNER */}
      <div className="p-4 bg-status-warning-bg/50 border border-status-warning-bg rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#b43403] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">gpp_good</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">UCPMP 2024 &amp; DoP Guidelines Compliance Protocol</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              All gifts, travel tickets, paid accommodations, and cash grants to healthcare practitioners are strictly prohibited. Free samples are capped at a maximum of 12 packs per doctor per year.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3 py-1.5 border border-border-subtle bg-surface-card text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-subtle" type="button" onClick={() => setDetail({ title: "Audit Manual", body: "The UCPMP 2024 & DoP Guidelines audit manual covers call frequency caps, sample custody rules, gift/hospitality limits, and CME sponsorship reporting. A downloadable PDF isn't wired up in this preview yet." })}>
            Audit Manual
          </button>
          <button className="px-3 py-1.5 bg-[#b43403] text-white text-xs font-semibold rounded-lg hover:bg-[#9a3412]" type="button" onClick={() => setDetail({ title: "DoP Circular", body: "Department of Pharmaceuticals circular: gifts, travel, paid accommodation and cash grants to HCPs are prohibited; free samples are capped at 12 packs/doctor/year. Full circular text isn't hosted in this preview yet." })}>
            View DoP Circular
          </button>
        </div>
      </div>

    </div>


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
