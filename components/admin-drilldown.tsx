"use client";

import type { ZiviraTreeNode } from "@zivira/types";
import Link from "next/link";
import { GenericMasterTable } from "@/components/generic-master-table";
import { MasterScreen } from "@/components/master-screen";
import { AdminTabGrid } from "@/components/admin-tab-grid";
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
import { DcrBulkApproval } from "@/components/dcr-bulk-approval";

export function AdminDrilldown({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  const pathStr = path.join("/");
  console.log("DEBUG drilldown pathStr:", pathStr);

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/territory") {
    return <GenericMasterTable masterKey="patchNameMaster" />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/territory-listed-doctor") {
    return <TerritoryListedDoctor />;
  }

  if (pathStr === "division-dashboard/division-navigation-tabs/division-master/field-force-entries/territory-bulk-deactivation") {
    return <TerritoryBulkDeactivation />;
  }

  if (pathStr.endsWith("listed-doctor")) {
    return <ListedDoctorMaster />;
  }

  if (pathStr.endsWith("unlisted-doctor")) {
    return <UnlistedDoctorMaster />;
  }

  if (pathStr.endsWith("chemist")) {
    return <ChemistMaster />;
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

  if (pathStr.endsWith("expense-approval")) {
    return <GenericMasterTable masterKey="expenseApproval" />;
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

  // Additional multi-date bulk-approval grid alongside the single-row
  // "DCR" approval tab above — does not replace it.
  if (pathStr.endsWith("approvals/dcr-bulk-approval")) {
    return <DcrBulkApproval />;
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

  if (pathStr.endsWith("login-details/manager")) {
    return <MasterScreen masterKey="loginDetailsManager" />;
  }

  if (pathStr.endsWith("login-details/fieldrepo")) {
    return <MasterScreen masterKey="loginDetailsFieldrepo" />;
  }

  if (pathStr.endsWith("activities/login-into-fieldforce")) {
    return <GenericMasterTable masterKey="loginIntoFieldforce" />;
  }

  if (pathStr.endsWith("task-management/mode-creation")) {
    return <GenericMasterTable masterKey="taskModeCreation" />;
  }

  if (pathStr.endsWith("task-management/task-assign")) {
    return <GenericMasterTable masterKey="taskAssign" />;
  }

  if (pathStr.endsWith("activities/order-booking-view")) {
    return <MasterScreen masterKey="orderBookingView" />;
  }

  if (pathStr.endsWith("activities/activity/master-screen-creation")) {
    return <GenericMasterTable masterKey="activityMasterScreenCreation" />;
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
    return <GenericMasterTable masterKey="approvalMandatorySetup" />;
  }

  if (pathStr.endsWith("basic-setup/managerwise-core-doctor-map")) {
    return <GenericMasterTable masterKey="managerwiseCoreDoctorMap" />;
  }

  if (pathStr.endsWith("basic-setup/screenwise-access")) {
    return <GenericMasterTable masterKey="screenwiseLock" />;
  }

  if (pathStr.endsWith("basic-setup/mail-folder-creation")) {
    return <GenericMasterTable masterKey="mailFolderCreation" />;
  }

  if (pathStr.endsWith("basic-setup/other-setup")) {
    return <GenericMasterTable masterKey="otherSetup" />;
  }

  if (pathStr.endsWith("basic-setup/homepage-dashboard-display")) {
    return <GenericMasterTable masterKey="homepageDashboardDisplay" />;
  }

  if (pathStr.endsWith("basic-setup/leave-setup")) {
    return <GenericMasterTable masterKey="leaveTypeSetup" />;
  }

  if (pathStr.endsWith("basic-setup/leave-policy-setup")) {
    return <GenericMasterTable masterKey="leavePolicySetup" />;
  }

  if (pathStr.endsWith("basic-setup/device-lock")) {
    return <GenericMasterTable masterKey="deviceLock" />;
  }

  if (pathStr.endsWith("basic-setup/order-booking-setup")) {
    return <GenericMasterTable masterKey="orderBookingSetup" />;
  }

  if (pathStr.endsWith("app-setup/call-feedback")) {
    return <GenericMasterTable masterKey="callFeedbackCreation" />;
  }

  if (pathStr.endsWith("app-setup/call-remarks-templates")) {
    return <GenericMasterTable masterKey="callRemarksTemplates" />;
  }

  if (pathStr.endsWith("app-setup/notification-message")) {
    return <MasterScreen masterKey="notificationMessage" />;
  }

  if (pathStr.endsWith("app-setup/gps-geofence-tagg-deletion")) {
    return <GenericMasterTable masterKey="gpsGeoFenceAllocation" />;
  }

  if (pathStr.endsWith("app-setup/geo-tag-deletion")) {
    return <GenericMasterTable masterKey="geoTagDeletion" />;
  }

  if (pathStr.endsWith("app-setup/menu-creation")) {
    return <GenericMasterTable masterKey="menuCreation" />;
  }

  if (pathStr.endsWith("app-setup/dynamic-app-link")) {
    return <GenericMasterTable masterKey="appSetupDynamicAppLink" />;
  }

  if (pathStr.endsWith("division-options/mail-box")) {
    return <MasterScreen masterKey="mailBoxLog" />;
  }

  if (pathStr.endsWith("customer-upload/listed-doctor")) {
    return <MasterScreen masterKey="listedDoctorUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/chemist")) {
    return <MasterScreen masterKey="chemistUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/sample")) {
    return <MasterScreen masterKey="sampleDespatchUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/input")) {
    return <MasterScreen masterKey="inputDespatchUploadLog" />;
  }

  if (pathStr.endsWith("customer-upload/target")) {
    return <MasterScreen masterKey="targetUploadLog" />;
  }

  if (pathStr.endsWith("information-upload/flash-news")) {
    return <GenericMasterTable masterKey="flashNewsSetup" />;
  }

  if (pathStr.endsWith("information-upload/notice-board")) {
    return <GenericMasterTable masterKey="noticeBoardSetup" />;
  }

  if (pathStr.endsWith("information-upload/quote-for-the-week")) {
    return <GenericMasterTable masterKey="quoteOfTheWeek" />;
  }

  if (pathStr.endsWith("information-upload/talk-to-us")) {
    return <GenericMasterTable masterKey="talkToUsSetup" />;
  }

  if (pathStr.endsWith("information-upload/file-circular-desig-wise")) {
    return <MasterScreen masterKey="fileUploadDesignationwise" />;
  }

  if (pathStr.endsWith("information-upload/user-manual-upload")) {
    return <MasterScreen masterKey="userManualUpload" />;
  }

  if (pathStr.endsWith("division-options/upload/field-force")) {
    return <MasterScreen masterKey="salesforceUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/stockist")) {
    return <MasterScreen masterKey="stockistUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/product")) {
    return <MasterScreen masterKey="productUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/product-rate")) {
    return <MasterScreen masterKey="productRateUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/slides-upload")) {
    return <MasterScreen masterKey="slideUploadEDetailing" />;
  }

  if (pathStr.endsWith("division-options/upload/holiday-fixation")) {
    return <MasterScreen masterKey="holidayFixationUploadLog" />;
  }

  if (pathStr.endsWith("division-options/upload/leave-bulk-upload")) {
    return <MasterScreen masterKey="leaveBulkUploadLog" />;
  }

  if (pathStr.endsWith("division-options/transaction-upload")) {
    return <MasterScreen masterKey="transactionUpload" />;
  }

  if (pathStr.endsWith("image-upload/home-page-common-for-all")) {
    return <MasterScreen masterKey="homepageImageUpload" />;
  }

  if (pathStr.endsWith("image-upload/home-page-fieldforcewise")) {
    return <MasterScreen masterKey="homepageImageFieldForcewise" />;
  }

  if (pathStr.endsWith("division-options/leave-status")) {
    return <MasterScreen masterKey="leaveStatusReport" />;
  }

  if (pathStr.endsWith("transfers/transfer-master-details")) {
    return <GenericMasterTable masterKey="transferMasterDetails" />;
  }

  if (pathStr.endsWith("transfers/convert-unlisted-drs-listed-drs")) {
    return <GenericMasterTable masterKey="unlistedToListedDrConversion" />;
  }

  if (pathStr.endsWith("division-options/release-missing-dates-delay")) {
    return <GenericMasterTable masterKey="delayedRelease" />;
  }

  if (pathStr.endsWith("division-options/quiz")) {
    return <MasterScreen masterKey="quizList" />;
  }

  if (pathStr.endsWith("division-options/quiz-category")) {
    return <GenericMasterTable masterKey="quizCategoryList" />;
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
