"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { AddFieldForceModal } from "./add-field-force-modal";
import { apiClient, type AuditLogEntry } from "@/lib/api-client";

// Round F item 4 — real category for each of the 12 tiles below, used by
// the "Territory & Field (4)" / "Commercial & Products (4)" / "Financial &
// Compliance (4)" filter tabs, which previously had no onClick at all.
type MasterCategory = "Territory & Field" | "Commercial & Products" | "Financial & Compliance";
const TILE_CATEGORY: Record<string, MasterCategory> = {
  subdivision: "Territory & Field",
  "field-force": "Territory & Field",
  customer: "Territory & Field",
  "territory-bulk": "Territory & Field",
  product: "Commercial & Products",
  input: "Commercial & Products",
  campaign: "Commercial & Products",
  sales: "Commercial & Products",
  "stockist-details": "Financial & Compliance",
  "expense-setup": "Financial & Compliance",
  "manager-expense": "Financial & Compliance",
  "personal-information": "Financial & Compliance"
};

export function AdminMastersDashboard() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddFieldForce, setShowAddFieldForce] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Round F item 4 — the category tabs above the tile grid had no onClick
  // at all (confirmed by reading this file); this drives real filtering.
  const [categoryFilter, setCategoryFilter] = useState<"All" | MasterCategory>("All");
  // Round F item 4 — each tile's "..." button had no onClick either (12 of
  // them, confirmed via a dead-button sweep); this backs a real small menu.
  const [openTileMenu, setOpenTileMenu] = useState<string | null>(null);

  // Round F item 4 — the "Recent Master Modifications & Audit Trail"
  // section below was 100% hardcoded mock rows with every control
  // (search, All Modules, Export, View Diff, pagination) a no-op.
  // Wired to the real GET /company/audit-log (reads the same AuditLogModel
  // every real write across this backend already logs to).
  const auditSectionRef = useRef<HTMLDivElement>(null);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditModule, setAuditModule] = useState("All Modules");
  const [auditModules, setAuditModules] = useState<string[]>([]);
  const [auditModuleMenuOpen, setAuditModuleMenuOpen] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const AUDIT_PAGE_SIZE = 5;
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState("");
  const [diffEntry, setDiffEntry] = useState<AuditLogEntry | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadAudit = useCallback(() => {
    setAuditLoading(true);
    setAuditError("");
    apiClient.auditLog({ search: auditSearch, module: auditModule, page: auditPage, pageSize: AUDIT_PAGE_SIZE })
      .then((r) => { setAuditEntries(r.data); setAuditTotal(r.total); })
      .catch((e) => setAuditError(e instanceof Error ? e.message : "Unable to load audit log"))
      .finally(() => setAuditLoading(false));
  }, [auditSearch, auditModule, auditPage]);

  useEffect(() => { loadAudit(); }, [loadAudit]);
  useEffect(() => {
    apiClient.auditLogModules().then((r) => setAuditModules(r.data)).catch(() => {});
  }, []);
  // Any filter change resets back to page 1, same as every other
  // filtered/paginated table in this app.
  useEffect(() => { setAuditPage(1); }, [auditSearch, auditModule]);

  function viewModuleAudit(moduleTitle: string) {
    setOpenTileMenu(null);
    setAuditModule(moduleTitle);
    setAuditSearch("");
    auditSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function exportAuditLog() {
    setExporting(true);
    try {
      const blob = await apiClient.auditLogExportBlob({ search: auditSearch, module: auditModule });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setAuditError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (!(event.target as HTMLElement).closest("[data-tile-menu-root]")) {
        setOpenTileMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col w-full space-y-6">
      <section className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span>
            <span className="text-text-muted text-body-sm font-body-sm">/</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Masters</span>
            <span className="text-text-muted text-body-sm font-body-sm">/</span>
            <span className="font-label-md text-label-md text-primary font-semibold">Master setup</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Masters</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
              Live Sync Active • Synced 1 min ago
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2">
            <span className="">SubDivision, Product, Field Force, Doctor, Input, Stockist, Expense, and personal information setup.</span>
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[17px]">search</span>
            <input className="w-full h-[38px] pl-8 pr-3 rounded-lg bg-surface-canvas text-text-primary font-body-sm placeholder:text-text-muted border border-transparent focus:outline-none focus:border-border-strong focus:bg-surface-card shadow-sm transition-colors" placeholder="Search master records, SKUs, doctors..." type="text"/>
          </div>
          <button className="h-[38px] px-3.5 rounded-lg bg-surface-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-[18px] text-text-secondary">download</span>
            <span className="">Bulk Export Master Data</span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              className="h-[38px] px-4 rounded-lg bg-primary hover:bg-brand-primary-hover text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all active:scale-95" 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="">Quick Add Master Record</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden z-50 py-1">
                <div className="px-3 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                  Select Master
                </div>
                <button className="w-full text-left px-4 py-2.5 text-label-md text-text-primary hover:bg-surface-subtle hover:text-primary transition-colors flex items-center gap-2.5 group">
                  <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-primary">account_tree</span>
                  SubDivision
                </button>
                <button className="w-full text-left px-4 py-2.5 text-label-md text-text-primary hover:bg-surface-subtle hover:text-primary transition-colors flex items-center gap-2.5 group">
                  <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-primary">medication</span>
                  Product
                </button>
                <button 
                  className="w-full text-left px-4 py-2.5 text-label-md text-text-primary hover:bg-surface-subtle hover:text-primary transition-colors flex items-center gap-2.5 group"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setShowAddFieldForce(true);
                  }}
                >
                  <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-primary">badge</span>
                  Field Force
                </button>
                <button className="w-full text-left px-4 py-2.5 text-label-md text-text-primary hover:bg-surface-subtle hover:text-primary transition-colors flex items-center gap-2.5 group">
                  <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-primary">clinical_notes</span>
                  Customer
                </button>
                <button className="w-full text-left px-4 py-2.5 text-label-md text-text-primary hover:bg-surface-subtle hover:text-primary transition-colors flex items-center gap-2.5 group">
                  <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-primary">featured_play_list</span>
                  Input / Sample
                </button>
                <button className="w-full text-left px-4 py-2.5 text-label-md text-text-primary hover:bg-surface-subtle hover:text-primary transition-colors flex items-center gap-2.5 group">
                  <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-primary">store</span>
                  Stockist
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total Master Entities</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">12</span>
                <span className="font-label-sm text-label-sm text-status-success bg-status-success-bg px-1.5 py-0.5 rounded font-semibold">All Configured</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-700"></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm text-text-muted">
              <span className="">Active enterprise modules</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">100% Online</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total Active Records</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">28,490</span>
                <span className="font-label-sm text-label-sm text-status-info bg-status-info-bg px-1.5 py-0.5 rounded font-semibold">+4.2% MoM</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-status-info h-1.5 rounded-full transition-all duration-700" style={{ width: "88%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm text-text-muted">
              <span className="">Drs: 12.4k • SKUs: 148</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">194 Reps • 860 Stk</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Validation Status</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">99.4%</span>
                <span className="font-label-sm text-label-sm text-status-success bg-status-success-bg px-1.5 py-0.5 rounded font-semibold">Verified</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-status-success h-1.5 rounded-full transition-all duration-700" style={{ width: "99.4%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm">
              <span className="text-text-muted">KYC &amp; DL Cleared</span>
              <span className="font-label-sm text-label-sm text-status-warning font-medium">28 Pending Approval</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Audit &amp; Change Log</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">42</span>
                <span className="font-label-sm text-label-sm text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded font-semibold">Today</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">history_edu</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary h-1.5 rounded-full transition-all duration-700" style={{ width: "65%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm text-text-muted">
              <span className="">Ops Admin update</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">14 min ago</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary">Master Directory &amp; Configuration Hub</h2>
            <p className="font-body-sm text-body-sm text-text-muted">Configure, view, and administer central records across pharma operational domains</p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg">
            <button className={categoryFilter === "All" ? "px-3 py-1.5 rounded-md bg-surface-card text-primary font-bold shadow-sm text-label-sm" : "px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium"} onClick={() => setCategoryFilter("All")} type="button">All Masters (12)</button>
            <button className={categoryFilter === "Territory & Field" ? "px-3 py-1.5 rounded-md bg-surface-card text-primary font-bold shadow-sm text-label-sm" : "px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium"} onClick={() => setCategoryFilter("Territory & Field")} type="button">Territory &amp; Field (4)</button>
            <button className={categoryFilter === "Commercial & Products" ? "px-3 py-1.5 rounded-md bg-surface-card text-primary font-bold shadow-sm text-label-sm" : "px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium"} onClick={() => setCategoryFilter("Commercial & Products")} type="button">Commercial &amp; Products (4)</button>
            <button className={categoryFilter === "Financial & Compliance" ? "px-3 py-1.5 rounded-md bg-surface-card text-primary font-bold shadow-sm text-label-sm" : "px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium"} onClick={() => setCategoryFilter("Financial & Compliance")} type="button">Financial &amp; Compliance (4)</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-grid-gutter">
          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["subdivision"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">account_tree</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">SubDivision</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">1 sub tab</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Organizational division hierarchies, zone mapping, and team alignment.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">14 Divisions</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">4 Super Zones</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/subdivision">
                <span className="">Configure Hierarchy</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "subdivision" ? null : "subdivision")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "subdivision" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/subdivision"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open SubDivision
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("SubDivision")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["product"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">medication</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Product</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">5 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">SKU catalogs, brand molecules, composition pricing, packaging &amp; batch codes.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">148 SKUs</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">24 Molecules</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product">
                <span className="">Manage Products</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "product" ? null : "product")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "product" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Product
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Product")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["field-force"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Field Force</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">Ready module</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>194 Reps
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Medical representatives, territory managers, hierarchy &amp; designation mappings.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">194 Active</span>
                <span className="px-2 py-0.5 rounded bg-status-warning-bg text-status-warning font-label-sm text-[11px]">2 Vacancies</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force">
                <span className="">Reps &amp; Mappings</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "field-force" ? null : "field-force")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "field-force" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Field Force
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Field Force")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["customer"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Customer</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">4 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Verified
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Prescriber registry, specialization, hospital tags, MCL categories &amp; core list.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">12,450 Customers</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">98% MCL tagged</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor">
                <span className="">Customer Master Registry</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "customer" ? null : "customer")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "customer" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Customer
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Customer")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["input"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">featured_play_list</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Input</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">Ready module</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>86 Collaterals
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Physician sampling kits, promotional visual aids, LBLs, gift inventories &amp; giveaways.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">86 Items</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Active Samples</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/input">
                <span className="">Sampling &amp; Inputs</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "input" ? null : "input")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "input" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/input"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Input
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Input")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Post-launch fix — the "Call Manager" reference build's real
              Campaign master (campaignMaster, GenericMasterTable, added to
              the division-master tree in Phase 1) never got a tile here,
              so there was no discoverable path to it from the actual live
              sidebar's "Masters" entry — only from a hand-typed URL. This
              tile fixes that; no fabricated live count is shown since this
              dashboard has no real data-fetching wired into it for any
              tile (all the "N Items"/"100% Online" badges elsewhere on
              this page are static placeholder text, not live figures). */}
          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["campaign"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">campaign</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Campaign</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">Ready module</span>
                  </div>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Author the campaign catalog (name, brand focus, dates, status) field reps pick from in Campaign Planning.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">Field Rep Campaign Planning</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/campaign-master">
                <span className="">Campaign Master</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "campaign" ? null : "campaign")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "campaign" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/campaign-master"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Campaign
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Campaign")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["territory-bulk"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">map</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Territory Bulk Activation</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">6 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>100% Online
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Batch territory operations, beat realignment, patch status toggling.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">48 Beats</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Bulk Controls</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force-entries">
                <span className="">Territory Ops</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "territory-bulk" ? null : "territory-bulk")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "territory-bulk" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force-entries"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Territory Bulk Activation
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Territory Bulk Activation")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}



          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["stockist-details"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">store</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Stockist Details</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">8 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>860 Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Authorized pharmaceutical distributors, stockist ledger, DL/GSTIN verification.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">860 Stockists</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">GSTIN Synced</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/stockist-details">
                <span className="">Stockist Master</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "stockist-details" ? null : "stockist-details")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "stockist-details" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/stockist-details"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Stockist Details
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Stockist Details")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["expense-setup"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Expense Setup</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">6 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Rates Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">HQ/Ex-HQ/Outstation daily allowances, kilometer rates, and lodgings policy.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">Grade A/B/C Bands</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">DA &amp; TA Rules</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/expense">
                <span className="">Allowance Policies</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "expense-setup" ? null : "expense-setup")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "expense-setup" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/expense"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Expense Setup
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Expense Setup")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["manager-expense"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">supervisor_account</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Manager Expense</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">6 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Configured
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Area &amp; regional managerial expense caps, joint fieldwork allowance rules.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">5 Policy Tiers</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Manager Slab</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/manager-expense">
                <span className="">Manager Slabs</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "manager-expense" ? null : "manager-expense")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "manager-expense" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/manager-expense"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Manager Expense
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Manager Expense")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["personal-information"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">person_pin</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Personal Information</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">2 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>100% KYC
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Emergency contacts, bank disbursement details, PF/ESI numbers.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">100% Onboarded</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Statutory Cleared</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/personal-information">
                <span className="">Employee Details</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "personal-information" ? null : "personal-information")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "personal-information" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/personal-information"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Personal Information
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Personal Information")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {(categoryFilter === "All" || categoryFilter === TILE_CATEGORY["sales"]) && (
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">trending_up</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Sales</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">5 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Q3 Live
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Primary vs secondary targets, opening stock master, and liquidation thresholds.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">Target Rules</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Opening Stock</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/sales">
                <span className="">Sales Rules &amp; Targets</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <div className="relative" data-tile-menu-root>
                <button
                  className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                  title="More actions"
                  type="button"
                  onClick={() => setOpenTileMenu(openTileMenu === "sales" ? null : "sales")}
                >
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
                {openTileMenu === "sales" && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-20 py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => { setOpenTileMenu(null); router.push("/admin/workspace/division-dashboard/division-navigation-tabs/division-master/sales"); }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">open_in_new</span>
                      Open Sales
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors flex items-center gap-2"
                      type="button"
                      onClick={() => viewModuleAudit("Sales")}
                    >
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                      View Recent Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </section>

      <section ref={auditSectionRef} className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary">Recent Master Modifications &amp; Audit Trail</h2>
            <p className="font-body-sm text-body-sm text-text-muted">Real-time changelog of data definitions, doctor registries, pricing and territory alignments</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[17px]">filter_list</span>
              <input
                className="w-full h-[36px] pl-8 pr-3 rounded-lg bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:bg-surface-card shadow-sm border border-border-subtle focus:border-border-strong"
                placeholder="Filter logs by user or entity..."
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>
            <div className="relative" data-tile-menu-root>
              <button
                className="h-[36px] px-3 rounded-lg bg-surface-subtle border border-border-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"
                type="button"
                onClick={() => setAuditModuleMenuOpen((v) => !v)}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span className="">{auditModule}</span>
              </button>
              {auditModuleMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 max-h-72 overflow-y-auto bg-surface-card border border-border-subtle rounded-lg shadow-lg z-20 py-1">
                  <button
                    className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors"
                    type="button"
                    onClick={() => { setAuditModule("All Modules"); setAuditModuleMenuOpen(false); }}
                  >
                    All Modules
                  </button>
                  {auditModules.map((m) => (
                    <button
                      key={m}
                      className="w-full text-left px-3 py-2 text-label-sm text-text-primary hover:bg-surface-subtle transition-colors"
                      type="button"
                      onClick={() => { setAuditModule(m); setAuditModuleMenuOpen(false); }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="h-[36px] px-3 rounded-lg bg-surface-subtle border border-border-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors disabled:opacity-60"
              type="button"
              disabled={exporting}
              onClick={() => void exportAuditLog()}
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="">{exporting ? "Exporting..." : "Export Audit Log"}</span>
            </button>
          </div>
        </div>
        {auditError && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">{auditError}</p>}
        <div className="w-full overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
              <tr className="h-table-header-height bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider border-b border-border-subtle hover:bg-surface-subtle/50 transition-colors group">
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Module</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Entity Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Change Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Updated By</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Timestamp</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {auditLoading && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-text-muted">Loading...</td></tr>
              )}
              {!auditLoading && auditEntries.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-text-muted">No audit records match this filter.</td></tr>
              )}
              {!auditLoading && auditEntries.map((entry) => (
                <tr key={entry.id} className="h-table-row-height hover:bg-surface-canvas/60 transition-colors hover:bg-surface-subtle/50 transition-colors group">
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-status-info"></span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{entry.module}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                    <span className="font-medium text-text-primary">{entry.entityName}</span>
                    <span className="block font-label-sm text-text-muted">{entry.action}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-info-bg text-status-info font-label-sm text-label-sm font-semibold">
                      {entry.changeType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                    <span className="text-text-primary font-medium">{entry.updatedBy}</span>
                  </td>
                  <td className="px-4 text-text-muted font-body-sm py-3 text-sm text-text-primary whitespace-nowrap">{new Date(entry.timestamp).toLocaleString("en-IN")}</td>
                  <td className="px-4 text-right py-3 text-sm text-text-primary whitespace-nowrap">
                    <button
                      className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle hover:bg-brand-primary-subtle hover:border-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors"
                      type="button"
                      onClick={() => setDiffEntry(entry)}
                    >
                      View Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 font-body-sm text-body-sm text-text-secondary">
          <div className="">
            Showing <strong className="text-text-primary">{auditTotal === 0 ? 0 : (auditPage - 1) * AUDIT_PAGE_SIZE + 1} to {Math.min(auditPage * AUDIT_PAGE_SIZE, auditTotal)}</strong> of <strong className="text-text-primary">{auditTotal}</strong> Audit Records
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className="px-2.5 py-1 rounded bg-surface-canvas border border-border-subtle hover:bg-surface-subtle text-text-muted disabled:opacity-40 font-label-md text-label-md"
              disabled={auditPage <= 1}
              type="button"
              onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {Array.from({ length: Math.max(1, Math.ceil(auditTotal / AUDIT_PAGE_SIZE)) }).slice(0, 10).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={pageNum === auditPage
                    ? "w-7 h-7 rounded border border-primary bg-primary text-on-primary font-label-md text-label-md font-semibold"
                    : "w-7 h-7 rounded border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md"}
                  type="button"
                  onClick={() => setAuditPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="px-2.5 py-1 rounded bg-surface-canvas border border-border-subtle hover:bg-surface-subtle text-text-primary font-label-md text-label-md disabled:opacity-40"
              type="button"
              disabled={auditPage >= Math.ceil(auditTotal / AUDIT_PAGE_SIZE)}
              onClick={() => setAuditPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {diffEntry && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 flex items-center justify-center p-4" onClick={() => setDiffEntry(null)}>
          <div className="w-full max-w-lg bg-surface-card rounded-2xl shadow-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-text-primary">{diffEntry.module} &middot; {diffEntry.changeType}</h3>
              <button type="button" className="text-text-muted hover:text-text-primary" onClick={() => setDiffEntry(null)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary">{diffEntry.entityName} &middot; {diffEntry.action} &middot; {new Date(diffEntry.timestamp).toLocaleString("en-IN")} &middot; by {diffEntry.updatedBy}</p>
            {/* Honest limitation (see backend commit note): no write path in
                this codebase records a structured before/after pair, so
                this shows the change's real recorded metadata as-is rather
                than fabricating "before"/"after" fields that don't exist. */}
            <pre className="bg-surface-canvas rounded-xl p-3 text-xs text-text-primary overflow-x-auto max-h-80 overflow-y-auto">
              {diffEntry.metadata ? JSON.stringify(diffEntry.metadata, null, 2) : "No additional change details were recorded for this entry."}
            </pre>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddFieldForce && (
        <AddFieldForceModal onClose={() => setShowAddFieldForce(false)} />
      )}
    </div>
  );
}
