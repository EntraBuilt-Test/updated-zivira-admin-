import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminComplianceDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      


    
    {/* TOP HEADER */}
    <header className="h-16 bg-surface-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-3 text-[16px] text-text-muted">search</span>
          <input type="text" placeholder="Search HCP, UCPMP logs, MR audit, gift declarations..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-[#b43403] text-text-primary placeholder-slate-400"/>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Territory Selector */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer">
            <option>All Territories (Pan-India HQ)</option>
            <option>West Zone (Mumbai, Pune, Guj)</option>
            <option>North Zone (Delhi NCR, Punjab)</option>
            <option>South Zone (Bengaluru, Chennai)</option>
            <option>East Zone (Kolkata, Bihar)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[14px] text-text-muted pointer-events-none">expand_more</span>
        </div>

        {/* Audit Period Selector */}
        <div className="relative">
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer">
            <option>Q3 FY2026-27 (Statutory Audit)</option>
            <option>Sep 2026 (Monthly Rollup)</option>
            <option>Aug 2026 (Archived)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-3 text-[14px] text-text-muted pointer-events-none">expand_more</span>
        </div>

        {/* Sync Icon */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle" title="Refresh Audit Stream">
          <span className="material-symbols-outlined text-[16px]">sync</span>
        </button>

        {/* Notification */}
        <button className="w-9 h-9 border border-border-subtle rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle relative" title="Alerts">
          <span className="material-symbols-outlined text-[16px]">notifications</span>
          <span className="w-2 h-2 bg-amber-500 rounded-full absolute top-2 right-2"></span>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-4 pl-2 border-l border-border-subtle">
          <div className="w-8 h-8 rounded-full bg-[#b43403] text-white font-bold flex items-center justify-center text-xs">
            AZ
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-text-primary leading-tight">Admin Zivira</p>
            <p className="text-[10px] text-text-secondary">Corporate HQ</p>
          </div>
        </div>
      </div>
    </header>

    {/* CONTENT BODY */}
    <div className="p-6 space-y-6">
      
      {/* BREADCRUMB & TITLE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 text-xs text-text-secondary mb-1">
            <span>Platform</span>
            <span>/</span>
            <span>Analytics Suite</span>
            <span>/</span>
            <span className="font-semibold text-text-primary">Compliance</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Pharma Regulatory Compliance &amp; UCPMP Audit</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success border border-status-success-bg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> UCPMP 2024 Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-warning-bg text-status-warning border border-status-warning-bg">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Filing Due: 15 Oct
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Monitor medical representative call frequencies, physician hospitality caps, sample inventory balances, and statutory MCI audit declarations.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-4.5">
          <button className="px-3.5 py-2 border border-border-subtle text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-subtle flex items-center gap-4 transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Statutory Audit (CSV/PDF)</span>
          </button>
          <button className="px-4 py-2 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-4 transition-colors">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Run UCPMP Integrity Check</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {/* KPI METRIC PULSE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Compliance Index */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Overall Compliance Score</p>
              <div className="flex items-baseline gap-4 mt-1">
                <h3 className="text-2xl font-black text-text-primary">98.6%</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded">+0.4% MoM</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-success-bg text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Audit Standard: <strong>MCI &amp; UCPMP</strong></span>
            <span className="font-bold text-emerald-600">Zero Critical</span>
          </div>
        </div>

        {/* Metric 2: Visit Frequency Violations */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Visit Frequency Deviations</p>
              <div className="flex items-baseline gap-4 mt-1">
                <h3 className="text-2xl font-black text-text-primary">12</h3>
                <span className="text-[11px] font-medium text-text-secondary">of 14,820 HCPs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-warning-bg text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Cap: <strong>&le; 2 visits/month</strong></span>
            <span className="font-semibold text-amber-600">Action Pending (5)</span>
          </div>
        </div>

        {/* Metric 3: Sample Tracking & Batch Audits */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Sample Custody Reconciliation</p>
              <div className="flex items-baseline gap-4 mt-1">
                <h3 className="text-2xl font-black text-text-primary">99.4%</h3>
                <span className="text-[11px] font-bold text-emerald-600">Reconciled</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-info-bg text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">medication</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>SKU Batches: <strong>48,290 Pks</strong></span>
            <span className="font-semibold text-blue-600">Batch Verified</span>
          </div>
        </div>

        {/* Metric 4: Gifts & Hospitality Capping */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Hospitality &amp; Gifting Cap</p>
              <div className="flex items-baseline gap-4 mt-1">
                <h3 className="text-2xl font-black text-text-primary">&le; ₹1,000</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-status-success-bg px-1.5 py-0.5 rounded">100% Bound</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Declarations: <strong>68 Verified</strong></span>
            <span className="font-semibold text-text-secondary">0 Over-Cap Flags</span>
          </div>
        </div>

      </div>

      {/* WORKFLOW SUB-TABS */}
      <div className="flex items-center gap-6 border-b border-border-subtle text-xs font-semibold">
        <button className="pb-3 border-b-2 border-[#b43403] text-[#b43403] flex items-center gap-4">
          <span className="material-symbols-outlined">assignment_turned_in</span>
          <span>UCPMP Exception Roster (12)</span>
        </button>
        <button className="pb-3 text-text-secondary hover:text-text-primary border-b-2 border-transparent flex items-center gap-4 transition-colors">
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Physician Sample Dispensation Audit</span>
          <span className="px-1.5 py-0.2 text-[10px] bg-surface-subtle text-text-secondary rounded">Pan-India</span>
        </button>
        <button className="pb-3 text-text-secondary hover:text-text-primary border-b-2 border-transparent flex items-center gap-4 transition-colors">
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span>Field Force Code of Conduct Declarations</span>
          <span className="px-1.5 py-0.2 text-[10px] bg-status-success-bg text-status-success rounded font-bold">428/428</span>
        </button>
        <button className="pb-3 text-text-secondary hover:text-text-primary border-b-2 border-transparent flex items-center gap-4 transition-colors">
          <span className="material-symbols-outlined">balance</span>
          <span>Statutory Audit Logs &amp; MCI Registry Sync</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-4.5 flex-1">
          {/* Text search */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-text-muted">search</span>
            <input type="text" placeholder="Filter by Doctor, MR, Territory, Clause ID..." className="w-full bg-surface-subtle border border-border-subtle text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#b43403] text-text-secondary placeholder-slate-400"/>
          </div>

          {/* Zone filter */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]">
            <option>All Zones (East, West, North, South)</option>
            <option>West Zone (Mumbai &amp; Pune)</option>
            <option>North Zone (Delhi NCR)</option>
            <option>South Zone (Bengaluru)</option>
            <option>East Zone (Kolkata)</option>
          </select>

          {/* Violation Type */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]">
            <option>All Violation Categories</option>
            <option>Excess Call Frequency (&gt;2/mo)</option>
            <option>Unsigned Sample Receipt</option>
            <option>Gift/Hospitality Over-Declaration</option>
            <option>Unplanned Beat Visit</option>
          </select>

          {/* Severity Status */}
          <select className="bg-surface-subtle border border-border-subtle text-xs font-medium text-text-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]">
            <option>All Statuses (Pending, Cleared, Escalated)</option>
            <option>Pending Manager Explanation</option>
            <option>Compliance Clarified</option>
            <option>Escalated to ZSM</option>
          </select>
        </div>

        {/* Reset & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary font-medium">Showing <strong>5 of 12</strong> Exceptions</span>
          <button className="text-xs text-text-secondary hover:text-text-primary font-semibold flex items-center gap-1 p-1">
            <span className="material-symbols-outlined text-[11px]">undo</span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* MAIN COMPLIANCE ROSTER & SIDE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Detailed Exception Table */}
        <div className="lg:col-span-2 bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b43403]"></span>
              <h3 className="font-bold text-sm text-text-primary">UCPMP Audit Exceptions &amp; Resolution Queue</h3>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-xs font-medium text-[#b43403] hover:underline">Select All 12</button>
              <button className="px-2.5 py-1 bg-surface-subtle hover:bg-slate-200 text-text-secondary text-xs font-semibold rounded transition-colors">
                Bulk Issue Notice
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-center text-xs">
              <thead className="bg-surface-subtle border-b border-border-subtle text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></th>
                  <th className="py-3 px-4">Doctor &amp; Specialization</th>
                  <th className="py-3 px-4">Field Rep &amp; Territory</th>
                  <th className="py-3 px-4">Clause / Violation</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-text-secondary">
                
                {/* Row 1 (Selected) */}
                <tr className="bg-status-warning-bg/40 hover:bg-status-warning-bg/70 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" defaultChecked className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text-primary">Dr. Rajesh V. Merchant</div>
                    <div className="text-[11px] text-text-secondary">Cardiology &bull; Breach Candy Hospital, MH</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-surface-subtle text-text-secondary rounded text-[10px] font-semibold">Tier A+ HCP</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-text-primary">Rahul Sharma</div>
                    <div className="text-[11px] text-text-secondary">MR-1049 &bull; Mumbai Metro</div>
                    <div className="text-[10px] text-text-muted">ASM: Rajesh Sharma</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-rose-700">Call Cap Exceeded</div>
                    <div className="text-[11px] text-text-secondary">UCPMP Cl. 7.2 (Max 2/mo)</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                      3 Visits
                    </span>
                    <div className="text-[10px] text-text-muted mt-0.5">Sep Target: 2</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                      Pending ASM Note
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-[#b43403] hover:text-[#9a3412] font-semibold text-xs inline-flex items-center gap-1">
                      <span>Audit</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-surface-subtle/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text-primary">Dr. Arvind Sen</div>
                    <div className="text-[11px] text-text-secondary">Pulmonology &bull; Fortis Escorts, Delhi</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-surface-subtle text-text-secondary rounded text-[10px] font-semibold">Tier A HCP</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-text-primary">Amit Duggal</div>
                    <div className="text-[11px] text-text-secondary">MR-0842 &bull; Delhi South</div>
                    <div className="text-[10px] text-text-muted">ASM: Vikrant Verma</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-status-warning">Missing Sample Acknowledgement</div>
                    <div className="text-[11px] text-text-secondary">Resp-Clear Inhaler (2 Pks)</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-subtle text-text-secondary">
                      2 Visits
                    </span>
                    <div className="text-[10px] text-text-muted mt-0.5">Within Limit</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                      OTP Pending
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-text-secondary hover:text-text-primary font-semibold text-xs inline-flex items-center gap-1">
                      <span>Audit</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-surface-subtle/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text-primary">Dr. Sunita K. Nambiar</div>
                    <div className="text-[11px] text-text-secondary">Endocrinology &bull; Apex Diabetes, BLR</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-surface-subtle text-text-secondary rounded text-[10px] font-semibold">Tier A+ HCP</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-text-primary">Sunita Kulkarni</div>
                    <div className="text-[11px] text-text-secondary">MR-0994 &bull; Bengaluru Central</div>
                    <div className="text-[10px] text-text-muted">ASM: Srinivas Murthy</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-rose-700">MTP Route Deviation</div>
                    <div className="text-[11px] text-text-secondary">Unapproved Visit in DCR</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                      3 Visits
                    </span>
                    <div className="text-[10px] text-text-muted mt-0.5">Off-Beat Call</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                      Escalated ZSM
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-text-secondary hover:text-text-primary font-semibold text-xs inline-flex items-center gap-1">
                      <span>Audit</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-surface-subtle/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text-primary">Dr. Pradip Roy</div>
                    <div className="text-[11px] text-text-secondary">Pediatrics &bull; Shishu Seva Sadan, Kolkata</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-surface-subtle text-text-secondary rounded text-[10px] font-semibold">Tier A HCP</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-text-primary">Subhashish Mitra</div>
                    <div className="text-[11px] text-text-secondary">MR-1120 &bull; Kolkata Central</div>
                    <div className="text-[10px] text-text-muted">ASM: Debopriya Das</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-text-secondary">CME Sponsorship Log</div>
                    <div className="text-[11px] text-text-secondary">Academic Registration Fee</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-subtle text-text-secondary">
                      1 Visit
                    </span>
                    <div className="text-[10px] text-text-muted mt-0.5">Compliant</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Verified Approved
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-text-secondary hover:text-text-primary font-semibold text-xs inline-flex items-center gap-1">
                      <span>Audit</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-surface-subtle/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text-primary">Dr. Meenakshi Sundaram</div>
                    <div className="text-[11px] text-text-secondary">Neurology &bull; Apollo Specialty, Chennai</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-surface-subtle text-text-secondary rounded text-[10px] font-semibold">Tier A+ HCP</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-text-primary">Karthik Nathan</div>
                    <div className="text-[11px] text-text-secondary">MR-1205 &bull; Chennai Central</div>
                    <div className="text-[10px] text-text-muted">ASM: Balasubramanian</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-status-warning">Batch Expiry Log Warning</div>
                    <div className="text-[11px] text-text-secondary">CardioCare 20 Batch #CC-902</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-subtle text-text-secondary">
                      2 Visits
                    </span>
                    <div className="text-[10px] text-text-muted mt-0.5">Within Limit</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-subtle text-text-secondary">
                      Batch Quarantined
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-text-secondary hover:text-text-primary font-semibold text-xs inline-flex items-center gap-1">
                      <span>Audit</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-3 border-t border-border-subtle flex items-center justify-between bg-surface-subtle text-xs">
            <span className="text-text-secondary">1 Item Selected &bull; Total 12 Violations</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface-card disabled:opacity-40" disabled={true}>
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              </button>
              <button className="w-7 h-7 flex items-center justify-center bg-[#b43403] text-white rounded font-bold">1</button>
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-secondary hover:bg-surface-card font-medium">2</button>
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-secondary hover:bg-surface-card font-medium">3</button>
              <button className="w-7 h-7 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface-card">
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Violation Audit & Regulatory Inspector */}
        <div className="space-y-4">
          
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#b43403]">AUDIT CASE #UCPMP-2026-089</span>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-full border border-rose-200">
                Action Required
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Target Healthcare Practitioner</p>
                <p className="font-bold text-text-primary mt-0.5">Dr. Rajesh V. Merchant</p>
                <p className="text-text-secondary text-[11px]">Senior Cardiologist, Breach Candy Hospital (Mumbai)</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface-subtle p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-text-muted block">Assigned MR</span>
                  <span className="font-bold text-text-primary">Rahul Sharma</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Territory Code</span>
                  <span className="font-bold text-text-primary">MH-MUM-01</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Cycle Visits Logged</span>
                  <span className="font-bold text-rose-600">3 Calls (Cap: 2)</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Last Visit Date</span>
                  <span className="font-bold text-text-primary">22 Sep 2026</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Statutory Clause Trigger</p>
                <div className="bg-status-warning-bg/60 border border-status-warning-bg p-2 rounded text-[11px] text-amber-900 mt-1">
                  <strong>Clause 7.2 (Uniform Code for Pharma Marketing Practices):</strong> Doctor engagement exceeding 2 monthly visits requires scientific medical justification or clinical trial sponsorship protocols.
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Submitted Explanation (ASM Rajesh Sharma)</p>
                <p className="text-[11px] text-text-secondary italic mt-0.5 bg-surface-subtle p-2 rounded border border-border-subtle">
                  "Third visit was an urgent scientific monograph delivery regarding CardioCare 20mg post-infarction trial requested specifically by the doctor."
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button className="w-full py-2 bg-[#b43403] hover:bg-[#9a3412] text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-4">
                  <span className="material-symbols-outlined">verified</span>
                  <span>Approve Exception &amp; Archive Log</span>
                </button>
                <button className="w-full py-2 border border-border-subtle text-text-secondary font-semibold rounded-lg text-xs hover:bg-surface-subtle flex items-center justify-center gap-4">
                  <span className="material-symbols-outlined text-rose-500">block</span>
                  <span>Flag as Non-Compliant &amp; Deduct TA/DA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Legal & Compliance Declaration Status */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-4">
              <span className="material-symbols-outlined text-emerald-600">contract</span>
              <span>Statutory Filing Readiness (CBDT &amp; MCI)</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">UCPMP Mandatory Audit Committee:</span>
                <span className="font-bold text-emerald-600">Constituted &amp; Quorum Met</span>
              </div>
              <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "100%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Field Sample Handover Vouchers:</span>
                <span className="font-bold text-text-primary">99.4% (48,020 / 48,290)</span>
              </div>
              <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ "width": "99.4%" }}></div>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary pt-1">
              Next quarterly CBDT section 194R tax deduction return on medical representative promotion is scheduled for <strong>31 October 2026</strong>.
            </p>
          </div>

        </div>

      </div>

      {/* COMPLIANCE DIRECTIVE BANNER */}
      <div className="p-4 bg-status-warning-bg/50 border border-status-warning-bg rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#b43403] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">gpp_good</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">UCPMP 2024 &amp; DoP Guidelines Compliance Protocol</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              All gifts, travel tickets, paid accommodations, and cash grants to healthcare practitioners are strictly prohibited. Free samples are capped at a maximum of 12 packs per doctor per year.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button className="px-3 py-1.5 border border-border-subtle bg-surface-card text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-subtle">
            Audit Manual
          </button>
          <button className="px-3 py-1.5 bg-[#b43403] text-white text-xs font-semibold rounded-lg hover:bg-[#9a3412]">
            View DoP Circular
          </button>
        </div>
      </div>

    </div>

  
    </div>
  );
}
