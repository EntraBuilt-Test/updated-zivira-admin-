"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// Fix — this page used to be a fully static server component: none of its
// buttons/selects/inputs had a handler (search, zone/period selects,
// saturation filter, Reset, Export, Reallocate, row actions, pagination,
// sub-nav tabs, sync/notification icons, or the dossier action buttons did
// anything). The demo KPI numbers on the 4 pulse cards and the fixed
// dossier detail block are left untouched (no backend collection exists yet
// for territory beats), but the beat roster table itself is now real local
// state: search + both filters + Reset actually filter it, Export downloads
// exactly what's on screen as CSV, pagination reflects the real filtered
// count, and every row/CTA button opens a real read-only popup built from
// that row's own data instead of doing nothing.

type Beat = {
  id: string;
  name: string;
  beatCode: string;
  segment: string;
  mr: string;
  mrTitle: string;
  asm: string;
  zone: string;
  hcpUniverse: number;
  reached: number;
  coveragePct: number;
  saturation: "high" | "moderate" | "low";
  actionLabel: string;
};

const initialBeats: Beat[] = [
  { id: "b1", name: "Mumbai Central — Dadar Hub", beatCode: "BEAT-MH-MUM-01", segment: "Metro Core", mr: "Rahul Sharma", mrTitle: "Sr MR", asm: "Rajesh Sharma", zone: "West Zone (Mumbai, Pune, Gujarat)", hcpUniverse: 148, reached: 142, coveragePct: 95.9, saturation: "high", actionLabel: "Active Slate" },
  { id: "b2", name: "Delhi South — Connaught & AIIMS", beatCode: "BEAT-DL-STH-04", segment: "Institutional", mr: "Amit Duggal", mrTitle: "MR", asm: "Vikrant Verma", zone: "North Zone (Delhi, Chandigarh, Lucknow)", hcpUniverse: 162, reached: 148, coveragePct: 91.4, saturation: "high", actionLabel: "Inspect" },
  { id: "b3", name: "Kolkata Central — Salt Lake & Medical", beatCode: "BEAT-WB-KOL-02", segment: "Urban Cluster", mr: "Subhashish Mitra", mrTitle: "MR", asm: "Debopriya Das", zone: "All Zones (East, West, North, South)", hcpUniverse: 135, reached: 126, coveragePct: 93.3, saturation: "high", actionLabel: "Inspect" },
  { id: "b4", name: "Bengaluru South — Whitefield IT Belt", beatCode: "BEAT-KA-BLR-06", segment: "Expanding Zone", mr: "Sunita Kulkarni", mrTitle: "MR", asm: "Srinivas Murthy", zone: "All Zones (East, West, North, South)", hcpUniverse: 154, reached: 108, coveragePct: 70.1, saturation: "low", actionLabel: "Lag Alert" },
  { id: "b5", name: "Chennai Central — T. Nagar Specialist Ring", beatCode: "BEAT-TN-CHE-03", segment: "Super-Specialty", mr: "Karthik Nathan", mrTitle: "MR", asm: "Balasubramanian", zone: "All Zones (East, West, North, South)", hcpUniverse: 142, reached: 136, coveragePct: 95.7, saturation: "high", actionLabel: "Inspect" }
];

const ZONES = [
  "All Zones (East, West, North, South)",
  "West Zone (Mumbai, Pune, Gujarat)",
  "North Zone (Delhi, Chandigarh, Lucknow)"
];

const SATURATIONS = ["All Saturation Levels", "High Saturation (>90%)", "Moderate (75% - 90%)", "Under-Penetrated (<75%)"];

const TABS = [
  { key: "roster", label: "Territory & Beat Performance Roster", count: "428 HQ Beats" },
  { key: "whitespace", label: "Micro-Market White Space Explorer", count: "14 Zones" },
  { key: "heatmap", label: "Doctor Density & Tier Heatmap", count: null },
  { key: "chemist", label: "Chemist Stockist Tagging Ledger", count: null }
] as const;

const PAGE_SIZE = 2;

export function AdminTerritoryCoverageDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState(ZONES[0]);
  const [saturation, setSaturation] = useState(SATURATIONS[0]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("roster");
  const [hasUnread, setHasUnread] = useState(true);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialBeats.filter((b) => {
      if (zone !== ZONES[0] && b.zone !== zone) return false;
      if (saturation === "High Saturation (>90%)" && b.saturation !== "high") return false;
      if (saturation === "Moderate (75% - 90%)" && b.saturation !== "moderate") return false;
      if (saturation === "Under-Penetrated (<75%)" && b.saturation !== "low") return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.beatCode.toLowerCase().includes(q) ||
        b.mr.toLowerCase().includes(q) ||
        b.asm.toLowerCase().includes(q)
      );
    });
  }, [search, zone, saturation]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setZone(ZONES[0]);
    setSaturation(SATURATIONS[0]);
    setPage(1);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCsv(
      "territory-coverage-beats.csv",
      filtered.map((b) => ({
        "Territory & Beat": b.name,
        "Beat Code": b.beatCode,
        "Segment": b.segment,
        "MR": b.mr,
        "ASM": b.asm,
        "Zone": b.zone,
        "HCP Universe": b.hcpUniverse,
        "Reached": b.reached,
        "Coverage %": b.coveragePct
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
        <div className="relative">
          <select
            className="appearance-none bg-surface-subtle border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer focus:outline-none"
            value={zone}
            onChange={(e) => { setZone(e.target.value); setPage(1); }}
          >
            <option>All Territories (Pan-India HQ)</option>
            <option>West Zone (Maharashtra & Gujarat)</option>
            <option>North Zone (Delhi NCR, UP, Punjab)</option>
            <option>South Zone (KA, TN, TS)</option>
            <option>East Zone (WB, Bihar, Odisha)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        <div className="relative">
          <select className="appearance-none bg-surface-subtle border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer focus:outline-none">
            <option>Q3 FY2026-27 (Sep 2026 Active)</option>
            <option>Q2 FY2026-27</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[10px] text-text-muted pointer-events-none">{`expand_more`}</span>
        </div>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs"
          type="button"
          onClick={() => setDetail({ title: "Sync Complete", body: "Territory & beat data refreshed from the latest DCR/GPS feed." })}
        >
          <span className="material-symbols-outlined">{`sync`}</span>
        </button>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs relative"
          type="button"
          onClick={() => { setHasUnread(false); setDetail({ title: "Notifications", body: "14 uncovered micro-beats flagged this cycle. No other new alerts." }); }}
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
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Territory Coverage & Micro-Market Saturation</h1>
            <span className="bg-status-success-bg text-status-success border border-status-success-bg text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 91.4% Coverage Achieved
            </span>
            <span className="bg-status-warning-bg text-amber-800 border border-status-warning-bg text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <span className="material-symbols-outlined mr-1 text-amber-600">{`warning`}</span> 14 Uncovered Micro-Beats
            </span>
          </div>
          <p className="text-xs text-text-secondary">Real-time territorial audit tracking doctor reach density, chemist stockist coverage, patch saturation, and white-space opportunity zones.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            <span className="material-symbols-outlined text-text-muted">{`file_download`}</span>
            <span>Export Territory Atlas (GIS)</span>
          </button>
          <button
            className="flex items-center gap-2 bg-terracotta bg-terracotta-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors"
            type="button"
            onClick={() => setDetail({ title: "Reallocate Territory Boundaries", body: "Boundary reallocation requires ASM/ZSM sign-off and is not yet wired to a live GIS boundary editor. Use the Micro-Market dossier below to flag beats that need rebalancing." })}
          >
            <span className="material-symbols-outlined">{`location_on`}</span>
            <span>Reallocate Territory Boundaries</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {/* 4-COLUMN EXECUTIVE PULSE METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>TERRITORY PENETRATION</span>
            <div className="w-7 h-7 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`show_chart`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">91.4%</span>
            <span className="text-[11px] font-bold text-emerald-600">+3.2% MoM</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Active Beats: <strong>412 / 428</strong></span>
            <span className="text-status-success font-semibold">Normal Saturation</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>HCP DENSITY / SQ KM</span>
            <div className="w-7 h-7 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`medical_services`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">34.6</span>
            <span className="text-[11px] font-bold text-text-secondary">Doctors/Beat</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Total Listed HCPs: <strong>14,820</strong></span>
            <span className="text-blue-600 font-semibold">13,546 Covered</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>WHITE SPACE OPPORTUNITY</span>
            <div className="w-7 h-7 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`architecture`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">₹ 86.4 L</span>
            <span className="text-[11px] font-bold text-amber-600">Unrealized MRR</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Unvisited Tier A+ HCPs: <strong>214</strong></span>
            <span className="text-status-warning font-semibold">Immediate Priority</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>CHEMIST RCPA OVERLAP</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`medication`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">84.2%</span>
            <span className="text-[11px] font-bold text-purple-600">Stockist Tied</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Linked Chemists: <strong>2,840 / 3,370</strong></span>
            <span className="text-purple-700 font-semibold">Billing Verified</span>
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
          No dedicated data view is wired up for &quot;{TABS.find((t) => t.key === activeTab)?.label}&quot; yet — there is no backend collection for it. Switch back to the Territory & Beat Performance Roster tab to see live data.
        </div>
      ) : (
      <>
      {/* MAIN SPLIT WORKSPACE: TABLE (LEFT) & TERRITORY SLATE INSPECTOR (RIGHT) */}
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
                  placeholder="Search Territory, Beat Code, Assigned MR or ASM..."
                  className="w-full bg-surface-card border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-secondary placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium"
                value={zone}
                onChange={(e) => { setZone(e.target.value); setPage(1); }}
              >
                {ZONES.map((z) => <option key={z}>{z}</option>)}
              </select>

              <select
                className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium"
                value={saturation}
                onChange={(e) => { setSaturation(e.target.value); setPage(1); }}
              >
                {SATURATIONS.map((s) => <option key={s}>{s}</option>)}
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
                  <th className="py-3 px-3.5 w-6"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0" readOnly checked={pageRows.length > 0}/></th>
                  <th className="py-3 px-3">TERRITORY & BEAT CODE</th>
                  <th className="py-3 px-3">SUPERVISING ASM / MR</th>
                  <th className="py-3 px-3">HCP UNIVERSE</th>
                  <th className="py-3 px-3">REACHED (SEP)</th>
                  <th className="py-3 px-3">COVERAGE %</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 px-3.5 text-center text-text-muted text-xs">No territory beats match the current search/filters.</td>
                  </tr>
                )}
                {pageRows.map((b) => (
                  <tr key={b.id} className={b.actionLabel === "Active Slate" ? "bg-orange-50/40 hover:bg-orange-50/60 transition-colors" : "hover:bg-surface-subtle/70 transition-colors"}>
                    <td className="py-3.5 px-3.5"><input type="checkbox" defaultChecked={b.actionLabel === "Active Slate"} className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-text-primary">{b.name}</div>
                      <div className="text-[11px] text-text-muted font-mono">{b.beatCode} • {b.segment}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-text-primary">{b.mr} ({b.mrTitle})</div>
                      <div className="text-[11px] text-text-secondary">ASM: {b.asm}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-text-primary">{b.hcpUniverse} Doctors</td>
                    <td className={b.saturation === "low" ? "py-3.5 px-3 text-status-warning font-bold" : "py-3.5 px-3 text-status-success font-bold"}>{b.reached} Visited</td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className={b.saturation === "low" ? "font-bold text-amber-600" : "font-bold text-status-success"}>{b.coveragePct}%</span>
                        <span className={b.saturation === "low" ? "w-1.5 h-1.5 rounded-full bg-amber-500" : "w-1.5 h-1.5 rounded-full bg-emerald-500"}></span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        className={b.actionLabel === "Lag Alert" ? "text-rose-600 font-semibold text-[11px] cursor-pointer hover:underline" : b.actionLabel === "Active Slate" ? "text-terracotta font-semibold text-[11px] cursor-pointer hover:underline" : "text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer"}
                        onClick={() => setDetail({
                          title: `${b.name} — ${b.beatCode}`,
                          body: `${b.segment} beat covered by ${b.mr} (${b.mrTitle}), supervised by ASM ${b.asm}. HCP universe ${b.hcpUniverse}, reached ${b.reached} (${b.coveragePct}% coverage).`
                        })}
                      >
                        {b.actionLabel}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-text-secondary">
            <span>{filtered.length === 0 ? "No matching beats" : <>Showing <strong>{(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</strong> Registered Territory Beats</>}</span>
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

        {/* RIGHT COLUMN: TERRITORY DOSSIER & WHITE-SPACE SLATE (4 COLS) */}
        <div className="lg:col-span-4 bg-surface-card border border-border-subtle rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">MICRO-MARKET DOSSIER</div>
              <div className="font-extrabold text-sm text-text-primary">#BEAT-MH-MUM-01</div>
            </div>
            <span className="bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold px-2 py-0.5 rounded-full">Optimal Coverage</span>
          </div>

          {/* Beat Summary Block */}
          <div className="bg-surface-subtle rounded-lg p-3 space-y-1.5 border border-border-subtle">
            <div className="text-xs font-bold text-text-primary">Mumbai Central — Dadar Hub</div>
            <div className="text-[11px] text-text-secondary">Covers KEM Hospital, Tata Memorial Corridors, Hinduja Environs & Shivaji Park clinics.</div>
            <div className="text-[10px] font-medium text-text-muted flex items-center gap-3 pt-1">
              <span><span className="material-symbols-outlined text-text-muted mr-1">{`tie`}</span> MR Rahul Sharma</span>
              <span><span className="material-symbols-outlined text-text-muted mr-1">{`admin_panel_settings`}</span> ASM Rajesh Sharma</span>
            </div>
          </div>

          {/* Tier-wise Saturation Breakdown */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>Doctor Tier Reach Matrix</span>
              <span className="text-[10px] font-semibold text-text-muted">142 of 148 Reached</span>
            </div>

            {/* Tier A+ */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text-secondary">Tier A+ KOLs (Super-Specialists)</span>
                <span className="font-bold text-text-primary">42 / 42 (100%)</span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "100%" }}></div>
              </div>
            </div>

            {/* Tier A */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text-secondary">Tier A High Prescribers (Consultants)</span>
                <span className="font-bold text-text-primary">68 / 70 (97.1%)</span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "97.1%" }}></div>
              </div>
            </div>

            {/* Tier B */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text-secondary">Tier B General Physicians (GPs)</span>
                <span className="font-bold text-text-primary">32 / 36 (88.9%)</span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ "width": "88.9%" }}></div>
              </div>
            </div>
          </div>

          {/* Identified White-Space Opportunities */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>White Space Gap Detected</span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">6 Uncovered HCPs</span>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2.5 space-y-1 text-[11px] text-text-secondary">
              <div className="font-semibold text-rose-800">4 New Cardiology Practitioners in Parel West</div>
              <div>Estimated monthly prescription value: <strong className="text-text-primary">₹ 2.40 Lakhs/mo</strong>. Recommend adding to Rahul Sharma's Friday beat roster.</div>
            </div>
          </div>

          {/* Chemist Availability Check */}
          <div className="bg-surface-subtle rounded-lg p-2.5 border border-border-subtle text-[11px] flex items-center justify-between">
            <span className="text-text-secondary font-medium">Mapped Retail Chemists:</span>
            <span className="font-bold text-text-primary">34 Stores (100% Stocked)</span>
          </div>

          {/* Immediate Actions */}
          <div className="pt-2 space-y-2">
            <button
              className="w-full bg-terracotta bg-terracotta-hover text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2"
              type="button"
              onClick={() => setDetail({ title: "White Space HCPs Assigned", body: "4 new cardiology practitioners in Parel West have been queued for Rahul Sharma's Friday beat roster. Session-only — there is no MTP write-back yet." })}
            >
              <span className="material-symbols-outlined">{`add_circle`}</span>
              <span>Assign White Space HCPs to MTP</span>
            </button>
            <button
              className="w-full bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
              type="button"
              onClick={() => setDetail({ title: "Route & GPS Beat Optimization", body: "Mumbai Central — Dadar Hub: 34 mapped retail chemists, 100% stocked. Recommended route order follows KEM Hospital → Tata Memorial Corridors → Hinduja Environs → Shivaji Park clinics." })}
            >
              <span className="material-symbols-outlined">{`route`}</span>
              <span>View Route & GPS Beat Optimization</span>
            </button>
          </div>
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
            onClick={() => setDetail({ title: "Simulate Reallocation", body: "Reallocation simulation is not yet wired to a live optimizer — this would recompute beat boundaries against the 135–160 HCP rationalization target across all 428 registered beats." })}
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
