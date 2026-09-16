"use client";
// components/kpi-engine-dashboard.tsx
// Zivira_Project_Basic.docx Topic 14 — KPI Engine
//
// Representative KPIs: Doctors Visited, DCR Submitted, Products Promoted,
// Samples Distributed, Conversion Rate (proxy: % of visits with HIGH/
// MEDIUM prescription interest), Compliance %.
// Manager KPIs: Joint Call %, Team Compliance %, Doctor Coverage %,
// Manager Effectiveness Score. Field names match src/utils/kpi-engine.ts
// (RepKpiRow / ManagerKpiRow) exactly.
//
// New file — purely additive, does not touch any existing component.
import { Gauge, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-components";
import { BackButton } from "@/components/back-button";
import { ExportMenuButton } from "@/components/export-menu-button";
import { apiClient, type ManagerKpi, type RepKpi } from "@/lib/api-client";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminKpiEngineDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [reps, setReps] = useState<RepKpi[]>([]);
  const [managers, setManagers] = useState<ManagerKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.kpiEngine();
      setReps(res.reps);
      setManagers(res.managers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <div className="flex flex-col w-full h-full bg-surface-canvas overflow-y-auto">
      <PageHeader
        eyebrow="KPI Engine"
        title="KPI Engine"
        description="Automatically calculated rep and manager scorecards for this month."
        action={<BackButton />}
      />
      
      <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex justify-end gap-2 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-subtle hover:bg-surface-card text-text-primary border border-border-subtle text-sm font-medium transition-colors" onClick={load} type="button">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading" : "Refresh"}
          </button>
          <ExportMenuButton
            filename="kpi-engine"
            sections={[
              { title: "Manager KPIs", headers: ["Manager", "Team Size", "Joint Call %", "Team Compliance %", "Doctor Coverage %", "Effectiveness Score"], rows: managers.map((m) => [m.managerName ?? m.managerCode, m.teamSize, `${m.jointCallPercent}%`, `${m.teamCompliancePercent}%`, `${m.doctorCoveragePercent}%`, m.managerEffectivenessScore]) },
              { title: "Representative KPIs", headers: ["Representative", "Doctors Visited", "DCR Submitted", "Products Promoted", "Samples Distributed", "Conversion Rate", "Compliance %"], rows: reps.map((r) => [r.employeeName ?? r.employeeCode, r.doctorsVisited, r.dcrSubmitted, r.productsPromoted, r.samplesDistributed, `${r.conversionRatePercent}%`, `${r.compliancePercent}%`]) }
            ]}
          />
        </div>
      {error && <p className="p-4 bg-status-danger-bg text-status-danger rounded-md text-sm border border-status-danger-bg">{error}</p>}

      <h3 className="text-lg font-semibold text-text-primary" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}><Gauge size={16} /> Manager KPIs</h3>
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-x-auto shadow-sm" style={{ marginBottom: 28 }}>
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Manager</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Team Size</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Joint Call %</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Team Compliance %</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctor Coverage %</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Effectiveness Score</th></tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {managers.map((m) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors" key={m.managerCode}>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap"><strong className="text-text-primary">{m.managerName ?? m.managerCode}</strong></td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{m.teamSize}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{m.jointCallPercent}%</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{m.teamCompliancePercent}%</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{m.doctorCoveragePercent}%</td>
                <td className="font-bold text-text-primary px-6 py-4 border-b border-border-subtle px-4 py-3 text-sm whitespace-nowrap">{m.managerEffectivenessScore}</td>
              </tr>
            ))}
            {!loading && managers.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><td colSpan={6} className="px-6 py-8 text-center text-text-muted px-4 py-3 text-sm text-text-primary whitespace-nowrap">No manager KPI data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold text-text-primary" style={{ marginBottom: 10 }}>Representative KPIs</h3>
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Representative</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctors Visited</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">DCR Submitted</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Products Promoted</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Samples Distributed</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Conversion Rate</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Compliance %</th></tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {reps.map((r) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors" key={r.employeeCode}>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap"><strong className="text-text-primary">{r.employeeName ?? r.employeeCode}</strong></td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{r.doctorsVisited}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{r.dcrSubmitted}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{r.productsPromoted}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{r.samplesDistributed}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary px-4 py-3 text-sm whitespace-nowrap">{r.conversionRatePercent}%</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 700, color: r.compliancePercent < 70 ? "#b91c1c" : r.compliancePercent < 90 ? "#a16207" : "#15803d" }}>{r.compliancePercent}%</td>
              </tr>
            ))}
            {!loading && reps.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><td colSpan={7} className="px-6 py-8 text-center text-text-muted px-4 py-3 text-sm text-text-primary whitespace-nowrap">No representative KPI data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
    </div>
  );
}
