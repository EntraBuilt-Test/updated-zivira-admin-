import { notFound, redirect } from "next/navigation";
import { AdminTabGrid } from "@/components/admin-tab-grid";
import { AdminHomeDashboard } from "@/components/admin-home-dashboard";
import { AdminMastersDashboard } from "@/components/admin-masters-dashboard";
import { AdminActivitiesDashboard } from "@/components/admin-activities-dashboard";
import { BackButton } from "@/components/back-button";
import { PageHeader } from "@/components/page-components";
import { adminTabMeta, getAdminTab } from "@/lib/admin-tabs";

import { AdminActivityReportsDashboard } from "@/components/admin-activity-reports-dashboard";

import { AdminOptionsDashboard } from "@/components/admin-options-dashboard";

export default async function AdminTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;

  // Round 39 item 2 -- the standalone Customized Report page was folded into
  // Activity Reports > Customized Report; keep old links/bookmarks working.
  if (tab === "custom-reports") {
    redirect("/admin/workspace/division-dashboard/division-navigation-tabs/activity-reports/customized-report");
  }
  const node = getAdminTab(tab);
  const meta = adminTabMeta[tab];

  if (!node || !meta) {
    notFound();
  }

  const rootPath = ["division-dashboard", "division-navigation-tabs", node.slug];
  // Real screen first, then the tab's own sub-menu (if it has one).
  const withGrid = (el: React.ReactNode) => (
    <>
      {el}
      {node.children?.length ? <div className="mt-6"><AdminTabGrid node={node} path={rootPath} /></div> : null}
    </>
  );

  if (tab === "home") {
    return <AdminHomeDashboard />;
  }

  if (tab === "masters") {
    return <AdminMastersDashboard />;
  }

  if (tab === "activities") {
    return <AdminActivitiesDashboard node={node} path={rootPath} />;
  }

  if (tab === "activity-reports") {
    return <AdminActivityReportsDashboard node={node} path={rootPath} />;
  }

  if (tab === "mis-reports") {
    // QA-19 (Nov 2026): plain working MIS menu (the old landing page carried
    // fixed sample figures such as Rs 4.86 Cr and 420 / 438 field force).
    return (
      <>
        <PageHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description} action={<BackButton />} />
        <AdminTabGrid node={node} path={rootPath} />
      </>
    );
  }

  if (tab === "options") {
    return <AdminOptionsDashboard node={node} path={rootPath} />;
  }

  if (tab === "tour-plans") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { AdminTourPlans } = await import("@/components/admin-tour-plans");
    return withGrid(<AdminTourPlans />);
  }

  if (tab === "doctor-celebrations") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { DoctorCelebrations } = await import("@/components/doctor-celebrations");
    return withGrid(<DoctorCelebrations />);
  }

  if (tab === "doctor-coverage") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { DoctorCoverageLive } = await import("@/components/doctor-coverage-live");
    return withGrid(<DoctorCoverageLive />);
  }

  if (tab === "branches-gst") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { BranchesMaster } = await import("@/components/branches-master");
    return withGrid(<BranchesMaster />);
  }

  if (tab === "compliance") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { ComplianceAnalytics } = await import("@/components/compliance-analytics");
    return withGrid(<ComplianceAnalytics />);
  }

  if (tab === "payroll") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { PayrollHoldEngine } = await import("@/components/payroll-hold-engine");
    return withGrid(<PayrollHoldEngine />);
  }

  if (tab === "rep-vs-manager") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { RepManagerAnalysis } = await import("@/components/rep-manager-analysis");
    return withGrid(<RepManagerAnalysis />);
  }

  if (tab === "territory-coverage") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { TerritoryCoverageAnalytics } = await import("@/components/territory-coverage-analytics");
    return withGrid(<TerritoryCoverageAnalytics />);
  }

  if (tab === "product-exposure") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { ProductExposureDashboard } = await import("@/components/product-exposure-dashboard");
    return withGrid(<ProductExposureDashboard />);
  }

  if (tab === "sample-distribution") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { SampleDistributionAnalytics } = await import("@/components/sample-distribution-analytics");
    return withGrid(<SampleDistributionAnalytics />);
  }

  if (tab === "kpi-engine") {
    const { AdminKpiEngineDashboard } = await import("@/components/admin-kpi-engine-dashboard");
    return <AdminKpiEngineDashboard node={node} path={rootPath} />;
  }

  if (tab === "bi-reports") {
    const { AdminBiReportsDashboard } = await import("@/components/admin-bi-reports-dashboard");
    return <AdminBiReportsDashboard node={node} path={rootPath} />;
  }

  if (tab === "alerts") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { AlertsNotificationEngine } = await import("@/components/alerts-notification-engine");
    return withGrid(<AlertsNotificationEngine />);
  }

  if (tab === "executive") {
    // QA-19 (Nov 2026): real-data screen instead of the fixed-number mock-up.
    const { ExecutiveDashboard } = await import("@/components/executive-dashboard");
    return withGrid(<ExecutiveDashboard />);
  }

  return (
    <>
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        action={<BackButton />}
      />
      <AdminTabGrid node={node} path={rootPath} />
    </>
  );
}
