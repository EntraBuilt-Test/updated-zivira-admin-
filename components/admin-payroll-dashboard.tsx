import Link from "next/link";
import { AdminTabGrid } from "./admin-tab-grid";
import type { ZiviraTreeNode } from "@zivira/types";

export function AdminPayrollDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      


    
    {/* TOP HEADER */}
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-xs text-slate-400"></i>
          <input type="text" placeholder="Search MR name, employee code, TA/DA claims, station bills..." className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-[#b43403] text-slate-800 placeholder-slate-400"/>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Territory Selector */}
        <div className="relative">
          <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer">
            <option>All Divisions (Pan-India HQ)</option>
            <option>Cardio-Diabetic Division</option>
            <option>Respiratory Care Division</option>
            <option>Pediatric &amp; Ortho Division</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2.5 top-3 text-[10px] text-slate-400 pointer-events-none"></i>
        </div>

        {/* Payroll Month Picker */}
        <div className="relative">
          <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b43403] appearance-none cursor-pointer">
            <option>September 2026 (Active Cycle)</option>
            <option>August 2026 (Processed)</option>
            <option>July 2026 (Audited)</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2.5 top-3 text-[10px] text-slate-400 pointer-events-none"></i>
        </div>

        {/* Refresh Button */}
        <button className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50" title="Sync Expense Ledgers">
          <i className="fa-solid fa-arrows-rotate text-xs"></i>
        </button>

        {/* Alerts */}
        <button className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 relative" title="Notifications">
          <i className="fa-regular fa-bell text-xs"></i>
          <span className="w-2 h-2 bg-[#b43403] rounded-full absolute top-2 right-2"></span>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#b43403] text-white font-bold flex items-center justify-center text-xs">
            AZ
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Admin Zivira</p>
            <p className="text-[10px] text-slate-500">Corporate HQ</p>
          </div>
        </div>
      </div>
    </header>

    {/* CONTENT BODY */}
    <div className="p-6 space-y-6">
      
      {/* BREADCRUMB & TITLE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Platform</span>
            <span>/</span>
            <span>Analytics Suite</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Payroll &amp; Field Allowances</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Field Force Payroll, TA/DA &amp; Expense Engine</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Cycle: Sep 2026
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <i className="fa-regular fa-building-bank text-[10px]"></i> Bank Cutoff: 01 Oct
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile daily DCR call allowances, HQ/Ex/Outstation travel fare meters, manager joint-work claims, and one-click salary disbursement.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <i className="fa-regular fa-file-excel text-xs"></i>
            <span>Export Bank NEFT Batch</span>
          </button>
          <button className="px-4 py-2 bg-[#b43403] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors">
            <i className="fa-regular fa-money-check-dollar-pen text-xs"></i>
            <span>Run Final Payroll Lock &amp; Disburse</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-4 mb-6">
        <AdminTabGrid node={node} path={path} />
      </div>

      {/* KPI METRIC PULSE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Net Payroll */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Field Gross Payout</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900">₹1.84 Cr</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+4.2% MoM</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-wallet text-lg"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>428 Roster Reps: <strong>₹1.52 Cr Base</strong></span>
            <span className="font-bold text-slate-700">₹32.4 L TA/DA</span>
          </div>
        </div>

        {/* Metric 2: Daily Allowance (TA/DA) Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reconciled Travel (TA/DA)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900">₹32,48,600</h3>
                <span className="text-[11px] font-medium text-slate-500">GPS Verified</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-route text-lg"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total Beat KM: <strong>1,42,800 km</strong></span>
            <span className="font-semibold text-emerald-600">96.8% Validated</span>
          </div>
        </div>

        {/* Metric 3: Expense Discrepancies & Flags */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit Claim Deviations</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900">14</h3>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">₹48,250 Hold</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="fa-solid fa-receipt text-lg"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Disputed Kilometrage: <strong>8 Reps</strong></span>
            <span className="font-semibold text-amber-600">Under Review</span>
          </div>
        </div>

        {/* Metric 4: ASM / Manager Endorsements */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Manager Expense Sign-Off</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900">97.4%</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">417 / 428 Reps</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#b43403]/10 text-[#b43403] flex items-center justify-center">
              <i className="fa-solid fa-user-check text-lg"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pending ASM Clearance: <strong>11 Claims</strong></span>
            <span className="font-semibold text-slate-700">Auto-Pinged</span>
          </div>
        </div>

      </div>

      {/* PAYROLL SUB-TABS */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
        <button className="pb-3 border-b-2 border-[#b43403] text-[#b43403] flex items-center gap-2">
          <i className="fa-regular fa-table-list"></i>
          <span>Field Staff Salary &amp; Allowance Roll (428)</span>
        </button>
        <button className="pb-3 text-slate-500 hover:text-slate-800 border-b-2 border-transparent flex items-center gap-2 transition-colors">
          <i className="fa-regular fa-gas-pump"></i>
          <span>Kilometre Fare &amp; DA Tier Matrix</span>
          <span className="px-1.5 py-0.2 text-[10px] bg-slate-100 text-slate-600 rounded">Pan-India Rates</span>
        </button>
        <button className="pb-3 text-slate-500 hover:text-slate-800 border-b-2 border-transparent flex items-center gap-2 transition-colors">
          <i className="fa-regular fa-hotel"></i>
          <span>Outstation Lodge &amp; Boarding Ledger</span>
          <span className="px-1.5 py-0.2 text-[10px] bg-amber-50 text-amber-700 rounded font-bold">14 Claims</span>
        </button>
        <button className="pb-3 text-slate-500 hover:text-slate-800 border-b-2 border-transparent flex items-center gap-2 transition-colors">
          <i className="fa-regular fa-landmark"></i>
          <span>Statutory Tax &amp; TDS Section 192/194R Declarations</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Text search */}
          <div className="relative min-w-[240px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-400"></i>
            <input type="text" placeholder="Search by Rep Name, Emp ID, Territory, Grade..." className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#b43403] text-slate-700 placeholder-slate-400"/>
          </div>

          {/* Zone filter */}
          <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]">
            <option>All Territories (Pan-India)</option>
            <option>West Zone (Mumbai, Pune)</option>
            <option>North Zone (Delhi NCR)</option>
            <option>South Zone (Bengaluru)</option>
            <option>East Zone (Kolkata)</option>
          </select>

          {/* Designation Grade */}
          <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]">
            <option>All Designations (MR, Senior MR, ASM)</option>
            <option>Medical Representative (MR)</option>
            <option>Senior Executive (SR MR)</option>
            <option>Area Sales Manager (ASM)</option>
          </select>

          {/* Disbursal Status */}
          <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b43403]">
            <option>All Disbursal Statuses</option>
            <option>Passed for Bank Payment</option>
            <option>Pending ASM Sign-off</option>
            <option>TA/DA Dispute Hold</option>
          </select>
        </div>

        {/* Reset & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Showing <strong>5 of 428</strong> Staff</span>
          <button className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 p-1">
            <i className="fa-regular fa-arrow-rotate-left text-[11px]"></i>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* MAIN PAYROLL ROSTER & SALARY BREAKDOWN INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Comprehensive Payroll Roster Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b43403]"></span>
              <h3 className="font-bold text-sm text-slate-900">September 2026 Salary &amp; Expense Reconciliation Roster</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-[#b43403] hover:underline">Select All 428</button>
              <button className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors">
                Bulk Approve Allowances
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></th>
                  <th className="py-3 px-4">Field Employee &amp; HQ</th>
                  <th className="py-3 px-4">Work Days / DCRs</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4">TA/DA Claimed</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                
                {/* Row 1 (Selected) */}
                <tr className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" defaultChecked className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">Rahul Sharma</div>
                    <div className="text-[11px] text-slate-500">EMP-1049 &bull; Mumbai Metro (HQ)</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">Senior MR</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">22 / 22 Days</div>
                    <div className="text-[11px] text-emerald-600 font-medium">100% DCR Logged</div>
                    <div className="text-[10px] text-slate-400">16 HQ &bull; 6 Ex-Stn</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">₹36,000</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">₹14,850</div>
                    <div className="text-[10px] text-slate-400">GPS: 1,420 km</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#b43403] text-sm">
                    ₹50,850
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Approved
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-[#b43403] hover:text-[#9a3412] font-semibold text-xs inline-flex items-center gap-1">
                      <span>Payslip</span> <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">Amit Duggal</div>
                    <div className="text-[11px] text-slate-500">EMP-0842 &bull; Delhi South</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">MR</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">21 / 22 Days</div>
                    <div className="text-[11px] text-slate-500">1 Day Leave Approved</div>
                    <div className="text-[10px] text-slate-400">14 HQ &bull; 7 Outstation</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">₹32,500</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">₹18,200</div>
                    <div className="text-[10px] text-slate-400">Night Halt: 2 Days</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    ₹50,700
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                      ASM Verified
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1">
                      <span>Payslip</span> <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">Subhashish Mitra</div>
                    <div className="text-[11px] text-slate-500">EMP-1120 &bull; Kolkata Central</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">Executive MR</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">23 / 22 Days</div>
                    <div className="text-[11px] text-indigo-600 font-medium">+1 Sun Camp Day</div>
                    <div className="text-[10px] text-slate-400">18 HQ &bull; 5 Ex-Stn</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">₹38,000</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">₹16,400</div>
                    <div className="text-[10px] text-slate-400">Fare: ₹8,200</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    ₹54,400
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Approved
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1">
                      <span>Payslip</span> <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">Sunita Kulkarni</div>
                    <div className="text-[11px] text-slate-500">EMP-0994 &bull; Bengaluru Central</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">MR</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">20 / 22 Days</div>
                    <div className="text-[11px] text-amber-600 font-medium">2 Days Late DCR</div>
                    <div className="text-[10px] text-slate-400">12 HQ &bull; 8 Outstation</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">₹31,000</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-rose-600">₹19,800</div>
                    <div className="text-[10px] text-rose-500">Odometer Mismatch</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    ₹50,800
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                      Claim on Hold
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1">
                      <span>Audit</span> <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded text-[#b43403] focus:ring-0"/></td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">Karthik Nathan</div>
                    <div className="text-[11px] text-slate-500">EMP-1205 &bull; Chennai Central</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">MR</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">22 / 22 Days</div>
                    <div className="text-[11px] text-emerald-600 font-medium">Full Attendance</div>
                    <div className="text-[10px] text-slate-400">17 HQ &bull; 5 Ex-Stn</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">₹34,000</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">₹15,200</div>
                    <div className="text-[10px] text-slate-400">GPS: 1,380 km</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    ₹49,200
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Approved
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1">
                      <span>Payslip</span> <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
            <span className="text-slate-500">1 Staff Selected &bull; Total 428 Records</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-white disabled:opacity-40" disabled={true}>
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              <button className="w-7 h-7 flex items-center justify-center bg-[#b43403] text-white rounded font-bold">1</button>
              <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-white font-medium">2</button>
              <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-white font-medium">3</button>
              <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-white">
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Rep Salary & Allowance Dissect Inspector */}
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#b43403]">PAYSLIP SLATE #SEP-2026-1049</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                Ready for Disbursal
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Field Representative</p>
                <p className="font-bold text-slate-900 mt-0.5">Rahul Sharma</p>
                <p className="text-slate-500 text-[11px]">Senior MR &bull; Mumbai Metro (HQ: Dadar)</p>
              </div>

              {/* Breakdown Items */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Basic Salary (22/22 Days):</span>
                  <span className="font-semibold text-slate-800">₹24,000</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>House Rent Allowance (HRA):</span>
                  <span className="font-semibold text-slate-800">₹8,000</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Special &amp; Medical Allowance:</span>
                  <span className="font-semibold text-slate-800">₹4,000</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-800 font-bold">
                  <span>Gross Fixed Compensation:</span>
                  <span>₹36,000</span>
                </div>
                
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[#b43403] font-bold">
                  <span>Daily Allowance (DA) - 16 HQ Days @ ₹250:</span>
                  <span>₹4,000</span>
                </div>
                <div className="flex justify-between items-center text-[#b43403] font-bold">
                  <span>Ex-Station DA - 6 Days @ ₹450:</span>
                  <span>₹2,700</span>
                </div>
                <div className="flex justify-between items-center text-[#b43403] font-bold">
                  <span>Travel Allowance (1,420 km @ ₹5.50/km):</span>
                  <span>₹7,810</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 font-semibold">
                  <span>Mobile &amp; Stationery Reimb.:</span>
                  <span>₹340</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-500">
                  <span>Statutory PF &amp; ESIC Deduction:</span>
                  <span className="text-rose-600">- ₹2,160</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Professional Tax (PT):</span>
                  <span className="text-rose-600">- ₹200</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-extrabold text-sm">
                  <span>Net Payable Amount:</span>
                  <span className="text-[#b43403]">₹50,850</span>
                </div>
              </div>

              {/* Bank Handshake Info */}
              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-[11px] text-blue-900">
                <div className="font-bold flex items-center justify-between">
                  <span>Bank Account Linked</span>
                  <span className="text-blue-700">HDFC Bank</span>
                </div>
                <p className="text-blue-700/80 mt-0.5">A/C: **** **** 8920 &bull; IFSC: HDFC0000128</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button className="w-full py-2 bg-[#b43403] hover:bg-[#9a3412] text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-2">
                  <i className="fa-regular fa-check-double"></i>
                  <span>Approve &amp; Send to Bank NEFT Batch</span>
                </button>
                <button className="w-full py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 flex items-center justify-center gap-2">
                  <i className="fa-regular fa-print text-slate-500"></i>
                  <span>Download Verified Salary Slip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Automated Statutory & Expense Compliance Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-calculator-simple text-blue-600"></i>
              <span>Expense Audit Rule Engine (DCR Verified)</span>
            </h4>
            
            <div className="text-[11px] space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span>GPS Distance Validation Adherence:</span>
                <span className="font-bold text-emerald-600">98.2% Match</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ "width": "98.2%" }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>MTP Route Plan vs Actual DCR Calls:</span>
                <span className="font-bold text-slate-800">95.4% Sync</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#b43403] h-full rounded-full" style={{ "width": "95.4%" }}></div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 pt-1">
              Field representatives must log daily calls prior to midnight to qualify for full local HQ daily allowance (₹250/day).
            </p>
          </div>

        </div>

      </div>

      {/* PAYROLL POLICY BANNER */}
      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-file-invoice-dollar text-lg"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Statutory Tax &amp; Field Force Daily Allowance Reimbursement Policy</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Ex-station and Outstation travel allowances are exempt under Income Tax Section 10(14)(i) subject to verified DCR visit proof and travel voucher logs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3 py-1.5 border border-slate-300 bg-white text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50">
            View TA/DA Policy
          </button>
          <button className="px-3 py-1.5 bg-[#b43403] text-white text-xs font-semibold rounded-lg hover:bg-[#9a3412]">
            Bulk NEFT Matrix
          </button>
        </div>
      </div>

    </div>

  
    </div>
  );
}
