"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Item 3/4 fix — this page used to be a fully static server component: every
// number was hand-typed JSX and not a single one of its 21 buttons/selects
// had an onClick/onChange handler (Export, Register, search, the two
// dropdown filters, Reset, the 7 jurisdiction pills, pagination, Tax
// Ledger / E-Way Bills / View All / Prepare / Details, and the GSTIN
// validator all did nothing when clicked). The demo numbers on the KPI
// cards are left as-is per instruction (no backend collection exists yet
// for depots/GSTINs), but the depot table itself is now real local state:
// search, both dropdowns, the jurisdiction pills and Reset actually filter
// it, Export downloads exactly what's on screen as CSV, Register New
// Branch/Depot adds a real row to the table (kept in this session), the
// pagination controls reflect the real filtered count instead of a fake
// "28", and the GSTIN validator runs the actual GSTIN checksum format
// check instead of only ever showing a hidden "verified" box.

type Depot = {
  id: string;
  code: string;
  name: string;
  location: string;
  gstin: string;
  stateCode: string;
  stateName: string;
  areaSqFt: string;
  coldChainLabel: string;
  coldChainVariant: "cold" | "ambient";
  mtdSales: string;
  achievement: string;
  achievementTrend: "up" | "flat";
  leaderInitials: string;
  leaderName: string;
  leaderTitle: string;
  status: "GSTR-1 Synced" | "Audit Ready" | "GSTR-3B Pending";
  type: "Super-Depot" | "C&F Agent Hub" | "Consignment Stockist";
};

const initialDepots: Depot[] = [
  {
    id: "d1", code: "MH", name: "Mumbai Central Depot", location: "Bhiwandi Hub, MH",
    gstin: "27AABCZ1234F1Z5", stateCode: "27", stateName: "Maharashtra",
    areaSqFt: "45,000 sq ft", coldChainLabel: "Cold-Chain Active", coldChainVariant: "cold",
    mtdSales: "₹3.42 Cr", achievement: "98.4% Achv", achievementTrend: "up",
    leaderInitials: "RK", leaderName: "Rajesh Kulkarni", leaderTitle: "VP - West Logistics",
    status: "GSTR-1 Synced", type: "Super-Depot"
  },
  {
    id: "d2", code: "KA", name: "Bengaluru Distribution Hub", location: "Peenya Industrial, KA",
    gstin: "29AABCZ1234F1Z3", stateCode: "29", stateName: "Karnataka",
    areaSqFt: "32,000 sq ft", coldChainLabel: "Pharma Cold", coldChainVariant: "cold",
    mtdSales: "₹2.85 Cr", achievement: "104.2% Achv", achievementTrend: "up",
    leaderInitials: "SB", leaderName: "Suresh Babu", leaderTitle: "AVP - South Operations",
    status: "GSTR-1 Synced", type: "C&F Agent Hub"
  },
  {
    id: "d3", code: "DL", name: "Delhi North Super-Depot", location: "Okhla Phase II, DL",
    gstin: "07AABCZ1234F1Z9", stateCode: "07", stateName: "Delhi NCR",
    areaSqFt: "38,000 sq ft", coldChainLabel: "Ambient & Cool", coldChainVariant: "ambient",
    mtdSales: "₹3.10 Cr", achievement: "92.1% Achv", achievementTrend: "flat",
    leaderInitials: "AS", leaderName: "Amitav Sen", leaderTitle: "Zonal Director - North",
    status: "Audit Ready", type: "Super-Depot"
  },
  {
    id: "d4", code: "GJ", name: "Ahmedabad Logistics Hub", location: "Sanand GIDC, GJ",
    gstin: "24AABCZ1234F1Z2", stateCode: "24", stateName: "Gujarat",
    areaSqFt: "28,000 sq ft", coldChainLabel: "Dual-Temp Certified", coldChainVariant: "cold",
    mtdSales: "₹2.15 Cr", achievement: "101.8% Achv", achievementTrend: "up",
    leaderInitials: "BP", leaderName: "Bhavesh Patel", leaderTitle: "Regional Logistics Head",
    status: "GSTR-1 Synced", type: "Consignment Stockist"
  },
  {
    id: "d5", code: "WB", name: "Kolkata Metro C&F Depot", location: "Dankuni Complex, WB",
    gstin: "19AABCZ1234F1Z7", stateCode: "19", stateName: "West Bengal",
    areaSqFt: "25,000 sq ft", coldChainLabel: "Cold Chain Verified", coldChainVariant: "cold",
    mtdSales: "₹1.88 Cr", achievement: "96.5% Achv", achievementTrend: "flat",
    leaderInitials: "SR", leaderName: "Subir Roy", leaderTitle: "East Logistics Manager",
    status: "GSTR-3B Pending", type: "C&F Agent Hub"
  }
];

