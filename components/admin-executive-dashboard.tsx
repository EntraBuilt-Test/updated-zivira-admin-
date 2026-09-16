"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ZiviraTreeNode } from "@/packages/types/src/zivira-tree";
import { downloadCsv } from "@/lib/download-csv";
import { apiClient, type RepAnalysisRow } from "@/lib/api-client";

// Fix — this page used to be a fully static server component: Back,
// Refresh, the This Month/Overall toggle, "View all" and "View full
// leaderboard" were all dead links/buttons (href="#" or no handler). A later
// pass made the Top/Bottom Performers panels interactive against local mock
// rows. This pass wires the page to real backend data wherever a matching
// endpoint exists:
//   - Total Employees, DCR Submission Rate  -> apiClient.dashboard()
//   - Chronic Defaulters                    -> apiClient.complianceAnalytics()
//   - Payroll On Hold                       -> apiClient.payrollAnalytics()
//   - High-Severity Alerts, Territory Coverage Alerts -> apiClient.alertsEngine()
//   - Joint Field Visits, Top/Bottom Performers (Joint Visit %)
//                                            -> apiClient.repManagerAnalysis()
// "Active Representatives" and "Today's Doctor Calls" have no matching
// backend field/endpoint (the dashboard summary doesn't split active vs
// inactive reps, and there is no "calls placed today" aggregate), so those
// two cards are explicitly labeled "Not backend-wired" instead of silently
// keeping their old fake numbers.
// The "This Month / Overall" toggle only has one real backend source
// (repManagerAnalysis is always scoped to a month), so both tabs currently
// show the same live current-month data — no separate "overall" aggregate
// endpoint exists yet.

