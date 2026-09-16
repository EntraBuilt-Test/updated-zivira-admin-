"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { downloadCsv } from "@/lib/download-csv";
import { apiClient, type ActivityLogEntry } from "@/lib/api-client";

// Fix — the module cards' "Configure / Manage / …" links already navigated
// to real routes and were left untouched. Everything else on this page was
// static: the header search box, Bulk Export, Quick Add Master Record, the
// 4 category tabs, the "More actions" per-card menu, the audit-log filter
// box, All Modules dropdown, Export Audit Log, and the audit table's
// pagination did nothing when clicked. A later pass made the module
// directory and audit trail table interactive against local mock data. The
// KPI summary cards at top are still left as-is (no matching backend
// collection exists for those specific rollup numbers), but the "Recent
// Master Modifications & Audit Trail" table below IS now real: the backend
// exposes GET /company/activity (src/routes/company.routes.ts), which reads
// the same AuditLogModel collection every masters write already calls
// audit(...) against — it's the same feed that already powers the admin
// bell's notifications in company-shell.tsx. apiClient.activityLog() wires
// that in here, and the search/module filter/pagination/export/View-Diff
// popup all keep working against the real rows.

type Category = "All" | "Territory & Field" | "Commercial & Products" | "Financial & Compliance";

type MasterModule = {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  subTabsLabel: string;
  statusLabel: string;
  description: string;
  tagPrimary: string;
  tagSecondary: string;
  linkLabel: string;
  href: string;
  category: Exclude<Category, "All">;
};

