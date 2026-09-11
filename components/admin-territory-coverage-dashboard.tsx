import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminTerritoryCoverageDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      


    {/* TOP HEADER */}
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <span>Platform</span>
          <span>/</span>
          <span>Analytics Suite</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Territory Coverage & White Space Analysis</span>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none">
            <option>All Territories (Pan-India HQ)</option>
            <option>West Zone (Maharashtra & Gujarat)</option>
            <option>North Zone (Delhi NCR, UP, Punjab)</option>
            <option>South Zone (KA, TN, TS)</option>
            <option>East Zone (WB, Bihar, Odisha)</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2.5 top-2.5 text-[10px] text-slate-400 pointer-events-none"></i>
        </div>

        <div className="relative">
          <select className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none">
            <option>Q3 FY2026-27 (Sep 2026 Active)</option>
            <option>Q2 FY2026-27</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2.5 top-2.5 text-[10px] text-slate-400 pointer-events-none"></i>
        </div>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs">
          <i className="fa-solid fa-arrows-rotate"></i>
        </button>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs relative">
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Territory Coverage & Micro-Market Saturation</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 91.4% Coverage Achieved
            </span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <i className="fa-solid fa-triangle-exclamation mr-1 text-amber-600"></i> 14 Uncovered Micro-Beats
            </span>
          </div>
          <p className="text-xs text-slate-500">Real-time territorial audit tracking doctor reach density, chemist stockist coverage, patch saturation, and white-space opportunity zones.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition-colors">
            <i className="fa-solid fa-file-export text-slate-400"></i>
            <span>Export Territory Atlas (GIS)</span>
          </button>
          <button className="flex items-center gap-2 bg-terracotta bg-terracotta-hover text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors">
            <i className="fa-solid fa-map-pin"></i>
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
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>TERRITORY PENETRATION</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs"><i className="fa-solid fa-chart-line"></i></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">91.4%</span>
            <span className="text-[11px] font-bold text-emerald-600">+3.2% MoM</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active Beats: <strong>412 / 428</strong></span>
            <span className="text-emerald-700 font-semibold">Normal Saturation</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>HCP DENSITY / SQ KM</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs"><i className="fa-solid fa-user-doctor"></i></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">34.6</span>
            <span className="text-[11px] font-bold text-slate-500">Doctors/Beat</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total Listed HCPs: <strong>14,820</strong></span>
            <span className="text-blue-600 font-semibold">13,546 Covered</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>WHITE SPACE OPPORTUNITY</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs"><i className="fa-solid fa-compass-drafting"></i></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹ 86.4 L</span>
            <span className="text-[11px] font-bold text-amber-600">Unrealized MRR</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Unvisited Tier A+ HCPs: <strong>214</strong></span>
            <span className="text-amber-700 font-semibold">Immediate Priority</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>CHEMIST RCPA OVERLAP</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><i className="fa-solid fa-prescription-bottle-medical"></i></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">84.2%</span>
            <span className="text-[11px] font-bold text-purple-600">Stockist Tied</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Linked Chemists: <strong>2,840 / 3,370</strong></span>
            <span className="text-purple-700 font-semibold">Billing Verified</span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
        <button className="pb-2.5 border-b-2 border-terracotta text-terracotta flex items-center gap-2">
          <span>Territory & Beat Performance Roster</span>
          <span className="bg-terracotta/10 text-terracotta text-[10px] font-bold px-1.5 py-0.2 rounded-full">428 HQ Beats</span>
        </button>
        <button className="pb-2.5 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
          <span>Micro-Market White Space Explorer</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded-full">14 Zones</span>
        </button>
        <button className="pb-2.5 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
          <span>Doctor Density & Tier Heatmap</span>
        </button>
        <button className="pb-2.5 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
          <span>Chemist Stockist Tagging Ledger</span>
        </button>
      </div>

      {/* MAIN SPLIT WORKSPACE: TABLE (LEFT) & TERRITORY SLATE INSPECTOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Filter Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                <input type="text" placeholder="Search Territory, Beat Code, Assigned MR or ASM..." className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"/>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-medium">
                <option>All Zones (East, West, North, South)</option>
                <option>West Zone (Mumbai, Pune, Gujarat)</option>
                <option>North Zone (Delhi, Chandigarh, Lucknow)</option>
              </select>

              <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-medium">
                <option>All Saturation Levels</option>
                <option>High Saturation (&gt;90%)</option>
                <option>Moderate (75% - 90%)</option>
                <option>Under-Penetrated (&lt;75%)</option>
              </select>

              <button className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2 py-1.5 flex items-center gap-1">
                <i className="fa-solid fa-rotate-left text-[11px]"></i> Reset
              </button>
            </div>
          </div>

          {/* Table Header & Rows */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 w-6"><input type="checkbox" className="rounded border-slate-300 text-terracotta focus:ring-0"/></th>
                  <th className="py-3 px-3">TERRITORY & BEAT CODE</th>
                  <th className="py-3 px-3">SUPERVISING ASM / MR</th>
                  <th className="py-3 px-3">HCP UNIVERSE</th>
                  <th className="py-3 px-3">REACHED (SEP)</th>
                  <th className="py-3 px-3">COVERAGE %</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Row 1 (Selected) */}
                <tr className="bg-orange-50/40 hover:bg-orange-50/60 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">Mumbai Central — Dadar Hub</div>
                    <div className="text-[11px] text-slate-400 font-mono">BEAT-MH-MUM-01 • Metro Core</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">Rahul Sharma (Sr MR)</div>
                    <div className="text-[11px] text-slate-500">ASM: Rajesh Sharma</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">148 Doctors</td>
                  <td className="py-3.5 px-3 text-emerald-700 font-bold">142 Visited</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">95.9%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-terracotta font-semibold text-[11px] cursor-pointer hover:underline">Active Slate</span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-slate-300 text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">Delhi South — Connaught & AIIMS</div>
                    <div className="text-[11px] text-slate-400 font-mono">BEAT-DL-STH-04 • Institutional</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">Amit Duggal (MR)</div>
                    <div className="text-[11px] text-slate-500">ASM: Vikrant Verma</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">162 Doctors</td>
                  <td className="py-3.5 px-3 text-emerald-700 font-bold">148 Visited</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">91.4%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-slate-300 text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">Kolkata Central — Salt Lake & Medical</div>
                    <div className="text-[11px] text-slate-400 font-mono">BEAT-WB-KOL-02 • Urban Cluster</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">Subhashish Mitra (MR)</div>
                    <div className="text-[11px] text-slate-500">ASM: Debopriya Das</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">135 Doctors</td>
                  <td className="py-3.5 px-3 text-emerald-700 font-bold">126 Visited</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">93.3%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-slate-300 text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">Bengaluru South — Whitefield IT Belt</div>
                    <div className="text-[11px] text-slate-400 font-mono">BEAT-KA-BLR-06 • Expanding Zone</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">Sunita Kulkarni (MR)</div>
                    <div className="text-[11px] text-slate-500">ASM: Srinivas Murthy</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">154 Doctors</td>
                  <td className="py-3.5 px-3 text-amber-700 font-bold">108 Visited</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-600">70.1%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-rose-600 font-semibold text-[11px] cursor-pointer hover:underline">Lag Alert</span>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3.5"><input type="checkbox" className="rounded border-slate-300 text-terracotta focus:ring-0"/></td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">Chennai Central — T. Nagar Specialist Ring</div>
                    <div className="text-[11px] text-slate-400 font-mono">BEAT-TN-CHE-03 • Super-Specialty</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">Karthik Nathan (MR)</div>
                    <div className="text-[11px] text-slate-500">ASM: Balasubramanian</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">142 Doctors</td>
                  <td className="py-3.5 px-3 text-emerald-700 font-bold">136 Visited</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">95.7%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] cursor-pointer">Inspect</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong>5 of 428</strong> Registered Territory Beats</span>
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
              <button className="w-7 h-7 rounded bg-terracotta text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-7 h-7 rounded border border-slate-200 hover:bg-slate-50 font-medium text-xs flex items-center justify-center">2</button>
              <button className="w-7 h-7 rounded border border-slate-200 hover:bg-slate-50 font-medium text-xs flex items-center justify-center">3</button>
              <button className="w-7 h-7 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TERRITORY DOSSIER & WHITE-SPACE SLATE (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MICRO-MARKET DOSSIER</div>
              <div className="font-extrabold text-sm text-slate-900">#BEAT-MH-MUM-01</div>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Optimal Coverage</span>
          </div>

          {/* Beat Summary Block */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-200">
            <div className="text-xs font-bold text-slate-800">Mumbai Central — Dadar Hub</div>
            <div className="text-[11px] text-slate-500">Covers KEM Hospital, Tata Memorial Corridors, Hinduja Environs & Shivaji Park clinics.</div>
            <div className="text-[10px] font-medium text-slate-400 flex items-center gap-3 pt-1">
              <span><i className="fa-solid fa-user-tie text-slate-400 mr-1"></i> MR Rahul Sharma</span>
              <span><i className="fa-solid fa-user-shield text-slate-400 mr-1"></i> ASM Rajesh Sharma</span>
            </div>
          </div>

          {/* Tier-wise Saturation Breakdown */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Doctor Tier Reach Matrix</span>
              <span className="text-[10px] font-semibold text-slate-400">142 of 148 Reached</span>
            </div>

            {/* Tier A+ */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">Tier A+ KOLs (Super-Specialists)</span>
                <span className="font-bold text-slate-900">42 / 42 (100%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "100%" }}></div>
              </div>
            </div>

            {/* Tier A */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">Tier A High Prescribers (Consultants)</span>
                <span className="font-bold text-slate-900">68 / 70 (97.1%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "97.1%" }}></div>
              </div>
            </div>

            {/* Tier B */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">Tier B General Physicians (GPs)</span>
                <span className="font-bold text-slate-900">32 / 36 (88.9%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ "width": "88.9%" }}></div>
              </div>
            </div>
          </div>

          {/* Identified White-Space Opportunities */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>White Space Gap Detected</span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">6 Uncovered HCPs</span>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2.5 space-y-1 text-[11px] text-slate-600">
              <div className="font-semibold text-rose-800">4 New Cardiology Practitioners in Parel West</div>
              <div>Estimated monthly prescription value: <strong className="text-slate-900">₹ 2.40 Lakhs/mo</strong>. Recommend adding to Rahul Sharma's Friday beat roster.</div>
            </div>
          </div>

          {/* Chemist Availability Check */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-[11px] flex items-center justify-between">
            <span className="text-slate-600 font-medium">Mapped Retail Chemists:</span>
            <span className="font-bold text-slate-900">34 Stores (100% Stocked)</span>
          </div>

          {/* Immediate Actions */}
          <div className="pt-2 space-y-2">
            <button className="w-full bg-terracotta bg-terracotta-hover text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2">
              <i className="fa-solid fa-plus-circle"></i>
              <span>Assign White Space HCPs to MTP</span>
            </button>
            <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
              <i className="fa-solid fa-route"></i>
              <span>View Route & GPS Beat Optimization</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM COMPLIANCE & PROTOCOL BANNER */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-terracotta text-white flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-map-location-dot"></i>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Territory Rationalization Norms & Call Balancing</div>
            <div className="text-[11px] text-slate-600">Each medical representative beat must encompass between 135 to 160 core HCPs to maintain mandatory call frequency without exceeding statutory UCPMP visit caps.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs">Beat Rationalization SOP</button>
          <button className="bg-terracotta text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-terracotta-hover">Simulate Reallocation</button>
        </div>
      </div>
    </div>
  
    </div>
  );
}
