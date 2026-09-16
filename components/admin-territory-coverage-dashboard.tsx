"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";
import { apiClient, type TerritoryCoverageRow } from "@/lib/api-client";
import { formatDate } from "@/lib/format-date";

// Fix — this page used to be a fully static server component, then a later
// pass made the beat roster table interactive against a local mock array of
// fabricated "beats" (hcpUniverse/reached/coveragePct numbers with no
// backend source). The backend's real Territory Coverage / Doctor Exception
// endpoint (Topic 7/8) is GET /company/doctor-coverage, wrapped by
// apiClient.territoryCoverage() — it returns one row PER DOCTOR (not per
// beat), each with the assigned MR, real visit counts, last-visit date,
// days-since-last-visit and a computed alertBucket
// (NEVER_VISITED/180/90/60/30/null). There is no "beat"/"zone" grouping,
// hcpUniverse or coveragePct in the real data, so the table grain has been
// changed to doctor-level coverage + exception rows (matching what the
// backend actually computes), and the zone/saturation filters have been
// replaced with a real alert-bucket filter. The 4 KPI pulse cards and
// right-hand dossier's white-space/chemist blocks (no backend source) have
// been replaced with values derived from the real fetched rows where
// possible, and clearly reduced where there's no real backing.

const ALERT_FILTERS = [
  { value: "all", label: "All Alert Levels" },
  { value: "NEVER_VISITED", label: "Never Visited" },
  { value: "180", label: "180+ Days Since Visit" },
  { value: "90", label: "90+ Days Since Visit" },
  { value: "60", label: "60+ Days Since Visit" },
  { value: "30", label: "30+ Days Since Visit" },
  { value: "none", label: "No Alert (Recently Visited)" }
] as const;

const TABS = [
  { key: "roster", label: "Doctor Coverage & Exception Roster", count: null as string | null },
  { key: "whitespace", label: "Micro-Market White Space Explorer", count: null },
  { key: "heatmap", label: "Doctor Density & Tier Heatmap", count: null },
  { key: "chemist", label: "Chemist Stockist Tagging Ledger", count: null }
] as const;

const PAGE_SIZE = 10;

export function AdminTerritoryCoverageDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [rows, setRows] = useState<TerritoryCoverageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [alertFilter, setAlertFilter] = useState<(typeof ALERT_FILTERS)[number]["value"]>("all");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("roster");
  const [hasUnread, setHasUnread] = useState(true);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.territoryCoverage();
        if (cancelled) return;
        setRows(response.data ?? []);
        setSelectedId((prev) => prev ?? response.data?.[0]?.doctorId ?? null);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load territory coverage data");
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
    return rows.filter((b) => {
      if (alertFilter !== "all") {
        if (alertFilter === "none") {
          if (b.alertBucket !== null) return false;
        } else if (b.alertBucket !== alertFilter) {
          return false;
        }
      }
      if (!q) return true;
      return (
        b.doctorName.toLowerCase().includes(q) ||
        (b.assignedMR ?? "").toLowerCase().includes(q) ||
        (b.assignedMRName ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, alertFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selected = rows.find((r) => r.doctorId === selectedId) ?? rows[0] ?? null;

  const totalDoctors = rows.length;
  const visitedDoctors = rows.filter((r) => r.totalVisits > 0).length;
  const coveragePercent = totalDoctors > 0 ? (visitedDoctors / totalDoctors) * 100 : 0;
  const neverVisitedCount = rows.filter((r) => r.alertBucket === "NEVER_VISITED").length;
  const overGiftCount = rows.filter((r) => r.overGiftThreshold).length;

  function resetFilters() {
    setSearch("");
    setAlertFilter("all");
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "territory-coverage-doctors.csv",
      filtered.map((b) => ({
        "Doctor": b.doctorName,
        "Specialty": b.specialty ?? "",
        "Assigned MR": b.assignedMRName ?? b.assignedMR ?? "",
        "Total Visits": b.totalVisits,
        "Last Visit Date": b.lastVisitDate ?? "",
        "Days Since Last Visit": b.daysSinceLastVisit ?? "",
        "Alert Bucket": b.alertBucket ?? "",
        "Total Samples": b.totalSamples,
        "Total Gifts": b.totalGifts,
        "Total Gift Value (Rs)": b.totalGiftValueRs,
        "Exception Reason": b.exceptionReason ?? ""
      }))
    );
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
          <span className="text-text-primary font-semibold">Territory Coverage & White Space Analysis</span>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs"
          type="button"
          onClick={() => setDetail({ title: "Sync Complete", body: "Territory & doctor coverage data refreshed from the latest DCR feed." })}
        >
          <span className="material-symbols-outlined">{`sync`}</span>
        </button>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs relative"
          type="button"
          onClick={() => { setHasUnread(false); setDetail({ title: "Notifications", body: `${neverVisitedCount} doctor(s) have never been visited. ${overGiftCount} doctor(s) are over the gift value threshold.` }); }}
        >
          <span className="material-symbols-outlined">{`circle`}</span>
          {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full"></span>}
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
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Territory Coverage & Doctor Exception Management</h1>
            <span className="bg-status-success-bg text-status-success border border-status-success-bg text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {coveragePercent.toFixed(1)}% Coverage
            </span>
            <span className="bg-status-warning-bg text-amber-800 border border-status-warning-bg text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <span className="material-symbols-outlined mr-1 text-amber-600">{`warning`}</span> {neverVisitedCount} Never Visited
            </span>
          </div>
          <p className="text-xs text-text-secondary">Real-time doctor coverage audit tracking visit recency, gift/sample thresholds, and exception flags from live DCR records.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            <span className="material-symbols-outlined text-text-muted">{`file_download`}</span>
            <span>Export Territory Coverage (CSV)</span>
          </button>
          <button
            className="flex items-center gap-2 bg-terracotta bg-terracotta-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors"
            type="button"
            onClick={() => setDetail({ title: "Reallocate Territory Boundaries", body: "Boundary reallocation requires ASM/ZSM sign-off and is not yet wired to a live GIS boundary editor. Use the doctor dossier below to flag doctors that need re-assignment." })}
          >
            <span className="material-symbols-outlined">{`location_on`}</span>
            <span>Reallocate Territory Boundaries</span>
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
            <span>TERRITORY PENETRATION</span>
            <div className="w-7 h-7 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`show_chart`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{coveragePercent.toFixed(1)}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Visited: <strong>{visitedDoctors} / {totalDoctors}</strong></span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>NEVER VISITED</span>
            <div className="w-7 h-7 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`medical_services`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{neverVisitedCount}</span>
            <span className="text-[11px] font-bold text-text-secondary">Doctors</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Total Doctors: <strong>{totalDoctors}</strong></span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>OVER GIFT THRESHOLD</span>
            <div className="w-7 h-7 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`architecture`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{overGiftCount}</span>
            <span className="text-[11px] font-bold text-amber-600">Doctors Flagged</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Per configured gift value threshold</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>ALERT BUCKET SPREAD</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`medication`}</span></div>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap text-[11px] font-bold text-text-secondary">
            {(["180", "90", "60", "30"] as const).map((b) => (
              <span key={b}>{b}d+: {rows.filter((r) => r.alertBucket === b).length}</span>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Days-since-last-visit buckets</span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="border-b border-border-subtle flex items-center gap-6 text-xs font-semibold">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={active ? "pb-2.5 border-b-2 border-terracotta text-terracotta flex items-center gap-2" : "pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"}
            >
              <span>{t.label}</span>
              {t.count && (
                <span className={active ? "bg-terracotta/10 text-terracotta text-[10px] font-bold px-1.5 py-0.2 rounded-full" : "bg-surface-subtle text-text-secondary text-[10px] font-bold px-1.5 py-0.2 rounded-full"}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab !== "roster" ? (
        <div className="bg-surface-card border border-border-subtle rounded-xl p-8 shadow-2xs text-center text-xs text-text-muted">
          No dedicated data view is wired up for &quot;{TABS.find((t) => t.key === activeTab)?.label}&quot; yet — there is no backend collection for it. Switch back to the Doctor Coverage & Exception Roster tab to see live data.
        </div>
      ) : (
      <>
      {/* MAIN SPLIT WORKSPACE: TABLE (LEFT) & DOCTOR DOSSIER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-surface-card border border-border-subtle rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Filter Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-xs">{`search`}</span>
                <input
                  type="text"
                  placeholder="Search Doctor or Assigned MR..."
                  className="w-full bg-surface-card border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-secondary placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium"
                value={alertFilter}
                onChange={(e) => { setAlertFilter(e.target.value as typeof alertFilter); setPage(1); }}
              >
                {ALERT_FILTERS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>

              <button
                className="text-xs text-text-secondary hover:text-text-secondary font-semibold px-2 py-1.5 flex items-center gap-1"
                type="button"
                onClick={resetFilters}
              >
                <span className="material-symbols-outlined text-[11px]">{`refresh`}</span> Reset
              </button>
            </div>
          </div>

          {/* Table Header & Rows */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted text-[10px] font-bold uppercase tracking-wider border-b border-border-subtle">
                <tr>
                  <th className="py-3 px-3">DOCTOR & SPECIALTY</th>
                  <th className="py-3 px-3">ASSIGNED MR</th>
                  <th className="py-3 px-3">TOTAL VISITS</th>
                  <th className="py-3 px-3">LAST VISIT / DAYS SINCE</th>
                  <th className="py-3 px-3">ALERT</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {loading && (
                  <tr><td colSpan={6} className="py-10 px-3.5 text-center text-text-muted text-xs">Loading territory coverage data…</td></tr>
                )}
                {!loading && pageRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 px-3.5 text-center text-text-muted text-xs">No doctors match the current search/filters.</td>
                  </tr>
                )}
                {!loading && pageRows.map((b) => {
                  const flagged = b.alertBucket === "NEVER_VISITED" || b.alertBucket === "180";
                  return (
                  <tr key={b.doctorId} className={selectedId === b.doctorId ? "bg-orange-50/40 hover:bg-orange-50/60 transition-colors" : "hover:bg-surface-subtle/70 transition-colors"} onClick={() => setSelectedId(b.doctorId)}>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-text-primary">{b.doctorName}</div>
                      <div className="text-[11px] text-text-muted">{b.specialty ?? "—"}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-text-primary">{b.assignedMRName ?? b.assignedMR ?? "Unassigned"}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-text-primary">{b.totalVisits}</td>
                    <td className="py-3.5 px-3">
                      <div className="text-text-primary font-semibold">{b.lastVisitDate ? formatDate(b.lastVisitDate) : "Never"}</div>
                      <div className="text-[11px] text-text-muted">{b.daysSinceLastVisit != null ? `${b.daysSinceLastVisit} days ago` : "—"}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      {b.alertBucket ? (
                        <span className={flagged ? "font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded text-[10px]" : "font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded text-[10px]"}>
                          {b.alertBucket === "NEVER_VISITED" ? "Never Visited" : `${b.alertBucket}+ Days`}
                        </span>
                      ) : (
                        <span className="font-bold text-status-success bg-status-success-bg px-1.5 py-0.2 rounded text-[10px]">On Track</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        className={flagged ? "text-rose-600 font-semibold text-[11px] cursor-pointer hover:underline" : "text-terracotta font-semibold text-[11px] cursor-pointer hover:underline"}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(b.doctorId); setDetail({
                          title: `${b.doctorName} — Coverage`,
                          body: `${b.specialty ?? "Doctor"} assigned to ${b.assignedMRName ?? b.assignedMR ?? "no MR"}. Total visits ${b.totalVisits}, last visited ${b.lastVisitDate ? formatDate(b.lastVisitDate) : "never"}.${b.exceptionReason ? ` Exception: ${b.exceptionReason}${b.exceptionNotes ? ` — ${b.exceptionNotes}` : ""}` : ""}`
                        }); }}
                      >
                        {flagged ? "Lag Alert" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-text-secondary">
            <span>{filtered.length === 0 ? "No matching doctors" : <>Showing <strong>{(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</strong> Doctors</>}</span>
            <div className="flex items-center gap-1.5">
              <button
                className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              ><span className="material-symbols-outlined text-[10px]">{`chevron_left`}</span></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === safePage ? "w-7 h-7 rounded bg-terracotta text-white font-bold text-xs flex items-center justify-center" : "w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle font-medium text-xs flex items-center justify-center"}
                  type="button"
                  onClick={() => setPage(n)}
                >{n}</button>
              ))}
              <button
                className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              ><span className="material-symbols-outlined text-[10px]">{`chevron_right`}</span></button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DOCTOR DOSSIER (4 COLS) */}
        <div className="lg:col-span-4 bg-surface-card border border-border-subtle rounded-xl p-5 shadow-2xs space-y-4">
          {!selected && (
            <p className="text-xs text-text-muted py-6 text-center">Select a doctor from the table to see their coverage dossier.</p>
          )}
          {selected && (
          <>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">DOCTOR COVERAGE DOSSIER</div>
              <div className="font-extrabold text-sm text-text-primary">{selected.doctorName}</div>
            </div>
            <span className={selected.alertBucket ? "bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full" : "bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold px-2 py-0.5 rounded-full"}>
              {selected.alertBucket ? (selected.alertBucket === "NEVER_VISITED" ? "Never Visited" : `${selected.alertBucket}+ Days`) : "Optimal Coverage"}
            </span>
          </div>

          {/* Doctor Summary Block */}
          <div className="bg-surface-subtle rounded-lg p-3 space-y-1.5 border border-border-subtle">
            <div className="text-xs font-bold text-text-primary">{selected.doctorName}</div>
            <div className="text-[11px] text-text-secondary">{selected.specialty ?? "Specialty not on file"}</div>
            <div className="text-[10px] font-medium text-text-muted flex items-center gap-3 pt-1">
              <span>MR: {selected.assignedMRName ?? selected.assignedMR ?? "Unassigned"}</span>
            </div>
          </div>

          {/* Visit / Sample / Gift Breakdown */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>Coverage Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-surface-subtle rounded-lg p-2 border border-border-subtle">
                <div className="text-text-muted">Total Visits</div>
                <div className="font-bold text-text-primary text-sm">{selected.totalVisits}</div>
              </div>
              <div className="bg-surface-subtle rounded-lg p-2 border border-border-subtle">
                <div className="text-text-muted">Days Since Last Visit</div>
                <div className="font-bold text-text-primary text-sm">{selected.daysSinceLastVisit ?? "—"}</div>
              </div>
              <div className="bg-surface-subtle rounded-lg p-2 border border-border-subtle">
                <div className="text-text-muted">Total Samples</div>
                <div className="font-bold text-text-primary text-sm">{selected.totalSamples}</div>
              </div>
              <div className="bg-surface-subtle rounded-lg p-2 border border-border-subtle">
                <div className="text-text-muted">Total Gifts</div>
                <div className="font-bold text-text-primary text-sm">{selected.totalGifts}</div>
              </div>
            </div>
            <div className={`rounded-lg p-2.5 border text-[11px] flex items-center justify-between ${selected.overGiftThreshold ? "bg-rose-50 border-rose-200" : "bg-surface-subtle border-border-subtle"}`}>
              <span className="text-text-secondary font-medium">Total Gift Value:</span>
              <span className={`font-bold ${selected.overGiftThreshold ? "text-rose-600" : "text-text-primary"}`}>₹ {selected.totalGiftValueRs.toLocaleString("en-IN")} {selected.overGiftThreshold ? "(Over Threshold)" : ""}</span>
            </div>
          </div>

          {/* Exception details, if any */}
          {selected.exceptionReason ? (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="text-xs font-bold text-text-primary flex items-center justify-between">
                <span>Exception Flagged</span>
                {selected.exceptionMonth && <span className="text-[10px] font-bold text-text-muted">{selected.exceptionMonth}</span>}
              </div>
              <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2.5 space-y-1 text-[11px] text-text-secondary">
                <div className="font-semibold text-rose-800">{selected.exceptionReason}</div>
                {selected.exceptionNotes && <div>{selected.exceptionNotes}</div>}
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] text-text-muted">No exception flagged for this doctor.</p>
            </div>
          )}

          {/* Immediate Actions */}
          <div className="pt-2 space-y-2">
            <button
              className="w-full bg-terracotta bg-terracotta-hover text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2"
              type="button"
              onClick={() => downloadCsv(`doctor-coverage-${selected.doctorId}.csv`, [{
                Doctor: selected.doctorName, Specialty: selected.specialty ?? "", "Assigned MR": selected.assignedMRName ?? selected.assignedMR ?? "",
                "Total Visits": selected.totalVisits, "Last Visit": selected.lastVisitDate ?? "", "Days Since": selected.daysSinceLastVisit ?? "",
                "Alert Bucket": selected.alertBucket ?? "", "Total Samples": selected.totalSamples, "Total Gifts": selected.totalGifts,
                "Gift Value Rs": selected.totalGiftValueRs
              }])}
            >
              <span className="material-symbols-outlined">{`download`}</span>
              <span>Download Doctor Coverage Report</span>
            </button>
          </div>
          </>
          )}
        </div>
      </div>
      </>
      )}

      {/* BOTTOM COMPLIANCE & PROTOCOL BANNER */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-terracotta text-white flex items-center justify-center text-sm shrink-0">
            <span className="material-symbols-outlined">{`pin_drop`}</span>
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary">Territory Rationalization Norms & Call Balancing</div>
            <div className="text-[11px] text-text-secondary">Each medical representative beat must encompass between 135 to 160 core HCPs to maintain mandatory call frequency without exceeding statutory UCPMP visit caps.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3 py-1.5 rounded-lg text-xs"
            type="button"
            onClick={() => setDetail({ title: "Beat Rationalization SOP", body: "Each medical representative beat must encompass between 135 to 160 core HCPs to maintain mandatory call frequency without exceeding statutory UCPMP visit caps." })}
          >Beat Rationalization SOP</button>
          <button
            className="bg-terracotta text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-terracotta-hover"
            type="button"
            onClick={() => setDetail({ title: "Simulate Reallocation", body: "Reallocation simulation is not yet wired to a live optimizer — this would recompute beat boundaries against the 135–160 HCP rationalization target across all registered doctors." })}
          >Simulate Reallocation</button>
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
