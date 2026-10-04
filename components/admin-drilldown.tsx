"use client";

import type { ZiviraTreeNode } from "@zivira/types";
import Link from "next/link";
import { Suspense } from "react";
import { GenericMasterTable } from "@/components/generic-master-table";
import { MasterScreen } from "@/components/master-screen";
import { AdminTabGrid } from "@/components/admin-tab-grid";
import { TaskModeCreationPage, TaskAssignSystemPage } from "@/components/task-management-panel";
import { AdminDcrView } from "@/components/admin-dcr-view";
import { ExpenseMaster } from "@/components/expense-master";
import { EmployeeManager } from "@/components/employee-manager";
import { TerritoryListedDoctor } from "@/components/territory-listed-doctor";
import { ChemistMaster } from "@/components/chemist-master";
import { HospitalMaster } from "@/components/hospital-master";
import { ManagerSfcUpdation } from "@/components/manager-sfc-updation";
import { ManagerWorkTypeAllowance } from "@/components/manager-work-type-allowance";
import { TerritoryBulkDeactivation } from "@/components/territory-bulk-deactivation";
import { ListedDoctorMaster } from "@/components/listed-doctor-master";
import { UnlistedDoctorMaster } from "@/components/unlisted-doctor-master";
import { OrderBookingSetupPanel } from "@/components/order-booking-setup-panel";
import { CallFeedbackCreationPanel } from "@/components/call-feedback-creation-panel";
import { CallRemarksTemplatesPanel } from "@/components/call-remarks-templates-panel";
import { GpsGeoFencePanel } from "@/components/gps-geofence-panel";
import { ListedDoctorUploadPanel } from "@/components/listed-doctor-upload-panel";
import { ChemistUploadPanel } from "@/components/chemist-upload-panel";
import { SampleDespatchUploadPanel } from "@/components/sample-despatch-upload-panel";
import { InputDespatchUploadPanel } from "@/components/input-despatch-upload-panel";
import { TargetUploadPanel } from "@/components/target-upload-panel";
import { FlashNewsPanel } from "@/components/flash-news-panel";
import { NoticeBoardPanel } from "@/components/notice-board-panel";
import { QuoteOfTheWeekPanel } from "@/components/quote-of-week-panel";
import { TalkToUsPanel } from "@/components/talk-to-us-panel";
import { FileUploadDesignationwisePanel } from "@/components/file-upload-designationwise-panel";
import { UserManualUploadPanel } from "@/components/user-manual-upload-panel";
import { SalesforceUploadPanel } from "@/components/salesforce-upload-panel";
import { StockistUploadPanel } from "@/components/stockist-upload-panel";
import { ProductUploadPanel } from "@/components/product-upload-panel";
import { ProductRateUploadPanel } from "@/components/product-rate-upload-panel";
import { HolidayFixationUploadPanel } from "@/components/holiday-fixation-upload-panel";
import { LeaveUploadPanel } from "@/components/leave-upload-panel";
import { DynamicAppLinkPanel } from "@/components/dynamic-app-link-panel";
import { SlideUploadEDetailingPanel } from "@/components/slide-upload-edetailing-panel";
import { HomepageImageUploadPanel } from "@/components/homepage-image-upload-panel";
import { HomepageFieldForcewisePanel } from "@/components/homepage-fieldforcewise-panel";
import { LeaveStatusPanel } from "@/components/leave-status-panel";
import { TransferMasterDetailsPanel } from "@/components/transfer-master-details-panel";
import { UnlistedToListedConversionPanel } from "@/components/unlisted-to-listed-conversion-panel";
import { DelayedReleasePanel } from "@/components/delayed-release-panel";
import { TerritoryViewReport, TerritoryStatusReport } from "@/components/territory-report-panels";
import { TpConsolidatedViewReport, TpViewReport, TpStatusReport, TpDatewiseReport } from "@/components/tp-report-panels";
import { DcrViewWorkspace, DcrStatusReport } from "@/components/dcr-report-panels";
import { DcrNotApprovedReport, DcrNotSubmittedReport, DcrCountModewiseReport, DcrRejectApproveReport, DcrTimeStatusReport, DcrCheckinCheckoutReport } from "@/components/dcr-report-panels-2";
import { SurveyWorkspace } from "@/components/survey-workspace";
import { CustomReportWorkspace } from "@/components/custom-report-workspace";
import { HqCoveragewiseReport, CoverageAnalysis1Report, JointWorkwiseReport } from "@/components/manager-analysis-panels";
import { PobRxProductWiseReport, PobRxFieldforceWiseReport, PobRxDayWiseReport, PobRxDumpReport } from "@/components/pob-rx-panels";
import { QuizTestResultReport, DayWiseDumpReport, CallReportDumpReport, DetailingVisitWiseReport, BrandStarRatingReport, SlideAnalysisReport, DrsAnalysisReport } from "@/components/r45-panels";
import { CatClsVisitDetailsReport, VisitDetailDateWiseReport } from "@/components/visit-details-panels";
import { NotAtAllVisitDrsReport, NotAtAllPromotedProductsReport, NotAtAllVisitHqsReport } from "@/components/heat-panels";
import { DcrAnalysisReport, VisitAnalysisReport, SalesDetailsReport, PobWiseReport, PobPeriodicReport } from "@/components/mis-analysis-panels";
import { WorkHygieneReport, ClassWiseViewReport, DcrAnalysisDumpReport, MissedCallReport, SingleDoctorReport, RepVsManagerReport, ReviewReport, AssessmentReport } from "@/components/mis-analysis-panels-2";
import { FieldworkManagerAnalysisReport, ManagerWiseCoverageReport, SpecialityCategoryVisitReport } from "@/components/manager-analysis-panels-2";

