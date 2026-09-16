"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";
import { apiClient, type ProductExposureRow, type AlertRow } from "@/lib/api-client";

// This page used to be a fully static server component: every number was
// hand-typed JSX and none of its buttons/selects/inputs had a real
// onClick/onChange handler. A later pass made the Territory/HQ table's
// search/filters/sort/pagination/export interactive against local mock rows.
//
// This pass investigated every apiClient.* candidate and wired in the ones
// that genuinely match this page's sections:
//   - "HCP List Coverage" KPI card    -> apiClient.territoryDoctorCounts()
//     (real active/total doctor counts, aggregated into a coverage %)
//   - "Brand Basket Revenue Contribution" panel -> apiClient.productExposure()
//     (real per-product doctor reach / samples / visits — no revenue figures
//     exist on the backend, so the "amount"/MoM trend columns are replaced
//     with the real exposure metrics instead of keeping fake currency)
//   - "Executive Exception Alerts" panel -> apiClient.alertsEngine()
//     (the 3 alert cards now show real HIGH/MEDIUM-severity alerts)
// The "Division & Territory Sales Variance" table (target/achieved revenue
// per HQ) and the "Secondary Sales", "Field Rep Productivity", and "Sample
// Conversion ROI" KPI cards have no matching backend endpoint (there is no
// sales/target/POB collection yet), so they keep their original interactive
// mock data with an explicit "Preview data — not yet backend-wired" note
// instead of silently presenting invented numbers as real. Every existing
// button, filter, search, export, sort, pagination, and modal keeps working.

type TerritoryRow = {
  id: string;
  zone: "North" | "West Metro" | "South Zone" | "East Central";
  hqName: string;
  abmName: string;
  mrCount: number;
  division: string;
  divisionBadgeClass: string;
  target: string;
  achieved: string;
  progressPct: number;
  progressClass: string;
  progressBarClass: string;
  progressBarWidth: string;
  variance: string;
  varianceClass: string;
  dailyCalls: string;
  dailyCallsClass: string;
  coreCoverage: string;
  coreCoverageClass: string;
  pobBooked: string;
  flagLabel: string;
  flagClass: string;
  flagIcon: string;
  rowClass: string;
  dotClass: string;
  dotTitle: string;
  thirdActionIcon: string;
  thirdActionTitle: string;
  thirdActionClass: string;
};

const initialRows: TerritoryRow[] = [
  {
    id: "hq-041", zone: "North", hqName: "Ahmedabad Metro - HQ-041", abmName: "Rajesh Varma", mrCount: 18,
    division: "Cardio-Diabetic", divisionBadgeClass: "bg-status-info-bg text-status-info",
    target: "₹52,00,000", achieved: "₹56,42,000", progressPct: 108.5, progressClass: "text-status-success",
    progressBarClass: "bg-status-success", progressBarWidth: "100%",
    variance: "+₹4,42,000", varianceClass: "text-status-success",
    dailyCalls: "12.4", dailyCallsClass: "text-text-primary",
    coreCoverage: "96.8%", coreCoverageClass: "bg-status-success-bg text-status-success",
    pobBooked: "₹14.8 L", flagLabel: "Top Performer", flagClass: "bg-status-success-bg text-status-success border border-status-success-border", flagIcon: "stars",
    rowClass: "", dotClass: "bg-status-success", dotTitle: "Healthy Execution",
    thirdActionIcon: "thumb_up", thirdActionTitle: "Send Commendation", thirdActionClass: "hover:text-status-success"
  },
  {
    id: "hq-012", zone: "South Zone", hqName: "Bengaluru Urban - HQ-012", abmName: "S. Parthiban", mrCount: 22,
    division: "Neuro-Ziv", divisionBadgeClass: "bg-purple-50 text-purple-700",
    target: "₹68,00,000", achieved: "₹65,28,000", progressPct: 96.0, progressClass: "text-text-primary",
    progressBarClass: "bg-status-info", progressBarWidth: "96%",
    variance: "-₹2,72,000", varianceClass: "text-status-warning",
    dailyCalls: "11.1", dailyCallsClass: "text-text-primary",
    coreCoverage: "92.1%", coreCoverageClass: "bg-status-info-bg text-status-info",
    pobBooked: "₹18.4 L", flagLabel: "Balanced", flagClass: "bg-surface-subtle text-text-secondary border border-border-subtle", flagIcon: "check_circle",
    rowClass: "", dotClass: "bg-status-info", dotTitle: "Balanced Velocity",
    thirdActionIcon: "forward_to_inbox", thirdActionTitle: "Send Feedback", thirdActionClass: "hover:text-primary"
  },
  {
    id: "hq-004", zone: "North", hqName: "Delhi North & Rohini - HQ-004", abmName: "Tarun Mehra", mrCount: 14,
    division: "Resp-Care", divisionBadgeClass: "bg-status-warning-bg text-status-warning",
    target: "₹44,00,000", achieved: "₹39,16,000", progressPct: 89.0, progressClass: "text-status-warning",
    progressBarClass: "bg-status-warning", progressBarWidth: "89%",
    variance: "-₹4,84,000", varianceClass: "text-status-danger",
    dailyCalls: "8.4", dailyCallsClass: "text-status-danger",
    coreCoverage: "81.4%", coreCoverageClass: "bg-status-warning-bg text-status-warning",
    pobBooked: "₹9.2 L", flagLabel: "Call Deficit", flagClass: "bg-status-warning-bg text-status-warning border border-status-warning-border", flagIcon: "phone_missed",
    rowClass: "", dotClass: "bg-status-warning", dotTitle: "Field Effort Lagging",
    thirdActionIcon: "notification_important", thirdActionTitle: "Dispatch Notice", thirdActionClass: "hover:text-status-warning"
  },
  {
    id: "hq-088", zone: "East Central", hqName: "Kolkata Central & Howrah - HQ-088", abmName: "Debashis Roy", mrCount: 16,
    division: "Cardio-Diabetic", divisionBadgeClass: "bg-status-info-bg text-status-info",
    target: "₹58,00,000", achieved: "₹44,08,000", progressPct: 76.0, progressClass: "text-status-danger",
    progressBarClass: "bg-status-danger", progressBarWidth: "76%",
    variance: "-₹13,92,000", varianceClass: "text-status-danger",
    dailyCalls: "7.8", dailyCallsClass: "text-status-danger",
    coreCoverage: "73.5%", coreCoverageClass: "bg-status-danger-bg text-status-danger",
    pobBooked: "₹8.1 L", flagLabel: "Target At Risk", flagClass: "bg-status-danger-bg text-status-danger border border-status-danger-border", flagIcon: "crisis_alert",
    rowClass: "bg-status-danger-bg/20", dotClass: "bg-status-danger", dotTitle: "Critical Run-rate Risk",
    thirdActionIcon: "report_problem", thirdActionTitle: "Trigger RSM Review", thirdActionClass: "hover:text-status-danger"
  },
  {
    id: "hq-009", zone: "West Metro", hqName: "Mumbai Thane & Navi - HQ-009", abmName: "Vikram Shinde", mrCount: 24,
    division: "Derma-Care", divisionBadgeClass: "bg-teal-50 text-teal-700",
    target: "₹62,00,000", achieved: "₹64,48,000", progressPct: 104.0, progressClass: "text-status-success",
    progressBarClass: "bg-status-success", progressBarWidth: "100%",
    variance: "+₹2,48,000", varianceClass: "text-status-success",
    dailyCalls: "11.8", dailyCallsClass: "text-text-primary",
    coreCoverage: "94.2%", coreCoverageClass: "bg-status-success-bg text-status-success",
    pobBooked: "₹21.6 L", flagLabel: "Strong Pace", flagClass: "bg-status-success-bg text-status-success border border-status-success-border", flagIcon: "verified",
    rowClass: "", dotClass: "bg-status-success", dotTitle: "High Run-rate",
    thirdActionIcon: "thumb_up", thirdActionTitle: "Send Feedback", thirdActionClass: "hover:text-primary"
  }
];

