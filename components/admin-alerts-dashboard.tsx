"use client";

import { useMemo, useState } from "react";
import { ZiviraTreeNode } from "@/packages/types/src/zivira-tree";

// Item fix — this page used to be a fully static server component: Back,
// Refresh, all 7 filter pills, the search box, every row's View button, and
// the pagination controls did nothing when clicked. The 3 severity KPI
// cards are left as-is (no backend alerts collection exists yet), but the
// alert table itself is now real local state: the filter pills and search
// actually filter it, View opens a real detail popup for that row, Refresh
// resets the filters, and pagination reflects the real filtered count.

type Severity = "HIGH" | "MED" | "LOW";

type AlertRow = {
  id: string;
  severity: Severity;
  type: string;
  filterKey: string;
  leadText: string;
  name: string;
  trailText: string;
};

const initialAlerts: AlertRow[] = [
  { id: "al1", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Vikram Shah", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al2", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Area Business Manager - Chennai", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al3", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Deepa Iyer", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al4", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Arvind Rao", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al5", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Sunita Kulkarni", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al6", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Anjali Menon", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al7", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Karthik Subramaniam", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al8", severity: "HIGH", type: "SALARY HOLD", filterKey: "SALARY HOLD", leadText: "Payroll on hold for", name: "Farhan Sheikh", trailText: "— Missed 25 working-day DCR(s) in the last 30 days — chronic defaulter threshold exceeded.." },
  { id: "al9", severity: "MED", type: "DCR NOT SUBMITTED", filterKey: "DCR NOT SUBMITTED", leadText: "Daily Call Report overdue for", name: "Rohan Mehra", trailText: "(North Zone) — 5 consecutive days missing." },
  { id: "al10", severity: "LOW", type: "TERRITORY INACTIVE", filterKey: "TERRITORY INACTIVE", leadText: "Territory", name: "Secunderabad Area B", trailText: "logged zero clinic visits past 14 days." }
];

const FILTER_TABS: { key: string; label: string }[] = [
  { key: "SALARY HOLD", label: "Salary Hold (16)" },
  { key: "DOCTOR VISIT", label: "Doctor Not Visited 90+ Days (12)" },
  { key: "TERRITORY INACTIVE", label: "Territory Inactive (19)" },
  { key: "LOW COVERAGE", label: "Low Coverage (6)" },
  { key: "DCR NOT SUBMITTED", label: "DCR Not Submitted (20)" },
  { key: "SAMPLE STOCK LOW", label: "Sample Stock Low (0)" },
  { key: "PRODUCT NOT PROMOTED", label: "Product Not Promoted (9)" }
];

const PAGE_SIZE = 10;

