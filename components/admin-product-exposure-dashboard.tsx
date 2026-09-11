import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminProductExposureDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
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
          <select className="appearance-none bg-surface-subtle border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer focus:outline-none">
            <option>All Therapeutic Divisions (Cardio, Diab, Ortho)</option>
            <option>Cardio-Diabetic Division</option>
            <option>Respiratory & Pulmo Care</option>
            <option>Orthopedic & Pain Management</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2.5 top-2.5 text-[10px] text-text-muted pointer-events-none"></i>
        </div>

        <div className="relative">
          <select className="appearance-none bg-surface-subtle border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer focus:outline-none">
            <option>Cycle: Sep 2026 (Active Detailing)</option>
            <option>Cycle: Aug 2026</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2.5 top-2.5 text-[10px] text-text-muted pointer-events-none"></i>
        </div>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs">
          <i className="fa-solid fa-arrows-rotate"></i>
        </button>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs relative">
          <i className="fa-regular fa-bell"></i>
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
          <button className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition-colors">
            <i className="fa-solid fa-download text-text-muted"></i>
            <span>Export Brand SOV Report (XLS)</span>
          </button>
          <button className="flex items-center gap-2 bg-terracotta bg-terracotta-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors">
            <i className="fa-solid fa-sliders"></i>
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
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-terracotta flex items-center justify-center text-xs"><i className="fa-solid fa-tablet-screen-button"></i></div>
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
            <div className="w-7 h-7 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center text-xs"><i className="fa-solid fa-stopwatch"></i></div>
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
            <div className="w-7 h-7 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center text-xs"><i className="fa-solid fa-chart-pie"></i></div>
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
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><i className="fa-solid fa-prescription"></i></div>
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
        <button className="pb-2.5 border-b-2 border-terracotta text-terracotta flex items-center gap-2">
          <span>Brand Exposure Matrix & Roster</span>
          <span className="bg-terracotta/10 text-terracotta text-[10px] font-bold px-1.5 py-0.2 rounded-full">16 Core SKUs</span>
        </button>
        <button className="pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
          <span>Interactive Visual Aid (e-Detailing) Duration Logs</span>
        </button>
        <button className="pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
          <span>Therapeutic Segment Share-of-Voice (SOV)</span>
        </button>
        <button className="pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
          <span>Doctor Brand Recall & Feedback Ledger</span>
        </button>
      </div>

      {/* MAIN SPLIT WORKSPACE: TABLE (LEFT) & BRAND DOSSIER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-surface-card border border-border-subtle rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Filter Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-text-muted text-xs"></i>
                <input type="text" placeholder="Search Brand, Molecule, Therapeutic Category or SKU..." className="w-full bg-surface-card border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-secondary placeholder-slate-400 focus:outline-none focus:border-slate-400"/>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium">
                <option>All Segments (Cardio, Diab, Ortho, Pulmo)</option>
                <option>Cardio-Vascular</option>
                <option>Diabetology</option>
                <option>Respiratory</option>
              </select>

              <select className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium">
                <option>All Priority Levels (P1, P2, P3)</option>
                <option>Priority 1 (Strategic Focus)</option>
                <option>Priority 2 (Core Maintenance)</option>
              </select>

              <button className="text-xs text-text-secondary hover:text-text-secondary font-semibold px-2 py-1.5 flex items-center gap-1">
                <i className="fa-solid fa-rotate-left text-[11px]"></i> Reset
              </button>
            </div>
          </div>

          {/* Table Header & Rows */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted text-[10px] font-bold uppercase tracking-wider border-b border-border-subtle">
                <tr>
                  <th className="py-3 px-3.5 w-6"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></th>
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
                {/* Row 1 (Selected) */}
                <tr className="bg-orange-50/40 hover:bg-orange-50/60 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" defaultChecked className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-text-primary">CardioCare 20mg</div>
                    <div className="text-[11px] text-text-muted font-mono">Atorvastatin + Aspirin • Tab</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">Cardiology</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-terracotta text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs">P1 Core</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-text-primary">3,420 Calls</td>
                  <td className="py-3.5 px-3 font-semibold text-text-secondary">1m 18s</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">+28.4%</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-terracotta font-semibold text-[11px] cursor-pointer hover:underline">Active Dossier</span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-text-primary">GlycoZiv XR 500</div>
                    <div className="text-[11px] text-text-muted font-mono">Metformin SR + Dapagliflozin</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-status-info-bg text-status-info border border-status-info-bg text-[10px] font-bold px-2 py-0.5 rounded">Diabetology</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-terracotta text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs">P1 Core</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-text-primary">2,890 Calls</td>
                  <td className="py-3.5 px-3 font-semibold text-text-secondary">1m 04s</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">+22.1%</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-text-primary">Resp-Clear Inhaler 200mcg</div>
                    <div className="text-[11px] text-text-muted font-mono">Budesonide + Formoterol DPI</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-status-success-bg text-status-success border border-status-success-bg text-[10px] font-bold px-2 py-0.5 rounded">Pulmonology</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-surface-subtle text-text-secondary font-bold text-[10px] px-2 py-0.5 rounded">P2 Focus</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-text-primary">2,140 Calls</td>
                  <td className="py-3.5 px-3 font-semibold text-text-secondary">48s</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">+16.5%</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-text-primary">ZiviCal D3 Forte</div>
                    <div className="text-[11px] text-text-muted font-mono">Cholecalciferol 60,000 IU Softgel</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-status-warning-bg text-status-warning border border-status-warning-bg text-[10px] font-bold px-2 py-0.5 rounded">Orthopedics</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-surface-subtle text-text-secondary font-bold text-[10px] px-2 py-0.5 rounded">P2 Focus</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-text-primary">1,980 Calls</td>
                  <td className="py-3.5 px-3 font-semibold text-text-secondary">42s</td>
                  <td className="py-3.5 px-3 font-bold text-text-secondary">+8.2%</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-text-primary">GastroZiv DSR</div>
                    <div className="text-[11px] text-text-muted font-mono">Rabeprazole 20mg + Domperidone 30mg</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">Gastroenterology</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-surface-subtle text-text-secondary font-bold text-[10px] px-2 py-0.5 rounded border border-border-subtle">P3 Routine</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-text-primary">1,240 Calls</td>
                  <td className="py-3.5 px-3 font-semibold text-text-secondary">32s</td>
                  <td className="py-3.5 px-3 font-bold text-text-secondary">+4.1%</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-text-secondary">
            <span>Showing <strong>5 of 16</strong> Active Commercial SKUs</span>
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-muted"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
              <button className="w-7 h-7 rounded bg-terracotta text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle font-medium text-xs flex items-center justify-center">2</button>
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle font-medium text-xs flex items-center justify-center">3</button>
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-secondary"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BRAND ENGAGEMENT DOSSIER (4 COLS) */}
        <div className="lg:col-span-4 bg-surface-card border border-border-subtle rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">STRATEGIC BRAND DOSSIER</div>
              <div className="font-extrabold text-sm text-text-primary">CardioCare 20mg</div>
            </div>
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Top Detailing Asset</span>
          </div>

          {/* Slide-Level Engagement Split */}
          <div className="bg-surface-subtle rounded-lg p-3 space-y-2 border border-border-subtle">
            <div className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>e-Detailing Slide Retention</span>
              <span className="text-[10px] text-emerald-600 font-bold">1m 18s Total</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Slide 1: Clinical Efficacy & Lipid Lowering</span>
                <span className="font-bold text-text-primary">42s (54%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-terracotta h-full rounded-full" style={{ "width": "54%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Slide 2: Dual Action Safety Profile</span>
                <span className="font-bold text-text-primary">24s (31%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-terracotta h-full rounded-full" style={{ "width": "31%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Slide 3: Dosage & Bioequivalence Data</span>
                <span className="font-bold text-text-primary">12s (15%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-terracotta h-full rounded-full" style={{ "width": "15%" }}></div>
              </div>
            </div>
          </div>

          {/* Specialty Doctor Penetration */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-text-primary">Target Specialist Detailing Reach</div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-medium">Interventional Cardiologists</span>
                <span className="font-bold text-status-success">1,480 / 1,520 (97.4%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-medium">Consulting Physicians (MD Med)</span>
                <span className="font-bold text-status-success">1,240 / 1,350 (91.8%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-medium">Diabetologists & Endos</span>
                <span className="font-bold text-status-warning">700 / 920 (76.1%)</span>
              </div>
            </div>
          </div>

          {/* Stockist Availability & RCPA Pull */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px]">
            <div className="text-xs font-bold text-text-primary">Chemist Stockist Liquidation</div>
            <div className="bg-status-success-bg/60 border border-status-success-bg rounded-lg p-2.5 text-text-secondary space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Stockist Availability Index:</span>
                <span className="text-emerald-800 font-bold">96.8% Stocked</span>
              </div>
              <div>Secondary Sales Velocity: <strong className="text-text-primary">₹ 42.8 Lakhs / mo</strong> (+18.2% vs target). Zero stock-outs reported across 28 Depots.</div>
            </div>
          </div>

          {/* Immediate Actions */}
          <div className="pt-2 space-y-2">
            <button className="w-full bg-terracotta bg-terracotta-hover text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Push Updated VA Slide Deck to Field Reps</span>
            </button>
            <button className="w-full bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
              <i className="fa-solid fa-flask-vial"></i>
              <span>Correlate with Sample Dispensation</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM PROTOCOL & REGULATORY COMPLIANCE BANNER */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-terracotta text-white flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-laptop-medical"></i>
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary">UCPMP Standard • Medical Detailing & Scientific Justification</div>
            <div className="text-[11px] text-text-secondary">All visual aid detailing slides must feature approved Indian Drug Regulatory monograph numbers and approved indication literature. Promotional claims without clinical trial citations are automatically flagged.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3 py-1.5 rounded-lg text-xs">Clinical Monograph Audit</button>
          <button className="bg-terracotta text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-terracotta-hover">Regulatory VA Log</button>
        </div>
      </div>
    </div>
  
    </div>
  );
}
