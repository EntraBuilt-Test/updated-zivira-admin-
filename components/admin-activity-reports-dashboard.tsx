"use client";

import type { ZiviraTreeNode } from "@zivira/types";
import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  ClipboardList,
  Calendar,
  FileSpreadsheet,
  Sliders,
  Download,
  ArrowRight,
  Folder,
  Layers,
  CheckCircle2,
  Clock
} from "lucide-react";

interface ReportModuleMeta {
  slug: string;
  title: string;
  subtitle?: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  hoverIconBg: string;
  description: string;
  featureTag: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const REPORT_MODULES: ReportModuleMeta[] = [
  {
    slug: "territory",
    title: "Territory",
    badge: "2 Sub Tabs",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    iconBg: "bg-orange-50 text-orange-600 border-orange-100",
    hoverBorder: "hover:border-orange-400",
    hoverIconBg: "group-hover:bg-orange-600 group-hover:text-white",
    description: "Zone hierarchies, headquarters master assignments, geographical classifications, and representative field alignments.",
    featureTag: "HQ & Regional Breakdown",
    icon: MapPin
  },
  {
    slug: "survey",
    title: "Survey",
    badge: "3 Sub Tabs",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hoverBorder: "hover:border-emerald-400",
    hoverIconBg: "group-hover:bg-emerald-600 group-hover:text-white",
    description: "Doctor brand feedback surveys, chemist stock perception audits, competitor benchmarking, and campaign response forms.",
    featureTag: "Responses & Analytics",
    icon: ClipboardList
  },
  {
    slug: "tp",
    title: "TP",
    subtitle: "(Tour Program)",
    badge: "4 Sub Tabs",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    hoverBorder: "hover:border-amber-400",
    hoverIconBg: "group-hover:bg-amber-600 group-hover:text-white",
    description: "Advance monthly tour itineraries, manager approval logs, route deviation alerts, and station travel allocations.",
    featureTag: "Monthly Rosters",
    icon: Calendar
  },
  {
    slug: "dcr",
    title: "DCR",
    subtitle: "(Daily Call Report)",
    badge: "8 Sub Tabs",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    iconBg: "bg-violet-50 text-violet-600 border-violet-100",
    hoverBorder: "hover:border-violet-400",
    hoverIconBg: "group-hover:bg-violet-600 group-hover:text-white",
    description: "Comprehensive field activity logs, doctor visit timings, sample dispatches, chemist order bookings, and joint field work.",
    featureTag: "Primary & Secondary Logs",
    icon: FileSpreadsheet
  },
  {
    slug: "customized-report",
    title: "Customized Report",
    badge: "Report Builder",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    hoverBorder: "hover:border-indigo-400",
    hoverIconBg: "group-hover:bg-indigo-600 group-hover:text-white",
    description: "Ad-hoc query designer, cross-filter TP versus DCR adherence, scheduled dispatches, and multi-format exports.",
    featureTag: "Query Builder",
    icon: Sliders
  }
];

export function AdminActivityReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [repFilter, setRepFilter] = useState("all");

  const recentLogs = [
    {
      id: "LOG-8921",
      type: "DCR #8921 - Doctor Visit Log",
      territory: "North Zone • Delhi Central",
      submittedBy: "Rajesh Sharma (MR-104)",
      period: "Today, 04:30 PM",
      status: "Approved",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "LOG-8920",
      type: "TP #4102 - Tour Plan Deviation",
      territory: "South Zone • Bangalore Metro",
      submittedBy: "Priya Nair (MR-208)",
      period: "Today, 02:15 PM",
      status: "Pending",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
      id: "LOG-8919",
      type: "Survey #118 - Cardiologist Feedback",
      territory: "West Zone • Mumbai Suburban",
      submittedBy: "Amit Patel (MR-312)",
      period: "Yesterday",
      status: "Approved",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "LOG-8918",
      type: "Territory #042 - HQ Coverage Review",
      territory: "East Zone • Kolkata Central",
      submittedBy: "Sneha Sen (MR-199)",
      period: "2 days ago",
      status: "Approved",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  ];

  return (
    <div className="flex flex-col w-full space-y-5">
      {/* HEADER SECTION */}
      <section className="flex flex-col space-y-2">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] font-semibold tracking-wider uppercase">
          <span className="text-slate-400">Platform</span>
          <span className="text-slate-300">/</span>
          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Activity Reports
          </span>
        </nav>

        {/* Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Activity Reports
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-3xl leading-relaxed">
              Mirrors the legacy <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200">sanpharma.info</code> Activity Reports menu structure: Territory, Survey, TP, DCR and Customized Report.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK STATS STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Core Modules</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">5 Categories</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <Layers size={16} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Sub Tabs</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">17 Sub Reports</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet size={16} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Sync Status</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">Live Sync</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Reporting Cycle</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">Current Month</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock size={16} />
          </div>
        </div>
      </section>

      {/* REPORT CARDS GRID */}
      <section aria-label="Activity Reports Modules" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {REPORT_MODULES.map((mod) => {
          const Icon = mod.icon;
          const href = `/admin/workspace/${[...path, mod.slug].join("/")}`;
          return (
            <Link
              key={mod.slug}
              href={href}
              className={`group relative flex flex-col justify-between bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${mod.hoverBorder}`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-all duration-200 ${mod.iconBg} ${mod.hoverIconBg}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>

                <div className="mt-3.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition">
                      {mod.title}
                    </h2>
                    {mod.subtitle && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {mod.subtitle}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Folder size={13} className="text-slate-400" />
                  <span>{mod.featureTag}</span>
                </div>
                <span className="text-xs font-semibold text-orange-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Explore <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* RECENT ACTIVITY LOGS TABLE */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recently Generated Activity Logs</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Quick access to the last synchronised data submissions from the field force.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/workspace/division-dashboard/division-navigation-tabs/activity-reports/dcr"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition"
            >
              View All History →
            </Link>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-2.5 pl-2" scope="col">Report Type</th>
                <th className="pb-2.5" scope="col">Territory / HQ</th>
                <th className="pb-2.5" scope="col">Submitted By</th>
                <th className="pb-2.5" scope="col">Cycle Period</th>
                <th className="pb-2.5" scope="col">Status</th>
                <th className="pb-2.5 pr-2 text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 pl-2 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    {log.type}
                  </td>
                  <td className="py-2.5 text-xs">{log.territory}</td>
                  <td className="py-2.5 text-xs text-slate-700">{log.submittedBy}</td>
                  <td className="py-2.5 text-xs text-slate-500">{log.period}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${log.statusColor}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    <Link
                      href="/admin/workspace/division-dashboard/division-navigation-tabs/activity-reports/dcr"
                      className="font-medium text-xs text-orange-600 hover:text-orange-800"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

