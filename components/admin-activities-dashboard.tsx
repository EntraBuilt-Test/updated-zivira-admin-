"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { apiClient, type DcrRecord, type Employee } from "@/lib/api-client";
import { downloadCsv } from "@/lib/download-csv";

// Item fix — this page used to be a fully static server component, then a
// later pass wired every button up against a local mock array. This pass
// replaces the mock array with the real field-visit DCR log
// (apiClient.dcrs()), joined against apiClient.employees() for rep names,
// so the table shows actual submitted DCRs. Approve / Bulk Approve now call
// the real apiClient.approveDcr(id) endpoint. A few things the mock had
// (chemist/stockist order tracking, live GPS route map, VA session
// analytics) have no backing collection on the DCR record at all — those
// panels/tabs are left as empty/"No data yet" states instead of fabricated
// numbers, and are called out below.

type ActivityStatus = "Approved" | "Under Review" | "Rejected" | "Draft / In-Transit";
type ActivityCategory = "call" | "chemist" | "dispatch";
type SecondaryAction = "approve" | "auditFlag" | "more";

type ActivityRow = {
  id: string;
  avatarInitials: string;
  avatarClass: string;
  repName: string;
  repMeta: string;
  contactName: string;
  contactMeta: string;
  activityTypeLabel: string;
  activityTypeIcon: string;
  activityTypeClass: string;
  timeLabel: string;
  geoText: string;
  geoVariant: "success" | "danger";
  products: string[];
  promo: string;
  status: ActivityStatus;
  zone: string;
  category: ActivityCategory;
  rowBgClass: string;
  hoverBgClass: string;
  secondaryAction: SecondaryAction;
};

function mapDcrStatus(status: DcrRecord["status"]): ActivityStatus {
  if (status === "APPROVED" || status === "MANAGER_APPROVED") return "Approved";
  if (status === "SUBMITTED") return "Under Review";
  if (status === "REJECTED") return "Rejected";
  return "Draft / In-Transit";
}

function mapDcrToRow(d: DcrRecord, employeeByCode: Map<string, Employee>): ActivityRow {
  const emp = employeeByCode.get(d.employeeCode);
  const doctor = d.doctorId;
  const repName = emp?.name || d.employeeCode;
  const initials = repName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "NA";
  const contactName = doctor?.name || "Unknown Doctor";
  const contactMeta = [doctor?.specialty, doctor?.clinicName].filter(Boolean).join(" · ") || "—";
  const isJoint = !!d.jointWork?.wasJoint;
  const activityTypeLabel = isJoint ? "Joint Work w/ Manager" : "Doctor Detail";
  const timeLabel = d.callTime || (d.visitDate ? new Date(d.visitDate).toLocaleString() : "—");
  const geoVariant: "success" | "danger" = d.overVisitFlag ? "danger" : "success";
  const geoText = d.overVisitFlag ? `Over-visit flagged${d.overVisitCount ? ` (${d.overVisitCount} visits this month)` : ""}` : "No over-visit flag";
  const products = d.productsDetailed || [];
  const sampleParts = (d.samplesGiven || []).map((s) => `${s.qty}x ${s.productName || s.product || "Sample"}`);
  const inputParts = (d.inputsGiven || []).map((i) => `${i.qty}x ${i.inputName || i.inputType || "Input"}`);
  const promo = [...sampleParts, ...inputParts].join(", ") || "None logged";
  const status = mapDcrStatus(d.status);
  return {
    id: d.id,
    avatarInitials: initials,
    avatarClass: "bg-surface-container-high text-on-surface-variant",
    repName,
    repMeta: `${d.employeeCode}${emp?.territory ? " · " + emp.territory : ""}`,
    contactName,
    contactMeta,
    activityTypeLabel,
    activityTypeIcon: isJoint ? "groups" : "person_check",
    activityTypeClass: isJoint ? "bg-status-info-bg text-status-info" : "bg-brand-primary-subtle text-primary",
    timeLabel,
    geoText,
    geoVariant,
    products,
    promo,
    status,
    zone: emp?.territory || "Unassigned",
    category: "call",
    rowBgClass: d.overVisitFlag ? "bg-status-danger-bg/10" : "bg-surface-card",
    hoverBgClass: d.overVisitFlag ? "hover:bg-status-danger-bg/20" : "hover:bg-surface-subtle/70",
    secondaryAction: status === "Rejected" ? "auditFlag" : status === "Under Review" ? "approve" : "more"
  };
}

