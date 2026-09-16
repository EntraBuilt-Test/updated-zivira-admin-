"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { apiClient, type PayrollStatusRow } from "@/lib/api-client";
import { downloadCsv } from "@/lib/download-csv";

// This page used to be a fully static server component: every number was
// hand-typed JSX and none of its buttons/selects/inputs had a real
// onClick/onChange handler. A later pass wired it up against a local mock
// "salary roster" array that invented a full payslip breakdown (basic pay,
// HRA, TA/DA, PF/ESIC, bank account) that the backend does not provide.
//
// GET /company/analytics/payroll (apiClient.payrollAnalytics) returns
// PayrollStatusRow[] — id, employeeCode, employeeName, role, month,
// status (RELEASED | HOLD | EXPLANATION_SUBMITTED), holdReason,
// missedDaysSnapshot, employeeExplanation, managerApprovedByName,
// releasedAt — plus a summary {onHold, pendingApproval, released}. There
// is no salary-breakdown, TA/DA, or bank-account data anywhere in this
// endpoint, so the payslip inspector's line-item breakdown and the bank
// handshake card are DROPPED below rather than kept as fabricated numbers;
// the inspector now shows only the real hold/explanation/approval fields.
// "Approve & Send to Bank" and "Run Final Payroll Lock & Disburse" now
// call the real PATCH /company/analytics/payroll/:id/release endpoint
// (apiClient.releasePayroll) for each selected/eligible row, then refetch.
//
// The Expense Audit Rule Engine widget (GPS/MTP sync %) is left as static
// demo content — no backend collection exists for that reconciliation yet.

const ALL_ROLE = "All Roles";
const ALL_APPROVAL = "All Approval States";

const APPROVAL_OPTIONS = [ALL_APPROVAL, "Manager Approved", "Not Yet Approved"];

const STATUS_OPTIONS: { label: string; value: "all" | PayrollStatusRow["status"] }[] = [
  { label: "All Disbursal Statuses", value: "all" },
  { label: "Released", value: "RELEASED" },
  { label: "On Hold", value: "HOLD" },
  { label: "Explanation Submitted", value: "EXPLANATION_SUBMITTED" }
];

const MONTH_OPTIONS: { label: string; value: string }[] = [
  { label: "September 2026 (Active Cycle)", value: "2026-09" },
  { label: "August 2026 (Processed)", value: "2026-08" },
  { label: "July 2026 (Audited)", value: "2026-07" }
];

const statusPillClass: Record<PayrollStatusRow["status"], string> = {
  RELEASED: "bg-emerald-100 text-emerald-800",
  HOLD: "bg-rose-100 text-rose-800",
  EXPLANATION_SUBMITTED: "bg-blue-100 text-blue-800"
};

const PAGE_SIZE = 5;

