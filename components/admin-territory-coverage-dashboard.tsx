import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminTerritoryCoverageDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
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
          <select className="appearance-none bg-surface-subtle border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer focus:outline-none">
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

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs">
          <span className="material-symbols-outlined">{`sync`}</span>
        </button>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-subtle text-text-secondary text-xs relative">
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
          <button className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition-colors">
            <span className="material-symbols-outlined text-text-muted">{`file_download`}</span>
            <span>Export Territory Atlas (GIS)</span>
          </button>
          <button className="flex items-center gap-2 bg-terracotta bg-terracotta-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors">
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
        <button className="pb-2.5 border-b-2 border-terracotta text-terracotta flex items-center gap-2">
          <span>Territory & Beat Performance Roster</span>
          <span className="bg-terracotta/10 text-terracotta text-[10px] font-bold px-1.5 py-0.2 rounded-full">428 HQ Beats</span>
        </button>
        <button className="pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
          <span>Micro-Market White Space Explorer</span>
          <span className="bg-surface-subtle text-text-secondary text-[10px] font-bold px-1.5 py-0.2 rounded-full">14 Zones</span>
        </button>
        <button className="pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
          <span>Doctor Density & Tier Heatmap</span>
        </button>
        <button className="pb-2.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
          <span>Chemist Stockist Tagging Ledger</span>
        </button>
      </div>

      {/* MAIN SPLIT WORKSPACE: TABLE (LEFT) & TERRITORY SLATE INSPECTOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-surface-card border border-border-subtle rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Filter Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-xs">{`search`}</span>
                <input type="text" placeholder="Search Territory, Beat Code, Assigned MR or ASM..." className="w-full bg-surface-card border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-secondary placeholder-slate-400 focus:outline-none focus:border-slate-400"/>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium">
                <option>All Zones (East, West, North, South)</option>
                <option>West Zone (Mumbai, Pune, Gujarat)</option>
                <option>North Zone (Delhi, Chandigarh, Lucknow)</option>
              </select>

              <select className="bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-secondary font-medium">
                <option>All Saturation Levels</option>
                <option>High Saturation (&gt;90%)</option>
                <option>Moderate (75% - 90%)</option>
                <option>Under-Penetrated (&lt;75%)</option>
              </select>

              <button className="text-xs text-text-secondary hover:text-text-secondary font-semibold px-2 py-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">{`refresh`}</span> Reset
              </button>
            </div>
          </div>

          {/* Table Header & Rows */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
                <tr className="hover:bg-surface-subtle/50 transition-colors group">
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">TERRITORY & BEAT CODE</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">SUPERVISING ASM / MR</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">HCP UNIVERSE</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">REACHED (SEP)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">COVERAGE %</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {/* Row 1 (Selected) */}
                <tr className="bg-orange-50/40 hover:bg-orange-50/60 transition-colors hover:bg-surface-subtle/50 transition-colors group">
                  <td className="py-3.5 px-3.5 px-4 text-sm text-text-primary whitespace-nowrap"><input type="checkbox" defaultChecked className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-bold text-text-primary">Mumbai Central — Dadar Hub</div>
                    <div className="text-[11px] text-text-muted font-mono">BEAT-MH-MUM-01 • Metro Core</div>
                  </td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-semibold text-text-primary">Rahul Sharma (Sr MR)</div>
                    <div className="text-[11px] text-text-secondary">ASM: Rajesh Sharma</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">148 Doctors</td>
                  <td className="py-3.5 px-3 text-status-success font-bold px-4 text-sm text-text-primary whitespace-nowrap">142 Visited</td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-status-success">95.9%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
                    <span className="text-terracotta font-semibold text-[11px] cursor-pointer hover:underline">Active Slate</span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors hover:bg-surface-subtle/50 transition-colors group">
                  <td className="py-3.5 px-3.5 px-4 text-sm text-text-primary whitespace-nowrap"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-bold text-text-primary">Delhi South — Connaught & AIIMS</div>
                    <div className="text-[11px] text-text-muted font-mono">BEAT-DL-STH-04 • Institutional</div>
                  </td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-semibold text-text-primary">Amit Duggal (MR)</div>
                    <div className="text-[11px] text-text-secondary">ASM: Vikrant Verma</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">162 Doctors</td>
                  <td className="py-3.5 px-3 text-status-success font-bold px-4 text-sm text-text-primary whitespace-nowrap">148 Visited</td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-status-success">91.4%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
                    <span className="text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors hover:bg-surface-subtle/50 transition-colors group">
                  <td className="py-3.5 px-3.5 px-4 text-sm text-text-primary whitespace-nowrap"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-bold text-text-primary">Kolkata Central — Salt Lake & Medical</div>
                    <div className="text-[11px] text-text-muted font-mono">BEAT-WB-KOL-02 • Urban Cluster</div>
                  </td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-semibold text-text-primary">Subhashish Mitra (MR)</div>
                    <div className="text-[11px] text-text-secondary">ASM: Debopriya Das</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">135 Doctors</td>
                  <td className="py-3.5 px-3 text-status-success font-bold px-4 text-sm text-text-primary whitespace-nowrap">126 Visited</td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-status-success">93.3%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
                    <span className="text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors hover:bg-surface-subtle/50 transition-colors group">
                  <td className="py-3.5 px-3.5 px-4 text-sm text-text-primary whitespace-nowrap"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-bold text-text-primary">Bengaluru South — Whitefield IT Belt</div>
                    <div className="text-[11px] text-text-muted font-mono">BEAT-KA-BLR-06 • Expanding Zone</div>
                  </td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-semibold text-text-primary">Sunita Kulkarni (MR)</div>
                    <div className="text-[11px] text-text-secondary">ASM: Srinivas Murthy</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">154 Doctors</td>
                  <td className="py-3.5 px-3 text-status-warning font-bold px-4 text-sm text-text-primary whitespace-nowrap">108 Visited</td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-600">70.1%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
                    <span className="text-rose-600 font-semibold text-[11px] cursor-pointer hover:underline">Lag Alert</span>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-surface-subtle/70 transition-colors hover:bg-surface-subtle/50 transition-colors group">
                  <td className="py-3.5 px-3.5 px-4 text-sm text-text-primary whitespace-nowrap"><input type="checkbox" className="rounded border-border-subtle text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-bold text-text-primary">Chennai Central — T. Nagar Specialist Ring</div>
                    <div className="text-[11px] text-text-muted font-mono">BEAT-TN-CHE-03 • Super-Specialty</div>
                  </td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="font-semibold text-text-primary">Karthik Nathan (MR)</div>
                    <div className="text-[11px] text-text-secondary">ASM: Balasubramanian</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-text-primary px-4 text-sm whitespace-nowrap">142 Doctors</td>
                  <td className="py-3.5 px-3 text-status-success font-bold px-4 text-sm text-text-primary whitespace-nowrap">136 Visited</td>
                  <td className="py-3.5 px-3 px-4 text-sm text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-status-success">95.7%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right px-4 text-sm text-text-primary whitespace-nowrap">
                    <span className="text-text-secondary hover:text-text-primary font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-text-secondary">
            <span>Showing <strong>5 of 428</strong> Registered Territory Beats</span>
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-muted"><span className="material-symbols-outlined text-[10px]">{`chevron_left`}</span></button>
              <button className="w-7 h-7 rounded bg-terracotta text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle font-medium text-xs flex items-center justify-center">2</button>
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle font-medium text-xs flex items-center justify-center">3</button>
              <button className="w-7 h-7 rounded border border-border-subtle hover:bg-surface-subtle flex items-center justify-center text-text-secondary"><span className="material-symbols-outlined text-[10px]">{`chevron_right`}</span></button>
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
            <button className="w-full bg-terracotta bg-terracotta-hover text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">{`add_circle`}</span>
              <span>Assign White Space HCPs to MTP</span>
            </button>
            <button className="w-full bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">{`route`}</span>
              <span>View Route & GPS Beat Optimization</span>
            </button>
          </div>
        </div>
      </div>

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
          <button className="bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-secondary font-semibold px-3 py-1.5 rounded-lg text-xs">Beat Rationalization SOP</button>
          <button className="bg-terracotta text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-terracotta-hover">Simulate Reallocation</button>
        </div>
      </div>
    </div>
  
    </div>
  );
}