export function AdminAlertsDashboard({
  node,
  path,
}: {
  node: ZiviraTreeNode;
  path: string[];
}) {
  const [alerts] = useState<AlertRow[]>(initialAlerts);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (activeFilter && a.filterKey !== activeFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.leadText.toLowerCase().includes(q) ||
        a.trailText.toLowerCase().includes(q)
      );
    });
  }, [alerts, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleBack() {
    if (typeof window !== "undefined") window.history.back();
  }

  function handleRefresh() {
    setRefreshing(true);
    setActiveFilter(null);
    setSearch("");
    setPage(1);
    setTimeout(() => setRefreshing(false), 500);
  }

  const severityClass: Record<Severity, string> = {
    HIGH: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50",
    MED: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    LOW: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
  };
  const severityLabel: Record<Severity, string> = { HIGH: "HIGH", MED: "MED", LOW: "LOW" };

  return (
    <main
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
      data-purpose="dashboard-main"
    >
      {/*  BEGIN: Section Header Title & Actions  */}
      <section className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            ALERTS
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            Alert &amp; Notification Engine
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Automated alerts pulled live from compliance, coverage, payroll, and
            sample-stock signals across the platform.
          </p>
        </div>
        {/*  Header Action Buttons  */}
        <div className="flex items-center gap-2.5 self-start">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            type="button"
            onClick={handleBack}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            Back
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            type="button"
            onClick={handleRefresh}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              id="refresh-icon"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            Refresh
          </button>
        </div>
      </section>
      {/*  END: Section Header Title & Actions  */}
      {/*  BEGIN: Stat Cards Grid — untouched KPI display  */}
      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-purpose="stat-summary-cards"
      >
        {/*  High Severity Card  */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            High Severity
          </p>
          <div className="mt-3 flex items-baseline">
            <span className="text-4xl font-extrabold text-[#d92d20] tracking-tight">
              53
            </span>
          </div>
        </div>
        {/*  Medium Severity Card  */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Medium Severity
          </p>
          <div className="mt-3 flex items-baseline">
            <span className="text-4xl font-extrabold text-[#b5651d] dark:text-amber-500 tracking-tight">
              20
            </span>
          </div>
        </div>
        {/*  Low Severity Card  */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Low Severity
          </p>
          <div className="mt-3 flex items-baseline">
            <span className="text-4xl font-extrabold text-slate-600 dark:text-slate-400 tracking-tight">
              9
            </span>
          </div>
        </div>
      </section>
      {/*  END: Stat Cards Grid  */}
      {/*  BEGIN: Filter Tabs & Search Bar  */}
      <section className="space-y-3" data-purpose="table-filters">
        {/*  Filter Tabs / Pills  */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {FILTER_TABS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                className={`filter-tab px-3.5 py-1.5 rounded-full border transition ${active ? "bg-brand-orange text-white border-brand-orange" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                data-filter={f.key}
                type="button"
                onClick={() => { setActiveFilter((prev) => (prev === f.key ? null : f.key)); setPage(1); }}
              >
                {f.label}
              </button>
            );
          })}
          {activeFilter && (
            <button
              type="button"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline px-1"
              onClick={() => { setActiveFilter(null); setPage(1); }}
            >
              Clear
            </button>
          )}
        </div>
        {/*  Search Bar for quick filter  */}
        <div className="relative w-full max-w-sm pt-1">
          <input
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-8 pr-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange"
            id="table-search"
            placeholder="Search alerts by employee, role or detail..."
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <span className="absolute left-2.5 top-3 text-slate-400">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </span>
        </div>
      </section>
      {/*  END: Filter Tabs & Search Bar  */}
      {/*  BEGIN: Alert Table Section  */}
      <section
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        data-purpose="alerts-table-container"
      >
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-left border-collapse" id="alerts-table">
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5 w-36" scope="col">
                  SEVERITY
                </th>
                <th className="py-3.5 px-5 w-44" scope="col">
                  TYPE
                </th>
                <th className="py-3.5 px-5" scope="col">
                  ALERT
                </th>
                <th className="py-3.5 px-4 text-right w-24" scope="col">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-slate-100 dark:divide-slate-800 text-xs"
              id="alerts-body"
            >
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 px-5 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No matching alert notifications found.
                  </td>
                </tr>
              )}
              {pageRows.map((a, i) => (
                <tr
                  key={a.id}
                  className={`alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group ${i === 2 && !activeFilter && !search ? "bg-orange-50/40 dark:bg-orange-950/20 hover:bg-orange-50/70 dark:hover:bg-orange-950/30" : ""}`}
                  data-type={a.type}
                >
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${severityClass[a.severity]}`}>
                      {a.severity === "HIGH" && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                      )}
                      {a.severity === "MED" && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                      )}
                      {severityLabel[a.severity]}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">
                    {a.type}
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text">
                    {a.leadText}{" "}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {a.name}
                    </strong>{" "}
                    {a.trailText}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                      type="button"
                      onClick={() => setDetail({ title: `${a.type} — ${a.name}`, body: `${severityLabel[a.severity]} severity. ${a.leadText} ${a.name} ${a.trailText}` })}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/*  Table Pagination Footer  */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <span
              className="font-semibold text-slate-700 dark:text-slate-200"
              id="visible-count"
            >
              {pageRows.length}
            </span>{" "}
            of {filtered.length} total alerts
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              disabled={safePage <= 1}
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`px-2.5 py-1 rounded ${n === safePage ? "bg-brand-orange text-white" : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                type="button"
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              disabled={safePage >= totalPages}
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
      {/*  END: Alert Table Section  */}

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md space-y-3 border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{detail.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{detail.body}</p>
            <div className="flex justify-end pt-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
