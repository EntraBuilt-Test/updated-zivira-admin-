"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { GenericMasterTable } from "@/components/generic-master-table";
import { ApprovalQueueTable } from "@/components/approval-queue-table";
import { ReportFilterView } from "@/components/report-filter-view";
import { ChangePasswordPanel } from "@/components/change-password-panel";
import { VacantMrLoginPanel } from "@/components/vacant-mr-login-panel";
import { VacantMrPermissionPanel } from "@/components/vacant-mr-permission-panel";
import { LoginAsEmployeePanel } from "@/components/login-as-employee-panel";
import { NotificationSendPanel } from "@/components/notification-send-panel";
import { UploadPanel } from "@/components/upload-panel";
import { MailBoxPanel } from "@/components/mail-box-panel";
import { QuizAuthoringPanel } from "@/components/quiz-authoring-panel";
import { OptionsDashboardPanel } from "@/components/options-dashboard-panel";
import { DoctorCampaignMapPanel } from "@/components/doctor-campaign-map-panel";
import { TpDeletePanel } from "@/components/tp-delete-panel";
import { DcrEditPanel } from "@/components/dcr-edit-panel";
import { MailDeletePanel } from "@/components/mail-delete-panel";
import { LeaveCancellationPanel } from "@/components/leave-cancellation-panel";
import { DeviceIdDeletionPanel } from "@/components/device-id-deletion-panel";
import { DrUniqueNoGenerationPanel } from "@/components/dr-unique-no-generation-panel";
import { ChemistReleaseLockMonthwisePanel } from "@/components/chemist-release-lock-monthwise-panel";
import { AutoMailSetupPanel } from "@/components/auto-mail-setup-panel";
import { ScreenAccessSetupPanel } from "@/components/screen-access-setup-panel";
import { BaseLevelSetupPanel } from "@/components/base-level-setup-panel";
import { ManagerSetupPanel } from "@/components/manager-setup-panel";
import { ApprovalMandatorySetupPanel } from "@/components/approval-mandatory-setup-panel";

/**
 * Looks up a master's uiKind before rendering, so each Activities/Options
 * screen gets the shape that actually matches its real behavior: a pending
 * approval queue, a Field Force Name/Month/Year filtered report, a real
 * Change Password / Vacant MR Login / Notification Message action screen,
 * a file-upload screen, or (the default) the generic Add/Edit/Deactivate
 * master console every other screen already uses.
 */
export function MasterScreen({ masterKey }: { masterKey: string }) {
  const [uiKind, setUiKind] = useState<
    "table" | "approvalQueue" | "reportFilter" | "changePassword" | "vacantMrLogin" | "vacantMrPermission" | "loginAsEmployee" | "notificationSend" | "upload" | "mailBox" | "quizAuthoring" | "dashboardBuilder" | "doctorCampaignFilter" | "tpDelete" | "dcrEdit" | "mailDelete" | "leaveCancellation" | "deviceIdDeletion" | "drUniqueNoGeneration" | "chemistReleaseLockMonthwise" | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .masterSchema(masterKey)
      .then((res) => {
        if (!cancelled) setUiKind(res.data.uiKind ?? "table");
      })
      .catch(() => {
        if (!cancelled) setUiKind("table");
      });
    return () => {
      cancelled = true;
    };
  }, [masterKey]);

  if (uiKind === "approvalQueue") return <ApprovalQueueTable masterKey={masterKey} />;
  if (uiKind === "reportFilter") return <ReportFilterView masterKey={masterKey} />;
  if (uiKind === "changePassword") return <ChangePasswordPanel masterKey={masterKey} />;
  if (uiKind === "vacantMrLogin") return <VacantMrLoginPanel masterKey={masterKey} />;
  if (uiKind === "vacantMrPermission") return <VacantMrPermissionPanel masterKey={masterKey} />;
  if (uiKind === "loginAsEmployee") return <LoginAsEmployeePanel masterKey={masterKey} />;
  if (uiKind === "notificationSend") return <NotificationSendPanel masterKey={masterKey} />;
  if (uiKind === "upload") return <UploadPanel masterKey={masterKey} />;
  if (uiKind === "mailBox") return <MailBoxPanel masterKey={masterKey} />;
  if (uiKind === "quizAuthoring") return <QuizAuthoringPanel masterKey={masterKey} />;
  if (uiKind === "dashboardBuilder") return <OptionsDashboardPanel masterKey={masterKey} />;
  if (uiKind === "doctorCampaignFilter") return <DoctorCampaignMapPanel masterKey={masterKey} />;
  if (uiKind === "tpDelete") return <TpDeletePanel masterKey={masterKey} />;
  if (uiKind === "dcrEdit") return <DcrEditPanel masterKey={masterKey} />;
  if (uiKind === "mailDelete") return <MailDeletePanel masterKey={masterKey} />;
  if (uiKind === "leaveCancellation") return <LeaveCancellationPanel masterKey={masterKey} />;
  if (uiKind === "deviceIdDeletion") return <DeviceIdDeletionPanel masterKey={masterKey} />;
  if (uiKind === "drUniqueNoGeneration") return <DrUniqueNoGenerationPanel masterKey={masterKey} />;
  if (uiKind === "chemistReleaseLockMonthwise") return <ChemistReleaseLockMonthwisePanel masterKey={masterKey} />;
  if (uiKind === "autoMailSetup") return <AutoMailSetupPanel masterKey={masterKey} />;
  if (uiKind === "screenAccessSetup") return <ScreenAccessSetupPanel masterKey={masterKey} />;
  if (uiKind === "baseLevelSetup") return <BaseLevelSetupPanel masterKey={masterKey} />;
  if (uiKind === "managerSetup") return <ManagerSetupPanel masterKey={masterKey} />;
  if (uiKind === "approvalMandatorySetup") return <ApprovalMandatorySetupPanel masterKey={masterKey} />;
  // Default ("table" or still loading) — the existing generic console, so
  // there's no flash of an empty state while the schema request is in flight.
  return <GenericMasterTable masterKey={masterKey} />;
}
