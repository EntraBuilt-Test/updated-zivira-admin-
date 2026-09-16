"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode, CompanyBranch } from "@zivira/types";
import { apiClient } from "@/lib/api-client";
import { downloadCsv } from "@/lib/download-csv";

// Item 3/4 fix — this page used to be a fully static server component: every
// number was hand-typed JSX and not a single one of its 21 buttons/selects
// had an onClick/onChange handler. That pass wired the table up against a
// local mock array. This pass replaces the mock array with the real
// GET /company/branches endpoint (apiClient.branches()) and wires Register
// New Branch / Depot + Edit to the real createBranch/updateBranch endpoints,
// so branches now really persist. Several old UI fields (MTD sales,
// achievement %, cold-chain status, branch leadership) have no backing
// collection on the branch record at all — those columns/cards have been
// removed or relabeled "No data yet" instead of keeping fabricated numbers.

type Depot = {
  id: string;
  code: string;
  name: string;
  location: string;
  gstin: string;
  stateCode: string;
  stateName: string;
  pincode: string;
  isHeadquarters: boolean;
  status: "ACTIVE" | "INACTIVE";
};

function mapBranchToDepot(b: CompanyBranch): Depot {
  const gstin = (b.gstNumber || "").toUpperCase();
  const stateCode = gstin.slice(0, 2) || "--";
  return {
    id: b.id,
    code: (b.branchName || "").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || stateCode,
    name: b.branchName,
    location: [b.address, b.city].filter(Boolean).join(", ") || "—",
    gstin,
    stateCode,
    stateName: b.state || "—",
    pincode: b.pincode || "—",
    isHeadquarters: !!b.isHeadquarters,
    status: b.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"
  };
}

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

const emptyForm = { branchName: "", gstNumber: "", address: "", city: "", state: "", pincode: "", isHeadquarters: false };

