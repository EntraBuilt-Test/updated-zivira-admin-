"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { GenericMasterTable } from "@/components/generic-master-table";
import { ApprovalQueueTable } from "@/components/approval-queue-table";
import { ReportFilterView } from "@/components/report-filter-view";
import { ChangePasswordPanel } from "@/components/change-password-panel";
import { VacantMrLoginPanel } from "@/components/vacant-mr-login-panel";
import { LoginAsEmployeePanel } from "@/components/login-as-employee-panel";
import { NotificationSendPanel } from "@/components/notification-send-panel";
import { UploadPanel } from "@/components/upload-panel";
import { MailBoxPanel } from "@/components/mail-box-panel";
import { QuizAuthoringPanel } from "@/components/quiz-authoring-panel";

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
    "table" | "approvalQueue" | "reportFilter" | "changePassword" | "vacantMrLogin" | "loginAsEmployee" | "notificationSend" | "upload" | "mailBox" | "quizAuthoring" | null
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
  if (uiKind === "loginAsEmployee") return <LoginAsEmployeePanel masterKey={masterKey} />;
  if (uiKind === "notificationSend") return <NotificationSendPanel masterKey={masterKey} />;
  if (uiKind === "upload") return <UploadPanel masterKey={masterKey} />;
  if (uiKind === "mailBox") return <MailBoxPanel masterKey={masterKey} />;
  if (uiKind === "quizAuthoring") return <QuizAuthoringPanel masterKey={masterKey} />;
  // Default ("table" or still loading) — the existing generic console, so
  // there's no flash of an empty state while the schema request is in flight.
  return <GenericMasterTable masterKey={masterKey} />;
}
