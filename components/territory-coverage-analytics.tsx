"use client";
// components/territory-coverage-analytics.tsx
// Zivira_Project_Basic.docx Topic 7 — Territory Coverage Analytics
// Topic 8 — Doctor Exception Management
//
// "Find doctors who haven't been visited." Alert buckets per the doc: Not
// Visited 30 / 60 / 90 / 180 Days. Every missed visit that has a reason
// logged by the MR (Doctor Shifted, Retired, Refused Visit, No Business
// Potential, Clinic/Hospital Closed, Sick, Personal Leave, Other) shows
// alongside the alert so management doesn't assume poor performance
// without evidence — both riding on the same /company/doctor-coverage row.
//
// New file — purely additive, does not touch any existing component.
import { AlertOctagon, Filter, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/back-button";
import { ExportMenuButton } from "@/components/export-menu-button";
import { apiClient, type TerritoryCoverageRow } from "@/lib/api-client";

const BUCKET_LABEL: Record<string, string> = {
  NEVER_VISITED: "Never Visited",
  "180": "180+ Days",
  "90": "90+ Days",
  "60": "60+ Days",
  "30": "30+ Days"
};
const BUCKET_TONE: Record<string, { bg: string; color: string }> = {
  NEVER_VISITED: { bg: "#fee2e2", color: "#b91c1c" },
  "180": { bg: "#fee2e2", color: "#b91c1c" },
  "90": { bg: "#ffedd5", color: "#c2410c" },
  "60": { bg: "#fef9c3", color: "#a16207" },
  "30": { bg: "#f3f4f6", color: "#6b7280" }
};

export function TerritoryCoverageAnalytics() {
  const searchParams = useSearchParams();
  const initialBucket = searchParams.get("bucket");
  const [rows, setRows] = useState<TerritoryCoverageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // "Untouched Doctors" (BI Reports > Territory Reports) deep-links here
  // with ?bucket=NEVER_VISITED so the filter is pre-applied on arrival.
  const [bucketFilter, setBucketFilter] = useState<string>(initialBucket ?? "ALL");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.territoryCoverage();
      setRows(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const flagged = rows.filter((r) => r.alertBucket);
  const visible = bucketFilter === "ALL" ? flagged : flagged.filter((r) => r.alertBucket === bucketFilter);

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Territory Coverage</p>
          <h2>Territory Coverage &amp; Doctor Exceptions</h2>
          <p>Doctors not visited for extended periods, with the documented reason (if the field team logged one) so nothing reads as unexplained neglect.</p>
        </div>
        <div>
          <BackButton fallback="/admin/analytics" />
          <button className="button button-secondary" onClick={load} type="button"><RefreshCw size={15} />{loading ? "Loading" : "Refresh"}</button>
          <ExportMenuButton
            filename="territory-coverage"
            sections={[{
              title: "Territory Coverage",
              headers: ["Doctor", "Assigned MR", "Last Visit", "Days Since", "Alert", "Exception Reason", "Notes"],
              rows: visible.map((r) => [
                r.doctorName, r.assignedMRName ?? r.assignedMR ?? "—",
                r.lastVisitDateEver ? new Date(r.lastVisitDateEver).toLocaleDateString("en-IN") : "—",
                r.daysSinceLastVisit ?? "—", r.alertBucket ?? "—", r.exceptionReason ?? "No reason logged", r.exceptionNotes ?? "—"
              ])
            }]}
          />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}

      <div className="grid grid-3" style={{ marginBottom: 20, gap: 12 }}>
        {(["30", "60", "90", "180"] as const).map((b) => (
          <div className="card" key={b} style={{ padding: 16 }}>
            <p className="muted" style={{ fontSize: 12 }}>{BUCKET_LABEL[b]}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: BUCKET_TONE[b].color }}>{rows.filter((r) => r.alertBucket === b).length}</p>
          </div>
        ))}
      </div>

      <div>
        <Filter size={14} style={{ color: "var(--muted)" }} />
        <select className="input" value={bucketFilter} onChange={(e) => setBucketFilter(e.target.value)}>
          <option value="ALL">All flagged doctors</option>
          <option value="30">30+ days</option>
          <option value="60">60+ days</option>
          <option value="90">90+ days</option>
          <option value="180">180+ days</option>
          <option value="NEVER_VISITED">Never visited</option>
        </select>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctor</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Assigned MR</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Last Visit</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Days Since</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Alert</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Exception Reason</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {visible.map((r) => {
              const tone = r.alertBucket ? BUCKET_TONE[r.alertBucket] : BUCKET_TONE["30"];
              return (
                <tr className="hover:bg-surface-subtle/50 transition-colors group" key={r.doctorId}>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color: "var(--ink)" }}>{r.doctorName}</strong></td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12, color: "var(--muted)" }}>{r.assignedMRName ?? r.assignedMR ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12, color: "var(--muted)" }}>{r.lastVisitDateEver ? new Date(r.lastVisitDateEver).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.daysSinceLastVisit ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><span style={{ background: tone.bg, color: tone.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{r.alertBucket ? BUCKET_LABEL[r.alertBucket] : "—"}</span></td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12 }}>{r.exceptionReason ?? <span style={{ color: "#b91c1c" }}>No reason logged</span>}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12, color: "var(--muted)", maxWidth: 160 }}>{r.exceptionNotes ?? "—"}</td>
                </tr>
              );
            })}
            {!loading && visible.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
                <AlertOctagon size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} />
                No doctors currently fall into this coverage-gap bucket.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
