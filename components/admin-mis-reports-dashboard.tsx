"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ToolbarDropdown } from "./toolbar-dropdown";
import type { ZiviraTreeNode } from "@zivira/types";
import {
  CheckCircle2,
  AlertTriangle,
  MapPin,
  UserCheck,
  Users,
  BarChart3,
  Crosshair,
  Flame,
  ShoppingBag,
  Eye,
  Package,
  ShieldCheck,
  AlertCircle,
  Tablet,
  Award,
  FileText,
  Database,
  Archive,
  Settings,
  ArrowRight,
  Download,
  Search
} from "lucide-react";

interface MisReportCard {
  slug: string;
  title: string;
  desc: string;
  badge: {
    text: string;
    className: string;
    hasPing?: boolean;
  };
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconContainerClass: string;
  cardBorderClass?: string;
  metricSnippet?: React.ReactNode;
  tags?: string[];
  titleBadge?: string;
  footerLeft: {
    text: string;
    isPill?: boolean;
    className?: string;
  };
  footerRight: {
    label: string;
    className: string;
    isDownload?: boolean;
  };
}

interface MisGroup {
  id: string;
  title: string;
  subtitle: string;
  colorBarClass: string;
  countText: string;
  gridColsClass?: string;
  modules: MisReportCard[];
}

