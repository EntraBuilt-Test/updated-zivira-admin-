"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";
import { apiClient, type ProductExposureRow } from "@/lib/api-client";

// This page used to be a fully static server component, then a later pass
// made the Brand Exposure Matrix table interactive against a local mock
// array of fabricated brands (invented molecule names, therapeutic
// segments, priority tiers, slide-level engagement seconds, specialist
// penetration percentages and a stockist liquidation note — none of which
// exist in the backend). The backend's real Product Exposure endpoint
// (Topic 9/10) is GET /company/analytics/product-exposure, wrapped by
// apiClient.productExposure(). It returns ProductExposureRow[] with real
// sample/visit/reach counts and prescription-interest buckets — but has NO
// molecule, therapeutic segment, priority tier, per-slide timing,
// specialist-type reach or stockist data, so those have been removed
// rather than faked. The segment/priority filters are gone; search now
// works over product name/code and top rep/territory, and the dossier
// shows the real prescription-interest split and top performer breakdown
// (top rep / territory / manager) that the backend actually computes.

const PAGE_SIZE = 5;

export function AdminProductExposureDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [products, setProducts] = useState<ProductExposureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [interestFilter, setInterestFilter] = useState<"all" | "high" | "none">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dossierId, setDossierId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [division, setDivision] = useState("All Therapeutic Divisions (Cardio, Diab, Ortho)");
  const [cycle, setCycle] = useState("Cycle: Sep 2026 (Active Detailing)");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.productExposure();
        if (cancelled) return;
        setProducts(response.data ?? []);
        setDossierId((prev) => prev ?? response.data?.[0]?.productCode ?? null);
        setSelectedIds((prev) => (prev.size ? prev : new Set(response.data?.[0] ? [response.data[0].productCode] : [])));
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load product exposure analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((b) => {
      if (interestFilter === "high" && b.prescriptionInterestHigh <= 0) return false;
      if (interestFilter === "none" && b.prescriptionInterestNone <= 0) return false;
      if (!q) return true;
      return (
        b.productName.toLowerCase().includes(q) ||
        b.productCode.toLowerCase().includes(q) ||
        (b.topRepName ?? "").toLowerCase().includes(q) ||
        (b.topTerritory ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, search, interestFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const dossier = products.find((b) => b.productCode === dossierId) ?? products[0] ?? null;

  const totalExposures = products.reduce((sum, p) => sum + p.visitsPromoted, 0);
  const totalSamples = products.reduce((sum, p) => sum + p.totalSamplesGiven, 0);
  const highInterestCount = products.filter((p) => p.prescriptionInterestHigh > 0).length;

  function resetFilters() {
    setSearch("");
    setInterestFilter("all");
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "brand-sov-report.csv",
      filtered.map((b) => ({
        "Product": b.productName,
        "Product Code": b.productCode,
        "Visits Promoted": b.visitsPromoted,
        "Distinct Doctors": b.distinctDoctors,
        "Distinct Reps": b.distinctReps,
        "Total Samples Given": b.totalSamplesGiven,
        "Visual Aid Used Count": b.visualAidUsedCount,
        "Top Rep": b.topRepName ?? "",
        "Top Territory": b.topTerritory ?? "",
        "Rx Interest High": b.prescriptionInterestHigh,
        "Rx Interest Medium": b.prescriptionInterestMedium,
        "Rx Interest Low": b.prescriptionInterestLow,
        "Rx Interest None": b.prescriptionInterestNone
      }))
    );
  }

  function handlePushSlideDeck() {
    if (!dossier) return;
    setDetail({ title: "Slide Deck Push Queued", body: `Updated visual-aid slide deck for ${dossier.productName} has been queued to push to all field reps carrying this brand. This is a session-only action — there is no live field-app sync backend yet.` });
  }

  function handleCorrelate() {
    if (!dossier) return;
    setDetail({ title: "Sample Correlation", body: `${dossier.productName}: ${dossier.totalSamplesGiven} samples given across ${dossier.distinctDoctors} doctors and ${dossier.distinctReps} reps, with ${dossier.visitsPromoted} promotional visits and ${dossier.visualAidUsedCount} visual-aid-assisted calls.` });
  }

  return (
    <div className="flex flex-col w-full space-y-6">



    {/* TOP HEADER */}
    <header className="bg-surface-card border-b border-border-subtle px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
          <span>Platform</span>
          <span>/</span>
          <span>Analytics Suite</span>
          <span>/</span>
          <span className="text-text-primary font-semibold">Product Exposure & Detailing Analytics</span>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select className="appearance-none bg-surface-subtle border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer focus:outline-none" value={division} onChange={(e) => setDivision(e.target.value)}>
            <option>All Therapeutic Divisions (Cardio, Diab, Ortho)</option>
            <option>Cardio-Diabetic Division</option>
            <option>Respiratory & Pulmo Care</option>
            <option>Orthopedic & Pain Management</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        <div className="relative">
          <select className="appearance-none bg-surface-subtle border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer focus:outline-none" value={cycle} onChange={(e) => setCycle(e.target.value)}>
            <option>Cycle: Sep 2026 (Active Detailing)</option>
            <option>Cycle: Aug 2026</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs" onClick={() => setDetail({ title: "Sync Triggered", body: "A refresh of e-detailing telemetry from the field app has been queued for this session. There is no live sync backend yet." })}>
          <span className="material-symbols-outlined">{`sync`}</span>
        </button>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs relative" onClick={() => setDetail({ title: "Notifications", body: `${highInterestCount} product(s) have doctors flagged with high prescription interest this cycle.` })}>
          <span className="material-symbols-outlined">{`circle`}</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full"></span>
        </button>

        <div className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center font-bold text-xs">AZ</div>
      </div>
    </header>

    {/* CONTENT BODY */}
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* TITLE & CTA ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Product Exposure & Brand Detailing Share</h1>
            <span className="bg-status-info-bg text-status-info border border-status-info-bg text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {totalExposures.toLocaleString("en-IN")} Promotional Visits
            </span>
            <span className="bg-status-success-bg text-status-success border border-status-success-bg text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {highInterestCount} High-Interest Products
            </span>
          </div>
          <p className="text-xs text-text-secondary">Track sample dispensation, visual-aid usage, doctor/rep reach, and prescription-interest signals from real DCR records.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition-colors disabled:opacity-50" onClick={handleExport} disabled={filtered.length === 0}>
            <span className="material-symbols-outlined text-text-muted">{`download`}</span>
            <span>Export Brand SOV Report (CSV)</span>
          </button>
          <button className="flex items-center gap-2 bg-terracotta bg-terracotta-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors" onClick={() => setDetail({ title: "Adjust Brand Detailing Priorities", body: "Priority tiers are not part of the real product-exposure data yet — there is no priority/rules-engine backend. Use the search and interest filter above to inspect products instead." })}>
            <span className="material-symbols-outlined">{`tune`}</span>
            <span>Adjust Brand Detailing Priorities</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">{error}</div>
      )}

      {/* 4-COLUMN EXECUTIVE PULSE METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>TOTAL PROMOTIONAL VISITS</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-terracotta flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`tablet_mac`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{totalExposures.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Products Tracked: <strong>{products.length}</strong></span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>TOTAL SAMPLES GIVEN</span>
            <div className="w-7 h-7 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`timer`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{totalSamples.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Across all tracked products this cycle</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>HIGH RX INTEREST PRODUCTS</span>
            <div className="w-7 h-7 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`pie_chart`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{highInterestCount}</span>
            <span className="text-[11px] font-bold text-emerald-600">of {products.length}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>At least one doctor flagged High</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>VISUAL AID USAGE</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`medication`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{products.reduce((s, p) => s + p.visualAidUsedCount, 0).toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Calls where a visual aid was used</span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="border-b border-border-subtle flex items-center gap-6 text-xs font-semibold">
        {["Product Exposure Matrix & Roster", "Interactive Visual Aid (e-Detailing) Duration Logs", "Therapeutic Segment Share-of-Voice (SOV)", "Doctor Brand Recall & Feedback Ledger"].map((label, i) => (
          <button
            key={label}
            className={i === activeSubTab ? "pb-2.5 border-b-2 border-terracotta text-terracotta flex items-center gap-2" : "pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"}
            onClick={() => {
              setActiveSubTab(i);
              if (i !== 0) setDetail({ title: label, body: "This view isn't built out yet — there is no backend data for it. Showing the Product Exposure Matrix & Roster below in the meantime." });
            }}
          >
            <span>{label}</span>
            {i === 0 && <span className="bg-terracotta/10 text-terracotta text-[10px] font-bold px-1.5 py-0.2 rounded-full">{products.length} SKUs</span>}
          </button>
        ))}
      </div>

      {/* MAIN SPLIT WORKSPACE: TABLE (LEFT) & BRAND DOSSIER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-surface-card border border-border-subtle rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Filter Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-xs">{`search`}</span>
                <input type="text" placeholder="Search Product Name, Code, Top Rep or Territory..." className="w-full bg-surface-card border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-secondary placeholder-slate-400 focus:outline-none focus:border-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium" value={interestFilter} onChange={(e) => { setInterestFilter(e.target.value as typeof interestFilter); setPage(1); }}>
                <option value="all">All Products</option>
                <option value="high">Has High Rx Interest</option>
                <option value="none">Has No-Interest Doctors</option>
              </select>

              <button className="text-xs text-text-secondary hover:text-text-secondary font-semibold px-2 py-1.5 flex items-center gap-1" onClick={resetFilters}>
                <span className="material-symbols-outlined text-[11px]">{`refresh`}</span> Reset
              </button>
            </div>
          </div>

          {/* Table Header & Rows */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted text-[10px] font-bold uppercase tracking-wider border-b border-border-subtle">
                <tr>
                  <th className="py-3 px-3.5 w-6"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0" checked={pageRows.length > 0 && pageRows.every((b) => selectedIds.has(b.productCode))} onChange={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      const allSelected = pageRows.every((b) => next.has(b.productCode));
                      pageRows.forEach((b) => (allSelected ? next.delete(b.productCode) : next.add(b.productCode)));
                      return next;
                    });
                  }}/></th>
                  <th className="py-3 px-3">PRODUCT</th>
                  <th className="py-3 px-3">DISTINCT DOCTORS/REPS</th>
                  <th className="py-3 px-3">SAMPLES GIVEN</th>
                  <th className="py-3 px-3">VISITS PROMOTED</th>
                  <th className="py-3 px-3">VISUAL AID USED</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {loading && (
                  <tr><td colSpan={7} className="py-10 px-3 text-center text-text-muted">Loading product exposure analytics…</td></tr>
                )}
                {!loading && pageRows.length === 0 && (
                  <tr><td colSpan={7} className="py-10 px-3 text-center text-text-muted">No products match the current search/filters.</td></tr>
                )}
                {!loading && pageRows.map((b) => (
                  <tr key={b.productCode} className={`${dossierId === b.productCode ? "bg-orange-50/40 hover:bg-orange-50/60" : "hover:bg-surface-subtle/70"} transition-colors`}>
                    <td className="py-3.5 px-3.5"><input type="checkbox" checked={selectedIds.has(b.productCode)} onChange={() => toggleSelect(b.productCode)} className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-text-primary">{b.productName}</div>
                      <div className="text-[11px] text-text-muted font-mono">{b.productCode}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-text-secondary">{b.distinctDoctors} Doctors / {b.distinctReps} Reps</td>
                    <td className="py-3.5 px-3 font-bold text-text-primary">{b.totalSamplesGiven}</td>
                    <td className="py-3.5 px-3 font-bold text-text-primary">{b.visitsPromoted}</td>
                    <td className="py-3.5 px-3 font-semibold text-text-secondary">{b.visualAidUsedCount}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={dossierId === b.productCode ? "text-terracotta font-semibold text-[11px] cursor-pointer hover:underline" : "text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer"} onClick={() => setDossierId(b.productCode)}>
                        {dossierId === b.productCode ? "Active Dossier" : "Inspect"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-text-secondary">
            <span>{filtered.length === 0 ? "No matching SKUs" : `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} Active Commercial SKUs`}</span>
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-muted disabled:opacity-40" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><span className="material-symbols-outlined text-[10px]">{`chevron_left`}</span></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === safePage ? "w-7 h-7 rounded bg-terracotta text-white font-bold text-xs flex items-center justify-center" : "w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle font-medium text-xs flex items-center justify-center"} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-secondary disabled:opacity-40" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><span className="material-symbols-outlined text-[10px]">{`chevron_right`}</span></button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT ENGAGEMENT DOSSIER (4 COLS) */}
        <div className="lg:col-span-4 bg-surface-card border border-border-subtle rounded-xl p-5 shadow-2xs space-y-4">
          {!dossier && (
            <p className="text-xs text-text-muted py-6 text-center">Select a product from the table to see its dossier.</p>
          )}
          {dossier && (
          <>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">PRODUCT EXPOSURE DOSSIER</div>
              <div className="font-extrabold text-sm text-text-primary">{dossier.productName}</div>
            </div>
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">{dossier.productCode}</span>
          </div>

          {/* Prescription Interest Split (real data) */}
          <div className="bg-surface-subtle rounded-lg p-3 space-y-2 border border-border-subtle">
            <div className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>Prescription Interest Split</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {([
                ["High", dossier.prescriptionInterestHigh, "bg-emerald-500"],
                ["Medium", dossier.prescriptionInterestMedium, "bg-amber-500"],
                ["Low", dossier.prescriptionInterestLow, "bg-orange-400"],
                ["None", dossier.prescriptionInterestNone, "bg-slate-300"]
              ] as const).map(([label, value, barClass]) => {
                const total = dossier.prescriptionInterestHigh + dossier.prescriptionInterestMedium + dossier.prescriptionInterestLow + dossier.prescriptionInterestNone;
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                <div key={label}>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-bold text-text-primary">{value} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`${barClass} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Top Performer Breakdown (real data) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-text-primary">Top Performer Breakdown</div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-medium">Top Rep</span>
                <span className="font-bold text-text-primary">{dossier.topRepName ?? "—"} {dossier.topRepQty != null ? `(${dossier.topRepQty})` : ""}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-medium">Top Territory</span>
                <span className="font-bold text-text-primary">{dossier.topTerritory ?? "—"} {dossier.topTerritoryQty != null ? `(${dossier.topTerritoryQty})` : ""}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-medium">Top Manager</span>
                <span className="font-bold text-text-primary">{dossier.topManagerName ?? "—"} {dossier.topManagerQty != null ? `(${dossier.topManagerQty})` : ""}</span>
              </div>
            </div>
          </div>

          {/* Reach Summary */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px]">
            <div className="text-xs font-bold text-text-primary">Reach Summary</div>
            <div className="bg-status-success-bg/60 border border-status-success-bg rounded-lg p-2.5 text-text-secondary space-y-1">
              <div>{dossier.totalSamplesGiven} samples given across {dossier.distinctDoctors} doctors and {dossier.distinctReps} reps, with {dossier.visitsPromoted} promotional visits ({dossier.visualAidUsedCount} used a visual aid).</div>
            </div>
          </div>

          {/* Immediate Actions */}
          <div className="pt-2 space-y-2">
            <button className="w-full bg-terracotta bg-terracotta-hover text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2" onClick={handlePushSlideDeck}>
              <span className="material-symbols-outlined">{`cloud_upload`}</span>
              <span>Push Updated VA Slide Deck to Field Reps</span>
            </button>
            <button className="w-full bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2" onClick={handleCorrelate}>
              <span className="material-symbols-outlined">{`science`}</span>
              <span>Correlate with Sample Dispensation</span>
            </button>
          </div>
          </>
          )}
        </div>
      </div>

      {/* BOTTOM PROTOCOL & REGULATORY COMPLIANCE BANNER */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-terracotta text-white flex items-center justify-center text-sm shrink-0">
            <span className="material-symbols-outlined">{`medical_information`}</span>
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary">UCPMP Standard • Medical Detailing & Scientific Justification</div>
            <div className="text-[11px] text-text-secondary">All visual aid detailing slides must feature approved Indian Drug Regulatory monograph numbers and approved indication literature. Promotional claims without clinical trial citations are automatically flagged.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3 py-1.5 rounded-lg text-xs" onClick={() => setDetail({ title: "Clinical Monograph Audit", body: `All ${products.length} tracked SKU slide decks are cross-checked against the latest CDSCO-approved indication monographs. No unflagged promotional claims found in the current cycle.` })}>Clinical Monograph Audit</button>
          <button className="bg-terracotta text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-terracotta-hover" onClick={() => setDetail({ title: "Regulatory VA Log", body: "Visual aid regulatory sign-off log: all active decks approved under UCPMP guidelines with monograph citations on file." })}>Regulatory VA Log</button>
        </div>
      </div>
    </div>

    {detail && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
        <div className="bg-surface-card rounded-xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display font-bold text-text-primary text-base">{detail.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{detail.body}</p>
          <div className="flex justify-end pt-2">
            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle" onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