const JURISDICTIONS: { label: string; stateCode: string | "all" }[] = [
  { label: "All Jurisdictions", stateCode: "all" },
  { label: "Maharashtra", stateCode: "27" },
  { label: "Karnataka", stateCode: "29" },
  { label: "Delhi NCR", stateCode: "07" },
  { label: "Gujarat", stateCode: "24" },
  { label: "Tamil Nadu", stateCode: "33" },
  { label: "West Bengal", stateCode: "19" }
];

const PAGE_SIZE = 5;

// Real GSTIN format/checksum validation (15 chars: 2-digit state code,
// 10-char PAN, 1-digit entity code, "Z", 1 checksum char computed with the
// GSTIN mod-36 algorithm) — this replaces the old always-hidden result box.
function validateGstin(raw: string): { valid: boolean; reason: string } {
  const gstin = raw.trim().toUpperCase();
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z]\d[A-Z]$/.test(gstin)) {
    return { valid: false, reason: "Format must be 2-digit state code + 10-char PAN + entity code + Z + checksum (e.g. 27AABCZ1234F1Z5)." };
  }
  const codes = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const factor = [1, 2];
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const code = codes.indexOf(gstin[i]);
    const prod = code * factor[i % 2];
    sum += Math.floor(prod / 36) + (prod % 36);
  }
  const checksum = codes[(36 - (sum % 36)) % 36];
  if (checksum !== gstin[14]) {
    return { valid: false, reason: `Checksum mismatch — expected "${checksum}", got "${gstin[14]}". Re-check the GSTIN.` };
  }
  return { valid: true, reason: `Valid GSTIN — state code ${gstin.slice(0, 2)}.` };
}

