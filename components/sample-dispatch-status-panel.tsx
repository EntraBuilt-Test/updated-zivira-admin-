"use client";

import { apiClient } from "@/lib/api-client";
import { DispatchStatusPanel } from "@/components/dispatch-status-panel";

export function SampleDispatchStatusPanel({ masterKey: _masterKey }: { masterKey: string }) {
  return <DispatchStatusPanel title="Sample Dispatch - Status" fetchFn={apiClient.sampleDispatchStatus} />;
}
