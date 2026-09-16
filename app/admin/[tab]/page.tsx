import { notFound } from "next/navigation";
import { AdminTabGrid } from "@/components/admin-tab-grid";
import { AdminHomeDashboard } from "@/components/admin-home-dashboard";
import { AdminMastersDashboard } from "@/components/admin-masters-dashboard";
import { AdminActivitiesDashboard } from "@/components/admin-activities-dashboard";
import { BackButton } from "@/components/back-button";
import { PageHeader } from "@/components/page-components";
import { adminTabMeta, getAdminTab } from "@/lib/admin-tabs";

import { AdminActivityReportsDashboard } from "@/components/admin-activity-reports-dashboard";

import { AdminMisReportsDashboard } from "@/components/admin-mis-reports-dashboard";
import { AdminOptionsDashboard } from "@/components/admin-options-dashboard";

export default async function AdminTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  const node = getAdminTab(tab);
  const meta = adminTabMeta[tab];

  if (!node || !meta) {
    notFound();
  }

  const rootPath = ["division-dashboard", "division-navigation-tabs", node.slug];

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
    return <AdminMisReportsDashboard node={node} path={rootPath} />;
  }

  if (tab === "options") {
    return <AdminOptionsDashboard node={node} path={rootPath} />;
  }

  if (tab === "tour-plans") {
    const { AdminTourPlansDashboard } = await import("@/components/admin-tour-plans-dashboard");
    return <AdminTourPlansDashboard node={node} path={rootPath} />;
  }

  if (tab === "doctor-celebrations") {
    const { AdminDoctorCelebrationsDashboard } = await import("@/components/admin-doctor-celebrations-dashboard");
    return <AdminDoctorCelebrationsDashboard node={node} path={rootPath} />;
  }

  if (tab === "doctor-coverage") {
    const { AdminDoctorCoverageDashboard } = await import("@/components/admin-doctor-coverage-dashboard");
    return <AdminDoctorCoverageDashboard node={node} path={rootPath} />;
  }

  if (tab === "branches-gst") {
    const { AdminBranchesDashboard } = await import("@/components/admin-branches-gst-dashboard");
    return <AdminBranchesDashboard node={node} path={rootPath} />;
  }

  if (tab === "compliance") {
    const { AdminComplianceDashboard } = await import("@/components/admin-compliance-dashboard");
    return <AdminComplianceDashboard node={node} path={rootPath} />;
  }

  if (tab === "payroll") {
    const { AdminPayrollDashboard } = await import("@/components/admin-payroll-dashboard");
    return <AdminPayrollDashboard node={node} path={rootPath} />;
  }

  if (tab === "rep-vs-manager") {
    const { AdminRepVsManagerDashboard } = await import("@/components/admin-rep-vs-manager-dashboard");
    return <AdminRepVsManagerDashboard node={node} path={rootPath} />;
  }

  if (tab === "territory-coverage") {
    const { AdminTerritoryCoverageDashboard } = await import("@/components/admin-territory-coverage-dashboard");
    return <AdminTerritoryCoverageDashboard node={node} path={rootPath} />;
  }

  if (tab === "product-exposure") {
    const { AdminProductExposureDashboard } = await import("@/components/admin-product-exposure-dashboard");
    return <AdminProductExposureDashboard node={node} path={rootPath} />;
  }

  if (tab === "sample-distribution") {
    const { AdminSampleDistributionDashboard } = await import("@/components/admin-sample-distribution-dashboard");
    return <AdminSampleDistributionDashboard node={node} path={rootPath} />;
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
    const { AdminAlertsDashboard } = await import("@/components/admin-alerts-dashboard");
    return <AdminAlertsDashboard node={node} path={rootPath} />;
  }

  if (tab === "executive") {
    const { AdminExecutiveDashboard } = await import("@/components/admin-executive-dashboard");
    return <AdminExecutiveDashboard node={node} path={rootPath} />;
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
