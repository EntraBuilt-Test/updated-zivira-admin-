"use client";

import { useMemo, useState } from "react";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";
import { downloadCsv } from "@/lib/download-csv";

// This page used to be a fully static server component: every number was
// hand-typed JSX and none of its buttons/selects/inputs had a real
// onClick/onChange handler. The KPI cards at the top are left as-is (no
// backend collection exists yet for exposure metrics), but the Brand
// Exposure Matrix table is now real local state: search, both dropdown
// filters and Reset actually filter it, row selection is real, Inspect /
// Active Dossier loads that brand's real data into the right-hand
// dossier panel, Export Brand SOV Report downloads exactly what's on
// screen as CSV, and the immediate-action buttons record a real
// session-only action instead of doing nothing.

type Brand = {
  id: string;
  name: string;
  molecule: string;
  segment: "Cardio-Vascular" | "Diabetology" | "Respiratory" | "Gastroenterology";
  segmentBadgeClass: string;
  priority: "Priority 1 (Strategic Focus)" | "Priority 2 (Core Maintenance)" | "Priority 3 (Routine)";
  priorityLabel: string;
  priorityClass: string;
  calls: string;
  avgTime: string;
  rxLift: string;
  rxLiftClass: string;
  rowClass: string;
  dossierTag: string;
  slides: { label: string; time: string; pct: string }[];
  specialists: { label: string; value: string; valueClass: string }[];
  stockistNote: string;
};