const PAGE_SIZES = [25, 50, 100];

export function AdminActivitiesDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [tab, setTab] = useState<"all" | "call" | "chemist" | "dispatch">("all");
  const [statusChip, setStatusChip] = useState<"all" | "verified" | "flagged" | "pending" | "approved">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showLog, setShowLog] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [newActivity, setNewActivity] = useState({ repName: "", contactName: "", activityTypeLabel: "Doctor Detail", products: "", promo: "" });
  const [actionError, setActionError] = useState("");

  async function loadActivities() {
    setLoading(true);
    setLoadError("");
    try {
      const [dcrResponse, employeeResponse] = await Promise.all([apiClient.dcrs(), apiClient.employees()]);
      const employeeByCode = new Map<string, Employee>(employeeResponse.data.map((e) => [e.employeeCode, e]));
      setRows(dcrResponse.data.map((d) => mapDcrToRow(d, employeeByCode)));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load field activities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  const zoneOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.zone))).sort(), [rows]);

  const statusCounts = useMemo(() => ({
    all: rows.length,
    verified: rows.filter((r) => r.geoVariant === "success").length,
    flagged: rows.filter((r) => r.status === "Rejected").length,
    pending: rows.filter((r) => r.status === "Under Review").length,
    approved: rows.filter((r) => r.status === "Approved").length
  }), [rows]);

  const STATUS_CHIPS: { key: "all" | "verified" | "flagged" | "pending" | "approved"; label: string }[] = [
    { key: "all", label: `All (${statusCounts.all})` },
    { key: "verified", label: `No Over-Visit Flag (${statusCounts.verified})` },
    { key: "flagged", label: `Rejected (${statusCounts.flagged})` },
    { key: "pending", label: `Pending Review (${statusCounts.pending})` },
    { key: "approved", label: `Approved (${statusCounts.approved})` }
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (zoneFilter !== "all" && r.zone !== zoneFilter) return false;
      if (tab !== "all" && r.category !== tab) return false;
      if (statusChip === "verified" && r.geoVariant !== "success") return false;
      if (statusChip === "flagged" && r.status !== "Rejected") return false;
      if (statusChip === "pending" && r.status !== "Under Review") return false;
      if (statusChip === "approved" && r.status !== "Approved") return false;
      if (!q) return true;
      return (
        r.repName.toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.contactMeta.toLowerCase().includes(q) ||
        r.activityTypeLabel.toLowerCase().includes(q)
      );
    });
  }, [rows, zoneFilter, tab, statusChip, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pendingCount = statusCounts.pending;
  const rejectedCount = statusCounts.flagged;
  const overVisitCount = rows.filter((r) => r.geoVariant === "danger").length;

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function approveRow(id: string) {
    setActionError("");
    try {
      await apiClient.approveDcr(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved", secondaryAction: "more" } : r)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve DCR.");
    }
  }

  async function bulkApprove() {
    if (selected.size === 0) return;
    setActionError("");
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => apiClient.approveDcr(id)));
      setRows((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, status: "Approved", secondaryAction: "more" } : r)));
      setSelected(new Set());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to bulk-approve some DCRs.");
    }
  }

  function requestExplanation() {
    if (selected.size === 0) {
      setDetail({ title: "Request Explanation", body: "Select one or more rows using the checkboxes first, then Request Explanation to flag them to the rep for a written note." });
      return;
    }
    const names = rows.filter((r) => selected.has(r.id)).map((r) => r.repName).join(", ");
    setDetail({ title: "Request Explanation", body: `An explanation request has been queued for: ${names}. This is recorded for this session only — there is no field-ops messaging backend wired up yet.` });
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "field-activities-dcr.csv",
      filtered.map((r) => ({
        "Medical Rep": r.repName,
        "Rep Info": r.repMeta,
        "Doctor/Contact": r.contactName,
        "Contact Info": r.contactMeta,
        "Activity Type": r.activityTypeLabel,
        "Time": r.timeLabel,
        "Over-Visit Flag": r.geoText,
        "Products": r.products.join("; "),
        "Promo/Samples": r.promo,
        "Status": r.status,
        "Zone": r.zone
      }))
    );
  }

  function handleLogActivity() {
    if (!newActivity.repName.trim() || !newActivity.contactName.trim()) return;
    const initials = newActivity.repName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "NA";
    setRows((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        avatarInitials: initials, avatarClass: "bg-surface-container-high text-on-surface-variant",
        repName: newActivity.repName.trim(), repMeta: "New Log (unsynced)",
        contactName: newActivity.contactName.trim(), contactMeta: "—",
        activityTypeLabel: newActivity.activityTypeLabel, activityTypeIcon: "person_check", activityTypeClass: "bg-brand-primary-subtle text-primary",
        timeLabel: "Just now", geoText: "No over-visit flag", geoVariant: "success",
        products: newActivity.products.trim() ? newActivity.products.split(",").map((s) => s.trim()) : [],
        promo: newActivity.promo.trim() || "None logged",
        status: "Draft / In-Transit", zone: "Unassigned", category: "call",
        rowBgClass: "bg-surface-card", hoverBgClass: "hover:bg-surface-subtle/70", secondaryAction: "more"
      }
    ]);
    setShowLog(false);
    setNewActivity({ repName: "", contactName: "", activityTypeLabel: "Doctor Detail", products: "", promo: "" });
    setPage(totalPages + 1);
  }

  function resetFilters() {
    setZoneFilter("all");
    setTab("all");
    setStatusChip("all");
    setSearch("");
    setPage(1);
  }

  const statusPillClass: Record<ActivityStatus, string> = {
    "Approved": "bg-status-success-bg text-status-success",
    "Under Review": "bg-status-warning-bg text-status-warning",
    "Rejected": "bg-status-danger-bg text-status-danger",
    "Draft / In-Transit": "bg-surface-subtle text-text-secondary"
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full space-y-6">
{/* TOP BREADCRUMB & EXECUTIVE ACTION BAR */}
<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1">
<div className="flex flex-col space-y-1"><div className="flex items-center gap-2"><span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span><span className="text-text-muted text-body-sm font-body-sm">/</span><span className="font-label-md text-label-md text-primary font-semibold">Activities</span></div><div className="flex items-center gap-3 flex-wrap"><h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Activities</h1><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md"><span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>Field DCR Log</span></div><p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2"><span className="">Field force visit reporting (DCRs): physician call audit, over-visit flags, and manager approvals across submitted field activities.</span></p></div>
{/* ACTION CONTROLS & COMMAND FILTERS */}
<div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
<div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-text-muted text-[18px]">public</span>
<select
  className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none cursor-pointer"
  value={zoneFilter}
  onChange={(e) => { setZoneFilter(e.target.value); setPage(1); }}
>
<option value="all">All Zones / Territories</option>
{zoneOptions.map((z) => <option key={z} value={z}>{z}</option>)}
</select>
</div>
<div className="relative group">
<button className="flex items-center gap-2 bg-surface-card hover:bg-surface-subtle text-text-primary px-3.5 py-2 rounded-lg font-label-md text-label-md shadow-sm transition-all" type="button" onClick={handleExport} disabled={filtered.length === 0}>
<span className="material-symbols-outlined text-secondary text-[18px]">download</span>
<span className="">Export DCR</span>
</button>
</div>
<button className="flex items-center gap-2 bg-primary hover:bg-brand-primary-hover active:scale-[0.98] text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md shadow-md transition-all" type="button" onClick={() => setShowLog(true)}>
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span className="">Log Field Activity</span>
</button>
</div>
</div>

{loadError && (
  <div className="p-3 rounded-lg border border-status-danger-bg bg-status-danger-bg text-red-600 text-xs flex items-center justify-between">
    <span>{loadError}</span>
    <button type="button" className="font-semibold underline" onClick={loadActivities}>Retry</button>
  </div>
)}
{actionError && (
  <div className="p-3 rounded-lg border border-status-danger-bg bg-status-danger-bg text-red-600 text-xs">{actionError}</div>
)}

{/* OPERATIONAL SUMMARY METRIC CARDS (4-COL GRID) — now computed from the real DCR log */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
{/* Card 1 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total DCRs Logged</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">{loading ? "—" : rows.length}</span>
<span className="font-body-sm text-body-sm text-text-muted">Field Visits</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
</div>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Doctor Detailing Visits</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-text-primary">{loading ? "—" : rows.filter((r) => r.category === "call").length}</span>
<span className="font-body-sm text-body-sm text-text-secondary">Visits</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">stethoscope</span>
</div>
</div>
<div className="text-[11px] text-text-muted italic">E-detailing / VA engagement stats: no data yet — no VA session backend module wired to this dashboard.</div>
</div>
{/* Card 3 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Chemist &amp; Stockist Orders</span>
</div>
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">receipt_long</span>
</div>
</div>
<div className="text-xs text-text-muted italic">No data yet — chemist/stockist order booking is not tracked on the DCR record.</div>
</div>
{/* Card 4 */}
<div className="bg-surface-card p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-status-danger">Pending Approvals &amp; Alerts</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-metric-value text-metric-value text-status-danger">{loading ? "—" : pendingCount}</span>
<span className="font-body-sm text-body-sm text-text-muted">Awaiting Review</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">warning_amber</span>
</div>
</div>
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded-full bg-status-danger-bg text-status-danger font-label-sm text-label-sm">
          {overVisitCount} Over-Visit Flags
        </span>
<span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning font-label-sm text-label-sm">
          {rejectedCount} Rejected
        </span>
</div>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4">
  <AdminTabGrid node={node} path={path} />
</div>
{/* INTERACTIVE VIEW TABS & ADVANCED SEARCH CONSOLE */}
<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4">
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b-0">
{/* Operational Navigation Sub-tabs */}
<div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-canvas rounded-lg">
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${tab === "all" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setTab("all"); setPage(1); }}
>
          Live Call Logs ({rows.length})
        </button>
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors flex items-center gap-1.5 ${statusChip === "pending" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setStatusChip("pending"); setPage(1); }}
>
<span className="">DCR Approvals</span>
<span className="w-5 h-5 rounded-full bg-status-danger text-on-primary text-[10px] flex items-center justify-center">{pendingCount}</span>
</button>
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${tab === "chemist" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setTab("chemist"); setPage(1); }}
  title="No chemist/stockist order data is tracked on the DCR record yet"
