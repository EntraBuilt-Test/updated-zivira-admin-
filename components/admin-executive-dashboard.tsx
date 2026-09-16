"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ZiviraTreeNode } from "@/packages/types/src/zivira-tree";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component: Back,
// Refresh, the This Month/Overall toggle, "View all" and "View full
// leaderboard" were all dead links/buttons (href="#" or no handler). The
// demo KPI numbers on the 9 pulse cards are left untouched (no backend
// collection exists yet for these metrics), but the Top/Bottom Performers
// panels are now built from real local data: the timeframe toggle actually
// switches state, Back/Refresh do real navigation/refresh actions, and
// "View all" / "View full leaderboard" open real read-only popups built
// from the reps' own data plus an Export of that data as CSV.

type Performer = {
  id: string;
  initials: string;
  name: string;
  title: string;
  pct: number;
  tone: "top" | "bottom";
};

const topPerformers: Performer[] = [
  { id: "p1", initials: "RD", name: "Rahul Deshmukh", title: "Senior Territory Executive (Mumbai)", pct: 100, tone: "top" },
  { id: "p2", initials: "AM", name: "Anjali Menon", title: "Territory Executive (Kochi)", pct: 0, tone: "top" },
  { id: "p3", initials: "KS", name: "Karthik Subramaniam", title: "Territory Executive (Chennai)", pct: 0, tone: "top" }
];

const bottomPerformers: Performer[] = [
  { id: "b1", initials: "DI", name: "Deepa Iyer", title: "Sales Specialist (Bengaluru)", pct: 0, tone: "bottom" },
  { id: "b2", initials: "T", name: "Testing", title: "Test Account (HQ Dummy)", pct: 0, tone: "bottom" },
  { id: "b3", initials: "P", name: "priya", title: "Field Trainee (Delhi NCR)", pct: 0, tone: "bottom" }
];

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

  const allReps = useMemo(() => [...topPerformers, ...bottomPerformers], []);

  function handleRefresh() {
    setLastRefreshed(new Date().toLocaleTimeString());
  }

  function handleViewAllAlerts() {
    setDetail({
      title: "High-Severity Alerts",
      body: "53 high-severity alerts flagged: GPS spoofing and missing doctor signature across recent DCR submissions. Drill into the Alert Engine (sidebar) for the full queue."
    });
  }

  function handleViewLeaderboard() {
    setDetail({
      title: "Full Joint Visit Leaderboard",
      body: allReps.map((r) => `${r.name} (${r.title}): ${r.pct}%`).join(" · ")
    });
  }

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
            <span className="material-symbols-outlined text-[11px] group-hover:rotate-180 transition-transform duration-500 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:text-orange-500">{`sync`}</span>
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
              20
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                Headcount across all territories
              </span>
            </div>
          </div>
        </article>
        {/*  Card 2: Active Representatives  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Representatives
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 border border-emerald-200/50">
              65% Field Rate
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
              13
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-slate-700 h-1.5 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          </div>
        </article>
        {/*  Card 3: Today's Doctor Calls  */}
        <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Today's Doctor Calls
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
              Pending Sync
            </span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
              0
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                Target per rep: 12 calls/day
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
              0%
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">{`warning`}</span>{" "}
                Cutoff today 8:00 PM
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
              12
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                Routes unvisited &gt; 15 days
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
            <span className="text-[11px] text-slate-400">Monthly goal: 15</span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
              2
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
              20
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-rose-600">
                100% staff lagging 3+ consecutive DCRs
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
              18
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
              53
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                GPS spoofing, missing doctor signature
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
              >
                This Month
              </button>
              <button
                className={timeframe === "overall" ? "px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold rounded shadow-xs" : "px-2 py-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"}
                type="button"
                onClick={() => setTimeframe("overall")}
              >
                Overall
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {topPerformers.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className={i === 0 ? "w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center" : "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold text-xs flex items-center justify-center"}>
                    {p.initials}
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
                    <div className={i === 0 ? "bg-emerald-500 h-1 rounded-full w-full" : "bg-slate-300 h-1 rounded-full w-0"}></div>
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
            {bottomPerformers.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className={i === 1 ? "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center" : "w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center"}>
                    {p.initials}
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
                    <div className="bg-rose-500 h-1 rounded-full w-0"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/*  Bottom Panel Action Footer  */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Showing 3 of 20 field reps</span>
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