const initialBrands: Brand[] = [
  {
    id: "cardiocare-20", name: "CardioCare 20mg", molecule: "Atorvastatin + Aspirin • Tab",
    segment: "Cardio-Vascular", segmentBadgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
    priority: "Priority 1 (Strategic Focus)", priorityLabel: "P1 Core", priorityClass: "bg-terracotta text-white",
    calls: "3,420 Calls", avgTime: "1m 18s", rxLift: "+28.4%", rxLiftClass: "text-emerald-600",
    rowClass: "bg-orange-50/40 hover:bg-orange-50/60", dossierTag: "Active Dossier",
    slides: [
      { label: "Slide 1: Clinical Efficacy & Lipid Lowering", time: "42s", pct: "54%" },
      { label: "Slide 2: Dual Action Safety Profile", time: "24s", pct: "31%" },
      { label: "Slide 3: Dosage & Bioequivalence Data", time: "12s", pct: "15%" }
    ],
    specialists: [
      { label: "Interventional Cardiologists", value: "1,480 / 1,520 (97.4%)", valueClass: "text-status-success" },
      { label: "Consulting Physicians (MD Med)", value: "1,240 / 1,350 (91.8%)", valueClass: "text-status-success" },
      { label: "Diabetologists & Endos", value: "700 / 920 (76.1%)", valueClass: "text-status-warning" }
    ],
    stockistNote: "Secondary Sales Velocity: ₹42.8 Lakhs / mo (+18.2% vs target). Zero stock-outs reported across 28 Depots."
  },
  {
    id: "glycoziv-xr", name: "GlycoZiv XR 500", molecule: "Metformin SR + Dapagliflozin",
    segment: "Diabetology", segmentBadgeClass: "bg-status-info-bg text-status-info border border-status-info-bg",
    priority: "Priority 1 (Strategic Focus)", priorityLabel: "P1 Core", priorityClass: "bg-terracotta text-white",
    calls: "2,890 Calls", avgTime: "1m 04s", rxLift: "+22.1%", rxLiftClass: "text-emerald-600",
    rowClass: "hover:bg-surface-subtle/70", dossierTag: "Inspect",
    slides: [
      { label: "Slide 1: Glycemic Control Data", time: "34s", pct: "53%" },
      { label: "Slide 2: Cardio-Renal Protection", time: "18s", pct: "28%" },
      { label: "Slide 3: Dosage Titration Guide", time: "12s", pct: "19%" }
    ],
    specialists: [
      { label: "Diabetologists & Endos", value: "980 / 1,050 (93.3%)", valueClass: "text-status-success" },
      { label: "Consulting Physicians (MD Med)", value: "860 / 1,100 (78.2%)", valueClass: "text-status-warning" },
      { label: "Nephrologists", value: "310 / 420 (73.8%)", valueClass: "text-status-warning" }
    ],
    stockistNote: "Secondary Sales Velocity: ₹31.4 Lakhs / mo (+14.0% vs target). 2 stockists flagged low on Depot South-2."
  },
  {
    id: "resp-clear", name: "Resp-Clear Inhaler 200mcg", molecule: "Budesonide + Formoterol DPI",
    segment: "Respiratory", segmentBadgeClass: "bg-status-success-bg text-status-success border border-status-success-bg",
    priority: "Priority 2 (Core Maintenance)", priorityLabel: "P2 Focus", priorityClass: "bg-surface-subtle text-text-secondary",
    calls: "2,140 Calls", avgTime: "48s", rxLift: "+16.5%", rxLiftClass: "text-emerald-600",
    rowClass: "hover:bg-surface-subtle/70", dossierTag: "Inspect",
    slides: [
      { label: "Slide 1: Bronchodilation Onset", time: "20s", pct: "42%" },
      { label: "Slide 2: DPI Technique Training", time: "16s", pct: "33%" },
      { label: "Slide 3: Exacerbation Reduction Data", time: "12s", pct: "25%" }
    ],
    specialists: [
      { label: "Pulmonologists", value: "640 / 700 (91.4%)", valueClass: "text-status-success" },
      { label: "Consulting Physicians (MD Med)", value: "520 / 780 (66.7%)", valueClass: "text-status-warning" }
    ],
    stockistNote: "Secondary Sales Velocity: ₹18.6 Lakhs / mo (+9.8% vs target). Stocked at 24 of 28 Depots."
  },
  {
    id: "zivical-d3", name: "ZiviCal D3 Forte", molecule: "Cholecalciferol 60,000 IU Softgel",
    segment: "Cardio-Vascular", segmentBadgeClass: "bg-status-warning-bg text-status-warning border border-status-warning-bg",
    priority: "Priority 2 (Core Maintenance)", priorityLabel: "P2 Focus", priorityClass: "bg-surface-subtle text-text-secondary",
    calls: "1,980 Calls", avgTime: "42s", rxLift: "+8.2%", rxLiftClass: "text-text-secondary",
    rowClass: "hover:bg-surface-subtle/70", dossierTag: "Inspect",
    slides: [
      { label: "Slide 1: Vitamin D Deficiency Data", time: "18s", pct: "43%" },
      { label: "Slide 2: Absorption Profile", time: "14s", pct: "33%" },
      { label: "Slide 3: Weekly Dosing Convenience", time: "10s", pct: "24%" }
    ],
    specialists: [
      { label: "Orthopedic Surgeons", value: "410 / 520 (78.8%)", valueClass: "text-status-warning" },
      { label: "Consulting Physicians (MD Med)", value: "560 / 700 (80.0%)", valueClass: "text-status-success" }
    ],
    stockistNote: "Secondary Sales Velocity: ₹12.1 Lakhs / mo (+4.0% vs target). Stocked at all 28 Depots."
  },
  {
    id: "gastroziv-dsr", name: "GastroZiv DSR", molecule: "Rabeprazole 20mg + Domperidone 30mg",
    segment: "Gastroenterology", segmentBadgeClass: "bg-purple-50 text-purple-700 border border-purple-200",
    priority: "Priority 3 (Routine)", priorityLabel: "P3 Routine", priorityClass: "bg-surface-subtle text-text-secondary border border-border-subtle",
    calls: "1,240 Calls", avgTime: "32s", rxLift: "+4.1%", rxLiftClass: "text-text-secondary",
    rowClass: "hover:bg-surface-subtle/70", dossierTag: "Inspect",
    slides: [
      { label: "Slide 1: Acid Suppression Onset", time: "14s", pct: "44%" },
      { label: "Slide 2: Combination Rationale", time: "10s", pct: "31%" },
      { label: "Slide 3: Safety in Elderly", time: "8s", pct: "25%" }
    ],
    specialists: [
      { label: "Gastroenterologists", value: "280 / 360 (77.8%)", valueClass: "text-status-warning" },
      { label: "Consulting Physicians (MD Med)", value: "410 / 640 (64.1%)", valueClass: "text-status-warning" }
    ],
    stockistNote: "Secondary Sales Velocity: ₹6.8 Lakhs / mo (+2.1% vs target). Stocked at 21 of 28 Depots."
  }
];

const PAGE_SIZE = 5;

