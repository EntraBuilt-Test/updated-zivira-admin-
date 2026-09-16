import React from "react";
import { ZiviraTreeNode } from "@/packages/types/src/zivira-tree";

export function AdminAlertsDashboard({
  node,
  path,
}: {
  node: ZiviraTreeNode;
  path: string[];
}) {
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
          >
            <svg
              className="w-3.5 h-3.5 transition-transform"
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
      {/*  BEGIN: Stat Cards Grid  */}
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

          <button
            className="filter-tab px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            data-filter="SALARY HOLD"
          >
            Salary Hold (16)
          </button>
          <button
            className="filter-tab px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            data-filter="DOCTOR VISIT"
          >
            Doctor Not Visited 90+ Days (12)
          </button>
          <button
            className="filter-tab px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            data-filter="TERRITORY INACTIVE"
          >
            Territory Inactive (19)
          </button>
          <button
            className="filter-tab px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            data-filter="LOW COVERAGE"
          >
            Low Coverage (6)
          </button>
          <button
            className="filter-tab px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            data-filter="DCR NOT SUBMITTED"
          >
            DCR Not Submitted (20)
          </button>
          <button
            className="filter-tab px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            data-filter="SAMPLE STOCK LOW"
          >
            Sample Stock Low (0)
          </button>
          <button
            className="filter-tab px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            data-filter="PRODUCT NOT PROMOTED"
          >
            Product Not Promoted (9)
          </button>
        </div>
        {/*  Search Bar for quick filter  */}
        <div className="relative w-full max-w-sm pt-1">
          <input
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-8 pr-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange"
            id="table-search"
            placeholder="Search alerts by employee, role or detail..."
            type="text"
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
            <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
              <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-surface-subtle/50 transition-colors group">
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" scope="col">
                  SEVERITY
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" scope="col">
                  TYPE
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" scope="col">
                  ALERT
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" scope="col">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {/*  Row 1  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Vikram Shah
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 2  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Area Business Manager - Chennai
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 3: Highlighted slightly as seen in screenshot selection  */}
              <tr
                className="alert-row bg-orange-50/40 dark:bg-orange-950/20 hover:bg-orange-50/70 dark:hover:bg-orange-950/30 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Deepa Iyer
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 4  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Arvind Rao
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 5  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Sunita Kulkarni
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 6  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Anjali Menon
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 7  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Karthik Subramaniam
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 8  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="SALARY HOLD"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    HIGH
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  SALARY HOLD
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Payroll on hold for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Farhan Sheikh
                  </strong>{" "}
                  — Missed 25 working-day DCR(s) in the last 30 days — chronic
                  defaulter threshold exceeded..
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 9 (DCR Example)  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="DCR NOT SUBMITTED"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    MED
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  DCR NOT SUBMITTED
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Daily Call Report overdue for{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Rohan Mehra
                  </strong>{" "}
                  (North Zone) — 5 consecutive days missing.
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/*  Row 10 (Territory Inactive)  */}
              <tr
                className="alert-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group hover:bg-surface-subtle/50 transition-colors group"
                data-type="TERRITORY INACTIVE"
              >
                <td className="py-3.5 px-5 whitespace-nowrap px-4 text-sm text-text-primary">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    LOW
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] px-4 text-sm text-text-primary">
                  TERRITORY INACTIVE
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 leading-relaxed alert-text px-4 text-sm text-text-primary whitespace-nowrap">
                  Territory{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Secunderabad Area B
                  </strong>{" "}
                  logged zero clinic visits past 14 days.
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap text-sm text-text-primary">
                  <button
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          {/*  Empty State  */}
          <div
            className="hidden p-8 text-center text-slate-500 dark:text-slate-400 text-xs"
            id="no-results-message"
          >
            No matching alert notifications found.
          </div>
        </div>
        {/*  Table Pagination Footer  */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <span
              className="font-semibold text-slate-700 dark:text-slate-200"
              id="visible-count"
            >
              10
            </span>{" "}
            of 82 total alerts
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-brand-orange text-white">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              3
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Next
            </button>
          </div>
        </div>
      </section>
      {/*  END: Alert Table Section  */}
    </main>
  );
}