const initialModules: MasterModule[] = [
  { id: "m1", icon: "account_tree", iconBg: "bg-brand-primary-subtle text-primary", title: "SubDivision", subTabsLabel: "1 sub tab", statusLabel: "Active", description: "Organizational division hierarchies, zone mapping, and team alignment.", tagPrimary: "14 Divisions", tagSecondary: "4 Super Zones", linkLabel: "Configure Hierarchy", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/subdivision", category: "Territory & Field" },
  { id: "m2", icon: "medication", iconBg: "bg-status-info-bg text-status-info", title: "Product", subTabsLabel: "5 sub tabs", statusLabel: "Active", description: "SKU catalogs, brand molecules, composition pricing, packaging & batch codes.", tagPrimary: "148 SKUs", tagSecondary: "24 Molecules", linkLabel: "Manage Products", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product", category: "Commercial & Products" },
  { id: "m3", icon: "badge", iconBg: "bg-brand-primary-subtle text-primary", title: "Field Force", subTabsLabel: "Ready module", statusLabel: "194 Reps", description: "Medical representatives, territory managers, hierarchy & designation mappings.", tagPrimary: "194 Active", tagSecondary: "2 Vacancies", linkLabel: "Reps & Mappings", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force", category: "Territory & Field" },
  { id: "m4", icon: "clinical_notes", iconBg: "bg-status-info-bg text-status-info", title: "Doctor", subTabsLabel: "4 sub tabs", statusLabel: "Verified", description: "Prescriber registry, specialization, hospital tags, MCL categories & core list.", tagPrimary: "12,450 Doctors", tagSecondary: "98% MCL tagged", linkLabel: "Doctor Master Registry", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor", category: "Commercial & Products" },
  { id: "m5", icon: "featured_play_list", iconBg: "bg-status-warning-bg text-status-warning", title: "Input", subTabsLabel: "Ready module", statusLabel: "86 Collaterals", description: "Physician sampling kits, promotional visual aids, LBLs, gift inventories & giveaways.", tagPrimary: "86 Items", tagSecondary: "Active Samples", linkLabel: "Sampling & Inputs", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/input", category: "Commercial & Products" },
  { id: "m6", icon: "map", iconBg: "bg-secondary-container text-secondary", title: "Territory Bulk Activation", subTabsLabel: "6 sub tabs", statusLabel: "100% Online", description: "Batch territory operations, beat realignment, patch status toggling.", tagPrimary: "48 Beats", tagSecondary: "Bulk Controls", linkLabel: "Territory Ops", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force-entries", category: "Territory & Field" },
  { id: "m7", icon: "calendar_month", iconBg: "bg-brand-primary-subtle text-primary", title: "Statewise - Holiday Fixation", subTabsLabel: "2 sub tabs", statusLabel: "Configured", description: "State-specific gazetted calendars, field off-days, and seasonal scheduling.", tagPrimary: "28 States", tagSecondary: "2026 Calendar", linkLabel: "Manage Calendars", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/statewise-holiday-fixation", category: "Territory & Field" },
  { id: "m8", icon: "store", iconBg: "bg-status-info-bg text-status-info", title: "Stockist Details", subTabsLabel: "8 sub tabs", statusLabel: "860 Active", description: "Authorized pharmaceutical distributors, stockist ledger, DL/GSTIN verification.", tagPrimary: "860 Stockists", tagSecondary: "GSTIN Synced", linkLabel: "Stockist Master", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/stockist-details", category: "Financial & Compliance" },
  { id: "m9", icon: "receipt_long", iconBg: "bg-status-warning-bg text-status-warning", title: "Expense Setup", subTabsLabel: "6 sub tabs", statusLabel: "Rates Active", description: "HQ/Ex-HQ/Outstation daily allowances, kilometer rates, and lodgings policy.", tagPrimary: "Grade A/B/C Bands", tagSecondary: "DA & TA Rules", linkLabel: "Allowance Policies", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/expense", category: "Financial & Compliance" },
  { id: "m10", icon: "supervisor_account", iconBg: "bg-secondary-container text-secondary", title: "Manager Expense", subTabsLabel: "6 sub tabs", statusLabel: "Configured", description: "Area & regional managerial expense caps, joint fieldwork allowance rules.", tagPrimary: "5 Policy Tiers", tagSecondary: "Manager Slab", linkLabel: "Manager Slabs", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/manager-expense", category: "Financial & Compliance" },
  { id: "m11", icon: "person_pin", iconBg: "bg-brand-primary-subtle text-primary", title: "Personal Information", subTabsLabel: "2 sub tabs", statusLabel: "100% KYC", description: "Emergency contacts, bank disbursement details, PF/ESI numbers.", tagPrimary: "100% Onboarded", tagSecondary: "Statutory Cleared", linkLabel: "Employee Details", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/personal-information", category: "Financial & Compliance" },
  { id: "m12", icon: "trending_up", iconBg: "bg-status-success-bg text-status-success", title: "Sales", subTabsLabel: "5 sub tabs", statusLabel: "Q3 Live", description: "Primary vs secondary targets, opening stock master, and liquidation thresholds.", tagPrimary: "Target Rules", tagSecondary: "Opening Stock", linkLabel: "Sales Rules & Targets", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/sales", category: "Commercial & Products" }
];

const CATEGORIES: Category[] = ["All", "Territory & Field", "Commercial & Products", "Financial & Compliance"];

type AuditRow = {
  id: string;
  module: string;
  dotColor: string;
  entityName: string;
  entityNote: string;
  changeType: "Created" | "Modified" | "Realigned" | "Suspended";
  updatedBy: string;
  updatedByNote: string;
  timestamp: string;
};

// Fallback rows shown only if the live GET /company/activity call fails or
// returns nothing (e.g. a brand-new tenant with no changes logged yet).
const fallbackAuditRows: AuditRow[] = [
  { id: "a1", module: "Doctor", dotColor: "bg-status-info", entityName: "Dr. Rajeshwar Sharma", entityNote: "MCL Core List • Max Healthcare Saket", changeType: "Created", updatedBy: "Anand Verma", updatedByNote: "North Ops Lead", timestamp: "14 min ago (10 Sep 2026, 14:48)" },
  { id: "a2", module: "Product", dotColor: "bg-primary", entityName: "ZiviCal D3 60k IU Softgels", entityNote: "SKU-8820 • Revised MRP & PTR Slabs", changeType: "Modified", updatedBy: "Pricing Committee", updatedByNote: "Corporate HQ", timestamp: "42 min ago (10 Sep 2026, 14:20)" },
  { id: "a3", module: "Territory Bulk", dotColor: "bg-secondary", entityName: "Andheri West Patch B", entityNote: "Realigned to Mumbai Metro Zone 2", changeType: "Realigned", updatedBy: "Admin Zivira", updatedByNote: "HQ Operations", timestamp: "1 hr ago (10 Sep 2026, 13:58)" },
  { id: "a4", module: "Expense Setup", dotColor: "bg-status-warning", entityName: "Metro Ex-HQ Daily Allowance", entityNote: "Updated from ₹480 to ₹520/day", changeType: "Modified", updatedBy: "Finance Team", updatedByNote: "Admin Zivira", timestamp: "2 hrs ago (10 Sep 2026, 12:45)" },
  { id: "a5", module: "Stockist Details", dotColor: "bg-status-danger", entityName: "Apex Medico Agencies", entityNote: "DL Renewal Pending (Kolkata Hub)", changeType: "Suspended", updatedBy: "Compliance Cell", updatedByNote: "Legal Dept", timestamp: "3 hrs ago (10 Sep 2026, 11:30)" }
];

const AUDIT_PAGE_SIZE = 5;

const changeTypePillClass: Record<AuditRow["changeType"], string> = {
  Created: "bg-status-success-bg text-status-success",
  Modified: "bg-status-info-bg text-status-info",
  Realigned: "bg-brand-primary-subtle text-primary",
  Suspended: "bg-status-warning-bg text-status-warning"
};
const changeTypeIcon: Record<AuditRow["changeType"], string> = {
  Created: "add_circle",
  Modified: "edit_note",
  Realigned: "sync_alt",
  Suspended: "pause_circle"
};

// GET /company/activity (src/routes/company.routes.ts) returns humanized
// entries like { title: "Doctor added", message: "A doctor record was
// added.", type: "success" | "warning" | "info", time }. It reads the same
// AuditLogModel collection every masters write already calls audit(...)
// against, but the schema never actually records *who* made the change
// (actorUserId is declared but never populated by any call site), so
// "Updated By" is honestly labeled rather than showing an invented name.
function mapActivityToAuditRow(entry: ActivityLogEntry): AuditRow {
  const match = entry.title.match(/^(.*)\s+(added|updated|deactivated|reactivated)$/i);
  const module = match ? match[1] : entry.title;
  const verb = match ? match[2].toLowerCase() : "";
  const changeType: AuditRow["changeType"] =
    verb === "added" ? "Created" : verb === "deactivated" ? "Suspended" : "Modified";
  const dotColor = entry.type === "success" ? "bg-status-success" : entry.type === "warning" ? "bg-status-warning" : "bg-status-info";
  let timestamp = entry.time;
  try {
    timestamp = new Date(entry.time).toLocaleString();
  } catch {
    // keep raw value
  }
  return {
    id: entry.id,
    module,
    dotColor,
    entityName: entry.title,
    entityNote: entry.message,
    changeType,
    updatedBy: "Not tracked",
    updatedByNote: "Actor identity isn't recorded by the audit log yet",
    timestamp
  };
}

export function AdminMastersDashboard() {
  const [modules] = useState<MasterModule[]>(initialModules);
  const [headerSearch, setHeaderSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [newModule, setNewModule] = useState({ title: "", description: "", href: "", category: "Territory & Field" as Exclude<Category, "All"> });
  const [customModules, setCustomModules] = useState<MasterModule[]>([]);

  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState("");
  const [auditIsLive, setAuditIsLive] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>("All Modules");
  const [auditPage, setAuditPage] = useState(1);

  async function loadAuditLog() {
    setAuditLoading(true);
    setAuditError("");
    try {
      const response = await apiClient.activityLog();
      if (response.data.length > 0) {
        setAuditRows(response.data.map(mapActivityToAuditRow));
        setAuditIsLive(true);
      } else {
        setAuditRows(fallbackAuditRows);
        setAuditIsLive(false);
      }
    } catch (loadError) {
      setAuditError(loadError instanceof Error ? loadError.message : "Unable to load audit log");
      setAuditRows(fallbackAuditRows);
      setAuditIsLive(false);
    } finally {
      setAuditLoading(false);
    }
  }

  useEffect(() => {
    void loadAuditLog();
  }, []);

  const allModules = useMemo(() => [...modules, ...customModules], [modules, customModules]);

  const filteredModules = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    return allModules.filter((m) => {
      if (category !== "All" && m.category !== category) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tagPrimary.toLowerCase().includes(q)
      );
    });
  }, [allModules, headerSearch, category]);

  const auditModuleOptions = useMemo(() => ["All Modules", ...Array.from(new Set(auditRows.map((r) => r.module)))], [auditRows]);

  const filteredAuditRows = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    return auditRows.filter((r) => {
      if (auditModuleFilter !== "All Modules" && r.module !== auditModuleFilter) return false;
      if (!q) return true;
      return (
        r.entityName.toLowerCase().includes(q) ||
        r.module.toLowerCase().includes(q) ||
        r.updatedBy.toLowerCase().includes(q)
      );
    });
  }, [auditRows, auditSearch, auditModuleFilter]);

  const auditTotalPages = Math.max(1, Math.ceil(filteredAuditRows.length / AUDIT_PAGE_SIZE));
  const auditSafePage = Math.min(auditPage, auditTotalPages);
  const auditPageRows = filteredAuditRows.slice((auditSafePage - 1) * AUDIT_PAGE_SIZE, auditSafePage * AUDIT_PAGE_SIZE);

  function handleBulkExport() {
    if (filteredModules.length === 0) return;
    downloadCsv(
      "master-directory.csv",
      filteredModules.map((m) => ({
        "Module": m.title,
        "Category": m.category,
        "Status": m.statusLabel,
        "Sub Tabs": m.subTabsLabel,
        "Description": m.description,
        "Primary Tag": m.tagPrimary,
        "Secondary Tag": m.tagSecondary
      }))
    );
  }

  function handleExportAuditLog() {
    if (filteredAuditRows.length === 0) return;
    downloadCsv(
      "master-audit-log.csv",
      filteredAuditRows.map((r) => ({
        "Module": r.module,
        "Entity": r.entityName,
        "Note": r.entityNote,
        "Change Type": r.changeType,
        "Updated By": r.updatedBy,
        "Timestamp": r.timestamp
      }))
    );
  }

  function handleQuickAdd() {
    if (!newModule.title.trim()) return;
    setCustomModules((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        icon: "widgets",
        iconBg: "bg-surface-subtle text-text-secondary",
        title: newModule.title.trim(),
        subTabsLabel: "New module",
        statusLabel: "Draft",
        description: newModule.description.trim() || "No description provided yet.",
        tagPrimary: "Session Only",
        tagSecondary: "Unsaved",
        linkLabel: "Open Module",
        href: newModule.href.trim() || "#",
        category: newModule.category
      }
    ]);
    setShowQuickAdd(false);
    setNewModule({ title: "", description: "", href: "", category: "Territory & Field" });
  }

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
            <input className="w-full h-[38px] pl-8 pr-3 rounded-lg bg-surface-canvas text-text-primary font-body-sm placeholder:text-text-muted border border-transparent focus:outline-none focus:border-border-strong focus:bg-surface-card shadow-sm transition-colors" placeholder="Search master records, SKUs, doctors..." type="text" value={headerSearch} onChange={(e) => setHeaderSearch(e.target.value)}/>
          </div>
          <button className="h-[38px] px-3.5 rounded-lg bg-surface-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" type="button" onClick={handleBulkExport} disabled={filteredModules.length === 0}>
            <span className="material-symbols-outlined text-[18px] text-text-secondary">download</span>
            <span className="">Bulk Export Master Data</span>
          </button>
          <button className="h-[38px] px-4 rounded-lg bg-primary hover:bg-brand-primary-hover text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all active:scale-95" type="button" onClick={() => setShowQuickAdd(true)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="">Quick Add Master Record</span>
          </button>
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
              <div className="bg-primary h-1.5 rounded-full transition-all duration-700" style={{ width: "100%" }}></div>
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
          <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg flex-wrap">
            {CATEGORIES.map((c) => {
              const count = c === "All" ? allModules.length : allModules.filter((m) => m.category === c).length;
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={active ? "px-3 py-1.5 rounded-md bg-surface-card text-primary font-bold shadow-sm text-label-sm" : "px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium"}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-grid-gutter">
          {filteredModules.length === 0 && (
            <p className="font-body-sm text-body-sm text-text-muted col-span-full py-6 text-center">No master modules match your search/category.</p>
          )}
          {filteredModules.map((m) => (
            <div key={m.id} className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg ${m.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">{m.title}</h3>
                      <span className="font-label-sm text-[11px] text-text-muted">{m.subTabsLabel}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>{m.statusLabel}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-text-secondary">{m.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">{m.tagPrimary}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">{m.tagSecondary}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
                <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href={m.href}>
                  <span className="">{m.linkLabel}</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
                <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button" onClick={() => setDetail({ title: `${m.title} — Module Details`, body: `${m.description} Category: ${m.category}. Status: ${m.statusLabel}. ${m.tagPrimary} • ${m.tagSecondary}.` })}>
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary">Recent Master Modifications &amp; Audit Trail</h2>
            <p className="font-body-sm text-body-sm text-text-muted">Real-time changelog of data definitions, doctor registries, pricing and territory alignments</p>
            {auditLoading && <p className="font-body-sm text-body-sm text-text-muted mt-1">Loading live audit log…</p>}
            {!auditLoading && auditIsLive && (
              <p className="font-label-sm text-label-sm text-status-success mt-1">Live — from GET /company/activity</p>
            )}
            {!auditLoading && !auditIsLive && (
              <p className="font-label-sm text-label-sm text-text-muted mt-1">
                {auditError ? `Preview data — could not reach the audit log (${auditError}).` : "Preview data — no changes logged yet for this tenant."}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[17px]">filter_list</span>
              <input className="w-full h-[36px] pl-8 pr-3 rounded-lg bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:bg-surface-card shadow-sm border border-border-subtle focus:border-border-strong" placeholder="Filter logs by user or entity..." type="text" value={auditSearch} onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }}/>
            </div>
            <select className="h-[36px] px-3 rounded-lg bg-surface-subtle border border-border-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md shadow-sm transition-colors" value={auditModuleFilter} onChange={(e) => { setAuditModuleFilter(e.target.value); setAuditPage(1); }}>
              {auditModuleOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <button className="h-[36px] px-3 rounded-lg bg-surface-subtle border border-border-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" type="button" onClick={handleExportAuditLog} disabled={filteredAuditRows.length === 0}>
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="">Export Audit Log</span>
            </button>
          </div>
        </div>
        <div className="w-full overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-table-header-height bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider border-b border-border-subtle">
                <th className="px-4">Module</th>
                <th className="px-4">Entity Name</th>
                <th className="px-4">Change Type</th>
                <th className="px-4">Updated By</th>
                <th className="px-4">Timestamp</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-sm text-body-sm text-text-primary">
              {auditPageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted font-body-sm text-body-sm">No audit records match your search/filter.</td>
                </tr>
              )}
              {auditPageRows.map((r) => (
                <tr key={r.id} className="h-table-row-height hover:bg-surface-canvas/60 transition-colors">
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${r.dotColor}`}></span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{r.module}</span>
                    </div>
                  </td>
                  <td className="px-4">
                    <span className="font-medium text-text-primary">{r.entityName}</span>
                    <span className="block font-label-sm text-text-muted">{r.entityNote}</span>
                  </td>
                  <td className="px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${changeTypePillClass[r.changeType]}`}>
                      <span className="material-symbols-outlined text-[13px]">{changeTypeIcon[r.changeType]}</span>{r.changeType}
                    </span>
                  </td>
                  <td className="px-4">
                    <span className="text-text-primary font-medium">{r.updatedBy}</span>
                    <span className="block font-label-sm text-text-muted">{r.updatedByNote}</span>
                  </td>
                  <td className="px-4 text-text-muted font-body-sm">{r.timestamp}</td>
                  <td className="px-4 text-right">
                    <button className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle hover:bg-brand-primary-subtle hover:border-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors" type="button" onClick={() => setDetail({ title: `${r.entityName} — Change Diff`, body: `Module: ${r.module}. Change: ${r.changeType}. ${r.entityNote}. Updated by ${r.updatedBy} (${r.updatedByNote}) — ${r.timestamp}.` })}>View Diff</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 font-body-sm text-body-sm text-text-secondary">
          <div className="">
            {filteredAuditRows.length === 0 ? "No matching audit records" : (
              <>Showing <strong className="text-text-primary">{(auditSafePage - 1) * AUDIT_PAGE_SIZE + 1} to {Math.min(auditSafePage * AUDIT_PAGE_SIZE, filteredAuditRows.length)}</strong> of <strong className="text-text-primary">{filteredAuditRows.length}</strong> Audit Records Today</>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1 rounded bg-surface-canvas border border-border-subtle hover:bg-surface-subtle text-text-muted disabled:opacity-40 font-label-md text-label-md" disabled={auditSafePage <= 1} type="button" onClick={() => setAuditPage((p) => Math.max(1, p - 1))}>Prev</button>
            {Array.from({ length: auditTotalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === auditSafePage ? "w-7 h-7 rounded border border-primary bg-primary text-on-primary font-label-md text-label-md font-semibold" : "w-7 h-7 rounded border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md"} type="button" onClick={() => setAuditPage(n)}>{n}</button>
            ))}
            <button className="px-2.5 py-1 rounded bg-surface-canvas border border-border-subtle hover:bg-surface-subtle text-text-primary font-label-md text-label-md disabled:opacity-40" disabled={auditSafePage >= auditTotalPages} type="button" onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}>Next</button>
          </div>
        </div>
      </section>

      {/* Quick Add Master Record modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowQuickAdd(false)}>
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-sm text-headline-sm text-text-primary text-lg">Quick Add Master Record</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Module title *" value={newModule.title} onChange={(e) => setNewModule((s) => ({ ...s, title: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Description" value={newModule.description} onChange={(e) => setNewModule((s) => ({ ...s, description: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Link path (optional)" value={newModule.href} onChange={(e) => setNewModule((s) => ({ ...s, href: e.target.value }))} />
              <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={newModule.category} onChange={(e) => setNewModule((s) => ({ ...s, category: e.target.value as Exclude<Category, "All"> }))}>
                <option value="Territory & Field">Territory &amp; Field</option>
                <option value="Commercial & Products">Commercial &amp; Products</option>
                <option value="Financial & Compliance">Financial &amp; Compliance</option>
              </select>
            </div>
            <p className="text-[11px] text-text-muted">Added to this directory for the current session. There is no master-modules database collection yet, so this does not persist after a page reload.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowQuickAdd(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-brand-primary-hover disabled:opacity-50" disabled={!newModule.title.trim()} onClick={handleQuickAdd}>Add Module</button>
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
