"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api-client";

const MASTER_KEY = "holidayFixationUploadLog";

// Matches sanpharma.info's Options >> Upload >> Holiday Fixation Bulk
// Upload (Holiday_Upload.aspx) exactly: the note block first, then Choose
// File + a "Process" button (not "Upload") -- wired to the real
// POST /masters/holidayFixationUploadLog/action/upload endpoint, which
// creates real Holiday Master rows.
export function HolidayFixationUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([["State Name", "Weekend Holiday", "Other Holiday Date", "Other Holiday Description"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UPL_Holiday_Fixation");
    XLSX.writeFile(wb, "Holiday_Fixation_Template.xlsx");
  }

  async function process() {
    if (!file) {
      setError("Choose an Excel file first");
      return;
    }
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file);
      setResult(`Processed ${res.data.recordsProcessed} record(s), ${res.data.recordsFailed} failed.`);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="card" style={{ maxWidth: 720, width: "100%", border: "1px solid #94a3b8", padding: 24 }}>
        <h2 className="text-lg font-semibold mb-4 text-center">Holiday Fixation Bulk Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3 text-center">{result}</div>}

        <div className="mb-4">
          <p className="text-sm font-medium">Note:</p>
          <p className="text-sm">1) Sheet Name Must be &apos;UPL_Holiday_Fixation&apos;</p>
          <p className="text-sm">2) Date Format Must be in &apos;YYYY-MM-DD&apos; Format</p>
          <p className="text-sm">3) Don&apos;t Do Any Special Formats in the Excel File</p>
          <button onClick={downloadTemplate} className="text-sm text-blue-700 underline">
            Excel Format File Download Here
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
          <button
            onClick={process}
            disabled={processing}
            style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
          >
            {processing ? "Processing..." : "Process"}
          </button>
        </div>
      </div>
    </div>
  );
}
