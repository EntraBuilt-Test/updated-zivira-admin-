"use client";
// components/rep-manager-analysis.tsx
// Zivira_Project_Basic.docx Topic 5 — Representative vs Manager Analysis
// Topic 6 — Joint Field Work Analysis
//
// Two tables from one endpoint: reps (doctors visited vs joint visits with
// their manager vs joint-visit %) and managers (total/average joint calls,
// joint call %, ranking). Field names match src/utils/rep-manager-
// analysis.ts exactly (RepAnalysisRow / ManagerJointWorkRow) so every
// number shown is the real backend computation, not a guess.
//
// New file — purely additive, does not touch any existing component.
import { RefreshCw, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/back-button";
import { ExportMenuButton } from "@/components/export-menu-button";
import { apiClient, type ManagerJointWorkRow, type RepAnalysisRow } from "@/lib/api-client";

function tone(pct: number) {
  return pct < 40 ? "#b91c1c" : pct < 70 ? "#a16207" : "#15803d";
}

export function RepManagerAnalysis() {
  const [reps, setReps] = useState<RepAnalysisRow[]>([]);
  const [managers, setManagers] = useState<ManagerJointWorkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.repManagerAnalysis();
      setReps(res.data);
      setManagers(res.managers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Rep vs Manager</p>
          <h2>Representative vs Manager Analysis</h2>
          <p>Identifies managers who are not adequately supporting their teams — doctors visited vs joint field visits, and manager joint-call ranking.</p>
        </div>
        <div>
          <BackButton fallback="/admin/analytics" />
          <button className="button button-secondary" onClick={load} type="button"><RefreshCw size={15} />{loading ? "Loading" : "Refresh"}</button>
          <ExportMenuButton
            filename="rep-vs-manager"
            sections={[
              { title: "Representatives", headers: ["Representative", "Reporting Manager", "Doctors Visited", "Total Visits", "Joint Visits", "Joint Visit %"], rows: reps.map((r) => [r.employeeName ?? r.employeeCode, r.reportingManagerName ?? r.reportingManager ?? "—", r.doctorsVisited, r.totalVisits, r.jointVisits, `${r.jointVisitPercent}%`]) },
              { title: "Manager Ranking", headers: ["Rank", "Manager", "Team Size", "Team Visits", "Total Joint Calls", "Avg Joint Calls/Rep", "Joint Call %"], rows: managers.map((m) => [m.rank, m.managerName ?? m.managerCode, m.teamSize, m.totalTeamVisits, m.totalJointCalls, m.avgJointCallsPerRep, `${m.jointCallPercent}%`]) }
            ]}
          />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}

      <h3 className="section-title"><Users size={16} /> Representatives</h3>
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm"><tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Representative</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Reporting Manager</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctors Visited</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Total Visits</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Joint Visits</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Joint Visit %</th></tr></thead>
          <tbody className="divide-y divide-border-subtle">
            {reps.map((r) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={r.employeeCode}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color: "var(--ink)" }}>{r.employeeName ?? r.employeeCode}</strong> <span style={{ color: "var(--muted)", fontSize: 11 }}>({r.employeeCode})</span></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12, color: "var(--muted)" }}>{r.reportingManagerName ?? r.reportingManager ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.doctorsVisited}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.totalVisits}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.jointVisits}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 700, color: tone(r.jointVisitPercent) }}>{r.jointVisitPercent}%</td>
              </tr>
            ))}
            {!loading && reps.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>No representative data for this month yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="section-title"><Trophy size={16} /> Manager Joint-Work Ranking</h3>
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm"><tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Rank</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Manager</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Team Size</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Team Visits</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Total Joint Calls</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Avg Joint Calls / Rep</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Joint Call %</th></tr></thead>
          <tbody className="divide-y divide-border-subtle">
            {managers.map((m) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={m.managerCode}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color: "var(--muted)" }}>{m.rank}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color: "var(--ink)" }}>{m.managerName ?? m.managerCode}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{m.teamSize}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{m.totalTeamVisits}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{m.totalJointCalls}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{m.avgJointCallsPerRep}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 700, color: tone(m.jointCallPercent) }}>{m.jointCallPercent}%</td>
              </tr>
            ))}
            {!loading && managers.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>No manager joint-work data for this month yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
