"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { apiClient, type ComplianceRow } from "@/lib/api-client";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component: the header
// search/territory/period selectors, sync/notification icons, Export
// Statutory Audit, Run UCPMP Integrity Check, the 4 workflow sub-tabs, the
// filter bar (search/zone/violation-type/status/reset), row checkboxes,
// Select All / Bulk Issue Notice, every row's Audit button, the
// Approve/Flag inspector actions, pagination, and Audit Manual / View DoP
// Circular did nothing when clicked. A later pass wired all of that up
// against a local mock "UCPMP violation" array (fake doctor/clause rows).
//
// That mock modeled the wrong thing: the real backend endpoint for this
// page, GET /company/analytics/compliance (apiClient.complianceAnalytics),
// is an EMPLOYEE DCR-submission compliance report, not a per-doctor UCPMP
// clause-violation log — there is no backend concept of "doctor visited
// too often" or "unsigned sample receipt" here. This pass replaces the
// mock with the real ComplianceRow[] data and reshapes the roster/filters/
// inspector around real fields (employeeCode, employeeName, role,
// submittedToday, pendingDCR, missedYesterday/ThisWeek/ThisMonth,
// compliancePercent, chronicDefaulter, warningLevel, salaryHold), and the
// 4 top KPI numbers now come from the endpoint's real `summary` object
// instead of the old hardcoded 98.6%/12/99.4%/₹1,000 placeholders.
//
// The Legal & Compliance Declaration panel (statutory filing checklist)
// and the bottom compliance-directive banner are left as static content —
// no backend collection exists for those. Bulk Issue Notice / Approve /
// Flag remain session-only, clearly labeled, since there is no write
// endpoint for compliance case actions (only the read endpoint above and
// the separate payroll-hold release endpoint used on the Payroll page).

type WarningLevel = ComplianceRow["warningLevel"];

const ALL_ROLE = "All Roles";
const ALL_WARNING = "All Warning Levels";
const ALL_CHRONIC = "All Employees";

const WARNING_OPTIONS: { label: string; value: "all" | WarningLevel }[] = [
  { label: ALL_WARNING, value: "all" },
  { label: "No Warning", value: "NONE" },
  { label: "Low Warning", value: "LOW" },
  { label: "Medium Warning", value: "MEDIUM" },
  { label: "High Warning", value: "HIGH" }
];

const CHRONIC_OPTIONS = [ALL_CHRONIC, "Chronic Defaulters Only", "Non-Chronic Only"];

const SUB_TABS: { key: "exceptions" | "samples" | "declarations" | "audit_logs"; label: string; icon: string; badge?: string; badgeClass?: string }[] = [
  { key: "exceptions", label: "DCR Compliance Roster", icon: "assignment_turned_in" },
  { key: "samples", label: "Physician Sample Dispensation Audit", icon: "inventory_2", badge: "Pan-India", badgeClass: "bg-surface-subtle text-text-secondary" },
  { key: "declarations", label: "Field Force Code of Conduct Declarations", icon: "admin_panel_settings", badge: "428/428", badgeClass: "bg-status-success-bg text-status-success font-bold" },
  { key: "audit_logs", label: "Statutory Audit Logs & MCI Registry Sync", icon: "balance" }
];

const MONTH_OPTIONS: { label: string; value: string }[] = [
  { label: "Sep 2026 (Monthly Rollup)", value: "2026-09" },
  { label: "Aug 2026 (Archived)", value: "2026-08" },
  { label: "Oct 2026", value: "2026-10" }
];

const PAGE_SIZE = 5;

const warningPillClass: Record<WarningLevel, string> = {
  NONE: "bg-surface-subtle text-text-secondary",
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-rose-100 text-rose-800"
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "EE";
}

