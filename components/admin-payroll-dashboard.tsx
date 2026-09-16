"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// This page used to be a fully static server component: every number was
// hand-typed JSX and none of its buttons/selects/inputs had a real
// onClick/onChange handler. The KPI cards at the top are left as-is (no
// backend collection exists yet for payroll metrics), but the salary
// roster table is now real local state: both search boxes, the
// zone/designation/status filters and Reset actually filter it, row
// checkboxes and Select All drive real selection state, Payslip/Audit
// buttons load that employee's real breakdown into the right-hand
// inspector, Export Bank NEFT Batch downloads exactly what's on screen as
// CSV, and Run Final Payroll Lock & Disburse / Bulk Approve / Approve &
// Send to Bank actually change each row's status (session-only).

type Employee = {
  id: string;
  name: string;
  empCode: string;
  hq: string;
  grade: string;
  zone: "West Zone" | "North Zone" | "South Zone" | "East Zone";
  designation: "Medical Representative (MR)" | "Senior Executive (SR MR)" | "Area Sales Manager (ASM)";
  workDaysNote: string;
  workDaysNoteClass: string;
  workDaysSub: string;
  baseSalary: string;
  taDa: string;
  taDaNote: string;
  taDaClass: string;
  netPayout: string;
  netPayoutClass: string;
  status: "Approved" | "ASM Verified" | "Claim on Hold";
  statusClass: string;
  actionLabel: "Payslip" | "Audit";
  rowClass: string;
  breakdown: {
    basic: string; hra: string; special: string; grossFixed: string;
    daHq: string; daHqNote: string; daEx: string; daExNote: string;
    travel: string; travelNote: string; reimb: string;
    pf: string; pt: string; net: string;
    bankLast4: string; ifsc: string; bankName: string;
  };
};

