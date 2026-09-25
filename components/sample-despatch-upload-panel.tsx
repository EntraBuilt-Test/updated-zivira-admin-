"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "sampleDespatchUploadLog";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function currentMonthYear() {
  const d = new Date();
  return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
}

// Matches sanpharma.info's Options >> MR >> Sample Despatch Upload
// (Sample_Despatch_Upload_Acknowledge.aspx) exactly: a single centered,
// bordered box holding Month/Year, Excel file, an OverWrite-with-
// Existing-Records / Only-Insert radio, Upload, and the Sheet-name note +
// template link -- no results table, matching the reference screen.
export function SampleDespatchUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const initial = currentMonthYear();
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [file, setFile] = useState<File | null>(null);
  const [overwriteMode, setOverwriteMode] = useState<"OverWrite with Existing Records" | "Only Insert">("Only Insert");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i));

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([["Employee ID", "Sample ERP Code", "Despatch Qty"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Upl_Despatch_Master");
    XLSX.writeFile(wb, "Sample_Despatch_Upload_Template.xlsx");
  }

  async function doUpload() {
    if (!file) {
      setError("Choose an Excel file first");
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file, { month, year, overwriteMode });
      setResult(`Processed ${res.data.recordsProcessed} record(s), ${res.data.recordsFailed} failed.`);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="card" style={{ maxWidth: 640, width: "100%", border: "1px solid #94a3b8", padding: 24 }}>
        <h2 className="text-lg font-semibold mb-4 text-center">Sample Despatch Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3 text-center">{result}</div>}

        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Month<span className="text-red-600">*</span>
            </label>
            <CustomSelect value={month} options={MONTHS} onChange={setMonth} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Year<span className="text-red-600">*</span>
            </label>
            <CustomSelect value={year} options={yearOptions} onChange={setYear} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Excel file<span className="text-red-600">*</span>
            </label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-4">
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" checked={overwriteMode === "OverWrite with Existing Records"} onChange={() => setOverwriteMode("OverWrite with Existing Records")} />
            OverWite with Existing Records
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" checked={overwriteMode === "Only Insert"} onChange={() => setOverwriteMode("Only Insert")} />
            Only Insert
          </label>
        </div>

        <div className="flex justify-center">
          <button
            onClick={doUpload}
            disabled={uploading}
            style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <p className="text-sm text-red-600 mt-4 text-center">Note: 1) Sheet Name Must be &apos;Upl_Despatch_Master&apos;</p>
        <div className="text-center">
          <button onClick={downloadTemplate} className="text-sm text-blue-700 underline">
            Excel Format File Download Here
          </button>
        </div>
      </div>
    </div>
  );
}