>
          Chemist Orders &amp; POB
        </button>
<button
  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors ${tab === "dispatch" ? "bg-surface-card text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
  type="button"
  onClick={() => { setTab("dispatch"); setPage(1); }}
  title="No sample/promo dispatch data is tracked separately from DCR sample line items yet"
>
          Sample / Promo Dispatches
        </button>
</div>
{/* Quick Operations Actions */}
<div className="flex items-center gap-2">
<button
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-success-bg hover:bg-status-success/20 text-status-success font-label-md text-label-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  onClick={bulkApprove}
  disabled={selected.size === 0}
>
<span className="material-symbols-outlined text-[16px]">done_all</span>
<span className="">Bulk Approve Selected{selected.size > 0 ? ` (${selected.size})` : ""}</span>
</button>
<button
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-md text-label-md transition-all"
  type="button"
  onClick={requestExplanation}
>
<span className="material-symbols-outlined text-[16px]">help_outline</span>
<span className="">Request Explanation</span>
</button>
</div>
</div>
{/* Live Filters & Query Bar */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
<input
  className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
  placeholder="Search by Doctor name, Medical Rep (MR), Specialization, or Clinic..."
  type="text"
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
/>
</div>
<div className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-secondary">
<span className="text-text-muted uppercase">Status:</span>
{STATUS_CHIPS.map((chip) => {
  const active = statusChip === chip.key;
  const baseClass = chip.key === "flagged" ? "bg-status-danger-bg text-status-danger hover:opacity-90" : chip.key === "pending" ? "bg-status-warning-bg text-status-warning hover:opacity-90" : "bg-surface-canvas hover:bg-surface-subtle text-text-secondary";
  return (
    <button
      key={chip.key}
      className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${active && chip.key === "all" ? "bg-brand-primary-subtle text-primary" : active ? "ring-2 ring-primary/40 " + baseClass : baseClass.replace(" font-semibold", "")}`}
      type="button"
      onClick={() => { setStatusChip(chip.key); setPage(1); }}
    >
      {chip.label}
    </button>
  );
})}
<button type="button" className="px-2.5 py-1 rounded-full text-text-muted hover:text-text-primary underline" onClick={resetFilters}>Reset</button>
</div>
</div>
</div>
{/* MAIN DATA ROSTER: COMPREHENSIVE DCR & FIELD ACTIVITIES TABLE */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-card-padding-spacious py-3.5 bg-surface-card flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">badge</span>
<span className="font-headline-sm text-headline-sm text-text-primary">Field Activity Telemetry (Submitted DCRs)</span>
</div>
<div className="flex items-center gap-3 text-text-muted font-body-sm text-body-sm">
<span className="">{loading ? "Loading…" : filtered.length === 0 ? "No entries" : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} logs`}</span>
<div className="flex items-center gap-1">
<button className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-subtle text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<span className="font-label-md text-label-md text-text-primary">Page {safePage}/{totalPages}</span>
<button className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-subtle text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Responsive Scrollable Data Grid */}
<div className="w-full overflow-x-auto">
<table className="w-full text-left font-table-cell text-table-cell text-text-primary min-w-[1240px]">
<thead>
<tr className="bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider h-table-header-height">
<th className="w-10 px-4 text-center"></th>
<th className="px-3 py-2">Medical Rep (MR)</th>
<th className="px-3 py-2">Doctor / Contact Info</th>
<th className="px-3 py-2">Activity Type</th>
<th className="px-3 py-2">Timestamp &amp; Over-Visit Flag</th>
<th className="px-3 py-2">Products Detailed</th>
<th className="px-3 py-2">Promo / Samples Handover</th>
<th className="px-3 py-2 text-center">Verification Status</th>
<th className="px-4 py-2 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0">
{loading && (
  <tr><td colSpan={9} className="px-4 py-10 text-center text-text-muted font-body-sm text-body-sm">Loading field activities…</td></tr>
)}
{!loading && pageRows.length === 0 && (
  <tr><td colSpan={9} className="px-4 py-10 text-center text-text-muted font-body-sm text-body-sm">No activities match the current search/filters.</td></tr>
)}
{!loading && pageRows.map((r) => (
<tr key={r.id} className={`${r.hoverBgClass} transition-colors h-table-row-height ${r.rowBgClass}`}>
<td className="w-10 px-4 text-center">
<input className="rounded accent-primary w-4 h-4 cursor-pointer" type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelected(r.id)} />
</td>
<td className="px-3 py-3">
<div className="flex items-center gap-3">
<div className={`w-9 h-9 rounded-full ${r.avatarClass} font-headline-sm flex items-center justify-center flex-shrink-0`}>
                  {r.avatarInitials}
                </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-text-primary truncate">{r.repName}</span>
<span className="font-body-sm text-body-sm text-text-muted">{r.repMeta}</span>
</div>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">{r.contactName}</span>
<span className="font-body-sm text-body-sm text-text-secondary">{r.contactMeta}</span>
</div>
</td>
<td className="px-3 py-3">
<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${r.activityTypeClass} font-label-sm text-label-sm`}>
<span className="material-symbols-outlined text-[13px]">{r.activityTypeIcon}</span> {r.activityTypeLabel}
              </span>
</td>
<td className="px-3 py-3">
<div className="flex flex-col">
<div className={`flex items-center gap-1.5 font-label-md text-label-md ${r.geoVariant === "success" ? "text-text-primary" : "text-status-danger"}`}>
<span className={`material-symbols-outlined ${r.geoVariant === "success" ? "text-status-success" : ""} text-[16px]`}>{r.geoVariant === "success" ? "verified" : "location_off"}</span>
<span className="">{r.timeLabel}</span>
</div>
<span className={`font-body-sm text-body-sm ${r.geoVariant === "success" ? "text-status-success" : "text-status-danger font-semibold"}`}>
                  {r.geoText}
                </span>
</div>
</td>
<td className="px-3 py-3">
<div className="flex flex-wrap gap-1">
{r.products.length === 0 ? <span className="text-text-muted text-[11px]">None</span> : r.products.map((p) => (
  <span key={p} className="px-2 py-0.5 rounded bg-surface-canvas text-text-primary text-[11px] font-medium">{p}</span>
))}
</div>
</td>
<td className="px-3 py-3 font-body-sm text-body-sm text-text-secondary">
              {r.promo}
            </td>
<td className="px-3 py-3 text-center">
<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${statusPillClass[r.status]} font-label-sm text-label-sm`}>
{r.status !== "Draft / In-Transit" && <span className={`w-1.5 h-1.5 rounded-full ${r.status === "Approved" ? "bg-status-success" : r.status === "Under Review" ? "bg-status-warning" : "bg-status-danger"}`}></span>} {r.status}
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-1.5">
{r.secondaryAction === "auditFlag" ? (
  <button
    className="px-2 py-1 rounded bg-status-danger-bg hover:bg-status-danger hover:text-on-primary text-status-danger font-label-sm text-label-sm transition-colors"
    type="button"
    onClick={() => setDetail({ title: `Rejected DCR — ${r.repName}`, body: `${r.contactName} visit was rejected. Logged at ${r.timeLabel}. ${r.geoText}.` })}
  >
                  Rejected
                </button>
) : (
  <>
    <button
      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors"
      title="Inspect Call"
      type="button"
      onClick={() => setDetail({ title: `${r.contactName} — Inspect Call`, body: `Rep: ${r.repName} (${r.repMeta}). Activity: ${r.activityTypeLabel} at ${r.timeLabel}. ${r.geoText}. Products: ${r.products.join(", ") || "None"}. Promo/Samples: ${r.promo}. Status: ${r.status}.` })}
    >
      <span className="material-symbols-outlined text-[18px]">visibility</span>
    </button>
    {r.secondaryAction === "approve" && (
      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-status-success transition-colors" title="Approve" type="button" onClick={() => approveRow(r.id)}>
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
      </button>
    )}
    {r.secondaryAction === "more" && (
      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-canvas text-text-secondary hover:text-text-primary transition-colors" title="More" type="button" onClick={() => setDetail({ title: `${r.repName} — More Options`, body: `${r.contactName}: ${r.promo}. Status: ${r.status}. Zone: ${r.zone}.` })}>
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
    )}
  </>
)}
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
{/* Table Pagination Footer */}
<div className="px-card-padding-spacious py-3 bg-surface-canvas/50 flex flex-col sm:flex-row items-center justify-between gap-3">
<div className="flex items-center gap-2 font-body-sm text-body-sm text-text-muted">
<span className="">Rows per page:</span>
<select
  className="bg-surface-card px-2 py-1 rounded text-text-primary font-label-md text-label-md focus:outline-none"
  value={pageSize}
  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
>
{PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
</select>
<span className="">{filtered.length === 0 ? "No entries" : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} entries`}</span>
</div>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded text-text-muted hover:bg-surface-card font-label-md text-label-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage(1)} disabled={safePage <= 1}>First</button>
<button className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:bg-surface-card disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} className={`w-7 h-7 rounded font-label-md text-label-md flex items-center justify-center ${n === safePage ? "bg-primary text-on-primary" : "hover:bg-surface-card text-text-secondary"}`} type="button" onClick={() => setPage(n)}>{n}</button>
))}
<button className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:bg-surface-card disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
<button className="px-2.5 py-1 rounded text-text-secondary hover:bg-surface-card font-label-md text-label-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed" type="button" onClick={() => setPage(totalPages)} disabled={safePage >= totalPages}>Last</button>
</div>
</div>
</div>
{/* AUXILIARY PANEL: E-DETAILING / VA ANALYTICS — no backend module exists for this yet */}
<div className="grid grid-cols-1 gap-5 items-stretch">
<div className="bg-surface-card rounded-xl shadow-sm p-card-padding-spacious flex flex-col justify-between space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">analytics</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-text-primary">E-Detailing VA Session Metrics</h2>
<span className="font-body-sm text-body-sm text-text-muted">Digital Visual Aid Engagement</span>
</div>
</div>
</div>
<div className="text-xs text-text-muted italic p-3 bg-surface-canvas rounded-lg">No data yet — there is no VA/e-detailing session tracking backend module wired to this dashboard.</div>
</div>
</div>
    </div>

    {/* Log Field Activity modal */}
    {showLog && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowLog(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Log Field Activity</h3>
          <div className="space-y-3">
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Medical Rep name *" value={newActivity.repName} onChange={(e) => setNewActivity((s) => ({ ...s, repName: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Doctor / Contact name *" value={newActivity.contactName} onChange={(e) => setNewActivity((s) => ({ ...s, contactName: e.target.value }))} />
            <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={newActivity.activityTypeLabel} onChange={(e) => setNewActivity((s) => ({ ...s, activityTypeLabel: e.target.value }))}>
              <option>Doctor Detail</option>
              <option>Joint Work w/ Manager</option>
            </select>
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Products detailed (comma separated)" value={newActivity.products} onChange={(e) => setNewActivity((s) => ({ ...s, products: e.target.value }))} />
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Promo / Samples handover" value={newActivity.promo} onChange={(e) => setNewActivity((s) => ({ ...s, promo: e.target.value }))} />
          </div>
          <p className="text-[11px] text-text-muted">Field DCRs are normally submitted from the field app. This manually logged entry is kept in this browser session only — there is no admin-side "create DCR" endpoint, so it does not persist after a page reload.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowLog(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-brand-primary-hover disabled:opacity-50" disabled={!newActivity.repName.trim() || !newActivity.contactName.trim()} onClick={handleLogActivity}>Log Activity</button>
          </div>
        </div>
      </div>
    )}

    {/* Read-only detail popup */}
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