const ZONES: { label: string; value: "all" | TerritoryRow["zone"] }[] = [
  { label: "All Zones", value: "all" },
  { label: "North", value: "North" },
  { label: "West Metro", value: "West Metro" },
  { label: "South Zone", value: "South Zone" },
  { label: "East Central", value: "East Central" }
];

const TIMELINES = ["Today", "This Week", "MTD (Sep FY26)", "Q3 FY26", "YTD Consolidated"] as const;

const SUB_TABS = [
  "Division & Territory Sales Variance",
  "HQ Productivity Matrix",
  "Brand Basket Performance",
  "Doctor Detailing Yield & ROI",
  "Scheduled Automated MIS Reports"
] as const;

type BrandRow = {
  name: string;
  molecule: string;
  rx: string;
  sharePct: string;
  amount: string;
  trend: string;
};

const brandRows: BrandRow[] = [
  { name: "CardioCare 20 (Atorvastatin 20mg)", molecule: "Atorvastatin 20mg", rx: "24,100 Rx", sharePct: "34.6%", amount: "₹1.68 Cr", trend: "+18.4% MoM" },
  { name: "ZiviCal D3 Forte (Nano Drops 60K)", molecule: "Nano Drops 60K", rx: "19,450 Rx", sharePct: "25.1%", amount: "₹1.22 Cr", trend: "+9.2% MoM" },
  { name: "GlycoZiv XR (Metformin 1000mg ER)", molecule: "Metformin 1000mg ER", rx: "16,300 Rx", sharePct: "20.2%", amount: "₹0.98 Cr", trend: "+5.1% MoM" },
  { name: "Resp-Clear Dry (Montelukast Levo)", molecule: "Montelukast Levo", rx: "9,800 Rx", sharePct: "11.9%", amount: "₹0.58 Cr", trend: "Flat (Season lag)" },
  { name: "Institutional & All Other SKUs", molecule: "Multiple low-volume batches", rx: "—", sharePct: "8.2%", amount: "₹0.40 Cr", trend: "Target Aligned" }
];

const PAGE_SIZE = 5;

