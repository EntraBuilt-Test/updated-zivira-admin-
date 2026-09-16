import Link from "next/link";

export function AdminMastersDashboard() {
  return (
    <div className="flex flex-col w-full space-y-6">
      <section className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span>
            <span className="text-text-muted text-body-sm font-body-sm">/</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Masters</span>
            <span className="text-text-muted text-body-sm font-body-sm">/</span>
            <span className="font-label-md text-label-md text-primary font-semibold">Master setup</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Masters</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
              Live Sync Active • Synced 1 min ago
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2">
            <span className="">SubDivision, Product, Field Force, Doctor, Input, Stockist, Expense, and personal information setup.</span>
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[17px]">search</span>
            <input className="w-full h-[38px] pl-8 pr-3 rounded-lg bg-surface-canvas text-text-primary font-body-sm placeholder:text-text-muted border border-transparent focus:outline-none focus:border-border-strong focus:bg-surface-card shadow-sm transition-colors" placeholder="Search master records, SKUs, doctors..." type="text"/>
          </div>
          <button className="h-[38px] px-3.5 rounded-lg bg-surface-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-[18px] text-text-secondary">download</span>
            <span className="">Bulk Export Master Data</span>
          </button>
          <button className="h-[38px] px-4 rounded-lg bg-primary hover:bg-brand-primary-hover text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all active:scale-95" type="button">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="">Quick Add Master Record</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total Master Entities</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">12</span>
                <span className="font-label-sm text-label-sm text-status-success bg-status-success-bg px-1.5 py-0.5 rounded font-semibold">All Configured</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-700" style={{ width: "100%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm text-text-muted">
              <span className="">Active enterprise modules</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">100% Online</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Total Active Records</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">28,490</span>
                <span className="font-label-sm text-label-sm text-status-info bg-status-info-bg px-1.5 py-0.5 rounded font-semibold">+4.2% MoM</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-status-info h-1.5 rounded-full transition-all duration-700" style={{ width: "88%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm text-text-muted">
              <span className="">Drs: 12.4k • SKUs: 148</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">194 Reps • 860 Stk</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Validation Status</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">99.4%</span>
                <span className="font-label-sm text-label-sm text-status-success bg-status-success-bg px-1.5 py-0.5 rounded font-semibold">Verified</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-status-success h-1.5 rounded-full transition-all duration-700" style={{ width: "99.4%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm">
              <span className="text-text-muted">KYC &amp; DL Cleared</span>
              <span className="font-label-sm text-label-sm text-status-warning font-medium">28 Pending Approval</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Audit &amp; Change Log</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">42</span>
                <span className="font-label-sm text-label-sm text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded font-semibold">Today</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">history_edu</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary h-1.5 rounded-full transition-all duration-700" style={{ width: "65%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm text-text-muted">
              <span className="">Ops Admin update</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">14 min ago</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary">Master Directory &amp; Configuration Hub</h2>
            <p className="font-body-sm text-body-sm text-text-muted">Configure, view, and administer central records across pharma operational domains</p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-canvas p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-surface-card text-primary font-bold shadow-sm text-label-sm" type="button">All Masters (12)</button>
            <button className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium" type="button">Territory &amp; Field (4)</button>
            <button className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium" type="button">Commercial &amp; Products (4)</button>
            <button className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors text-label-sm font-medium" type="button">Financial &amp; Compliance (4)</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-grid-gutter">
          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">account_tree</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">SubDivision</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">1 sub tab</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Organizational division hierarchies, zone mapping, and team alignment.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">14 Divisions</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">4 Super Zones</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/subdivision">
                <span className="">Configure Hierarchy</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">medication</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Product</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">5 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">SKU catalogs, brand molecules, composition pricing, packaging &amp; batch codes.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">148 SKUs</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">24 Molecules</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product">
                <span className="">Manage Products</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Field Force</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">Ready module</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>194 Reps
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Medical representatives, territory managers, hierarchy &amp; designation mappings.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">194 Active</span>
                <span className="px-2 py-0.5 rounded bg-status-warning-bg text-status-warning font-label-sm text-[11px]">2 Vacancies</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force">
                <span className="">Reps &amp; Mappings</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Doctor</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">4 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Verified
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Prescriber registry, specialization, hospital tags, MCL categories &amp; core list.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">12,450 Doctors</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">98% MCL tagged</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor">
                <span className="">Doctor Master Registry</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">featured_play_list</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Input</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">Ready module</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>86 Collaterals
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Physician sampling kits, promotional visual aids, LBLs, gift inventories &amp; giveaways.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">86 Items</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Active Samples</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/input">
                <span className="">Sampling &amp; Inputs</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">map</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Territory Bulk Activation</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">6 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>100% Online
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Batch territory operations, beat realignment, patch status toggling.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">48 Beats</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Bulk Controls</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/field-force-entries">
                <span className="">Territory Ops</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Statewise - Holiday Fixation</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">2 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Configured
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">State-specific gazetted calendars, field off-days, and seasonal scheduling.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">28 States</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">2026 Calendar</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/statewise-holiday-fixation">
                <span className="">Manage Calendars</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">store</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Stockist Details</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">8 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>860 Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Authorized pharmaceutical distributors, stockist ledger, DL/GSTIN verification.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">860 Stockists</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">GSTIN Synced</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/stockist-details">
                <span className="">Stockist Master</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Expense Setup</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">6 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Rates Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">HQ/Ex-HQ/Outstation daily allowances, kilometer rates, and lodgings policy.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">Grade A/B/C Bands</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">DA &amp; TA Rules</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/expense">
                <span className="">Allowance Policies</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">supervisor_account</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Manager Expense</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">6 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Configured
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Area &amp; regional managerial expense caps, joint fieldwork allowance rules.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">5 Policy Tiers</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Manager Slab</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/manager-expense">
                <span className="">Manager Slabs</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">person_pin</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Personal Information</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">2 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>100% KYC
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Emergency contacts, bank disbursement details, PF/ESI numbers.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">100% Onboarded</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Statutory Cleared</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/personal-information">
                <span className="">Employee Details</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-canvas/50 hover:bg-surface-card hover:border-primary/40 hover:shadow-md transition-all p-card-padding-standard flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">trending_up</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] text-text-primary font-bold leading-tight">Sales</h3>
                    <span className="font-label-sm text-[11px] text-text-muted">5 sub tabs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Q3 Live
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">Primary vs secondary targets, opening stock master, and liquidation thresholds.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-primary font-label-sm text-[11px] font-semibold">Target Rules</span>
                <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-label-sm text-[11px]">Opening Stock</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-4">
              <Link className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold flex items-center gap-1 group-hover:underline" href="/admin/workspace/division-dashboard/division-navigation-tabs/division-master/sales">
                <span className="">Sales Rules &amp; Targets</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <button className="w-7 h-7 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors" title="More actions" type="button">
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary">Recent Master Modifications &amp; Audit Trail</h2>
            <p className="font-body-sm text-body-sm text-text-muted">Real-time changelog of data definitions, doctor registries, pricing and territory alignments</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[17px]">filter_list</span>
              <input className="w-full h-[36px] pl-8 pr-3 rounded-lg bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:bg-surface-card shadow-sm border border-border-subtle focus:border-border-strong" placeholder="Filter logs by user or entity..." type="text"/>
            </div>
            <button className="h-[36px] px-3 rounded-lg bg-surface-subtle border border-border-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors" type="button">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span className="">All Modules</span>
            </button>
            <button className="h-[36px] px-3 rounded-lg bg-surface-subtle border border-border-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors" type="button">
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="">Export Audit Log</span>
            </button>
          </div>
        </div>
        <div className="w-full overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-table-header-height bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider border-b border-border-subtle">
                <th className="px-4">Module</th>
                <th className="px-4">Entity Name</th>
                <th className="px-4">Change Type</th>
                <th className="px-4">Updated By</th>
                <th className="px-4">Timestamp</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-sm text-body-sm text-text-primary">
              <tr className="h-table-row-height hover:bg-surface-canvas/60 transition-colors">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-info"></span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Doctor</span>
                  </div>
                </td>
                <td className="px-4">
                  <span className="font-medium text-text-primary">Dr. Rajeshwar Sharma</span>
                  <span className="block font-label-sm text-text-muted">MCL Core List • Max Healthcare Saket</span>
                </td>
                <td className="px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[13px]">add_circle</span>Created
                  </span>
                </td>
                <td className="px-4">
                  <span className="text-text-primary font-medium">Anand Verma</span>
                  <span className="block font-label-sm text-text-muted">North Ops Lead</span>
                </td>
                <td className="px-4 text-text-muted font-body-sm">14 min ago (10 Sep 2026, 14:48)</td>
                <td className="px-4 text-right">
                  <button className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle hover:bg-brand-primary-subtle hover:border-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors" type="button">View Diff</button>
                </td>
              </tr>
              <tr className="h-table-row-height hover:bg-surface-canvas/60 transition-colors">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Product</span>
                  </div>
                </td>
                <td className="px-4">
                  <span className="font-medium text-text-primary">ZiviCal D3 60k IU Softgels</span>
                  <span className="block font-label-sm text-text-muted">SKU-8820 • Revised MRP &amp; PTR Slabs</span>
                </td>
                <td className="px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-info-bg text-status-info font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[13px]">edit_note</span>Modified
                  </span>
                </td>
                <td className="px-4">
                  <span className="text-text-primary font-medium">Pricing Committee</span>
                  <span className="block font-label-sm text-text-muted">Corporate HQ</span>
                </td>
                <td className="px-4 text-text-muted font-body-sm">42 min ago (10 Sep 2026, 14:20)</td>
                <td className="px-4 text-right">
                  <button className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle hover:bg-brand-primary-subtle hover:border-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors" type="button">View Diff</button>
                </td>
              </tr>
              <tr className="h-table-row-height hover:bg-surface-canvas/60 transition-colors">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Territory Bulk</span>
                  </div>
                </td>
                <td className="px-4">
                  <span className="font-medium text-text-primary">Andheri West Patch B</span>
                  <span className="block font-label-sm text-text-muted">Realigned to Mumbai Metro Zone 2</span>
                </td>
                <td className="px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary-subtle text-primary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[13px]">sync_alt</span>Realigned
                  </span>
                </td>
                <td className="px-4">
                  <span className="text-text-primary font-medium">Admin Zivira</span>
                  <span className="block font-label-sm text-text-muted">HQ Operations</span>
                </td>
                <td className="px-4 text-text-muted font-body-sm">1 hr ago (10 Sep 2026, 13:58)</td>
                <td className="px-4 text-right">
                  <button className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle hover:bg-brand-primary-subtle hover:border-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors" type="button">View Diff</button>
                </td>
              </tr>
              <tr className="h-table-row-height hover:bg-surface-canvas/60 transition-colors">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-warning"></span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Expense Setup</span>
                  </div>
                </td>
                <td className="px-4">
                  <span className="font-medium text-text-primary">Metro Ex-HQ Daily Allowance</span>
                  <span className="block font-label-sm text-text-muted">Updated from ₹480 to ₹520/day</span>
                </td>
                <td className="px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-info-bg text-status-info font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[13px]">edit_note</span>Modified
                  </span>
                </td>
                <td className="px-4">
                  <span className="text-text-primary font-medium">Finance Team</span>
                  <span className="block font-label-sm text-text-muted">Admin Zivira</span>
                </td>
                <td className="px-4 text-text-muted font-body-sm">2 hrs ago (10 Sep 2026, 12:45)</td>
                <td className="px-4 text-right">
                  <button className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle hover:bg-brand-primary-subtle hover:border-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors" type="button">View Diff</button>
                </td>
              </tr>
              <tr className="h-table-row-height hover:bg-surface-canvas/60 transition-colors">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-danger"></span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Stockist Details</span>
                  </div>
                </td>
                <td className="px-4">
                  <span className="font-medium text-text-primary">Apex Medico Agencies</span>
                  <span className="block font-label-sm text-text-muted">DL Renewal Pending (Kolkata Hub)</span>
                </td>
                <td className="px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[13px]">pause_circle</span>Suspended
                  </span>
                </td>
                <td className="px-4">
                  <span className="text-text-primary font-medium">Compliance Cell</span>
                  <span className="block font-label-sm text-text-muted">Legal Dept</span>
                </td>
                <td className="px-4 text-text-muted font-body-sm">3 hrs ago (10 Sep 2026, 11:30)</td>
                <td className="px-4 text-right">
                  <button className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle hover:bg-brand-primary-subtle hover:border-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors" type="button">View Diff</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 font-body-sm text-body-sm text-text-secondary">
          <div className="">Showing <strong className="text-text-primary">1 to 5</strong> of <strong className="text-text-primary">42</strong> Audit Records Today</div>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1 rounded bg-surface-canvas border border-border-subtle hover:bg-surface-subtle text-text-muted disabled:opacity-40 font-label-md text-label-md" disabled={true} type="button">Prev</button>
            <button className="w-7 h-7 rounded border border-primary bg-primary text-on-primary font-label-md text-label-md font-semibold" type="button">1</button>
            <button className="w-7 h-7 rounded border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md" type="button">2</button>
            <button className="w-7 h-7 rounded border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md" type="button">3</button>
            <button className="px-2.5 py-1 rounded bg-surface-canvas border border-border-subtle hover:bg-surface-subtle text-text-primary font-label-md text-label-md" type="button">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
