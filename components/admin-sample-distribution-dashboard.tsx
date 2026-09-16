"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";
import { apiClient, type SampleAllocationRow, type SampleDistributionReport } from "@/lib/api-client";
import { formatDate } from "@/lib/format-date";

// Fix — this page used to be a fully static server component, then a later
// pass made the SKU roster table interactive against a local mock array of
// fabricated sample batches (invented molecule/category/territory,
// dispensed %, MR bag stock, custody status — none of which exist in the
// backend), and "Allocate Sample Quota" only ever appended a session-only
// row. The backend has THREE real endpoints for this (Topic 11/12 —
// Sample Distribution Analytics / Sample vs Doctor Input Analysis):
//   - apiClient.sampleAllocations()  → GET /company/sample-allocations
//     real per-transaction allocation records (SampleAllocationRow[]),
//     now driving the main roster table below.
//   - apiClient.issueSampleAllocation() → POST /company/sample-allocations
//     now actually called by "Allocate Sample Quota" so a new allocation
//     really persists instead of only living in local state.
//   - apiClient.sampleDistribution() → GET /company/analytics/sample-distribution
//     an aggregate {byRep, byProduct, byDoctor, totals} report, now
//     driving the 4 KPI pulse cards and the per-row dossier's rep/product
//     balance panel (real "issued vs distributed vs remaining" figures).
// There is no molecule/category/territory/expiry/custody-status field in
// the real data, so those filters/badges have been removed rather than
// faked; search and a real month filter take their place.

const TABS = [
  { key: "roster", label: "Sample Allocation Roster", count: null as string | null },
  { key: "receipts", label: "Physician Dispensation Receipts & OTP Audit", count: null },
  { key: "bagstock", label: "MR Bag Stock & Depot Reconciliation", count: null },
  { key: "recalls", label: "Batch Recall & Damaged Goods Ledger", count: null }
] as const;

const PAGE_SIZE = 10;