export function AdminMisReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows] = useState<TerritoryRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<"all" | TerritoryRow["zone"]>("all");
  const [tierFilter, setTierFilter] = useState<"all" | "exceeding" | "ontrack" | "critical">("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTimeline, setActiveTimeline] = useState<(typeof TIMELINES)[number]>("MTD (Sep FY26)");
  const [activeSubTab, setActiveSubTab] = useState<(typeof SUB_TABS)[number]>(SUB_TABS[0]);
  const [exportOpen, setExportOpen] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ email: "", frequency: "Daily" });
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [queryForm, setQueryForm] = useState({ metric: "Secondary Sales", dimension: "Zone" });
  const [actionedAlerts, setActionedAlerts] = useState<Set<string>>(new Set());

  // ── Real backend data: territory doctor coverage, product exposure, and
  // live alerts. Loaded once on mount; Refresh (Custom timeline button area
  // has no explicit refresh, so this simply loads on mount) re-fetches via
  // loadRealData below if ever wired to a button in the future.
  const [territoryCounts, setTerritoryCounts] = useState<{ patch: string; hq: string; division: string; totalDoctors: number; activeDoctors: number }[]>([]);
  const [productExposure, setProductExposure] = useState<ProductExposureRow[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<AlertRow[]>([]);
  const [realDataLoading, setRealDataLoading] = useState(true);
  const [realDataError, setRealDataError] = useState("");

  async function loadRealData() {
    setRealDataLoading(true);
    setRealDataError("");
    try {
      const [territoryRes, exposureRes, alertsRes] = await Promise.all([
        apiClient.territoryDoctorCounts(),
        apiClient.productExposure(),
        apiClient.alertsEngine()
      ]);
      setTerritoryCounts(territoryRes.data);
      setProductExposure(exposureRes.data);
      setLiveAlerts(alertsRes.data);
    } catch (loadError) {
      setRealDataError(loadError instanceof Error ? loadError.message : "Unable to load live MIS data");
    } finally {
      setRealDataLoading(false);
    }
  }

  useEffect(() => {
    void loadRealData();
  }, []);

  const doctorCoveragePct = useMemo(() => {
    const totals = territoryCounts.reduce(
      (acc, t) => ({ total: acc.total + t.totalDoctors, active: acc.active + t.activeDoctors }),
      { total: 0, active: 0 }
    );
    return totals.total > 0 ? (totals.active / totals.total) * 100 : null;
  }, [territoryCounts]);

  const topExposureProducts = useMemo(
    () => [...productExposure].sort((a, b) => b.distinctDoctors - a.distinctDoctors).slice(0, 5),
    [productExposure]
  );
  const totalExposureDoctors = useMemo(
    () => topExposureProducts.reduce((sum, p) => sum + p.distinctDoctors, 0),
    [topExposureProducts]
  );

  const topLiveAlerts = useMemo(() => {
    const order: Record<AlertRow["severity"], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...liveAlerts].sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 3);
  }, [liveAlerts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (zoneFilter !== "all" && r.zone !== zoneFilter) return false;
      if (tierFilter === "exceeding" && !(r.progressPct > 100)) return false;
      if (tierFilter === "ontrack" && !(r.progressPct >= 90 && r.progressPct <= 100)) return false;
      if (tierFilter === "critical" && !(r.progressPct < 85)) return false;
      if (!q) return true;
      return (
        r.hqName.toLowerCase().includes(q) ||
        r.abmName.toLowerCase().includes(q) ||
        r.division.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => (sortDesc ? b.progressPct - a.progressPct : a.progressPct - b.progressPct));
    return list;
  }, [rows, search, zoneFilter, tierFilter, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function zoneCount(value: "all" | TerritoryRow["zone"]) {
    return value === "all" ? rows.length : rows.filter((r) => r.zone === value).length;
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport(format: "Executive Excel (XLSX)" | "Executive Boardpack (PDF)" | "Direct SQL Query Dump") {
    if (filtered.length === 0) return;
    downloadCsv(
      `mis-territory-report-${format.includes("PDF") ? "boardpack" : format.includes("SQL") ? "sql-dump" : "xlsx"}.csv`,
      filtered.map((r) => ({
        "Territory / HQ": r.hqName,
        "ABM": r.abmName,
        "Field MRs": r.mrCount,
        "Division": r.division,
        "Target": r.target,
        "MTD Achieved": r.achieved,
        "Progress %": `${r.progressPct}%`,
        "Variance": r.variance,
        "Daily Calls": r.dailyCalls,
        "Core Coverage": r.coreCoverage,
        "POB Booked": r.pobBooked,
        "Flag": r.flagLabel
      }))
    );
    setExportOpen(false);
  }

  function handleExportBrandDossier() {
    if (topExposureProducts.length > 0) {
      downloadCsv(
        "brand-basket-dossier.csv",
        topExposureProducts.map((p) => ({
          "Product": p.productName,
          "Distinct Doctors Reached": p.distinctDoctors,
          "Distinct Reps": p.distinctReps,
          "Samples Given": p.totalSamplesGiven,
          "Visits Promoted": p.visitsPromoted,
          "Visual Aid Used": p.visualAidUsedCount,
          "Top Rep": p.topRepName ?? p.topRepCode ?? "—",
          "Top Territory": p.topTerritory ?? "—"
        }))
      );
      return;
    }
    downloadCsv(
      "brand-basket-dossier.csv",
      brandRows.map((b) => ({
        "Brand": b.name,
        "Molecule": b.molecule,
        "Prescriptions": b.rx,
        "Basket Share": b.sharePct,
        "Sales Amount": b.amount,
        "MoM Trend": b.trend
      }))
    );
  }

  function handleScheduleSubmit() {
    if (!scheduleForm.email.trim()) return;
    setShowSchedule(false);
    setDetail({
      title: "Dispatch Scheduled",
      body: `MIS report dispatch scheduled to ${scheduleForm.email.trim()} at ${scheduleForm.frequency.toLowerCase()} frequency. This is a session-only confirmation — there is no scheduling backend yet.`
    });
    setScheduleForm({ email: "", frequency: "Daily" });
  }

  function handleQuerySubmit() {
    setShowQueryBuilder(false);
    setDetail({
      title: "Custom Query Built",
      body: `Query built for metric "${queryForm.metric}" grouped by "${queryForm.dimension}". This is a session-only preview — there is no live query engine yet.`
    });
  }

  function markAlertActioned(key: string, label: string) {
    setActionedAlerts((prev) => new Set(prev).add(key));
    setDetail({ title: "Action Sent", body: `"${label}" has been triggered. This is recorded for this session only — there is no notification backend wired up yet.` });
  }

  return (
    <div className="flex flex-col w-full space-y-6">


<div className="flex flex-col w-full">
{/* Dynamic Workspace Container */}
<div className="space-y-6">
{/* Top Utility Ribbon & Executive Header */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-surface-card p-card-padding-standard rounded-xl shadow-sm">
<div className="space-y-1">
<div className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">
<a className="hover:text-primary transition-colors" href="#">Platform</a>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">MIS Reports</span>
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm ml-2">
<span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
            Live HQ Sync • 1m ago
          </span>
</div>
<h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Management Information System (MIS)</h1>
<p className="font-body-sm text-body-sm text-text-secondary max-w-3xl">
          Consolidated executive telemetry: secondary sales variance, territory field productivity, tier-1 doctor frequency adherence, and brand-level margin realization.
        </p>
</div>
{/* Quick Actions Toolbar */}
<div className="flex flex-wrap items-center gap-2.5">
<button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-surface-variant text-text-secondary font-label-md text-label-md transition-colors shadow-sm" type="button" onClick={() => setShowSchedule(true)}>
<span className="material-symbols-outlined text-[18px]">schedule_send</span>
<span className="">Schedule Dispatch</span>
</button>
<div className="relative inline-block text-left" id="exportMenuWrapper">
<button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-surface-variant text-text-secondary font-label-md text-label-md transition-colors shadow-sm" type="button" onClick={() => setExportOpen((v) => !v)}>
<span className="material-symbols-outlined text-[18px]">sim_card_download</span>
<span className="">Export MIS</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</button>
<div className={`${exportOpen ? "" : "hidden"} absolute right-0 mt-1.5 w-48 rounded-lg bg-surface-card shadow-xl py-1 z-30`} id="exportMenu">
<a className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:bg-surface-subtle font-body-sm text-body-sm cursor-pointer" onClick={() => handleExport("Executive Excel (XLSX)")}>
<span className="material-symbols-outlined text-[16px] text-status-success">table_chart</span> Executive Excel (XLSX)
            </a>
<a className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:bg-surface-subtle font-body-sm text-body-sm cursor-pointer" onClick={() => handleExport("Executive Boardpack (PDF)")}>
<span className="material-symbols-outlined text-[16px] text-status-danger">picture_as_pdf</span> Executive Boardpack (PDF)
            </a>
<a className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:bg-surface-subtle font-body-sm text-body-sm cursor-pointer" onClick={() => handleExport("Direct SQL Query Dump")}>
<span className="material-symbols-outlined text-[16px] text-status-info">terminal</span> Direct SQL Query Dump
            </a>
</div>
</div>
<button className="button" type="button" onClick={() => setShowQueryBuilder(true)}>
<span className="material-symbols-outlined text-[18px]">tune</span>
<span className="">Build Custom Query</span>
</button>
</div>
</div>

<div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
  <AdminTabGrid node={node} path={path} />
</div>
{/* Period & Temporal Switcher Strip */}
<div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card px-4 py-2.5 rounded-xl shadow-sm">
<div className="flex items-center gap-1 overflow-x-auto py-0.5">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mr-2 hidden sm:inline">Timeline:</span>
{TIMELINES.map((t) => (
<button
  key={t}
  className={activeTimeline === t
    ? "px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm"
    : "px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors"}
  type="button"
  onClick={() => setActiveTimeline(t)}
>{t}</button>
))}
<button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors" type="button" onClick={() => setDetail({ title: "Custom Range", body: "Custom date-range picking will open a calendar once the MIS reporting backend supports arbitrary ranges. For now, use the preset timeline pills." })}>
<span className="material-symbols-outlined text-[16px]">calendar_today</span>
<span className="">Custom</span>
</button>
</div>
<div className="flex items-center gap-3">
<div className="text-text-secondary font-body-sm text-body-sm flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-text-muted">account_tree</span>
<span className="">Scope: <strong>All Divisions (Cardio, Diabetic, Derma)</strong></span>
</div>
<div className="h-4 w-px bg-surface-subtle"></div>
<span className="font-label-sm text-label-sm text-text-muted">Working Days Passed: <strong>21 / 25</strong></span>
</div>
</div>
{/* Executive KPI Metric Cards (4-Column Bento Row) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-grid-gutter">
{/* Card 1: Net Secondary Sales Achievement — no sales/target endpoint exists yet */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Secondary Sales (MTD)</span>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-subtle text-text-muted" title="No sales/target endpoint exists on the backend yet">Preview data</span>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">₹4.86 Cr</span>
<span className="font-label-md text-label-md text-text-secondary">/ ₹5.10 Cr Target</span>
</div>
{/* Progress micro-bar */}
<div className="w-full bg-surface-subtle h-2 rounded-full mt-2.5 overflow-hidden">
<div className="bg-primary h-full rounded-full transition-all duration-500" style={{ "width": "95.3%" }}></div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="inline-flex items-center gap-1 font-semibold text-status-success">
<span className="material-symbols-outlined text-[16px]">trending_up</span> +14.2% MoM
          </span>
<span className="text-text-muted">Gap: <strong className="text-status-warning font-semibold">₹24.0 Lakh</strong></span>
</div>
</div>
{/* Card 2: Field Productivity Ratio — no calls/POB aggregate endpoint exists yet */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Field Rep Productivity</span>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-subtle text-text-muted" title="No calls/POB-per-rep endpoint exists on the backend yet">Preview data</span>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">11.2</span>
<span className="font-label-md text-label-md text-text-secondary">Calls/MR/Day</span>
</div>
<div className="flex items-center justify-between mt-1 text-text-secondary font-body-sm text-body-sm">
<span className="">Avg POB: <strong>₹38,400 / Day</strong></span>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-subtle">Norm: 10.0</span>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="text-text-muted">Active Force: <strong>420 / 438</strong></span>
<span className="inline-flex items-center gap-1 font-semibold text-status-success">
<span className="material-symbols-outlined text-[16px]">trending_up</span> +6.8% vs Q2
          </span>
</div>
</div>
{/* Card 3: Doctor Coverage & Frequency Adherence — real, from apiClient.territoryDoctorCounts() */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">HCP List Coverage</span>
<div className="w-8 h-8 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">person_check</span>
</div>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">{realDataLoading ? "…" : doctorCoveragePct !== null ? `${doctorCoveragePct.toFixed(1)}%` : "—"}</span>
<span className="font-label-md text-label-md text-status-success font-semibold">Active / Mapped Doctors</span>
</div>
<div className="w-full bg-surface-subtle h-2 rounded-full mt-2.5 overflow-hidden">
<div className="bg-status-success h-full rounded-full transition-all duration-500" style={{ "width": `${doctorCoveragePct ?? 0}%` }}></div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="text-text-muted">Territory Nodes: <strong>{territoryCounts.length}</strong></span>
<span className="text-text-muted">Active Doctors: <strong className="text-text-primary">{territoryCounts.reduce((s, t) => s + t.activeDoctors, 0)}</strong></span>
</div>
</div>
{/* Card 4: Sample & Detailing Yield — no sample ROI/revenue endpoint exists yet */}
<div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Sample Conversion ROI</span>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-subtle text-text-muted" title="No sample-to-revenue ROI endpoint exists on the backend yet">Preview data</span>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="font-metric-value text-metric-value text-text-primary">3.42x</span>
<span className="font-label-md text-label-md text-text-secondary">Yield Ratio</span>
</div>
<div className="flex items-center justify-between mt-1 text-text-secondary font-body-sm text-body-sm">
<span className="">₹18.2L Out <span className="material-symbols-outlined text-[14px] align-middle text-text-muted">arrow_forward</span> ₹62.4L Rx</span>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
<span className="text-status-danger font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">warning</span> 14 Reps Zero-POB Flag
          </span>
<a className="text-primary hover:underline font-label-sm text-label-sm cursor-pointer" onClick={() => setDetail({ title: "Zero-POB Reps Audit", body: "14 field representatives logged zero primary order booking (POB) this cycle. Flagged for ASM follow-up and manager escalation." })}>Audit</a>
</div>
</div>
</div>
{/* Navigation Sub-Tabs for MIS Multi-Perspective Analysis */}
<div className="bg-surface-card rounded-xl p-1.5 shadow-sm flex flex-wrap items-center gap-1">
{SUB_TABS.map((tab) => {
  const icon = tab === "Division & Territory Sales Variance" ? "hub" : tab === "HQ Productivity Matrix" ? "grid_view" : tab === "Brand Basket Performance" ? "pie_chart" : tab === "Doctor Detailing Yield & ROI" ? "query_stats" : "mark_email_read";
  const active = activeSubTab === tab;
  return (
    <button
      key={tab}
      className={active ? "button" : "flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors"}
      type="button"
      onClick={() => {
        setActiveSubTab(tab);
        if (tab === "HQ Productivity Matrix") {
          setDetail({
            title: tab,
            body: doctorCoveragePct !== null
              ? `Live from apiClient.territoryDoctorCounts(): ${territoryCounts.length} territory/HQ nodes, ${territoryCounts.reduce((s, t) => s + t.activeDoctors, 0)} of ${territoryCounts.reduce((s, t) => s + t.totalDoctors, 0)} mapped doctors active (${doctorCoveragePct.toFixed(1)}% coverage). A dedicated productivity table view isn't built yet — showing Division & Territory Sales Variance data below in the meantime.`
              : "Loading live territory doctor-coverage data — showing Division & Territory Sales Variance data below in the meantime."
          });
        } else if (tab === "Doctor Detailing Yield & ROI") {
          setDetail({
            title: tab,
            body: topExposureProducts.length > 0
              ? `Live from apiClient.productExposure(): top product ${topExposureProducts[0].productName} reached ${topExposureProducts[0].distinctDoctors} doctors via ${topExposureProducts[0].distinctReps} reps, ${topExposureProducts[0].totalSamplesGiven} samples given. See the Brand Basket panel below for the full real breakdown. A dedicated yield/ROI table view isn't built yet.`
              : "Loading live product exposure data — see the Brand Basket panel below in the meantime."
          });
        } else if (tab !== SUB_TABS[0]) {
          setDetail({ title: tab, body: "This report view is not built out yet — showing Division & Territory Sales Variance data below in the meantime." });
        }
      }}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span className="">{tab}</span>
    </button>
  );
})}
</div>
{/* Main Data Table Container with Filters & Controls */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
{/* Honest data-source note — no sales-target/achievement endpoint exists on
    the backend yet, so this table stays on its original interactive mock
    rows rather than presenting invented revenue figures as real. */}
<div className="px-card-padding-standard pt-3 -mb-1">
<span className="inline-flex items-center gap-1.5 text-label-sm font-label-sm px-2 py-1 rounded bg-surface-subtle text-text-muted">
<span className="material-symbols-outlined text-[14px]">info</span>
Preview data — territory secondary-sales targets/achievement are not yet exposed by the backend. Search, filters, sort, export and row actions below are fully interactive against this preview dataset.
</span>
</div>
{/* Filter Bar & Search Sub-Header */}
<div className="p-card-padding-standard flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-subtle">
{/* Search bar */}
<div className="relative flex-1 max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[19px]">search</span>
<input className="w-full h-[38px] pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search zone, territory HQ, RSM/ABM, or product SKU..." type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
</div>
{/* Filter Clusters */}
<div className="flex flex-wrap items-center gap-2">
{/* Zone Filter Pills */}
<div className="inline-flex rounded-lg bg-surface-canvas p-0.5">
{ZONES.map((z) => (
  <button
    key={z.value}
    className={zoneFilter === z.value ? "px-2.5 py-1 text-label-sm font-label-sm rounded-md bg-surface-card text-text-primary shadow-sm" : "px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary"}
    onClick={() => { setZoneFilter(z.value); setPage(1); }}
    type="button"
  >{z.label} ({zoneCount(z.value)})</button>
))}
</div>
{/* Performance Tier Filter */}
<select className="h-[34px] px-2.5 rounded-lg bg-surface-canvas text-text-secondary font-label-md text-label-md focus:outline-none cursor-pointer" value={tierFilter} onChange={(e) => { setTierFilter(e.target.value as typeof tierFilter); setPage(1); }}>
<option value="all">All Tiers</option>
<option value="exceeding">Exceeding Target (&gt;100%)</option>
<option value="ontrack">On-Track (90-100%)</option>
<option value="critical">Critical Deficit (&lt;85%)</option>
</select>
{/* Utility icon buttons */}
<button className="w-[34px] h-[34px] rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-secondary flex items-center justify-center transition-colors" title="Column Settings" onClick={() => setDetail({ title: "Visible Columns", body: "Territory / HQ Node, Division, Target, MTD Achieved, Progress %, Variance, Daily Calls, Core Coverage, POB Booked, Operational Flag. Column show/hide toggling isn't wired to a saved layout yet." })}>
<span className="material-symbols-outlined text-[18px]">view_column</span>
</button>
<button className="w-[34px] h-[34px] rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-secondary flex items-center justify-center transition-colors" title="Sort Order" onClick={() => setSortDesc((v) => !v)}>
<span className="material-symbols-outlined text-[18px]">{sortDesc ? "filter_list" : "sort"}</span>
</button>
</div>
</div>
{/* Master MIS Sales & Productivity Matrix Table */}
<div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-subtle text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
<th className="py-3 px-4 w-12 text-center">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox" checked={pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id))} onChange={() => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    const allSelected = pageRows.every((r) => next.has(r.id));
    pageRows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
    return next;
  });
}}/>
</th>
<th className="py-3 px-4">Territory / HQ Node</th>
<th className="py-3 px-4">Division</th>
<th className="py-3 px-4 text-right">Target (₹)</th>
<th className="py-3 px-4 text-right">MTD Achieved</th>
<th className="py-3 px-4 text-center">Progress %</th>
<th className="py-3 px-4 text-right">Variance</th>
<th className="py-3 px-4 text-center">Daily Calls</th>
<th className="py-3 px-4 text-center">Core Coverage</th>
<th className="py-3 px-4 text-right">POB Booked</th>
<th className="py-3 px-4 text-center">Operational Flag</th>
<th className="py-3 px-4 text-center w-28">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-subtle text-table-cell font-table-cell text-text-primary">
{pageRows.length === 0 && (
  <tr>
    <td colSpan={12} className="py-10 px-4 text-center text-text-muted">No territories match the current search/filters.</td>
  </tr>
)}
{pageRows.map((r) => (
<tr key={r.id} className={`hover:bg-surface-subtle/60 transition-colors group ${r.rowClass}`}>
<td className="py-3.5 px-4 text-center">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)}/>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<div className={`w-2.5 h-2.5 rounded-full ${r.dotClass}`} title={r.dotTitle}></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">{r.hqName}</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: {r.abmName} • {r.mrCount} Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4">
<span className={`inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm font-medium ${r.divisionBadgeClass}`}>{r.division}</span>
</td>
<td className="py-3.5 px-4 text-right font-medium">{r.target}</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary">{r.achieved}</td>
<td className="py-3.5 px-4 text-center">
<div className="flex items-center justify-center gap-2">
<span className={`font-bold font-label-md text-label-md ${r.progressClass}`}>{r.progressPct.toFixed(1)}%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className={`${r.progressBarClass} h-full`} style={{ width: r.progressBarWidth }}></div>
</div>
</div>
</td>
<td className={`py-3.5 px-4 text-right font-semibold ${r.varianceClass}`}>{r.variance}</td>
<td className="py-3.5 px-4 text-center">
<span className={`font-semibold ${r.dailyCallsClass}`}>{r.dailyCalls}</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center">
<span className={`inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm font-semibold ${r.coreCoverageClass}`}>{r.coreCoverage}</span>
</td>
<td className="py-3.5 px-4 text-right font-medium">{r.pobBooked}</td>
<td className="py-3.5 px-4 text-center">
<span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${r.flagClass}`}>
<span className="material-symbols-outlined text-[13px]">{r.flagIcon}</span> {r.flagLabel}
                </span>
</td>
<td className="py-3.5 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown" onClick={() => setDetail({ title: `${r.hqName} — Detailed Breakdown`, body: `ABM ${r.abmName} manages ${r.mrCount} field MRs in the ${r.division} division. Target ${r.target}, achieved ${r.achieved} (${r.progressPct.toFixed(1)}%, variance ${r.variance}). Daily calls ${r.dailyCalls}/10.0, core coverage ${r.coreCoverage}, POB booked ${r.pobBooked}.` })}>
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF" onClick={() => downloadCsv(`territory-${r.id}.csv`, [{
  "Territory / HQ": r.hqName, "ABM": r.abmName, "Division": r.division, "Target": r.target, "Achieved": r.achieved, "Progress %": `${r.progressPct}%`, "Variance": r.variance
}])}>
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className={`p-1 rounded text-text-secondary hover:bg-surface-subtle transition-colors ${r.thirdActionClass}`} title={r.thirdActionTitle} onClick={() => markAlertActioned(r.id, r.thirdActionTitle)}>
<span className="material-symbols-outlined text-[18px]">{r.thirdActionIcon}</span>
</button>
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
{/* Pagination & Table Summary Footer */}
<div className="px-card-padding-standard py-3 bg-surface-subtle/50 flex flex-wrap items-center justify-between gap-3 text-text-secondary font-body-sm text-body-sm">
<div className="flex items-center gap-2">
<span className="">{filtered.length === 0 ? "No Territory HQs match your filters" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Territory HQs`}</span>
{selectedIds.size > 0 && (<><span className="text-text-muted">•</span><span className="text-text-muted">{selectedIds.size} selected</span></>)}
</div>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm disabled:opacity-40" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
  <button key={n} className={n === safePage ? "px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold" : "px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm"} onClick={() => setPage(n)}>{n}</button>
))}
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm disabled:opacity-40" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
</div>
</div>
</div>
{/* Secondary Analytical Panels: 2-Column Split */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter">
{/* Panel 1: Brand Basket Contribution vs Growth Matrix (7 cols) — real,
    from apiClient.productExposure(). No revenue/amount data exists on the
    backend for products, so doctor reach / samples / visits are shown
    instead of invented currency figures. */}
<div className="lg:col-span-7 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-1">
<h2 className="font-headline-sm text-headline-sm text-text-primary">Brand Basket Doctor Reach</h2>
<span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded bg-brand-primary-subtle text-primary font-semibold">Live — Product Exposure</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-5">
            Distinct doctors reached, samples given, and promotional visits per product — no basket revenue endpoint exists yet, so this reflects real doctor/sample reach instead of invented sales amounts.
          </p>
{realDataError && <p className="text-status-danger font-body-sm text-body-sm mb-3">{realDataError}</p>}
{realDataLoading && <p className="font-body-sm text-body-sm text-text-muted mb-3">Loading live product exposure…</p>}
{!realDataLoading && topExposureProducts.length === 0 && (
  <p className="font-body-sm text-body-sm text-text-muted mb-3">No product exposure data available for the current period.</p>
)}
{topExposureProducts.length > 0 && (
<>
{/* Contribution Stacked Visual Bar — share of doctor reach among top 5 */}
<div className="w-full h-4 rounded-lg flex overflow-hidden shadow-inner mb-4">
{["bg-primary", "bg-primary-container", "bg-tertiary", "bg-status-info", "bg-secondary-fixed-dim"].map((cls, i) => {
  const p = topExposureProducts[i];
  if (!p) return null;
  const pct = totalExposureDoctors > 0 ? (p.distinctDoctors / totalExposureDoctors) * 100 : 0;
  return <div key={p.productCode} className={`${cls} hover:opacity-90 transition-opacity`} style={{ width: `${pct}%` }} title={`${p.productName} (${pct.toFixed(1)}%)`}></div>;
})}
</div>
{/* Product Detailed Breakdown Rows */}
<div className="space-y-3">
{["bg-primary", "bg-primary-container", "bg-tertiary", "bg-status-info", "bg-secondary-fixed-dim"].map((cls, i) => {
  const p = topExposureProducts[i];
  if (!p) return null;
  const sharePct = totalExposureDoctors > 0 ? (p.distinctDoctors / totalExposureDoctors) * 100 : 0;
  return (
    <div key={p.productCode} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${cls} flex-shrink-0`}></span>
        <div>
          <div className="font-label-md text-label-md text-text-primary">{p.productName}</div>
          <div className="font-body-sm text-body-sm text-text-muted">{p.distinctReps} reps • {sharePct.toFixed(1)}% of top-5 doctor reach</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-headline-sm text-headline-sm text-text-primary">{p.distinctDoctors} Doctors</div>
        <div className="font-label-sm text-label-sm text-status-success font-semibold flex items-center justify-end gap-0.5">
          {p.totalSamplesGiven} samples • {p.visitsPromoted} visits
        </div>
      </div>
    </div>
  );
})}
</div>
</>
)}
</div>
<div className="mt-4 pt-3 border-t border-surface-subtle flex items-center justify-between font-label-md text-label-md">
<span className="text-text-muted">Products Tracked: <strong className="text-text-primary">{productExposure.length}</strong></span>
<a className="text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer" onClick={handleExportBrandDossier}>
<span className="">Download Brand Basket Dossier</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
{/* Panel 2: Executive Exception Alerts & Action Triggers (5 cols) — real,
    from apiClient.alertsEngine(). The action buttons still only mark the
    alert as actioned for this session, since no backend endpoint exists to
    actually trigger a review meeting / supply notice / escalation yet. */}
<div className="lg:col-span-5 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-1">
<h2 className="font-headline-sm text-headline-sm text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-status-danger text-[20px]">notification_important</span>
<span className="">Executive Exception Alerts</span>
</h2>
<span className="w-2.5 h-2.5 rounded-full bg-status-danger animate-ping"></span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-4">
            Live from apiClient.alertsEngine() — automated threshold anomalies requiring headquarters operational decisions or RSM escalations.
          </p>
<div className="space-y-3.5">
{realDataLoading && <p className="font-body-sm text-body-sm text-text-muted">Loading live alerts…</p>}
{!realDataLoading && topLiveAlerts.length === 0 && (
  <p className="font-body-sm text-body-sm text-text-muted">No exception alerts currently flagged.</p>
)}
{topLiveAlerts.map((a, i) => {
  const key = `live-alert-${i}`;
  const style = a.severity === "HIGH"
    ? { wrap: "bg-status-danger-bg/40 border border-status-danger-border", label: "bg-status-danger-bg text-status-danger", text: "text-status-danger", btn: "bg-status-danger text-on-error hover:bg-error" }
    : a.severity === "MEDIUM"
    ? { wrap: "bg-status-warning-bg/40 border border-status-warning-border", label: "bg-status-warning-bg text-status-warning", text: "text-status-warning", btn: "bg-status-warning text-text-primary hover:bg-amber-600 hover:text-on-primary" }
    : { wrap: "bg-surface-subtle border border-border-subtle", label: "bg-surface-card text-text-secondary", text: "text-text-primary", btn: "bg-surface-card text-text-primary border border-border-subtle hover:bg-surface-subtle" };
  return (
    <div key={key} className={`p-3.5 rounded-xl flex flex-col gap-2.5 ${style.wrap}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex items-center gap-2 font-label-md text-label-md ${style.text}`}>
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{a.type.replace(/_/g, " ")}</span>
        </div>
        <span className={`font-label-sm text-label-sm px-1.5 py-0.5 rounded font-semibold ${style.label}`}>{a.severity}</span>
      </div>
      <p className="font-body-sm text-body-sm text-text-secondary">{a.message}</p>
      <div className="flex items-center justify-between pt-1">
        <span className="font-label-sm text-label-sm text-text-muted">{a.subjectLabel ?? a.subjectCode ?? "—"}</span>
        <button className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold transition-colors shadow-sm disabled:opacity-50 ${style.btn}`} type="button" disabled={actionedAlerts.has(key)} onClick={() => markAlertActioned(key, "Acknowledge & Escalate")}>
          {actionedAlerts.has(key) ? "Escalation Sent" : "Acknowledge & Escalate"}
        </button>
      </div>
    </div>
  );
})}
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-subtle flex items-center justify-between font-label-md text-label-md">
<span className="text-text-muted">Total Live Alerts: <strong>{liveAlerts.length}</strong></span>
<a className="text-primary hover:underline font-semibold cursor-pointer" onClick={() => setDetail({ title: "Alert Thresholds", body: "Alert thresholds (DCR_NOT_SUBMITTED, DOCTOR_NOT_VISITED_90_DAYS, PRODUCT_NOT_PROMOTED, LOW_COVERAGE, SAMPLE_STOCK_LOW, SALARY_HOLD, TERRITORY_INACTIVE) are computed by the backend's Alert & Notification Engine. Editing thresholds from this UI isn't wired to a backend endpoint yet." })}>Configure Alert Thresholds →</a>
</div>
</div>
</div>
</div>
</div>

    {/* Schedule Dispatch modal */}
    {showSchedule && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSchedule(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Schedule MIS Dispatch</h3>
          <div className="space-y-3">
            <input className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" placeholder="Recipient email *" value={scheduleForm.email} onChange={(e) => setScheduleForm((s) => ({ ...s, email: e.target.value }))} />
            <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={scheduleForm.frequency} onChange={(e) => setScheduleForm((s) => ({ ...s, frequency: e.target.value }))}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <p className="text-[11px] text-text-muted">Session-only confirmation — there is no report-scheduling backend yet, so this does not persist after a page reload.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowSchedule(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50" disabled={!scheduleForm.email.trim()} onClick={handleScheduleSubmit}>Schedule</button>
          </div>
        </div>
      </div>
    )}

    {/* Build Custom Query modal */}
    {showQueryBuilder && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowQueryBuilder(false)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-lg">Build Custom Query</h3>
          <div className="space-y-3">
            <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={queryForm.metric} onChange={(e) => setQueryForm((s) => ({ ...s, metric: e.target.value }))}>
              <option>Secondary Sales</option>
              <option>Field Productivity</option>
              <option>Doctor Coverage</option>
              <option>Sample ROI</option>
            </select>
            <select className="w-full px-3 py-2 rounded-md border border-border-subtle bg-surface-card text-sm" value={queryForm.dimension} onChange={(e) => setQueryForm((s) => ({ ...s, dimension: e.target.value }))}>
              <option>Zone</option>
              <option>Division</option>
              <option>ABM</option>
            </select>
          </div>
          <p className="text-[11px] text-text-muted">Session-only preview — there is no live SQL/query engine wired up yet.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setShowQueryBuilder(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:opacity-90" onClick={handleQuerySubmit}>Run Query</button>
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