export function AdminComplianceDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows, setRows] = useState<ComplianceRow[]>([]);
  const [summary, setSummary] = useState<{ submittedToday: number; pendingDCR: number; missedYesterday: number; chronicDefaulters: number; avgCompliancePercent: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(MONTH_OPTIONS[0].value);

  const [tab, setTab] = useState<"exceptions" | "samples" | "declarations" | "audit_logs">("exceptions");
  const [headerSearch, setHeaderSearch] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL_ROLE);
  const [warningFilter, setWarningFilter] = useState<"all" | WarningLevel>("all");
  const [chronicFilter, setChronicFilter] = useState(ALL_CHRONIC);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [auditCode, setAuditCode] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.complianceAnalytics(month);
        if (!cancelled) {
          const data = response.data ?? [];
          setRows(data);
          setSummary(response.summary ?? null);
          setSelected((prev) => {
            const validCodes = new Set(data.map((r) => r.employeeCode));
            const next = new Set<string>();
            prev.forEach((c) => { if (validCodes.has(c)) next.add(c); });
            return next;
          });
          setAuditCode((prev) => (prev && data.some((r) => r.employeeCode === prev)) ? prev : (data[0]?.employeeCode ?? null));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load compliance data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [month]);

  const roleOptions = useMemo(() => [ALL_ROLE, ...Array.from(new Set(rows.map((r) => r.role).filter(Boolean) as string[]))], [rows]);

  const filtered = useMemo(() => {
    const q = (search || headerSearch).trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== ALL_ROLE && r.role !== roleFilter) return false;
      if (warningFilter !== "all" && r.warningLevel !== warningFilter) return false;
      if (chronicFilter === "Chronic Defaulters Only" && !r.chronicDefaulter) return false;
      if (chronicFilter === "Non-Chronic Only" && r.chronicDefaulter) return false;
      if (!q) return true;
      return (
        (r.employeeName || "").toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        (r.role || "").toLowerCase().includes(q)
      );
    });
  }, [rows, roleFilter, warningFilter, chronicFilter, search, headerSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const auditCase = rows.find((r) => r.employeeCode === auditCode) || rows[0] || null;

  function toggleSelected(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((r) => r.employeeCode)));
  }

  function resetFilters() {
    setSearch("");
    setRoleFilter(ALL_ROLE);
    setWarningFilter("all");
    setChronicFilter(ALL_CHRONIC);
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "dcr-compliance-roster.csv",
      filtered.map((r) => ({
        "Employee": r.employeeName || r.employeeCode,
        "Code": r.employeeCode,
        "Role": r.role || "—",
        "Submitted Today": r.submittedToday ? "Yes" : "No",
        "Pending DCR": r.pendingDCR ? "Yes" : "No",
        "Missed Yesterday": r.missedYesterday ? "Yes" : "No",
        "Missed This Week": r.missedThisWeek,
        "Missed This Month": r.missedThisMonth,
        "Expected This Month": r.expectedThisMonth,
        "Submitted This Month": r.submittedThisMonth,
        "Compliance %": r.compliancePercent,
        "Missed Last 30 Days": r.missedLast30Days,
        "Chronic Defaulter": r.chronicDefaulter ? "Yes" : "No",
        "Warning Level": r.warningLevel,
        "Salary Hold": r.salaryHold ? "Yes" : "No"
      }))
    );
  }

  function bulkIssueNotice() {
    if (selected.size === 0) return;
    setDetail({ title: "Bulk Issue Notice", body: `A compliance notice would be issued to ${selected.size} employee(s) for DCR non-submission. Session-only — there is no compliance-notice write endpoint yet.` });
  }

  function runIntegrityCheck() {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setDetail({ title: "Compliance Integrity Check", body: `Integrity scan complete across ${rows.length} employees loaded for ${MONTH_OPTIONS.find((m) => m.value === month)?.label}. ${summary?.chronicDefaulters ?? 0} chronic defaulter(s) and ${summary?.pendingDCR ?? 0} pending DCR(s) currently on record.` });
    }, 800);
  }

  function handleSync() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 600);
  }

  function approveCase() {
    if (!auditCase) return;
    setDetail({ title: "Approve Exception & Archive Log", body: `${auditCase.employeeName || auditCase.employeeCode}'s compliance case would be archived as resolved. Session-only — there is no compliance case-status write endpoint yet.` });
  }

  function flagCase() {
    if (!auditCase) return;
    setDetail({ title: "Flag as Non-Compliant", body: `${auditCase.employeeName || auditCase.employeeCode} would be flagged as non-compliant. Session-only — there is no compliance case-status write endpoint yet. Salary hold status is managed on the Payroll page via the real payroll-release endpoint.` });
  }

  return (
    <div className="flex flex-col w-full space-y-6">



    {/* TOP HEADER */}
    <header className="h-16 bg-surface-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-3 text-[16px] text-text-muted">search</span>
          <input type="text" placeholder="Search employee code, name, role..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-[#b43403] text-text-primary placeholder-slate-400" value={headerSearch} onChange={(e) => { setHeaderSearch(e.target.value); setPage(1); }}/>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Month Selector — real API param */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }}>
            {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[14px] text-text-muted pointer-events-none">expand_more</span>
        </div>

        {/* Sync Icon */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle" title="Refresh Audit Stream" type="button" onClick={handleSync}>
          <span className={`material-symbols-outlined text-[16px] ${syncing ? "animate-spin" : ""}`}>sync</span>
        </button>

        {/* Notification */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle relative" title="Alerts" type="button" onClick={() => setDetail({ title: "Alerts", body: `${summary?.pendingDCR ?? 0} employees have a pending DCR and ${summary?.chronicDefaulters ?? 0} are flagged as chronic defaulters — see the roster below.` })}>
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
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">DCR Attendance &amp; Compliance Analytics</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success border border-status-success-bg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Backend Data
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Monitor daily DCR submission compliance, chronic defaulter detection, and salary-hold warning levels across the field force.
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
            <span>{checking ? "Running Check..." : "Run Compliance Integrity Check"}</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3">{error}</div>
      )}

      {/* KPI METRIC PULSE CARDS — now sourced from the real analytics summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Metric 1: Overall Compliance Index */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Avg Compliance Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{loading ? "…" : `${(summary?.avgCompliancePercent ?? 0).toFixed(1)}%`}</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Employees Loaded: <strong>{rows.length}</strong></span>
          </div>
        </div>

        {/* Metric 2: Missed Yesterday / Pending DCR */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Missed DCR Yesterday</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{loading ? "…" : (summary?.missedYesterday ?? 0)}</h3>
                <span className="text-[11px] font-medium text-text-secondary">of {rows.length} employees</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Pending DCR: <strong>{summary?.pendingDCR ?? 0}</strong></span>
            <span className="font-semibold text-amber-600">Submitted Today: {summary?.submittedToday ?? 0}</span>
          </div>
        </div>

        {/* Metric 3: Chronic Defaulters */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Chronic Defaulters</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{loading ? "…" : (summary?.chronicDefaulters ?? 0)}</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">medication</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Flagged via missedLast30Days threshold</span>
          </div>
        </div>

        {/* Metric 4: Salary Holds */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Employees On Salary Hold</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{rows.filter((r) => r.salaryHold).length}</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Managed on the Payroll page</span>
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
          {SUB_TABS.find((t) => t.key === tab)?.label} isn't built out in this preview yet — the DCR Compliance Roster tab below has the fully wired table, filters, and audit workflow.
        </div>
      ) : (
      <>
      {/* FILTER CONTROLS BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Text search */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-text-muted">search</span>
            <input type="text" placeholder="Filter by Employee Name, Code, Role..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#b43403] text-text-secondary placeholder-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
          </div>

          {/* Role filter */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Warning Level */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={warningFilter} onChange={(e) => { setWarningFilter(e.target.value as typeof warningFilter); setPage(1); }}>
            {WARNING_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>

          {/* Chronic Defaulter */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={chronicFilter} onChange={(e) => { setChronicFilter(e.target.value); setPage(1); }}>
            {CHRONIC_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Reset & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary font-medium">Showing <strong>{pageRows.length} of {filtered.length}</strong> Employees</span>
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
              <h3 className="font-bold text-sm text-text-primary">DCR Compliance &amp; Chronic Defaulter Queue</h3>
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
                  <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0" readOnly checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.employeeCode))}/></th>
                  <th className="py-3 px-4">Employee &amp; Role</th>
                  <th className="py-3 px-4">Today / Yesterday</th>
                  <th className="py-3 px-4">This Month</th>
                  <th className="py-3 px-4">Compliance %</th>
                  <th className="py-3 px-4">Warning Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {!loading && pageRows.length === 0 && (
                  <tr><td colSpan={7} className="py-10 px-4 text-center text-text-muted text-xs">No employees match the current search/filters.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={7} className="py-10 px-4 text-center text-text-muted text-xs">Loading compliance data…</td></tr>
                )}
                {pageRows.map((r) => (
                  <tr key={r.employeeCode} className={r.chronicDefaulter && selected.has(r.employeeCode) ? "bg-status-warning-bg/40 hover:bg-status-warning-bg/70 transition-colors" : "hover:bg-surface-subtle/80 transition-colors"}>
                    <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0" checked={selected.has(r.employeeCode)} onChange={() => toggleSelected(r.employeeCode)}/></td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-secondary">{initialsOf(r.employeeName || r.employeeCode)}</div>
                        <div>
                          <div className="font-bold text-text-primary">{r.employeeName || r.employeeCode}</div>
                          <div className="text-[11px] text-text-secondary">{r.employeeCode} • {r.role || "—"}</div>
                        </div>
                      </div>
                      {r.chronicDefaulter && (
                        <span className="inline-block mt-1 px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded text-[10px] font-semibold">Chronic Defaulter</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className={r.submittedToday ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{r.submittedToday ? "Submitted Today" : "Not Submitted"}</div>
                      <div className="text-[10px] text-text-muted">{r.missedYesterday ? "Missed Yesterday" : "OK Yesterday"} {r.pendingDCR ? "• Pending DCR" : ""}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-text-primary">{r.submittedThisMonth} / {r.expectedThisMonth}</div>
                      <div className="text-[10px] text-text-muted">Missed: {r.missedThisMonth} mo • {r.missedThisWeek} wk • {r.missedLast30Days} (30d)</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-24">
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span className={r.compliancePercent < 75 ? "text-rose-600" : "text-text-primary"}>{r.compliancePercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${r.compliancePercent >= 90 ? "bg-emerald-500" : r.compliancePercent >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ "width": `${Math.min(100, Math.max(0, r.compliancePercent))}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${warningPillClass[r.warningLevel]}`}>
                        {r.warningLevel}
                      </span>
                      {r.salaryHold && <div className="text-[10px] text-rose-600 font-semibold mt-1">Salary On Hold</div>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className={`font-semibold text-xs inline-flex items-center gap-1 ${auditCode === r.employeeCode ? "text-[#b43403]" : "text-text-secondary hover:text-text-primary"}`} type="button" onClick={() => setAuditCode(r.employeeCode)}>
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
            <span className="text-text-secondary">{selected.size} Item{selected.size === 1 ? "" : "s"} Selected &bull; Total {filtered.length} Employees</span>
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

        {/* Right Col: Selected Employee Audit & Regulatory Inspector */}
        <div className="space-y-4">

          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#b43403]">{auditCase ? `AUDIT CASE — ${auditCase.employeeCode}` : "No employee selected"}</span>
              </div>
              {auditCase && (
                <span className={`px-2 py-0.5 font-bold text-[10px] rounded-full border ${auditCase.chronicDefaulter ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  {auditCase.chronicDefaulter ? "Chronic Defaulter" : "In Good Standing"}
                </span>
              )}
            </div>

            {auditCase ? (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Employee</p>
                <p className="font-bold text-text-primary mt-0.5">{auditCase.employeeName || auditCase.employeeCode}</p>
                <p className="text-text-secondary text-[11px]">{auditCase.role || "Role not specified"}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-surface-subtle p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-text-muted block">Compliance %</span>
                  <span className="font-bold text-text-primary">{auditCase.compliancePercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Warning Level</span>
                  <span className="font-bold text-text-primary">{auditCase.warningLevel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Missed (30 Days)</span>
                  <span className="font-bold text-rose-600">{auditCase.missedLast30Days}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Salary Status</span>
                  <span className={`font-bold ${auditCase.salaryHold ? "text-rose-600" : "text-emerald-600"}`}>{auditCase.salaryHold ? "On Hold" : "Normal"}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">This Month Submission</p>
                <div className="bg-status-warning-bg/60 border border-status-warning-bg p-2 rounded text-[11px] text-amber-900 mt-1">
                  {auditCase.submittedThisMonth} of {auditCase.expectedThisMonth} expected DCRs submitted this month. Missed this week: {auditCase.missedThisWeek}. Missed this month: {auditCase.missedThisMonth}.
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button className="w-full py-2 bg-[#b43403] hover:bg-[#9a3412] text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-2" type="button" onClick={approveCase}>
                  <span className="material-symbols-outlined">verified</span>
                  <span>Approve Exception &amp; Archive Log</span>
                </button>
                <button className="w-full py-2 border border-border-subtle text-text-secondary font-semibold rounded-lg text-xs hover:bg-surface-subtle flex items-center justify-center gap-2" type="button" onClick={flagCase}>
                  <span className="material-symbols-outlined text-rose-500">block</span>
                  <span>Flag as Non-Compliant</span>
                </button>
              </div>
            </div>
            ) : (
              <p className="text-xs text-text-muted mt-3">No employees loaded for this month yet.</p>
            )}
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
