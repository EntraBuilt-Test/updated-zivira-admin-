import { notFound } from "next/navigation";
import { AdminDrilldown } from "@/components/admin-drilldown";
import { BackButton } from "@/components/back-button";
import { PageHeader } from "@/components/page-components";
import { findTreeNode } from "@/lib/tree-lookup";

export default async function AdminWorkspacePage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path: rawPath } = await params;
  const path = rawPath.map(p => decodeURIComponent(p).replace(/\s+/g, "-"));
  const pathStr = path.join("/");
  console.log("DEBUG PATHSTR:", pathStr);
  let node: any = findTreeNode(path);

  if (!node) {
    if (pathStr.includes("daily-mr-work")) {
      const lastPart = path[path.length - 1];
      if (lastPart === "daily-mr-work") {
        node = {
          title: "Daily MR Work",
          slug: "daily-mr-work",
          children: [
            { title: "Attendance", slug: "attendance" },
            { title: "Daily Call Report", slug: "daily-call-report" },
            { title: "Tour Plan", slug: "tour-plan" },
            { title: "Expense", slug: "expense" },
            { title: "Leaves", slug: "leaves" },
            { title: "Camp", slug: "camp" },
            { title: "Market Survey", slug: "market-survey" },
            // Phase 1 of the "Call Manager" reference build — admin
            // visibility into every real CampaignVisitModel row a field
            // rep plans via Campaign Planning, mirrored into the
            // campaignVisitEntry generic master the same way Camp/Market
            // Survey already are.
            { title: "Campaign", slug: "campaign" }
          ]
        };
      } else {
        const titleMap: Record<string, string> = {
          attendance: "Attendance",
          "daily-call-report": "Daily Call Report",
          "tour-plan": "Tour Plan",
          expense: "Expense",
          leaves: "Leaves",
          camp: "Camp",
          "market-survey": "Market Survey",
          campaign: "Campaign"
        };
        node = {
          title: titleMap[lastPart] || lastPart,
          slug: lastPart
        };
      }
    } else if (pathStr.includes("manager-activity-report")) {
      const lastPart = path[path.length - 1];
      if (lastPart === "manager-activity-report") {
        node = {
          title: "Manager Activity Report",
          slug: "manager-activity-report",
          children: [
            { title: "Attendance Report", slug: "attendance-report" },
            { title: "Daily Call Report Summary", slug: "daily-call-report-summary" },
            { title: "Tour Plan Report", slug: "tour-plan-report" },
            { title: "Expense Report", slug: "expense-report" },
            { title: "Leave Report", slug: "leave-report" },
            { title: "Camp Report", slug: "camp-report" },
            { title: "Market Survey Report", slug: "market-survey-report" },
            { title: "Doctor Coverage Report", slug: "doctor-coverage-report" },
            { title: "Chemist Coverage Report", slug: "chemist-coverage-report" },
            { title: "Productivity Dashboard", slug: "productivity-dashboard" }
          ]
        };
      } else {
        const titleMap: Record<string, string> = {
          "attendance-report": "Attendance Report",
          "daily-call-report-summary": "Daily Call Report Summary",
          "tour-plan-report": "Tour Plan Report",
          "expense-report": "Expense Report",
          "leave-report": "Leave Report",
          "camp-report": "Camp Report",
          "market-survey-report": "Market Survey Report",
          "doctor-coverage-report": "Doctor Coverage Report",
          "chemist-coverage-report": "Chemist Coverage Report",
          "productivity-dashboard": "Productivity Dashboard"
        };
        node = {
          title: titleMap[lastPart] || lastPart,
          slug: lastPart
        };
      }
    } else if (pathStr.endsWith("doctor/chemist")) {
      node = { title: "Chemist", slug: "chemist" };
    }
  }

  if (!node) {
    notFound();
  }

  // Item 4 — "the datas must be save in the admin portal with the exact
  // headers and field." Every Daily MR Work / Manager Activity Report leaf
  // tab (Attendance, DCR, Tour Plan, Expense, Leaves, Camp, Market Survey,
  // and their Manager Activity Report counterparts + Doctor/Chemist
  // Coverage + Productivity Dashboard) is already routed by
  // AdminDrilldown to a real <GenericMasterTable> backed by its own
  // registry entry in the backend's masters/registry.ts (real MongoDB
  // collection, real Add/Edit/Deactivate CRUD, real column headers) — the
  // generic "Working modern page..." copy below was left over from before
  // that wiring existed and made a fully working table look like an
  // unwired stub. Leaf tabs (no children) get an accurate description
  // instead; the two hub pages (the card grids themselves) keep the
  // original copy since it's still true of the module as a whole.
  const isWiredLeaf = !node.children?.length && (pathStr.includes("daily-mr-work/") || pathStr.includes("manager-activity-report/"));

  // Coordinator round (Survey Item 1 fix) -- the 3 Activity Reports >
  // Survey leaves (Question Creation / Updation / View) each mount
  // SurveyWorkspace, which already renders its own legacy-accurate title
  // and 4-button cross-nav bar (Create - Question / Create - Survey /
  // Update - Survey / View). Stacking the generic PageHeader ("Updation" /
  // "Working modern page for this exact architecture tab...") above that
  // made clicking "Updation" look like it landed on a separate placeholder
  // page before the real Update - Survey listing further down, instead of
  // going straight there the way the legacy app does. Suppressed here for
  // just these 3 leaves; a plain Back control is kept so there's still a
  // way out to the tile grid.
  const isSurveyWorkspaceLeaf = pathStr.endsWith("activity-reports/survey/question-creation")
    || pathStr.endsWith("activity-reports/survey/updation")
    || pathStr.endsWith("activity-reports/survey/view");

  if (isSurveyWorkspaceLeaf) {
    return (
      <>
        <div className="mb-4">
          <BackButton fallback="/admin/home" />
        </div>
        <AdminDrilldown node={node} path={path} />
      </>
    );
  }

  // Round 48 -- Options > Leave Status / Upload / Customer Upload / Information Upload leaves
  // render their own real screens; the generic "Working modern page..." placeholder is dropped.
  const isOptionsRealLeaf = /(^|\/)division-options\/(leave-status$|upload\/|customer-upload\/|information-upload\/)/.test(pathStr);
  return (
    <>
      <PageHeader
        title={node.title}
        description={
          isOptionsRealLeaf
            ? ""
            : isWiredLeaf
            ? `Live data — every row is saved to MongoDB via the ${node.title} collection. Add, edit, and deactivate records below.`
            : "Working modern page for this exact architecture tab. Data CRUD can be wired to its MongoDB collection."
        }
        action={<BackButton fallback="/admin/home" />}
      />
      <AdminDrilldown node={node} path={path} />
    </>
  );
}