const initialEmployees: Employee[] = [
  {
    id: "emp-1049", name: "Rahul Sharma", empCode: "EMP-1049", hq: "Mumbai Metro (HQ)", grade: "Senior MR",
    zone: "West Zone", designation: "Senior Executive (SR MR)",
    workDaysNote: "22 / 22 Days", workDaysNoteClass: "text-emerald-600", workDaysSub: "16 HQ • 6 Ex-Stn",
    baseSalary: "₹36,000", taDa: "₹14,850", taDaNote: "GPS: 1,420 km", taDaClass: "text-text-primary",
    netPayout: "₹50,850", netPayoutClass: "text-[#b43403]",
    status: "Approved", statusClass: "bg-emerald-100 text-emerald-800", actionLabel: "Payslip",
    rowClass: "bg-status-warning-bg/40 hover:bg-status-warning-bg/70",
    breakdown: {
      basic: "₹24,000", hra: "₹8,000", special: "₹4,000", grossFixed: "₹36,000",
      daHq: "₹4,000", daHqNote: "16 HQ Days @ ₹250", daEx: "₹2,700", daExNote: "6 Days @ ₹450",
      travel: "₹7,810", travelNote: "1,420 km @ ₹5.50/km", reimb: "₹340",
      pf: "₹2,160", pt: "₹200", net: "₹50,850",
      bankLast4: "8920", ifsc: "HDFC0000128", bankName: "HDFC Bank"
    }
  },
  {
    id: "emp-0842", name: "Amit Duggal", empCode: "EMP-0842", hq: "Delhi South", grade: "MR",
    zone: "North Zone", designation: "Medical Representative (MR)",
    workDaysNote: "21 / 22 Days", workDaysNoteClass: "text-text-secondary", workDaysSub: "14 HQ • 7 Outstation",
    baseSalary: "₹32,500", taDa: "₹18,200", taDaNote: "Night Halt: 2 Days", taDaClass: "text-text-primary",
    netPayout: "₹50,700", netPayoutClass: "text-text-primary",
    status: "ASM Verified", statusClass: "bg-blue-100 text-blue-800", actionLabel: "Payslip",
    rowClass: "hover:bg-surface-subtle/80",
    breakdown: {
      basic: "₹22,000", hra: "₹7,000", special: "₹3,500", grossFixed: "₹32,500",
      daHq: "₹3,500", daHqNote: "14 HQ Days @ ₹250", daEx: "₹3,150", daExNote: "7 Days @ ₹450",
      travel: "₹9,900", travelNote: "1,800 km @ ₹5.50/km", reimb: "₹1,650",
      pf: "₹1,950", pt: "₹200", net: "₹50,700",
      bankLast4: "3312", ifsc: "ICIC0001120", bankName: "ICICI Bank"
    }
  },
  {
    id: "emp-1120", name: "Subhashish Mitra", empCode: "EMP-1120", hq: "Kolkata Central", grade: "Executive MR",
    zone: "East Zone", designation: "Medical Representative (MR)",
    workDaysNote: "23 / 22 Days", workDaysNoteClass: "text-indigo-600", workDaysSub: "18 HQ • 5 Ex-Stn",
    baseSalary: "₹38,000", taDa: "₹16,400", taDaNote: "Fare: ₹8,200", taDaClass: "text-text-primary",
    netPayout: "₹54,400", netPayoutClass: "text-text-primary",
    status: "Approved", statusClass: "bg-emerald-100 text-emerald-800", actionLabel: "Payslip",
    rowClass: "hover:bg-surface-subtle/80",
    breakdown: {
      basic: "₹25,500", hra: "₹8,500", special: "₹4,000", grossFixed: "₹38,000",
      daHq: "₹4,500", daHqNote: "18 HQ Days @ ₹250", daEx: "₹2,250", daExNote: "5 Days @ ₹450",
      travel: "₹8,200", travelNote: "Fare reimbursement", reimb: "₹1,450",
      pf: "₹2,280", pt: "₹200", net: "₹54,400",
      bankLast4: "7741", ifsc: "SBIN0004455", bankName: "State Bank of India"
    }
  },
  {
    id: "emp-0994", name: "Sunita Kulkarni", empCode: "EMP-0994", hq: "Bengaluru Central", grade: "MR",
    zone: "South Zone", designation: "Medical Representative (MR)",
    workDaysNote: "20 / 22 Days", workDaysNoteClass: "text-amber-600", workDaysSub: "12 HQ • 8 Outstation",
    baseSalary: "₹31,000", taDa: "₹19,800", taDaNote: "Odometer Mismatch", taDaClass: "text-rose-600",
    netPayout: "₹50,800", netPayoutClass: "text-text-primary",
    status: "Claim on Hold", statusClass: "bg-rose-100 text-rose-800", actionLabel: "Audit",
    rowClass: "hover:bg-surface-subtle/80",
    breakdown: {
      basic: "₹20,500", hra: "₹6,800", special: "₹3,700", grossFixed: "₹31,000",
      daHq: "₹3,000", daHqNote: "12 HQ Days @ ₹250", daEx: "₹3,600", daExNote: "8 Days @ ₹450",
      travel: "₹12,100", travelNote: "Disputed odometer reading — under review", reimb: "₹1,100",
      pf: "₹1,860", pt: "₹200", net: "₹50,800",
      bankLast4: "5567", ifsc: "AXIS0000234", bankName: "Axis Bank"
    }
  },
  {
    id: "emp-1205", name: "Karthik Nathan", empCode: "EMP-1205", hq: "Chennai Central", grade: "MR",
    zone: "South Zone", designation: "Medical Representative (MR)",
    workDaysNote: "22 / 22 Days", workDaysNoteClass: "text-emerald-600", workDaysSub: "17 HQ • 5 Ex-Stn",
    baseSalary: "₹34,000", taDa: "₹15,200", taDaNote: "GPS: 1,380 km", taDaClass: "text-text-primary",
    netPayout: "₹49,200", netPayoutClass: "text-text-primary",
    status: "Approved", statusClass: "bg-emerald-100 text-emerald-800", actionLabel: "Payslip",
    rowClass: "hover:bg-surface-subtle/80",
    breakdown: {
      basic: "₹23,000", hra: "₹7,500", special: "₹3,500", grossFixed: "₹34,000",
      daHq: "₹4,250", daHqNote: "17 HQ Days @ ₹250", daEx: "₹2,250", daExNote: "5 Days @ ₹450",
      travel: "₹7,590", travelNote: "1,380 km @ ₹5.50/km", reimb: "₹1,110",
      pf: "₹2,040", pt: "₹200", net: "₹49,200",
      bankLast4: "9012", ifsc: "HDFC0000551", bankName: "HDFC Bank"
    }
  }
];

