import {
  AlertTriangle,
  BarChart3,
  Building2,
  Cake,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  Gauge,
  MapPin,
  PackageSearch,
  Settings,
  ShieldCheck,
  Stethoscope,
  TableProperties,
  Trophy,
  Wallet,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const companyNav: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { title: "Masters", href: "/admin/masters", icon: TableProperties },
      { title: "Activities", href: "/admin/activities", icon: Workflow },
      { title: "Options", href: "/admin/options", icon: Settings },
      { title: "Branches & GST", href: "/admin/branches-gst", icon: Building2 },
    ]
  },
  {
    title: "Reports & Field",
    items: [
      { title: "Activity Reports", href: "/admin/activity-reports", icon: FileBarChart },
      { title: "MIS Reports", href: "/admin/mis-reports", icon: CalendarDays },
      { title: "Tour Plans", href: "/admin/tour-plans", icon: FileBarChart },
      { title: "Doctor Celebrations", href: "/admin/doctor-celebrations", icon: Cake },
      { title: "Doctor Coverage", href: "/admin/doctor-coverage", icon: Stethoscope },
    ]
  },
  {
    title: "Analytics",
    items: [
      { title: "Compliance", href: "/admin/compliance", icon: ShieldCheck },
      { title: "Payroll", href: "/admin/payroll", icon: Wallet },
      { title: "Rep vs Manager", href: "/admin/rep-vs-manager", icon: Trophy },
      { title: "Territory Coverage", href: "/admin/territory-coverage", icon: MapPin },
      { title: "Product Exposure", href: "/admin/product-exposure", icon: BarChart3 },
      { title: "Sample Distribution", href: "/admin/sample-distribution", icon: PackageSearch },
      { title: "KPI Engine", href: "/admin/kpi-engine", icon: Gauge },
      { title: "BI Reports", href: "/admin/bi-reports", icon: ClipboardList },
      { title: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
      { title: "Executive Dashboard", href: "/admin/executive", icon: ClipboardList },
    ]
  }
];

export const fallbackMetrics = [
  { label: "Employees", value: "2", trend: "Seed tenant users" },
  { label: "Doctors", value: "1", trend: "Mapped to territory" },
  { label: "Products", value: "1", trend: "Active catalog" },
  { label: "DCR Today", value: "0", trend: "Awaiting field submissions" }
];
