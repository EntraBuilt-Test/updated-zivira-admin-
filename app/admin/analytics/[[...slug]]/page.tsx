import { redirect } from "next/navigation";

// QA-41: BI Reports linked to /admin/analytics/... pages that do not exist.
// Send every old link to the real screen.
const MAP: Record<string, string> = {
  compliance: "/admin/compliance",
  kpi: "/admin/kpi-engine",
  "rep-manager": "/admin/rep-vs-manager",
  "territory-coverage": "/admin/territory-coverage",
  "visit-frequency": "/admin/territory-coverage",
  "products-discussed": "/admin/product-exposure",
  "product-exposure": "/admin/product-exposure",
  "sample-distribution": "/admin/sample-distribution",
  alerts: "/admin/alerts",
  payroll: "/admin/payroll",
  executive: "/admin/executive"
};

export default async function AnalyticsRedirect({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  redirect(MAP[slug?.[0] ?? ""] ?? "/admin/bi-reports");
}
