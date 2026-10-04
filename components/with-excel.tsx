"use client";

import { useRef, useState, type ComponentType } from "react";
import { FileSpreadsheet } from "lucide-react";
import { exportElementToXlsx } from "@/lib/xlsx-export";

// Round 41 Gap D -- wraps a report screen with a real-.xlsx "Excel" button.
// Every <table> currently rendered inside the screen is exported (headers with
// merged group cells, colour fills, numbers as numbers).
export function ExcelBar({ targetRef, fileName }: { targetRef: React.RefObject<HTMLElement | null>; fileName: string }) {
  const [busy, setBusy] = useState(false);
  async function run() {
    if (!targetRef.current) return;
    setBusy(true);
    try {
      const ok = await exportElementToXlsx(targetRef.current, fileName);
      if (!ok) window.alert("Run the report first - there is no table to export yet.");
    } catch (err) {
      window.alert(`Excel export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex justify-end">
      <button type="button" title="Download as .xlsx" disabled={busy} onClick={() => void run()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary text-sm disabled:opacity-50">
        <FileSpreadsheet size={16} /> {busy ? "Preparing..." : "Excel"}
      </button>
    </div>
  );
}

export function withExcel<P extends object>(Inner: ComponentType<P>, fileName: string): ComponentType<P> {
  function Wrapped(props: P) {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div className="space-y-2">
        <ExcelBar targetRef={ref} fileName={fileName} />
        <div ref={ref}>
          <Inner {...props} />
        </div>
      </div>
    );
  }
  Wrapped.displayName = `WithExcel(${Inner.displayName || Inner.name || "Report"})`;
  return Wrapped;
}
