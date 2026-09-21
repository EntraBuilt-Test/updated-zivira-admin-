"use client";

import type { CompanyDashboard } from "@zivira/types";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { fallbackMetrics } from "@/lib/company-data";
import { MetricCard, StatusBadge } from "./page-components";

export function CompanyDashboardPanel() {
  const [dashboard, setDashboard] = useState<CompanyDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.dashboard();
      setDashboard(response.data);
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const metrics = dashboard
    ? [
        { label: "Employees", value: String(dashboard.metrics.employeeCount), trend: "Active employees" },
        { label: "Doctors", value: String(dashboard.metrics.doctorCount), trend: "Active doctor universe" },
        { label: "Products", value: String(dashboard.metrics.activeProductCount), trend: "Active catalog" },
        { label: "DCR Today", value: String(dashboard.metrics.dcrSubmittedToday), trend: "Submitted today" }
      ]
    : fallbackMetrics;

  return (
    <>
      <div className="toolbar">
        <button className="button button-secondary" onClick={loadDashboard} type="button">
          <RefreshCw size={17} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <section className="grid grid-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="grid grid-2" style={{ marginTop: 16 }}>
        <article className="card">
          <h3 className="section-title">Recent Employees</h3>
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
                <tr className="hover:bg-surface-subtle/50 transition-colors group">
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Code</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(dashboard?.recentEmployees ?? []).map((employee) => (
                  <tr className="hover:bg-surface-subtle/50 transition-colors group" key={employee.id}>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.employeeCode}</td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.role}</td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      <StatusBadge status={employee.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="card">
          <h3 className="section-title">Recent Doctors</h3>
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
                <tr className="hover:bg-surface-subtle/50 transition-colors group">
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Specialty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Territory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(dashboard?.recentDoctors ?? []).map((doctor) => (
                  <tr className="hover:bg-surface-subtle/50 transition-colors group" key={doctor.id}>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{doctor.name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{doctor.specialty}</td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      <StatusBadge status={doctor.category} />
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{doctor.territory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}