export function AdminPayrollDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows, setRows] = useState<PayrollStatusRow[]>([]);
  const [summary, setSummary] = useState<{ onHold: number; pendingApproval: number; released: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cycle, setCycle] = useState(MONTH_OPTIONS[0].value);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL_ROLE);
  const [approvalFilter, setApprovalFilter] = useState(ALL_APPROVAL);
  const [statusFilter, setStatusFilter] = useState<"all" | PayrollStatusRow["status"]>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [division, setDivision] = useState("All Divisions (Pan-India HQ)");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.payrollAnalytics(cycle);
      const data = response.data ?? [];
      setRows(data);
      setSummary(response.summary ?? null);
      setSelectedIds((prev) => {
        const validIds = new Set(data.map((r) => r.id));
        const next = new Set<string>();
        prev.forEach((id) => { if (validIds.has(id)) next.add(id); });
        return next;
      });
      setInspectedId((prev) => (prev && data.some((r) => r.id === prev)) ? prev : (data[0]?.id ?? null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  const roleOptions = useMemo(() => [ALL_ROLE, ...Array.from(new Set(rows.map((r) => r.role).filter(Boolean) as string[]))], [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== ALL_ROLE && r.role !== roleFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (approvalFilter === "Manager Approved" && !r.managerApprovedByName) return false;
      if (approvalFilter === "Not Yet Approved" && r.managerApprovedByName) return false;
      if (!q) return true;
      return (
        (r.employeeName || "").toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        (r.role || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, roleFilter, statusFilter, approvalFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const inspected = rows.find((r) => r.id === inspectedId) ?? rows[0] ?? null;

  function resetFilters() {
    setSearch("");
    setRoleFilter(ALL_ROLE);
    setApprovalFilter(ALL_APPROVAL);
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
    setSelectedIds(new Set(filtered.map((r) => r.id)));
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "payroll-status-batch.csv",
      filtered.map((r) => ({
        "Employee": r.employeeName || r.employeeCode,
        "Emp Code": r.employeeCode,
        "Role": r.role || "—",
        "Month": r.month,
        "Status": r.status,
        "Hold Reason": r.holdReason || "",
        "Missed Days Snapshot": r.missedDaysSnapshot ?? "",
        "Employee Explanation": r.employeeExplanation || "",
        "Manager Approved By": r.managerApprovedByName || "",
        "Released At": r.releasedAt || ""
      }))
    );
  }

  async function releaseIds(ids: string[]) {
    if (ids.length === 0) return;
    setReleasing(true);
    try {
      for (const id of ids) {
        const row = rows.find((r) => r.id === id);
        if (!row || row.status === "RELEASED") continue;
        await apiClient.releasePayroll(id);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to release payroll for one or more employees");
    } finally {
      setReleasing(false);
    }
  }

  async function handleBulkApprove() {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await releaseIds(ids);
    setDetail({ title: "Bulk Release Complete", body: `${ids.length} employee(s) were sent to POST /company/analytics/payroll/:id/release and the roster has been refreshed.` });
  }

  async function handleApproveAndSend() {
    if (!inspected) return;
    await releaseIds([inspected.id]);
    setDetail({ title: "Released to Bank", body: `${inspected.employeeName || inspected.employeeCode}'s payroll hold has been released via the real payroll-release endpoint.` });
  }

  function handleDownloadSlip() {
    if (!inspected) return;
    downloadCsv(`payroll-status-${inspected.employeeCode}.csv`, [{
      "Employee": inspected.employeeName || inspected.employeeCode, "Emp Code": inspected.employeeCode, "Role": inspected.role || "—",
      "Month": inspected.month, "Status": inspected.status, "Hold Reason": inspected.holdReason || "",
      "Missed Days Snapshot": inspected.missedDaysSnapshot ?? "", "Employee Explanation": inspected.employeeExplanation || "",
      "Manager Approved By": inspected.managerApprovedByName || "", "Released At": inspected.releasedAt || ""
    }]);
  }

  async function handleFinalLock() {
    const idsToRelease = rows.filter((r) => r.status !== "RELEASED").map((r) => r.id);
    await releaseIds(idsToRelease);
    setShowLockConfirm(false);
    setDetail({ title: "Payroll Lock Complete", body: `${idsToRelease.length} non-released employee(s) were sent to the real payroll-release endpoint and the roster has been refreshed.` });
  }

  return (
    <div className="flex flex-col w-full space-y-6">




    {/* TOP HEADER */}
    <header className="h-16 bg-surface-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-3 text-xs text-text-muted">{`search`}</span>
          <input type="text" placeholder="Search employee name, code, role..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-[#b43403] text-text-primary placeholder-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Territory Selector — cosmetic only, no backend division field on PayrollStatusRow */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={division} onChange={(e) => setDivision(e.target.value)}>
            <option>All Divisions (Pan-India HQ)</option>
            <option>Cardio-Diabetic Division</option>
            <option>Respiratory Care Division</option>
            <option>Pediatric &amp; Ortho Division</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        {/* Payroll Month Picker — real API param */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer" value={cycle} onChange={(e) => { setCycle(e.target.value); setPage(1); }}>
            {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        {/* Refresh Button */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle" title="Refresh Payroll Data" onClick={() => load()}>
          <span className="material-symbols-outlined text-xs">{`sync`}</span>
        </button>

        {/* Alerts */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle relative" title="Notifications" onClick={() => setDetail({ title: "Notifications", body: `${summary?.onHold ?? 0} employee(s) on payroll hold and ${summary?.pendingApproval ?? 0} pending approval this cycle.` })}>
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
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Salary Integration &amp; Payroll Hold Engine</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-info-bg text-status-info border border-status-info-bg">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Cycle: {MONTH_OPTIONS.find((m) => m.value === cycle)?.label}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Track real payroll-hold status per employee (DCR-compliance driven), employee explanations, manager approvals, and release employees to disbursement.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 border border-border-subtle text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-subtle flex items-center gap-2 transition-colors disabled:opacity-50" onClick={handleExport} disabled={filtered.length === 0}>
            <span className="material-symbols-outlined text-xs">{`circle`}</span>
            <span>Export Payroll Status Batch</span>
          </button>
          <button className="px-4 py-2 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60" onClick={() => setShowLockConfirm(true)} disabled={releasing}>
            <span className="material-symbols-outlined text-xs">{`circle`}</span>
            <span>Run Final Payroll Lock &amp; Disburse</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3">{error}</div>
      )}

      {/* KPI METRIC PULSE CARDS — sourced from the real analytics summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Metric 1: Released */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Released to Bank</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{loading ? "…" : (summary?.released ?? 0)}</h3>
                <span className="text-[11px] font-medium text-text-secondary">of {rows.length} employees</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`account_balance_wallet`}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: On Hold */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">On Payroll Hold</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{loading ? "…" : (summary?.onHold ?? 0)}</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`route`}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Approval */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending Approval</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{loading ? "…" : (summary?.pendingApproval ?? 0)}</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`receipt`}</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Manager Approvals Recorded */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Manager Approvals Recorded</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-text-primary">{rows.filter((r) => r.managerApprovedByName).length}</h3>
                <span className="text-[11px] text-text-secondary font-medium">of {rows.length}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#b43403]/10 text-[#b43403] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{`how_to_reg`}</span>
            </div>
          </div>
        </div>

      </div>

      {/* PAYROLL SUB-TABS */}
      <div className="flex items-center gap-6 border-b border-border-subtle text-xs font-semibold">
        {["Field Staff Payroll Status Roll", "Kilometre Fare & DA Tier Matrix", "Outstation Lodge & Boarding Ledger", "Statutory Tax & TDS Section 192/194R Declarations"].map((label, i) => (
          <button
            key={label}
            className={i === activeSubTab ? "pb-3 border-b-2 border-[#b43403] text-[#b43403] flex items-center gap-2" : "pb-3 text-text-secondary hover:text-text-primary border-b-2 border-transparent flex items-center gap-2 transition-colors"}
            onClick={() => {
              setActiveSubTab(i);
              if (i !== 0) setDetail({ title: label, body: "This roster view isn't built out yet — there is no backend collection for it. Showing the Field Staff Payroll Status Roll below in the meantime." });
            }}
          >
            <span className="material-symbols-outlined">{`circle`}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Text search */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-text-muted">{`search`}</span>
            <input type="text" placeholder="Search by Employee Name, Code, Role..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#b43403] text-text-secondary placeholder-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
          </div>

          {/* Role filter */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Manager Approval filter */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={approvalFilter} onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }}>
            {APPROVAL_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Disbursal Status */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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

      {/* MAIN PAYROLL ROSTER & STATUS INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Comprehensive Payroll Roster Table */}
        <div className="lg:col-span-2 bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b43403]"></span>
              <h3 className="font-bold text-sm text-text-primary">Payroll Status &amp; Hold Reconciliation Roster</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-[#b43403] hover:underline" onClick={selectAll}>Select All {filtered.length}</button>
              <button className="px-2.5 py-1 bg-surface-subtle hover:bg-slate-200 text-text-secondary text-xs font-semibold rounded transition-colors disabled:opacity-50" onClick={handleBulkApprove} disabled={selectedIds.size === 0 || releasing}>
                Bulk Release Selected
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-subtle text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0" checked={pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id))} onChange={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      const allSelected = pageRows.every((r) => next.has(r.id));
                      pageRows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
                      return next;
                    });
                  }}/></th>
                  <th className="py-3 px-4">Field Employee &amp; Role</th>
                  <th className="py-3 px-4">Missed Days Snapshot</th>
                  <th className="py-3 px-4">Hold Reason</th>
                  <th className="py-3 px-4">Manager Approval</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {!loading && pageRows.length === 0 && (
                  <tr><td colSpan={7} className="py-10 px-4 text-center text-text-muted">No staff match the current search/filters.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={7} className="py-10 px-4 text-center text-text-muted">Loading payroll data…</td></tr>
                )}
                {pageRows.map((r) => (
                  <tr key={r.id} className={`transition-colors ${inspectedId === r.id ? "ring-1 ring-inset ring-[#b43403]/40" : "hover:bg-surface-subtle/80"}`}>
                    <td className="py-3.5 px-4"><input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded text-[#b43403] focus:ring-0"/></td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-text-primary">{r.employeeName || r.employeeCode}</div>
                      <div className="text-[11px] text-text-secondary">{r.employeeCode} &bull; {r.role || "Role not specified"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{r.missedDaysSnapshot ?? "—"}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-text-secondary">{r.holdReason || "—"}</div>
                      {r.employeeExplanation && <div className="text-[10px] text-text-muted italic mt-0.5">"{r.employeeExplanation}"</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-text-secondary">{r.managerApprovedByName || "Not yet approved"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPillClass[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-[#b43403] hover:text-[#9a3412] font-semibold text-xs inline-flex items-center gap-1" onClick={() => setInspectedId(r.id)}>
                        <span>{r.status === "RELEASED" ? "View" : "Review"}</span> <span className="material-symbols-outlined text-[10px]">{`chevron_right`}</span>
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

        {/* Right Col: Selected Employee Payroll Status Inspector */}
        <div className="space-y-4">

          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#b43403]">{inspected ? `PAYROLL CASE — ${inspected.employeeCode}` : "No employee selected"}</span>
              </div>
              {inspected && (
                <span className={`px-2 py-0.5 font-bold text-[10px] rounded-full border ${inspected.status === "HOLD" ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-status-success-bg text-status-success border-status-success-bg"}`}>
                  {inspected.status === "HOLD" ? "Hold — Under Review" : inspected.status === "EXPLANATION_SUBMITTED" ? "Explanation Submitted" : "Released"}
                </span>
              )}
            </div>

            {inspected ? (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Field Representative</p>
                <p className="font-bold text-text-primary mt-0.5">{inspected.employeeName || inspected.employeeCode}</p>
                <p className="text-text-secondary text-[11px]">{inspected.role || "Role not specified"} &bull; {inspected.month}</p>
              </div>

              {/* Real fields only — no fabricated salary breakdown. The
                  payroll API does not return basic pay / HRA / TA-DA /
                  deductions / bank account data, so that breakdown is not
                  shown here (not available from payroll API yet). */}
              <div className="space-y-2 bg-surface-subtle p-3 rounded-lg border border-slate-100 text-xs">
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Missed Days Snapshot:</span>
                  <span className="font-semibold text-text-primary">{inspected.missedDaysSnapshot ?? "—"}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Hold Reason:</span>
                  <span className="font-semibold text-text-primary text-right max-w-[60%]">{inspected.holdReason || "—"}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Manager Approved By:</span>
                  <span className="font-semibold text-text-primary">{inspected.managerApprovedByName || "Not yet approved"}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Released At:</span>
                  <span className="font-semibold text-text-primary">{inspected.releasedAt || "Not released"}</span>
                </div>
                {inspected.employeeExplanation && (
                  <div className="pt-2 border-t border-border-subtle">
                    <span className="text-text-muted block mb-1">Employee Explanation:</span>
                    <p className="text-text-secondary italic">"{inspected.employeeExplanation}"</p>
                  </div>
                )}
                <p className="text-[10px] text-text-muted pt-2 border-t border-border-subtle">
                  Salary/allowance line-item breakdown and bank account details are not available from the payroll API yet.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button className="w-full py-2 bg-[#b43403] hover:bg-[#9a3412] text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-2 disabled:opacity-50" onClick={handleApproveAndSend} disabled={inspected.status === "RELEASED" || releasing}>
                  <span className="material-symbols-outlined">{`circle`}</span>
                  <span>{inspected.status === "RELEASED" ? "Already Released" : "Approve & Send to Bank"}</span>
                </button>
                <button className="w-full py-2 border border-border-subtle text-text-secondary font-semibold rounded-lg text-xs hover:bg-surface-subtle flex items-center justify-center gap-2" onClick={handleDownloadSlip}>
                  <span className="material-symbols-outlined text-text-secondary">{`circle`}</span>
                  <span>Download Payroll Status Record</span>
                </button>
              </div>
            </div>
            ) : (
              <p className="text-xs text-text-muted mt-3">No employees loaded for this cycle yet.</p>
            )}
          </div>

          {/* Expense Audit Rule Engine — static demo, no backend collection yet */}
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
          <button className="px-3 py-1.5 bg-[#b43403] text-white text-xs font-semibold rounded-lg hover:bg-[#9a3412] disabled:opacity-50" onClick={handleExport} disabled={filtered.length === 0}>
            Export Batch
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
            This will call the real payroll-release endpoint for every non-released employee in the current roster ({rows.filter((r) => r.status !== "RELEASED").length} of {rows.length} employees) and mark them RELEASED.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowLockConfirm(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a3412] disabled:opacity-50" onClick={handleFinalLock} disabled={releasing}>Confirm &amp; Lock</button>
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