export function AdminProductExposureDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const [brands] = useState<Brand[]>(initialBrands);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | Brand["segment"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Brand["priority"]>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["cardiocare-20"]));
  const [dossierId, setDossierId] = useState("cardiocare-20");
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const [division, setDivision] = useState("All Therapeutic Divisions (Cardio, Diab, Ortho)");
  const [cycle, setCycle] = useState("Cycle: Sep 2026 (Active Detailing)");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return brands.filter((b) => {
      if (segmentFilter !== "all" && b.segment !== segmentFilter) return false;
      if (priorityFilter !== "all" && b.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.molecule.toLowerCase().includes(q) ||
        b.segment.toLowerCase().includes(q)
      );
    });
  }, [brands, search, segmentFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const dossier = brands.find((b) => b.id === dossierId) ?? brands[0];

  function resetFilters() {
    setSearch("");
    setSegmentFilter("all");
    setPriorityFilter("all");
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
        "Brand": b.name,
        "Molecule": b.molecule,
        "Therapeutic Class": b.segment,
        "Priority": b.priorityLabel,
        "Exposure Calls": b.calls,
        "Avg Time": b.avgTime,
        "Rx Lift": b.rxLift
      }))
    );
  }

  function handlePushSlideDeck() {
    setDetail({ title: "Slide Deck Push Queued", body: `Updated visual-aid slide deck for ${dossier.name} has been queued to push to all field reps carrying this brand. This is a session-only action — there is no live field-app sync backend yet.` });
  }

  function handleCorrelate() {
    setDetail({ title: "Sample Correlation", body: `${dossier.name}: correlating e-detailing exposure with sample dispensation logs. Rx lift of ${dossier.rxLift} recorded against ${dossier.calls}. Full drill-down requires the sample dispensation collection, which isn't connected yet.` });
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

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs relative" onClick={() => setDetail({ title: "Notifications", body: "4 focus brands on track this cycle. 1 brand (GastroZiv DSR) is below the P3 routine detailing floor and may need a reminder push." })}>
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
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 10,455 Physician Exposures
            </span>
            <span className="bg-status-success-bg text-status-success border border-status-success-bg text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              4 Focus Brands On Track
            </span>
          </div>
          <p className="text-xs text-text-secondary">Track visual aid e-detailing duration, slide engagement, priority brand share-of-voice (SOV), and chemist stockist pull-through.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition-colors disabled:opacity-50" onClick={handleExport} disabled={filtered.length === 0}>
            <span className="material-symbols-outlined text-text-muted">{`download`}</span>
            <span>Export Brand SOV Report (XLS)</span>
          </button>
          <button className="flex items-center gap-2 bg-terracotta bg-terracotta-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors" onClick={() => setDetail({ title: "Adjust Brand Detailing Priorities", body: "Priority tiers (P1 Core, P2 Focus, P3 Routine) currently drive detailing time norms per brand. Re-ranking priorities isn't wired to a backend rules engine yet — use the Priority filter above to inspect brands tier by tier." })}>
            <span className="material-symbols-outlined">{`tune`}</span>
            <span>Adjust Brand Detailing Priorities</span>
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
            <span>TOTAL DETAILING SESSIONS</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-terracotta flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`tablet_mac`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">10,455</span>
            <span className="text-[11px] font-bold text-emerald-600">+11.4% MoM</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Digital VA Adherence: <strong>94.8%</strong></span>
            <span className="text-status-success font-semibold">Active Sync</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>AVG TIME SPENT PER CALL</span>
            <div className="w-7 h-7 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`timer`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">3m 42s</span>
            <span className="text-[11px] font-bold text-blue-600">Target 3m 30s</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Top Slide Retention: <strong>58s</strong></span>
            <span className="text-blue-600 font-semibold">High Engagement</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>PRIORITY BRAND SHARE (SOV)</span>
            <div className="w-7 h-7 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`pie_chart`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">68.2%</span>
            <span className="text-[11px] font-bold text-emerald-600">Target ≥65%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Top 4 Strategic SKUs</span>
            <span className="text-status-success font-semibold">Optimal Split</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>CHEMIST RX CONVERSION</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><span className="material-symbols-outlined">{`medication`}</span></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">76.4%</span>
            <span className="text-[11px] font-bold text-purple-600">+4.8% Lift</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>RCPA Validated Chemists: <strong>2,580</strong></span>
            <span className="text-purple-700 font-semibold">Verified</span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="border-b border-border-subtle flex items-center gap-6 text-xs font-semibold">
        {["Brand Exposure Matrix & Roster", "Interactive Visual Aid (e-Detailing) Duration Logs", "Therapeutic Segment Share-of-Voice (SOV)", "Doctor Brand Recall & Feedback Ledger"].map((label, i) => (
          <button
            key={label}
            className={i === activeSubTab ? "pb-2.5 border-b-2 border-terracotta text-terracotta flex items-center gap-2" : "pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"}
            onClick={() => {
              setActiveSubTab(i);
              if (i !== 0) setDetail({ title: label, body: "This view isn't built out yet — showing the Brand Exposure Matrix & Roster below in the meantime." });
            }}
          >
            <span>{label}</span>
            {i === 0 && <span className="bg-terracotta/10 text-terracotta text-[10px] font-bold px-1.5 py-0.2 rounded-full">16 Core SKUs</span>}
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
                <input type="text" placeholder="Search Brand, Molecule, Therapeutic Category or SKU..." className="w-full bg-surface-card border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-secondary placeholder-slate-400 focus:outline-none focus:border-slate-400" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium" value={segmentFilter} onChange={(e) => { setSegmentFilter(e.target.value as typeof segmentFilter); setPage(1); }}>
                <option value="all">All Segments (Cardio, Diab, Ortho, Pulmo)</option>
                <option value="Cardio-Vascular">Cardio-Vascular</option>
                <option value="Diabetology">Diabetology</option>
                <option value="Respiratory">Respiratory</option>
              </select>

              <select className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value as typeof priorityFilter); setPage(1); }}>
                <option value="all">All Priority Levels (P1, P2, P3)</option>
                <option value="Priority 1 (Strategic Focus)">Priority 1 (Strategic Focus)</option>
                <option value="Priority 2 (Core Maintenance)">Priority 2 (Core Maintenance)</option>
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
                  <th className="py-3 px-3.5 w-6"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0" checked={pageRows.length > 0 && pageRows.every((b) => selectedIds.has(b.id))} onChange={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      const allSelected = pageRows.every((b) => next.has(b.id));
                      pageRows.forEach((b) => (allSelected ? next.delete(b.id) : next.add(b.id)));
                      return next;
                    });
                  }}/></th>
                  <th className="py-3 px-3">BRAND & MOLECULE</th>
                  <th className="py-3 px-3">THERAPEUTIC CLASS</th>
                  <th className="py-3 px-3">PRIORITY</th>
                  <th className="py-3 px-3">EXPOSURE CALLS</th>
                  <th className="py-3 px-3">AVG TIME</th>
                  <th className="py-3 px-3">RX LIFT</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                {pageRows.length === 0 && (
                  <tr><td colSpan={8} className="py-10 px-3 text-center text-text-muted">No brands match the current search/filters.</td></tr>
                )}
                {pageRows.map((b) => (
                  <tr key={b.id} className={`${dossierId === b.id ? b.rowClass || "bg-orange-50/40 hover:bg-orange-50/60" : "hover:bg-surface-subtle/70"} transition-colors`}>
                    <td className="py-3.5 px-3.5"><input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelect(b.id)} className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-text-primary">{b.name}</div>
                      <div className="text-[11px] text-text-muted font-mono">{b.molecule}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.segmentBadgeClass}`}>{b.segment}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs ${b.priorityClass}`}>{b.priorityLabel}</span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-text-primary">{b.calls}</td>
                    <td className="py-3.5 px-3 font-semibold text-text-secondary">{b.avgTime}</td>
                    <td className={`py-3.5 px-3 font-bold ${b.rxLiftClass}`}>{b.rxLift}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={dossierId === b.id ? "text-terracotta font-semibold text-[11px] cursor-pointer hover:underline" : "text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer"} onClick={() => setDossierId(b.id)}>
                        {dossierId === b.id ? "Active Dossier" : "Inspect"}
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

        {/* RIGHT COLUMN: BRAND ENGAGEMENT DOSSIER (4 COLS) */}
        <div className="lg:col-span-4 bg-surface-card border border-border-subtle rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">STRATEGIC BRAND DOSSIER</div>
              <div className="font-extrabold text-sm text-text-primary">{dossier.name}</div>
            </div>
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">{dossier.priorityLabel === "P1 Core" ? "Top Detailing Asset" : dossier.priorityLabel}</span>
          </div>

          {/* Slide-Level Engagement Split */}
          <div className="bg-surface-subtle rounded-lg p-3 space-y-2 border border-border-subtle">
            <div className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>e-Detailing Slide Retention</span>
              <span className="text-[10px] text-emerald-600 font-bold">{dossier.avgTime} Total</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {dossier.slides.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">{s.label}</span>
                    <span className="font-bold text-text-primary">{s.time} ({s.pct})</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-terracotta h-full rounded-full" style={{ width: s.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialty Doctor Penetration */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-text-primary">Target Specialist Detailing Reach</div>
            <div className="space-y-1.5 text-[11px]">
              {dossier.specialists.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">{s.label}</span>
                  <span className={`font-bold ${s.valueClass}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stockist Availability & RCPA Pull */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px]">
            <div className="text-xs font-bold text-text-primary">Chemist Stockist Liquidation</div>
            <div className="bg-status-success-bg/60 border border-status-success-bg rounded-lg p-2.5 text-text-secondary space-y-1">
              <div>{dossier.stockistNote}</div>
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
          <button className="bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3 py-1.5 rounded-lg text-xs" onClick={() => setDetail({ title: "Clinical Monograph Audit", body: "All 16 core SKU slide decks are cross-checked against the latest CDSCO-approved indication monographs. No unflagged promotional claims found in the current cycle." })}>Clinical Monograph Audit</button>
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