type Performer = {
  employeeCode: string;
  name: string;
  title: string;
  pct: number;
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AdminExecutiveDashboard({
  node,
  path,
}: {
  node: ZiviraTreeNode;
  path: string[];
}) {
  void node;
  void path;
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<"month" | "overall">("month");
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [dcrSubmittedToday, setDcrSubmittedToday] = useState<number | null>(null);
  const [chronicDefaulters, setChronicDefaulters] = useState<number | null>(null);
  const [payrollOnHold, setPayrollOnHold] = useState<number | null>(null);
  const [highSeverityAlerts, setHighSeverityAlerts] = useState<number | null>(null);
  const [territoryAlerts, setTerritoryAlerts] = useState<number | null>(null);
  const [jointFieldVisits, setJointFieldVisits] = useState<number | null>(null);
  const [reps, setReps] = useState<RepAnalysisRow[]>([]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [dashboardRes, complianceRes, payrollRes, alertsRes, repManagerRes] = await Promise.all([
        apiClient.dashboard(),
        apiClient.complianceAnalytics(),
        apiClient.payrollAnalytics(),
        apiClient.alertsEngine(),
        apiClient.repManagerAnalysis()
      ]);

      setEmployeeCount(dashboardRes.data.metrics.employeeCount);
      setDcrSubmittedToday(dashboardRes.data.metrics.dcrSubmittedToday);
      setChronicDefaulters(complianceRes.summary.chronicDefaulters);
      setPayrollOnHold(payrollRes.summary.onHold);
      setHighSeverityAlerts(alertsRes.summary.high);
      setTerritoryAlerts(alertsRes.data.filter((a) => a.type === "TERRITORY_INACTIVE").length);
      setJointFieldVisits(repManagerRes.managers.reduce((sum, m) => sum + (m.totalJointCalls ?? 0), 0));
      setReps(repManagerRes.data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const sortedByJointVisit = useMemo(
    () => [...reps].sort((a, b) => (b.jointVisitPercent ?? 0) - (a.jointVisitPercent ?? 0)),
    [reps]
  );
  const topPerformers: Performer[] = useMemo(
    () => sortedByJointVisit.slice(0, 3).map((r) => ({
      employeeCode: r.employeeCode,
      name: r.employeeName || r.employeeCode,
      title: r.reportingManagerName ? `Reports to ${r.reportingManagerName}` : "Field Representative",
      pct: Math.round(r.jointVisitPercent ?? 0)
    })),
    [sortedByJointVisit]
  );
  const bottomPerformers: Performer[] = useMemo(
    () => [...sortedByJointVisit].reverse().slice(0, 3).map((r) => ({
      employeeCode: r.employeeCode,
      name: r.employeeName || r.employeeCode,
      title: r.reportingManagerName ? `Reports to ${r.reportingManagerName}` : "Field Representative",
      pct: Math.round(r.jointVisitPercent ?? 0)
    })),
    [sortedByJointVisit]
  );
  const allReps = useMemo(
    () => sortedByJointVisit.map((r) => ({ name: r.employeeName || r.employeeCode, title: r.reportingManagerName ? `Reports to ${r.reportingManagerName}` : "Field Representative", pct: Math.round(r.jointVisitPercent ?? 0) })),
    [sortedByJointVisit]
  );

  function handleRefresh() {
    void loadAll();
  }

  function handleViewAllAlerts() {
    setDetail({
      title: "High-Severity Alerts",
      body: `${highSeverityAlerts ?? 0} high-severity alerts currently flagged by the Alert & Notification Engine. Drill into the Alert Engine (sidebar) for the full queue.`
    });
  }

  function handleViewLeaderboard() {
    setDetail({
      title: "Full Joint Visit Leaderboard",
      body: allReps.length > 0
        ? allReps.map((r) => `${r.name} (${r.title}): ${r.pct}%`).join(" · ")
        : "No representative data available."
    });
  }

  const dcrSubmissionRate = employeeCount && employeeCount > 0 && dcrSubmittedToday !== null
    ? Math.round((dcrSubmittedToday / employeeCount) * 100)
    : null;

  return (
    <main
      className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
      data-purpose="dashboard-content"
    >
      {/*  BEGIN: PageHeaderBanner  */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-orange-600 dark:text-orange-500 font-heading">
            SFA ANALYTICS &amp; BI
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Executive Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-normal">
            Centralized view for MD / CEO / National Sales Manager / RGM — field
            productivity, compliance, and payroll status at a glance.
          </p>
          {lastRefreshed && (
            <p className="text-[11px] text-slate-400 mt-1">Last refreshed at {lastRefreshed}</p>
          )}
          {error && (
            <p className="text-[11px] text-rose-600 mt-1">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition shadow-sm"
            type="button"
            onClick={() => router.back()}
          >
            <span className="material-symbols-outlined text-[11px]">{`arrow_back`}</span>
            <span>Back</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-orange-600 dark:text-orange-500 transition shadow-sm group"
            id="refreshMetricsBtn"
            type="button"
            onClick={handleRefresh}
          >
            <span className={`material-symbols-outlined text-[11px] ${loading ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:text-orange-500`}>{`sync`}</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>
      {/*  END: PageHeaderBanner  */}
      {/*  BEGIN: KeyMetricsGrid  */}
      {/*  3 Columns x 3 Rows Structure reflecting screenshot layout  */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        data-purpose="kpi-metrics-grid"
      >
        {/*  Card 1: Total Employees  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Employees
            </span>
            <span className="p-1 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-400">
              <span className="material-symbols-outlined text-xs">{`group`}</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
              {loading ? "…" : employeeCount ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                Headcount across all territories
              </span>
            </div>
          </div>
        </article>
        {/*  Card 2: Active Representatives — no matching backend field  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Representatives
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
              Not backend-wired
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-slate-400">
              —
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                No active/inactive rep split exposed by the backend yet
              </span>
            </div>
          </div>
        </article>
        {/*  Card 3: Today's Doctor Calls — no matching backend field  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Today's Doctor Calls
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
              Not backend-wired
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-slate-400">
              —
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                No "calls today" aggregate exposed by the backend yet
              </span>
            </div>
          </div>
        </article>
        {/*  Card 4: DCR Submission Rate  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              DCR Submission Rate
            </span>
            <span className="p-1 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-400">
              <span className="material-symbols-outlined text-xs">{`schedule`}</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
              {loading ? "…" : dcrSubmissionRate !== null ? `${dcrSubmissionRate}%` : "—"}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                {dcrSubmittedToday !== null ? `${dcrSubmittedToday} DCRs submitted today` : "Derived from today's DCR count / headcount"}
              </span>
            </div>
          </div>
        </article>
        {/*  Card 5: Territory Coverage Alerts  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Territory Coverage Alerts
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700">
              Action Required
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-amber-600">
              {loading ? "…" : territoryAlerts ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                Territories flagged inactive by the Alert Engine
              </span>
            </div>
          </div>
        </article>
        {/*  Card 6: Joint Field Visits  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Joint Field Visits
            </span>
            <span className="text-[11px] text-slate-400">Monthly total, all managers</span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
              {loading ? "…" : jointFieldVisits ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Completed by Area Managers
              </span>
            </div>
          </div>
        </article>
        {/*  Card 7: Chronic Defaulters  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Chronic Defaulters
            </span>
            <span className="p-1 rounded bg-rose-50 text-rose-600">
              <span className="material-symbols-outlined text-xs">{`person_remove`}</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-rose-600">
              {loading ? "…" : chronicDefaulters ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-rose-600">
                Flagged by the Compliance Analytics engine
              </span>
            </div>
          </div>
        </article>
        {/*  Card 8: Payroll On Hold  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Payroll On Hold
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
              Urgent
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-rose-600">
              {loading ? "…" : payrollOnHold ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                Awaiting clearance approvals
              </span>
            </div>
          </div>
        </article>
        {/*  Card 9: High-Severity Alerts  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              High-Severity Alerts
            </span>
            <button
              className="text-[11px] font-semibold text-orange-600 dark:text-orange-500 hover:text-orange-700 underline"
              type="button"
              onClick={handleViewAllAlerts}
            >
              View all
            </button>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-rose-600">
              {loading ? "…" : highSeverityAlerts ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                From the Alert &amp; Notification Engine
              </span>
            </div>
          </div>
        </article>
      </section>
      {/*  END: KeyMetricsGrid  */}
      {/*  BEGIN: PerformanceSplitSection  */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-8"
        data-purpose="performance-comparison"
      >
        {/*  Left Panel: Top Performers  */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-sm">{`trending_up`}</span>
              <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">
                Top Performers (Joint Visit %)
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                className={timeframe === "month" ? "px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold rounded shadow-xs" : "px-2 py-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"}
                type="button"
                onClick={() => setTimeframe("month")}
                title="Current calendar month (from repManagerAnalysis)"
              >
                This Month
              </button>
              <button
                className={timeframe === "overall" ? "px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold rounded shadow-xs" : "px-2 py-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"}
                type="button"
                onClick={() => setTimeframe("overall")}
                title="No separate all-time aggregate endpoint exists yet — shows the same current-month data"
              >
                Overall
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {loading && <p className="text-xs text-slate-400">Loading…</p>}
            {!loading && topPerformers.length === 0 && (
              <p className="text-xs text-slate-400">No representative data available.</p>
            )}
            {topPerformers.map((p, i) => (
              <div key={p.employeeCode} className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className={i === 0 ? "w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center" : "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold text-xs flex items-center justify-center"}>
                    {initialsOf(p.name)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.title}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={i === 0 ? "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"}>
                    {p.pct}%
                  </span>
                  <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                    <div className={i === 0 ? "bg-emerald-500 h-1 rounded-full w-full" : "bg-slate-300 h-1 rounded-full"} style={{ width: `${Math.min(100, Math.max(0, p.pct))}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/*  Right Panel: Bottom Performers  */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-rose-600">
              <span className="material-symbols-outlined text-sm">{`bar_chart`}</span>
              <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">
                Bottom Performers (Joint Visit %)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Critical Attention
            </span>
          </div>
          <div className="space-y-4">
            {loading && <p className="text-xs text-slate-400">Loading…</p>}
            {!loading && bottomPerformers.length === 0 && (
              <p className="text-xs text-slate-400">No representative data available.</p>
            )}
            {bottomPerformers.map((p, i) => (
              <div key={p.employeeCode} className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className={i === 1 ? "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center" : "w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center"}>
                    {initialsOf(p.name)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.title}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-rose-600 bg-rose-50">
                    {p.pct}%
                  </span>
                  <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                    <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${Math.min(100, Math.max(0, p.pct))}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/*  Bottom Panel Action Footer  */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Showing {Math.min(3, bottomPerformers.length)} of {reps.length} field reps</span>
            <button
              className="font-semibold text-orange-600 dark:text-orange-500 hover:text-orange-700 inline-flex items-center gap-1"
              type="button"
              onClick={handleViewLeaderboard}
            >
              <span>View full leaderboard</span>
              <span className="material-symbols-outlined text-[10px]">{`arrow_forward`}</span>
            </button>
          </div>
        </div>
      </section>
      {/*  END: PerformanceSplitSection  */}

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-slate-900 dark:text-slate-100 text-base">{detail.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{detail.body}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700"
                onClick={() => downloadCsv("joint-visit-leaderboard.csv", allReps.map((r) => ({ Name: r.name, Title: r.title, "Joint Visit %": r.pct })))}
              >
                Export CSV
              </button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
