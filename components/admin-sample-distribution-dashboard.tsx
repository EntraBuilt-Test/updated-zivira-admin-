"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component: none of its
// buttons/selects/inputs had a handler (search, the two territory selects,
// the category/stock-status filters, Reset, Export, Allocate Sample Quota,
// row action buttons, pagination, the sub-nav pills, refresh/notification
// icons, or the dossier action buttons did anything). The demo KPI numbers
// on the 4 pulse cards are left untouched (no backend collection exists yet
// for sample batches), but the SKU roster table itself is now real local
// state: search + both filters + Reset actually filter it, Export downloads
// exactly what's on screen as CSV, Allocate Sample Quota adds a real row
// (session-only), pagination reflects the real filtered count, and every
// row/detail button opens a real read-only popup built from that row's own
// data instead of doing nothing.

type Sample = {
  id: string;
  code: string;
  name: string;
  molecule: string;
  category: "Cardiology" | "Diabetology" | "Pulmonology" | "Orthopedics" | "Gastroenterology";
  territory: string;
  batchNo: string;
  expiry: string;
  nearExpiry: boolean;
  quota: number;
  dispensed: string;
  dispensedPct: string;
  bagStock: string;
  custodyStatus: "Compliant" | "Near Expiry";
  actionLabel: "Active" | "Inspect" | "Recall / Audit";
};

const initialSamples: Sample[] = [
  {
    id: "s1", code: "CC", name: "CardioCare 20mg", molecule: "Atorvastatin 20mg + Aspirin Tab",
    category: "Cardiology", territory: "West Zone (Mumbai HQ)", batchNo: "#CC-902", expiry: "May 2028", nearExpiry: false,
    quota: 14500, dispensed: "13,820", dispensedPct: "95.3%", bagStock: "680 Pks", custodyStatus: "Compliant", actionLabel: "Active"
  },
  {
    id: "s2", code: "GZ", name: "GlycoZiv XR 500", molecule: "Metformin 500mg + Dapagliflozin",
    category: "Diabetology", territory: "North Division (Delhi & NCR)", batchNo: "#GZ-418", expiry: "Aug 2027", nearExpiry: false,
    quota: 12000, dispensed: "11,640", dispensedPct: "97.0%", bagStock: "360 Pks", custodyStatus: "Compliant", actionLabel: "Inspect"
  },
  {
    id: "s3", code: "RC", name: "Resp-Clear Inhaler 200", molecule: "Budesonide + Formoterol Inhaler",
    category: "Pulmonology", territory: "South Hub (Bengaluru HQ)", batchNo: "#RC-104", expiry: "Jan 2028", nearExpiry: false,
    quota: 8200, dispensed: "7,850", dispensedPct: "95.7%", bagStock: "350 Pks", custodyStatus: "Compliant", actionLabel: "Inspect"
  },
  {
    id: "s4", code: "ZC", name: "ZiviCal D3 Forte", molecule: "Cholecalciferol 60,000 IU Softgels",
    category: "Orthopedics", territory: "Eastern Coast (Kolkata)", batchNo: "#ZC-332", expiry: "Oct 2027", nearExpiry: false,
    quota: 7500, dispensed: "7,120", dispensedPct: "94.9%", bagStock: "380 Pks", custodyStatus: "Compliant", actionLabel: "Inspect"
  },
  {
    id: "s5", code: "GD", name: "GastroZiv DSR", molecule: "Rabeprazole 20mg + Domperidone 30mg",
    category: "Gastroenterology", territory: "North Division (Delhi & NCR)", batchNo: "#GD-619", expiry: "Nov 2026", nearExpiry: true,
    quota: 6090, dispensed: "5,860", dispensedPct: "96.2%", bagStock: "230 Pks", custodyStatus: "Near Expiry", actionLabel: "Recall / Audit"
  }
];

const TERRITORIES = [
  "All Territories (Pan-India HQ)",
  "North Division (Delhi & NCR)",
  "West Zone (Mumbai HQ)",
  "South Hub (Bengaluru HQ)",
  "Eastern Coast (Kolkata)"
];

