"use client";

import { apiClient } from "@/lib/api-client";
import { DispatchViewPanel } from "@/components/dispatch-view-panel";

export function InputDispatchViewPanel({ masterKey: _masterKey }: { masterKey: string }) {
  return <DispatchViewPanel title="Input Dispatch - View" fetchFn={apiClient.inputDispatchView} showState />;
}
