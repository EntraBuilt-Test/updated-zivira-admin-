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
      
      <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 w-full">
        <PageHeader
          eyebrow="KPI Engine"
          title="KPI Engine"
          description="Automatically calculated rep and manager scorecards for this month."
          action={
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-4 px-4 py-2 rounded-md bg-surface-subtle hover:bg-surface-card text-text-primary border border-border-subtle text-sm font-medium transition-colors" onClick={load} type="button">
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
              <BackButton />
            </div>
          }
        />
      {error && <p className="p-4 bg-status-danger-bg text-status-danger rounded-md text-sm border border-status-danger-bg">{error}</p>}

      <h3 className="text-lg font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-md inline-block" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}><Gauge size={16} /> Manager KPIs</h3>
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm" style={{ marginBottom: 28 }}>
        <table className="w-full text-center text-sm whitespace-nowrap border-collapse">
          <thead className="bg-surface-subtle text-text-secondary border-b border-border-subtle">
            <tr><th className="px-6 py-3 font-medium">Manager</th><th className="px-6 py-3 font-medium">Team Size</th><th className="px-6 py-3 font-medium">Joint Call %</th><th className="px-6 py-3 font-medium">Team Compliance %</th><th className="px-6 py-3 font-medium">Doctor Coverage %</th><th className="px-6 py-3 font-medium">Effectiveness Score</th></tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {managers.map((m) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors" key={m.managerCode}>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary"><strong className="text-text-primary">{m.managerName ?? m.managerCode}</strong></td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{m.teamSize}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{m.jointCallPercent}%</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{m.teamCompliancePercent}%</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{m.doctorCoveragePercent}%</td>
                <td className="font-bold text-text-primary px-6 py-4 border-b border-border-subtle">{m.managerEffectivenessScore}</td>
              </tr>
            ))}
            {!loading && managers.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-text-muted">No manager KPI data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-md inline-block" style={{ marginBottom: 10 }}>Representative KPIs</h3>
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-center text-sm whitespace-nowrap border-collapse">
          <thead className="bg-surface-subtle text-text-secondary border-b border-border-subtle">
            <tr><th className="px-6 py-3 font-medium">Representative</th><th className="px-6 py-3 font-medium">Doctors Visited</th><th className="px-6 py-3 font-medium">DCR Submitted</th><th className="px-6 py-3 font-medium">Products Promoted</th><th className="px-6 py-3 font-medium">Samples Distributed</th><th className="px-6 py-3 font-medium">Conversion Rate</th><th className="px-6 py-3 font-medium">Compliance %</th></tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {reps.map((r) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors" key={r.employeeCode}>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary"><strong className="text-text-primary">{r.employeeName ?? r.employeeCode}</strong></td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{r.doctorsVisited}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{r.dcrSubmitted}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{r.productsPromoted}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{r.samplesDistributed}</td>
                <td className="px-6 py-4 border-b border-border-subtle text-text-primary">{r.conversionRatePercent}%</td>
                <td style={{ fontWeight: 700, color: r.compliancePercent < 70 ? "#b91c1c" : r.compliancePercent < 90 ? "#a16207" : "#15803d" }}>{r.compliancePercent}%</td>
              </tr>
            ))}
            {!loading && reps.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-text-muted">No representative KPI data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
    </div>
  );
}
