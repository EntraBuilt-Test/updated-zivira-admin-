"use client";
// components/bi-analytics-hub.tsx
// Zivira_Project_Basic.docx Topic 13 — Business Intelligence (BI) Reports
//
// Grouped exactly like the project brief's report families — Employee,
// Manager, Doctor, Product and Territory Reports — with each individual
// report as its own link. Every enabled link opens a dedicated page with
// that report's own data (reusing an existing Analytics/BI page or DCR
// Reports where one already covers it, and two small new derived-report
// pages — Products Discussed, Visit Frequency — where none did). Items the
// project brief flags as needing data this system doesn't capture yet
// (Growth, Market Share, Doctor Density) are shown disabled, exactly as
// called out, rather than linking to fabricated numbers.
//
// New file — purely additive, does not touch any existing component.
import { ArrowRight, BarChart3, ClipboardList, MapPin, ShieldCheck, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { AdminTabGrid } from "@/components/admin-tab-grid";
import type { LucideIcon } from "lucide-react";

type ReportLink = { label: string; href: string } | { label: string; note: string };

type ReportGroup = { title: string; icon: LucideIcon; items: ReportLink[] };

const GROUPS: ReportGroup[] = [
  {
    title: "Employee Reports",
    icon: Users,
    items: [
      { label: "Daily Activity", href: "/admin/dcr" },
      { label: "Attendance & Compliance", href: "/admin/analytics/compliance" },
      { label: "Missed DCR", href: "/admin/analytics/compliance" },
      { label: "Productivity (KPIs)", href: "/admin/analytics/kpi" }
    ]
  },
  {
    title: "Manager Reports",
    icon: ShieldCheck,
    items: [
      { label: "Joint Calls", href: "/admin/analytics/rep-manager" },
      { label: "Territory Visits", href: "/admin/analytics/territory-coverage" },
      { label: "Team Performance (KPIs)", href: "/admin/analytics/kpi" },
      { label: "Coaching Analysis (manager ranking)", href: "/admin/analytics/rep-manager" }
    ]
  },
  {
    title: "Doctor Reports",
    icon: Stethoscope,
    items: [
      { label: "Last Visit / Coverage Alerts", href: "/admin/analytics/territory-coverage" },
      { label: "Products Discussed", href: "/admin/analytics/products-discussed" },
      { label: "Samples Received", href: "/admin/analytics/sample-distribution" },
      { label: "Prescription Trend", href: "/admin/analytics/product-exposure" }
    ]
  },
  {
    title: "Product Reports",
    icon: BarChart3,
    items: [
      { label: "Exposure", href: "/admin/analytics/product-exposure" },
      { label: "Conversion (proxy: prescription interest)", href: "/admin/analytics/product-exposure" },
      { label: "Growth", note: "Needs multi-period sales/prescription data not yet captured." },
      { label: "Market Share", note: "Needs competitor/market data outside this system." }
    ]
  },
  {
    title: "Territory Reports",
    icon: MapPin,
    items: [
      { label: "Coverage", href: "/admin/analytics/territory-coverage" },
      { label: "Visit Frequency", href: "/admin/analytics/visit-frequency" },
      { label: "Untouched Doctors", href: "/admin/analytics/territory-coverage?bucket=NEVER_VISITED" },
      { label: "Doctor Density", note: "Needs a geographic doctor map, not tracked yet." }
    ]
  }
];

import type { ZiviraTreeNode } from "@zivira/types";

export function AdminBiReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full h-full bg-surface-canvas overflow-y-auto">
      <AdminTabGrid node={node} path={path} />

      <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GROUPS.map((group) => (
          <div key={group.title} className="bg-surface-card border border-border-subtle rounded-xl p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4">
              <group.icon size={16} /> {group.title}
            </h3>
            <div className="grid gap-1">
              {group.items.map((item) =>
                "href" in item ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 4px", color: "var(--ink)", fontSize: 14, borderBottom: "1px solid var(--line)"
                    }}
                  >
                    {item.label} <ArrowRight size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                  </Link>
                ) : (
                  <p
                    key={item.label}
                    style={{ padding: "9px 4px", fontSize: 13, color: "var(--muted)", fontStyle: "italic", margin: 0 }}
                  >
                    {item.label} — {item.note}
                  </p>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <ClipboardList size={16} style={{ opacity: 0.6, flexShrink: 0 }} />
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          Looking for the Alert Engine, Payroll hold queue, or Executive rollup? Those live under their own sidebar links —{" "}
          <Link href="/admin/analytics/alerts" style={{ color: "var(--brand)", fontWeight: 600 }}>Alerts</Link>,{" "}
          <Link href="/admin/analytics/payroll" style={{ color: "var(--brand)", fontWeight: 600 }}>Payroll</Link>, and{" "}
          <Link href="/admin/analytics/executive" style={{ color: "var(--brand)", fontWeight: 600 }}>Executive Dashboard</Link>.
        </p>
      </div>
    </section>
    </div>
  );
}
