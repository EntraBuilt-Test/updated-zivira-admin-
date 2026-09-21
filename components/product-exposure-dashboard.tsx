"use client";
// components/product-exposure-dashboard.tsx
// Zivira_Project_Basic.docx Topic 9 — Product Exposure Analytics
// Topic 10 — Product-wise Performance Dashboard
//
// Answers the doc's questions directly: which product is promoted most /
// ignored, which representative promotes it, which territory performs
// best. Field names match src/utils/product-analytics.ts's
// ProductExposureRow exactly.
//
// New file — purely additive, does not touch any existing component.
import { PackageSearch, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/back-button";
import { ExportMenuButton } from "@/components/export-menu-button";
import { apiClient, type ProductExposureRow } from "@/lib/api-client";

export function ProductExposureDashboard() {
  const [rows, setRows] = useState<ProductExposureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.productExposure();
      setRows(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  // Backend already sorts by totalSamplesGiven desc — re-sort defensively
  // in case a future backend change drops that ordering.
  const sorted = [...rows].sort((a, b) => b.totalSamplesGiven - a.totalSamplesGiven);
  const mostPromoted = sorted[0];
  const leastPromoted = sorted[sorted.length - 1];

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Products</p>
          <h2>Product Exposure &amp; Performance</h2>
          <p>Which products are promoted most/least, which rep and territory drive them, and how prescription interest tracks with sample volume.</p>
        </div>
        <div>
          <BackButton fallback="/admin/analytics" />
          <button className="button button-secondary" onClick={load} type="button"><RefreshCw size={15} />{loading ? "Loading" : "Refresh"}</button>
          <ExportMenuButton
            filename="product-exposure"
            sections={[{
              title: "Product Exposure",
              headers: ["Product", "Samples Given", "Visits", "Doctors", "Reps", "Visual Aid", "Top Rep", "Top Territory", "Top Manager", "Prescription Interest (H/M/L/None)"],
              rows: sorted.map((r) => [
                r.productName, r.totalSamplesGiven, r.visitsPromoted, r.distinctDoctors, r.distinctReps, r.visualAidUsedCount,
                r.topRepName ? `${r.topRepName} (${r.topRepQty})` : "—",
                r.topTerritory ? `${r.topTerritory} (${r.topTerritoryQty})` : "—",
                r.topManagerName ? `${r.topManagerName} (${r.topManagerQty})` : "—",
                `${r.prescriptionInterestHigh}/${r.prescriptionInterestMedium}/${r.prescriptionInterestLow}/${r.prescriptionInterestNone}`
              ])
            }]}
          />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}

      {rows.length > 0 && (
        <div className="grid grid-2" style={{ marginBottom: 20, gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <p className="muted" style={{ fontSize: 12 }}>Most Promoted</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}>{mostPromoted?.productName}</p>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>{mostPromoted?.totalSamplesGiven} samples · {mostPromoted?.distinctReps} reps</p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p className="muted" style={{ fontSize: 12 }}>Least Promoted</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#b91c1c" }}>{leastPromoted?.productName}</p>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>{leastPromoted?.totalSamplesGiven} samples · {leastPromoted?.distinctReps} reps</p>
          </div>
        </div>
      )}

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Product</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Samples Given</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Visits</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Doctors</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Reps</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Visual Aid</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Top Rep</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Top Territory</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Top Manager</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Prescription Interest (H/M/L/None)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sorted.map((r) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={r.productCode}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color: "var(--ink)" }}>{r.productName}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.totalSamplesGiven}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.visitsPromoted}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.distinctDoctors}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.distinctReps}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{r.visualAidUsedCount}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12, color: "var(--muted)" }}>{r.topRepName ? `${r.topRepName} (${r.topRepQty})` : "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12, color: "var(--muted)" }}>{r.topTerritory ? `${r.topTerritory} (${r.topTerritoryQty})` : "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12, color: "var(--muted)" }}>{r.topManagerName ? `${r.topManagerName} (${r.topManagerQty})` : "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize: 12 }}>
                  <span style={{ color: "#15803d" }}>{r.prescriptionInterestHigh}</span>
                  {" / "}<span style={{ color: "#a16207" }}>{r.prescriptionInterestMedium}</span>
                  {" / "}<span style={{ color: "#b91c1c" }}>{r.prescriptionInterestLow}</span>
                  {" / "}<span style={{ color: "var(--muted)" }}>{r.prescriptionInterestNone}</span>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={10} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
                <PackageSearch size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} />
                No product exposure data yet.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