const CATEGORIES = ["All Therapeutic Categories", "Cardiology", "Diabetology", "Pulmonology", "Orthopedics", "Gastroenterology"];

const STOCK_STATUSES = ["Stock Status: All", "Sufficient Depot Stock", "Near Expiry (<60 Days)", "Quota Exhausted"];

const TABS = [
  { key: "roster", label: "Active Sample Roster & Inventory", count: "16 SKUs" },
  { key: "receipts", label: "Physician Dispensation Receipts & OTP Audit", count: "47.7k Validated" },
  { key: "bagstock", label: "MR Bag Stock & Depot Reconciliation", count: null },
  { key: "recalls", label: "Batch Recall & Damaged Goods Ledger", count: "1 Pending" }
] as const;

const PAGE_SIZE = 2;

export function AdminSampleDistributionDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [search, setSearch] = useState("");
  const [territory, setTerritory] = useState(TERRITORIES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stockStatus, setStockStatus] = useState(STOCK_STATUSES[0]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("roster");
  const [hasUnread, setHasUnread] = useState(true);
  const [lastSynced, setLastSynced] = useState("Depot Ledger Synced 8m ago");
  const [showAllocate, setShowAllocate] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [newSample, setNewSample] = useState({ name: "", molecule: "", category: CATEGORIES[1], quota: "" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return samples.filter((s) => {
      if (territory !== TERRITORIES[0] && s.territory !== territory) return false;
      if (category !== CATEGORIES[0] && s.category !== category) return false;
      if (stockStatus === "Sufficient Depot Stock" && s.custodyStatus !== "Compliant") return false;
      if (stockStatus === "Near Expiry (<60 Days)" && !s.nearExpiry) return false;
      if (stockStatus === "Quota Exhausted") return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.molecule.toLowerCase().includes(q) ||
        s.batchNo.toLowerCase().includes(q)
      );
    });
  }, [samples, search, territory, category, stockStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setTerritory(TERRITORIES[0]);
    setCategory(CATEGORIES[0]);
    setStockStatus(STOCK_STATUSES[0]);
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "sample-distribution-ledger.csv",
      filtered.map((s) => ({
        "SKU": s.name,
        "Molecule": s.molecule,
        "Category": s.category,
        "Territory": s.territory,
        "Batch No": s.batchNo,
        "Expiry": s.expiry,
        "Depot Quota": s.quota,
        "Dispensed to HCPs": s.dispensed,
        "Dispensed %": s.dispensedPct,
        "MR Bag Stock": s.bagStock,
        "Custody Status": s.custodyStatus
      }))
    );
  }

  function handleAllocate() {
    if (!newSample.name.trim() || !newSample.quota.trim()) return;
    const code = newSample.name.trim().slice(0, 2).toUpperCase();
    setSamples((prev) => [
      ...prev,
      {
        id: `s${prev.length + 1}-${Date.now()}`,
        code,
        name: newSample.name.trim(),
        molecule: newSample.molecule.trim() || "—",
        category: newSample.category as Sample["category"],
        territory: TERRITORIES[0],
        batchNo: "—",
        expiry: "—",
        nearExpiry: false,
        quota: Number(newSample.quota) || 0,
        dispensed: "0",
        dispensedPct: "0.0%",
        bagStock: "0 Pks",
        custodyStatus: "Compliant",
        actionLabel: "Inspect"
      }
    ]);
    setShowAllocate(false);
    setNewSample({ name: "", molecule: "", category: CATEGORIES[1], quota: "" });
    setPage(totalPages + 1);
  }

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
  value={territory}
  onChange={(e) => { setTerritory(e.target.value); setPage(1); }}
>
  {TERRITORIES.map((t) => <option key={t}>{t}</option>)}
</select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<div className="relative">
<select
  className="h-8 pl-3 pr-8 text-xs font-medium bg-surface-subtle border border-border-subtle rounded-lg text-text-secondary hover:border-border-subtle focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer"
  value={territory}
  onChange={(e) => { setTerritory(e.target.value); setPage(1); }}
>
  {TERRITORIES.map((t) => <option key={t}>{t}</option>)}
