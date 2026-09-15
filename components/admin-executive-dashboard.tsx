import React from "react";
import { ZiviraTreeNode } from "@/packages/types/src/zivira-tree";

export function AdminExecutiveDashboard({
  node,
  path,
}: {
  node: ZiviraTreeNode;
  path: string[];
}) {
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
        </div>
        <div className="flex items-center gap-4.5 self-start md:self-center">
          <button
            className="inline-flex items-center gap-4 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[11px]">{`arrow_back`}</span>
            <span>Back</span>
          </button>
          <button
            className="inline-flex items-center gap-4 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-orange-600 dark:text-orange-500 transition shadow-sm group"
            id="refreshMetricsBtn"
            type="button"
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
            <a
              className="text-[11px] font-semibold text-orange-600 dark:text-orange-500 hover:text-orange-700 underline"
              href="#"
            >
              View all
            </a>
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
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-sm">{`trending_up`}</span>
              <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">
                Top Performers (Joint Visit %)
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <button className="px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold rounded shadow-xs">
                This Month
              </button>
              <button className="px-2 py-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200">
                Overall
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {/*  Performer 1  */}
            <div className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  RD
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    Rahul Deshmukh
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Senior Territory Executive (Mumbai)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
                  100%
                </span>
                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                  <div className="bg-emerald-500 h-1 rounded-full w-full"></div>
                </div>
              </div>
            </div>
            {/*  Performer 2  */}
            <div className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold text-xs flex items-center justify-center">
                  AM
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    Anjali Menon
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Territory Executive (Kochi)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                  0%
                </span>
                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                  <div className="bg-slate-300 h-1 rounded-full w-0"></div>
                </div>
              </div>
            </div>
            {/*  Performer 3  */}
            <div className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold text-xs flex items-center justify-center">
                  KS
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    Karthik Subramaniam
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Territory Executive (Chennai)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                  0%
                </span>
                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                  <div className="bg-slate-300 h-1 rounded-full w-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*  Right Panel: Bottom Performers  */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-4 text-rose-600">
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
            {/*  Bottom Performer 1  */}
            <div className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center">
                  DI
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    Deepa Iyer
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sales Specialist (Bengaluru)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-rose-600 bg-rose-50">
                  0%
                </span>
                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                  <div className="bg-rose-500 h-1 rounded-full w-0"></div>
                </div>
              </div>
            </div>
            {/*  Bottom Performer 2  */}
            <div className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center">
                  T
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    Testing
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Test Account (HQ Dummy)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-rose-600 bg-rose-50">
                  0%
                </span>
                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                  <div className="bg-rose-500 h-1 rounded-full w-0"></div>
                </div>
              </div>
            </div>
            {/*  Bottom Performer 3  */}
            <div className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center">
                  P
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    priya
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Field Trainee (Delhi NCR)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-rose-600 bg-rose-50">
                  0%
                </span>
                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1">
                  <div className="bg-rose-500 h-1 rounded-full w-0"></div>
                </div>
              </div>
            </div>
          </div>
          {/*  Bottom Panel Action Footer  */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Showing 3 of 20 field reps</span>
            <a
              className="font-semibold text-orange-600 dark:text-orange-500 hover:text-orange-700 inline-flex items-center gap-1"
              href="#"
            >
              <span>View full leaderboard</span>
              <span className="material-symbols-outlined text-[10px]">{`arrow_forward`}</span>
            </a>
          </div>
        </div>
      </section>
      {/*  END: PerformanceSplitSection  */}
    </main>
  );
}