export function AdminSampleDistributionDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [allocations, setAllocations] = useState<SampleAllocationRow[]>([]);
  const [distribution, setDistribution] = useState<SampleDistributionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("roster");
  const [hasUnread, setHasUnread] = useState(true);
  const [lastSynced, setLastSynced] = useState("Depot Ledger Synced just now");
  const [showAllocate, setShowAllocate] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newAllocation, setNewAllocation] = useState({ employeeCode: "", productCode: "", productName: "", batchNumber: "", qtyIssued: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [allocResponse, distResponse] = await Promise.all([
        apiClient.sampleAllocations(),
        apiClient.sampleDistribution()
      ]);
      setAllocations(allocResponse.data ?? []);
      setDistribution(distResponse);
      setSelectedId((prev) => prev ?? allocResponse.data?.[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load sample distribution data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const months = useMemo(() => Array.from(new Set(allocations.map((a) => a.month))).sort().reverse(), [allocations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allocations.filter((s) => {
      if (monthFilter !== "all" && s.month !== monthFilter) return false;
      if (!q) return true;
      return (
        s.productName.toLowerCase().includes(q) ||
        s.productCode.toLowerCase().includes(q) ||
        (s.employeeName ?? "").toLowerCase().includes(q) ||
        s.employeeCode.toLowerCase().includes(q) ||
        (s.batchNumber ?? "").toLowerCase().includes(q) ||
        s.allocationId.toLowerCase().includes(q)
      );
    });
  }, [allocations, search, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selected = allocations.find((a) => a.id === selectedId) ?? allocations[0] ?? null;
  const selectedProductBalance = selected ? distribution?.byProduct.find((p) => p.productCode === selected.productCode) : undefined;
  const selectedRepBalance = selected ? distribution?.byRep.find((r) => r.employeeCode === selected.employeeCode) : undefined;

  function resetFilters() {
    setSearch("");
    setMonthFilter("all");
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "sample-distribution-ledger.csv",
      filtered.map((s) => ({
        "Allocation ID": s.allocationId,
        "Employee": s.employeeName ?? s.employeeCode,
        "Employee Code": s.employeeCode,
        "Product": s.productName,
        "Product Code": s.productCode,
        "Batch Number": s.batchNumber ?? "",
        "Qty Issued": s.qtyIssued,
        "Month": s.month,
        "Issued By": s.issuedBy ?? "",
        "Notes": s.notes ?? "",
        "Created At": s.createdAt ?? ""
      }))
    );
  }

  async function handleAllocate() {
    if (!newAllocation.employeeCode.trim() || !newAllocation.productCode.trim() || !newAllocation.productName.trim() || !newAllocation.qtyIssued.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await apiClient.issueSampleAllocation({
        employeeCode: newAllocation.employeeCode.trim(),
        productCode: newAllocation.productCode.trim(),
        productName: newAllocation.productName.trim(),
        batchNumber: newAllocation.batchNumber.trim() || undefined,
        qtyIssued: Number(newAllocation.qtyIssued) || 0,
        notes: newAllocation.notes.trim() || undefined
      });
      setShowAllocate(false);
      setNewAllocation({ employeeCode: "", productCode: "", productName: "", batchNumber: "", qtyIssued: "", notes: "" });
      await loadAll();
      setPage(1);
    } catch (allocError) {
      setSaveError(allocError instanceof Error ? allocError.message : "Unable to issue sample allocation");
    } finally {
      setSaving(false);
    }
  }

  const totals = distribution?.totals;

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
<select
  className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer"
  value={monthFilter}
  onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
>
  <option value="all">All Months</option>
  {months.map((m) => <option key={m} value={m}>{m}</option>)}
</select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<button
  className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs"
  title="Refresh Telemetry"
  type="button"
  onClick={() => { setLastSynced("Depot Ledger Synced just now"); loadAll(); }}
>
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
<button
  className="relative w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs"
  title="Notifications"
  type="button"
  onClick={() => { setHasUnread(false); setDetail({ title: "Notifications", body: totals ? `Total Issued: ${totals.totalIssued}, Distributed: ${totals.totalDistributed}, Remaining: ${totals.totalRemaining}.` : "No distribution summary loaded yet." }); }}
>
<span className="material-symbols-outlined text-[18px]">notifications</span>
{hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b43403] ring-2 ring-white"></span>}
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
<span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-secondary text-xs font-medium">
{loading ? "Loading…" : error ? "Load Failed" : `${allocations.length} Allocation Records`}
</span>
</div>
</div>
<div className="flex flex-wrap items-center gap-2.5">
<button
  className="h-9 px-3.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  onClick={handleExport}
  disabled={filtered.length === 0}
>
<span className="material-symbols-outlined text-[17px] text-text-secondary">file_download</span>
<span>Export Form 13-A Ledger (CSV)</span>
</button>
<button
  className="h-9 px-4 rounded-lg bg-[#b43403] hover:bg-[#9a2c02] text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-orange-950/20 transition-all active:scale-[0.98]"
  type="button"
  onClick={() => setShowAllocate(true)}
>
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span>Allocate Sample Quota</span>
</button>
</div>
</div></div>

{error && (
  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">{error}</div>
)}

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{/* Card 1: Total Samples Issued */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Samples Issued</span>
<div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">science</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">{(totals?.totalIssued ?? 0).toLocaleString("en-IN")} Pks</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ width: totals && totals.totalIssued > 0 ? `${Math.min(100, (totals.totalDistributed / totals.totalIssued) * 100)}%` : "0%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span className="font-medium">{distribution?.month ?? ""}</span>
</div>
</div>
{/* Card 2: Total Distributed */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Distributed to Doctors</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">verified</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">{(totals?.totalDistributed ?? 0).toLocaleString("en-IN")} Pks</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ width: totals && totals.totalIssued > 0 ? `${Math.min(100, (totals.totalDistributed / totals.totalIssued) * 100)}%` : "0%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>of {(totals?.totalIssued ?? 0).toLocaleString("en-IN")} Issued</span>
</div>
</div>
{/* Card 3: Remaining */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Remaining MR Bag Stock</span>
<div className="w-8 h-8 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">hourglass_bottom</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">{(totals?.totalRemaining ?? 0).toLocaleString("en-IN")} Pks</span>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Issued minus dispensed</span>
</div>
</div>
{/* Card 4: Products Tracked */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Products / Reps Tracked</span>
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">gavel</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">{distribution?.byProduct.length ?? 0} / {distribution?.byRep.length ?? 0}</span>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>From apiClient.sampleDistribution()</span>
</div>
</div></div>
{/* Sub-Navigation Pill Tabs */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 px-4 py-1.5 shadow-sm flex items-center justify-between overflow-x-auto"><div className="flex items-center gap-2 shrink-0">
{TABS.map((t) => {
  const active = activeTab === t.key;
  return (
    <button
      key={t.key}
      type="button"
      onClick={() => setActiveTab(t.key)}
      className={active
        ? "relative py-2.5 px-3 text-xs font-bold text-[#b43403] flex items-center gap-2 border-b-2 border-[#b43403]"
        : "py-2.5 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg flex items-center gap-2 transition-colors"}
    >
      <span className="material-symbols-outlined text-[17px] text-text-muted">
        {t.key === "roster" ? "medication" : t.key === "receipts" ? "receipt_long" : t.key === "bagstock" ? "backpack" : "assignment_return"}
      </span>
      <span>{t.label}</span>
    </button>
  );
})}
</div>
<div className="hidden xl:flex items-center gap-1.5 text-xs text-text-muted pl-4">
<span className="material-symbols-outlined text-[15px]">sync</span>
<span>{lastSynced}</span>
</div></div>
{/* DUAL-PANE INTERACTIVE CONTENT */}
{activeTab !== "roster" ? (
  <div className="bg-surface-card rounded-xl border border-border-subtle/80 p-8 shadow-sm text-center text-xs text-text-muted">
    No dedicated data view is wired up for &quot;{TABS.find((t) => t.key === activeTab)?.label}&quot; yet — there is no backend collection for it. Switch back to the Sample Allocation Roster tab to see live data.
  </div>
) : (
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
{/* LEFT COLUMN: Allocation Roster Table (Col 8) */}
<div className="lg:col-span-8 flex flex-col space-y-4">
{/* Filters Strip */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3"><div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-text-muted focus-within:border-[#b43403] focus-within:ring-1 focus-within:ring-[#b43403]/20 transition-all">
<span className="material-symbols-outlined text-[17px]">search</span>
<input
  className="w-full text-xs bg-transparent text-text-secondary placeholder-slate-400 focus:outline-none border-none p-0"
  placeholder="Search Product, Employee, Batch No, Allocation ID..."
  type="text"
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
/>
</div>
<div className="flex items-center gap-2">
<button
  className="h-8 w-8 rounded-lg bg-surface-subtle border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors"
  title="Reset Filters"
  type="button"
  onClick={resetFilters}
>
<span className="material-symbols-outlined text-[17px]">restart_alt</span>
</button>
</div></div>
{/* Table Card */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left text-xs text-text-secondary"><thead className="bg-surface-subtle/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-text-secondary">
<tr>
<th className="py-3 px-3">Allocation &amp; Employee</th>
<th className="py-3 px-3">Product</th>
<th className="py-3 px-3">Batch No</th>
<th className="py-3 px-3">Qty Issued</th>
<th className="py-3 px-3">Month</th>
<th className="py-3 px-3">Issued By</th>
<th className="py-3 px-3 text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{loading && (
  <tr><td colSpan={7} className="py-10 px-3 text-center text-text-muted text-xs">Loading sample allocations…</td></tr>
)}
{!loading && pageRows.length === 0 && (
  <tr>
    <td colSpan={7} className="py-10 px-3 text-center text-text-muted text-xs">No allocations match the current search/filters.</td>
  </tr>
)}
{!loading && pageRows.map((s) => (
<tr key={s.id} className={selectedId === s.id ? "bg-orange-50/60 hover:bg-orange-50/80 transition-colors cursor-pointer" : "hover:bg-surface-subtle/80 transition-colors cursor-pointer"} onClick={() => setSelectedId(s.id)}>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className={selectedId === s.id ? "w-8 h-8 rounded-lg bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-xs" : "w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0"}>
{(s.employeeName ?? s.employeeCode).slice(0, 2).toUpperCase()}
</div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1.5">
<span>{s.employeeName ?? s.employeeCode}</span>
</div>
<span className="text-[11px] text-text-muted">{s.allocationId}</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">{s.productName}</span>
<span className="text-[10px] text-text-muted">{s.productCode}</span>
</div>
</td>
<td className="py-3 px-3 font-medium text-text-secondary">{s.batchNumber ?? "—"}</td>
<td className="py-3 px-3 font-semibold text-text-primary">{s.qtyIssued.toLocaleString("en-IN")} Pks</td>
<td className="py-3 px-3 font-medium text-text-secondary">{s.month}</td>
<td className="py-3 px-3 font-medium text-text-secondary">{s.issuedBy ?? "—"}</td>
<td className="py-3 px-3 text-right">
<button
  type="button"
  className="px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors"
  onClick={(e) => { e.stopPropagation(); setSelectedId(s.id); setDetail({
    title: `${s.productName} — ${s.allocationId}`,
    body: `Issued to ${s.employeeName ?? s.employeeCode} (${s.employeeCode})${s.batchNumber ? ` · Batch ${s.batchNumber}` : ""} · Qty ${s.qtyIssued.toLocaleString("en-IN")} Pks · Month: ${s.month}${s.issuedBy ? ` · Issued By: ${s.issuedBy}` : ""}${s.notes ? ` · Notes: ${s.notes}` : ""}${s.createdAt ? ` · Created: ${formatDate(s.createdAt)}` : ""}.`
  }); }}
>
Inspect
</button>
</td>
</tr>
))}
</tbody></table>
</div>
{/* Pagination Footer */}
<div className="p-3 bg-surface-subtle/80 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
<span>{filtered.length === 0 ? "No matching allocation records" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Allocation Records`}</span>
<div className="flex items-center gap-1">
<button
  className="w-7 h-7 rounded border border-border-subtle bg-surface-card text-text-muted hover:text-text-secondary flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  onClick={() => setPage((p) => Math.max(1, p - 1))}
  disabled={safePage <= 1}
>
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
<button
  key={n}
  className={n === safePage ? "w-7 h-7 rounded bg-[#b43403] text-white font-bold text-xs flex items-center justify-center shadow-xs" : "w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary font-medium text-xs flex items-center justify-center"}
  type="button"
  onClick={() => setPage(n)}
>
{n}
</button>
))}
<button
  className="w-7 h-7 rounded border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
  disabled={safePage >= totalPages}
>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
{/* RIGHT COLUMN: Selected Allocation Dossier (Col 4) */}
<div className="lg:col-span-4 flex flex-col space-y-4"><div className="bg-surface-card rounded-xl border border-border-subtle/80 p-5 shadow-sm space-y-4 relative">
{!selected && (
  <p className="text-xs text-text-muted py-6 text-center">Select an allocation from the table to see its dossier.</p>
)}
{selected && (
<>
{/* Batch Dossier Header */}
<div className="flex items-center justify-between border-b border-slate-100 pb-3">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sample Allocation Dossier</span>
<div className="font-display font-bold text-base text-text-primary">#{selected.allocationId}</div>
</div>
</div>
{/* SKU Card */}
<div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle/60 flex items-center gap-3">
<div className="w-12 h-12 rounded-xl bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-base shadow-sm shadow-orange-950/20 shrink-0">
{selected.productCode.slice(0, 2).toUpperCase()}
</div>
<div className="flex flex-col min-w-0">
<span className="font-display font-bold text-sm text-text-primary truncate">{selected.productName}</span>
<span className="text-xs text-text-secondary truncate">{selected.batchNumber ? `Batch ${selected.batchNumber}` : "No batch number"} • Month: {selected.month}</span>
<span className="text-[11px] text-text-muted truncate">Issued to {selected.employeeName ?? selected.employeeCode} ({selected.employeeCode})</span>
</div>
</div>
{/* Product Balance (real, from sampleDistribution) */}
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-display font-bold text-xs text-text-primary">Product Balance</span>
</div>
{selectedProductBalance ? (
<div className="space-y-2 text-xs">
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<span className="font-medium text-text-secondary">Total Issued</span>
<span className="font-bold text-text-primary">{selectedProductBalance.totalIssued.toLocaleString("en-IN")} Pks</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<span className="font-medium text-text-secondary">Total Distributed</span>
<span className="font-bold text-status-success">{selectedProductBalance.totalDistributed.toLocaleString("en-IN")} Pks</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<span className="font-medium text-text-secondary">Remaining</span>
<span className="font-bold text-status-warning">{selectedProductBalance.totalRemaining.toLocaleString("en-IN")} Pks</span>
</div>
</div>
) : (
<p className="text-[11px] text-text-muted">No aggregate balance found for this product in the current distribution report.</p>
)}
</div>
{/* Rep Balance (real, from sampleDistribution) */}
<div className="space-y-2.5 pt-1">
<span className="font-display font-bold text-xs text-text-primary">Rep Sample Balance</span>
{selectedRepBalance ? (
<div className="space-y-2 text-xs">
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Issued</span>
<span className="font-bold text-text-primary">{selectedRepBalance.totalIssued.toLocaleString("en-IN")} Pks</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ width: selectedRepBalance.totalIssued > 0 ? `${Math.min(100, (selectedRepBalance.totalDistributed / selectedRepBalance.totalIssued) * 100)}%` : "0%" }}></div>
</div>
</div>
<div className="flex justify-between text-[11px]">
<span className="text-text-secondary font-medium">Distributed</span>
<span className="font-bold text-status-success">{selectedRepBalance.totalDistributed.toLocaleString("en-IN")} Pks</span>
</div>
<div className="flex justify-between text-[11px]">
<span className="text-text-secondary font-medium">Remaining</span>
<span className="font-bold text-status-warning">{selectedRepBalance.totalRemaining.toLocaleString("en-IN")} Pks</span>
</div>
</div>
) : (
<p className="text-[11px] text-text-muted">No aggregate balance found for this rep in the current distribution report.</p>
)}
</div>
{/* Statutory UCPMP Compliance Guardrail Notice */}
<div className="p-2.5 rounded-lg bg-status-success-bg border border-status-success-bg text-[11px] text-emerald-800 space-y-1">
<div className="font-bold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px]">gavel</span>
<span>Statutory UCPMP Guardrail</span>
</div>
<p className="text-status-success leading-snug">
Sample distribution must not exceed prescribed pack limits per qualified physician per annum, per DCGI/UCPMP norms.
</p>
</div>
{/* Action CTAs */}
<div className="flex flex-col space-y-2 pt-1">
<button
  className="w-full h-9 rounded-lg bg-[#b43403] text-white text-xs font-semibold hover:bg-[#9a2c02] transition-colors flex items-center justify-center gap-2 shadow-xs"
  type="button"
  onClick={() => downloadCsv(`allocation-${selected.allocationId}.csv`, [{
    "Allocation ID": selected.allocationId, "Employee": selected.employeeName ?? selected.employeeCode, "Product": selected.productName,
    "Product Code": selected.productCode, "Batch Number": selected.batchNumber ?? "", "Qty Issued": selected.qtyIssued, "Month": selected.month,
    "Issued By": selected.issuedBy ?? "", "Notes": selected.notes ?? ""
  }])}
>
<span className="material-symbols-outlined text-[17px]">description</span>
<span>Download Statutory Form 13-A</span>
</button>
<button
  className="w-full h-9 rounded-lg border border-border-subtle bg-surface-subtle text-text-secondary text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2"
  type="button"
  onClick={() => setDetail({ title: "Physical Stock Audit Triggered", body: `A physical stock audit request has been logged for ${selected.employeeName ?? selected.employeeCode} holding ${selected.productName} bag stock. Session-only — there is no audit workflow collection yet.` })}
>
<span className="material-symbols-outlined text-[17px] text-text-secondary">inventory</span>
<span>Trigger Physical Stock Audit for MR</span>
</button>
</div>
</>
)}
</div></div>
</div>
)}
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
<button
  className="px-3.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-[#b43403] hover:bg-orange-100 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
  type="button"
  onClick={() => setDetail({ title: "Regulatory Norms — UCPMP & DCGI", body: "Sample distribution must not exceed prescribed pack limits per qualified physician per annum. All physical custody handovers require digital signature or verified OTP acknowledgement logged in the central ledger." })}
>
<span>View Regulatory Norms</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button></div>
</div>

    {showAllocate && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAllocate(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Allocate Sample Quota</h3>
          <div className="space-y-3">
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Employee Code *" value={newAllocation.employeeCode} onChange={(e) => setNewAllocation((s) => ({ ...s, employeeCode: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Product Code *" value={newAllocation.productCode} onChange={(e) => setNewAllocation((s) => ({ ...s, productCode: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Product Name *" value={newAllocation.productName} onChange={(e) => setNewAllocation((s) => ({ ...s, productName: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Batch Number" value={newAllocation.batchNumber} onChange={(e) => setNewAllocation((s) => ({ ...s, batchNumber: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Quantity Issued (packs) *" type="number" value={newAllocation.qtyIssued} onChange={(e) => setNewAllocation((s) => ({ ...s, qtyIssued: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Notes" value={newAllocation.notes} onChange={(e) => setNewAllocation((s) => ({ ...s, notes: e.target.value }))} />
          </div>
          {saveError && <p className="text-[11px] text-rose-600">{saveError}</p>}
          <p className="text-[11px] text-text-muted">This calls the real POST /company/sample-allocations endpoint and persists the allocation to the backend.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowAllocate(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a2c02] disabled:opacity-50" disabled={saving || !newAllocation.employeeCode.trim() || !newAllocation.productCode.trim() || !newAllocation.productName.trim() || !newAllocation.qtyIssued.trim()} onClick={handleAllocate}>{saving ? "Allocating…" : "Allocate"}</button>
          </div>
        </div>
      </div>
    )}

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
