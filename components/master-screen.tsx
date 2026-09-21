"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { GenericMasterTable } from "@/components/generic-master-table";
import { ApprovalQueueTable } from "@/components/approval-queue-table";
import { ReportFilterView } from "@/components/report-filter-view";

/**
 * Looks up a master's uiKind before rendering, so each Activities/Options
 * screen gets the shape that actually matches sanpharma.info: a pending
 * approval queue with a "Click Here to Approve" action, a Field Force
 * Name/Month/Year filtered report, or (the default) the generic
 * Add/Edit/Deactivate master console every other screen already uses.
 */
export function MasterScreen({ masterKey }: { masterKey: string }) {
  const [uiKind, setUiKind] = useState<"table" | "approvalQueue" | "reportFilter" | null>(null);

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
  // Default ("table" or still loading) — the existing generic console, so
  // there's no flash of an empty state while the schema request is in flight.
  return <GenericMasterTable masterKey={masterKey} />;
}
