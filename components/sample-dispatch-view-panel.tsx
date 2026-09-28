"use client";

import { apiClient } from "@/lib/api-client";
import { DispatchViewPanel } from "@/components/dispatch-view-panel";

export function SampleDispatchViewPanel({ masterKey: _masterKey }: { masterKey: string }) {
  return <DispatchViewPanel title="Sample Dispatch - View" fetchFn={apiClient.sampleDispatchView} />;
}