export function AdminBranchesDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [hqFilter, setHqFilter] = useState<"all" | "hq" | "branch">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Depot["status"]>("all");
  const [jurisdiction, setJurisdiction] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showRegister, setShowRegister] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [gstinInput, setGstinInput] = useState("");
  const [gstinResult, setGstinResult] = useState<{ valid: boolean; reason: string } | null>(null);
  const [newDepot, setNewDepot] = useState(emptyForm);

  async function loadBranches() {
    setLoading(true);
    setLoadError("");
    try {
      const response = await apiClient.branches();
      setDepots(response.data.map(mapBranchToDepot));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBranches();
  }, []);

  const jurisdictionOptions = useMemo(() => {
    const seen = new Map<string, string>();
    depots.forEach((d) => {
      if (!seen.has(d.stateCode)) seen.set(d.stateCode, d.stateName);
    });
    return [{ label: "All Jurisdictions", stateCode: "all" }, ...Array.from(seen.entries()).map(([stateCode, stateName]) => ({ label: stateName, stateCode }))];
  }, [depots]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return depots.filter((d) => {
      if (jurisdiction !== "all" && d.stateCode !== jurisdiction) return false;
      if (hqFilter === "hq" && !d.isHeadquarters) return false;
      if (hqFilter === "branch" && d.isHeadquarters) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.gstin.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.stateName.toLowerCase().includes(q)
      );
    });
  }, [depots, search, hqFilter, statusFilter, jurisdiction]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeCount = depots.filter((d) => d.status === "ACTIVE").length;
  const statesCovered = new Set(depots.map((d) => d.stateName)).size;
  const activePercent = depots.length ? Math.round((activeCount / depots.length) * 100) : 0;

  function resetFilters() {
    setSearch("");
    setHqFilter("all");
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
        "Pincode": d.pincode,
        "Headquarters": d.isHeadquarters ? "Yes" : "No",
        "Status": d.status
      }))
    );
  }

  function openRegister() {
    setEditingId(null);
    setNewDepot(emptyForm);
    setSaveError("");
    setShowRegister(true);
  }

  function openEdit(d: Depot) {
    setEditingId(d.id);
    const [address, city] = d.location.split(", ");
    setNewDepot({
      branchName: d.name,
      gstNumber: d.gstin,
      address: address || "",
      city: city || "",
      state: d.stateName === "—" ? "" : d.stateName,
      pincode: d.pincode === "—" ? "" : d.pincode,
      isHeadquarters: d.isHeadquarters
    });
    setSaveError("");
    setShowRegister(true);
  }

  async function handleRegister() {
    if (!newDepot.branchName.trim() || !newDepot.gstNumber.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const input = {
        branchName: newDepot.branchName.trim(),
        gstNumber: newDepot.gstNumber.trim().toUpperCase(),
        address: newDepot.address.trim(),
        city: newDepot.city.trim(),
        state: newDepot.state.trim(),
        pincode: newDepot.pincode.trim(),
        isHeadquarters: newDepot.isHeadquarters
      };
      if (editingId) {
        const response = await apiClient.updateBranch(editingId, input);
        setDepots((prev) => prev.map((d) => (d.id === editingId ? mapBranchToDepot(response.data) : d)));
      } else {
        const response = await apiClient.createBranch(input);
        setDepots((prev) => [...prev, mapBranchToDepot(response.data)]);
        setPage(totalPages + 1);
      }
      setShowRegister(false);
      setEditingId(null);
      setNewDepot(emptyForm);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save branch.");
    } finally {
      setSaving(false);
    }
  }

  function runGstinValidation() {
    if (!gstinInput.trim()) {
      setGstinResult({ valid: false, reason: "Enter a GSTIN to validate." });
      return;
    }
    setGstinResult(validateGstin(gstinInput));
  }

  const statusPillClass: Record<Depot["status"], string> = {
    ACTIVE: "bg-status-success-bg text-status-success",
    INACTIVE: "bg-status-warning-bg text-status-warning"
  };
  const statusDotClass: Record<Depot["status"], string> = {
    ACTIVE: "bg-emerald-500",
    INACTIVE: "bg-amber-500"
  };
  const statusLabel: Record<Depot["status"], string> = { ACTIVE: "Active", INACTIVE: "Inactive" };

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
              Manage state operating jurisdictions and GSTIN registration status for every registered branch.
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
              <span>Export Branch &amp; GST Register (CSV)</span>
            </button>
            <button
              type="button"
              onClick={openRegister}
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

      {loadError && (
        <div className="p-3 rounded-lg border border-status-danger-bg bg-status-danger-bg text-red-600 text-xs flex items-center justify-between">
          <span>{loadError}</span>
          <button type="button" className="font-semibold underline" onClick={loadBranches}>Retry</button>
        </div>
      )}

      {/* EXECUTIVE KPI PULSE METRICS (4 cards across top) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active Operating Branches</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#b43403] flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">domain</span></div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-display font-extrabold text-text-primary">{loading ? "—" : activeCount}</span>
              <span className="text-xs font-semibold text-text-secondary">Depots</span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-1.5 my-2">
              <div className="bg-[#b43403] h-1.5 rounded-full" style={{ width: `${activePercent}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">{statesCovered} States &amp; UTs Covered</span>
              <span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success text-[10px] font-semibold">{activePercent}% Active</span>
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
          <div className="text-xs text-text-muted italic">No data yet — not tracked by any backend module.</div>
        </div>
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Primary Dispatch (MTD)</span>
            <div className="w-8 h-8 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div className="text-xs text-text-muted italic">No data yet — not tracked by any backend module.</div>
        </div>
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Cold-Chain Verified C&amp;F</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warehouse</span>
            </div>
          </div>
          <div className="text-xs text-text-muted italic">No data yet — not tracked by any backend module.</div>
        </div>
      </div>

      {/* INTERACTIVE FILTER & SEARCH BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
            <input
              className="w-full h-9 pl-9 pr-3 bg-surface-subtle border border-border-subtle rounded-lg text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-surface-card"
              placeholder="Search depots, GSTIN, location, or state..."
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
                value={hqFilter}
                onChange={(e) => { setHqFilter(e.target.value as typeof hqFilter); setPage(1); }}
              >
                <option value="all">All Branches</option>
                <option value="hq">Headquarters Only</option>
                <option value="branch">Non-HQ Branches</option>
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
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
          {jurisdictionOptions.map((j) => {
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
                  <p className="text-[11px] text-text-muted">Registered branches with GSTIN and jurisdiction</p>
                </div>
              </div>
              <span className="text-xs font-medium text-text-muted">
                {loading ? "Loading…" : filtered.length === 0 ? "No depots match your filters" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Depots`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-subtle/80 border-b border-border-subtle text-text-secondary font-bold uppercase text-[11px] tracking-wider">
                    <th className="px-4 py-3">Depot &amp; Location</th>
                    <th className="px-4 py-3">GSTIN</th>
                    <th className="px-4 py-3">State &amp; Pincode</th>
                    <th className="px-4 py-3">Headquarters</th>
                    <th className="px-4 py-3 text-right">Status &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-text-muted text-xs">Loading branches…</td>
                    </tr>
                  )}
                  {!loading && pageRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-text-muted text-xs">No depots match the current search/filters.</td>
                    </tr>
                  )}
                  {!loading && pageRows.map((d) => (
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
                        <div className="text-[10px] text-text-muted font-medium">State code: {d.stateCode}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-text-primary">{d.stateName}</div>
                        <div className="text-[10px] text-text-muted">PIN: {d.pincode}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        {d.isHeadquarters ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-[#b43403]">
                            <span className="material-symbols-outlined text-[11px]">star</span> Headquarters
                          </span>
                        ) : (
                          <span className="text-text-muted text-[11px]">Branch</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPillClass[d.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass[d.status]}`}></span> {statusLabel[d.status]}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-[#b43403] hover:underline"
                              onClick={() => openEdit(d)}
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:underline"
                              onClick={() => setDetail({ title: `${d.name} — Branch Details`, body: `GSTIN ${d.gstin} · ${d.location} · PIN ${d.pincode} · ${d.isHeadquarters ? "Headquarters" : "Branch"} · Status: ${statusLabel[d.status]}.` })}
                            >
                              Details
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
            </div>
            <div className="text-xs text-text-muted italic p-3 bg-surface-subtle rounded-xl">No data yet — there is no e-way bill / transit backend module wired to this dashboard.</div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-text-primary">Statutory Tax Calendar</h3>
                  <p className="text-[11px] text-text-muted">GST Filing &amp; Deadlines</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-text-muted italic p-3 bg-surface-subtle rounded-xl">No data yet — there is no statutory tax calendar backend module wired to this dashboard.</div>
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

      {/* Register / Edit Branch / Depot modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowRegister(false)}>
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-text-primary text-lg">{editingId ? "Edit Branch / Depot" : "Register New Branch / Depot"}</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Depot / Branch name *" value={newDepot.branchName} onChange={(e) => setNewDepot((s) => ({ ...s, branchName: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm font-mono" placeholder="GSTIN *" value={newDepot.gstNumber} onChange={(e) => setNewDepot((s) => ({ ...s, gstNumber: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Address" value={newDepot.address} onChange={(e) => setNewDepot((s) => ({ ...s, address: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="City" value={newDepot.city} onChange={(e) => setNewDepot((s) => ({ ...s, city: e.target.value }))} />
                <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="State" value={newDepot.state} onChange={(e) => setNewDepot((s) => ({ ...s, state: e.target.value }))} />
              </div>
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Pincode" value={newDepot.pincode} onChange={(e) => setNewDepot((s) => ({ ...s, pincode: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={newDepot.isHeadquarters} onChange={(e) => setNewDepot((s) => ({ ...s, isHeadquarters: e.target.checked }))} />
                This is a Headquarters branch
              </label>
            </div>
            {saveError && <p className="text-[11px] text-red-600">{saveError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowRegister(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#b43403] text-white hover:bg-[#9a3412] disabled:opacity-50" disabled={!newDepot.branchName.trim() || !newDepot.gstNumber.trim() || saving} onClick={handleRegister}>
                {saving ? "Saving…" : editingId ? "Save Changes" : "Register Depot"}
              </button>
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