export function AdminDrilldown({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const pathStr = path.join("/");

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/territory") {
    return <GenericMasterTable masterKey="patchNameMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/territory-listed-doctor") {
    return <TerritoryListedDoctor />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/territory-bulk-deactivation") {
    return <TerritoryBulkDeactivation />;
  }

  // BUG FIX: these three used to be bare `pathStr.endsWith("listed-doctor"
  // / "unlisted-doctor" / "chemist")` with no path-segment boundary, so they
  // also matched "division-options/customer-upload/listed-doctor" and
  // ".../customer-upload/chemist" — both of which end in the same literal
  // suffix — and, because these checks run EARLIER in this if-chain than
  // the dedicated "customer-upload/listed-doctor"/"customer-upload/chemist"
  // checks further down (which render ListedDoctorUploadPanel/
  // ChemistUploadPanel, the sanpharma-matching upload tools), they won the
  // match first and rendered this generic Master table+Add-button screen
  // instead — on the live site, every time, regardless of deploy freshness.
  // Restricting these to "division-master" paths (their real, intended
  // parent section) stops them from ever intercepting a customer-upload
  // path again.
  if (pathStr.includes("division-master") && pathStr.endsWith("listed-doctor")) {
    return <ListedDoctorMaster />;
  }

  if (pathStr.includes("division-master") && pathStr.endsWith("unlisted-doctor")) {
    return <UnlistedDoctorMaster />;
  }

  if (pathStr.includes("division-master") && pathStr.endsWith("chemist")) {
    return <ChemistMaster />;
  }

  // Post-launch robustness round items 2/3 -- real, unique paths for the
  // Customer section's Chemist Master and Listed Doctor Master tiles (see
  // the comment on these nodes in zivira-tree.ts for why the old slugs
  // collided with an unrelated generic master screen).
  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/chemist-master") {
    return <ChemistMaster />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/listed-doctor-master") {
    return <ListedDoctorMaster />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/hospital") {
    return <HospitalMaster />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force") {
    return <EmployeeManager />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/subdivision/entry") {
    return <GenericMasterTable masterKey="divisionMaster" />;
  }

  // Tree title: "Regional Zone Master"
  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/view-productwise") {
    return <GenericMasterTable masterKey="regionZoneMaster" />;
  }

  // Tree title: "Territory / Headquarters Master"
  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/view-field-forcewise") {
    return <GenericMasterTable masterKey="territoryHqMaster" />;
  }

  {/* Product hierarchy: Therapy → Molecule → Brand → Product → Rate */}
  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/product/category") {
    return <GenericMasterTable masterKey="therapyMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/product/group") {
    return <GenericMasterTable masterKey="moleculeMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/product/brand") {
    return <GenericMasterTable masterKey="brandMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/product/product-detail") {
    return <GenericMasterTable masterKey="productMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/product/statewise-rate-fixation") {
    return <GenericMasterTable masterKey="rateMaster" />;
  }

  {/* Doctor's 7 sub-tabs, per tree titles: Doctor Master, Address, Classification,
      Mapping, Dealer Mapping, Contact Details, Additional Information */}
  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/category") {
    return <GenericMasterTable masterKey="doctorMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/class") {
    return <GenericMasterTable masterKey="doctorClassification" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/speciality") {
    return <GenericMasterTable masterKey="doctorAddress" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/qualification") {
    return <GenericMasterTable masterKey="doctorDealerMapping" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/campaign") {
    return <GenericMasterTable masterKey="doctorMapping" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/chemists-category") {
    return <GenericMasterTable masterKey="doctorContactDetails" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/chemists-class") {
    return <GenericMasterTable masterKey="doctorAdditionalInfo" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/input") {
    return <GenericMasterTable masterKey="inputMaster" />;
  }

  // Phase 1 of the "Call Manager" reference build — the admin-authored
  // Campaign catalog field reps pick from in Campaign Planning.
  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/campaign-master") {
    return <GenericMasterTable masterKey="campaignMaster" />;
  }

  // Round 44 -- Doctor Type master (Core drs, Academica, ...).
  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor-type-master") {
    return <GenericMasterTable masterKey="doctorTypeMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/doctor/stockist-master") {
    return <GenericMasterTable masterKey="doctorStockistCombined" />;
  }

  if (pathStr.endsWith("stockist-details/stockist-master") || pathStr.endsWith("stockist-details/stockist master")) {
    return <GenericMasterTable masterKey="stockistMaster" />;
  }

  if (pathStr.endsWith("stockist-details/address")) {
    return <GenericMasterTable masterKey="stockistAddress" />;
  }

  if (pathStr.endsWith("stockist-details/contact")) {
    return <GenericMasterTable masterKey="stockistContact" />;
  }

  if (pathStr.endsWith("stockist-details/headquaters") || pathStr.endsWith("stockist-details/headquarters")) {
    return <GenericMasterTable masterKey="stockistHeadquarters" />;
  }

  if (pathStr.endsWith("stockist-details/divided-maping") || pathStr.endsWith("stockist-details/divided maping")) {
    return <GenericMasterTable masterKey="stockistDivisionMapping" />;
  }

  if (pathStr.endsWith("stockist-details/bank-details") || pathStr.endsWith("stockist-details/bank details")) {
    return <GenericMasterTable masterKey="stockistBankDetails" />;
  }

  if (pathStr.endsWith("stockist-details/license-details") || pathStr.endsWith("stockist-details/license details")) {
    return <GenericMasterTable masterKey="stockistLicenseDetails" />;
  }

  if (pathStr.endsWith("stockist-details/status")) {
    return <GenericMasterTable masterKey="stockistStatus" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/expense") {
    return <ExpenseMaster />;
  }

  if (pathStr.endsWith("expense/sfc-view")) {
    return <GenericMasterTable masterKey="sfc" />;
  }

  if (pathStr.endsWith("expense/allowance-fixation")) {
    return <GenericMasterTable masterKey="allowanceFixation" />;
  }

  if (pathStr.endsWith("expense/fixed-variable-expense-parameter")) {
    return <GenericMasterTable masterKey="expenseCategory" />;
  }

  if (pathStr.endsWith("expense/expense-setup")) {
    return <GenericMasterTable masterKey="expenseTypes" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/manager-expense/allowance-fixation-automatic") {
    return <GenericMasterTable masterKey="allowanceFixation" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/manager-expense/sfc-updation") {
    return <ManagerSfcUpdation />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/manager-expense/wrk-type-wise-allowance-fix") {
    return <ManagerWorkTypeAllowance />;
  }

  if (pathStr.endsWith("manager-expense/travel-approval") || pathStr.endsWith("manager-expense/travel approval")) {
    return <GenericMasterTable masterKey="managerTravelApproval" />;
  }

  if (pathStr.endsWith("state-master") || pathStr.endsWith("state master")) {
    return <GenericMasterTable masterKey="holidayStateMaster" />;
  }

  if (pathStr.endsWith("holiday-calendar") || pathStr.endsWith("holiday calendar")) {
    return <GenericMasterTable masterKey="holidayCalendar" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/personal-information/personal-entry") {
    return <GenericMasterTable masterKey="employeePersonalInfo" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/personal-information/personal-view") {
    return <GenericMasterTable masterKey="personalInformationView" />;
  }

  if (pathStr.includes("daily-mr-work/attendance")) {
    return <GenericMasterTable masterKey="attendance" />;
  }

  if (pathStr.includes("daily-mr-work/daily-call-report")) {
    return <GenericMasterTable masterKey="dcrEntry" />;
  }

  if (pathStr.includes("daily-mr-work/tour-plan")) {
    return <GenericMasterTable masterKey="tourPlanEntry" />;
  }

  if (pathStr.includes("daily-mr-work/expense")) {
    return <GenericMasterTable masterKey="expenseEntry" />;
  }

  if (pathStr.includes("daily-mr-work/leaves")) {
    return <GenericMasterTable masterKey="leaveEntry" />;
  }

  if (pathStr.includes("daily-mr-work/camp")) {
    return <GenericMasterTable masterKey="campEntry" />;
  }

  if (pathStr.includes("daily-mr-work/market-survey")) {
    return <GenericMasterTable masterKey="marketSurveyEntry" />;
  }

  // Phase 1 of the "Call Manager" reference build — admin visibility into
  // every real CampaignVisitModel row a field rep plans via Campaign
  // Planning (mirrored into campaignVisitEntry, same write-through pattern
  // as Camp/Market Survey above).
  if (pathStr.includes("daily-mr-work/campaign")) {
    return <GenericMasterTable masterKey="campaignVisitEntry" />;
  }

  if (pathStr.includes("manager-activity-report/attendance-report")) {
    return <GenericMasterTable masterKey="attendanceReport" />;
  }

  if (pathStr.includes("manager-activity-report/daily-call-report-summary")) {
    return <GenericMasterTable masterKey="dcrSummaryReport" />;
  }

  if (pathStr.includes("manager-activity-report/tour-plan-report")) {
    return <GenericMasterTable masterKey="tourPlanReport" />;
  }

  if (pathStr.includes("manager-activity-report/expense-report")) {
    return <GenericMasterTable masterKey="expenseReport" />;
  }

  if (pathStr.includes("manager-activity-report/leave-report")) {
    return <GenericMasterTable masterKey="leaveReport" />;
  }

  if (pathStr.includes("manager-activity-report/camp-report")) {
    return <GenericMasterTable masterKey="campReport" />;
  }

  if (pathStr.includes("manager-activity-report/market-survey-report")) {
    return <GenericMasterTable masterKey="marketSurveyReport" />;
  }

  if (pathStr.includes("manager-activity-report/doctor-coverage-report")) {
    return <GenericMasterTable masterKey="doctorCoverageReport" />;
  }

  if (pathStr.includes("manager-activity-report/chemist-coverage-report")) {
    return <GenericMasterTable masterKey="chemistCoverageReport" />;
  }

  if (pathStr.endsWith("travel-approval")) {
    return <GenericMasterTable masterKey="managerTravelApproval" />;
  }

  // Coordinator follow-up round (Item 2) -- this menu item used to point at
  // "expenseApproval", a completely separate generic-master collection
  // that NOTHING in the real submit/approve/reject/delete expense-claim
  // flow ever writes to (confirmed via a full grep of the backend routes).
  // The real, live-updated collection is "expenseApprovalActive" (written
  // by mirrorExpenseApprovalRow on submit and reversed on delete), already
  // reachable from a second menu entry elsewhere in this tree -- this was
  // the split-collection bug Item 2 reported ("doesn't show matching
  // data"): the admin was looking at the wrong, permanently-empty master.
  // Routed through MasterScreen (not GenericMasterTable) so it renders via
  // the same ReportFilterView the other "Expense Approval (Active)" entry
  // uses, matching expenseApprovalActive's real uiKind.
  if (pathStr.endsWith("expense-approval")) {
    return <MasterScreen masterKey="expenseApprovalActive" />;
  }

  if (pathStr.endsWith("manager-expense/reports")) {
    return <GenericMasterTable masterKey="expenseReports" />;
  }

  if (pathStr.endsWith("productivity-dashboard")) {
    return <GenericMasterTable masterKey="productivityDashboard" />;
  }

  if (pathStr.endsWith("target-master")) {
    return <GenericMasterTable masterKey="targetMaster" showImportButton={true} />;
  }

  if (pathStr.endsWith("primary-sales")) {
    return <GenericMasterTable masterKey="primarySales" />;
  }

  if (pathStr.endsWith("secondary-sales")) {
    return <GenericMasterTable masterKey="secondarySales" />;
  }

  if (pathStr.endsWith("claims-master")) {
    return <GenericMasterTable masterKey="claimsMaster" />;
  }

  if (pathStr.endsWith("ims")) {
    return <GenericMasterTable masterKey="imsMaster" />;
  }

    if (pathStr.endsWith("approvals/listed-dr-addition")) {
    return <MasterScreen masterKey="approvalListedDrAddition" />;
  }

  if (pathStr.endsWith("approvals/listed-dr-deactivation")) {
    return <MasterScreen masterKey="approvalListedDrDeactivation" />;
  }

  if (pathStr.endsWith("approvals/tp")) {
    return <MasterScreen masterKey="approvalTp" />;
  }

  if (pathStr.endsWith("approvals/dcr")) {
    return <MasterScreen masterKey="approvalDcr" />;
  }

  if (pathStr.endsWith("approvals/leave")) {
    return <MasterScreen masterKey="approvalLeave" />;
  }

  if (pathStr.endsWith("activities/expense/approval-active")) {
    return <MasterScreen masterKey="expenseApprovalActive" />;
  }

  if (pathStr.endsWith("activities/expense/approval-vacant-resigned")) {
    return <MasterScreen masterKey="expenseApprovalVacantResigned" />;
  }

  if (pathStr.endsWith("activities/expense/analysis")) {
    return <MasterScreen masterKey="activitiesExpenseAnalysis" />;
  }

  if (pathStr.endsWith("activities/expense/consolidated-view")) {
    return <MasterScreen masterKey="activitiesExpenseConsolidatedView" />;
  }

  if (pathStr.endsWith("sample-dispatch/view")) {
    return <MasterScreen masterKey="sampleDispatchView" />;
  }

  if (pathStr.endsWith("sample-dispatch/status")) {
    return <MasterScreen masterKey="sampleDispatchStatus" />;
  }

  if (pathStr.endsWith("input-dispatch/view")) {
    return <MasterScreen masterKey="inputDispatchView" />;
  }

  if (pathStr.endsWith("input-dispatch/status")) {
    return <MasterScreen masterKey="inputDispatchStatus" />;
  }

  if (pathStr.endsWith("msis/view")) {
    return <MasterScreen masterKey="msisView" />;
  }

  if (pathStr.endsWith("leave-entitlement/entry")) {
    return <MasterScreen masterKey="leaveEntitlementEntry" />;
  }

  if (pathStr.endsWith("leave-entitlement/view")) {
    return <MasterScreen masterKey="leaveEntitlementView" />;
  }

  if (pathStr.endsWith("activities/audit-report")) {
    return <MasterScreen masterKey="auditReport" />;
  }

  // Round 11 item 4 — collapsed into sanpharma's single real Login Details
  // screen (the tree node no longer has Manager/Fieldrepo children).
  if (pathStr.endsWith("login-details")) {
    return <MasterScreen masterKey="loginDetailsManager" />;
  }

  if (pathStr.endsWith("activities/login-into-fieldforce")) {
    return <GenericMasterTable masterKey="loginIntoFieldforce" />;
  }

  // Round 14 — Task Management is now a landing page with two tile cards
  // (Mode Creation / Task Assign), matching the Activity landing page's own
  // Master & Screen Creation / Status pattern, rather than an in-page tab
  // switch. The parent "task-management" path is deliberately left
  // unmatched here so it falls through to the generic AdminTabGrid render
  // further down (same fallback the Activity page itself relies on) —
  // each child now gets its own dedicated route/component instead.
  if (pathStr.endsWith("task-management/mode-creation")) {
    return <TaskModeCreationPage />;
  }

  if (pathStr.endsWith("task-management/task-assign")) {
    return <TaskAssignSystemPage />;
  }

  if (pathStr.endsWith("activities/order-booking-view")) {
    return <MasterScreen masterKey="orderBookingView" />;
  }

  // Round 9 item 2 — this hardcoded GenericMasterTable branch ran BEFORE
  // MasterScreen ever got a chance, so the real 3-tab ActivityMasterPanel
  // built in Round 8 (wired via registry.ts's uiKind: "activityMaster")
  // was never actually reachable from this route — the live site kept
  // showing the old generic mock table/Add-modal no matter what the panel
  // itself did. Routing through MasterScreen (which reads the real uiKind
  // from the backend schema) is the actual fix.
  if (pathStr.endsWith("activities/activity/master-screen-creation")) {
    return <MasterScreen masterKey="activityMasterScreenCreation" />;
  }

  if (pathStr.endsWith("activities/activity/status")) {
    return <MasterScreen masterKey="activityStatus" />;
  }

  if (pathStr.endsWith("manager-missed-call/setup")) {
    return <GenericMasterTable masterKey="managerMissedCallSetup" />;
  }

  if (pathStr.endsWith("manager-missed-call/view")) {
    return <MasterScreen masterKey="managerMissedCallView" />;
  }

  if (pathStr.endsWith("division-options/dashboard")) {
    return <MasterScreen masterKey="optionsDashboardWidget" />;
  }

  if (pathStr.endsWith("division-options/change-password")) {
    return <MasterScreen masterKey="optionsChangePassword" />;
  }

  if (pathStr.endsWith("vacant-mr-login/access")) {
    return <MasterScreen masterKey="vacantMrLoginAccess" />;
  }

  if (pathStr.endsWith("vacant-mr-login/permission-for-managers")) {
    return <MasterScreen masterKey="vacantMrLoginPermission" />;
  }

  if (pathStr.endsWith("division-options/doctor-campaign-map")) {
    return <MasterScreen masterKey="doctorCampaignMap" />;
  }

  if (pathStr.endsWith("update-delete/tp-delete")) {
    return <MasterScreen masterKey="tpDeleteSetup" />;
  }

  if (pathStr.endsWith("update-delete/dcr-edit")) {
    return <MasterScreen masterKey="dcrEditSetup" />;
  }

  if (pathStr.endsWith("update-delete/msis-edit")) {
    return <MasterScreen masterKey="msisEditApproval" />;
  }

  if (pathStr.endsWith("update-delete/mail-delete")) {
    return <MasterScreen masterKey="mailDeleteLog" />;
  }

  if (pathStr.endsWith("update-delete/leave-cancellation")) {
    return <MasterScreen masterKey="leaveCancellation" />;
  }

  if (pathStr.endsWith("update-delete/mob-app-device-id-deletion")) {
    return <MasterScreen masterKey="deviceIdDeletion" />;
  }

  if (pathStr.endsWith("update-delete/tp-deviation-release")) {
    return <MasterScreen masterKey="tpDeviationRelease" />;
  }

  if (pathStr.endsWith("update-delete/drs-uni-no-generation")) {
    return <MasterScreen masterKey="drUniqueNoGeneration" />;
  }

  if (pathStr.endsWith("update-delete/chemist-business-release")) {
    return <MasterScreen masterKey="chemistReleaseLock" />;
  }

  if (pathStr.endsWith("update-delete/chem-bus-month-release")) {
    return <MasterScreen masterKey="chemistReleaseLockMonthwise" />;
  }

  if (pathStr.endsWith("update-delete/auto-mail-reports")) {
    return <MasterScreen masterKey="autoMailSetup" />;
  }

  if (pathStr.endsWith("basic-setup/screen-access-rights")) {
    return <MasterScreen masterKey="screenAccessSetup" />;
  }

  if (pathStr.endsWith("basic-setup/base-level")) {
    return <MasterScreen masterKey="baseLevelSetup" />;
  }

  if (pathStr.endsWith("basic-setup/managers")) {
    return <MasterScreen masterKey="managerSetup" />;
  }

  if (pathStr.endsWith("basic-setup/approval-mandatory")) {
    return <MasterScreen masterKey="approvalMandatorySetup" />;
  }

  if (pathStr.endsWith("basic-setup/managerwise-core-doctor-map")) {
    return <MasterScreen masterKey="managerwiseCoreDoctorMap" />;
  }

  if (pathStr.endsWith("basic-setup/screenwise-access")) {
    return <MasterScreen masterKey="screenwiseLock" />;
  }

  if (pathStr.endsWith("basic-setup/mail-folder-creation")) {
    return <MasterScreen masterKey="mailFolderCreation" />;
  }

  if (pathStr.endsWith("basic-setup/other-setup")) {
    return <MasterScreen masterKey="otherSetup" />;
  }

  if (pathStr.endsWith("basic-setup/homepage-dashboard-display")) {
    return <MasterScreen masterKey="homepageDashboardDisplay" />;
  }

  if (pathStr.endsWith("basic-setup/leave-setup")) {
    return <MasterScreen masterKey="leaveTypeSetup" />;
  }

  if (pathStr.endsWith("basic-setup/leave-policy-setup")) {
    return <MasterScreen masterKey="leavePolicySetup" />;
  }

  if (pathStr.endsWith("basic-setup/device-lock")) {
    return <MasterScreen masterKey="deviceLock" />;
  }

  if (pathStr.endsWith("basic-setup/order-booking-setup")) {
    return <OrderBookingSetupPanel masterKey="orderBookingSetup" />;
  }

  if (pathStr.endsWith("app-setup/call-feedback")) {
    return <CallFeedbackCreationPanel masterKey="callFeedbackCreation" />;
  }

  if (pathStr.endsWith("app-setup/call-remarks-templates")) {
    return <CallRemarksTemplatesPanel masterKey="callRemarksTemplates" />;
  }

  if (pathStr.endsWith("app-setup/notification-message")) {
    return <MasterScreen masterKey="notificationMessage" />;
  }

  if (pathStr.endsWith("app-setup/gps-geofence-tagg-deletion")) {
    return <GpsGeoFencePanel initialMode="allocation" />;
  }

  if (pathStr.endsWith("app-setup/dynamic-app-link")) {
    return <DynamicAppLinkPanel masterKey="appSetupDynamicAppLink" />;
  }

  if (pathStr.endsWith("division-options/mail-box")) {
    return <MasterScreen masterKey="mailBoxLog" />;
  }

  if (pathStr.endsWith("customer-upload/listed-doctor")) {
    return <ListedDoctorUploadPanel masterKey="listedDoctorUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/chemist")) {
    return <ChemistUploadPanel masterKey="chemistUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/sample")) {
    return <SampleDespatchUploadPanel masterKey="sampleDespatchUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/input")) {
    return <InputDespatchUploadPanel masterKey="inputDespatchUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/target")) {
    return <TargetUploadPanel masterKey="targetUploadLog" />;
  }

  if (pathStr.endsWith("information-upload/flash-news")) {
    return <FlashNewsPanel />;
  }

  if (pathStr.endsWith("information-upload/notice-board")) {
    return <NoticeBoardPanel />;
  }

  if (pathStr.endsWith("information-upload/quote-for-the-week")) {
    return <QuoteOfTheWeekPanel />;
  }

  if (pathStr.endsWith("information-upload/talk-to-us")) {
    return <TalkToUsPanel />;
  }

  if (pathStr.endsWith("information-upload/file-circular-desig-wise")) {
    return <FileUploadDesignationwisePanel masterKey="fileUploadDesignationwise" />;
  }

  if (pathStr.endsWith("information-upload/user-manual-upload")) {
    return <UserManualUploadPanel masterKey="userManualUpload" />;
  }

  if (pathStr.endsWith("division-options/upload/field-force")) {
    return <SalesforceUploadPanel masterKey="salesforceUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/stockist")) {
    return <StockistUploadPanel masterKey="stockistUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/product")) {
    return <ProductUploadPanel masterKey="productUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/product-rate")) {
    return <ProductRateUploadPanel masterKey="productRateUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/slides-upload")) {
    return <SlideUploadEDetailingPanel />;
  }

  if (pathStr.endsWith("division-options/upload/holiday-fixation")) {
    return <HolidayFixationUploadPanel masterKey="holidayFixationUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/leave-bulk-upload")) {
    return <LeaveUploadPanel masterKey="leaveBulkUploadLog" />;
  }

  if (pathStr.endsWith("division-options/transaction-upload")) {
    return <MasterScreen masterKey="transactionUpload" />;
  }

  if (pathStr.endsWith("image-upload/home-page-common-for-all")) {
    return <HomepageImageUploadPanel />;
  }

  if (pathStr.endsWith("image-upload/home-page-fieldforcewise")) {
    return <HomepageFieldForcewisePanel />;
  }

  if (pathStr.endsWith("division-options/leave-status")) {
    return <LeaveStatusPanel />;
  }

  if (pathStr.endsWith("transfers/transfer-master-details")) {
    return <TransferMasterDetailsPanel />;
  }

  if (pathStr.endsWith("transfers/convert-unlisted-drs-listed-drs")) {
    return <UnlistedToListedConversionPanel />;
  }

  if (pathStr.endsWith("division-options/release-missing-dates-delay")) {
    return <DelayedReleasePanel />;
  }

  if (pathStr.endsWith("division-options/quiz")) {
    return <MasterScreen masterKey="quizList" />;
  }

  if (pathStr.endsWith("division-options/quiz-category")) {
    return <GenericMasterTable masterKey="quizCategoryList" />;
  }

  // Coordinator round (Activity Reports visual rebuild) -- these were
  // previously rendered inline by a standalone component with its own
  // pill-tab navigation; that page now just shows an AdminTabGrid tile
  // grid (like MIS Reports / Update-Delete) and drilldown into these exact
  // same real panels/screens happens here, through the same
  // /admin/workspace/[...path] architecture every other tile-grid screen
  // in this app already uses.
  // Coordinator round -- Activity Reports > Survey, real question
  // bank + survey builder matching the legacy sanpharma.info Survey module.
  // All 3 of this round's tile-grid Survey leaves mount the same
  // SurveyWorkspace component with a different initial screen; its own
  // in-component cross-nav bar (matching the legacy app's 4-button bar on
  // every Survey screen) handles moving between all 4 real screens from
  // there, including "Create - Survey" which has no tile of its own.
  if (pathStr.endsWith("activity-reports/survey/question-creation")) {
    return <SurveyWorkspace initialScreen="question-creation" />;
  }
  if (pathStr.endsWith("activity-reports/survey/updation")) {
    return <SurveyWorkspace initialScreen="update-survey" />;
  }
  if (pathStr.endsWith("activity-reports/survey/view")) {
    return <SurveyWorkspace initialScreen="view" />;
  }

  if (pathStr.endsWith("activity-reports/territory/view")) {
    return <TerritoryViewReport />;
  }
  if (pathStr.endsWith("activity-reports/territory/status")) {
    return <TerritoryStatusReport />;
  }
  if (pathStr.endsWith("activity-reports/tp/consolidated-view")) {
    return <TpConsolidatedViewReport />;
  }
  if (pathStr.endsWith("activity-reports/tp/view")) {
    return <TpViewReport />;
  }
  if (pathStr.endsWith("activity-reports/tp/status")) {
    return <TpStatusReport />;
  }
  if (pathStr.endsWith("activity-reports/tp/datewise")) {
    return <TpDatewiseReport />;
  }
  // Round 34 -- replaced the simple read-only AdminDcrView mount with the
  // real multi-mode DCR > View workspace (9 legacy modes, see
  // dcr-report-panels.tsx). AdminDcrView itself (Admin Review / DCR
  // approval queue) stays in use elsewhere via its own real import.
  if (pathStr.endsWith("activity-reports/dcr/view")) {
    return <DcrViewWorkspace />;
  }
  if (pathStr.endsWith("activity-reports/dcr/status")) {
    return <DcrStatusReport />;
  }
  if (pathStr.endsWith("activity-reports/dcr/not-approved")) {
    return <DcrNotApprovedReport />;
  }
  if (pathStr.endsWith("activity-reports/dcr/not-submitted")) {
    return <DcrNotSubmittedReport />;
  }
  if (pathStr.endsWith("activity-reports/dcr/count-modewise")) {
    return <DcrCountModewiseReport />;
  }
  if (pathStr.endsWith("activity-reports/dcr/approve-reject")) {
    return <DcrRejectApproveReport />;
  }
  if (pathStr.endsWith("activity-reports/dcr/time-status")) {
    return <DcrTimeStatusReport />;
  }
  if (pathStr.endsWith("activity-reports/dcr/checkin-checkout")) {
    return <DcrCheckinCheckoutReport />;
  }

  // Round 37 Items 3/4/5 -- Manager Analysis (nested under MIS Reports,
  // the Zivira tree already had these 3 leaf slugs defined, unwired).
  // Round 39 item 2 -- the whole Customized Report module (Name Creation,
  // saved-reports list, parameter generation, output) now lives at its
  // legacy home: Activity Reports > Customized Report. The standalone
  // /admin/custom-reports page and its sidebar entry are gone.
  if (pathStr.endsWith("activity-reports/customized-report")) {
    return <CustomReportWorkspace />;
  }
  // Round 39 items 3-7 -- MIS Reports > Analysis screens.
  if (pathStr.endsWith("mis-reports/analysis/dcr")) {
    return <Suspense fallback={<p className="text-text-muted text-sm">Loading...</p>}><DcrAnalysisReport /></Suspense>;
  }
  // Round 40 -- legacy-parity MIS screens.
  if (pathStr.endsWith("mis-reports/analysis/work-hygiene-report")) {
    return <WorkHygieneReport />;
  }
  if (pathStr.endsWith("mis-reports/analysis/class-wise-view")) {
    return <ClassWiseViewReport />;
  }
  if (pathStr.endsWith("mis-reports/analysis/dcr-analysis-dump")) {
    return <DcrAnalysisDumpReport />;
  }
  if (pathStr.endsWith("mis-reports/missed-call-report")) {
    return <MissedCallReport />;
  }
  if (pathStr.endsWith("mis-reports/single-analysis/doctor-analysis")) {
    return <SingleDoctorReport />;
  }
  if (pathStr.endsWith("mis-reports/single-analysis/rep-vs-manager")) {
    return <RepVsManagerReport />;
  }
  if (pathStr.endsWith("mis-reports/single-analysis/review-report")) {
    return <ReviewReport />;
  }
  if (pathStr.endsWith("mis-reports/single-analysis/assessment-report")) {
    return <AssessmentReport />;
  }
  if (pathStr.endsWith("mis-reports/analysis/visit-analysis")) {
    return <VisitAnalysisReport />;
  }
  if (pathStr.endsWith("mis-reports/analysis/sales-details")) {
    return <SalesDetailsReport />;
  }
  if (pathStr.endsWith("mis-reports/quiz-test-result")) return <QuizTestResultReport />;
  if (pathStr.endsWith("mis-reports/summary/day-wise-reports")) return <DayWiseDumpReport />;
  if (pathStr.endsWith("mis-reports/summary/call-report-dump")) return <CallReportDumpReport />;
  if (pathStr.endsWith("mis-reports/digital-detailing/visit-wise")) return <DetailingVisitWiseReport />;
  if (pathStr.endsWith("mis-reports/digital-detailing/brand-wise-star-rating")) return <BrandStarRatingReport />;
  if (pathStr.endsWith("mis-reports/digital-detailing/product-slide-analysis")) return <SlideAnalysisReport />;
  if (pathStr.endsWith("mis-reports/digital-detailing/drs-analysis")) return <DrsAnalysisReport />;
  if (pathStr.endsWith("mis-reports/visit-details/cat-cls-splty-lstdr-wise")) return <CatClsVisitDetailsReport />;
  if (pathStr.endsWith("mis-reports/visit-details/datewise")) return <VisitDetailDateWiseReport />;
  if (pathStr.endsWith("mis-reports/pob-rx/listed-dr-chemist-product-wise")) {
    return <PobRxProductWiseReport />;
  }
  if (pathStr.endsWith("mis-reports/pob-rx/listed-dr-chemist-fieldforce-wise")) {
    return <PobRxFieldforceWiseReport />;
  }
  if (pathStr.endsWith("mis-reports/pob-rx/listed-dr-chemist-day-wise")) {
    return <PobRxDayWiseReport />;
  }
  if (pathStr.endsWith("mis-reports/pob-rx/listed-dr-chemist-dump")) {
    return <PobRxDumpReport />;
  }
  if (pathStr.endsWith("mis-reports/heat-analysis/not-at-all-visited-drs")) {
    return <NotAtAllVisitDrsReport />;
  }
  if (pathStr.endsWith("mis-reports/heat-analysis/not-at-all-promoted-products")) {
    return <NotAtAllPromotedProductsReport />;
  }
  if (pathStr.endsWith("mis-reports/heat-analysis/not-at-all-visited-hqs")) {
    return <NotAtAllVisitHqsReport />;
  }
  if (pathStr.endsWith("mis-reports/analysis/pob-wise")) {
    return <PobWiseReport />;
  }
  if (pathStr.endsWith("mis-reports/analysis/pob-wise-periodically")) {
    return <PobPeriodicReport />;
  }
  if (pathStr.endsWith("mis-reports/manager-analysis/hq-coveragewise")) {
    return <HqCoveragewiseReport />;
  }
  if (pathStr.endsWith("mis-reports/manager-analysis/coverage-analysis-1")) {
    // useSearchParams() (for the Item 3 drill-down link) needs a Suspense
    // boundary in the App Router.
    return <Suspense fallback={<p className="text-text-muted text-sm">Loading...</p>}><CoverageAnalysis1Report /></Suspense>;
  }
  if (pathStr.endsWith("mis-reports/manager-analysis/joint-workwise")) {
    return <JointWorkwiseReport />;
  }
  if (pathStr.endsWith("mis-reports/manager-analysis/fieldwork-manager-analysis")) {
    return <FieldworkManagerAnalysisReport />;
  }
  if (pathStr.endsWith("mis-reports/manager-analysis/coverage-analysis-mgr")) {
    return <ManagerWiseCoverageReport />;
  }
  if (pathStr.endsWith("mis-reports/manager-analysis/speciality-category-visit-wise")) {
    return <SpecialityCategoryVisitReport />;
  }

  if (pathStr.includes("activity/dcr") || pathStr.includes("activities/dcr")) {
    return <AdminDcrView />;
  }

  const isMisDcr = pathStr === "division-dashboard/division-navigation-tabs/mis-reports/mis-dcr";

  if (!node.children?.length && !isMisDcr) {
    return (
      <article className="bg-surface-card rounded-xl p-card-padding-standard border border-border-subtle flex flex-col justify-center items-center py-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-text-muted text-[24px]">construction</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-text-primary mb-2">{node.title}</h3>
        <p className="font-body-sm text-body-sm text-text-muted max-w-sm">This tab is ready for its form, table, report, or approval workflow.</p>
      </article>
    );
  }

  return (
    <>
      {node.children && node.children.length > 0 && (
        <div className="mt-4">
          <AdminTabGrid node={node} path={path} />
        </div>
      )}

      {isMisDcr && (
        <div className="mt-8">
          <h2 className="font-headline-sm text-text-primary mb-4 pb-2 border-b border-border-subtle">
            Activities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link className="bg-surface-card hover:shadow-md transition-shadow rounded-xl p-4 border border-border-subtle border-l-4 border-l-primary flex flex-col space-y-3 relative overflow-hidden group" href="/admin/workspace/division-dashboard/division-navigation-tabs/mis-reports/mis-dcr/daily-mr-work">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">Daily MR Work</h3>
                <p className="font-body-sm text-body-sm text-text-muted mt-1">Track Attendance, Daily Call Reports (DCR), Tour Plans, Expenses, Leaves, Camps, and Market Surveys</p>
              </div>
            </Link>
            <Link className="bg-surface-card hover:shadow-md transition-shadow rounded-xl p-4 border border-border-subtle border-l-4 border-l-status-success flex flex-col space-y-3 relative overflow-hidden group" href="/admin/workspace/division-dashboard/division-navigation-tabs/mis-reports/mis-dcr/manager-activity-report">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">Manager Activity Report</h3>
                <p className="font-body-sm text-body-sm text-text-muted mt-1">View Attendance, DCR Summary, Tour Plans, Expenses, Leaves, Camps, Surveys, Coverages, and Dashboards</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