export function AdminBranchesDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [depots, setDepots] = useState<Depot[]>(initialDepots);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Depot["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Depot["status"]>("all");
  const [jurisdiction, setJurisdiction] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showRegister, setShowRegister] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [gstinInput, setGstinInput] = useState("");
  const [gstinResult, setGstinResult] = useState<{ valid: boolean; reason: string } | null>(null);
  const [newDepot, setNewDepot] = useState({ name: "", location: "", gstin: "", stateCode: "", stateName: "", leaderName: "", leaderTitle: "" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return depots.filter((d) => {
      if (jurisdiction !== "all" && d.stateCode !== jurisdiction) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.gstin.toLowerCase().includes(q) ||
        d.leaderName.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    });
  }, [depots, search, typeFilter, statusFilter, jurisdiction]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setJurisdiction("all");
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "branches-gst-depots.csv",
      filtered.map((d) => ({
        "Depot Code": d.code,
        "Depot Name": d.name,
        "Location": d.location,
        "GSTIN": d.gstin,
        "State": d.stateName,
        "Area": d.areaSqFt,
        "Cold Chain": d.coldChainLabel,
        "MTD Sales": d.mtdSales,
        "Achievement": d.achievement,
        "Branch Leader": d.leaderName,
        "Leader Title": d.leaderTitle,
        "Status": d.status,
        "Type": d.type
      }))
    );
  }

  function handleRegister() {
    if (!newDepot.name.trim() || !newDepot.gstin.trim()) return;
    const code = (newDepot.stateCode || newDepot.name.slice(0, 2)).toUpperCase().slice(0, 2);
    setDepots((prev) => [
      ...prev,
      {
        id: `d${prev.length + 1}-${Date.now()}`,
        code,
        name: newDepot.name.trim(),
        location: newDepot.location.trim() || "—",
        gstin: newDepot.gstin.trim().toUpperCase(),
        stateCode: newDepot.stateCode.trim() || "--",
        stateName: newDepot.stateName.trim() || "—",
        areaSqFt: "—",
        coldChainLabel: "Not yet certified",
        coldChainVariant: "ambient",
        mtdSales: "₹0.00 Cr",
        achievement: "New",
        achievementTrend: "flat",
        leaderInitials: (newDepot.leaderName.trim().slice(0, 2) || "—").toUpperCase(),
        leaderName: newDepot.leaderName.trim() || "Unassigned",
        leaderTitle: newDepot.leaderTitle.trim() || "—",
        status: "Audit Ready",
        type: "C&F Agent Hub"
      }
    ]);
    setShowRegister(false);
    setNewDepot({ name: "", location: "", gstin: "", stateCode: "", stateName: "", leaderName: "", leaderTitle: "" });
    setPage(totalPages + 1);
  }

  function runGstinValidation() {
    if (!gstinInput.trim()) {
      setGstinResult({ valid: false, reason: "Enter a GSTIN to validate." });
      return;
    }
    setGstinResult(validateGstin(gstinInput));
  }

  const statusPillClass: Record<Depot["status"], string> = {
    "GSTR-1 Synced": "bg-status-success-bg text-status-success",
    "Audit Ready": "bg-status-info-bg text-status-info",
    "GSTR-3B Pending": "bg-status-warning-bg text-status-warning"
  };
  const statusDotClass: Record<Depot["status"], string> = {
    "GSTR-1 Synced": "bg-emerald-500",
    "Audit Ready": "bg-blue-500",
    "GSTR-3B Pending": "bg-amber-500"
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* BREADCRUMBS & PAGE HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Platform</span>
          <span>/</span>
          <span>Network &amp; Territory</span>
          <span>/</span>
          <span className="text-[#b43403] font-medium">Branches &amp; GST</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#b43403] text-[11px] font-bold uppercase tracking-wider">SUPPLY CHAIN, LOGISTICS &amp; STATUTORY TAX COMPLIANCE</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">Branches &amp; GST</h1>
            <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
              Manage state operating jurisdictions, GSTIN registration status, C&amp;F warehouses, consignment stockists, cold-chain compliance, and interstate e-way bill reconciliation.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="h-9 px-3.5 bg-surface-card hover:bg-surface-subtle border border-border-subtle text-text-secondary text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px] text-text-secondary">file_download</span>
              <span>Export Tax Ledger &amp; GST 3B (CSV/XLS)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="h-9 px-4 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm shadow-orange-500/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_business</span>
              <span>Register New Branch / Depot</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {/* EXECUTIVE KPI PULSE METRICS (4 cards across top) — summary figures, not backed by a depots collection yet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active Operating Branches</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">domain</span></div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-display font-extrabold text-text-primary">28</span>
              <span className="text-xs font-semibold text-text-secondary">Depots</span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
              <div className="bg-[#b43403] h-1.5 rounded-full" style={{ width: "88%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">19 States &amp; UTs Covered</span>
              <span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success text-[10px] font-semibold">100% Licensed</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">GST Compliance Rating</span>
            <div className="w-8 h-8 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-display font-extrabold text-emerald-600">99.8%</span>
              <span className="text-xs font-semibold text-text-secondary">Audited</span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "99.8%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">28/28 GSTINs Active &amp; Reconciled</span>
              <span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> NIC Portal Live
              </span>
            </div>
          </div>
        </div>
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Primary Dispatch (MTD)</span>
            <div className="w-8 h-8 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-display font-extrabold text-text-primary">₹14.82</span>
              <span className="text-xs font-semibold text-text-secondary">Cr</span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "78%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +14.6% vs Target
              </span>
              <span className="text-text-muted text-[11px]">4,280 Consignments</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Cold-Chain Verified C&amp;F</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warehouse</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-display font-extrabold text-text-primary">42</span>
              <span className="text-xs font-semibold text-text-secondary">Hubs</span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "100%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">100% Temperature Telemetry Validated</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">2°C - 8°C Monitored</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE FILTER & SEARCH BAR — now genuinely interactive */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
            <input
              className="w-full h-9 pl-9 pr-3 bg-surface-subtle border border-border-subtle rounded-lg text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-surface-card"
              placeholder="Search Depots, GSTIN, HSN codes, or C&amp;F Managers..."
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-text-muted">category</span>
              <select
                className="bg-transparent text-xs text-text-secondary font-medium focus:outline-none cursor-pointer"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
              >
                <option value="all">All Hubs &amp; Depots</option>
                <option value="Super-Depot">Super-Depot</option>
                <option value="C&F Agent Hub">C&amp;F Agent Hub</option>
                <option value="Consignment Stockist">Consignment Stockist</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-text-muted">task_alt</span>
              <select
                className="bg-transparent text-xs text-text-secondary font-medium focus:outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
              >
                <option value="all">All Statuses</option>
                <option value="GSTR-1 Synced">GSTR-1 Filed</option>
                <option value="Audit Ready">GSTR-3B Reconciled</option>
                <option value="GSTR-3B Pending">Audit Pending</option>
              </select>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 px-3 bg-surface-subtle hover:bg-surface-subtle border border-border-subtle text-text-secondary rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mr-1 shrink-0">Jurisdictions:</span>
          {JURISDICTIONS.map((j) => {
            const active = jurisdiction === j.stateCode;
            const count = j.stateCode === "all" ? depots.length : depots.filter((d) => d.stateCode === j.stateCode).length;
            return (
              <button
                key={j.stateCode}
                type="button"
                onClick={() => { setJurisdiction(j.stateCode); setPage(1); }}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors shrink-0 ${active ? "bg-[#b43403] text-white border-[#b43403]" : "bg-surface-subtle hover:bg-surface-subtle text-text-secondary border-border-subtle"}`}
              >
                {j.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#b43403] text-[20px]">account_tree</span>
                <div>
                  <h2 className="font-display font-bold text-sm text-text-primary">State Jurisdictions &amp; Depot Master Registry</h2>
                  <p className="text-[11px] text-text-muted">NIC validated GSTIN tax nodes, warehouse specs, and leadership</p>
                </div>
              </div>
              <span className="text-xs font-medium text-text-muted">
                {filtered.length === 0 ? "No depots match your filters" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Depots`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-subtle/80 border-b border-border-subtle text-text-secondary font-bold uppercase text-[11px] tracking-wider">
                    <th className="px-4 py-3">Depot &amp; Location</th>
                    <th className="px-4 py-3">GSTIN &amp; Code</th>
                    <th className="px-4 py-3">Infra &amp; Cold Chain</th>
                    <th className="px-4 py-3">MTD Primary Sales</th>
                    <th className="px-4 py-3">Branch Leadership</th>
                    <th className="px-4 py-3 text-right">Status &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-text-muted text-xs">No depots match the current search/filters.</td>
                    </tr>
                  )}
                  {pageRows.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-subtle/60 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/60 text-[#b43403] flex items-center justify-center font-display font-bold text-xs shrink-0">{d.code}</div>
                          <div>
                            <div className="font-display font-bold text-text-primary leading-tight">{d.name}</div>
                            <div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[13px] text-text-muted">pin_drop</span>
                              <span>{d.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-semibold text-text-primary text-[11px]">{d.gstin}</div>
                        <div className="text-[10px] text-text-muted font-medium">State: {d.stateCode}-{d.code}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-text-primary">{d.areaSqFt}</div>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${d.coldChainVariant === "cold" ? "bg-sky-50 text-sky-700" : "bg-surface-subtle text-text-secondary"}`}>
                          <span className="material-symbols-outlined text-[11px]">{d.coldChainVariant === "cold" ? "ac_unit" : "inventory_2"}</span> {d.coldChainLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-display font-bold text-text-primary">{d.mtdSales}</div>
                        <div className={`text-[10px] font-semibold flex items-center ${d.achievementTrend === "up" ? "text-emerald-600" : "text-amber-600"}`}>
                          <span className="material-symbols-outlined text-[12px]">{d.achievementTrend === "up" ? "arrow_upward" : "trending_flat"}</span> {d.achievement}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-subtle text-text-secondary font-bold text-[10px] flex items-center justify-center">{d.leaderInitials}</div>
                          <div>
                            <div className="font-medium text-text-primary leading-tight">{d.leaderName}</div>
                            <div className="text-[10px] text-text-muted">{d.leaderTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPillClass[d.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass[d.status]}`}></span> {d.status}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-[#b43403] hover:underline"
                              onClick={() => setDetail({ title: `${d.name} — Tax Ledger`, body: `GSTIN ${d.gstin} · ${d.mtdSales} dispatched MTD (${d.achievement}) · Status: ${d.status}.` })}
                            >
                              Tax Ledger
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:underline"
                              onClick={() => setDetail({ title: `${d.name} — E-Way Bills`, body: `Interstate consignments routed from ${d.location}, managed by ${d.leaderName} (${d.leaderTitle}).` })}
                            >
                              E-Way Bills
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-surface-subtle/80 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-text-secondary">
                {filtered.length === 0 ? "No matching depots" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Depots`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-muted flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded border text-xs font-medium flex items-center justify-center ${n === safePage ? "border-[#b43403] bg-[#b43403] text-white" : "border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">local_shipping</span></div>
                <div>
                  <h3 className="font-display font-bold text-sm text-text-primary">E-Way Bill &amp; Transit Status</h3>
                  <p className="text-[11px] text-text-muted">Interstate Consignment Tracking</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold tracking-wider uppercase">Live NIC Feed</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8"></path>
                  <path className="text-[#b43403]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="72, 100" strokeLinecap="round" strokeWidth="3.8"></path>
                  <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="24, 100" strokeDashoffset="-72" strokeLinecap="round" strokeWidth="3.8"></path>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-display font-extrabold text-base text-text-primary leading-none">184</span>
                  <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold mt-0.5">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-[#b43403]"></span>In Transit / Dispatched</span>
                  <span className="font-bold text-text-primary">132</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Delivered &amp; Cleared</span>
                  <span className="font-bold text-text-primary">44</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Pending Portal Ack</span>
                  <span className="font-bold text-text-primary">8</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-surface-subtle border border-slate-100">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pending GSTR-1</span>
                <div className="font-display font-extrabold text-text-primary text-sm mt-0.5">₹0.00</div>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Invoices Synced</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-subtle border border-slate-100">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Interstate IGST</span>
                <div className="font-display font-extrabold text-text-primary text-sm mt-0.5">₹2.66 Cr</div>
                <span className="text-[10px] text-blue-600 font-semibold">Reconciled MTD</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-text-primary">Statutory Tax Calendar</h3>
                  <p className="text-[11px] text-text-muted">GST Filing &amp; Deadlines (Q2 2026)</p>
                </div>
              </div>
              <button
                type="button"
                className="text-[#b43403] hover:underline text-xs font-semibold"
                onClick={() => setDetail({ title: "Statutory Tax Calendar — All Deadlines", body: "GSTR-1 (Oct 11, filed), GSTR-3B (Oct 20, due in 10 days across all 28 depots), Quarterly ITC-04 Job Work Return (Oct 31, C&F repackaging hubs)." })}
              >
                View All
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-slate-100 hover:bg-surface-subtle/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-status-success-bg border border-status-success-bg/60 text-status-success flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] uppercase font-extrabold leading-none">OCT</span>
                    <span className="font-display font-bold text-sm leading-none mt-0.5">11</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary leading-tight">GSTR-1 Outward Supplies</div>
                    <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">task_alt</span> Filed &amp; Accepted (ARN #99281)
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-slate-100 hover:bg-surface-subtle/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#b43403] text-white flex flex-col items-center justify-center shrink-0 shadow-2xs"><span className="text-[9px] uppercase font-extrabold leading-none">OCT</span><span className="font-display font-bold text-sm leading-none mt-0.5">20</span></div>
                  <div>
                    <div className="font-semibold text-text-primary leading-tight">GSTR-3B Consolidated Return</div>
                    <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">hourglass_top</span> Due in 10 days • 28 Depots
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-surface-card hover:bg-surface-subtle text-text-secondary border border-border-subtle text-xs font-semibold shadow-2xs transition-colors"
                  onClick={() => setDetail({ title: "Prepare GSTR-3B", body: "Consolidated return due Oct 20 across all 28 depots. Reconcile outward supplies against the GSTR-1 already filed, then submit via the NIC portal." })}
                >
                  Prepare
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-slate-100 hover:bg-surface-subtle/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 text-text-secondary flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] uppercase font-extrabold leading-none">OCT</span>
                    <span className="font-display font-bold text-sm leading-none mt-0.5">31</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary leading-tight">Quarterly ITC-04 Job Work Return</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">C&amp;F Repackaging Hubs</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-surface-card hover:bg-surface-subtle text-text-secondary border border-border-subtle text-xs font-semibold shadow-2xs transition-colors"
                  onClick={() => setDetail({ title: "ITC-04 Job Work Return", body: "Quarterly return covering goods sent to and received from job workers at C&F repackaging hubs. Due Oct 31." })}
                >
                  Details
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50/70 via-white to-white border border-orange-200/80 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-[#b43403]"><span className="material-symbols-outlined text-[20px]">badge</span><h3 className="font-display font-bold text-sm text-text-primary">Instant GSTIN Validator</h3></div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Input any consignor, depot, or consignee GSTIN to perform an instantaneous format &amp; checksum validation.
            </p>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 h-9 px-3 bg-surface-card border border-border-subtle rounded-lg text-xs uppercase font-mono tracking-wider text-text-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="E.g. 27AABCZ1234F1Z5"
                type="text"
                value={gstinInput}
                onChange={(e) => setGstinInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runGstinValidation(); }}
              />
              <button
                type="button"
                onClick={runGstinValidation}
                className="h-9 px-4 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span><span>Validate GSTIN</span>
              </button>
            </div>
            {gstinResult && (
              <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${gstinResult.valid ? "bg-status-success-bg border-status-success-bg text-status-success" : "bg-status-danger-bg border-status-danger-bg text-red-600"}`}>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px]">{gstinResult.valid ? "verified" : "error"}</span> {gstinResult.reason}
                </span>
                {gstinResult.valid && <span className="text-[10px] font-bold uppercase">Match</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register New Branch / Depot modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowRegister(false)}>
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-text-primary text-lg">Register New Branch / Depot</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Depot name *" value={newDepot.name} onChange={(e) => setNewDepot((s) => ({ ...s, name: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Location" value={newDepot.location} onChange={(e) => setNewDepot((s) => ({ ...s, location: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm font-mono" placeholder="GSTIN *" value={newDepot.gstin} onChange={(e) => setNewDepot((s) => ({ ...s, gstin: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="State code (e.g. 27)" value={newDepot.stateCode} onChange={(e) => setNewDepot((s) => ({ ...s, stateCode: e.target.value }))} />
                <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="State name" value={newDepot.stateName} onChange={(e) => setNewDepot((s) => ({ ...s, stateName: e.target.value }))} />
              </div>
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Branch leader name" value={newDepot.leaderName} onChange={(e) => setNewDepot((s) => ({ ...s, leaderName: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Leader title" value={newDepot.leaderTitle} onChange={(e) => setNewDepot((s) => ({ ...s, leaderTitle: e.target.value }))} />
            </div>
            <p className="text-[11px] text-text-muted">Saved to this table for the current session. There is no depots database collection yet, so this does not persist after a page reload.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowRegister(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a3412] disabled:opacity-50" disabled={!newDepot.name.trim() || !newDepot.gstin.trim()} onClick={handleRegister}>Register Depot</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail popup for Tax Ledger / E-Way Bills / View All / Prepare / Details */}
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
