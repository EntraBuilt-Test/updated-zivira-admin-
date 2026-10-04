import type { ZiviraTreeNode } from "@zivira/types";
import { ziviraApplicationTree } from "@zivira/types";

const tabSlugMap: Record<string, string> = {
  home: "home",
  masters: "division-master",
  activities: "activities",
  "activity-reports": "activity-reports",
  "mis-reports": "mis-reports",
  options: "division-options",
  "tour-plans": "tour-plans",
  "doctor-celebrations": "doctor-celebrations",
  "doctor-coverage": "doctor-coverage",
  "branches-gst": "branches-gst",
  "compliance": "compliance",
  payroll: "payroll",
  "rep-vs-manager": "rep-vs-manager",
  "territory-coverage": "territory-coverage",
  "product-exposure": "product-exposure",
  "sample-distribution": "sample-distribution",
  "kpi-engine": "kpi-engine",
  "bi-reports": "bi-reports",
  "alerts": "alerts",
  "executive": "executive"
};

function findNode(nodes: ZiviraTreeNode[], slug: string): ZiviraTreeNode | undefined {
  for (const item of nodes) {
    if (item.slug === slug) {
      return item;
    }

    const child = item.children ? findNode(item.children, slug) : undefined;

    if (child) {
      return child;
    }
  }

  return undefined;
}

export function getAdminTab(tab: string) {
  const slug = tabSlugMap[tab] ?? "home";
  return findNode(ziviraApplicationTree, slug);
}

export const adminTabMeta: Record<string, { eyebrow: string; title: string; description: string }> = {
  home: {
    eyebrow: "Home",
    title: "Command Center",
    description: "Welcome, Corporate HQ - Zivira Labs Pvt Ltd - Last sync 2 min ago"
  },
  masters: {
    eyebrow: "Masters",
    title: "Master setup",
    description: "SubDivision, Product, Field Force, Doctor, Input, Stockist, Expense, and personal information setup."
  },
  activities: {
    eyebrow: "Activities",
    title: "Operational activities",
    description: "Approvals, expenses, sample/input dispatch, login details, tasks, order booking, and manager missed calls."
  },
  "activity-reports": {
    eyebrow: "Activity Reports",
    title: "Activity reports",
    description: "Territory, survey, TP, DCR, and customized report surfaces."
  },
  "mis-reports": {
    eyebrow: "MIS Reports",
    title: "MIS reporting center",
    description: "Manager analysis, DCR analysis, visit details, product exposure, dumps, digital detailing, and summaries."
  },
  options: {
    eyebrow: "Options",
    title: "Admin options",
    description: "Dashboard, setup, access rights, upload tools, app setup, update/delete utilities, transfers, and quiz controls."
  },
  "tour-plans": {
    eyebrow: "Tour Plans",
    title: "Tour Plans Dashboard",
    description: "Tour plan analysis and details"
  },
  "doctor-celebrations": {
    eyebrow: "Doctor Celebrations",
    title: "Doctor Celebrations",
    description: "Upcoming birthdays and anniversaries"
  },
  "doctor-coverage": {
    eyebrow: "Doctor Coverage",
    title: "Doctor Coverage",
    description: "Doctor coverage statistics"
  },
  "branches-gst": {
    eyebrow: "Branches & GST",
    title: "Branches & GST",
    description: "Branch and tax information"
  },
  "compliance": {
    eyebrow: "Compliance",
    title: "Compliance Dashboard",
    description: "Policy and compliance reports"
  },
  "payroll": {
    eyebrow: "Payroll",
    title: "Payroll Dashboard",
    description: "Salary and payroll tracking"
  },
  "rep-vs-manager": {
    eyebrow: "Rep vs Manager",
    title: "Rep vs Manager Analysis",
    description: "Comparison metrics"
  },
  "territory-coverage": {
    eyebrow: "Territory Coverage",
    title: "Territory Coverage Dashboard",
    description: "Coverage analysis across territories"
  },
  "product-exposure": {
    eyebrow: "Product Exposure",
    title: "Product Exposure Dashboard",
    description: "Brand exposure and coverage"
  },
  "sample-distribution": {
    eyebrow: "Sample Distribution",
    title: "Sample Distribution Dashboard",
    description: "Distribution of samples"
  },
  "kpi-engine": {
    eyebrow: "KPI Engine",
    title: "KPI Engine Dashboard",
    description: "Key Performance Indicators"
  },
  "bi-reports": {
    eyebrow: "BI Reports",
    title: "Business Intelligence",
    description: "Analytics and intelligence reports"
  },
  "alerts": {
    eyebrow: "Alerts",
    title: "Alert Notification Engine",
    description: "Real-time alerts and notifications"
  },
  "executive": {
    eyebrow: "Executive Dashboard",
    title: "Executive Dashboard",
    description: "High-level overview and insights"
  }
};