const PAGE_SIZE = 5;

export function AdminPayrollDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<"all" | Employee["zone"]>("all");
  const [designationFilter, setDesignationFilter] = useState<"all" | Employee["designation"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Employee["status"]>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["emp-1049"]));
  const [inspectedId, setInspectedId] = useState<string>("emp-1049");
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [division, setDivision] = useState("All Divisions (Pan-India HQ)");
  const [cycle, setCycle] = useState("September 2026 (Active Cycle)");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (zoneFilter !== "all" && e.zone !== zoneFilter) return false;
      if (designationFilter !== "all" && e.designation !== designationFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.empCode.toLowerCase().includes(q) ||
        e.hq.toLowerCase().includes(q) ||
        e.grade.toLowerCase().includes(q)
      );
    });
  }, [employees, search, zoneFilter, designationFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const inspected = employees.find((e) => e.id === inspectedId) ?? employees[0];

  function resetFilters() {
    setSearch("");
    setZoneFilter("all");
    setDesignationFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((e) => e.id)));
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "payroll-neft-batch.csv",
      filtered.map((e) => ({
        "Employee": e.name,
        "Emp Code": e.empCode,
        "HQ": e.hq,
        "Grade": e.grade,
        "Zone": e.zone,
        "Base Salary": e.baseSalary,
        "TA/DA Claimed": e.taDa,
        "Net Payout": e.netPayout,
        "Status": e.status,
        "Bank": e.breakdown.bankName,
        "Account (last 4)": e.breakdown.bankLast4,
        "IFSC": e.breakdown.ifsc
      }))
    );
  }

  function handleBulkApprove() {
    if (selectedIds.size === 0) return;
    setEmployees((prev) => prev.map((e) => (selectedIds.has(e.id) ? { ...e, status: "Approved", statusClass: "bg-emerald-100 text-emerald-800", actionLabel: "Payslip" } : e)));
    setDetail({ title: "Bulk Approve Complete", body: `${selectedIds.size} staff allowance claim(s) marked Approved for this session.` });
  }

  function handleApproveAndSend() {
    setEmployees((prev) => prev.map((e) => (e.id === inspected.id ? { ...e, status: "Approved", statusClass: "bg-emerald-100 text-emerald-800", actionLabel: "Payslip" } : e)));
    setDetail({ title: "Sent to Bank NEFT Batch", body: `${inspected.name}'s payslip (${inspected.netPayout}) has been marked Approved and queued for the NEFT batch this session.` });
  }

  function handleDownloadSlip() {
    downloadCsv(`payslip-${inspected.empCode}.csv`, [{
      "Employee": inspected.name, "Emp Code": inspected.empCode, "HQ": inspected.hq,
      "Basic": inspected.breakdown.basic, "HRA": inspected.breakdown.hra, "Special Allowance": inspected.breakdown.special,
      "Gross Fixed": inspected.breakdown.grossFixed, "DA (HQ)": inspected.breakdown.daHq, "DA (Ex-Station)": inspected.breakdown.daEx,
      "Travel Allowance": inspected.breakdown.travel, "Mobile/Stationery Reimb.": inspected.breakdown.reimb,
      "PF/ESIC": inspected.breakdown.pf, "Professional Tax": inspected.breakdown.pt, "Net Payable": inspected.breakdown.net
    }]);
  }

  function handleFinalLock() {
    setEmployees((prev) => prev.map((e) => (e.status !== "Claim on Hold" ? { ...e, status: "Approved", statusClass: "bg-emerald-100 text-emerald-800", actionLabel: "Payslip" } : e)));
    setShowLockConfirm(false);
    setDetail({ title: "Payroll Locked & Disbursed", body: "All non-disputed claims have been marked Approved and queued for disbursal this session. Claims on hold were left untouched pending audit resolution." });
  }

  return (
    <div className="flex flex-col w-full space-y-6">




    {/* TOP HEADER */}
    <header className="h-16 bg-surface-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-3 text-xs text-text-muted">{`search`}</span>
          <input type="text" placeholder="Search MR name, employee code, TA/DA claims, station bills..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-[#b43403] text-text-primary placeholder-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Territory Selector */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={division} onChange={(e) => setDivision(e.target.value)}>
            <option>All Divisions (Pan-India HQ)</option>
            <option>Cardio-Diabetic Division</option>
            <option>Respiratory Care Division</option>
            <option>Pediatric &amp; Ortho Division</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        {/* Payroll Month Picker */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={cycle} onChange={(e) => setCycle(e.target.value)}>
            <option>September 2026 (Active Cycle)</option>
            <option>August 2026 (Processed)</option>
            <option>July 2026 (Audited)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        {/* Refresh Button */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle" title="Sync Expense Ledgers" onClick={() => setDetail({ title: "Ledger Sync Triggered", body: "A sync of expense ledgers against DCR and GPS logs has been queued for this session. There is no live sync backend yet." })}>
          <span className="material-symbols-outlined text-xs">{`sync`}</span>
        </button>

        {/* Alerts */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle relative" title="Notifications" onClick={() => setDetail({ title: "Notifications", body: "14 audit claim deviations pending review (₹48,250 on hold). 11 claims pending ASM sign-off." })}>
          <span className="material-symbols-outlined text-xs">{`circle`}</span>
          <span className="w-2 h-2 bg-[#b43403] rounded-full absolute top-2 right-2"></span>
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
            <span className="font-semibold text-text-primary">Payroll &amp; Field Allowances</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Field Force Payroll, TA/DA &amp; Expense Engine</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-info-bg text-status-info border border-status-info-bg">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Cycle: Sep 2026
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success border border-status-success-bg">
              <span className="material-symbols-outlined text-[10px]">{`circle`}</span> Bank Cutoff: 01 Oct
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Reconcile daily DCR call allowances, HQ/Ex/Outstation travel fare meters, manager joint-work claims, and one-click salary disbursement.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 border border-border-subtle text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-subtle flex items-center gap-2 transition-colors" onClick={handleExport} disabled={filtered.length === 0}>
            <span className="material-symbols-outlined text-xs">{`circle`}</span>
            <span>Export Bank NEFT Batch</span>
          </button>
          <button className="px-4 py-2 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors" onClick={() => setShowLockConfirm(true)}>
            <span className="material-symbols-outlined text-xs">{`circle`}</span>
            <span>Run Final Payroll Lock &amp; Disburse</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {/* KPI METRIC PULSE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Metric 1: Total Net Payroll */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Field Gross Payout</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">₹1.84 Cr</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded">+4.2% MoM</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`account_balance_wallet`}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>428 Roster Reps: <strong>₹1.52 Cr Base</strong></span>
            <span className="font-bold text-text-secondary">₹32.4 L TA/DA</span>
          </div>
        </div>

        {/* Metric 2: Daily Allowance (TA/DA) Total */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Reconciled Travel (TA/DA)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">₹32,48,600</h3>
                <span className="text-[11px] font-medium text-text-secondary">GPS Verified</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`route`}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Total Beat KM: <strong>1,42,800 km</strong></span>
            <span className="font-semibold text-emerald-600">96.8% Validated</span>
          </div>
        </div>

        {/* Metric 3: Expense Discrepancies & Flags */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Audit Claim Deviations</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">14</h3>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">₹48,250 Hold</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`receipt`}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Disputed Kilometrage: <strong>8 Reps</strong></span>
            <span className="font-semibold text-amber-600">Under Review</span>
          </div>
        </div>

        {/* Metric 4: ASM / Manager Endorsements */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Manager Expense Sign-Off</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">97.4%</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded">417 / 428 Reps</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#b43403]/10 text-[#b43403] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`how_to_reg`}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Pending ASM Clearance: <strong>11 Claims</strong></span>
            <span className="font-semibold text-text-secondary">Auto-Pinged</span>
          </div>
        </div>

      </div>

      {/* PAYROLL SUB-TABS */}
      <div className="flex items-center gap-6 border-b border-border-subtle text-xs font-semibold">
        {["Field Staff Salary & Allowance Roll (428)", "Kilometre Fare & DA Tier Matrix", "Outstation Lodge & Boarding Ledger", "Statutory Tax & TDS Section 192/194R Declarations"].map((label, i) => (
          <button
            key={label}
            className={i === activeSubTab ? "pb-3 border-b-2 border-[#b43403] text-[#b43403] flex items-center gap-2" : "pb-3 text-text-secondary hover:text-text-primary border-b-2 border-transparent flex items-center gap-2 transition-colors"}
            onClick={() => {
              setActiveSubTab(i);
              if (i !== 0) setDetail({ title: label, body: "This roster view isn't built out yet — showing the Field Staff Salary & Allowance Roll below in the meantime." });
            }}
          >
            <span className="material-symbols-outlined">{`circle`}</span>
            <span>{label}</span>
            {i === 2 && <span className="px-1.5 py-0.2 text-[10px] bg-status-warning-bg text-status-warning rounded font-bold">14 Claims</span>}
            {i === 1 && <span className="px-1.5 py-0.2 text-[10px] bg-surface-subtle text-text-secondary rounded">Pan-India Rates</span>}
          </button>
        ))}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Text search */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-text-muted">{`search`}</span>
            <input type="text" placeholder="Search by Rep Name, Emp ID, Territory, Grade..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#b43403] text-text-secondary placeholder-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
          </div>

          {/* Zone filter */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={zoneFilter} onChange={(e) => { setZoneFilter(e.target.value as typeof zoneFilter); setPage(1); }}>
            <option value="all">All Territories (Pan-India)</option>
            <option value="West Zone">West Zone (Mumbai, Pune)</option>
            <option value="North Zone">North Zone (Delhi NCR)</option>
            <option value="South Zone">South Zone (Bengaluru)</option>
            <option value="East Zone">East Zone (Kolkata)</option>
          </select>

          {/* Designation Grade */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={designationFilter} onChange={(e) => { setDesignationFilter(e.target.value as typeof designationFilter); setPage(1); }}>
            <option value="all">All Designations (MR, Senior MR, ASM)</option>
            <option value="Medical Representative (MR)">Medical Representative (MR)</option>
            <option value="Senior Executive (SR MR)">Senior Executive (SR MR)</option>
            <option value="Area Sales Manager (ASM)">Area Sales Manager (ASM)</option>
          </select>

          {/* Disbursal Status */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}>
            <option value="all">All Disbursal Statuses</option>
            <option value="Approved">Passed for Bank Payment</option>
            <option value="ASM Verified">Pending ASM Sign-off</option>
            <option value="Claim on Hold">TA/DA Dispute Hold</option>
          </select>
        </div>

        {/* Reset & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary font-medium">Showing <strong>{filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</strong> Staff</span>
          <button className="text-xs text-text-secondary hover:text-text-primary font-semibold flex items-center gap-1 p-1" onClick={resetFilters}>
            <span className="material-symbols-outlined text-[11px]">{`circle`}</span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* MAIN PAYROLL ROSTER & SALARY BREAKDOWN INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Comprehensive Payroll Roster Table */}
        <div className="lg:col-span-2 bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b43403]"></span>
              <h3 className="font-bold text-sm text-text-primary">September 2026 Salary &amp; Expense Reconciliation Roster</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-[#b43403] hover:underline" onClick={selectAll}>Select All {filtered.length}</button>
              <button className="px-2.5 py-1 bg-surface-subtle hover:bg-slate-200 text-text-secondary text-xs font-semibold rounded transition-colors disabled:opacity-50" onClick={handleBulkApprove} disabled={selectedIds.size === 0}>
                Bulk Approve Allowances
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-subtle text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0" checked={pageRows.length > 0 && pageRows.every((e) => selectedIds.has(e.id))} onChange={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      const allSelected = pageRows.every((e) => next.has(e.id));
                      pageRows.forEach((e) => (allSelected ? next.delete(e.id) : next.add(e.id)));
                      return next;
                    });
                  }}/></th>
                  <th className="py-3 px-4">Field Employee &amp; HQ</th>
                  <th className="py-3 px-4">Work Days / DCRs</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4">TA/DA Claimed</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {pageRows.length === 0 && (
                  <tr><td colSpan={8} className="py-10 px-4 text-center text-text-muted">No staff match the current search/filters.</td></tr>
                )}
                {pageRows.map((e) => (
                  <tr key={e.id} className={`${e.rowClass} transition-colors ${inspectedId === e.id ? "ring-1 ring-inset ring-[#b43403]/40" : ""}`}>
                    <td className="py-3.5 px-4"><input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleSelect(e.id)} className="rounded text-[#b43403] focus:ring-0"/></td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-text-primary">{e.name}</div>
                      <div className="text-[11px] text-text-secondary">{e.empCode} &bull; {e.hq}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-surface-subtle text-text-secondary rounded text-[10px] font-semibold">{e.grade}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-text-primary">{e.workDaysNote}</div>
                      <div className={`text-[11px] font-medium ${e.workDaysNoteClass}`}>{e.workDaysNote}</div>
                      <div className="text-[10px] text-text-muted">{e.workDaysSub}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{e.baseSalary}</td>
                    <td className="py-3.5 px-4">
                      <div className={`font-bold ${e.taDaClass}`}>{e.taDa}</div>
                      <div className={`text-[10px] ${e.taDaClass === "text-rose-600" ? "text-rose-500" : "text-text-muted"}`}>{e.taDaNote}</div>
                    </td>
                    <td className={`py-3.5 px-4 font-extrabold text-sm ${e.netPayoutClass}`}>{e.netPayout}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${e.statusClass}`}>{e.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-[#b43403] hover:text-[#9a3412] font-semibold text-xs inline-flex items-center gap-1" onClick={() => setInspectedId(e.id)}>
                        <span>{e.actionLabel}</span> <span className="material-symbols-outlined text-[10px]">{`chevron_right`}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-3 border-t border-border-subtle flex items-center justify-between bg-surface-subtle text-xs">
            <span className="text-text-secondary">{selectedIds.size} Staff Selected &bull; Total {filtered.length} Records</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface-card disabled:opacity-40" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <span className="material-symbols-outlined text-[10px]">{`chevron_left`}</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === safePage ? "w-7 h-7 flex items-center justify-center bg-[#b43403] text-white rounded font-bold" : "w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-secondary hover:bg-surface-card font-medium"} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface-card disabled:opacity-40" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <span className="material-symbols-outlined text-[10px]">{`chevron_right`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Rep Salary & Allowance Dissect Inspector */}
        <div className="space-y-4">

          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#b43403]">PAYSLIP SLATE #SEP-2026-{inspected.empCode.replace("EMP-", "")}</span>
              </div>
              <span className={`px-2 py-0.5 font-bold text-[10px] rounded-full border ${inspected.status === "Claim on Hold" ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-status-success-bg text-status-success border-status-success-bg"}`}>
                {inspected.status === "Claim on Hold" ? "Hold — Under Audit" : "Ready for Disbursal"}
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Field Representative</p>
                <p className="font-bold text-text-primary mt-0.5">{inspected.name}</p>
                <p className="text-text-secondary text-[11px]">{inspected.grade} &bull; {inspected.hq}</p>
              </div>

              {/* Breakdown Items */}
              <div className="space-y-2 bg-surface-subtle p-3 rounded-lg border border-slate-100 text-xs">
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Basic Salary ({inspected.workDaysNote}):</span>
                  <span className="font-semibold text-text-primary">{inspected.breakdown.basic}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>House Rent Allowance (HRA):</span>
                  <span className="font-semibold text-text-primary">{inspected.breakdown.hra}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Special &amp; Medical Allowance:</span>
                  <span className="font-semibold text-text-primary">{inspected.breakdown.special}</span>
                </div>
                <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-text-primary font-bold">
                  <span>Gross Fixed Compensation:</span>
                  <span>{inspected.breakdown.grossFixed}</span>
                </div>

                <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-[#b43403] font-bold">
                  <span>Daily Allowance (DA) - {inspected.breakdown.daHqNote}:</span>
                  <span>{inspected.breakdown.daHq}</span>
                </div>
                <div className="flex justify-between items-center text-[#b43403] font-bold">
                  <span>Ex-Station DA - {inspected.breakdown.daExNote}:</span>
                  <span>{inspected.breakdown.daEx}</span>
                </div>
                <div className="flex justify-between items-center text-[#b43403] font-bold">
                  <span>Travel Allowance ({inspected.breakdown.travelNote}):</span>
                  <span>{inspected.breakdown.travel}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary font-semibold">
                  <span>Mobile &amp; Stationery Reimb.:</span>
                  <span>{inspected.breakdown.reimb}</span>
                </div>

                <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-text-secondary">
                  <span>Statutory PF &amp; ESIC Deduction:</span>
                  <span className="text-rose-600">- {inspected.breakdown.pf}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Professional Tax (PT):</span>
                  <span className="text-rose-600">- {inspected.breakdown.pt}</span>
                </div>

                <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-text-primary font-extrabold text-sm">
                  <span>Net Payable Amount:</span>
                  <span className="text-[#b43403]">{inspected.breakdown.net}</span>
                </div>
              </div>

              {/* Bank Handshake Info */}
              <div className="p-2.5 bg-status-info-bg/60 border border-status-info-bg rounded-lg text-[11px] text-blue-900">
                <div className="font-bold flex items-center justify-between">
                  <span>Bank Account Linked</span>
                  <span className="text-status-info">{inspected.breakdown.bankName}</span>
                </div>
                <p className="text-status-info/80 mt-0.5">A/C: **** **** {inspected.breakdown.bankLast4} &bull; IFSC: {inspected.breakdown.ifsc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button className="w-full py-2 bg-[#b43403] hover:bg-[#9a3412] text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-2" onClick={handleApproveAndSend}>
                  <span className="material-symbols-outlined">{`circle`}</span>
                  <span>Approve &amp; Send to Bank NEFT Batch</span>
                </button>
                <button className="w-full py-2 border border-border-subtle text-text-secondary font-semibold rounded-lg text-xs hover:bg-surface-subtle flex items-center justify-center gap-2" onClick={handleDownloadSlip}>
                  <span className="material-symbols-outlined text-text-secondary">{`circle`}</span>
                  <span>Download Verified Salary Slip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Automated Statutory & Expense Compliance Widget */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">{`calculate`}</span>
              <span>Expense Audit Rule Engine (DCR Verified)</span>
            </h4>

            <div className="text-[11px] space-y-2 text-text-secondary">
              <div className="flex items-center justify-between">
                <span>GPS Distance Validation Adherence:</span>
                <span className="font-bold text-emerald-600">98.2% Match</span>
              </div>
              <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "98.2%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span>MTP Route Plan vs Actual DCR Calls:</span>
                <span className="font-bold text-text-primary">95.4% Sync</span>
              </div>
              <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#b43403] h-full rounded-full" style={{ "width": "95.4%" }}></div>
              </div>
            </div>

            <p className="text-[10px] text-text-secondary pt-1">
              Field representatives must log daily calls prior to midnight to qualify for full local HQ daily allowance (₹250/day).
            </p>
          </div>

        </div>

      </div>

      {/* PAYROLL POLICY BANNER */}
      <div className="p-4 bg-status-info-bg/50 border border-status-info-bg rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">{`request_quote`}</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">Statutory Tax &amp; Field Force Daily Allowance Reimbursement Policy</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Ex-station and Outstation travel allowances are exempt under Income Tax Section 10(14)(i) subject to verified DCR visit proof and travel voucher logs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3 py-1.5 border border-border-subtle bg-surface-card text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-subtle" onClick={() => setDetail({ title: "TA/DA Policy", body: "Ex-station and Outstation travel allowances are exempt under Income Tax Section 10(14)(i), subject to verified DCR visit proof and travel voucher logs submitted within the same payroll cycle." })}>
            View TA/DA Policy
          </button>
          <button className="px-3 py-1.5 bg-[#b43403] text-white text-xs font-semibold rounded-lg hover:bg-[#9a3412]" onClick={handleExport} disabled={filtered.length === 0}>
            Bulk NEFT Matrix
          </button>
        </div>
      </div>

    </div>


    </div>

    {/* Final Payroll Lock confirmation modal */}
    {showLockConfirm && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowLockConfirm(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Run Final Payroll Lock &amp; Disburse</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            This will mark every non-disputed claim in the current roster ({employees.filter((e) => e.status !== "Claim on Hold").length} of {employees.length} employees) as Approved and queue them for the Bank NEFT batch.
          </p>
          <p className="text-[11px] text-text-muted">Session-only simulation — there is no live disbursement/banking backend yet, so this does not persist after a page reload.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowLockConfirm(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a3412]" onClick={handleFinalLock}>Confirm &amp; Lock</button>
          </div>
        </div>
      </div>
    )}

    {/* Detail popup */}
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