const MIS_GROUPS: MisGroup[] = [
  {
    id: "core-ops",
    title: "Daily Reporting & Core Operations",
    subtitle: "Primary operational logs filed daily by field representatives",
    colorBarClass: "bg-emerald-500",
    countText: "4 Modules",
    gridColsClass: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    modules: [
      {
        slug: "mis-dcr",
        title: "DCR",
        desc: "Daily Call Report submission & verification stream",
        badge: {
          text: "Live Sync",
          className: "bg-emerald-100/70 text-emerald-800",
          hasPing: true
        },
        icon: CheckCircle2,
        iconContainerClass: "bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
            <span>Last log: <span className="font-medium text-slate-700">14 mins ago</span></span>
            <span className="text-emerald-600 font-semibold">100% active</span>
          </div>
        ),
        footerLeft: { text: "Open Tab", isPill: true },
        footerRight: { label: "Launch", className: "text-indigo-600 hover:text-indigo-800" }
      },
      {
        slug: "missed-call-report",
        title: "Missed Call Report",
        desc: "Uncontacted target HCPs & schedule exceptions",
        badge: {
          text: "3 Pending",
          className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 font-bold"
        },
        icon: AlertTriangle,
        iconContainerClass: "bg-rose-50 border border-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-rose-50/50 p-2 rounded-lg border border-rose-100/60">
            <span className="text-rose-700 font-medium">Attention needed</span> for Western Region
          </div>
        ),
        footerLeft: { text: "Open Tab", isPill: true },
        footerRight: { label: "Review", className: "text-rose-600 hover:text-rose-800" }
      },
      {
        slug: "visit-details",
        title: "Visit Details",
        desc: "Doctor visits, Chemist meetings, Joint work & GPS",
        badge: {
          text: "10 sub tabs",
          className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
        },
        icon: MapPin,
        iconContainerClass: "bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        tags: ["HCP Visit", "Chemist", "Joint Work", "+7 more"],
        footerLeft: { text: "Comprehensive", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Explore", className: "text-blue-600 hover:text-blue-800" }
      },
      {
        slug: "doctor",
        title: "Doctor",
        desc: "HCP Master Registry, Class A/B Tiering & Call Coverage",
        badge: {
          text: "Master List",
          className: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-700/10"
        },
        icon: UserCheck,
        iconContainerClass: "bg-teal-50 border border-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
            <span>Total Registry: <strong className="text-slate-800">4,820 HCPs</strong></span>
          </div>
        ),
        footerLeft: { text: "Open Tab", isPill: true },
        footerRight: { label: "View HCPs", className: "text-teal-600 hover:text-teal-800" }
      }
    ]
  },
  {
    id: "field-analysis",
    title: "Field Analysis & Leadership",
    subtitle: "Multidimensional manager KPIs, rep scorecards, and territorial heatmaps",
    colorBarClass: "bg-indigo-600",
    countText: "4 Modules",
    gridColsClass: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    modules: [
      {
        slug: "manager-analysis",
        title: "Manager Analysis",
        desc: "Area & Regional manager coaching metrics & tour plan adherence",
        badge: {
          text: "6 sub tabs",
          className: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
        },
        icon: Users,
        iconContainerClass: "bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-indigo-50/40 p-2 rounded-lg border border-indigo-100/50">
            Includes: Joint work ratio, Team strike rate
          </div>
        ),
        footerLeft: { text: "Leadership View", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Inspect", className: "text-indigo-600 hover:text-indigo-800" }
      },
      {
        slug: "analysis",
        title: "Analysis",
        desc: "Macro performance drill-down, frequency & call averages",
        badge: {
          text: "8 sub tabs",
          className: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-700/10"
        },
        icon: BarChart3,
        iconContainerClass: "bg-violet-50 border border-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            Target vs Actual · Call frequency curve
          </div>
        ),
        footerLeft: { text: "Deep Dive", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Explore", className: "text-violet-600 hover:text-violet-800" }
      },
      {
        slug: "single-analysis",
        title: "Single Analysis",
        desc: "Individual Medical Representative (MR) isolated 360° scorecard",
        badge: {
          text: "4 sub tabs",
          className: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10"
        },
        icon: Crosshair,
        iconContainerClass: "bg-purple-50 border border-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            Rep-level productivity & territory index
          </div>
        ),
        footerLeft: { text: "Rep Scorecard", isPill: false, className: "text-slate-400" },
        footerRight: { label: "View Rep", className: "text-purple-600 hover:text-purple-800" }
      },
      {
        slug: "heat-analysis",
        title: "Heat Analysis",
        desc: "Geographic density, call frequency distribution & cold zones",
        badge: {
          text: "3 sub tabs",
          className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-700/10"
        },
        icon: Flame,
        iconContainerClass: "bg-amber-50 border border-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/60">
            High density: Tier-1 Hubs · Low: Outer Belts
          </div>
        ),
        footerLeft: { text: "Geo Intel", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Heatmap", className: "text-amber-600 hover:text-amber-800" }
      }
    ]
  },
  {
    id: "product-sales",
    title: "Product & Sales Performance",
    subtitle: "Commercial conversion, prescription audits, detailing voice & sample dispatch",
    colorBarClass: "bg-cyan-600",
    countText: "3 Modules",
    gridColsClass: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    modules: [
      {
        slug: "pob-rx",
        title: "POB / Rx",
        titleBadge: "+12% MoM",
        desc: "Personal Order Booking, Chemist Rx audits & chemist order sync",
        badge: {
          text: "4 sub tabs",
          className: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-700/10"
        },
        icon: ShoppingBag,
        iconContainerClass: "bg-cyan-50 border border-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between">
            <span>Orders Logged: <strong className="text-slate-800">₹42.8 Lakh</strong></span>
            <span className="text-cyan-600 font-medium">92% Target</span>
          </div>
        ),
        footerLeft: { text: "Order Audit", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Track Orders", className: "text-cyan-600 hover:text-cyan-800" }
      },
      {
        slug: "product-exposure",
        title: "Product Exposure",
        desc: "Brand Share of Voice, focus brand airtime & detailing priority",
        badge: {
          text: "5 sub tabs",
          className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
        },
        icon: Eye,
        iconContainerClass: "bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            Primary Focus: Cardiopulse & Neuroshield
          </div>
        ),
        footerLeft: { text: "Share of Voice", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Analyze", className: "text-blue-600 hover:text-blue-800" }
      },
      {
        slug: "sample-input",
        title: "Sample / Input",
        desc: "Physician sample distribution, promo input burn rate & balance",
        badge: {
          text: "3 sub tabs",
          className: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/10"
        },
        icon: Package,
        iconContainerClass: "bg-orange-50 border border-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
        metricSnippet: (
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between">
            <span>Remaining Quota: <strong className="text-slate-800">68%</strong></span>
            <span className="text-emerald-600 font-medium">Audited</span>
          </div>
        ),
        footerLeft: { text: "Inventory Logs", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Audit", className: "text-orange-600 hover:text-orange-800" }
      }
    ]
  },
  {
    id: "compliance-data",
    title: "Compliance, Digital & Raw Data Extracts",
    subtitle: "Exceptions, digital detailing tablet telemetry, tests, and raw warehouse dumps",
    colorBarClass: "bg-slate-700",
    countText: "8 Modules",
    gridColsClass: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    modules: [
      {
        slug: "status",
        title: "Status",
        desc: "Tour programme approvals, leave logs & submission locks",
        badge: {
          text: "4 sub tabs",
          className: "bg-slate-100 text-slate-700"
        },
        icon: ShieldCheck,
        iconContainerClass: "bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
        footerLeft: { text: "Approval Workflow", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Open", className: "text-slate-700 hover:text-slate-900" }
      },
      {
        slug: "exception",
        title: "Exception",
        desc: "Out-of-territory calls, non-core doctor visits & TP violations",
        badge: {
          text: "3 sub tabs",
          className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 font-semibold"
        },
        icon: AlertCircle,
        iconContainerClass: "bg-rose-50 border border-rose-200 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
        cardBorderClass: "border-rose-200/80",
        footerLeft: { text: "Flagged Audits", isPill: false, className: "text-rose-600 font-medium" },
        footerRight: { label: "Resolve", className: "text-rose-600 hover:text-rose-800" }
      },
      {
        slug: "digital-detailing",
        title: "Digital Detailing",
        desc: "e-Detailing slide retention, slide dwell time, HCP engagement",
        badge: {
          text: "4 sub tabs",
          className: "bg-sky-50 text-sky-700"
        },
        icon: Tablet,
        iconContainerClass: "bg-sky-50 border border-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
        footerLeft: { text: "Tablet Telemetry", isPill: false, className: "text-slate-400" },
        footerRight: { label: "View", className: "text-sky-600 hover:text-sky-800" }
      },
      {
        slug: "quiz-test-result",
        title: "Quiz Test Result",
        desc: "Therapeutic knowledge evaluation & clinical exam results",
        badge: {
          text: "Avg 88.5%",
          className: "bg-emerald-50 text-emerald-700 font-semibold"
        },
        icon: Award,
        iconContainerClass: "bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        footerLeft: { text: "Medical Training", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Scores", className: "text-emerald-600 hover:text-emerald-800" }
      },
      {
        slug: "summary",
        title: "Summary",
        desc: "High-level executive rollups, month-end consolidations",
        badge: {
          text: "2 sub tabs",
          className: "bg-indigo-50 text-indigo-700"
        },
        icon: FileText,
        iconContainerClass: "bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        footerLeft: { text: "Executive Deck", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Generate", className: "text-indigo-600 hover:text-indigo-800" }
      },
      {
        slug: "dump",
        title: "Dump",
        desc: "Primary raw transactions, complete master call table export",
        badge: {
          text: "6 sub tabs",
          className: "bg-slate-100 text-slate-700"
        },
        icon: Database,
        iconContainerClass: "bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
        footerLeft: { text: "CSV / XLS Export", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Download", className: "text-slate-700 hover:text-slate-900", isDownload: true }
      },
      {
        slug: "dump-ii",
        title: "Dump II",
        desc: "Secondary sales, stockist movement & replenishment dump",
        badge: {
          text: "2 sub tabs",
          className: "bg-slate-100 text-slate-700"
        },
        icon: Archive,
        iconContainerClass: "bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
        footerLeft: { text: "Secondary Logs", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Download", className: "text-slate-700 hover:text-slate-900", isDownload: true }
      },
      {
        slug: "options",
        title: "Options",
        desc: "Territory boundaries, custom fields, module access switches",
        badge: {
          text: "2 sub tabs",
          className: "bg-slate-100 text-slate-700"
        },
        icon: Settings,
        iconContainerClass: "bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
        footerLeft: { text: "Preferences", isPill: false, className: "text-slate-400" },
        footerRight: { label: "Configure", className: "text-slate-700 hover:text-slate-900" }
      }
    ]
  }
];

export function AdminMisReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return MIS_GROUPS;
    const query = searchQuery.toLowerCase().trim();

    return MIS_GROUPS.map((group) => {
      const matchingModules = group.modules.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.desc.toLowerCase().includes(query) ||
          m.badge.text.toLowerCase().includes(query) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(query)))
      );
      return {
        ...group,
        modules: matchingModules
      };
    }).filter((group) => group.modules.length > 0);
  }, [searchQuery]);

  const totalModulesCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.modules.length, 0);
  }, [filteredGroups]);

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col w-full">
        <div className="space-y-6">
        {/* Top Utility Ribbon & Executive Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-surface-card p-card-padding-standard rounded-xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">
              <span className="hover:text-primary transition-colors">Platform</span>
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
        </div>

        {/* Executive KPI Metric Cards (4-Column Bento Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-grid-gutter">
          {/* Card 1: Net Secondary Sales Achievement */}
          <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Secondary Sales (MTD)</span>
              <div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
              </div>
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
          {/* Card 2: Field Productivity Ratio */}
          <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Field Rep Productivity</span>
              <div className="w-8 h-8 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </div>
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
          {/* Card 3: Doctor Coverage & Frequency Adherence */}
          <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">HCP List Coverage</span>
              <div className="w-8 h-8 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">person_check</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-metric-value text-metric-value text-text-primary">92.4%</span>
                <span className="font-label-md text-label-md text-status-success font-semibold">Tier-1 Optimal</span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-status-success h-full rounded-full transition-all duration-500" style={{ "width": "92.4%" }}></div>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-subtle font-body-sm text-body-sm">
              <span className="text-text-muted">A+ Tier Coverage: <strong>97.1%</strong></span>
              <span className="text-text-muted">Repeat Adh: <strong className="text-text-primary">88.6%</strong></span>
            </div>
          </div>
          {/* Card 4: Sample & Detailing Yield */}
          <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Sample Conversion ROI</span>
              <div className="w-8 h-8 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">vaccines</span>
              </div>
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
              <a className="text-primary hover:underline font-label-sm text-label-sm" href="#">Audit</a>
            </div>
          </div>
        </div>

        {/* MIS MODULES HUB (Applied from Stitch Design) */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-xs">
          {/* Module Filter & Search Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">MIS Reporting Hub</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {totalModulesCount} {totalModulesCount === 1 ? "Module" : "Modules"}
              </span>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MIS modules..."
                className="w-full h-8 pl-9 pr-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Group Sections */}
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-xs font-medium text-slate-500">No MIS modules found matching &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <section key={group.id} className="space-y-3.5" id={group.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-5 rounded-full ${group.colorBarClass}`}></div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">{group.title}</h2>
                      <p className="text-[11px] text-slate-500">{group.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {group.modules.length} {group.modules.length === 1 ? "Module" : "Modules"}
                  </span>
                </div>

                <div className={`grid ${group.gridColsClass ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"} gap-4`}>
                  {group.modules.map((mod) => {
                    const Icon = mod.icon;
                    const href = `/admin/workspace/${[...path, mod.slug].join("/")}`;
                    return (
                      <Link
                        key={mod.slug}
                        href={href}
                        className={`group relative bg-white rounded-xl border ${
                          mod.cardBorderClass ?? "border-slate-200/90"
                        } shadow-xs hover:shadow-md p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 cursor-pointer`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mod.iconContainerClass}`}>
                              <Icon size={18} />
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${mod.badge.className}`}>
                              {mod.badge.hasPing && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                              )}
                              {mod.badge.text}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                                {mod.title}
                              </h3>
                              {mod.titleBadge && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                                  {mod.titleBadge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {mod.desc}
                            </p>
                          </div>

                          {mod.metricSnippet && mod.metricSnippet}

                          {mod.tags && (
                            <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                              {mod.tags.map((tag, idx) => (
                                <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          {mod.footerLeft.isPill ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {mod.footerLeft.text}
                            </span>
                          ) : (
                            <span className={`text-[11px] ${mod.footerLeft.className ?? "text-slate-400"}`}>
                              {mod.footerLeft.text}
                            </span>
                          )}

                          <span className={`text-xs font-semibold inline-flex items-center gap-1 transition-colors ${mod.footerRight.className}`}>
                            {mod.footerRight.label}
                            {mod.footerRight.isDownload ? (
                              <Download size={13} className="transition group-hover:translate-y-0.5" />
                            ) : (
                              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                            )}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

{/* Main Data Table Container with Filters & Controls */}
<div className="bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
{/* Filter Bar & Search Sub-Header */}
<div className="p-card-padding-standard flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-subtle">
{/* Search bar */}
<div className="relative flex-1 max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[19px]">search</span>
<input className="w-full h-[38px] pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search zone, territory HQ, RSM/ABM, or product SKU..." type="text"/>
</div>
{/* Filter Clusters */}
<div className="flex flex-wrap items-center gap-2">
{/* Zone Filter Pills */}
<div className="inline-flex rounded-lg bg-surface-canvas p-0.5">
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md bg-surface-card text-text-primary shadow-sm">All Zones (18)</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">North</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">West Metro</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">South Zone</button>
<button className="px-2.5 py-1 text-label-sm font-label-sm rounded-md text-text-secondary hover:text-text-primary">East Central</button>
</div>
{/* Performance Tier Filter */}
<ToolbarDropdown options={["All Tiers", "Exceeding Target (&gt;100%)", "On-Track (90-100%)", "Critical Deficit (&lt;85%)"]} initialSelected={"All Tiers"} />
{/* Utility icon buttons */}
<button className="w-[34px] h-[34px] rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-secondary flex items-center justify-center transition-colors" title="Column Settings">
<span className="material-symbols-outlined text-[18px]">view_column</span>
</button>
<button className="w-[34px] h-[34px] rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-secondary flex items-center justify-center transition-colors" title="Sort Order">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
</button>
</div>
</div>
{/* Master MIS Sales & Productivity Matrix Table */}
<div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
<tr className="bg-surface-subtle text-text-secondary font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-subtle/50 transition-colors group">
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Territory / HQ Node</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Division</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Target (₹)</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">MTD Achieved</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Progress %</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Variance</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Daily Calls</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Core Coverage</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">POB Booked</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Operational Flag</th>
<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{/* Row 1: Top Performer */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-success" title="Healthy Execution"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Ahmedabad Metro - HQ-041</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Rajesh Varma • 18 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-info-bg text-status-info font-medium">Cardio-Diabetic</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹52,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹56,42,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-success font-label-md text-label-md">108.5%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-success h-full" style={{ "width": "100%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-success text-sm text-text-primary whitespace-nowrap">
                +₹4,42,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-text-primary">12.4</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-success-bg text-status-success font-semibold">96.8%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹14.8 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-success-bg text-status-success border border-status-success-border font-semibold">
<span className="material-symbols-outlined text-[13px]">stars</span> Top Performer
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-success hover:bg-surface-subtle transition-colors" title="Send Commendation">
<span className="material-symbols-outlined text-[18px]">thumb_up</span>
</button>
</div>
</td>
</tr>
{/* Row 2: Balanced / On Track */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-info" title="Balanced Velocity"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Bengaluru Urban - HQ-012</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: S. Parthiban • 22 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-purple-50 text-purple-700 font-medium">Neuro-Ziv</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹68,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹65,28,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-text-primary font-label-md text-label-md">96.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-info h-full" style={{ "width": "96%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-warning text-sm text-text-primary whitespace-nowrap">
                -₹2,72,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-text-primary">11.1</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-info-bg text-status-info font-semibold">92.1%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹18.4 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-subtle text-text-secondary border border-border-subtle font-semibold">
<span className="material-symbols-outlined text-[13px]">check_circle</span> Balanced
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Send Feedback">
<span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
</button>
</div>
</td>
</tr>
{/* Row 3: Call Deficit Flag */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-warning" title="Field Effort Lagging"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Delhi North &amp; Rohini - HQ-004</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Tarun Mehra • 14 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-warning-bg text-status-warning font-medium">Resp-Care</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹44,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹39,16,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-warning font-label-md text-label-md">89.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-warning h-full" style={{ "width": "89%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-danger text-sm text-text-primary whitespace-nowrap">
                -₹4,84,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-status-danger">8.4</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-warning-bg text-status-warning font-semibold">81.4%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹9.2 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-warning-bg text-status-warning border border-status-warning-border font-semibold">
<span className="material-symbols-outlined text-[13px]">phone_missed</span> Call Deficit
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-warning hover:bg-surface-subtle transition-colors" title="Dispatch Notice">
<span className="material-symbols-outlined text-[18px]">notification_important</span>
</button>
</div>
</td>
</tr>
{/* Row 4: Critical Deficit */}
<tr className="hover:bg-surface-subtle/60 transition-colors group bg-status-danger-bg/20 hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-danger" title="Critical Run-rate Risk"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Kolkata Central &amp; Howrah - HQ-088</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Debashis Roy • 16 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-info-bg text-status-info font-medium">Cardio-Diabetic</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹58,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-status-danger text-sm text-text-primary whitespace-nowrap">₹44,08,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-danger font-label-md text-label-md">76.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-danger h-full" style={{ "width": "76%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-danger text-sm text-text-primary whitespace-nowrap">
                -₹13,92,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-status-danger">7.8</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-danger-bg text-status-danger font-semibold">73.5%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹8.1 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-danger-bg text-status-danger border border-status-danger-border font-semibold">
<span className="material-symbols-outlined text-[13px]">crisis_alert</span> Target At Risk
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Trigger RSM Review">
<span className="material-symbols-outlined text-[18px]">report_problem</span>
</button>
</div>
</td>
</tr>
{/* Row 5: High Value Performer */}
<tr className="hover:bg-surface-subtle/60 transition-colors group hover:bg-surface-subtle/50 transition-colors group">
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<input className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center gap-2.5">
<div className="w-2.5 h-2.5 rounded-full bg-status-success" title="High Run-rate"></div>
<div>
<div className="font-headline-sm text-headline-sm text-text-primary leading-tight">Mumbai Thane &amp; Navi - HQ-009</div>
<div className="font-body-sm text-body-sm text-text-muted">ABM: Vikram Shinde • 24 Field MRs</div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-teal-50 text-teal-700 font-medium">Derma-Care</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹62,00,000</td>
<td className="py-3.5 px-4 text-right font-bold text-text-primary text-sm whitespace-nowrap">₹64,48,000</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-2">
<span className="font-bold text-status-success font-label-md text-label-md">104.0%</span>
<div className="w-14 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
<div className="bg-status-success h-full" style={{ "width": "100%" }}></div>
</div>
</div>
</td>
<td className="py-3.5 px-4 text-right font-semibold text-status-success text-sm text-text-primary whitespace-nowrap">
                +₹2,48,000
              </td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="font-semibold text-text-primary">11.8</span>
<span className="text-text-muted text-[11px]">/ 10.0</span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-status-success-bg text-status-success font-semibold">94.2%</span>
</td>
<td className="py-3.5 px-4 text-right font-medium text-sm text-text-primary whitespace-nowrap">₹21.6 L</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-status-success-bg text-status-success border border-status-success-border font-semibold">
<span className="material-symbols-outlined text-[13px]">verified</span> Strong Pace
                </span>
</td>
<td className="py-3.5 px-4 text-center text-sm text-text-primary whitespace-nowrap">
<div className="flex items-center justify-center gap-1">
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Detailed Breakdown">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-status-danger hover:bg-surface-subtle transition-colors" title="Territory PDF">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</button>
<button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors" title="Send Feedback">
<span className="material-symbols-outlined text-[18px]">thumb_up</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination & Table Summary Footer */}
<div className="px-card-padding-standard py-3 bg-surface-subtle/50 flex flex-wrap items-center justify-between gap-3 text-text-secondary font-body-sm text-body-sm">
<div className="flex items-center gap-2">
<span className="">Showing <strong>1 to 5</strong> of <strong>48 Territory HQs</strong></span>
<span className="text-text-muted">•</span>
<span className="text-text-muted">Total Secondary Sample Base: ₹2.84 Cr</span>
</div>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm disabled:opacity-40" disabled={true}>Previous</button>
<button className="px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold">1</button>
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm">2</button>
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm">3</button>
<button className="px-2.5 py-1 rounded bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm">Next</button>
</div>
</div>
</div>
{/* Secondary Analytical Panels: 2-Column Split */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter">
{/* Panel 1: Brand Basket Contribution vs Growth Matrix (7 cols) */}
<div className="lg:col-span-7 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-1">
<h2 className="font-headline-sm text-headline-sm text-text-primary">Brand Basket Revenue Contribution</h2>
<span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded bg-brand-primary-subtle text-primary font-semibold">MTD Analysis</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary mb-5">
            Key pharma formulation secondary sales yield, primary prescription volume, and month-over-month trajectory.
          </p>
{/* Contribution Stacked Visual Bar */}
<div className="w-full h-4 rounded-lg flex overflow-hidden shadow-inner mb-4">
<div className="bg-primary hover:opacity-90 transition-opacity" style={{ "width": "34.6%" }} title="CardioCare 20 (34.6%)"></div>
<div className="bg-primary-container hover:opacity-90 transition-opacity" style={{ "width": "25.1%" }} title="ZiviCal D3 Forte (25.1%)"></div>
<div className="bg-tertiary hover:opacity-90 transition-opacity" style={{ "width": "20.2%" }} title="GlycoZiv XR (20.2%)"></div>
<div className="bg-status-info hover:opacity-90 transition-opacity" style={{ "width": "11.9%" }} title="Resp-Clear Dry (11.9%)"></div>
<div className="bg-secondary-fixed-dim hover:opacity-90 transition-opacity" style={{ "width": "8.2%" }} title="Others (8.2%)"></div>
</div>
{/* Product Detailed Breakdown Rows */}
<div className="space-y-3">
{/* Brand 1 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">CardioCare 20 (Atorvastatin 20mg)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 24,100 Rx • 34.6% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹1.68 Cr</div>
<div className="font-label-sm text-label-sm text-status-success font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +18.4% MoM
                </div>
</div>
</div>
{/* Brand 2 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-primary-container flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">ZiviCal D3 Forte (Nano Drops 60K)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 19,450 Rx • 25.1% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹1.22 Cr</div>
<div className="font-label-sm text-label-sm text-status-success font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +9.2% MoM
                </div>
</div>
</div>
{/* Brand 3 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-tertiary flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">GlycoZiv XR (Metformin 1000mg ER)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 16,300 Rx • 20.2% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹0.98 Cr</div>
<div className="font-label-sm text-label-sm text-status-success font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">arrow_upward</span> +5.1% MoM
                </div>
</div>
</div>
{/* Brand 4 */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-status-info flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">Resp-Clear Dry (Montelukast Levo)</div>
<div className="font-body-sm text-body-sm text-text-muted">Prescriptions: 9,800 Rx • 11.9% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹0.58 Cr</div>
<div className="font-label-sm text-label-sm text-status-warning font-semibold flex items-center justify-end gap-0.5">
<span className="material-symbols-outlined text-[13px]">horizontal_rule</span> Flat (Season lag)
                </div>
</div>
</div>
{/* Others */}
<div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-full bg-secondary-fixed-dim flex-shrink-0"></span>
<div>
<div className="font-label-md text-label-md text-text-primary">Institutional &amp; All Other SKUs</div>
<div className="font-body-sm text-body-sm text-text-muted">Multiple low-volume batches • 8.2% Basket</div>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm text-text-primary">₹0.40 Cr</div>
<div className="font-label-sm text-label-sm text-text-muted font-semibold">Target Aligned</div>
</div>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-subtle flex items-center justify-between font-label-md text-label-md">
<span className="text-text-muted">Portfolio Gross Margin Yield: <strong className="text-text-primary">68.4%</strong></span>
<a className="text-primary hover:underline flex items-center gap-1 font-semibold" href="#">
<span className="">Download Brand Basket Dossier</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
{/* Panel 2: Executive Exception Alerts & Action Triggers (5 cols) */}
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
            Automated threshold anomalies requiring headquarters operational decisions or RSM escalations.
          </p>
<div className="space-y-3.5">
{/* Alert Item 1 */}
<div className="p-3.5 rounded-xl bg-status-danger-bg/40 border border-status-danger-border flex flex-col gap-2.5">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 text-status-danger font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">trending_down</span>
<span className="">East Central Cluster Deficit</span>
</div>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-status-danger-bg text-status-danger font-semibold">CRITICAL</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary">
<strong>7 Territories</strong> lagging &gt;20% target in East Central with only <strong>4 working days remaining</strong> in cycle. Immediate intervention needed.
              </p>
<div className="flex items-center justify-between pt-1">
<span className="font-label-sm text-label-sm text-text-muted">RSM: S. Chatterjee</span>
<button className="px-2.5 py-1 rounded bg-status-danger text-on-error font-label-sm text-label-sm font-semibold hover:bg-error transition-colors shadow-sm" type="button">
                  Trigger Review Meeting
                </button>
</div>
</div>
{/* Alert Item 2 */}
<div className="p-3.5 rounded-xl bg-status-warning-bg/40 border border-status-warning-border flex flex-col gap-2.5">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 text-status-warning font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">inventory</span>
<span className="">C&amp;F Stock-Out Hazard</span>
</div>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-status-warning-bg text-status-warning font-semibold">LOGISTICS</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary">
<strong>CardioCare 20</strong> stock level dropped below 4 days buffer at <strong>3 C&amp;F distributors</strong> across Bengaluru &amp; Mysore hubs.
              </p>
<div className="flex items-center justify-between pt-1">
<span className="font-label-sm text-label-sm text-text-muted">Dispatch Depot: Hosur</span>
<button className="px-2.5 py-1 rounded bg-status-warning text-text-primary font-label-sm text-label-sm font-semibold hover:bg-amber-600 hover:text-on-primary transition-colors shadow-sm" type="button">
                  Notify Supply Chain
                </button>
</div>
</div>
{/* Alert Item 3 */}
<div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col gap-2.5">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 text-text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px] text-primary">policy</span>
<span className="">Field Adherence Deviation</span>
</div>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-card text-text-secondary font-semibold">COMPLIANCE</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary">
<strong>12 MRs</strong> logged fewer than 8 daily calls minimum across Delhi North for 3 consecutive days.
              </p>
<div className="flex items-center justify-between pt-1">
<span className="font-label-sm text-label-sm text-text-muted">ABM: Tarun Mehra</span>
<button className="px-2.5 py-1 rounded bg-surface-card text-text-primary border border-border-subtle font-label-sm text-label-sm font-semibold hover:bg-surface-subtle transition-colors shadow-sm" type="button">
                  Send ABM Escalation
                </button>
</div>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-subtle flex items-center justify-between font-label-md text-label-md">
<span className="text-text-muted">Pending Audits: <strong>3 Flags</strong></span>
<a className="text-primary hover:underline font-semibold" href="#">Configure Alert Thresholds →</a>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
}
