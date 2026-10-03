import type { ZiviraTreeNode } from "@zivira/types";
import { AdminTabGrid } from "./admin-tab-grid";

// Coordinator round (Activity Reports visual rebuild) -- this used to be a
// standalone component with its own hand-rolled horizontal pill-tabs /
// pill-sub-tabs and inline tab content. The user wanted this restyled to
// match the tile-grid pattern already used by MIS Reports
// (admin-mis-reports-dashboard.tsx) and Update/Delete elsewhere in this
// app, using the SAME shared AdminTabGrid component rather than a new one.
//
// All the real sub-tab content that used to live inline here (Territory >
// View / Status fully wired to real data, DCR > View / Approve-Reject
// wired to existing real screens, and the honest "not yet built"
// placeholders for everything else) has moved to AdminDrilldown
// (components/admin-drilldown.tsx), which is the same shared dispatcher
// MIS Reports' and Update/Delete's own tiles already drill into via
// /admin/workspace/[...path] -- so clicking a tile here now navigates
// through the exact same real architecture those screens use, instead of
// a separate one-off routing scheme.
export function AdminActivityReportsDashboard({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2 text-label-sm font-label-sm tracking-wider uppercase text-text-muted">
          <span className="">PLATFORM</span>
          <span className="material-symbols-outlined text-[13px] text-text-muted">chevron_right</span>
          <span className="text-primary font-bold">Activity Reports</span>
        </div>
        <h1 className="font-display-lg text-display-lg text-text-primary tracking-tight leading-none">Activity Reports</h1>
        <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
          Mirrors the legacy sanpharma.info Activity Reports menu structure: Territory, Survey, TP, DCR and Customized Report.
        </p>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-4">
        <AdminTabGrid node={node} path={path} />
      </div>
    </div>
  );
}