</select>
<span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">expand_more</span>
</div>
<button
  className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs"
  title="Refresh Telemetry"
  type="button"
  onClick={() => setLastSynced("Depot Ledger Synced just now")}
>
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
<button
  className="relative w-8 h-8 rounded-lg border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors shadow-xs"
  title="Notifications"
  type="button"
  onClick={() => { setHasUnread(false); setDetail({ title: "Notifications", body: "No new alerts. Batch Discrepancies: 0 Critical, Form 13-A Filing: Up to Date." }); }}
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
<span className="px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-xs font-semibold flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
UCPMP Compliant Batch Tracking
</span>
<span className="px-2.5 py-0.5 rounded-full bg-status-info-bg text-blue-600 border border-border-subtle text-xs font-medium">
Batch Discrepancies: 0 Critical
</span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-secondary text-xs font-medium">
Form 13-A Filing: Up to Date
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
<span>Export Form 13-A Ledger (CSV/PDF)</span>
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
{/* 4-Column Executive Pulse KPI Metric Cards */}

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{/* Card 1: Total Samples Dispensed */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Samples Dispensed</span>
<div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">science</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">48,290 Pks</span>
<span className="text-xs font-semibold text-emerald-600 flex items-center">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +6.4% MoM
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "96.6%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span className="font-medium">Quota: 50,000 Pks</span>
<span className="text-[#b43403] font-semibold">96.6% Fulfillment</span>
</div>
</div>
{/* Card 2: Physician Acknowledgements */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Physician Acknowledgements (OTP/SIG)</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">verified</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">98.8%</span>
<span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">schedule</span> 580 Pending
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ "width": "98.8%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>47,710 of 48,290 Validated</span>
<span className="text-status-success font-semibold">98.8% Signed Off</span>
</div>
</div>
{/* Card 3: Expiry & Retrieval Buffer */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Expiry &amp; Retrieval Buffer</span>
<div className="w-8 h-8 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">hourglass_bottom</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">142 Pks</span>
<span className="text-xs font-semibold text-amber-600 flex items-center">
&lt;60 Days Window
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-amber-600 h-full rounded-full" style={{ "width": "28%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Quarantined &amp; Logged</span>
<span className="text-text-muted font-medium">0 Waste Breaches</span>
</div>
</div>
{/* Card 4: UCPMP Statutory Adherence */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-4 shadow-sm flex flex-col justify-between space-y-3">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">UCPMP Limit Adherence</span>
<div className="w-8 h-8 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">gavel</span>
</div>
</div>
<div>
<div className="flex items-baseline gap-2">
<span className="font-display text-2xl font-bold text-text-primary">99.9%</span>
<span className="text-xs font-semibold text-emerald-600">
≤12 Pks/Dr/Yr
</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-blue-600 h-full rounded-full" style={{ "width": "99.9%" }}></div>
</div>
</div>
<div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-slate-100">
<span>Statutory Guardrail</span>
<span className="text-status-success font-semibold">Zero Violations</span>
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
      {t.count && (
        <span className={active
          ? "px-1.5 py-0.2 rounded-full bg-[#b43403] text-white text-[10px] font-semibold"
          : t.key === "recalls"
            ? "px-1.5 py-0.2 rounded-full bg-status-warning-bg text-status-warning border border-status-warning-bg text-[10px] font-bold"
            : "px-1.5 py-0.2 rounded-full bg-surface-subtle text-text-secondary text-[10px] font-semibold"}>
          {t.count}
        </span>
      )}
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
    No dedicated data view is wired up for &quot;{TABS.find((t) => t.key === activeTab)?.label}&quot; yet — there is no backend collection for it. Switch back to the Active Sample Roster tab to see live data.
  </div>
) : (
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
{/* LEFT COLUMN: Supervisory Roster Table (Col 8) */}
<div className="lg:col-span-8 flex flex-col space-y-4">
{/* Filters Strip */}
<div className="bg-surface-card rounded-xl border border-border-subtle/80 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3"><div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-text-muted focus-within:border-[#b43403] focus-within:ring-1 focus-within:ring-[#b43403]/20 transition-all">
<span className="material-symbols-outlined text-[17px]">search</span>
<input
  className="w-full text-xs bg-transparent text-text-secondary placeholder-slate-400 focus:outline-none border-none p-0"
  placeholder="Search SKU, Batch No, Molecule..."
  type="text"
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
/>
</div>
<div className="flex items-center gap-2">
<select
  className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer"
  value={category}
  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
>
  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
</select>
<select
  className="h-8 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-[#b43403] cursor-pointer"
  value={stockStatus}
  onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
>
  {STOCK_STATUSES.map((s) => <option key={s}>{s}</option>)}
</select>
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
<th className="py-3 px-3 w-8 text-center">
<input className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox" readOnly checked={pageRows.length > 0 && pageRows.every((r) => r.actionLabel === "Active")}/>
</th>
<th className="py-3 px-3">SKU &amp; Molecule</th>
<th className="py-3 px-3">Therapeutic Class</th>
<th className="py-3 px-3">Batch No &amp; Expiry</th>
<th className="py-3 px-3">Depot Quota</th>
<th className="py-3 px-3">Dispensed to HCPs</th>
<th className="py-3 px-3">MR Bag Stock</th>
<th className="py-3 px-3">Custody Status</th>
<th className="py-3 px-3 text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{pageRows.length === 0 && (
  <tr>
    <td colSpan={9} className="py-10 px-3 text-center text-text-muted text-xs">No samples match the current search/filters.</td>
  </tr>
)}
{pageRows.map((s) => (
<tr key={s.id} className={s.actionLabel === "Active" ? "bg-orange-50/60 hover:bg-orange-50/80 transition-colors cursor-pointer" : s.custodyStatus === "Near Expiry" ? "bg-status-warning-bg/40 hover:bg-status-warning-bg/70 transition-colors cursor-pointer" : "hover:bg-surface-subtle/80 transition-colors cursor-pointer"}>
<td className="py-3 px-3 text-center">
<input defaultChecked={s.actionLabel === "Active"} className="rounded border-border-subtle text-[#b43403] focus:ring-[#b43403]" type="checkbox"/>
</td>
<td className="py-3 px-3">
<div className="flex items-center gap-2.5">
<div className={s.actionLabel === "Active" ? "w-8 h-8 rounded-lg bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-xs" : s.custodyStatus === "Near Expiry" ? "w-8 h-8 rounded-lg bg-amber-100 text-status-warning flex items-center justify-center font-display font-bold text-xs shrink-0" : "w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center font-display font-bold text-xs shrink-0"}>
{s.code}
</div>
<div>
<div className="font-semibold text-text-primary flex items-center gap-1.5">
<span>{s.name}</span>
{s.actionLabel === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-[#b43403]" title="Active Selection"></span>}
{s.custodyStatus === "Near Expiry" && <span className="material-symbols-outlined text-[14px] text-amber-600" title="Expiry Approaching">warning</span>}
</div>
<span className="text-[11px] text-text-muted">{s.molecule}</span>
</div>
</div>
</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded-md bg-status-info-bg text-blue-600 font-medium text-[11px]">{s.category}</span>
</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-bold text-text-primary">{s.batchNo}</span>
<span className={s.nearExpiry ? "text-[10px] text-status-warning font-semibold" : "text-[10px] text-text-muted"}>Exp: {s.expiry}{s.nearExpiry ? " (<60d)" : ""}</span>
</div>
</td>
<td className="py-3 px-3 font-semibold text-text-primary">{s.quota.toLocaleString()} Pks</td>
<td className="py-3 px-3">
<div className="flex items-center gap-1.5">
<span className="font-bold text-text-primary">{s.dispensed}</span>
<span className={s.custodyStatus === "Near Expiry" ? "px-1.5 py-0.5 rounded-full bg-status-warning-bg text-status-warning text-[10px] font-bold" : "px-1.5 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold"}>{s.dispensedPct}</span>
</div>
</td>
<td className={s.custodyStatus === "Near Expiry" ? "py-3 px-3 font-medium text-status-warning font-bold" : "py-3 px-3 font-medium text-text-secondary"}>{s.bagStock}</td>
<td className="py-3 px-3">
<span className={s.custodyStatus === "Near Expiry" ? "px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning border border-status-warning-bg text-[10px] font-bold" : "px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold"}>
{s.custodyStatus === "Near Expiry" ? "Near Expiry" : "Compliant"}
</span>
</td>
<td className="py-3 px-3 text-right">
<button
  type="button"
  className={s.actionLabel === "Active" ? "px-2.5 py-1 rounded-md bg-[#b43403] text-white font-semibold text-xs hover:bg-[#9a2c02] transition-colors shadow-xs" : s.actionLabel === "Recall / Audit" ? "px-2.5 py-1 rounded-md bg-amber-100 text-status-warning font-semibold text-xs hover:bg-amber-200 transition-colors" : "px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary font-medium text-xs hover:bg-slate-200 transition-colors"}
  onClick={() => setDetail({
    title: `${s.name} — ${s.actionLabel === "Recall / Audit" ? "Recall / Audit" : "Batch Custody"}`,
    body: `Batch ${s.batchNo} (Exp: ${s.expiry}) · ${s.category} · Territory: ${s.territory} · Depot Quota ${s.quota.toLocaleString()} Pks, Dispensed ${s.dispensed} (${s.dispensedPct}) · MR Bag Stock ${s.bagStock} · Status: ${s.custodyStatus}.`
  })}
>
{s.actionLabel}
</button>
</td>
</tr>
))}
</tbody></table>
</div>
{/* Pagination Footer */}
<div className="p-3 bg-surface-subtle/80 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
<span>{filtered.length === 0 ? "No matching SKU batches" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Core SKU Batches`}</span>
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
{/* RIGHT COLUMN: Selected Supervisor Dossier (Col 4) */}
<div className="lg:col-span-4 flex flex-col space-y-4"><div className="bg-surface-card rounded-xl border border-border-subtle/80 p-5 shadow-sm space-y-4 relative">
{/* Batch Dossier Header */}
<div className="flex items-center justify-between border-b border-slate-100 pb-3">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sample Batch Dossier</span>
<div className="font-display font-bold text-base text-text-primary">#SKU-CC-20MG</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-status-success-bg text-status-success border border-status-success-bg text-xs font-bold flex items-center gap-1 shadow-xs">
<span className="material-symbols-outlined text-[14px]">verified</span> UCPMP Certified
</span>
</div>
{/* SKU Card */}
<div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle/60 flex items-center gap-3">
<div className="w-12 h-12 rounded-xl bg-[#b43403] text-white flex items-center justify-center font-display font-bold text-base shadow-sm shadow-orange-950/20 shrink-0">
CC
</div>
<div className="flex flex-col min-w-0">
<span className="font-display font-bold text-sm text-text-primary truncate">CardioCare 20mg</span>
<span className="text-xs text-text-secondary truncate">Batch #CC-902 • Exp: May 2028</span>
<span className="text-[11px] text-text-muted truncate">Atorvastatin 20mg + Aspirin 75mg Capsule</span>
</div>
</div>
{/* Batch Custody & Reconciliation Metric */}
<div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-50/70 to-slate-50 border border-orange-200/60 flex items-center justify-between">
<div className="space-y-0.5">
<span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Field Custody Match</span>
<div className="font-display font-bold text-xl text-text-primary">13,820 Pks</div>
<span className="text-xs text-text-secondary">Dispensed of 14,500 Quota (95.3%)</span>
</div>
<div className="w-14 h-14 relative flex items-center justify-center shrink-0">
<svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-orange-200/70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-[#b43403]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="95, 100" strokeWidth="3.5"></path>
</svg>
<span className="absolute font-display font-bold text-xs text-[#b43403]">95.3%</span>
</div>
</div>
{/* Depot to Field Custody Flow */}
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-display font-bold text-xs text-text-primary">Depot-to-Field Flow Audit</span>
<span className="text-[11px] text-status-success font-semibold">100% In-Transit Match</span>
</div>
<div className="space-y-2 text-xs">
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-text-secondary">warehouse</span>
<span className="font-medium text-text-secondary">Central Depot Dispense</span>
</div>
<span className="font-bold text-text-primary">14,500 Pks</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-text-secondary">local_shipping</span>
<span className="font-medium text-text-secondary">Received by 428 Field MRs</span>
</div>
<span className="font-bold text-text-primary">14,500 Pks</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle/60 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
<span className="font-medium text-text-secondary">HCP OTP / Signed Receipts</span>
</div>
<span className="font-bold text-status-success">13,820 Pks (98.9%)</span>
</div>
</div>
</div>
{/* Top Prescriber Allocation Split */}
<div className="space-y-2.5 pt-1">
<span className="font-display font-bold text-xs text-text-primary">Top Prescriber Specialty Allocation</span>
<div className="space-y-2 text-xs">
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Interventional Cardiologists</span>
<span className="font-bold text-text-primary">8,420 Pks (61%)</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "61%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Consulting Physicians (MD Medicine)</span>
<span className="font-bold text-text-primary">4,200 Pks (30%)</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "30%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between pb-1 text-[11px]">
<span className="text-text-secondary font-medium">Diabetologists &amp; Endocrine Clinics</span>
<span className="font-bold text-text-primary">1,200 Pks (9%)</span>
</div>
<div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-[#b43403] h-full rounded-full" style={{ "width": "9%" }}></div>
</div>
</div>
</div>
</div>
{/* Statutory UCPMP Compliance Guardrail Notice */}
<div className="p-2.5 rounded-lg bg-status-success-bg border border-status-success-bg text-[11px] text-emerald-800 space-y-1">
<div className="font-bold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px]">gavel</span>
<span>Statutory UCPMP Guardrail</span>
</div>
<p className="text-status-success leading-snug">
Strict limit of ≤12 packs/doctor/year enforced via 2D Barcode Scan &amp; OTP verification. Zero sample sale warning stamped on foil pack.
</p>
</div>
{/* Action CTAs */}
<div className="flex flex-col space-y-2 pt-1">
<button
  className="w-full h-9 rounded-lg bg-[#b43403] text-white text-xs font-semibold hover:bg-[#9a2c02] transition-colors flex items-center justify-center gap-2 shadow-xs"
  type="button"
  onClick={() => downloadCsv("form-13a-cardiocare.csv", [{
    "SKU": "CardioCare 20mg", "Batch No": "#CC-902", "Depot Quota": 14500, "Dispensed": "13,820", "Dispensed %": "95.3%", "Custody Status": "Compliant"
  }])}
>
<span className="material-symbols-outlined text-[17px]">description</span>
<span>Download Statutory Form 13-A</span>
</button>
<button
  className="w-full h-9 rounded-lg border border-border-subtle bg-surface-subtle text-text-secondary text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2"
  type="button"
  onClick={() => setDetail({ title: "Physical Stock Audit Triggered", body: "A physical stock audit request has been logged for all field MRs holding CardioCare 20mg bag stock. Session-only — there is no audit workflow collection yet." })}
>
<span className="material-symbols-outlined text-[17px] text-text-secondary">inventory</span>
<span>Trigger Physical Stock Audit for MRs</span>
</button>
</div>
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
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="SKU name *" value={newSample.name} onChange={(e) => setNewSample((s) => ({ ...s, name: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Molecule / composition" value={newSample.molecule} onChange={(e) => setNewSample((s) => ({ ...s, molecule: e.target.value }))} />
            <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={newSample.category} onChange={(e) => setNewSample((s) => ({ ...s, category: e.target.value }))}>
              {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Depot quota (packs) *" type="number" value={newSample.quota} onChange={(e) => setNewSample((s) => ({ ...s, quota: e.target.value }))} />
          </div>
          <p className="text-[11px] text-text-muted">Saved to this table for the current session. There is no sample batch database collection yet, so this does not persist after a page reload.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowAllocate(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a2c02] disabled:opacity-50" disabled={!newSample.name.trim() || !newSample.quota.trim()} onClick={handleAllocate}>Allocate</button>
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
